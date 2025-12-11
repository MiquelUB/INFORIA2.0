export interface UserProfile {
  id: string;
  full_name: string | null;
  professional_license: string | null;
  clinic_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  plan_type: 'professional' | 'clinic' | 'demo';
  credits_limit: number;
  credits_used: number;
  subscription_status: 'active' | 'warning' | 'over_quota';
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string | null;
  
  // Billing fields
  billing_name: string | null;
  billing_email: string | null;
  billing_address: string | null;
  billing_city: string | null;
  billing_postal_code: string | null;
  billing_country: string | null;
  nif_dni: string | null;
}