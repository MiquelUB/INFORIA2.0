export interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  plan: string;
  downloadUrl?: string;
}

export interface Subscription {
  id: string;
  planId: 'professional' | 'clinic';
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  currentPeriodEnd: string;
  reportsUsed: number;
  reportsLimit: number;
}

export interface EarlyRenewalResponse {
  success: boolean;
  newPeriodEnd: string;
  error?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  reports: number;
  features: string[];
  stripeProductId: string;
  stripePriceId: string;
}