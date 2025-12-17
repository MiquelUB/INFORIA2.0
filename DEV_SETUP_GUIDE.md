# 🚀 Guía de Configuración del Entorno de Desarrollo - INFORIA 2.0

**Fecha de configuración**: 2025-12-17  
**Proyecto**: INFORIA 2.0 - SaaS para Psicólogos  
**Stack**: Next.js 14 + TypeScript + Tailwind CSS + Supabase

---

## ✅ Resumen de Instalación

Se han instalado **16 extensiones** y configurado **6 archivos** de workspace para optimizar tu flujo de trabajo.

---

## 📦 Extensiones Instaladas

### **React/Next.js**
- ✅ `dsznajder.es7-react-js-snippets` - Snippets para React
- ✅ `bradlc.vscode-tailwindcss` - IntelliSense para Tailwind CSS

### **Formateo y Linting**
- ✅ `esbenp.prettier-vscode` - Formateador de código
- ✅ `dbaeumer.vscode-eslint` - Linter JavaScript/TypeScript

### **TypeScript**
- ✅ `mattpocock.ts-error-translator` - Traduce errores de TypeScript

### **Python**
- ✅ `ms-python.python` - Soporte completo para Python
- ✅ `ms-python.vscode-pylance` - IntelliSense avanzado
- ✅ `ms-python.black-formatter` - Formateador Black
- ✅ `ms-python.isort` - Ordenador de imports
- ✅ `charliermarsh.ruff` - Linter ultra-rápido
- ✅ `ms-toolsai.jupyter` - Notebooks Jupyter

### **Productividad**
- ✅ `eamodio.gitlens` - Superpoderes para Git
- ✅ `usernamehw.errorlens` - Errores inline
- ✅ `formulahendry.auto-rename-tag` - Renombrado automático de tags
- ✅ `christian-kohler.path-intellisense` - Autocompletado de rutas
- ✅ `wallabyjs.console-ninja` - Console.log en el editor

---

## 📁 Archivos de Configuración Creados

### **`.vscode/settings.json`**
Configuración completa del workspace:
- ✨ Formateo automático con Prettier al guardar
- ✨ Auto-fix de ESLint al guardar
- ✨ Organización automática de imports
- ✨ Soporte para Tailwind CSS (cva, cn)
- ✨ Configuración de Python con Black
- ✨ Exclusión de archivos innecesarios
- ✨ Reglas de 80 y 120 caracteres

### **`.vscode/extensions.json`**
Lista de extensiones recomendadas para el equipo.

### **`.vscode/launch.json`**
Configuraciones de debugging:
- 🐛 **Next.js Server-side** - Debug del servidor
- 🐛 **Next.js Client-side** - Debug en Chrome
- 🐛 **Next.js Full Stack** - Debug completo
- 🐛 **Python: Current File** - Debug de archivos Python
- 🐛 **Python: Debug Tests** - Debug de tests con pytest

### **`.vscode/tasks.json`**
Tareas automatizadas (Ctrl+Shift+P → Tasks: Run Task):
- ⚡ **Dev Server** (Ctrl+Shift+B) - Inicia `npm run dev`
- ⚡ **Build Production** - Compila para producción
- ⚡ **Lint** - Ejecuta ESLint
- ⚡ **Type Check** - Verifica tipos TypeScript
- ⚡ **Clean Build** - Limpia `.next` y reconstruye

### **`.vscode/nextjs.code-snippets`**
Snippets personalizados para Next.js:
- `nsc` → Next.js Server Component
- `ncc` → Next.js Client Component
- `napi` → Next.js API Route
- `saction` → Supabase Server Action
- `ush` → useState con TypeScript
- `ueh` → useEffect con cleanup

### **`.vscode/README.md`**
Documentación de la configuración del workspace.

---

## 🎯 Atajos de Teclado Útiles

### **Generales**
- `Ctrl+Shift+P` - Paleta de comandos
- `Ctrl+P` - Búsqueda rápida de archivos
- `Ctrl+Shift+F` - Buscar en todos los archivos
- `Ctrl+B` - Toggle sidebar
- `Ctrl+J` - Toggle terminal

### **Edición**
- `Alt+↑/↓` - Mover línea arriba/abajo
- `Shift+Alt+↑/↓` - Duplicar línea arriba/abajo
- `Ctrl+D` - Seleccionar siguiente ocurrencia
- `Ctrl+Shift+L` - Seleccionar todas las ocurrencias
- `Ctrl+/` - Comentar/descomentar línea

### **Debugging**
- `F5` - Iniciar debugging
- `F9` - Toggle breakpoint
- `F10` - Step over
- `F11` - Step into
- `Shift+F11` - Step out

### **Tareas**
- `Ctrl+Shift+B` - Ejecutar tarea de build (Dev Server)
- `Ctrl+Shift+P` → "Tasks: Run Task" - Ver todas las tareas

---

## 🔧 Verificación del Entorno

Para verificar que todo está correctamente configurado, ejecuta:

```powershell
.\verify-dev-setup.ps1
```

Este script verificará:
- ✅ Extensiones instaladas
- ✅ Archivos de configuración
- ✅ Node.js y npm
- ✅ Python

---

## 🎨 Configuración de Prettier

El proyecto usa las siguientes reglas de Prettier:
- **Comillas**: Dobles (`"`)
- **Punto y coma**: Sí (`;`)
- **Tab width**: 2 espacios
- **Trailing comma**: ES5

---

## 🐍 Configuración de Python

### **Formateador**: Black
```bash
pip install black
```

### **Linter**: Ruff (ultra-rápido)
```bash
pip install ruff
```

### **Ordenador de imports**: isort
```bash
pip install isort
```

### **Testing**: pytest
```bash
pip install pytest
```

---

## 🚀 Flujo de Trabajo Recomendado

### **1. Iniciar el servidor de desarrollo**
```powershell
npm run dev
# O presiona Ctrl+Shift+B
```

### **2. Crear un nuevo componente**
- Escribe `nsc` o `ncc` y presiona Tab
- Completa el nombre del componente
- ¡Listo!

### **3. Debugging**
- Presiona `F5`
- Selecciona la configuración de debug
- Coloca breakpoints con `F9`

### **4. Antes de hacer commit**
```powershell
# Verificar tipos
npm run type-check

# Ejecutar linter
npm run lint

# Compilar
npm run build
```

---

## 📚 Recursos Adicionales

### **Next.js**
- [Documentación oficial](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)

### **TypeScript**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Matt Pocock's TypeScript Tips](https://www.totaltypescript.com/)

### **Tailwind CSS**
- [Documentación oficial](https://tailwindcss.com/docs)
- [Tailwind UI](https://tailwindui.com/)

### **Supabase**
- [Documentación oficial](https://supabase.com/docs)
- [Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

---

## 🔄 Actualización de Extensiones

Para mantener las extensiones actualizadas:

```powershell
code --update-extensions
```

---

## 💡 Tips Adicionales

1. **Error Lens** mostrará errores directamente en el código
2. **GitLens** te permite ver quién modificó cada línea
3. **Console Ninja** muestra los `console.log` en el editor
4. **Path Intellisense** autocompleta rutas de archivos
5. Los snippets personalizados están disponibles con prefijos cortos

---

## 🆘 Solución de Problemas

### **Prettier no formatea al guardar**
1. Verifica que `esbenp.prettier-vscode` esté instalado
2. Abre la paleta de comandos (Ctrl+Shift+P)
3. Busca "Format Document With..."
4. Selecciona "Prettier"

### **ESLint no muestra errores**
1. Verifica que `dbaeumer.vscode-eslint` esté instalado
2. Abre la paleta de comandos
3. Busca "ESLint: Restart ESLint Server"

### **TypeScript no reconoce los paths @/**
1. Verifica que `typescript.tsdk` apunte a `node_modules/typescript/lib`
2. Reinicia el servidor TypeScript: Ctrl+Shift+P → "TypeScript: Restart TS Server"

---

## ✨ ¡Listo para Desarrollar!

Tu entorno de desarrollo está completamente configurado y optimizado para trabajar con **INFORIA 2.0**.

**Próximos pasos**:
1. Reinicia VS Code para aplicar todos los cambios
2. Ejecuta `npm run dev` para iniciar el servidor
3. ¡Empieza a codear! 🚀

---

**Configurado por**: Gemini AI Agent  
**Fecha**: 2025-12-17  
**Versión**: 1.0
