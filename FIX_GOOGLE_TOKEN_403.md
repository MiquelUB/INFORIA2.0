# 🔧 Fix: Google Token 403 Error - INFORIA 2.0

**Fecha**: 2025-12-17  
**Problema**: Error 403 al intentar crear pacientes debido a que el `provider_token` no está disponible en la sesión  
**Estado**: ✅ Resuelto

---

## 🐛 Problema Original

### **Error en Consola**
```
GET https://www.inforia.cat/api/google-token 403 (Forbidden)
Error creating patient: Error: No se encontró el token de Google. Por favor, ve a 'Mi Cuenta' y verifica los permisos o reinicia sesión.
```

### **Causa Raíz**
El `provider_token` de Google OAuth no se persiste automáticamente en las cookies de sesión de Supabase SSR. Después de recargas de página, el token se pierde y la API `/api/google-token` devuelve 403.

---

## ✅ Solución Implementada

### **Enfoque**
Guardar los tokens de Google OAuth en la base de datos durante el callback de autenticación y recuperarlos desde allí en lugar de la sesión.

### **Archivos Modificados**

#### **1. `app/(app)/auth/callback/route.ts`**
**Cambio**: Guardar `provider_token` y `provider_refresh_token` en la tabla `users` después de la autenticación exitosa.

```typescript
// 2.1. GUARDAR TOKENS DE GOOGLE EN LA BASE DE DATOS
try {
  const { provider_token, provider_refresh_token } = session;
  
  if (provider_token) {
    console.log('💾 [CALLBACK] Guardando Google tokens en la base de datos...');
    
    const { error: updateError } = await supabase
      .from('users')
      .update({
        google_access_token: provider_token,
        google_refresh_token: provider_refresh_token || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ [CALLBACK] Error guardando tokens:', updateError);
    } else {
      console.log('✅ [CALLBACK] Tokens guardados exitosamente');
    }
  }
} catch (tokenError) {
  console.error('❌ [CALLBACK] Error procesando tokens:', tokenError);
  // No bloqueamos el flujo si falla el guardado de tokens
}
```

#### **2. `app/api/google-token/route.ts`**
**Cambio**: Recuperar el token desde la base de datos en lugar de la sesión.

```typescript
export async function GET() {
  try {
    const supabase = createClient();
    
    // Obtener el usuario autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ [google-token] No authenticated user:', userError);
      return NextResponse.json(
        { error: 'No authenticated session' },
        { status: 401 }
      );
    }

    // Recuperar el token de Google desde la base de datos
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('google_access_token, google_refresh_token')
      .eq('id', user.id)
      .single();

    if (dbError) {
      console.error('❌ [google-token] Error fetching user data:', dbError);
      return NextResponse.json(
        { error: 'Error fetching user data' },
        { status: 500 }
      );
    }

    if (!userData?.google_access_token) {
      console.warn('⚠️ [google-token] No Google token found for user:', user.id);
      return NextResponse.json(
        { error: 'No Google provider token available. Please re-authenticate.' },
        { status: 403 }
      );
    }

    console.log('✅ [google-token] Token retrieved successfully');
    return NextResponse.json({ 
      token: userData.google_access_token,
      refresh_token: userData.google_refresh_token
    });

  } catch (error) {
    console.error('❌ [google-token] Internal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### **3. Migración SQL**
**Archivo**: `supabase/migrations/20251217_add_google_tokens.sql`

```sql
-- Añadir columnas para tokens de Google
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_access_token TEXT,
ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_users_google_tokens ON users(id) WHERE google_access_token IS NOT NULL;

-- Comentarios para documentación
COMMENT ON COLUMN users.google_access_token IS 'Google OAuth access token para acceso a Google Drive API';
COMMENT ON COLUMN users.google_refresh_token IS 'Google OAuth refresh token para renovar el access token';
```

---

## 🔄 Flujo Actualizado

### **1. Autenticación con Google**
```
Usuario → Google OAuth → Callback → Guardar tokens en DB → Redirect
```

### **2. Creación de Paciente**
```
NewPatientClient → /api/google-token → Recuperar desde DB → createPatientAction
```

---

## 🧪 Testing

### **Pasos para Probar**
1. Cerrar sesión
2. Iniciar sesión con Google
3. Ir a "Alta de Nuevo Paciente"
4. Completar el formulario
5. Hacer clic en "Guardar y Crear 1er Informe"
6. ✅ Debería funcionar sin error 403

### **Verificación en Base de Datos**
```sql
SELECT id, email, google_access_token IS NOT NULL as has_token
FROM users
WHERE id = 'tu-user-id';
```

---

## 📝 Notas Importantes

1. **Seguridad**: Los tokens se almacenan en la base de datos, asegúrate de que la tabla `users` tenga RLS (Row Level Security) habilitado.

2. **Refresh Token**: El `google_refresh_token` también se guarda para poder renovar el `access_token` cuando expire.

3. **Migración Necesaria**: Los usuarios existentes necesitarán volver a autenticarse para que se guarden sus tokens.

4. **Logs Mejorados**: Se añadieron logs con emojis para facilitar el debugging.

---

## 🚀 Despliegue

### **Comandos**
```bash
# Aplicar migración a Supabase
npx supabase db push

# Commit de cambios
git add .
git commit -m "fix: Resolver error 403 en google-token guardando tokens en DB"

# Push a producción
git push origin main
```

---

## ✅ Resultado Esperado

- ✅ No más errores 403 en `/api/google-token`
- ✅ Creación de pacientes funcional
- ✅ Tokens persistentes entre recargas de página
- ✅ Mejor logging para debugging

---

**Fix implementado por**: Gemini AI Agent  
**Fecha**: 2025-12-17
