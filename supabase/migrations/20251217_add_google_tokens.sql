-- Migración: Añadir columnas para almacenar tokens de Google OAuth
-- Fecha: 2025-12-17
-- Descripción: Añade google_access_token y google_refresh_token a la tabla profiles

-- Añadir columnas para tokens de Google
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS google_access_token TEXT,
ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;

-- Crear índice para búsquedas rápidas por user_id
CREATE INDEX IF NOT EXISTS idx_profiles_google_tokens ON profiles(id) WHERE google_access_token IS NOT NULL;

-- Comentarios para documentación
COMMENT ON COLUMN profiles.google_access_token IS 'Google OAuth access token para acceso a Google Drive API';
COMMENT ON COLUMN profiles.google_refresh_token IS 'Google OAuth refresh token para renovar el access token';
