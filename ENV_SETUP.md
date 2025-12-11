# 🔑 Guía de Configuración de Variables de Entorno

Este archivo documenta todas las variables de entorno necesarias para que INFORIA funcione correctamente.

## 📋 Variables Requeridas

### 1. Supabase (Base de Datos) ✅ CONFIGURADO
```
NEXT_PUBLIC_SUPABASE_URL=https://dufziwaiyhozchsvuftl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```
**Estado**: ✅ Ya configurado
**Dónde**: https://app.supabase.com/project/dufziwaiyhozchsvuftl/settings/api

---

### 2. OpenRouter API (Generación de Informes con IA) ⚠️ NECESARIO
```
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key_here
```

**Pasos para configurar**:
1. Ve a https://openrouter.ai/
2. Crea una cuenta o inicia sesión
3. Ve a https://openrouter.ai/keys
4. Crea una nueva clave API
5. Copia y pega en `.env.local`

**Modelos disponibles**:
- `deepseek/deepseek-r1` (Recomendado - mejor relación costo/calidad)
- `openai/gpt-4`
- `anthropic/claude-3`

**Uso en INFORIA**:
- Generación de informes clínicos
- Análisis de notas de sesión
- Síntesis de información del paciente

---

### 3. Google OAuth (Google Drive + Sheets) ⚠️ NECESARIO
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

**Pasos para configurar**:
1. Ve a https://console.cloud.google.com
2. Crea un nuevo proyecto (ej: "INFORIA")
3. Habilita estas APIs:
   - Google Drive API
   - Google Sheets API
   - Google Docs API
4. Ve a "Credenciales" → "Crear credenciales" → "ID de cliente OAuth"
5. Selecciona "Aplicación web"
6. URIs autorizados:
   - `http://localhost:3000`
   - `http://localhost:3000/auth/callback/google`
   - `https://yourdomain.com` (producción)
7. Copia el Client ID y pega en `.env.local`

**Uso en INFORIA**:
- Creación automática de carpetas de pacientes en Drive
- Generación de CRM en Google Sheets
- Almacenamiento de informes en Google Docs
- Integración con Zero Knowledge (datos no sensibles almacenados)

---

### 4. OpenAI API (Deno Edge Functions) ⚠️ NECESARIO
```
OPENAI_API_KEY=your_openai_api_key_here
```

**Pasos para configurar**:
1. Ve a https://platform.openai.com/api-keys
2. Crea una nueva Secret Key
3. Copia y pega en `.env.local`

**Uso en INFORIA**:
- Transcripción de audio (Whisper API)
- Generación de reportes (GPT-4)
- Procesamiento de lenguaje natural

---

### 5. Stripe (Pagos y Suscripciones) ⚠️ OPCIONAL (Para producción)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
```

**Pasos para configurar**:
1. Ve a https://dashboard.stripe.com/apikeys
2. Copia "Publishable key" → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Copia "Secret key" → `STRIPE_SECRET_KEY`
4. Pega ambas en `.env.local`

**Uso en INFORIA**:
- Procesamiento de pagos
- Gestión de suscripciones
- Webhooks para confirmación de pagos

---

## 📊 Resumen de Configuración

| Variable | Requerida | Estado | Prioridad |
|----------|-----------|--------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | ✅ | CRÍTICA |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí | ✅ | CRÍTICA |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | ⚠️ | ALTA |
| `NEXT_PUBLIC_OPENROUTER_API_KEY` | Sí | ⚠️ | ALTA |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Sí | ⚠️ | ALTA |
| `OPENAI_API_KEY` | Sí | ⚠️ | ALTA |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | ⚠️ | MEDIA |
| `STRIPE_SECRET_KEY` | No | ⚠️ | MEDIA |

---

## 🚀 Próximos Pasos

1. **Completar configuración de APIs**:
   - [ ] OpenRouter API Key
   - [ ] Google OAuth Client ID
   - [ ] OpenAI API Key
   - [ ] Supabase Service Role Key

2. **Probar conexiones**:
   ```bash
   npm run dev
   # Verificar que no hay errores de API
   ```

3. **Implementar funcionalidades**:
   - [ ] Generación de informes
   - [ ] Integración con Google Drive
   - [ ] Carga de documentos
   - [ ] Procesamiento de audio

---

## 🔒 Seguridad

⚠️ **IMPORTANTE**:
- Nunca commits `.env.local` a Git
- Nunca compartas tus API keys públicamente
- Usa variables de entorno diferentes para desarrollo/producción
- Rota las claves regularmente
- Habilita autenticación 2FA en todas las plataformas

---

## 📞 Soporte

Si tienes problemas con las configuraciones:
1. Verifica que hayas copiado la clave completa
2. Asegúrate de haber habilitado las APIs necesarias
3. Comprueba que los dominios autorizados son correctos
4. Reinicia el servidor después de cambiar `.env.local`

