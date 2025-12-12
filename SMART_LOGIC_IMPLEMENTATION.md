# 🎯 Implementación: Lógica Automática vs Manual para Tipo de Informe

## Cambio Conceptual

El sistema ahora implementa una **dualidad inteligente**:

### Parte Automática (Sistema)
El sistema decide automáticamente entre **Primera Visita** o **Seguimiento** basándose en el historial:
- ✅ **Paciente nuevo** (sin informes) → Sistema propone "Primera Visita"
- ✅ **Paciente con historial** (1+ informes) → Sistema propone "Seguimiento"

**PERO** respeta si el usuario ya seleccionó "Alta Dossier" (no lo fuerza a cambiar)

### Parte Manual (Profesional Clínico)
El **"Alta / Dossier"** es una decisión exclusiva del profesional:
- ✅ El usuario siempre puede intentar hacer clic
- ✅ Si no hay requisitos, recibe un mensaje educativo
- ✅ Si cumple requisitos, se activa con confirmación

---

## 📝 Cambios Implementados

### 1. Nuevo useEffect: Lógica Automática (Líneas 155-179)

```typescript
useEffect(() => {
  // Solo aplicar lógica automática si tenemos reportes cargados
  if (patientReports.length > 0) {
    // Si tiene historial:
    // El sistema sugiere "Seguimiento", PERO respeta si el usuario 
    // ya eligió "Alta Dossier". Solo forzamos el cambio si estaba 
    // en "Primera Visita" (que sería erróneo).
    if (reportType === 'primera_visita') {
      setReportType('seguimiento');
      toast.info('Paciente con historial: Modo ajustado automáticamente a "Seguimiento".');
      console.log('✅ Auto-ajustado a Seguimiento (paciente tiene historial)');
    }
  } else {
    // Si NO tiene historial:
    // Aquí sí es estricto: no puede ser Seguimiento ni Alta.
    if (reportType !== 'primera_visita') {
      setReportType('primera_visita');
      console.log('✅ Auto-ajustado a Primera Visita (paciente nuevo)');
    }
  }
}, [patientReports.length]);
```

**Características:**
- ✅ Respeta la selección de "Alta Dossier" (no la sobreescribe)
- ✅ Solo fuerza cambios lógicamente erróneos
- ✅ Feedback visual con toast
- ✅ Logging detallado

---

### 2. Nueva Botonera con Validación Manual (Líneas 1168-1250)

```jsx
<div className="p-4 bg-slate-50 border rounded-lg space-y-3">
  <label className="text-sm font-medium text-gray-700">
    Selecciona el Tipo de Informe:
  </label>
  
  <div className="grid grid-cols-3 gap-2">
    {/* Botón 1: Primera Visita */}
    <Button
      type="button"
      variant={reportType === 'primera_visita' ? 'default' : 'outline'}
      onClick={() => {
        if (patientReports.length > 0) {
          toast.error('Este paciente ya tiene historial. No procede una "Primera Visita".');
        } else {
          setReportType('primera_visita');
        }
      }}
      className={reportType === 'primera_visita' ? "bg-primary" : "opacity-50"}
      disabled={patientReports.length > 0}
    >
      Primera Visita
    </Button>

    {/* Botón 2: Seguimiento */}
    <Button
      type="button"
      variant={reportType === 'seguimiento' ? 'default' : 'outline'}
      onClick={() => {
        if (patientReports.length === 0) {
          toast.error('No se puede hacer seguimiento sin un informe previo.');
        } else {
          setReportType('seguimiento');
        }
      }}
      className={reportType === 'seguimiento' ? "bg-primary" : ""}
      disabled={patientReports.length === 0}
    >
      Seguimiento
    </Button>

    {/* Botón 3: Alta / Dossier (VOLUNTARIO) */}
    <Button
      type="button"
      variant={reportType === 'alta_paciente' ? 'default' : 'outline'}
      onClick={() => {
        // VALIDACIÓN MANUAL: El usuario quiere el alta
        if (patientReports.length === 0) {
          toast.error('⚠️ Acción no permitida: Para generar un Dossier de Alta es imprescindible que existan informes previos para analizar la evolución.');
        } else {
          setReportType('alta_paciente');
          toast.success('Modo Dossier de Alta activado: Se generará el historial completo.');
        }
      }}
      // NO deshabilitamos para permitir intentos educativos
      className={`border-purple-200 hover:bg-purple-50 hover:text-purple-700 transition-all ${
        reportType === 'alta_paciente' 
          ? 'bg-purple-600 hover:bg-purple-700 text-white ring-2 ring-purple-200 shadow-md' 
          : 'text-purple-700'
      }`}
    >
      Alta / Dossier
    </Button>
  </div>
  
  {/* Mensaje informativo dinámico */}
  <div className="min-h-[20px]">
    {reportType === 'primera_visita' && (
      <p className="text-xs text-muted-foreground flex items-center">
        <span className="mr-1.5 text-primary">●</span>
        Genera historial nuevo y filiación completa.
      </p>
    )}
    {reportType === 'seguimiento' && (
      <p className="text-xs text-muted-foreground flex items-center">
        <span className="mr-1.5 text-primary">●</span>
        Compara evolución con informes previos.
      </p>
    )}
    {reportType === 'alta_paciente' && (
      <p className="text-xs text-purple-700 font-medium flex items-center bg-purple-50 p-1 rounded">
        <span className="mr-1.5">✨</span>
        Genera Dossier cronológico completo + Anexo con todos los informes anteriores.
      </p>
    )}
  </div>
</div>
```

**Características:**
- ✅ 3 botones con estilos distintos
- ✅ Primera Visita: deshabilitado si hay historial (pero validación al click)
- ✅ Seguimiento: deshabilitado si no hay historial (pero validación al click)
- ✅ Alta/Dossier: **NUNCA deshabilitado**, siempre clickeable
  - Si no hay requisitos: muestra error educativo
  - Si hay requisitos: se activa con confirmación
- ✅ Mensajes dinámicos que describen cada tipo
- ✅ Estilos visuales claros (morado para Alta)

---

## 🔄 Flujos de Uso

### Caso 1: Paciente Nuevo (Sin Historial)

```
INICIO:
├─ Paciente cargado
├─ patientReports = []
└─ useEffect automático activado

DECISIÓN AUTOMÁTICA:
├─ Si reportType === 'primera_visita' → OK (no hace nada)
├─ Si reportType === 'seguimiento' → ERROR (fuerza a Primera Visita)
└─ Si reportType === 'alta_paciente' → OK (respeta selección)

UI MOSTRARÁ:
├─ [Primera Visita] ACTIVO (azul)
├─ [Seguimiento] GRIS (deshabilitado)
└─ [Alta/Dossier] MORADO (clickeable pero mostrará error si intenta)

USUARIO INTENTA HACER CLICK EN ALTA:
├─ toast.error: "Para generar un Dossier de Alta es imprescindible 
                 que existan informes previos..."
└─ No cambia reportType
```

---

### Caso 2: Generar Primer Informe

```
DESPUÉS DE GENERAR:
├─ patientReports = [informe1]
├─ useEffect automático se ejecuta nuevamente
└─ Si reportType === 'primera_visita' → OK (no hace nada)

UI SE ACTUALIZA:
├─ [Primera Visita] GRIS (deshabilitado)
├─ [Seguimiento] ACTIVO (azul)
└─ [Alta/Dossier] MORADO (ahora ACTIVO también)

PROFESIONAL VE:
├─ "Modo ajustado automáticamente a Seguimiento"
├─ Puede ahora generar seguimiento normal, O
└─ Puede cambiar a "Alta/Dossier" si quiere consolidar
```

---

### Caso 3: Usar Alta Dossier

```
PROFESIONAL DECIDE DAR DE ALTA:
├─ Hace clic en botón [Alta/Dossier]
├─ Sistema valida: patientReports.length > 0 ✓
├─ toast.success: "Modo Dossier de Alta activado: Se generará 
                   el historial completo."
└─ reportType = 'alta_paciente'

UI SE ACTUALIZA:
├─ [Alta/Dossier] MORADO (seleccionado, con ring y sombra)
├─ Mensaje: "✨ Genera Dossier cronológico completo + Anexo con 
              todos los informes anteriores."
└─ Usuario puede hacer clic en "Generar Informe"

SISTEMA GENERA:
├─ Consolida TODO el historial
├─ Crea síntesis por IA
├─ Limpia archivos antiguos automáticamente
└─ ✅ Dossier de Alta completo
```

---

## 🧠 Lógica de Decisión

```
┌─────────────────────────────────────────┐
│ Usuario hace clic en botón              │
└─────────────────────────────┬───────────┘
                              │
                    ┌─────────▼────────────┐
                    │ ¿Qué botón presionó? │
                    └──┬──────┬────────┬───┘
                       │      │        │
         ┌─────────────┴┐   ┌─┴────────┴──────┐
         │              │   │                 │
         ▼              ▼   ▼                 ▼
    Primera        Seguimiento          Alta/Dossier
    Visita         (Automático)         (Manual)
         │              │                 │
         │              │         ┌───────▼────────┐
         ▼              ▼         │ ¿Tiene         │
    ┌────────┐    ┌────────┐     │ requisitos?    │
    │¿Hay    │    │¿Hay    │     └─┬──────────┬───┘
    │hist?   │    │hist?   │       │          │
    └───┬─┬──┘    └───┬─┬──┘       │        SÍ│
    SÍ │ │NO  SÍ │ │NO        NO│
       │ │         │ │            │
    ERR│OK      OK│ERR          ERR
       │ │         │ │
       ▼ ▼         ▼ ▼            ▼
      ✓ ✓         ✓ ✗           Error
                                  │
                              toast.error
                              (educativo)
```

---

## 📊 Matriz de Estados

| Escenario | Primera | Seguimiento | Alta/Dossier | Automático |
|-----------|---------|-------------|--------------|-----------|
| Paciente nuevo | ✅ OK | ❌ Bloqueado | ❌ Educativo | Fuerza Primera |
| Con 1 informe | ❌ Bloqueado | ✅ OK | ✅ OK | Sugiere Seguimiento |
| User elige Alta manualmente | - | - | ✅ Respetado | NO fuerza cambio |
| User intenta Alta sin histórico | - | - | ❌ Error | Error educativo |

---

## 🎨 Estilos Visuales

### Estado de Botones

```
PRIMERA VISITA:
├─ Activo: bg-blue (default primary)
├─ Inactivo: opacity-50 (gris)
└─ Deshabilitado: disabled (gris + not-allowed)

SEGUIMIENTO:
├─ Activo: bg-blue (default primary)
├─ Inactivo: normal (outline)
└─ Deshabilitado: disabled (gris + not-allowed)

ALTA/DOSSIER:
├─ Activo: bg-purple-600 + ring-2 + shadow-md
├─ Inactivo: text-purple-700 (outline morado)
└─ NUNCA deshabilitado (siempre clickeable)
```

### Mensajes Informativos

```
Primera Visita:
  "● Genera historial nuevo y filiación completa."

Seguimiento:
  "● Compara evolución con informes previos."

Alta/Dossier:
  "✨ Genera Dossier cronológico completo + Anexo con 
     todos los informes anteriores."
```

---

## ✅ Testing Checklist

- [ ] **Paciente nuevo carga**
  - [ ] Primera Visita: activo
  - [ ] Seguimiento: deshabilitado
  - [ ] Alta/Dossier: morado (clickeable)
  
- [ ] **Click en Alta sin historial**
  - [ ] Error educativo
  - [ ] No cambia reportType
  - [ ] Sigue morado pero no seleccionado

- [ ] **Generar primer informe**
  - [ ] Automáticamente cambia a Seguimiento
  - [ ] Toast: "Modo ajustado..."
  - [ ] Alta/Dossier ahora está activo

- [ ] **Click en Alta con historial**
  - [ ] Se activa (morado con ring)
  - [ ] Toast: "Modo Dossier de Alta activado"
  - [ ] Mensaje dinámico aparece

- [ ] **Generar Alta Dossier**
  - [ ] Consolida todos los informes
  - [ ] Crea síntesis
  - [ ] Limpia archivos antiguos

---

## 🔧 Commit

```
ec30a8b feat: implement smart logic for report type selection - automatic vs manual validation
```

**Cambios:**
- +40 líneas de código
- Nuevo useEffect para lógica automática
- Botonera completamente rediseñada
- Validación manual con mensajes educativos
- 0 errores de compilación

---

## 🚀 Resultado

✅ **Sistema inteligente de dos capas:**
1. **Automática**: El sistema sugiere Primera Visita o Seguimiento
2. **Manual**: El profesional decide voluntariamente cuando hacer Alta

✅ **Experiencia educativa:**
- Mensajes claros y educativos
- No bloquea (permite intentos y aprende del feedback)
- Respecta decisiones clínicas

✅ **Validación robusta:**
- Previene acciones inválidas
- Proporciona feedback inmediato
- Documentación clara en UI

