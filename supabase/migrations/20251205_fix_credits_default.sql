ALTER TABLE public.profiles
ALTER COLUMN credits_limit SET DEFAULT 0;

-- Optional: Update existing users with default 100 to 0 if they haven't paid? 
-- For now, we only ensure NEW users get 0.
