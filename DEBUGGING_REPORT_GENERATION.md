# 🔍 Guía de Debugging: Botón "Generar Informe" No Funciona

## 📋 Checklist de Diagnóstico

### 1. **Verificar Consola del Navegador**
Abre DevTools (F12 o Right-click > Inspect > Console) y **sigue estos pasos exactos**:

```javascript
// 1. El botón está deshabilitado? Verifica:
// - ¿Dice "Generando Informe..."?
//   → Sí = El sistema está funcionando, espera a que termine
//   → No = Continúa al paso 2

// 2. ¿Ves algún mensaje de error rojo?
// Si ves mensajes como:
//   "Por favor proporciona contenido para el informe"
//   "Por favor selecciona un paciente"
//   "No tienes créditos disponibles"
// → Revisa la sección "Validaciones Iniciales" abajo
```

### 2. **Checklist Pre-Generación**

Antes de hacer click en "Generar Informe", verifica:

- ✅ **Paciente seleccionado**
  - Debes estar en una sesión de un paciente específico
  - Si no ves el nombre del paciente en la parte superior, no está cargado

- ✅ **Al menos UNO de estos campos debe tener contenido:**
  - ✏️ Notas Clínicas (texto escrito)
  - 🎤 Transcripción (audio grabado y transcrito)
  - 📎 Archivos Subidos (audio, texto, PDF, etc.)

- ✅ **Créditos Disponibles**
  - Vá a "Mi Cuenta" y verifica que tienes créditos restantes
  - Si tienes 0 créditos = NO puedes generar más informes

- ✅ **Google Drive Conectado (Recomendado)**
  - Si no iniciaste sesión con Google OAuth, los informes se guardan localmente
  - No es bloqueante, pero se recomienda

### 3. **Validaciones Iniciales - Causas Comunes**

| Mensaje de Error | Causa | Solución |
|-----------------|-------|----------|
| "Por favor selecciona un paciente" | Paciente no cargado | Vuelve al dashboard y re-abre la sesión |
| "Por favor proporciona contenido para el informe" | Todos los campos vacíos | Escribe notas O graba audio O sube archivos |
| "Exceso de contexto: Máximo 5 archivos permitidos" | Demasiados archivos | Máximo 5 archivos por informe |
| "Exceso de contexto: El volumen de texto supera el límite" | Texto muy largo (>100,000 caracteres) | Divide en múltiples informes |
| "No tienes créditos disponibles" | Sin créditos | Compra un plan de créditos |

### 4. **Espera a la Fase de Procesamiento**

Cuando haces click en "Generar Informe", pasa por estas fases:

```
1️⃣ ANÁLISIS DE ARCHIVOS (si hay)
   └─ Transcribe audios subidos
   └─ Lee archivos de texto
   └─ Toma referencia de otros archivos
   ⏱️ Tiempo: 10-30 segundos por archivo

2️⃣ VERIFICACIÓN DE CONTENIDO
   └─ Comprueba que hay suficiente contexto
   ⏱️ Tiempo: 1-2 segundos

3️⃣ GENERACIÓN CON IA
   └─ OpenRouter genera el informe
   ⏱️ Tiempo: 20-60 segundos (depende de modelo)

4️⃣ GUARDADO EN DRIVE
   └─ Sube a Google Drive (si está conectado)
   ⏱️ Tiempo: 5-15 segundos

5️⃣ GUARDADO EN BASE DE DATOS
   └─ Registra en la base de datos
   ⏱️ Tiempo: 2-5 segundos
```

**TOTAL: 40-120 segundos**

⚠️ **NO hagas click múltiples veces** - Espera a que aparezca el mensaje de éxito verde

### 5. **Revisar la Consola para Errores**

Abre DevTools (F12) → Console y busca mensajes que empiezan con:

- ❌ **"❌ Error:"** - Error fatal
- ⚠️ **"⚠️"** - Advertencia (no bloquea)
- ✅ **"✅"** - Éxito

**Copia TODO lo que veas y comparte con soporte** si hay errores.

### 6. **Problemas Específicos y Soluciones**

#### **Problema: "Error transcribiendo archivo de audio"**
```
Causa: OpenAI Whisper no disponible o archivo corrupto
Solución:
  1. Verifica que el archivo MP3/WAV sea válido
  2. Intenta sin archivos, solo con notas o audio grabado
  3. Prueba con un archivo más pequeño (<50MB)
```

#### **Problema: "OpenRouter no disponible"**
```
Causa: Clave de API no configurada o limitada
Solución:
  1. Verifica que NEXT_PUBLIC_OPENROUTER_API_KEY esté en .env.local
  2. Verifica que tengas créditos en OpenRouter (si usas créditos compartidos)
  3. Intenta de nuevo en unos segundos
```

#### **Problema: "Google Drive: Sin permisos"**
```
Causa: No iniciaste sesión con Google OAuth
Solución:
  1. Ve a Login
  2. Elige "Continuar con Google"
  3. Grant permisos a Google Drive
  4. Regresa a la sesión e intenta de nuevo
```

#### **Problema: Informe vacío generado**
```
Causa: IA no tuvo contenido suficiente para analizar
Solución:
  1. Asegúrate de que hay transcripción de audio O notas detalladas
  2. Si subiste un MP3, verifica que se transcribió (busca "[Transcripción del archivo...]")
  3. Agrega más contexto clínico en Notas
```

### 7. **Test Básico para Aislar el Problema**

Intenta generar un informe con:
```
Contenido MÍNIMO:
  - Notas: "Paciente refiere ansiedad"
  - Sin archivos
  - Sin audio grabado
```

Si ESTO funciona → El problema es con los archivos
Si ESTO NO funciona → El problema es más fundamental

### 8. **Verificar Estado del Sistema**

En la sesión, busca el indicador de sistema en la parte inferior. Debería decir:

```
✅ "IA + Google Drive operativos"
  → Todo bien, debería funcionar

⚠️ "IA operativa - Drive sin permisos"
  → Funciona, pero no guarda en Drive (guardará localmente)

⚠️ "Informes estructurados + Google Drive"
  → IA no disponible, usa fallback estructurado

⚠️ "Informes estructurados - Drive sin permisos"
  → Ni IA ni Drive, máximo fallback
```

### 9. **Información para Soporte**

Si aún no funciona, proporciona:

1. **Mensaje exacto de error** (de DevTools Console)
2. **Stack trace** (scroll en DevTools Console)
3. **Contenido que intentaste generar:**
   - ¿Notas? ¿Cuántas palabras?
   - ¿Audio? ¿Cuántos segundos?
   - ¿Archivos? ¿Cuántos? ¿Qué tipo?
4. **Estado del sistema** (qué indicador muestra)
5. **Pasos exactos para reproducir**

---

## 🔧 Verificación Rápida (Para Desarrolladores)

```typescript
// Abre DevTools Console y copia esto:

// 1. Verificar estado del componente
console.log('Estado del componente:', {
  isGenerating: document.querySelector('[disabled]')?.textContent,
  hasContent: !!document.querySelector('[placeholder*="Observaciones"]')?.value,
  hasFiles: document.querySelector('[data-files]')?.textContent,
});

// 2. Verificar logs recientes
// Scroll en la consola hacia ARRIBA para ver los logs de intento anterior

// 3. Verificar si hay errores de red
// DevTools → Network tab → Busca peticiones a:
//   - openrouter.ai
//   - googleapis.com
//   - supabase (si ves esto en rojo = problema de auth)
```

---

## ✅ Resumen de Cambios Recientes

- ✅ Transcripción automática de archivos de audio
- ✅ Lógica obligatoria de "Primera Visita"
- ✅ Mejor manejo de errores
- ✅ Logging mejorado en DevTools
- ✅ Validaciones de contexto (MAX_FILES=5, MAX_CHARS=100k)

---

**Última actualización:** 2025-11-18
**Commit:** `dd84976`
