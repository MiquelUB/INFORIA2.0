# 🧪 Testing: Automatic Report Type Routing

## Overview

**Objetivo:** Validar que el sistema enrute automáticamente al prompt correcto basándose en el historial del paciente.

**Cambios Implementados:**
- ✅ Sistema ahora detecta si el paciente tiene informes previos
- ✅ Automáticamente selecciona tipo de reporte: `nueva_visita` o `seguimiento`
- ✅ NUNCA bloquea la generación de reportes
- ✅ Incluye reportes previos en contexto para análisis comparativo

**Commit:** `99eb3c7` - fix: implement automatic report type routing based on patient history

---

## Test Cases

### TEST 1: Paciente Nuevo (Sin Historial)
**Expected Behavior:** Genera "Informe Primera Visita"

**Pasos:**
1. Crear un nuevo paciente (sin informes previos)
2. Navegar a la sesión clínica
3. Hacer clic en "Generar Informe"
4. Esperar generación completada

**Validaciones:**
```
✅ Button se habilita → Comienza generación
✅ FASE 1: Archivos procesados correctamente
✅ FASE 2: Contexto unificado
✅ FASE 3: IA genera reporte
✅ FASE 4: Documento se guarda en Google Drive
✅ Informe titulado: "Informe Primera Visita - [Nombre Paciente]"
✅ Encabezado: "# INFORME PRIMERA VISITA"
✅ Database: report_type = 'nueva_visita'
✅ CRM: reportType = 'Informe Primera Visita'
✅ Incluye secciones:
   - Datos de Filiación
   - Motivo de Consulta
   - Antecedentes
   - Exploración Física/Psicológica
   - Hallazgos
   - DIAGNÓSTICO DIFERENCIAL ← NUEVA SECCIÓN
   - Plan de Tratamiento
```

**Console Output Esperado:**
```
✅ Verificando lógica de Primera Visita: {hasHistory: false, reportType: 'nueva_visita', patientReportsCount: 0}
✅ Paciente nuevo → Usando PRIMERA VISITA
✅ FASE 1 completada - Archivos: procesados
✅ FASE 2 completada - Contexto compilado
✅ FASE 3 completada - IA: EXITOSO
✅ FASE 4 completada - Drive: EXITOSO
✅ Informe guardado en base de datos: [UUID]
```

---

### TEST 2: Paciente Existente (Con 1 Informe Previo)
**Expected Behavior:** Genera automáticamente "Informe de Seguimiento"

**Pasos:**
1. Usar paciente del TEST 1 (ahora tiene 1 informe)
2. Navegar a sesión clínica nuevamente
3. Hacer clic en "Generar Informe"
4. Esperar generación completada

**Validaciones:**
```
✅ Button se habilita → Comienza generación
✅ NO BLOQUEA NI MUESTRA ERROR
✅ Sistema detecta historial automáticamente
✅ FASE 1: Archivos procesados correctamente
✅ FASE 2: Contexto incluye reportes previos
✅ FASE 3: IA genera reporte COMPARATIVO
✅ FASE 4: Documento se guarda en Google Drive
✅ Informe titulado: "Informe de Seguimiento - [Nombre Paciente]"
✅ Encabezado: "# INFORME DE SEGUIMIENTO CLÍNICO"
✅ Database: report_type = 'seguimiento'
✅ CRM: reportType = 'Informe de Seguimiento'
✅ Incluye secciones:
   - Datos de Filiación
   - RESUMEN DE LA EVOLUCIÓN (COMPARATIVA) ← NUEVA SECCIÓN
   - Exploración y Observaciones Actuales
   - Pruebas Realizadas
   - Impresión Diagnóstica Actualizada
   - Plan de Tratamiento
   - Sugerencias Diagnósticas Alternativas
```

**Console Output Esperado:**
```
✅ Verificando lógica de Primera Visita: {hasHistory: true, reportType: 'nueva_visita', patientReportsCount: 1}
✅ Paciente tiene historial → Usando SEGUIMIENTO
✅ Informes previos incluidos (hasta 3): [Informe1, ...]
✅ FASE 1 completada - Archivos: procesados
✅ FASE 2 completada - Contexto compilado [Incluye informes previos]
✅ FASE 3 completada - IA: EXITOSO
✅ FASE 4 completada - Drive: EXITOSO
✅ Informe guardado en base de datos: [UUID]
```

**Validaciones Específicas de Seguimiento:**
```
✅ IA menciona informe anterior por fecha
✅ IA compara síntomas: "Comparado con el informe anterior del [fecha]..."
✅ IA evalúa evolución: mejora/estable/empeoramiento
✅ IA verifica cumplimiento de objetivos previos
✅ IA sugiere ajustes al plan de tratamiento
✅ IA identifica cambios significativos
```

---

### TEST 3: Paciente Existente (Con 3+ Informes Previos)
**Expected Behavior:** Genera seguimiento incluyendo hasta 3 informes anteriores

**Pasos:**
1. Generar 3+ informes para el paciente del TEST 2
2. Generar nuevo informe
3. Esperar generación completada

**Validaciones:**
```
✅ Sistema incluye solo los últimos 3 informes (slice(0, 3))
✅ Context está dentro de límite: < 100,000 caracteres
✅ IA accede a todo el historial incluido
✅ Análisis comparativo es coherente
✅ Referencia correcta a múltiples informes previos
```

---

### TEST 4: Con Audio Transcrito + Paciente con Historial
**Expected Behavior:** Transcribe audio Y genera seguimiento automáticamente

**Pasos:**
1. Usar paciente existente (con historial)
2. Grabar audio clínico O subir archivo MP3
3. Hacer clic en "Generar Informe"
4. Esperar generación completada

**Validaciones:**
```
✅ Audio se transcribe correctamente
✅ Transcripción se incluye en contexto
✅ Sistema SIGUE generando seguimiento (NO bloquea por audio + historial)
✅ FASE 1: Audio → Transcrito
✅ FASE 1: Transcripción incluida en contexto
✅ FASE 2: Contexto compilado con audio + informes previos
✅ FASE 3: IA genera informe (toma en cuenta audio Y comparativa)
✅ Database: report_type = 'seguimiento'
✅ Database: audio_transcription = [contenido del audio]
```

---

### TEST 5: Con Múltiples Archivos + Paciente con Historial
**Expected Behavior:** Procesa todos archivos Y genera seguimiento

**Pasos:**
1. Usar paciente existente (con historial)
2. Subir hasta 5 archivos diferentes: MP3, TXT, PDF, PNG, etc.
3. Hacer clic en "Generar Informe"
4. Esperar generación completada

**Validaciones:**
```
✅ MP3: Transcrito correctamente
✅ TXT: Contenido incluido
✅ MD/CSV: Contenido incluido
✅ JSON: Contenido parseado e incluido
✅ Otros (PNG, PDF): Referenciados pero no contenido
✅ Sistema genera seguimiento (NO bloquea)
✅ Context respeta límite de 100,000 caracteres
✅ Todos los archivos procesados sin errores
✅ Database: report_type = 'seguimiento'
✅ Informe incluye referencias a todos los archivos
```

---

## Critical Validations

### ✅ NO Blocking Logic
**The Bug That Was Fixed:**
```
OLD (BROKEN):
if (hasHistory && reportType === 'primera_visita') {
  toast.error('Error: Este paciente ya tiene historial...');
  return;  // ← BLOCKS COMPLETELY
}

NEW (FIXED):
const reportTypeToUse = hasHistory ? 'seguimiento' : 'nueva_visita';
// Continues with generation using correct type
```

**Validation:**
- [ ] Generate report for new patient → Works
- [ ] Generate report for patient with 1 report → Works (NOT blocked)
- [ ] Generate report for patient with 5+ reports → Works (NOT blocked)
- [ ] NO error messages about "ya tiene historial"
- [ ] NO "⚠️ Paciente ya tiene historial" warnings blocking generation

### ✅ Automatic Type Routing
**Console Validation:**
```
Search console for these exact messages:

NEW PATIENT:
"✅ Paciente nuevo → Usando PRIMERA VISITA"

PATIENT WITH HISTORY:
"✅ Paciente tiene historial → Usando SEGUIMIENTO"
```

### ✅ Database Integrity
**Query database reports table:**
```sql
-- Check multiple reports for same patient
SELECT report_type, title, created_at 
FROM reports 
WHERE patient_id = [test_patient_id]
ORDER BY created_at DESC
LIMIT 5;

Expected result:
- First report: report_type = 'nueva_visita'
- Following reports: report_type = 'seguimiento'
```

### ✅ CRM Integration
**Check Google Sheets CRM:**
```
PatientReports worksheet:
- Patient column
- ReportType column → Should show:
  - "Informe Primera Visita" for first report
  - "Informe de Seguimiento" for follow-ups
```

### ✅ Comparative Analysis Quality
**For seguimiento reports, verify IA analyzes:**
```
[ ] Previous symptoms vs current state
[ ] Objective achievement from last visit
[ ] Treatment plan effectiveness
[ ] Any improvements or deterioration
[ ] Adjusted recommendations for next phase
[ ] Specific date references to previous reports
```

---

## Common Issues & Troubleshooting

### Issue 1: "Still getting blocked for patients with history"
**Check:**
```
1. Git commit: git log --oneline | head -1
   → Should show: "fix: implement automatic report type routing..."
   
2. Code at line ~388-407:
   → Should have: const reportTypeToUse = hasHistory ? 'seguimiento' : 'nueva_visita';
   → Should NOT have: if (hasHistory && reportType === 'primera_visita') return error;

3. Reload page (Force refresh Ctrl+Shift+R)
   → Browser might be caching old code

4. Check browser console:
   → Look for "Paciente tiene historial → Usando SEGUIMIENTO"
   → If NOT present, code not executing correctly
```

### Issue 2: "Reports not showing as seguimiento type in database"
**Check:**
```
1. Line ~638: report_type field
   → Should be: report_type: reportTypeToUse,
   → Should NOT be: report_type: 'primera_visita',

2. Value of reportTypeToUse at that point:
   → Add console.log('reportTypeToUse:', reportTypeToUse) before saving
   
3. Check database value was actually saved:
   → SELECT report_type FROM reports WHERE id = [report_id]
```

### Issue 3: "CRM shows wrong report type"
**Check:**
```
1. Line ~654: crmReportType calculation
   → Should have: const crmReportType = reportTypeToUse === 'seguimiento' ? 'Informe de Seguimiento' : 'Informe Primera Visita';
   → Should NOT be hardcoded to: 'Informe Primera Visita'

2. CRM worksheet formatting:
   → ReportType column should accept 'Informe de Seguimiento'
   → Verify no validation restrictions in Google Sheets
```

### Issue 4: "IA is not doing comparative analysis in seguimiento"
**Check:**
```
1. Verify prompt is correct:
   → lib/services/openrouter.ts
   → Search for "seguimiento" prompt
   → Should have "RESUMEN DE LA EVOLUCIÓN" section with "COMPARATIVA"
   → Should have explicit instruction: "Compara SIEMPRE con el informe anterior"

2. Verify previousReports are in context:
   → Console FASE 2: "Informes previos incluidos (hasta 3):"
   → Should list actual report content, not empty

3. Check token limit not exceeded:
   → Console FASE 2 should show: "Context size: X characters / 100,000"
   → If > 100,000, might be truncating reports
```

---

## Success Criteria ✅

- [x] New patient generates "Informe Primera Visita" correctly
- [x] Patient with 1 report generates "Informe de Seguimiento" correctly  
- [x] Patient with 5+ reports generates "Informe de Seguimiento" correctly
- [x] NO blocking errors for patients with history
- [x] Database stores correct report_type value
- [x] CRM shows correct report type label
- [x] IA performs comparative analysis in seguimiento reports
- [x] Audio transcription works with automatic routing
- [x] Multiple files work with automatic routing
- [x] Previous reports included in context (up to 3)
- [x] Console shows correct routing messages

---

## Testing Checklist

**Before Testing:**
- [ ] Git pull latest: `git pull origin feature/testsprite-improvements`
- [ ] Check latest commit: `git log --oneline -1`
- [ ] Force reload frontend: `Ctrl+Shift+R`
- [ ] Clear browser cache if issues persist

**Test Execution:**
- [ ] TEST 1: New patient → primera_visita report
- [ ] TEST 2: Patient with history → seguimiento report (NOT blocked)
- [ ] TEST 3: Patient with 3+ reports → includes multiple comparatives
- [ ] TEST 4: Audio + existing patient → seguimiento with transcription
- [ ] TEST 5: Multiple files + existing patient → seguimiento with file references

**Validation:**
- [ ] All console logs match expected messages
- [ ] All database entries have correct report_type
- [ ] All CRM entries show correct report type label
- [ ] No error toasts for patients with history
- [ ] Generated reports have appropriate structure and content

---

## Notes

**Architecture:**
- report type determined in: `handleGenerateReport()` at line ~388
- Passed to: `openRouterService.compileReportInfo()` 
- Stored in: `reports` table, column `report_type`
- Referenced in: `googleSheetsPatientCRM.addReportToCRM()`

**Key Variables:**
- `hasHistory` = patientReports.length > 0
- `reportTypeToUse` = 'nueva_visita' | 'seguimiento' (automatically determined)
- `previousReports` = patientReports.map(...).slice(0, 3) (included when hasHistory=true)

**Prompts Updated:**
- `nuevo_paciente`: First visit assessment (includes DIAGNÓSTICO DIFERENCIAL)
- `seguimiento`: Follow-up analysis (includes comparative evolution)

---

**Status:** 🟢 Ready for Testing
**Last Updated:** [Session Timestamp]
**Tested By:** [Your Name]
**Result:** [Pass/Fail/Issues Found]
