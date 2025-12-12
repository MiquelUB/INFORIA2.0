import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2022-11-15",
  httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

// Inicializar Supabase con permisos de ADMIN (Service Role)
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req: Request) => {
  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET")!,
      undefined,
      cryptoProvider
    );
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed.`, err.message);
    return new Response(err.message, { status: 400 });
  }

  console.log(`🔔 Evento recibido: ${event.type}`);

  try {
    switch (event.type) {
      // ----------------------------------------------------------------------
      // A. SINCRONIZACIÓN DE INFRAESTRUCTURA (Productos, Precios, Cupones)
      // ----------------------------------------------------------------------
      case 'product.created':
      case 'product.updated':
        await upsertProduct(event.data.object);
        break;

      case 'price.created':
      case 'price.updated':
        await upsertPrice(event.data.object);
        break;

      case 'coupon.created':
      case 'coupon.updated':
        await upsertCoupon(event.data.object);
        break;

      case 'coupon.deleted':
        await deleteCoupon(event.data.object);
        break;

      // ----------------------------------------------------------------------
      // B. GESTIÓN DE CLIENTES Y SUSCRIPCIONES
      // ----------------------------------------------------------------------
      case 'checkout.session.completed':
        const session = event.data.object;
        // Solo nos interesa si está vinculado a un usuario (client_reference_id enviado desde el front)
        if (session.client_reference_id) {
          await linkCustomerToUser(session.customer as string, session.client_reference_id);

          // Lógica LEAD MAGNET: Si usó un cupón, verificar si regala créditos
          if (session.total_details?.breakdown?.discounts?.length > 0) {
            await handleCouponRedemption(session);
          }
        }
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        await manageSubscriptionStatusChange(
          subscription.id,
          subscription.customer as string,
          event.type === 'customer.subscription.created'
        );
        break;

      // ----------------------------------------------------------------------
      // C. RENOVACIÓN DE CRÉDITOS (Pago de Factura Exitoso)
      // ----------------------------------------------------------------------
      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        // Si es una suscripción (billing_reason: subscription_create o subscription_cycle)
        if (invoice.subscription && invoice.billing_reason?.startsWith('subscription')) {
          await handleInvoicePaid(invoice);
        }
        break;

      default:
        console.log(`🤷 Evento no manejado: ${event.type}`);
    }
  } catch (error: any) {
    console.error(`❌ Error procesando webhook: ${error.message}`);
    return new Response('Webhook handler failed', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});

// ============================================================================
// FUNCIONES AUXILIARES (LÓGICA DE NEGOCIO)
// ============================================================================

// 1. Copiar Productos
async function upsertProduct(product: Stripe.Product) {
  const { error } = await supabase.from('products').upsert({
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description,
    image: product.images?.[0] ?? null,
    metadata: product.metadata,
  });
  if (error) throw error;
  console.log(`✅ Producto sincronizado: ${product.name}`);
}

// 2. Copiar Precios
async function upsertPrice(price: Stripe.Price) {
  const { error } = await supabase.from('prices').upsert({
    id: price.id,
    product_id: typeof price.product === 'string' ? price.product : '',
    active: price.active,
    currency: price.currency,
    description: price.nickname,
    type: price.type,
    unit_amount: price.unit_amount,
    interval: price.recurring?.interval,
    interval_count: price.recurring?.interval_count,
    trial_period_days: price.recurring?.trial_period_days,
    metadata: price.metadata,
  });
  if (error) throw error;
  console.log(`✅ Precio sincronizado: ${price.id}`);
}

// 3. Copiar Cupones (Lead Magnet)
async function upsertCoupon(coupon: Stripe.Coupon) {
  const { error } = await supabase.from('coupons').upsert({
    id: coupon.id, // El código (ej: REGALO5)
    name: coupon.name,
    amount_off: coupon.amount_off,
    percent_off: coupon.percent_off,
    duration: coupon.duration,
    duration_in_months: coupon.duration_in_months,
    valid: coupon.valid,
    metadata: coupon.metadata, // Aquí vendrá { "credits_gift": "5" }
  });
  if (error) throw error;
  console.log(`✅ Cupón sincronizado: ${coupon.id}`);
}

async function deleteCoupon(coupon: Stripe.Coupon) {
  await supabase.from('coupons').delete().eq('id', coupon.id);
}

// 4. Vincular Stripe Customer ID <-> Supabase User ID
async function linkCustomerToUser(stripeCustomerId: string, userId: string) {
  const { error } = await supabase.from('customers').upsert({
    id: userId,
    stripe_customer_id: stripeCustomerId,
  });
  if (error) {
    console.error("Error linking customer:", error);
    // No lanzamos error para no romper el flujo, pero lo logueamos
  } else {
    console.log(`✅ Cliente vinculado: ${userId} <-> ${stripeCustomerId}`);
  }
}

// 5. Gestión de Suscripción (La fuente de la verdad)
async function manageSubscriptionStatusChange(
  subscriptionId: string,
  customerId: string,
  _createAction = false
) {
  // Obtener datos frescos de Stripe para asegurar consistencia
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method'],
  });

  // Buscar el UUID del usuario dueño de este Customer ID
  const { data: customerData } = await supabase
    .from('customers')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!customerData) throw new Error(`Usuario no encontrado para Customer ID: ${customerId}`);
  const userId = customerData.id;

  // 5.1 Actualizar tabla SUBSCRIPTIONS
  const subscriptionData = {
    id: subscription.id,
    user_id: userId,
    metadata: subscription.metadata,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    quantity: subscription.items.data[0].quantity ?? 1, // EL DATO CLAVE DEL MULTIPUESTO
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    created: new Date(subscription.created * 1000).toISOString(),
    ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
    trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    coupon_id: subscription.discount?.coupon?.id ?? null,
  };

  const { error: upsertError } = await supabase
    .from('subscriptions')
    .upsert(subscriptionData);

  if (upsertError) throw upsertError;

  // 5.2 Actualizar tabla PROFILES (Para acceso rápido en frontend)
  // Aquí actualizamos los ASIENTOS PERMITIDOS
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      subscription_status: subscription.status,
      seats_allowed: subscription.items.data[0].quantity ?? 1, // Sincronizar capacidad de equipo
      billing_owner_id: null, // Asegurar que es null porque ES el dueño (si es que antes era hijo)
    })
    .eq('id', userId);

  if (profileError) throw profileError;

  console.log(`✅ Suscripción procesada para usuario ${userId}. Status: ${subscription.status}, Asientos: ${subscriptionData.quantity}`);
}

// 6. Manejar Pago de Factura (Renovación de Créditos)
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
  if (!subscriptionId) return;

  // Buscar el usuario
  const { data: subData } = await supabase
    .from('subscriptions')
    .select('user_id, price_id')
    .eq('id', subscriptionId)
    .single();

  if (!subData) return;

  // Buscar cuántos créditos da este plan (buscando en la tabla PRICES)
  const { data: priceData } = await supabase
    .from('prices')
    .select('product_id, products(metadata)')
    .eq('id', subData.price_id)
    .single();

  // @ts-ignore: Supabase join returns logic
  const creditsToGive = parseInt(priceData?.products?.metadata?.credits_limit || "0");

  if (creditsToGive > 0) {
    // Reiniciar/Añadir créditos al usuario
    // NOTA: Para modelos de suscripción, lo habitual es reiniciar el límite al máximo mensual
    await supabase
      .from('profiles')
      .update({ credits_limit: creditsToGive, credits_used: 0 })
      .eq('id', subData.user_id);

    console.log(`💰 Créditos renovados (${creditsToGive}) para usuario ${subData.user_id}`);
  }
}

// 7. Lógica especial Lead Magnet (Cupón en primera compra)
async function handleCouponRedemption(session: Stripe.Checkout.Session) {
  const couponId = session.total_details?.breakdown?.discounts?.[0]?.discount?.coupon?.id;
  if (!couponId || !session.client_reference_id) return;

  // Verificar en DB si este cupón regala créditos
  const { data: couponData } = await supabase
    .from('coupons')
    .select('metadata')
    .eq('id', couponId)
    .single();

  const creditsGift = parseInt(couponData?.metadata?.credits_gift || "0");

  if (creditsGift > 0) {
    // Otorgar créditos extra o establecer un estado especial
    // En este ejemplo, sumamos al límite actual
    // Primero obtenemos el límite actual
    const { data: profile } = await supabase.from('profiles').select('credits_limit').eq('id', session.client_reference_id).single();
    const currentLimit = profile?.credits_limit || 0;

    await supabase
      .from('profiles')
      .update({
        credits_limit: currentLimit + creditsGift,
        signup_coupon_code: couponId // Guardar para tracking
      })
      .eq('id', session.client_reference_id);

    console.log(`🎁 Lead Magnet activado: ${creditsGift} créditos extra por cupón ${couponId}`);
  }
}