import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// 1. Configuración de Clientes
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
  typescript: true,
});

// Cliente Supabase con Service Role para escribir en access_invitations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

const resend = new Resend(process.env.RESEND_API_KEY || 're_build_placeholder');
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const signature = headerList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature found' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`❌ Error Webhook Signature: ${err.message}`);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  // 3. Procesar Evento: Pago Completado
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const emailPago = session.customer_details?.email;
    
    // Recuperar Price ID (Prioridad: Metadata > Line Items)
    let priceId = session.metadata?.priceId;
    let quantity = parseInt(session.metadata?.seats || '1');

    if (!priceId) {
       // Fallback: Recuperar de la sesión expandida
       try {
         const expanded = await stripe.checkout.sessions.retrieve(session.id, { expand: ['line_items'] });
         const lineItem = expanded.line_items?.data[0];
         priceId = lineItem?.price?.id;
         quantity = lineItem?.quantity || 1;
       } catch (e) {
         console.warn('Error expandiendo sesión Stripe', e);
       }
    }

    if (!emailPago || !priceId) {
      console.error('❌ Datos faltantes:', { emailPago, priceId });
      return NextResponse.json({ error: 'Missing data' }, { status: 200 }); 
    }

    // --- 📊 MAPEO DE PLANES (Usando tus variables existentes) ---
    let credits = 0;
    let planType = 'free';
    let planDisplayName = 'Plan';

    // 1. FLASH (5 créditos)
    if (matchPrice(priceId, 'FLASH')) {
      credits = 5;
      planType = 'flash';
      planDisplayName = 'Plan Flash';
    } 
    // 2. PRO (100 créditos)
    else if (matchPrice(priceId, 'PRO')) {
      credits = 100;
      planType = 'pro';
      planDisplayName = 'Plan PRO';
    } 
    // 3. PRO+ (200 créditos)
    else if (matchPrice(priceId, 'PRO_PLUS')) {
      credits = 200;
      planType = 'pro_plus';
      planDisplayName = 'Plan PRO+';
    } 
    // 4. CENTRO PEQUEÑO / EQUIPO (300 créditos)
    else if (matchPrice(priceId, 'EQUIPO')) {
      credits = 300;
      planType = 'small_center';
      planDisplayName = 'Centro Pequeño (3 usuarios)';
    } 
    // 5. CLÍNICA (400 créditos)
    else if (matchPrice(priceId, 'CLINICA')) {
      credits = 400;
      planType = 'clinic';
      planDisplayName = 'Plan Clínica (4 usuarios)';
    } 
    // 6. CENTRO (500 créditos)
    else if (matchPrice(priceId, 'CENTRO')) {
      credits = 500;
      planType = 'center';
      planDisplayName = 'Plan Centro (5 usuarios)';
    } 
    // 7. CENTRO PLUS / ESCALADO (Dinámico: seats * 100)
    else if (matchPrice(priceId, 'CENTRO_PLUS')) {
      const seats = quantity >= 6 ? quantity : 6; // Mínimo 6
      credits = seats * 100;
      planType = 'scaled_team';
      planDisplayName = `Equipo Escalado (${seats} usuarios)`;
    } 
    else {
        // Fallback para pruebas
        credits = 5;
        planType = 'flash'; 
        planDisplayName = 'Plan Básico (Fallback)';
    }

    // Sanitizar log
    const maskedEmail = emailPago ? emailPago.replace(/(^.{2}).*(@.*)/, '$1***$2') : 'unknown';
    console.log(`📦 PLAN: ${planDisplayName} (${credits} créditos). User: ${maskedEmail}`);

    try {
      // 4. Generar Invitación (Claim Token)
      const token = crypto.randomUUID();

      const { error: dbError } = await supabaseAdmin
        .from('access_invitations')
        .insert({
          token: token,
          payment_email: emailPago,
          stripe_customer_id: session.customer as string,
          plan_type: planType,
          credits_limit: credits,
          status: 'pending'
        });

      if (dbError) throw dbError;

      // 5. Enviar Email con Enlace Mágico
      const saasUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const activationLink = `${saasUrl}/login?token=${token}`;

      await resend.emails.send({
        from: process.env.SENDER_EMAIL || 'Inforia <onboarding@mail.inforia.pro>',
        to: emailPago,
        subject: '🚀 Activa tu cuenta de Inforia',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h1 style="color: #2E403B;">¡Gracias por tu compra!</h1>
            <p>Tu <strong>${planDisplayName}</strong> (${credits} créditos) está listo.</p>
            <p>Haz clic abajo para activar tu cuenta y vincularla a tu usuario de Google:</p>
            <a href="${activationLink}" style="display: inline-block; background-color: #2E403B; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold;">
              Activar mi Cuenta
            </a>
            <p style="font-size: 12px; color: #888;">Si no funciona, copia: ${activationLink}</p>
          </div>
        `
      });

      console.log(`✅ Invitación enviada exitosamente.`);

    } catch (error) {
      console.error('❌ Error procesando invitación:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

// Helper para comprobar IDs de precios contra variables de entorno (soporta nombres con y sin _ID)
function matchPrice(priceId: string, key: string) {
  const envKey = `NEXT_PUBLIC_STRIPE_PRICE_${key}`;
  const envKeyAlt = `NEXT_PUBLIC_STRIPE_${key}_PRICE_ID`;
  // Busca en process.env dinámicamente
  return priceId === process.env[envKey] || priceId === process.env[envKeyAlt];
}
