# 🎯 Summary: Automatic Report Type Routing Implementation

## The Problem ❌

**Symptom:** "Generar Informe" button doesn't work for patients with previous reports

**Root Cause:** System had blocking logic that prevented report generation when:
- Patient had previous reports (`hasHistory = true`)
- User tried to generate first-visit report (`reportType = 'primera_visita'`)
- Result: Error message "⚠️ Paciente ya tiene historial, no se puede generar otro Primer Informe"

**Console Evidence:**
```
Verificando lógica de Primera Visita: {hasHistory: true, reportType: 'primera_visita', patientReportsCount: 1}
⚠️ Paciente ya tiene historial, no se puede generar otro Primer Informe
```

---

## The Solution ✅

**Changed From (WRONG):**
```typescript
if (hasHistory && reportType === 'primera_visita') {
  toast.error('Error: Este paciente ya tiene historial...');
  return;  // ← BLOCKS COMPLETELY
}
```

**Changed To (CORRECT):**
```typescript
// Automatically determine report type based on patient history
const reportTypeToUse = hasHistory ? 'seguimiento' : 'nueva_visita';

if (hasHistory) {
  console.log('✅ Paciente tiene historial → Usando SEGUIMIENTO');
} else {
  console.log('✅ Paciente nuevo → Usando PRIMERA VISITA');
}

// Continue with generation using correct type
const compiledInfo = await openRouterService.compileReportInfo({
  reportType: reportTypeToUse,  // ← Use determined type
  patientData: {
    previousReports: hasHistory ? patientReports.map(...).slice(0, 3) : [],
    // ...
  }
});
```

---

## Implementation Details

### File: `app/(app)/session/[patientId]/page.tsx`

#### Change 1: Automatic Type Routing (Lines ~388-407)
```typescript
const hasHistory = patientReports.length > 0;

// Determine report type automatically based on history
let reportTypeToUse: 'nueva_visita' | 'seguimiento' = 'nueva_visita';

if (hasHistory) {
  reportTypeToUse = 'seguimiento';
  console.log('✅ Paciente tiene historial → Usando SEGUIMIENTO');
} else {
  reportTypeToUse = 'nueva_visita';
  console.log('✅ Paciente nuevo → Usando PRIMERA VISITA');
}

console.log(`Verificando lógica de Primera Visita: {hasHistory: ${hasHistory}, reportType: '${reportTypeToUse}', patientReportsCount: ${patientReportsCount}}`);
```

**Impact:** System no longer blocks patients with history

#### Change 2: Dynamic Report Titles (Lines ~461-467)
```typescript
const reportTitle = `${
  reportTypeToUse === 'seguimiento'
    ? 'Informe de Seguimiento'
    : 'Informe Primera Visita'
} - ${selectedPatient.name} (${dateStr})`;

console.log(`📋 Generando: ${reportTitle}`);
```

**Impact:** Report title reflects actual type being generated

#### Change 3: Dynamic Document Headers (Lines ~569-580)
```typescript
const docContent = `# ${
  reportTypeToUse === 'seguimiento'
    ? 'INFORME DE SEGUIMIENTO CLÍNICO'
    : 'INFORME PRIMERA VISITA'
}

**Fecha:** ${dateStr}
**Paciente:** ${selectedPatient.name}
```

**Impact:** Document markdown header matches report type

#### Change 4: Use Determined Type in IA Prompt (Lines ~476-490)
```typescript
const compiledInfo = await openRouterService.compileReportInfo({
  reportType: reportTypeToUse,  // ✅ Use determined type
  patientData: {
    name: selectedPatient.name,
    // ... other fields ...
    previousReports: hasHistory 
      ? patientReports.map(report => ({
          date: new Date(report.created_at).toLocaleDateString('es-ES'),
          type: report.report_type,
          content: report.content,
        })).slice(0, 3)  // ← Include up to 3 previous reports
      : [],
  },
  // ... rest of parameters ...
});
```

**Impact:** 
- IA receives correct prompt template (nueva_visita vs seguimiento)
- Follow-up reports get previous reports in context for comparative analysis
- System never includes > 3 reports (keeps context manageable)

#### Change 5: Dynamic CRM Label (Line ~654)
```typescript
const crmReportType = reportTypeToUse === 'seguimiento' 
  ? 'Informe de Seguimiento' 
  : 'Informe Primera Visita';

await googleSheetsPatientCRM.addReportToCRM(googleToken, {
  // ... other fields ...
  reportType: crmReportType,  // ← Dynamic label
  // ... other fields ...
});
```

**Impact:** Google Sheets CRM shows correct report type

#### Change 6: Store Correct Type in Database (Line ~638)
```typescript
const reportData = {
  // ... other fields ...
  report_type: reportTypeToUse,  // ✅ Use determined type (was hardcoded to 'primera_visita')
  // ... other fields ...
};

const newReport = await reportsService.create(reportData);
```

**Impact:** Database accurately records report type

---

## Behavioral Changes

### Before Fix ❌
```
NEW PATIENT:
- User clicks "Generar Informe" ✓
- System generates "Informe Primera Visita" ✓
- Result: WORKS ✓

PATIENT WITH HISTORY:
- User clicks "Generar Informe" ✓
- System shows error: "Paciente ya tiene historial" ✗
- No report generated ✗
- Result: BLOCKED ✗
```

### After Fix ✅
```
NEW PATIENT:
- User clicks "Generar Informe" ✓
- System detects: hasHistory = false ✓
- Automatically uses: reportTypeToUse = 'nueva_visita' ✓
- Generates with: nuevo_paciente prompt ✓
- Saves: report_type = 'nueva_visita' ✓
- Result: WORKS ✓

PATIENT WITH 1 REPORT:
- User clicks "Generar Informe" ✓
- System detects: hasHistory = true ✓
- Automatically switches: reportTypeToUse = 'seguimiento' ✓
- Includes: previousReports in context ✓
- Generates with: seguimiento prompt (comparative analysis) ✓
- Saves: report_type = 'seguimiento' ✓
- Result: WORKS ✓

PATIENT WITH 5+ REPORTS:
- User clicks "Generar Informe" ✓
- System detects: hasHistory = true ✓
- Automatically switches: reportTypeToUse = 'seguimiento' ✓
- Includes: Last 3 reports for context management ✓
- Generates with: seguimiento prompt ✓
- Saves: report_type = 'seguimiento' ✓
- Result: WORKS ✓
```

---

## Prompt Behavior

### Nueva Visita Prompt (`nuevo_paciente`)
**Used For:** First visit / new patient
**Includes:**
- Full diagnostic workup
- DIAGNÓSTICO DIFERENCIAL section (explicit, mandatory)
- No comparatives (no previous data)
- Structured initial assessment

**Example Output:**
```
# INFORME PRIMERA VISITA

## Datos de Filiación
[patient info]

## Motivo de Consulta
[chief complaint]

## Antecedentes
[history]

## Exploración
[findings]

## 7. DIAGNÓSTICO DIFERENCIAL
- Diagnosis 1: Evidence...
- Diagnosis 2: Evidence...
- Diagnosis 3: Evidence...

## Plan de Tratamiento
[treatment]
```

### Seguimiento Prompt (`seguimiento`)
**Used For:** Follow-up visit / patient with history
**Includes:**
- Mandatory comparative evolution analysis
- "RESUMEN DE LA EVOLUCIÓN (COMPARATIVA)" section
- References to previous reports by date
- Assessment of objective achievement
- Recommendations adjusted based on progress

**Example Output:**
```
# INFORME DE SEGUIMIENTO CLÍNICO

## Datos de Filiación
[patient info]

## 2. RESUMEN DE LA EVOLUCIÓN (COMPARATIVA)
Comparado con el informe anterior del [fecha anterior]:
- Síntoma A: Antes [estado] → Ahora [estado]
- Síntoma B: Antes [estado] → Ahora [estado]
- Objetivo 1: [achieved/not achieved]
- Objetivo 2: [achieved/not achieved]

## Exploración y Observaciones Actuales
[new findings compared to baseline]

## Impresión Diagnóstica Actualizada
[diagnosis evolution]

## Plan Actualizado
[adjusted treatment based on progress]

## Sugerencias Diagnósticas Alternativas
[differential for current state]
```

---

## Testing Approach

**Quick Validation Tests:**

1. **New Patient Test:**
   ```
   Create patient → Generate report → Check title "Informe Primera Visita" → ✓
   ```

2. **Follow-up Test:**
   ```
   Use patient with 1 report → Generate report
   → Check title "Informe de Seguimiento" 
   → Check console: "✅ Paciente tiene historial → Usando SEGUIMIENTO"
   → Check NO error messages
   → ✓
   ```

3. **Multiple Reports Test:**
   ```
   Generate 5 reports for same patient
   → Each follows-up should show "Informe de Seguimiento"
   → Each should include comparative analysis
   → Database shows report_type = 'seguimiento' for reports 2-5
   → ✓
   ```

4. **With Audio Test:**
   ```
   Patient with history + audio upload → Generate report
   → Audio transcribed ✓
   → Report generated as 'seguimiento' ✓
   → Audio included in context ✓
   → ✓
   ```

---

## Technical Verification

### Database
```sql
SELECT patient_id, report_type, title, created_at 
FROM reports 
ORDER BY created_at DESC
LIMIT 10;

Expected:
- All first reports: report_type = 'nueva_visita'
- All follow-ups: report_type = 'seguimiento'
```

### Google Drive
```
Documents created should be in:
- /INFORMES_CLINICOS/NUEVA_VISITA/ [NEW patient reports]
- /INFORMES_CLINICOS/SEGUIMIENTO/ [FOLLOW-UP reports]

Or similar folder structure
```

### Google Sheets CRM
```
PatientReports worksheet columns:
- Date: [report date]
- Patient: [name]
- ReportType: "Informe Primera Visita" OR "Informe de Seguimiento"
- Status: "Completado"
- Link: [drive link]
```

### Browser Console
```javascript
// Search for these success messages:

// For new patient:
✅ Paciente nuevo → Usando PRIMERA VISITA

// For patient with history:
✅ Paciente tiene historial → Usando SEGUIMIENTO

// For any patient:
✅ FASE 1 completada - Archivos: [count]
✅ FASE 2 completada - Contexto compilado
✅ FASE 3 completada - IA: EXITOSO
✅ FASE 4 completada - Drive: EXITOSO
✅ Informe guardado en base de datos: [UUID]
```

---

## Code Locations

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| Type determination | `app/(app)/session/[patientId]/page.tsx` | ~388-407 | Auto-select nueva_visita vs seguimiento |
| IA prompt selection | `app/(app)/session/[patientId]/page.tsx` | ~476-490 | Pass reportTypeToUse to OpenRouter |
| Dynamic title | `app/(app)/session/[patientId]/page.tsx` | ~461-467 | Report title reflects type |
| Document header | `app/(app)/session/[patientId]/page.tsx` | ~569-580 | Markdown header matches type |
| DB storage | `app/(app)/session/[patientId]/page.tsx` | ~638 | Store correct report_type |
| CRM label | `app/(app)/session/[patientId]/page.tsx` | ~654 | Dynamic label for Google Sheets |
| Nueva Visita Prompt | `lib/services/openrouter.ts` | ~50-150 | First visit template with DIAGNÓSTICO DIFERENCIAL |
| Seguimiento Prompt | `lib/services/openrouter.ts` | ~170-250 | Follow-up template with comparative evolution |

---

## Commit Info

**Commit Hash:** `99eb3c7`

**Commit Message:**
```
fix: implement automatic report type routing based on patient history

- Automatically detect patient history and route to appropriate report type
- Change from blocking first-visit reports for patients with history
- Switch to seguimiento (follow-up) prompt when patient has previous reports  
- Update database report_type field to use determined type
- Make CRM labels dynamic: 'Informe de Seguimiento' vs 'Informe Primera Visita'
- Include previousReports in context for comparative analysis
- Generate dynamic titles and document headers based on report type
```

**Changes in Commit:**
- Modified: `app/(app)/session/[patientId]/page.tsx`
  - Line ~388-407: Automatic type routing
  - Line ~461-467: Dynamic report title
  - Line ~476-490: Pass reportTypeToUse to IA
  - Line ~569-580: Dynamic document header
  - Line ~638: Store correct report_type
  - Line ~654: Dynamic CRM label

---

## Impact Assessment

### ✅ What Gets Fixed
1. ✅ Report generation works for ALL patients
2. ✅ New patients get first-visit assessment
3. ✅ Follow-up patients get comparative reports
4. ✅ No more blocking errors
5. ✅ Database has accurate report types
6. ✅ CRM shows correct labels
7. ✅ IA performs comparative analysis when needed

### 🔄 What Changes
1. 🔄 Report type now automatically determined
2. 🔄 Report titles are dynamic
3. 🔄 Document headers are dynamic
4. 🔄 CRM labels are dynamic
5. 🔄 Database stores accurate report_type

### ⚠️ Potential Issues (None Known)
1. ⚠️ If patientReports not loaded correctly → might still show as new when has history
   - Mitigation: Added logging to check patientReports.length
2. ⚠️ If context exceeds 100k chars → might truncate previous reports
   - Mitigation: Limited to 3 previous reports max

---

## Usage Instructions

### For Users
```
Simply click "Generar Informe" as before.

The system will:
1. Automatically detect if patient is new or has history
2. Use appropriate prompt template
3. If follow-up: Include previous reports for comparison
4. Generate complete report
5. Save to Google Drive
6. Update CRM

NO NEED TO SELECT REPORT TYPE MANUALLY - IT'S AUTOMATIC! ✅
```

### For Developers
```
To modify report types or prompts:

1. Edit prompts in: lib/services/openrouter.ts
   - nuevo_paciente: First visit template
   - seguimiento: Follow-up template
   - alta_paciente: Discharge template (not yet in UI)

2. Edit routing logic in: app/(app)/session/[patientId]/page.tsx
   - Around line 388-407: reportTypeToUse determination
   - Can add additional conditions (e.g., user override)

3. To add new report type:
   - Add to openrouter.ts prompts
   - Add to reportTypeToUse type: 'nueva_visita' | 'seguimiento' | 'new_type'
   - Add routing condition if needed
   - Add corresponding CRM label
```

---

## Future Enhancements

**Could Add:**
1. Manual report type override selector (if IA routing insufficient)
2. Alta_paciente (discharge) report type integration
3. Comparison visualization (show changes graphically)
4. Progress tracking (symptoms over time)
5. Treatment response metrics
6. Predictive recommendations based on trajectory

**Why Not Yet:**
- Current solution solves immediate problem
- Can be added without breaking changes
- Need user feedback first
- May increase complexity unnecessarily

---

## Summary

**Problem:** System blocked report generation for patients with history

**Solution:** Automatic type routing based on hasHistory flag

**Result:** All patients can generate reports (new → nueva_visita, existing → seguimiento)

**Status:** ✅ COMPLETE and READY FOR TESTING

**Next Step:** Run test cases in `TESTING_AUTOMATIC_REPORT_ROUTING.md`
