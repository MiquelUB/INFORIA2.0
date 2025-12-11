# 📍 Análisis de Rutas y Estructura del Workspace INFORIA2.0

## 🔍 Ruta Base del Workspace
```
D:\iNFORiA\SaaS\INFORIA2.0
```

---

## 📋 Archivos de Configuración de Rutas Involucrados

### 1. **tsconfig.json** (Configuración de Paths de TypeScript)
**Ubicación:** `D:\iNFORiA\SaaS\INFORIA2.0\tsconfig.json`

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]  // Alias @ apunta a la raíz del workspace
    }
  }
}
```

**Propósito:** Define rutas de importación relativas usando el alias `@/`
**Rutas que define:**
- `@/components` → `D:\iNFORiA\SaaS\INFORIA2.0\components`
- `@/lib` → `D:\iNFORiA\SaaS\INFORIA2.0\lib`
- `@/app` → `D:\iNFORiA\SaaS\INFORIA2.0\app`

---

### 2. **next.config.js** (Configuración de Next.js)
**Ubicación:** `D:\iNFORiA\SaaS\INFORIA2.0\next.config.js`

```javascript
const nextConfig = {
  reactStrictMode: true,
};
```

**Propósito:** Configuración mínima de Next.js
**Nota:** Las rutas se gestionan mediante App Router de Next.js

---

### 3. **deno.json** (Configuración de Deno para Edge Functions)
**Ubicación:** `D:\iNFORiA\SaaS\INFORIA2.0\deno.json`

```json
{
  "importMap": "./import_map.json"
}
```

**Propósito:** Configurar Edge Functions de Supabase
**Rutas relacionadas:**
- Funciones: `D:\iNFORiA\SaaS\INFORIA2.0\supabase\functions\`
  - `generate-report\index.ts`
  - Otras funciones edge

---

### 4. **import_map.json** (Mapeo de Imports para Deno)
**Ubicación:** `D:\iNFORiA\SaaS\INFORIA2.0\import_map.json`

```json
{
  "imports": {
    "std/": "https://deno.land/std@0.224.0/",
    "@supabase/supabase-js": "https://esm.sh/@supabase/supabase-js@2.55.0",
    "openai": "https://esm.sh/openai@4.70.0"
  }
}
```

**Propósito:** Mapear imports externos para scripts Deno

---

### 5. **app/mcp.json** (Configuración de MCP Servers)
**Ubicación:** `D:\iNFORiA\SaaS\INFORIA2.0\app\mcp.json`

```json
{
  "version": 1,
  "servers": [
    {
      "id": "testsprite",
      "name": "TestSprite",
      "command": "npx @testsprite/testsprite-mcp@latest"
    }
  ]
}
```

**Propósito:** Configurar Model Context Protocol Servers

---

### 6. **middleware.ts** (Middleware de Rutas)
**Ubicación:** `D:\iNFORiA\SaaS\INFORIA2.0\middleware.ts`

**Función:** Gestiona el enrutamiento y protección de rutas

**Matcher configurado:**
```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

---

## 🛣️ Estructura de Rutas (App Router de Next.js)

### Rutas Públicas
```
/login           → D:\iNFORiA\SaaS\INFORIA2.0\app\(auth)\login\page.tsx
/signup          → D:\iNFORiA\SaaS\INFORIA2.0\app\(auth)\signup\page.tsx
/blocked         → Ruta protegida por créditos
/auth/callback   → D:\iNFORiA\SaaS\INFORIA2.0\app\auth\callback\route.ts
```

### Rutas Protegidas (Requieren autenticación)
```
/                    → Redirige a /dashboard
/dashboard           → D:\iNFORiA\SaaS\INFORIA2.0\app\(app)\dashboard\page.tsx
/session/[patientId] → D:\iNFORiA\SaaS\INFORIA2.0\app\(app)\session\[patientId]\page.tsx
/patients/[id]       → D:\iNFORiA\SaaS\INFORIA2.0\app\(app)\patients\[id]\page.tsx
/account             → D:\iNFORiA\SaaS\INFORIA2.0\app\(app)\account\page.tsx
/onboarding          → D:\iNFORiA\SaaS\INFORIA2.0\app\(app)\onboarding\page.tsx
```

### Rutas API
```
/api/get-patient-appointments  → D:\iNFORiA\SaaS\INFORIA2.0\app\api\get-patient-appointments\route.ts
```

---

## 📁 Estructura de Directorios Completa

```
D:\iNFORiA\SaaS\INFORIA2.0\
├── app/                           # App Router de Next.js
│   ├── (app)/                     # Grupo de rutas privadas
│   │   ├── dashboard/             # /dashboard
│   │   │   └── page.tsx
│   │   ├── session/
│   │   │   └── [patientId]/       # /session/[patientId]
│   │   │       └── page.tsx
│   │   ├── patients/
│   │   │   └── [id]/              # /patients/[id]
│   │   │       └── page.tsx
│   │   ├── account/               # /account
│   │   │   └── page.tsx
│   │   ├── onboarding/            # /onboarding
│   │   │   └── page.tsx
│   │   └── (auth)/                # Grupo anidado
│   │       ├── login/             # /(app)/(auth)/login
│   │       └── callback/          # /(app)/(auth)/callback
│   ├── (auth)/                    # Grupo de rutas públicas
│   │   ├── login/                 # /login
│   │   │   └── page.tsx
│   │   └── signup/                # /signup
│   ├── auth/                      # Callbacks de autenticación
│   │   └── callback/
│   │       └── route.ts
│   ├── api/                       # Rutas API
│   │   └── get-patient-appointments/
│   │       └── route.ts
│   ├── layout.tsx                 # Layout raíz
│   ├── globals.css
│   └── mcp.json
├── components/                    # Componentes React
│   ├── Dashboard.tsx
│   ├── Header.tsx
│   ├── QueryProvider.tsx
│   ├── auth/
│   ├── billing/
│   ├── layout/
│   ├── reports/
│   ├── session/
│   ├── shared/
│   ├── ui/
│   └── workspace/
├── lib/                           # Código de utilidades
│   ├── hooks/
│   │   └── usePatients.ts
│   ├── services/
│   │   ├── openrouter.ts          # Servicio de IA
│   │   ├── reports.ts
│   │   ├── stripe.ts
│   │   └── ... otras
│   ├── supabase/
│   │   └── client.ts
│   ├── types/
│   ├── utils.ts
│   └── types.ts
├── supabase/                      # Configuración de Supabase
│   ├── functions/
│   │   └── generate-report/
│   │       └── index.ts
│   ├── migrations/
│   └── config.toml
├── types/                         # Tipos TypeScript globales
│   ├── billing.ts
│   └── index.ts
├── contexts/                      # React Context Providers
├── middleware.ts                  # Middleware de Next.js
├── tsconfig.json                  # Configuración de TypeScript
├── next.config.js                 # Configuración de Next.js
├── package.json                   # Dependencias
├── deno.json                      # Configuración de Deno
├── import_map.json                # Mapeo de imports para Deno
├── app/mcp.json                   # Configuración de MCP
└── ...otros archivos de configuración
```

---

## 🔗 Flujo de Rutas en el Aplicación

### 1. **Flujo de Autenticación**
```
1. Usuario accede a /login (Pública)
   ↓
2. Credenciales validadas en auth/callback/route.ts
   ↓
3. Supabase crea sesión
   ↓
4. Middleware redirige a /dashboard (protegida)
```

**Archivos involucrados:**
- `middleware.ts` - Valida sesión
- `app/(auth)/login/page.tsx` - Formulario login
- `app/auth/callback/route.ts` - Callback de Supabase
- `lib/supabase/client.ts` - Cliente Supabase

---

### 2. **Flujo de Creación de Informe**
```
1. Usuario accede a /session/[patientId]
   ↓
2. Carga datos del paciente
   ↓
3. Registra sesión (audio/notas)
   ↓
4. Genera informe (IA o estructurado)
   ↓
5. Guarda en Google Drive
```

**Archivos involucrados:**
- `app/(app)/session/[patientId]/page.tsx` - Workspace sesión
- `lib/services/openrouter.ts` - Generación IA
- `supabase/functions/generate-report/index.ts` - Edge Function
- `lib/services/reports.ts` - Lógica de reportes

---

### 3. **Flujo de Dashboard**
```
1. Usuario accede a /dashboard (protegida)
   ↓
2. Middleware valida sesión y créditos
   ↓
3. Carga pacientes desde Supabase
   ↓
4. Carga citas vía API /api/get-patient-appointments
   ↓
5. Renderiza calendario y módulos
```

**Archivos involucrados:**
- `middleware.ts` - Validación de sesión
- `app/(app)/dashboard/page.tsx` - Página dashboard
- `components/Header.tsx` - Encabezado
- `lib/hooks/usePatients.ts` - Hook de pacientes
- `app/api/get-patient-appointments/route.ts` - API

---

## ⚙️ Problemas Comunes de Rutas

### ❌ Problema 1: Rutas con Backslash en Windows
**Causa:** Uso de `\` en lugar de `/`

**Solución:**
```typescript
// ❌ MAL
const path = 'D:\iNFORiA\SaaS\INFORIA2.0\app\dashboard';

// ✅ BIEN
const path = 'D:/iNFORiA/SaaS/INFORIA2.0/app/dashboard';
```

---

### ❌ Problema 2: Rutas Dinámicas No Resueltas
**Causa:** Parámetro dinámico no coincide con la carpeta

**Solución:**
```typescript
// Estructura correcta
app/(app)/session/[patientId]/page.tsx
         ↓
app/(app)/session/123/page.tsx (en runtime)
```

---

### ❌ Problema 3: Imports con Alias Incorrectos
**Causa:** Alias `@/` no configurado correctamente

**Solución:**
```typescript
// ✅ CORRECTO (gracias a tsconfig.json)
import { Dashboard } from '@/components/Dashboard';

// ❌ EVITAR (rutas relativas largas)
import { Dashboard } from '../../../components/Dashboard';
```

---

## 📊 Resumen de Configuración

| Archivo | Propósito | Rutas Que Define |
|---------|----------|-----------------|
| `tsconfig.json` | Path aliases | `@/*` → `./*` |
| `next.config.js` | Config Next.js | Rutas app router |
| `middleware.ts` | Protección rutas | Autenticación + Créditos |
| `deno.json` | Config Deno | Import maps |
| `app/mcp.json` | MCP Servers | TestSprite MCP |
| `import_map.json` | Imports Deno | External modules |

---

## 🎯 Recomendaciones

1. **Siempre usar `/` en rutas** (compatible con Windows y Unix)
2. **Usar alias `@/`** en imports para evitar rutas relativas largas
3. **Mantener sincronización** entre estructura de carpetas y rutas
4. **Validar `params` dinámicos** en componentes de páginas
5. **Revisar middleware** para cambios en rutas protegidas

---

**Documento generado:** 17 de Noviembre de 2025
**Proyecto:** INFORIA2.0
**Rama:** login-correcto
