# ⚡ Comandos Útiles - INFORIA 2.0

Colección de comandos frecuentes para el desarrollo de INFORIA 2.0.

---

## 🚀 Desarrollo

### Iniciar servidor de desarrollo
```powershell
npm run dev
```

### Compilar para producción
```powershell
npm run build
```

### Iniciar en modo producción
```powershell
npm start
```

### Limpiar y reconstruir
```powershell
Remove-Item -Recurse -Force .next
npm run build
```

---

## 🧹 Limpieza

### Limpiar cache de Next.js
```powershell
Remove-Item -Recurse -Force .next
```

### Limpiar node_modules y reinstalar
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### Limpiar cache de npm
```powershell
npm cache clean --force
```

### Limpieza completa
```powershell
Remove-Item -Recurse -Force .next, node_modules
npm cache clean --force
npm install
```

---

## 🔍 Linting y Formateo

### Ejecutar ESLint
```powershell
npm run lint
```

### Ejecutar ESLint y auto-fix
```powershell
npx eslint . --fix
```

### Formatear con Prettier
```powershell
npx prettier --write .
```

### Verificar tipos TypeScript
```powershell
npx tsc --noEmit
```

---

## 🐍 Python

### Crear entorno virtual
```powershell
python -m venv venv
```

### Activar entorno virtual
```powershell
.\venv\Scripts\Activate.ps1
```

### Instalar dependencias
```powershell
pip install -r requirements.txt
```

### Formatear con Black
```powershell
black .
```

### Ejecutar tests
```powershell
pytest -v
```

### Ejecutar script específico
```powershell
python check_patients_table.py
```

---

## 🗄️ Supabase

### Iniciar Supabase localmente
```powershell
npx supabase start
```

### Detener Supabase local
```powershell
npx supabase stop
```

### Ver estado de Supabase
```powershell
npx supabase status
```

### Generar tipos TypeScript
```powershell
npx supabase gen types typescript --local > lib/supabase/database.types.ts
```

### Ejecutar migraciones
```powershell
npx supabase db push
```

### Reset base de datos local
```powershell
npx supabase db reset
```

---

## 📦 Gestión de Dependencias

### Instalar nueva dependencia
```powershell
npm install <package-name>
```

### Instalar dependencia de desarrollo
```powershell
npm install -D <package-name>
```

### Actualizar dependencias
```powershell
npm update
```

### Ver dependencias desactualizadas
```powershell
npm outdated
```

### Auditar seguridad
```powershell
npm audit
```

### Corregir vulnerabilidades
```powershell
npm audit fix
```

---

## 🔧 Git

### Ver estado
```powershell
git status
```

### Crear nueva rama
```powershell
git checkout -b feature/nombre-feature
```

### Commit con mensaje
```powershell
git add .
git commit -m "mensaje del commit"
```

### Push a remote
```powershell
git push origin nombre-rama
```

### Pull desde main
```powershell
git pull origin main
```

### Merge desde main
```powershell
git checkout main
git pull
git checkout tu-rama
git merge main
```

### Ver historial
```powershell
git log --oneline --graph --all
```

---

## 🚢 Vercel

### Desplegar a preview
```powershell
npx vercel
```

### Desplegar a producción
```powershell
npx vercel --prod
```

### Ver logs
```powershell
npx vercel logs
```

### Ver variables de entorno
```powershell
npx vercel env ls
```

---

## 🔍 Debugging

### Ver logs de Next.js
```powershell
npm run dev -- --turbo
```

### Analizar bundle
```powershell
npm run build
npx @next/bundle-analyzer
```

### Ver variables de entorno
```powershell
Get-Content .env.local
```

---

## 📊 Análisis

### Contar líneas de código
```powershell
Get-ChildItem -Recurse -Include *.tsx,*.ts,*.jsx,*.js | 
  Get-Content | 
  Measure-Object -Line
```

### Buscar en archivos
```powershell
Get-ChildItem -Recurse -Include *.tsx,*.ts | 
  Select-String "texto a buscar"
```

### Ver tamaño de carpetas
```powershell
Get-ChildItem | 
  Where-Object { $_.PSIsContainer } | 
  ForEach-Object { 
    [PSCustomObject]@{
      Name = $_.Name
      Size = "{0:N2} MB" -f ((Get-ChildItem $_.FullName -Recurse | 
        Measure-Object -Property Length -Sum).Sum / 1MB)
    }
  } | 
  Sort-Object Size -Descending
```

---

## 🧪 Testing

### Ejecutar tests (si configurado)
```powershell
npm test
```

### Ejecutar tests en modo watch
```powershell
npm test -- --watch
```

### Ejecutar tests con coverage
```powershell
npm test -- --coverage
```

---

## 🔐 Seguridad

### Verificar variables de entorno
```powershell
# Verificar que existan las variables críticas
if (!(Test-Path .env.local)) {
  Write-Host "⚠️ Archivo .env.local no encontrado" -ForegroundColor Red
} else {
  Write-Host "✅ Archivo .env.local encontrado" -ForegroundColor Green
}
```

### Generar nueva clave secreta
```powershell
# Para JWT o similar
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📝 Notas

- Usa `Ctrl+C` para detener procesos en ejecución
- Los comandos con `npx` ejecutan paquetes sin instalarlos globalmente
- Siempre verifica estar en la rama correcta antes de hacer commits
- Ejecuta `npm run build` antes de hacer push a main

---

## 🆘 Comandos de Emergencia

### Servidor no inicia
```powershell
# 1. Matar procesos en puerto 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# 2. Limpiar todo
Remove-Item -Recurse -Force .next, node_modules
npm cache clean --force
npm install
npm run dev
```

### Error de TypeScript
```powershell
# Reiniciar servidor TypeScript en VS Code
# Ctrl+Shift+P → "TypeScript: Restart TS Server"

# O limpiar cache
Remove-Item -Recurse -Force tsconfig.tsbuildinfo
```

### Error de dependencias
```powershell
# Reinstalar desde cero
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

---

**Última actualización**: 2025-12-17
