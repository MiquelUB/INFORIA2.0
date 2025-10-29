-- Mejoras a la tabla profiles existente para autenticación completa
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS professional_license TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS clinic_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'warning', 'over_quota', 'suspended'));

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles(plan_type, subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON public.profiles(onboarding_completed);

-- Función mejorada para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    avatar_url,
    plan_type,
    credits_limit,
    subscription_status,
    onboarding_completed
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    'professional',
    100,
    'active',
    FALSE
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();
  
  RETURN NEW;
END;
$function$;

-- Asegurar que el trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para validar el completado del onboarding
CREATE OR REPLACE FUNCTION public.check_onboarding_required()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Marcar onboarding como completo si tiene los campos mínimos
  IF NEW.full_name IS NOT NULL AND NEW.professional_license IS NOT NULL THEN
    NEW.onboarding_completed = TRUE;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Trigger para verificar onboarding automáticamente
CREATE TRIGGER trigger_check_onboarding
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_onboarding_required();;
