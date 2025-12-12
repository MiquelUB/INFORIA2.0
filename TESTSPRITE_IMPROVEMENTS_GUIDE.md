# 🚀 TestSprite E2E Improvements - Guía de Implementación

## 📋 Overview

Este documento describe las mejoras implementadas basadas en la auditoría de TestSprite realizada el 18 de Noviembre, 2025.

**Branch:** `feature/testsprite-improvements`  
**Status:** En Desarrollo  
**Objetivos:** Resolver URLs hardcodeadas, agregar automatización CI/CD y mejorar cobertura

---

## 🎯 Cambios Implementados

### 1️⃣ Parametrización de URLs (CRÍTICO)

**Problema:** Todas las URLs estaban hardcodeadas en los tests
**Solución:** Archivo `.env.test` + `config.py`

```python
# ❌ ANTES
await page.goto("http://localhost:3001/login")

# ✅ DESPUÉS
from config import config
await page.goto(config.get_url("/login"))
```

**Archivos:**
- `.env.test` - Variables de entorno centralizadas
- `testsprite_tests/config.py` - Cargador de configuración

**Beneficios:**
- ✅ Portabilidad entre ambientes (dev, staging, prod)
- ✅ Fácil cambio de configuración sin tocar código
- ✅ CI/CD ready

---

### 2️⃣ Screenshots Automáticas en Errores

**Problema:** Difícil depurar tests sin conocer el estado visual
**Solución:** Sistema de capturas automáticas

```python
from utils import take_screenshot, take_screenshot_on_error

# Screenshot manual
await take_screenshot(page, "login_page_loaded")

# Screenshot automática en error
try:
    await login_test()
except Exception as e:
    await take_screenshot_on_error(page, "login_test", e)
```

**Archivos:**
- `testsprite_tests/utils.py` - Utilidades de screenshot

**Configuración:**
```
TEST_ENABLE_SCREENSHOTS=true
TEST_SCREENSHOT_DIR=./test-results/screenshots
TEST_ENABLE_VIDEO=false  # Habilitar si es necesario
```

---

### 3️⃣ Validación de Status HTTP

**Problema:** No se validaba que las APIs respondieran correctamente
**Solución:** Clase `HTTPResponseValidator`

```python
from utils import HTTPResponseValidator

await HTTPResponseValidator.validate_status(page, 200)
await HTTPResponseValidator.validate_api_response(
    page,
    endpoint="/api/patients",
    expected_status=200
)
```

---

### 4️⃣ Logging Centralizado

**Problema:** Logs dispersos, difíciles de seguir
**Solución:** Logging estructurado a archivo + consola

```
TEST_LOG_LEVEL=info
TEST_LOG_FILE=./test-results/test.log
```

**Output:**
```
2025-11-18 12:34:56 - root - INFO - ⏱️ Iniciando test: TC001_Login
2025-11-18 12:34:58 - root - INFO - ✓ Screenshot guardada: ./test-results/screenshots/20251118_123456_login_page_loaded.png
2025-11-18 12:35:00 - root - INFO - ✅ Test PASADO: TC001_Login (5.32s)
```

---

### 5️⃣ CI/CD Automatizado (GitHub Actions)

**Problema:** Tests solo se ejecutan manualmente
**Solución:** Workflow automático en GitHub Actions

**Archivo:** `.github/workflows/testsprite-e2e.yml`

**Características:**
- ✅ Ejecuta en cada push a main/login-correcto
- ✅ Ejecuta PRs automáticamente
- ✅ Ejecución programada diaria (2 AM)
- ✅ Genera reportes y comenta en PRs
- ✅ Carga screenshots/videos en caso de fallo

**Trigger:**
```
- Push a main, login-correcto
- Pull Requests a main
- Diariamente a las 2 AM
```

---

### 6️⃣ Test Base Mejorado (Ejemplo)

**Archivo:** `testsprite_tests/EJEMPLO_TEST_MEJORADO.py`

Demuestra cómo usar todas las mejoras juntas:

```python
async def improved_login_test():
    async with TestTimer("TC001_Improved_Login"):
        # URLs parametrizadas
        login_url = config.get_url("/login")
        
        # Validación HTTP
        await HTTPResponseValidator.validate_status(page, 200)
        
        # Screenshots automáticas
        await take_screenshot(page, "login_form_visible")
        
        # Error handling
        try:
            await login()
        except Exception as e:
            await take_screenshot_on_error(page, "TC001", e)
```

---

## 📊 Estructura de Directorios

```
INFORIA2.0/
├── .env.test                          # Variables de entorno
├── .github/workflows/
│   └── testsprite-e2e.yml            # CI/CD Workflow
├── requirements-test.txt              # Dependencias
├── testsprite_tests/
│   ├── config.py                     # ✨ NUEVO: Configuración centralizada
│   ├── utils.py                      # ✨ NUEVO: Utilidades (screenshots, logging)
│   ├── EJEMPLO_TEST_MEJORADO.py      # ✨ NUEVO: Ejemplo de test modernizado
│   ├── TC001_User_sign_up_and_login_with_Supabase_authentication.py
│   ├── TC002_Dashboard_loads_appointments_and_statistics_with_real_time_updates.py
│   └── ... (otros tests)
├── test-results/                      # ✨ NUEVA: Generada automáticamente
│   ├── screenshots/                  # Screenshots de tests
│   ├── videos/                       # Videos de tests (si está habilitado)
│   ├── test.log                      # Logs de ejecución
│   ├── junit.xml                     # Resultados JUnit
│   └── network.har                   # Registro de tráfico de red
└── audit_testsprite.py               # Script de auditoría
```

---

## 🚀 Cómo Usar

### 1. Instalar Dependencias

```bash
pip install -r requirements-test.txt
playwright install chromium
```

### 2. Configurar Variables de Entorno

```bash
# Copiar template
cp .env.test .env.test.local

# Editar según tu entorno
cat > .env.test << EOF
TEST_BASE_URL=http://localhost:3001
TEST_HEADLESS=true
TEST_ENABLE_SCREENSHOTS=true
EOF
```

### 3. Ejecutar Tests Localmente

```bash
# Todos los tests
pytest testsprite_tests/ -v

# Test específico
pytest testsprite_tests/TC001_*.py -v

# Con reporte HTML
pytest testsprite_tests/ -v --html=test-results/report.html

# Mostrar output
pytest testsprite_tests/ -v -s
```

### 4. Ver Resultados

```bash
# Auditoría de cobertura
python audit_testsprite.py

# Revisar logs
cat test-results/test.log

# Abrir screenshots
open test-results/screenshots/  # macOS
xdg-open test-results/screenshots/  # Linux
explorer test-results/screenshots/  # Windows
```

---

## 🔄 Migración de Tests Existentes

Para actualizar un test existente a usar la nueva estructura:

**ANTES:**
```python
import asyncio
from playwright import async_api

async def run_test():
    pw = await async_api.async_playwright().start()
    browser = await pw.chromium.launch(headless=True, args=[...])
    context = await browser.new_context()
    page = await context.new_page()
    
    await page.goto("http://localhost:3001/login", ...)
    # ... test code ...
```

**DESPUÉS:**
```python
import asyncio
from playwright import async_api
from config import config
from utils import TestTimer, take_screenshot, take_screenshot_on_error

async def run_test():
    async with TestTimer("TC001_My_Test"):
        pw = await async_api.async_playwright().start()
        browser = await pw.chromium.launch(
            headless=config.HEADLESS,
            args=[
                f"--window-size={config.VIEWPORT_WIDTH},{config.VIEWPORT_HEIGHT}",
                "--disable-dev-shm-usage"
            ]
        )
        context = await browser.new_context(
            viewport={'width': config.VIEWPORT_WIDTH, 'height': config.VIEWPORT_HEIGHT}
        )
        page = await context.new_page()
        
        await page.goto(config.get_url("/login"), timeout=config.TIMEOUT_LONG)
        await take_screenshot(page, "page_loaded")
        
        try:
            # ... test assertions ...
        except Exception as e:
            await take_screenshot_on_error(page, "TC001", e)
            raise
```

---

## ✅ Checklist de Implementación

### Fase 1: Configuración Base (Completada ✅)
- [x] Crear `.env.test`
- [x] Crear `config.py`
- [x] Crear `utils.py`
- [x] Crear ejemplo mejorado

### Fase 2: CI/CD (En Progreso 🔄)
- [x] Crear workflow GitHub Actions
- [ ] Probar workflow en PR
- [ ] Configurar notificaciones
- [ ] Documentar resultados

### Fase 3: Migración de Tests (Pendiente ⏳)
- [ ] Actualizar TC001-TC015
- [ ] Agregar aserciones HTTP
- [ ] Validar cobertura >80%
- [ ] Pruebas en staging

### Fase 4: Optimizaciones (Futuro 🔮)
- [ ] Performance tests
- [ ] API contract testing
- [ ] Visual regression testing
- [ ] Accesibilidad (a11y)

---

## 📈 Métricas Esperadas

**Antes de Mejoras:**
```
Cobertura: 77.5%
URLs Hardcodeadas: 100%
CI/CD: Ninguno
Screenshots: No
Reporte: Manual
```

**Después de Mejoras:**
```
Cobertura: >80% (objetivo 85%)
URLs Parametrizadas: 100%
CI/CD: Automático (GitHub Actions)
Screenshots: Automáticas en errores
Reporte: Automático en cada ejecución
```

---

## 🆘 Troubleshooting

### Error: "Cannot find module 'config'"
```python
# Asegúrate que estés ejecutando desde el directorio correcto
cd testsprite_tests
python -m pytest .
```

### Error: "Port 3001 already in use"
```bash
# Encuentra y mata el proceso
lsof -i :3001
kill -9 <PID>
```

### Screenshots no se guardan
```bash
# Verifica permisos
mkdir -p test-results/screenshots
chmod 755 test-results

# Valida configuración
grep TEST_ENABLE_SCREENSHOTS .env.test
```

### GitHub Actions falla con Playwright
```yaml
# En workflow, instala browsers:
- run: playwright install chromium
```

---

## 📚 Referencias

- [Playwright Documentation](https://playwright.dev/)
- [Pytest Documentation](https://docs.pytest.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AUDITORIA_TESTSPRITE_COMPLETA.md](./AUDITORIA_TESTSPRITE_COMPLETA.md)

---

## 👥 Contributing

Para contribuir mejoras:

1. Crear branch desde `feature/testsprite-improvements`
2. Implementar mejoras
3. Actualizar tests
4. Crear Pull Request
5. Revisar resultados de CI/CD

---

**Status:** ✅ En Implementación  
**Última Actualización:** 18 Noviembre, 2025  
**Próxima Review:** 25 Noviembre, 2025
