-- Script para ejecutar manualmente en Supabase SQL Editor
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- 1. Añadir columnas para tokens de Google
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_access_token TEXT,
ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;

-- 2. Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_users_google_tokens ON users(id) WHERE google_access_token IS NOT NULL;

-- 3. Comentarios para documentación
COMMENT ON COLUMN users.google_access_token IS 'Google OAuth access token para acceso a Google Drive API';
COMMENT ON COLUMN users.google_refresh_token IS 'Google OAuth refresh token para renovar el access token';

-- 4. Verificar que las columnas se crearon
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('google_access_token', 'google_refresh_token');
