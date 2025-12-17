-- Migración: Añadir columnas para almacenar tokens de Google OAuth
-- Fecha: 2025-12-17
-- Descripción: Añade google_access_token y google_refresh_token a la tabla users

-- Añadir columnas para tokens de Google
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_access_token TEXT,
ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;

-- Crear índice para búsquedas rápidas por user_id
CREATE INDEX IF NOT EXISTS idx_users_google_tokens ON users(id) WHERE google_access_token IS NOT NULL;

-- Comentarios para documentación
COMMENT ON COLUMN users.google_access_token IS 'Google OAuth access token para acceso a Google Drive API';
COMMENT ON COLUMN users.google_refresh_token IS 'Google OAuth refresh token para renovar el access token';
