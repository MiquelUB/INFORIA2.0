# 📦 Guía de Node.js - INFORIA 2.0

**Node.js Version**: v22.18.0  
**npm Version**: v11.6.2  
**Fecha**: 2025-12-17

---

## 🎯 Extensiones Node.js Instaladas

### **NPM** (2)
- ✅ `christian-kohler.npm-intellisense` - Autocompletado de paquetes npm
- ✅ `eg2.vscode-npm-script` - Ejecutar scripts npm desde VS Code

### **Análisis** (1)
- ✅ `wix.vscode-import-cost` - Muestra el tamaño de los imports

### **Utilidades** (4)
- ✅ `mikestead.dotenv` - Soporte para archivos .env
- ✅ `editorconfig.editorconfig` - Configuración de editor
- ✅ `visualstudioexptteam.vscodeintellicode` - IA para autocompletado
- ✅ `github.copilot` - Asistente de código con IA

---

## 📦 Gestión de Paquetes

### **package.json - INFORIA 2.0**

```json
{
  "name": "inforia-2.0",
  "version": "2.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "clean": "rm -rf .next node_modules",
    "reinstall": "npm run clean && npm install",
    "analyze": "ANALYZE=true npm run build"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@supabase/ssr": "^0.5.0",
    "@supabase/supabase-js": "^2.45.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.6.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "prettier": "^3.3.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  },
  "engines": {
    "node": ">=22.0.0",
    "npm": ">=11.0.0"
  }
}
```

---

## 🔧 Comandos NPM Útiles

### **Instalación**

```powershell
# Instalar todas las dependencias
npm install

# Instalar dependencia de producción
npm install <package>

# Instalar dependencia de desarrollo
npm install -D <package>

# Instalar versión específica
npm install <package>@<version>

# Instalar globalmente
npm install -g <package>

# Instalar desde GitHub
npm install <user>/<repo>
```

### **Actualización**

```powershell
# Ver paquetes desactualizados
npm outdated

# Actualizar paquete específico
npm update <package>

# Actualizar todos los paquetes
npm update

# Actualizar a última versión (breaking changes)
npm install <package>@latest

# Actualizar npm
npm install -g npm@latest
```

### **Desinstalación**

```powershell
# Desinstalar paquete
npm uninstall <package>

# Desinstalar paquete de desarrollo
npm uninstall -D <package>

# Desinstalar paquete global
npm uninstall -g <package>
```

### **Scripts**

```powershell
# Ejecutar script
npm run <script-name>

# Listar scripts disponibles
npm run

# Ejecutar múltiples scripts en paralelo
npm run dev & npm run test

# Ejecutar scripts en secuencia
npm run build && npm run start
```

### **Información**

```powershell
# Ver información del paquete
npm info <package>

# Ver versiones disponibles
npm view <package> versions

# Ver dependencias de un paquete
npm view <package> dependencies

# Ver árbol de dependencias
npm list

# Ver árbol de dependencias (solo nivel 1)
npm list --depth=0

# Ver paquetes globales instalados
npm list -g --depth=0
```

### **Limpieza**

```powershell
# Limpiar cache
npm cache clean --force

# Verificar cache
npm cache verify

# Eliminar node_modules
Remove-Item -Recurse -Force node_modules

# Reinstalar desde cero
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

### **Seguridad**

```powershell
# Auditar vulnerabilidades
npm audit

# Corregir vulnerabilidades
npm audit fix

# Corregir vulnerabilidades (forzado)
npm audit fix --force

# Ver reporte detallado
npm audit --json
```

### **Publicación** (si aplica)

```powershell
# Login a npm
npm login

# Publicar paquete
npm publish

# Publicar con tag
npm publish --tag beta

# Despublicar (dentro de 72 horas)
npm unpublish <package>@<version>
```

---

## 🎨 NPM Scripts Personalizados

### **Scripts de Desarrollo**

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:turbo": "next dev --turbo",
    "dev:debug": "NODE_OPTIONS='--inspect' next dev",
    "dev:https": "next dev --experimental-https"
  }
}
```

### **Scripts de Build**

```json
{
  "scripts": {
    "build": "next build",
    "build:analyze": "ANALYZE=true next build",
    "build:profile": "next build --profile",
    "build:debug": "next build --debug"
  }
}
```

### **Scripts de Testing**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test"
  }
}
```

### **Scripts de Calidad de Código**

```json
{
  "scripts": {
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit"
  }
}
```

### **Scripts de Limpieza**

```json
{
  "scripts": {
    "clean": "rm -rf .next out",
    "clean:all": "rm -rf .next out node_modules",
    "reinstall": "npm run clean:all && npm install"
  }
}
```

---

## 📊 Import Cost

La extensión **Import Cost** muestra el tamaño de tus imports en tiempo real.

### **Configuración**

```json
{
  "importCost.showCalculatingDecoration": true,
  "importCost.smallPackageSize": 50,
  "importCost.mediumPackageSize": 100,
  "importCost.largePackageColor": "#d44e40",
  "importCost.mediumPackageColor": "#d4a640",
  "importCost.smallPackageColor": "#40d4a6"
}
```

### **Ejemplo de Uso**

```typescript
import React from 'react'; // 6.3 KB (gzipped: 2.5 KB)
import { Button } from '@/components/ui/button'; // 1.2 KB
import lodash from 'lodash'; // ⚠️ 72.5 KB (gzipped: 25 KB)
import { debounce } from 'lodash'; // ✅ 2.1 KB
```

**Tip**: Importa solo lo que necesitas para reducir el bundle size.

---

## 🔍 NPM IntelliSense

Autocompletado inteligente de paquetes npm en:
- `package.json`
- `import` statements
- `require()` statements

### **Ejemplo**

```typescript
// Escribe "import { " y verás sugerencias de exports del paquete
import { createClient } from '@supabase/supabase-js';
```

---

## 📝 .npmrc

Configuración de npm en el proyecto:

```ini
# .npmrc
save-exact=true
engine-strict=true
legacy-peer-deps=false
fund=false
audit=true
```

---

## 🔐 Variables de Entorno

### **.env.local**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Resend
RESEND_API_KEY=your_resend_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Cargar variables de entorno**

```typescript
// lib/env.ts
export const env = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY!,
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL!,
  },
};
```

---

## 🚀 Optimización de Node.js

### **Aumentar memoria de Node.js**

```json
{
  "scripts": {
    "dev": "NODE_OPTIONS='--max-old-space-size=4096' next dev",
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

### **Habilitar source maps en producción**

```json
{
  "scripts": {
    "build": "GENERATE_SOURCEMAP=true next build"
  }
}
```

### **Análisis de bundle**

```powershell
# Instalar
npm install -D @next/bundle-analyzer

# Configurar en next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // ... tu configuración
})

# Ejecutar
ANALYZE=true npm run build
```

---

## 📚 Recursos

### **Documentación Oficial**
- [Node.js Docs](https://nodejs.org/docs/)
- [npm Docs](https://docs.npmjs.com/)
- [Next.js Docs](https://nextjs.org/docs)

### **Herramientas Útiles**
- [npm trends](https://npmtrends.com/) - Comparar paquetes
- [Bundlephobia](https://bundlephobia.com/) - Tamaño de paquetes
- [npm.devtool.tech](https://npm.devtool.tech/) - Explorador de paquetes

---

## 💡 Tips y Mejores Prácticas

1. **Usa `npm ci`** en CI/CD en lugar de `npm install`
2. **Commitea `package-lock.json`** para builds reproducibles
3. **Revisa el tamaño de los imports** con Import Cost
4. **Audita regularmente** con `npm audit`
5. **Usa versiones exactas** en producción
6. **Mantén Node.js actualizado** a versiones LTS
7. **Usa `.nvmrc`** para especificar la versión de Node.js

---

## 🔄 Actualización de Node.js

### **Verificar versión actual**

```powershell
node --version
npm --version
```

### **Actualizar npm**

```powershell
npm install -g npm@latest
```

### **Usar nvm (Node Version Manager)**

```powershell
# Instalar nvm para Windows
# https://github.com/coreybutler/nvm-windows

# Listar versiones disponibles
nvm list available

# Instalar versión específica
nvm install 22.18.0

# Usar versión específica
nvm use 22.18.0

# Ver versión actual
nvm current
```

---

**Última actualización**: 2025-12-17
