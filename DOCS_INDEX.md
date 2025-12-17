# 📚 Índice de Documentación - INFORIA 2.0

**Última actualización**: 2025-12-17  
**Versión del entorno**: 1.0 (Completo con Node.js y DevOps)

---

## 🎯 Inicio Rápido

Si eres nuevo en el proyecto, empieza aquí:

1. **[SETUP_SUMMARY.md](./SETUP_SUMMARY.md)** ⭐
   - Resumen ejecutivo de toda la configuración
   - Lista completa de 29 extensiones instaladas
   - Estadísticas y próximos pasos
   - **Tiempo de lectura**: 5 minutos

2. **[DEV_SETUP_GUIDE.md](./DEV_SETUP_GUIDE.md)** ⭐
   - Guía completa de configuración del entorno
   - Atajos de teclado esenciales
   - Flujo de trabajo recomendado
   - Solución de problemas comunes
   - **Tiempo de lectura**: 15 minutos

---

## 📖 Guías por Tecnología

### **Node.js y NPM**
- **[NODEJS_GUIDE.md](./NODEJS_GUIDE.md)** 🆕
  - Gestión de paquetes npm
  - Scripts personalizados
  - Import Cost y optimización
  - Variables de entorno
  - Comandos npm útiles
  - **Tiempo de lectura**: 10 minutos

### **DevOps y Contenedores**
- **[DEVOPS_GUIDE.md](./DEVOPS_GUIDE.md)** 🆕
  - Dockerfile para Next.js
  - Docker Compose
  - Kubernetes manifests
  - GitHub Actions workflows
  - Terraform configuration
  - Health checks y monitoreo
  - **Tiempo de lectura**: 20 minutos

### **Comandos Útiles**
- **[COMANDOS_UTILES.md](./COMANDOS_UTILES.md)**
  - Comandos de desarrollo
  - Comandos de limpieza
  - Comandos de debugging
  - Comandos de Git
  - Comandos de Vercel
  - Comandos de emergencia
  - **Tiempo de lectura**: 8 minutos

---

## 🔧 Configuración del Workspace

### **Archivos en `.vscode/`**

1. **[.vscode/settings.json](./.vscode/settings.json)**
   - Configuración completa del editor
   - Formateo automático
   - Configuración de TypeScript, Python, Node.js
   - Soporte para Docker, YAML, Terraform
   - Import Cost, Spell Checker, TODO Tree

2. **[.vscode/extensions.json](./.vscode/extensions.json)**
   - Lista de 29 extensiones recomendadas
   - Organizadas por categoría

3. **[.vscode/launch.json](./.vscode/launch.json)**
   - Configuraciones de debugging
   - Next.js (server, client, full stack)
   - Python (current file, tests)

4. **[.vscode/tasks.json](./.vscode/tasks.json)**
   - Tareas automatizadas
   - Dev Server, Build, Lint, Type Check

5. **[.vscode/nextjs.code-snippets](./.vscode/nextjs.code-snippets)**
   - 6 snippets personalizados para Next.js
   - `nsc`, `ncc`, `napi`, `saction`, `ush`, `ueh`

6. **[.vscode/README.md](./.vscode/README.md)**
   - Documentación de la configuración del workspace

---

## 🛠️ Scripts y Herramientas

### **Scripts de Verificación**
- **[verify-dev-setup.ps1](./verify-dev-setup.ps1)**
  - Verifica extensiones instaladas
  - Verifica archivos de configuración
  - Verifica herramientas (Node.js, npm, Python, Git)
  - Verifica documentación
  - **Ejecución**: `.\verify-dev-setup.ps1`

---

## 📋 Documentación del Proyecto

### **Configuración y Setup**
- **[ENV_SETUP.md](./ENV_SETUP.md)**
  - Variables de entorno necesarias
  - Configuración de Supabase
  - Configuración de servicios externos

### **Arquitectura y Flujos**
- **[GEMINI.md](./GEMINI.md)**
  - Contexto del proyecto para el agente Gemini
  - Arquitectura del sistema
  - Decisiones técnicas

- **[FLUJO_NAVEGACION.md](./FLUJO_NAVEGACION.md)**
  - Flujo de navegación de la aplicación
  - Rutas y páginas

- **[ESTRUCTURA_RUTAS_WORKSPACE.md](./ESTRUCTURA_RUTAS_WORKSPACE.md)**
  - Estructura de rutas del workspace
  - Organización de archivos

---

## 🎯 Guías por Caso de Uso

### **Si quieres...**

#### **Empezar a desarrollar**
1. Lee [SETUP_SUMMARY.md](./SETUP_SUMMARY.md)
2. Ejecuta `.\verify-dev-setup.ps1`
3. Ejecuta `npm run dev`
4. Consulta [COMANDOS_UTILES.md](./COMANDOS_UTILES.md) según necesites

#### **Configurar el entorno desde cero**
1. Lee [DEV_SETUP_GUIDE.md](./DEV_SETUP_GUIDE.md)
2. Instala las extensiones desde `.vscode/extensions.json`
3. Ejecuta `.\verify-dev-setup.ps1`

#### **Trabajar con Node.js y npm**
1. Lee [NODEJS_GUIDE.md](./NODEJS_GUIDE.md)
2. Consulta la sección de comandos npm
3. Usa Import Cost para optimizar imports

#### **Configurar Docker y CI/CD**
1. Lee [DEVOPS_GUIDE.md](./DEVOPS_GUIDE.md)
2. Crea el Dockerfile según la guía
3. Configura GitHub Actions workflows

#### **Resolver un problema**
1. Consulta "Solución de Problemas" en [DEV_SETUP_GUIDE.md](./DEV_SETUP_GUIDE.md)
2. Ejecuta `.\verify-dev-setup.ps1` para diagnosticar
3. Consulta [COMANDOS_UTILES.md](./COMANDOS_UTILES.md) para comandos de emergencia

---

## 📊 Mapa de Documentación

```
INFORIA2.0/
│
├── 📚 DOCUMENTACIÓN PRINCIPAL
│   ├── SETUP_SUMMARY.md          ⭐ Resumen ejecutivo
│   ├── DEV_SETUP_GUIDE.md        ⭐ Guía completa
│   ├── NODEJS_GUIDE.md           🆕 Node.js y npm
│   ├── DEVOPS_GUIDE.md           🆕 Docker, K8s, CI/CD
│   └── COMANDOS_UTILES.md        📝 Comandos frecuentes
│
├── 🔧 CONFIGURACIÓN
│   ├── .vscode/
│   │   ├── settings.json
│   │   ├── extensions.json
│   │   ├── launch.json
│   │   ├── tasks.json
│   │   ├── nextjs.code-snippets
│   │   └── README.md
│   └── verify-dev-setup.ps1
│
└── 📖 DOCUMENTACIÓN DEL PROYECTO
    ├── ENV_SETUP.md
    ├── GEMINI.md
    ├── FLUJO_NAVEGACION.md
    └── ESTRUCTURA_RUTAS_WORKSPACE.md
```

---

## 🔍 Búsqueda Rápida

### **Por Tema**

| Tema | Archivo | Sección |
|------|---------|---------|
| Extensiones instaladas | SETUP_SUMMARY.md | Extensiones Instaladas |
| Atajos de teclado | DEV_SETUP_GUIDE.md | Atajos de Teclado Útiles |
| Comandos npm | NODEJS_GUIDE.md | Comandos NPM Útiles |
| Comandos Docker | DEVOPS_GUIDE.md | Docker |
| Debugging | DEV_SETUP_GUIDE.md | Debugging |
| Snippets | SETUP_SUMMARY.md | Snippets Personalizados |
| Variables de entorno | NODEJS_GUIDE.md | Variables de Entorno |
| CI/CD | DEVOPS_GUIDE.md | GitHub Actions |
| Kubernetes | DEVOPS_GUIDE.md | Kubernetes |
| Terraform | DEVOPS_GUIDE.md | Terraform |
| Solución de problemas | DEV_SETUP_GUIDE.md | Solución de Problemas |

---

## 📈 Estadísticas de Documentación

- **Total de archivos de documentación**: 13
- **Tamaño total**: ~110 KB
- **Tiempo total de lectura**: ~70 minutos
- **Guías principales**: 5
- **Archivos de configuración**: 6
- **Scripts**: 1

---

## 🆕 Últimas Actualizaciones

### **2025-12-17**
- ✅ Añadida **NODEJS_GUIDE.md** (12.5 KB)
- ✅ Añadida **DEVOPS_GUIDE.md** (15.8 KB)
- ✅ Actualizado **SETUP_SUMMARY.md** con 29 extensiones
- ✅ Actualizado **verify-dev-setup.ps1** con nuevas verificaciones
- ✅ Añadidas 12 nuevas extensiones (Node.js + DevOps)

---

## 💡 Tips de Navegación

1. **Usa Ctrl+P** en VS Code para buscar archivos rápidamente
2. **Usa Ctrl+F** dentro de cada archivo para buscar contenido
3. **Los archivos con ⭐** son los más importantes
4. **Los archivos con 🆕** son nuevos en esta versión
5. **Todos los archivos están en formato Markdown** para fácil lectura

---

## 🆘 ¿Necesitas Ayuda?

1. **Problema con extensiones**: Ejecuta `.\verify-dev-setup.ps1`
2. **Problema con npm**: Consulta [NODEJS_GUIDE.md](./NODEJS_GUIDE.md)
3. **Problema con Docker**: Consulta [DEVOPS_GUIDE.md](./DEVOPS_GUIDE.md)
4. **Problema general**: Consulta [DEV_SETUP_GUIDE.md](./DEV_SETUP_GUIDE.md)

---

**¡Toda la documentación está lista para consultar! 📚**

---

_Índice creado el 2025-12-17 por Gemini AI Agent_
