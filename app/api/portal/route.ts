import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function POST() {
  try {
    const supabase = createClient();
    
    if (!stripe) {
      console.error('Stripe is not initialized. Check STRIPE_SECRET_KEY.');
      return NextResponse.json({ error: 'Stripe configuration error' }, { status: 500 });
    }
    
    // 1. Autenticar usuario
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Obtener Customer ID de la base de datos
    // Nota: Asumimos que el customer_id se guarda en la tabla profiles o similar.
    // Si no está en profiles, necesitamos saber dónde está.
    // Revisando types/billing.ts y lib/types.ts, no vi explícitamente stripe_customer_id en Profile.
    // Pero en una implementación típica SaaS, debería estar ahí.
    // Voy a consultar profiles para ver si existe el campo, o si se usa el email.
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id') // Intentamos seleccionar este campo
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.stripe_customer_id) {
       // Fallback: Buscar customer en Stripe por email
       const customers = await stripe.customers.list({ email: user.email });
       let customerId;

       if (customers.data.length > 0) {
         customerId = customers.data[0].id;
       } else {
         // Si no existe en Stripe, lo creamos ahora mismo
         console.log('Creating new Stripe customer for user:', user.email);
         const newCustomer = await stripe.customers.create({
           email: user.email,
           metadata: {
             supabaseUUID: user.id,
           },
         });
         customerId = newCustomer.id;
       }

       // Guardar el customer_id en el perfil para el futuro (si es posible)
       if (customerId) {
          await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
       }
         
       // 3. Crear sesión del portal
       const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
       console.log('🔗 Creating Portal Session for:', customerId, 'Return URL:', `${baseUrl}/account`);
       
       const session = await stripe.billingPortal.sessions.create({
         customer: customerId,
         return_url: `${baseUrl}/account`,
       });
       
       return NextResponse.json({ url: session.url });
    }

    // 3. Crear sesión del portal con el ID de la DB
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    console.log('🔗 Creating Portal Session (DB) for:', profile.stripe_customer_id, 'Return URL:', `${baseUrl}/account`);

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${baseUrl}/account`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error: unknown) {
    console.error('Error creating portal session:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
