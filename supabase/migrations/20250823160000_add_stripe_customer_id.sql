-- Agregar columna stripe_customer_id a tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Índice para búsquedas por customer ID
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
ON public.profiles(stripe_customer_id);

-- Comentario
COMMENT ON COLUMN public.profiles.stripe_customer_id 
IS 'ID del cliente en Stripe para vincular suscripciones y pagos';