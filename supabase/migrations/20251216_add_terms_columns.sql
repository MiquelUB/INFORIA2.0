-- Add terms acceptance tracking columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS terms_version text,
ADD COLUMN IF NOT EXISTS terms_accepted_at text;

-- Add comment
COMMENT ON COLUMN public.profiles.terms_version IS 'Version of terms accepted by the user';
COMMENT ON COLUMN public.profiles.terms_accepted_at IS 'ISO timestamp when terms were accepted';
