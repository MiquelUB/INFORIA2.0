<<<<<<< HEAD
# Prisma Client &middot; [![npm version](https://img.shields.io/npm/v/@prisma/client.svg?style=flat)](https://www.npmjs.com/package/@prisma/client) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/prisma/prisma/blob/main/CONTRIBUTING.md) [![GitHub license](https://img.shields.io/badge/license-Apache%202-blue)](https://github.com/prisma/prisma/blob/main/LICENSE) [![Discord](https://img.shields.io/discord/937751382725886062?label=Discord)](https://pris.ly/discord)

Prisma Client JS is an **auto-generated query builder** that enables **type-safe** database access and **reduces boilerplate**. You can use it as an alternative to traditional ORMs such as Sequelize, TypeORM or SQL query builders like knex.js.

It is part of the [Prisma](https://www.prisma.io/) ecosystem. Prisma provides database tools for data access, declarative data modeling, schema migrations and visual data management. Learn more in the main [`prisma`](https://github.com/prisma/prisma/) repository or read the [documentation](https://www.prisma.io/docs/).

## Getting started

Follow one of these guides to get started with Prisma Client JS:

- [Quickstart](https://www.prisma.io/docs/getting-started/quickstart) (5 min)
- [Set up a new project with Prisma (SQL migrations)](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch-sql) (15 min)
- [Set up a new project with Prisma (Prisma Migrate)](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch-prisma-migrate) (15 min)
- [Add Prisma to an existing project](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project) (15 min)

Alternatively you can explore the ready-to-run [examples](https://github.com/prisma/prisma-examples/) (REST, GraphQL, gRPC, plain JavaScript and TypeScript demos, ...) or watch the [demo videos](https://www.youtube.com/watch?v=0RhtQgIs-TE&list=PLn2e1F9Rfr6k9PnR_figWOcSHgc_erDr5&index=1) (1-2 min per video).

## Contributing

Refer to our [contribution guidelines](https://github.com/prisma/prisma/blob/main/CONTRIBUTING.md) and [Code of Conduct for contributors](https://github.com/prisma/prisma/blob/main/CODE_OF_CONDUCT.md).

## Tests Status

- Prisma Tests Status:  
  [![CI](https://github.com/prisma/prisma/actions/workflows/test.yml/badge.svg)](https://github.com/prisma/prisma/actions/workflows/test.yml)
- Ecosystem Tests Status:  
  [![Actions Status](https://github.com/prisma/ecosystem-tests/workflows/test/badge.svg)](https://github.com/prisma/ecosystem-tests/actions)
=======
# iNFORiA 2.0 - Clinical Management SaaS

**INFORiA** es una plataforma SaaS diseñada para psicólogos y profesionales de
la salud mental, facilitando la gestión clínica, la facturación y la generación
automatizada de informes mediante IA.

## 🚀 Tech Stack

### Core

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Diseño Neumórfico "Warm & Clinical")
- **Icons:** Lucide React

### Backend & Services

- **Auth & Database:** [Supabase](https://supabase.com/) (PostgreSQL + Auth)
- **Payments:** [Stripe](https://stripe.com/) (Suscripciones y Pagos Únicos)
- **Emails:** [Resend](https://resend.com/) (Transaccionales y Marketing)
- **AI/LLM:** OpenAI API (Generación de Informes)

## ✨ Key Features

- **Puesto de Mando (Dashboard):** Vista centralizada de citas del día y
  métricas clave.
- **CRM de Pacientes:** Gestión completa de expedientes, historial y notas de
  sesión.
- **DayFocus:** Herramienta para gestionar el flujo de trabajo diario.
- **Generación de Informes IA:** Creación automática de informes clínicos
  basados en notas de sesión.
- **Gestión de Citas:** Calendario integrado y recordatorios.
- **Suscripciones:** Gestión de planes (Free, Starter, Pro) y facturación
  automatizada.
- **Seguridad:** Cumplimiento con estándares de privacidad de datos de salud.

## 🛠️ Getting Started

### Prerrequisitos

- Node.js (v18+)
- npm / yarn / pnpm

### Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/inforia-2.0.git
   cd inforia-2.0
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Configurar Variables de Entorno:** Crea un archivo `.env.local` en la raíz
   basado en el `.env.example` (si existe) o con las siguientes claves
   requeridas:

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   # Resend
   RESEND_API_KEY=re_...

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📂 Estructura del Proyecto

- `/app`: Rutas y páginas (Next.js App Router).
- `/components`: Componentes UI reutilizables (Botones Neumórficos, Cards,
  etc.).
- `/lib`: Utilidades, hooks personalizados y clientes de servicios (Supabase,
  Stripe).
- `/supabase`: Funciones Edge (Deno) y tipos de base de datos.
- `/types`: Definiciones de tipos TypeScript globales.
>>>>>>> release/v2.0-final
