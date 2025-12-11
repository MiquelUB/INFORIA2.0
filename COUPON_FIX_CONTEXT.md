# Contexto para Solución de Abuso de Cupones (Landing Repo)

## 🚨 El Problema

Actualmente, los usuarios pueden usar un cupón de "un solo uso" (ej: `REGALO5` o
`FLASH5`) múltiples veces simplemente volviendo a comprar. Esto ocurre porque el
sistema de Checkout **crea un nuevo `Customer` en Stripe para cada
transacción**, en lugar de reconocer que ese email ya es un cliente existente.

Stripe solo puede prohibir "1 uso por cliente" si detecta que es el **mismo**
`customer_id`. Si creas un cliente nuevo, para Stripe es una persona diferente y
le permite usar el cupón de nuevo.

## 🛠️ La Solución Técnica

Debemos modificar el endpoint `/api/stripe/create-checkout` (o donde se genere
la sesión) en el repositorio del Landing Page para **reutilizar el Customer
ID**.

### Lógica a Implementar

1. Recibir el `email` del usuario en el endpoint.
2. **Buscar en Stripe** si ya existe un cliente con ese email.
3. **Si existe (`existingCustomer`):**
   - Pasar `customer: existingCustomer.id` al crear la sesión.
   - **NO** pasar `customer_email` (da error si pasas ambos).
4. **Si NO existe:**
   - Pasar `customer_email: email` (Stripe creará el cliente automáticamente).
   - Opcional: `customer_creation: 'always'` (por defecto en modo pago).

### Ejemplo de Código (Next.js API Route)

```typescript
import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2023-10-16", // Usa tu versión
});

export async function POST(req: Request) {
    try {
        const { email, priceId } = await req.json();

        // 1. BUSCAR CLIENTE EXISTENTE
        const customers = await stripe.customers.list({
            email: email,
            limit: 1,
        });

        let customerId = undefined;
        if (customers.data.length > 0) {
            customerId = customers.data[0].id;
            console.log(`✅ Cliente existente encontrado: ${customerId}`);
        }

        // 2. CONFIGURAR PARÁMETROS DE SESIÓN
        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            mode: "subscription", // o 'payment'
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            allow_promotion_codes: true, // Permitir cupones
            success_url:
                `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
        };

        // 3. ASIGNAR CLIENTE O EMAIL
        if (customerId) {
            sessionParams.customer = customerId;
            // IMPORTANTE: Si pasas 'customer', NO puedes pasar 'customer_email'
        } else {
            sessionParams.customer_email = email;
            sessionParams.customer_creation = "always";
        }

        // 4. CREAR SESIÓN
        const session = await stripe.checkout.sessions.create(sessionParams);

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        return NextResponse.json({ error: "Internal Server Error" }, {
            status: 500,
        });
    }
}
```

## ✅ Configuración en Stripe Dashboard

Asegúrate de que el cupón esté configurado correctamente:

1. Ir a **Productos > Cupones**.
2. Seleccionar el cupón (ej: `FLASH5`).
3. En "Límites", marcar: **"Limitar a 1 uso por cliente"**.

Con el cambio de código arriba, Stripe reconocerá al cliente y bloqueará el
segundo intento.
