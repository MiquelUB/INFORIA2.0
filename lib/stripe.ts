import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;

if (!key) {
  console.warn('STRIPE_SECRET_KEY is missing. Stripe features will not work.');
}

export const stripe = key ? new Stripe(key, {
  apiVersion: '2024-11-20.acacia' as any,
  typescript: true,
}) : null;
