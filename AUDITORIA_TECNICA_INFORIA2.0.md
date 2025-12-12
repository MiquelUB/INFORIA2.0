# AUDITORÍA TÉCNICA - INFORIA2.0

## 1. RESUMEN EJECUTIVO

- **Estado general del proyecto:** ⚠️ **Advertencia** (Funcional pero con problemas que pueden impedir compilación en producción)
- **Número total de problemas encontrados:**
  - **Críticos:** 4
  - **Altos:** 6
  - **Medios:** 8
  - **Bajos:** 5
- **Tiempo estimado de corrección:** 8-12 horas

### Resumen por Categoría
- ✅ **Arquitectura y Estructura:** Mayormente correcta, algunos ajustes necesarios
- ⚠️ **TypeScript y Tipado:** Algunos problemas de tipado y uso de `any`
- ⚠️ **Rutas y Navegación:** URL de callback incorrecta, rutas bien estructuradas
- ⚠️ **Integración Supabase:** Configuración correcta, pero dependencia obsoleta
- ❌ **Configuración Vercel:** Falta configuración explícita
- ⚠️ **Dependencias:** Una dependencia obsoleta, archivos Deno innecesarios
- ⚠️ **Errores Comunes:** Código duplicado, variables de entorno no documentadas

---

## 2. HALLAZGOS POR CATEGORÍA

### 2.1 Arquitectura y Estructura

**Severidad:** Media

- **Problema:** Metadata del layout raíz con valores por defecto de Next.js
- **Ubicación:** `app/layout.tsx` líneas 8-11
- **Impacto:** SEO y branding incorrectos en producción
- **Solución:** 
  ```typescript
  export const metadata: Metadata = {
    title: "iNFORiA - Sistema de Gestión Clínica",
    description: "Plataforma profesional para gestión de pacientes y generación de informes clínicos",
  };
  ```

**Severidad:** Baja

- **Problema:** Archivos Deno (deno.json, import_map.json) presentes en proyecto Next.js
- **Ubicación:** Raíz del proyecto
- **Impacto:** Confusión en el entorno de desarrollo, posible interferencia con herramientas
- **Solución:** Eliminar `deno.json` e `import_map.json` si no se usan Supabase Edge Functions desde este proyecto

**Severidad:** Media

- **Problema:** Layout de aplicación incompleto - falta Sidebar mencionado en comentarios
- **Ubicación:** `app/(app)/layout.tsx` línea 10
- **Impacto:** Estructura de layout inconsistente
- **Solución:** Completar el layout con Sidebar o eliminar comentarios que lo mencionan

---

### 2.2 TypeScript y Tipado

**Severidad:** Alta

- **Problema:** Uso de tipo `any` en lugar de tipos específicos
- **Ubicación:** `app/(app)/account/page.tsx` línea 21
- **Impacto:** Pérdida de seguridad de tipos, posibles errores en runtime
- **Solución:** 
  ```typescript
  // Reemplazar:
  const [profile, setProfile] = useState<any>(null);
  // Por:
  import { Database } from '@/lib/types';
  type Profile = Database['public']['Tables']['profiles']['Row'];
  const [profile, setProfile] = useState<Profile | null>(null);
  ```

**Severidad:** Media

- **Problema:** Falta tipado explícito en algunos componentes
- **Ubicación:** Múltiples archivos (ej: `components/ReportModule.tsx`)
- **Impacto:** Menor seguridad de tipos
- **Solución:** Agregar tipos explícitos a todas las props y estados

**Severidad:** Baja

- **Problema:** `tsconfig.json` no incluye reglas estrictas adicionales
- **Ubicación:** `tsconfig.json`
- **Impacto:** Permite código menos seguro
- **Solución:** Considerar agregar:
  ```json
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true
  ```

---

### 2.3 Rutas y Navegación

**Severidad:** 🔴 **CRÍTICA**

- **Problema:** URL de callback de OAuth incorrecta - doble `/auth/auth/callback`
- **Ubicación:** `app/api/auth/login/route.ts` línea 12
- **Impacto:** **El flujo de autenticación OAuth fallará completamente en producción**
- **Solución:** 
  ```typescript
  // Cambiar de:
  const redirectTo = `${requestUrl.origin}/auth/auth/callback`;
  // A:
  const redirectTo = `${requestUrl.origin}/auth/callback`;
  ```
  **Nota:** Verificar que la ruta `app/(app)/(auth)/callback/route.ts` esté en la ubicación correcta

**Severidad:** Alta

- **Problema:** Ruta de callback puede no coincidir con la estructura de carpetas
- **Ubicación:** `app/(app)/(auth)/callback/route.ts` vs URL esperada `/auth/callback`
- **Impacto:** Redirección OAuth fallará
- **Solución:** Verificar que la estructura de carpetas coincida con la URL. Si la ruta está en `app/(app)/(auth)/callback/route.ts`, la URL será `/callback`, no `/auth/callback`. Mover a `app/auth/callback/route.ts` o ajustar la URL en login route.

**Severidad:** Media

- **Problema:** Middleware verifica campo `credits` pero la tabla tiene `credits_limit` y `credits_used`
- **Ubicación:** `middleware.ts` línea 66
- **Impacto:** Lógica de créditos puede no funcionar correctamente
- **Solución:** 
  ```typescript
  // Verificar estructura de la tabla profiles:
  // Si tiene credits_limit y credits_used, calcular:
  const availableCredits = (profile.credits_limit || 0) - (profile.credits_used || 0);
  if (availableCredits <= 0 && pathname !== '/blocked') {
    return NextResponse.redirect(new URL('/blocked', req.url));
  }
  ```

---

### 2.4 Integración Supabase

**Severidad:** Alta

- **Problema:** Dependencia obsoleta `@supabase/auth-helpers-nextjs` presente pero no usada
- **Ubicación:** `package.json` línea 36
- **Impacto:** Bundle size innecesario, confusión sobre qué librería usar
- **Solución:** Eliminar la dependencia:
  ```bash
  npm uninstall @supabase/auth-helpers-nextjs
  ```

**Severidad:** Media

- **Problema:** Variables de entorno no validadas al inicio
- **Ubicación:** `lib/supabase/client.ts` y `lib/supabase/server.ts`
- **Impacto:** Errores en runtime si faltan variables
- **Solución:** Agregar validación:
  ```typescript
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  ```

**Severidad:** Baja

- **Problema:** Falta documentación de variables de entorno requeridas
- **Ubicación:** Raíz del proyecto
- **Impacto:** Dificulta configuración en nuevos entornos
- **Solución:** Crear `.env.example` con todas las variables necesarias:
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  OPENROUTER_API_KEY=
  STRIPE_SECRET_KEY=
  STRIPE_PUBLISHABLE_KEY=
  ```

---

### 2.5 Configuración Vercel

**Severidad:** 🔴 **CRÍTICA**

- **Problema:** No existe archivo `vercel.json` para configuración de despliegue
- **Ubicación:** Raíz del proyecto
- **Impacto:** **Puede causar problemas en despliegue, redirecciones incorrectas, y configuración de headers**
- **Solución:** Crear `vercel.json`:
  ```json
  {
    "rewrites": [
      {
        "source": "/auth/callback",
        "destination": "/auth/callback"
      }
    ],
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          }
        ]
      }
    ]
  }
  ```

**Severidad:** Alta

- **Problema:** `next.config.js` muy básico, falta configuración para producción
- **Ubicación:** `next.config.js`
- **Impacto:** Posibles problemas de optimización y seguridad
- **Solución:** Expandir configuración:
  ```javascript
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
      domains: ['your-supabase-project.supabase.co'],
    },
    experimental: {
      serverActions: {
        bodySizeLimit: '2mb',
      },
    },
  };
  
  module.exports = nextConfig;
  ```

---

### 2.6 Dependencias

**Severidad:** Alta

- **Problema:** Dependencia obsoleta `@supabase/auth-helpers-nextjs` en package.json
- **Ubicación:** `package.json` línea 36
- **Impacto:** Confusión, bundle size innecesario
- **Solución:** Eliminar con `npm uninstall @supabase/auth-helpers-nextjs`

**Severidad:** Media

- **Problema:** Versiones de React y Next.js sin especificar versión exacta
- **Ubicación:** `package.json` líneas 49, 51, 53
- **Impacto:** Posibles incompatibilidades en diferentes entornos
- **Solución:** Considerar usar versiones exactas o ranges más restrictivos para producción

**Severidad:** Baja

- **Problema:** Falta `package-lock.json` o `yarn.lock` en el repositorio (verificar)
- **Ubicación:** Raíz del proyecto
- **Impacto:** Inconsistencias en versiones de dependencias entre desarrolladores
- **Solución:** Asegurar que el lockfile esté versionado en git

---

### 2.7 Errores Comunes de Compilación

**Severidad:** 🔴 **CRÍTICA**

- **Problema:** Código duplicado - verificación de `googleToken` dos veces
- **Ubicación:** `app/(app)/reports/actions.ts` líneas 117-122
- **Impacto:** **Código muerto, confusión, posible error lógico**
- **Solución:** Eliminar la verificación duplicada:
  ```typescript
  const googleToken = user.app_metadata.provider_token;
  if (!googleToken) {
    return { success: false, error: "No se encontró el token de Google. El usuario debe volver a conectarse." };
  }
  // Eliminar las líneas 120-122 duplicadas
  ```

**Severidad:** Alta

- **Problema:** Middleware puede fallar si `profile` es null pero no hay error
- **Ubicación:** `middleware.ts` líneas 70-73
- **Impacto:** Usuarios sin perfil pueden ser bloqueados incorrectamente
- **Solución:** 
  ```typescript
  if (profileError) {
    console.error('[MIDDLEWARE] Error fetching profile:', profileError);
    // Si no hay perfil, permitir acceso pero registrar
    return res; 
  }
  
  // Verificar que profile existe antes de acceder a credits
  if (profile) {
    const availableCredits = (profile.credits_limit || 0) - (profile.credits_used || 0);
    if (availableCredits <= 0 && pathname !== '/blocked') {
      return NextResponse.redirect(new URL('/blocked', req.url));
    }
  }
  ```

**Severidad:** Media

- **Problema:** Uso de `useEffect` con dependencias incorrectas
- **Ubicación:** `components/DashboardHeader.tsx` línea 45
- **Impacto:** Posibles re-renders innecesarios o falta de actualización
- **Solución:** 
  ```typescript
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
    
    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => subscription.unsubscribe();
  }, []); // Array vacío es correcto aquí
  ```

**Severidad:** Media

- **Problema:** Importación de Supabase client en nivel superior de componente
- **Ubicación:** `components/ReportModule.tsx` línea 9
- **Impacto:** Posible creación de múltiples clientes
- **Solución:** Mover `createClient()` dentro del componente o usar un hook

**Severidad:** Baja

- **Problema:** Comentarios con código eliminado pueden confundir
- **Ubicación:** Múltiples archivos (ej: `app/(app)/layout.tsx`, `components/DashboardHeader.tsx`)
- **Impacto:** Confusión en mantenimiento
- **Solución:** Limpiar comentarios obsoletos o moverlos a git history

---

## 3. PROBLEMAS CRÍTICOS QUE IMPIDEN COMPILACIÓN

### 🔴 Prioridad 1: URL de Callback OAuth Incorrecta
**Archivo:** `app/api/auth/login/route.ts` línea 12
**Problema:** URL `/auth/auth/callback` es incorrecta
**Solución Inmediata:**
```typescript
const redirectTo = `${requestUrl.origin}/auth/callback`;
```
**Verificar:** Que la ruta `app/(app)/(auth)/callback/route.ts` sea accesible como `/auth/callback` o mover el archivo a `app/auth/callback/route.ts`

### 🔴 Prioridad 2: Falta Configuración Vercel
**Archivo:** No existe `vercel.json`
**Problema:** Sin configuración de despliegue
**Solución Inmediata:** Crear `vercel.json` con configuración de rewrites y headers

### 🔴 Prioridad 3: Código Duplicado en Server Action
**Archivo:** `app/(app)/reports/actions.ts` líneas 117-122
**Problema:** Verificación duplicada de `googleToken`
**Solución Inmediata:** Eliminar líneas 120-122

### 🔴 Prioridad 4: Middleware - Campo de Créditos Incorrecto
**Archivo:** `middleware.ts` línea 66
**Problema:** Accede a `profile.credits` pero la tabla tiene `credits_limit` y `credits_used`
**Solución Inmediata:** Verificar esquema de BD y corregir lógica de créditos

---

## 4. RECOMENDACIONES DE MEJORA

### 4.1 Seguridad
1. **Agregar validación de variables de entorno al inicio de la aplicación**
2. **Implementar rate limiting en API routes**
3. **Agregar CSRF protection para formularios**
4. **Validar y sanitizar todas las entradas de usuario**

### 4.2 Performance
1. **Implementar lazy loading para componentes pesados**
2. **Agregar `loading.tsx` y `error.tsx` en rutas críticas**
3. **Optimizar imágenes con next/image**
4. **Considerar implementar ISR (Incremental Static Regeneration) donde sea apropiado**

### 4.3 Mantenibilidad
1. **Crear archivo `.env.example` con todas las variables requeridas**
2. **Documentar estructura de base de datos**
3. **Agregar comentarios JSDoc a funciones complejas**
4. **Estandarizar formato de código con Prettier y ESLint**

### 4.4 Testing
1. **Agregar tests unitarios para funciones críticas**
2. **Implementar tests de integración para flujos de autenticación**
3. **Agregar tests E2E para flujos principales**

### 4.5 Monitoreo
1. **Implementar logging estructurado**
2. **Agregar error tracking (Sentry, LogRocket, etc.)**
3. **Configurar alertas para errores críticos**

---

## 5. CHECKLIST DE VALIDACIÓN POST-CORRECCIÓN

### Compilación y Build
- [ ] Compilación local exitosa (`npm run build`)
- [ ] Sin errores de TypeScript (`npx tsc --noEmit`)
- [ ] Sin warnings críticos en build
- [ ] Bundle size dentro de límites razonables

### Configuración
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] `.env.example` creado y actualizado
- [ ] `vercel.json` configurado correctamente
- [ ] `next.config.js` optimizado para producción

### Funcionalidad
- [ ] Rutas funcionando correctamente (navegación)
- [ ] Autenticación OAuth funcionando (login/logout)
- [ ] Integración Supabase operativa (lectura/escritura)
- [ ] Middleware funcionando (redirecciones, protección de rutas)
- [ ] Server Actions funcionando (transcripción, generación de informes)

### Seguridad
- [ ] Variables sensibles no expuestas en cliente
- [ ] Rutas protegidas correctamente
- [ ] Validación de inputs implementada
- [ ] Headers de seguridad configurados

### Deploy
- [ ] Deploy en Vercel exitoso
- [ ] Variables de entorno configuradas en Vercel
- [ ] Dominio personalizado configurado (si aplica)
- [ ] SSL/TLS funcionando
- [ ] Redirecciones funcionando correctamente

### Post-Deploy
- [ ] Login con Google funcionando
- [ ] Creación de perfiles funcionando
- [ ] Generación de informes funcionando
- [ ] Guardado en Google Drive funcionando
- [ ] Sistema de créditos funcionando

---

## 6. NOTAS ADICIONALES

### Estructura de Base de Datos
Verificar que la tabla `profiles` tenga los campos correctos:
- `credits_limit` (number)
- `credits_used` (number)
- O si tiene un campo `credits` único

Ajustar el middleware según la estructura real.

### Flujo de Autenticación
El flujo actual:
1. Usuario hace clic en "Iniciar Sesión con Google"
2. Se llama a `/api/auth/login` (POST)
3. Se redirige a Google OAuth
4. Google redirige a `/auth/callback`
5. Se intercambia código por sesión
6. Usuario es redirigido a `/dashboard`

**Verificar:** Que todas las URLs de callback estén correctamente configuradas en:
- Google Cloud Console (OAuth credentials)
- Supabase Dashboard (Redirect URLs)
- Código de la aplicación

### Variables de Entorno Requeridas
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENROUTER_API_KEY=
STRIPE_SECRET_KEY= (si se usa)
STRIPE_PUBLISHABLE_KEY= (si se usa)
```

---

## 7. CONCLUSIÓN

El proyecto tiene una base sólida con Next.js 14 App Router y Supabase correctamente implementados. Los problemas críticos identificados son principalmente de configuración y lógica que pueden corregirse rápidamente. Una vez resueltos los 4 problemas críticos, el proyecto debería compilar y desplegarse correctamente en Vercel.

**Prioridad de acción:**
1. Corregir URL de callback OAuth (15 min)
2. Crear vercel.json (10 min)
3. Eliminar código duplicado (5 min)
4. Corregir lógica de créditos en middleware (20 min)
5. Eliminar dependencia obsoleta (5 min)
6. Agregar validación de variables de entorno (15 min)
7. Crear .env.example (10 min)
8. Actualizar metadata del layout (5 min)

**Tiempo total estimado:** ~1.5 horas para problemas críticos, 8-12 horas para todas las mejoras.


