<<<<<<< HEAD
Perfecto.
A partir de la **GUÍA PARA AGENTE GEMINI EN VS CODE** y las **últimas dos entradas del incidente (Nunito_Sans + conflicto de rutas duplicadas)**, te dejo el documento actualizado en formato **Markdown (.md)** listo para usar por el Agente:

---

# 🧭 GUÍA ACTUALIZADA PARA AGENTE GEMINI — INFORIA 2.0

## 📦 Contexto General del Proyecto

**Proyecto:** INFORIA 2.0 — SaaS para psicólogos y emprendedores.
**Framework principal:** Next.js 14+ (App Router).
**Estilos:** Tailwind CSS.
**Backend/BaaS:** Supabase (PostgreSQL, Auth, Edge Functions, Storage).
**Entorno:** VS Code + PowerShell.

La misión del Agente es **mantener el proyecto compilando correctamente (`npm run build`) y garantizar la estabilidad del App Router**, las fuentes `next/font`, y la coherencia de rutas tras la migración desde el antiguo Pages Router.

---

## 🚨 INCIDENTE ACTUAL: "Failed to find font override values for font `Nunito Sans`"

### 🧩 Causa raíz

La aparición del error coincidió con la creación de la carpeta:

```
app/(app)/blocked/page.tsx
```

lo que generó **rutas duplicadas**:

```
app/(app)/blocked/page.tsx
app/blocked/page.tsx
```

Next.js detecta ambas como `/blocked`, interrumpiendo la compilación y rompiendo la generación de variables CSS de las fuentes (`Nunito_Sans`).

---

## ✅ SOLUCIÓN OFICIAL — ESTABILIZACIÓN DE FUENTES Y RUTAS

### 1️⃣ Eliminar duplicados de rutas

Acción inmediata:

```powershell
Remove-Item -Recurse -Force app\blocked
```

(Si se decide conservar la versión del grupo `(app)`).

Verificación:

```powershell
Get-ChildItem -Recurse app | Where-Object { $_.Name -eq "page.tsx" } | Select-String "blocked"
```

Debe devolver **una sola ruta `/blocked`**.

---

### 2️⃣ Estructura estable recomendada del directorio `/app`

```
app/
├─ (app)/
│  ├─ dashboard/
│  ├─ patients/
│  ├─ session/[patientId]/
│  ├─ onboarding/
│  └─ blocked/
├─ layout.tsx
├─ globals.css
└─ page.tsx
```

---

### 3️⃣ layout.tsx — Configuración correcta de fuentes

```tsx
import { Nunito_Sans, Lora } from "next/font/google";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
});
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

export const metadata = { title: "INFORIA" };

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${nunitoSans.variable} ${lora.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

---

### 4️⃣ tailwind.config.ts

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-nunito-sans)"],
        serif: ["var(--font-lora)"],
      },
    },
  },
  plugins: [],
};

export default config;
```

---

### 5️⃣ Limpieza final antes del build

```powershell
Remove-Item -Recurse -Force .next, node_modules
npm cache clean --force
npm install
npm run build
```

✅ Resultado esperado:

```
Compiled successfully.
```

---

## 🔧 RECORDATORIO DE INCIDENTES ANTERIORES (Para el Agente)

Los siguientes errores ya fueron resueltos y **no deben reintroducirse**:

| Tipo                   | Archivo                                           | Acción Correctiva                                                         |
| ---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------- |
| Server/Client Conflict | app/(app)/patients/page.tsx y relacionados        | Añadir `'use client';`                                                    |
| Hook no resuelto       | app/(app)/patients/page.tsx                       | Cambiar `@/hooks/usePatients` → `@/lib/hooks/usePatients`                 |
| CSS inestable          | app/globals.css                                   | Eliminar selector `* { @apply border-border; }`                           |
| Ruta duplicada         | app/(app)/blocked/page.tsx y app/blocked/page.tsx | Mantener solo una versión                                                 |
| Fuente no inicializada | Nunito Sans                                       | Mantener import desde `next/font/google` y usar `var(--font-nunito-sans)` |

---

## 🚀 Verificación final para CI/CD

Antes de confirmar un commit estable:

```powershell
Remove-Item -Recurse -Force .next
npm run build
```

Debe mostrar:

```
✓ Compiled successfully
```

---
=======
El proyecto principal documentado es **INFORIA** (o INFORIA 2.0), un producto de Software como Servicio (SaaS) diseñado para psicólogos autónomos.

El proyecto tuvo una **migración** desde una arquitectura anterior (basada en Vite + React) hacia una arquitectura moderna basada en Next.js 14. El resumen se centrará en la arquitectura resultante y los objetivos del proyecto, omitiendo cualquier detalle de configuración del *stack* de Vite, cuyos artefactos fueron eliminados después de la migración.

Aquí tiene un resumen completo del proyecto INFORIA:

### 1. Visión y Propósito Estratégico

El objetivo principal de INFORIA es proporcionar **"Paz Mental y Confianza Profesional"** al psicólogo autónomo. La visión del producto es actuar como el **"Asistente Clínico y de Negocio"** del profesional.

*   **Usuario Objetivo:** El **"Emprendedor Accidental"**, un clínico excelente que se siente abrumado por la burocracia y las tareas administrativas.
*   **Propuesta de Valor:** El concepto central es la **"Liberación Profesional"**, buscando erradicar el trabajo tedioso para que los profesionales se centren en sus pacientes.
*   **Modelo de Negocio:** Se estableció un modelo de **Suscripción Pura** con planes basados en el volumen de informes, como el **Plan Profesional** (99€/mes por 100 informes) y el **Plan Clínica** (149€/mes por 150 informes).

### 2. Arquitectura Técnica y Stack

La arquitectura consolidada se construyó como un **MVP Profesional y Enfocado**.

*   **Stack Tecnológico:** Se decidió usar **Next.js 14+** (con **App Router**) y **TypeScript**. Utiliza **PostgreSQL** (gestionado por **Supabase**) para la base de datos y la autenticación, y **Vercel** para el despliegue y *hosting*.
*   **Principio "Zero-Knowledge":** Un pilar arquitectónico central es el principio **"Zero-Knowledge"** (Cero Conocimiento). Esto significa que los informes clínicos generados **nunca se almacenan** en la base de datos de Supabase, sino directamente en el Google Drive del cliente, requiriendo un flujo de autenticación seguro para capturar el *refresh_token* de Google.
*   **Arquitectura de Autenticación:** El sistema usa **Supabase SSR** (`@supabase/ssr`) para un manejo seguro de sesiones en el servidor y el cliente. Un `middleware.ts` centralizado intercepta las peticiones y se encarga de la lógica de seguridad, incluyendo la verificación de la sesión y la comprobación de los créditos del usuario (`credits > 0`) antes de permitir el acceso a rutas protegidas.

### 3. Funcionalidad Central (MVP v1.0)

El diseño de la interfaz se basa en el modelo **"El Puesto de Mando Clínico"**, que ofrece una pantalla principal con un calendario y acceso directo a los módulos de acción.

Los **Módulos Funcionales** del MVP incluyen:

1.  **Motor de Informes Inteligentes:** Permite un *input* dual (voz/texto) de las notas de la sesión. La tarea pesada (transcripción y generación de informes) se gestiona de forma **asíncrona** (idealmente con un servicio de colas como Upstash). El motor de IA utiliza **OpenAI Whisper** para la transcripción y **OpenAI GPT-4o mini** para la generación del informe evolutivo (a través de OpenRouter).
2.  **CRM Simplificado:** Gestión de fichas de pacientes con datos de identificación, contacto y datos administrativos (como etiquetas de texto libre y notas fijas).
3.  **Calendario Integrado:** Módulo de agenda con vistas de día/semana/mes y botón para añadir citas.
4.  **Búsqueda Universal:** Optimizada para mostrar el último informe.
5.  **Módulo de Soporte:** FAQs y vídeos tutoriales.

### 4. Estado de Desarrollo y Desafíos

El proyecto alcanzó una fase de estabilidad después de migrar de NextAuth a Supabase SSR y resolver fallos de *runtime*.

*   **Hardening de Seguridad:** Se mitigó una **vulnerabilidad crítica** (INFORIA-AUTH-2025-001) reemplazando la función pasiva `supabase.auth.getSession()` por la función activa **`supabase.auth.getUser()`**, la cual valida el *token* criptográficamente contra el servidor, declarando el **Riesgo Residual NULO**.
*   **Tareas Pendientes Críticas:** A pesar de la robustez arquitectónica, la **funcionalidad central de grabación de audio y transcripción está incompleta** (con un 15% de implementación restante) y no es funcional, lo que representa el mayor obstáculo para el lanzamiento del SaaS. También se identificó la necesidad de proteger la clave API de OpenRouter migrando la llamada a un *API Route* de *backend*.

El proyecto, aunque seguro y bien estructurado en Next.js, está en la fase de **ejecución de producción** y pendiente de completar su propuesta de valor clave basada en la IA.
>>>>>>> feature/stripe-integration
