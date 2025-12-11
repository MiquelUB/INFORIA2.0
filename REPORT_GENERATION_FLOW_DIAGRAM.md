# 🔄 Report Generation Flow - Visual Diagram

## Complete Flow with Fix

```
┌─────────────────────────────────────────────────────────────────────┐
│                     USER CLICKS "GENERAR INFORME"                   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │   FASE 0: PRE-FLIGHT CHECKS                  │
        │  ✅ Check Google OAuth Token                 │
        │  ✅ Load Patient Data                        │
        │  ✅ Load Patient Reports (History)           │
        └──────────────────┬───────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────────┐
        │   🎯 AUTOMATIC REPORT TYPE ROUTING (NEW FIX) │
        │  Determine: NEW PATIENT or FOLLOW-UP?        │
        └──────────────────┬───────────────────────────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
         NO HISTORY                   HAS HISTORY
    (patientReports = [])        (patientReports > 0)
            │                             │
            ▼                             ▼
    ┌──────────────────┐         ┌──────────────────┐
    │ reportTypeToUse: │         │ reportTypeToUse: │
    │ 'nueva_visita'   │         │ 'seguimiento'    │
    │                  │         │                  │
    │ ✅ NUEVA VISITA  │         │ ✅ SEGUIMIENTO   │
    └────────┬─────────┘         └────────┬─────────┘
             │                            │
             │                    ┌───────▼────────┐
             │                    │ Include Previous│
             │                    │ Reports (up to3)│
             │                    └───────┬────────┘
             │                            │
             └────────────┬───────────────┘
                          ▼
        ┌──────────────────────────────────────────────┐
        │   FASE 1: FILE PROCESSING                    │
        │  ✅ Detect audio files → Transcribe          │
        │  ✅ Detect text files → Read content         │
        │  ✅ Reference other files                    │
        │  ✅ Enforce: max 5 files, 100k chars        │
        └──────────────────┬───────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────────┐
        │   FASE 2: CONTEXT COMPILATION                │
        │  ✅ Patient data                             │
        │  ✅ Clinical notes / observations            │
        │  ✅ Previous reports (if seguimiento)        │
        │  ✅ Audio transcriptions                     │
        │  ✅ File contents                            │
        │  ✅ Enforce context limit: 100k chars       │
        └──────────────────┬───────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────────┐
        │   FASE 3: CALL OPENROUTER IA                 │
        │  Prompt selected based on reportTypeToUse:  │
        └──────────────────┬───────────────────────────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
       nueva_visita                  seguimiento
        (first visit)                 (follow-up)
            │                             │
            ▼                             ▼
    ┌─────────────────┐         ┌──────────────────┐
    │ PROMPT:         │         │ PROMPT:          │
    │ - Initial Assess│         │ - COMPARATIVA    │
    │ - History       │         │ - Evolution      │
    │ - Exam          │         │ - Goal Check     │
    │ - DIAG DIFEREN- │         │ - Updated Plan   │
    │   CIAL (NUEVO)  │         │ - Alternatives   │
    └────────┬────────┘         └────────┬─────────┘
             │                           │
             │ DeepSeek R1               │
             │ Generates Report          │
             │ (Spanish, DSM-5/CIE-10)   │
             │                           │
             └────────────┬──────────────┘
                          ▼
        ┌──────────────────────────────────────────────┐
        │   FASE 4: DOCUMENT CONSTRUCTION              │
        │  ✅ Create markdown document                 │
        │  ✅ Dynamic title based on reportTypeToUse   │
        │  ✅ Dynamic header:                          │
        │     - Nueva Visita: "INFORME PRIMERA VISITA"│
        │     - Seguimiento: "INFORME SEGUIMIENTO..."│
        │  ✅ Add metadata                             │
        │  ✅ Upload to Google Drive                   │
        │  ✅ Save to database                         │
        │  ✅ Update CRM                               │
        └──────────────────┬───────────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │   ✅ SUCCESS                                 │
    │  Report generated and stored                 │
    │  - Database: report_type = reportTypeToUse   │
    │  - Drive: Document saved                     │
    │  - CRM: Entry updated with correct label     │
    │  - User sees: Success toast                  │
    └──────────────────────────────────────────────┘
```

---

## State Transitions

### NEW PATIENT FLOW

```
START
  │
  ├─► Load patient (first time)
  │   └─► patientReports = []
  │
  ├─► Click "Generar Informe"
  │   └─► handleGenerateReport() triggered
  │
  ├─► Detect history:
  │   └─► hasHistory = patientReports.length > 0
  │       └─► hasHistory = false ✓
  │
  ├─► Determine type:
  │   └─► reportTypeToUse = 'nueva_visita' ✓
  │
  ├─► Call OpenRouter:
  │   └─► Use: nuevo_paciente prompt
  │
  ├─► Generate report:
  │   └─► Full diagnostic workup
  │       ✓ Incluye DIAGNÓSTICO DIFERENCIAL
  │       ✓ No comparativas (no previous data)
  │
  ├─► Store document:
  │   └─► title: "Informe Primera Visita - [Name] - [Date]"
  │       header: "# INFORME PRIMERA VISITA"
  │       report_type: "nueva_visita"
  │       crm_label: "Informe Primera Visita"
  │
  └─► ✅ SUCCESS: First report generated
```

### FOLLOW-UP PATIENT FLOW (THE FIX)

```
START (Patient has 1+ previous reports)
  │
  ├─► Load patient (return visit)
  │   └─► patientReports = [Report1, Report2, ...]
  │
  ├─► Click "Generar Informe"
  │   └─► handleGenerateReport() triggered
  │
  ├─► Detect history:
  │   └─► hasHistory = patientReports.length > 0
  │       └─► hasHistory = true ✓
  │
  ├─► OLD CODE (BROKEN): ❌
  │   └─► if (hasHistory && reportType === 'primera_visita')
  │       └─► Error: "Paciente ya tiene historial"
  │           Report blocked! ❌
  │
  ├─► NEW CODE (FIXED): ✅
  │   ├─► Determine type AUTOMATICALLY:
  │   │   └─► reportTypeToUse = 'seguimiento' ✓
  │   │
  │   ├─► NO ERROR! Continue with generation
  │   │
  │   ├─► Include previous reports:
  │   │   └─► previousReports = patientReports.slice(0, 3)
  │   │       (Up to 3 most recent reports)
  │   │
  │   ├─► Call OpenRouter:
  │   │   └─► Use: seguimiento prompt
  │   │
  │   ├─► IA generates:
  │   │   ✓ Comparative Evolution analysis
  │   │   ✓ Compares with previous report(s)
  │   │   ✓ Evaluates goal achievement
  │   │   ✓ Updated impressions
  │   │   ✓ Adjusted treatment plan
  │   │
  │   ├─► Store document:
  │   │   └─► title: "Informe de Seguimiento - [Name] - [Date]"
  │   │       header: "# INFORME DE SEGUIMIENTO CLÍNICO"
  │   │       report_type: "seguimiento"
  │   │       crm_label: "Informe de Seguimiento"
  │   │
  │   └─► ✅ SUCCESS: Follow-up report generated
  │
  └─► Database now contains:
      Report 1: report_type = "nueva_visita"
      Report 2: report_type = "seguimiento"
      Report 3: report_type = "seguimiento"
      ... (all follow-ups use "seguimiento")
```

---

## Decision Tree

```
                          ┌─────────────────────┐
                          │  User clicks button │
                          │ "Generar Informe"   │
                          └──────────┬──────────┘
                                     │
                        ┌────────────▼────────────┐
                        │ Load patient reports    │
                        │ patientReports = [...]  │
                        └────────────┬────────────┘
                                     │
                        ┌────────────▼────────────┐
                        │ Check: patientReports   │
                        │        .length > 0 ?    │
                        └────┬───────────┬────────┘
                             │           │
                        YES  │           │  NO
                             │           │
                    ┌────────▼──┐  ┌───▼─────────┐
                    │ hasHistory │  │ hasHistory  │
                    │  = true    │  │  = false    │
                    └────────┬───┘  └───┬─────────┘
                             │          │
                    ┌────────▼──┐  ┌───▼──────────┐
                    │Determine: │  │Determine:    │
                    │seguimiento│  │nueva_visita  │
                    └────────┬───┘  └───┬──────────┘
                             │          │
                    ┌────────▼─────┬────▼─────────┐
                    │ Get previous │ No previous  │
                    │ reports:     │ reports:     │
                    │ slice(0,3)   │ previousReports
                    │              │ = []         │
                    └────────┬─────┴────┬─────────┘
                             │          │
                    ┌────────▼──────────▼──────┐
                    │ Compile report info:     │
                    │ - Patient data          │
                    │ - Clinical notes        │
                    │ - Previous reports (?)  │
                    │ - Audio transcriptions  │
                    │ - Files                 │
                    └────────┬────────────────┘
                             │
                    ┌────────▼──────────┐
                    │ Call OpenRouter   │
                    │ with reportType:  │
                    │ 'nueva_visita' or │
                    │ 'seguimiento'     │
                    └────────┬──────────┘
                             │
                    ┌────────▼──────────┐
                    │ IA generates      │
                    │ report            │
                    └────────┬──────────┘
                             │
                    ┌────────▼──────────┐
                    │ Store with:       │
                    │ - Dynamic title   │
                    │ - Dynamic header  │
                    │ - Correct type    │
                    │ - Correct label   │
                    └────────┬──────────┘
                             │
                    ┌────────▼──────────┐
                    │ ✅ SUCCESS        │
                    └───────────────────┘
```

---

## Code Execution Path (NEW)

```python
handleGenerateReport()
│
├─ STEP 1: Validation
│  ├─ Check Google token ✓
│  ├─ Check patient selected ✓
│  ├─ Load patientReports ✓
│  └─ Load selectedPatient ✓
│
├─ STEP 2: AUTOMATIC TYPE ROUTING ← NEW
│  ├─ hasHistory = patientReports.length > 0
│  ├─ if (hasHistory)
│  │  └─► reportTypeToUse = 'seguimiento'
│  │      console.log('✅ Paciente tiene historial → Usando SEGUIMIENTO')
│  └─ else
│     └─► reportTypeToUse = 'nueva_visita'
│        console.log('✅ Paciente nuevo → Usando PRIMERA VISITA')
│
├─ STEP 3: NO MORE BLOCKING! ← FIX
│  └─ (OLD CODE REMOVED:
│     if (hasHistory && reportType === 'primera_visita') return error;
│     ← THIS IS NOW GONE!)
│
├─ STEP 4: File Processing (FASE 1)
│  ├─ For each file:
│  │  ├─ if (audio) → transcribe
│  │  ├─ if (text) → read
│  │  └─ else → reference
│  └─ return uploadedAudioTranscriptions[], fileReferences[]
│
├─ STEP 5: Context Compilation (FASE 2)
│  ├─ Combine:
│  │  ├─ Patient data
│  │  ├─ Clinical notes
│  │  ├─ Audio transcriptions (if any)
│  │  ├─ File contents (if any)
│  │  └─ Previous reports (IF hasHistory) ← KEY FOR SEGUIMIENTO
│  │
│  └─ Enforce limit: max 100,000 characters
│
├─ STEP 6: Call OpenRouter (FASE 3)
│  ├─ Select prompt based on reportTypeToUse:
│  │  ├─ if (reportTypeToUse === 'nueva_visita')
│  │  │  └─ Use: nuevo_paciente_prompt
│  │  │     (Full initial assessment, includes DIAGNÓSTICO DIFERENCIAL)
│  │  └─ else (reportTypeToUse === 'seguimiento')
│  │     └─ Use: seguimiento_prompt
│  │        (Comparative analysis, RESUMEN DE EVOLUCIÓN COMPARATIVA)
│  │
│  └─ return generated_report
│
├─ STEP 7: Document Construction (FASE 4)
│  ├─ Create markdown:
│  │  ├─ Dynamic title:
│  │  │  ├─ if (reportTypeToUse === 'seguimiento')
│  │  │  │  └─ "Informe de Seguimiento - [Name]"
│  │  │  └─ else
│  │  │     └─ "Informe Primera Visita - [Name]"
│  │  │
│  │  └─ Dynamic header:
│  │     ├─ if (reportTypeToUse === 'seguimiento')
│  │     │  └─ "# INFORME DE SEGUIMIENTO CLÍNICO"
│  │     └─ else
│  │        └─ "# INFORME PRIMERA VISITA"
│  │
│  ├─ Upload to Google Drive
│  └─ return drive_url
│
├─ STEP 8: Database Storage
│  ├─ Create report record:
│  │  ├─ report_type: reportTypeToUse ← CORRECT TYPE
│  │  ├─ title: reportTitle (dynamic)
│  │  ├─ content: finalReportContent
│  │  ├─ google_drive_file_id: driveFileId
│  │  └─ ... other fields ...
│  │
│  └─ return newReport (with id)
│
├─ STEP 9: CRM Update
│  ├─ Determine label:
│  │  ├─ crmReportType = reportTypeToUse === 'seguimiento'
│  │  │                  ? 'Informe de Seguimiento'
│  │  │                  : 'Informe Primera Visita'
│  │
│  └─ Add to Google Sheets with correct label
│
└─ STEP 10: Success
   ├─ Show success toast
   ├─ Refresh reports list
   └─ ✅ DONE!
```

---

## Before vs After Comparison

### BEFORE (BROKEN) ❌

```
Scenario: Patient with 1 previous report tries to generate another

1. User clicks "Generar Informe"
2. handleGenerateReport() starts
3. System checks: hasHistory=true, reportType='nueva_visita'
4. BLOCKING CODE:
   if (hasHistory && reportType === 'primera_visita') {
     toast.error('Error: Paciente ya tiene historial');
     return;  ← EXITS HERE!
   }
5. Result: ❌ NO REPORT GENERATED
            ❌ ERROR MESSAGE SHOWN
            ❌ USER FRUSTRATED
```

### AFTER (FIXED) ✅

```
Scenario: Patient with 1 previous report tries to generate another

1. User clicks "Generar Informe"
2. handleGenerateReport() starts
3. System checks: hasHistory=true
4. AUTOMATIC ROUTING:
   reportTypeToUse = hasHistory ? 'seguimiento' : 'nueva_visita'
   reportTypeToUse = 'seguimiento' ← AUTO-SELECTED!
5. Continues normally:
   - Includes previous reports in context
   - Uses seguimiento prompt
   - IA performs comparative analysis
   - Stores with correct type
6. Result: ✅ REPORT GENERATED
            ✅ CORRECT TYPE USED
            ✅ COMPARATIVE ANALYSIS INCLUDED
            ✅ USER HAPPY
```

---

## Console Output: Expected Logging

### NEW PATIENT (Should see):
```
✅ Paciente nuevo → Usando PRIMERA VISITA
✅ FASE 1 completada - Archivos: 0
✅ FASE 2 completada - Contexto compilado
✅ FASE 3 completada - IA: EXITOSO
✅ FASE 4 completada - Drive: EXITOSO
✅ Informe guardado en base de datos: [UUID]
```

### PATIENT WITH HISTORY (Should see):
```
✅ Paciente tiene historial → Usando SEGUIMIENTO
✅ Informes previos incluidos (hasta 3): [List of previous reports]
✅ FASE 1 completada - Archivos: 0
✅ FASE 2 completada - Contexto compilado [Incluye informes previos]
✅ FASE 3 completada - IA: EXITOSO
✅ FASE 4 completada - Drive: EXITOSO
✅ Informe guardado en base de datos: [UUID]
```

### SHOULD NEVER SEE (These would indicate bug):
```
❌ ⚠️ Paciente ya tiene historial, no se puede generar otro Primer Informe
❌ Error: Este paciente ya tiene historial
❌ [Any error that prevents report generation]
```

---

## Quick Reference

| Case | hasHistory | reportTypeToUse | Prompt Used | Result |
|------|:----------:|:---------------:|:-----------:|:------:|
| New patient | false | nueva_visita | nuevo_paciente | ✅ First visit report |
| 1st follow-up | true | seguimiento | seguimiento | ✅ Follow-up with comparison |
| 2nd follow-up | true | seguimiento | seguimiento | ✅ Follow-up with comparison |
| 5th follow-up | true | seguimiento | seguimiento | ✅ Follow-up with comparison |
| NEW + audio | false | nueva_visita | nuevo_paciente | ✅ First visit + transcription |
| FOLLOW + audio | true | seguimiento | seguimiento | ✅ Follow-up + transcription + comparison |

---

**Status:** ✅ Ready for Testing
