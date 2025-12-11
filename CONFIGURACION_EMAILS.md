# 📧 Configuración del Sistema de Emails - iNFORiA

## 🎯 Recomendación: Usa tu Dominio Personalizado

Para enviar emails desde tu dominio personalizado (ej: noreply@tudominio.com), tienes estas opciones:

---

## ✅ Opción 1: SendGrid (RECOMENDADO)

### Ventajas:
- ✅ Envía desde tu dominio personalizado
- ✅ Verificación simple de dominio
- ✅ API REST fácil de usar
- ✅ Buena tasa de entrega
- ✅ Iniciativa gratuita con 100 emails/día

### Paso 1: Crear Cuenta en SendGrid

1. Ve a [https://sendgrid.com](https://sendgrid.com)
2. Regístrate con tu email
3. Ve a **Settings** → **API Keys**
4. Crea una nueva API Key (Full Access)
5. Copia la clave

### Paso 2: Configurar tu Dominio en SendGrid

1. Ve a **Settings** → **Sender Authentication**
2. Haz clic en **Authenticate Your Domain**
3. Añade tu dominio (ej: tudominio.com)
4. SendGrid te dará registros DNS para añadir:
   - CNAME record para validar el dominio
5. Añade los registros en tu proveedor de DNS
6. Valida el dominio en SendGrid

### Paso 3: Agregar a Supabase

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. **Settings** → **Edge Functions**
3. Agrega estas variables de entorno:
   ```
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   EMAIL_FROM_ADDRESS=noreply@tudominio.com
   ```

### Paso 4: Desplegar la Función

```bash
supabase functions deploy send-email
```

---

## Opción 2: Tu Servidor SMTP Personalizado

Si tienes un servidor de correo propio (cPanel, Plesk, etc.):

### Configurar Variables de Entorno en Supabase:

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=mail.tudominio.com
SMTP_PORT=587
SMTP_USER=tu_usuario@tudominio.com
SMTP_PASSWORD=tu_contraseña
EMAIL_FROM_ADDRESS=noreply@tudominio.com
```

---

## ⚠️ Opción 3: Resend (Fallback)

Si no puedes usar SendGrid, Resend es una alternativa:

1. Ve a [https://resend.com](https://resend.com)
2. Crea una cuenta
3. Obtén tu API Key
4. Agrega en Supabase:
   ```
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   EMAIL_FROM_ADDRESS=noreply@inforia.app
   ```

**Limitación**: Solo puedes enviar desde dominios pre-registrados en Resend.

---

## 🚀 Desplegar la Función

```bash
# Con Supabase CLI
supabase functions deploy send-email

# O si usas npm
npx supabase functions deploy send-email
```

---

## ✅ Verificar que Funciona

1. Genera un informe en la aplicación
2. Cuando le queden 10 créditos o menos, se enviará un email automáticamente
3. El email debe llegar desde: `noreply@tudominio.com`

---

## 📋 Estructura del Email

El email enviado incluye:

```
⚠️ Alerta: Créditos Bajos

✅ Saludo personalizado
✅ Felicitación por productividad  
✅ Cantidad de créditos restantes (destacado)
✅ Instrucciones para renovar plan
✅ Botón CTA directo a "Mi Cuenta" → "Suscripción"
✅ Branding profesional de iNFORiA
```

---

## 🔧 Variables de Entorno Requeridas

### Para SendGrid:
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
EMAIL_FROM_ADDRESS=noreply@tudominio.com
```

### Para SMTP Personalizado:
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=mail.tudominio.com
SMTP_PORT=587
SMTP_USER=usuario@tudominio.com
SMTP_PASSWORD=contraseña
EMAIL_FROM_ADDRESS=noreply@tudominio.com
```

### Para Resend (fallback):
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM_ADDRESS=noreply@tudominio.com
```

---

## 📊 Cuándo se Envían Emails

El sistema envía un email automáticamente cuando:

1. ✅ El usuario genera un nuevo informe
2. ✅ El descuento de crédito se procesa exitosamente
3. ✅ **Los créditos restantes son ≤ 10**

**Frecuencia**: Máximo 1 email por descuento que cruza el umbral de 10 créditos

---

## 🐛 Solución de Problemas

### Error: "EMAIL_FROM_ADDRESS no está configurada"
- Verifica que agregaste la variable en Supabase Settings
- Redeploy la función después de agregar la variable

### Los emails no llegan
- ✅ Verifica que la función está desplegada: `supabase functions list`
- ✅ Revisa los logs: `supabase functions logs send-email`
- ✅ Confirma que el dominio está verificado en SendGrid

### Los emails van a spam
- ✅ En SendGrid, configura SPF, DKIM y DMARC
- ✅ Verifica que el dominio está autenticado
- ✅ Usa un dominio de empresa en lugar de uno gratuito

---

## 📈 Monitoreo

Para ver los logs de la función:

```bash
supabase functions logs send-email
```

Esto mostrará:
- Emails enviados exitosamente ✅
- Errores de envío ❌
- Información de depuración

---

## ✨ Mejoras Futuras

- [ ] Permitir customización de plantillas de email
- [ ] Agregar historial de emails enviados
- [ ] Opción para darse de baja de notificaciones
- [ ] Integrar confirmación de compra vía Stripe
- [ ] Email de bienvenida cuando se crea cuenta nueva



