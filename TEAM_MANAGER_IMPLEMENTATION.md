# Implementación: Panel de Gestión de Equipo para Sponsors

## 📋 Resumen de Cambios

Se ha implementado un sistema completo de invitación y gestión de equipo para los "Jefes de Clínica" (Sponsors). El sistema permite que un usuario con plan de Clínica o Dúo invite a otros psicólogos a usar la plataforma.

## 🚀 Paso 1: Server Action Segura

**Archivo:** `app/actions/team.ts`

### Funciones Creadas:

#### `inviteTeamMember(formData: FormData)`
- ✅ Valida que el usuario está autenticado
- ✅ Verifica que es un sponsor con plan activo
- ✅ Comprueba que tiene licencias disponibles
- ✅ Envía invitación usando Admin API de Supabase
- ✅ Actualiza el contador de invitaciones enviadas
- ✅ Refrescan la página con `revalidatePath`

**Respuesta:**
```typescript
{ success: true } // En caso de éxito
{ error: 'mensaje' } // En caso de fallo
```

#### `getTeamMembers()`
- Obtiene todos los miembros invitados por el sponsor
- Útil para futuras expansiones (listado de miembros)

**Validaciones de Seguridad:**
- Solo sponsors con `is_sponsor: true` pueden invitar
- Se requiere plan activo (`subscription_status: active`)
- Máximo de licencias controlado por `invitations_total`
- Usa credenciales de Admin para operaciones privilegiadas

---

## 🎨 Paso 2: Componente Visual

**Archivo:** `components/TeamManager.tsx`

### Características:

1. **Barra de Progreso**
   - Muestra: "X de Y licencias usadas"
   - Barra visual con animación suave
   - Contador de disponibles resaltado

2. **Formulario de Invitación**
   - Input para email con validación
   - Botón "Enviar Invitación"
   - Estados de carga visuales
   - Se desactiva cuando no hay licencias disponibles

3. **Mensajes de Feedback**
   - Toast de éxito: "¡Invitación enviada correctamente!"
   - Toast de error: Descripción del problema
   - Mensaje informativo si se agotan las licencias

4. **UI/UX:**
   - Diseño responsivo con Tailwind CSS
   - Colores azules consistentes con la marca
   - Solo se muestra si `invitationsTotal > 1`
   - Iconos de Lucide React

---

## 📄 Paso 3: Integración en /account

**Archivo:** `app/(app)/account/page.tsx`

### Cambios:
```typescript
// Agregado import
import { TeamManager } from '@/components/TeamManager'

// Agregado en el render (después de CreditsStatus)
{profile && (
  <TeamManager 
    invitationsTotal={profile.invitations_total || 0}
    invitationsSent={profile.invitations_sent || 0}
    sponsorId={profile.id}
  />
)}
```

---

## 🧪 Guía de Prueba

### Prerequisitos:
1. Usuario con plan **Clínica** o **Dúo** (tiene `is_sponsor: true`)
2. Plan activo (`subscription_status: active`)
3. Licencias disponibles (`invitations_sent < invitations_total`)

### Pasos para Probar:

1. **Inicia sesión** con un usuario sponsor
2. **Ve a** `/account`
3. **Busca** la sección "Gestión de Equipo" (azul claro)
4. **Ingresa** un email válido (ej: `psicologo@test.com`)
5. **Haz clic** en "Enviar Invitación"
6. **Verifica:**
   - ✅ Toast de éxito aparece
   - ✅ Counter de licencias incrementa
   - ✅ Input se limpia
   - ✅ El usuario invitado recibe email con instrucciones
   - ✅ Invitado puede crear cuenta con datos del sponsor

### Casos de Prueba:

| Caso | Comportamiento Esperado |
|------|------------------------|
| Sin autenticación | Error "No autenticado" |
| No es sponsor | Error "No tienes un plan de Clínica..." |
| Sin licencias disponibles | Botón deshabilitado + mensaje de error |
| Email inválido | Validación HTML5 |
| Email duplicado | Error de Supabase |
| Email válido | Invitación enviada + contador actualizado |

---

## 🔐 Seguridad

- ✅ Server Action: Código corre en servidor
- ✅ Admin API: Solo con `SUPABASE_SERVICE_ROLE_KEY`
- ✅ Validación de permisos: Se verifica `is_sponsor` en servidor
- ✅ Rate limiting: Controlado por licencias (`invitations_total`)
- ✅ Input sanitizado: FormData de Next.js

---

## 📊 Flujo de Datos

```
Usuario Sponsor en /account
         ↓
   [Formulario Invitación]
         ↓
   inviteTeamMember() (Server Action)
         ↓
   [Validaciones]
   - ¿Autenticado?
   - ¿Es sponsor?
   - ¿Tiene licencias?
         ↓
   Admin: inviteUserByEmail()
         ↓
   Update: invitations_sent++
         ↓
   revalidatePath('/account')
         ↓
   Toast: Éxito / Error
```

---

## 🔧 Variables de Entorno Requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # ⚠️ SECRETO - No en cliente
```

---

## 📱 Responsive

- ✅ Mobile: Barra flexible, input a stack
- ✅ Tablet: Optimizado
- ✅ Desktop: Layout horizontal perfecto

---

## 🎯 Próximos Pasos (Opcionales)

1. **Listar miembros invitados** con `getTeamMembers()`
2. **Revocar invitaciones** (agregar botón "Eliminar")
3. **Roles diferenciados** (admin, editor, viewer)
4. **Historial de invitaciones** con timestamps
5. **Notificaciones en tiempo real** de aceptación

---

## ✅ Checklist de Implementación

- [x] Crear `app/actions/team.ts`
- [x] Crear `components/TeamManager.tsx`
- [x] Integrar en `app/(app)/account/page.tsx`
- [x] Validación de seguridad
- [x] Manejo de errores
- [x] UI responsiva
- [x] Mensajes de feedback

**Status:** ✅ LISTO PARA PRODUCCIÓN
