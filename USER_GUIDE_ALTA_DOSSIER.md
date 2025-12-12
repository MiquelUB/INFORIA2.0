# 🎓 How to Use: Alta Dossier Feature

## Overview

The **Alta Dossier** feature creates a comprehensive, unified clinical discharge document that includes:
1. **IA-Generated Synthesis**: Professional summary of entire treatment journey
2. **Complete Historical Annexe**: All previous reports consolidated into one master document
3. **Automatic Cleanup**: Old individual reports removed from Drive after successful consolidation

## When to Use Alta Dossier

Use this when:
- ✅ Patient is being discharged/case is closing
- ✅ You want a unified master document with complete history
- ✅ You need to consolidate multiple individual reports into one
- ✅ You want automatic cleanup of old drive files
- ✅ Insurance/legal documentation needs complete case history

Don't use this when:
- ❌ Creating first-visit assessment (use "Primera Visita" instead)
- ❌ Creating follow-up/progress note (use "Seguimiento" instead)
- ❌ Patient still in active treatment

## Step-by-Step Usage

### Step 1: Select Patient
```
- Navigate to patient session page
- Patient should have at least one existing report
- (Alta Dossier works best with 3+ reports to show full progression)
```

### Step 2: Select Report Type
```
Currently: Select 'alta_paciente' in report type dropdown
(Future: Will have dedicated "Alta Dossier" button)

Code path: reportType state setter
```

### Step 3: Add Session Notes (Optional)
```
For dossier, session data is optional:
- Audio recording: Can add, but AI will focus on history
- Clinical notes: Can add additional observations
- Files: Can attach, but primary focus is historical synthesis
```

### Step 4: Click "Generar Informe"
```
System will:
1. ✅ Load ALL patient reports (not just last 3)
2. ✅ Sort chronologically (oldest to newest)
3. ✅ Pass complete history to IA
4. ✅ Generate comprehensive synthesis
5. ✅ Create unified document with annexe
6. ✅ Upload to Google Drive
7. ✅ Delete old individual reports from Drive
8. ✅ Update database
9. ✅ Update CRM
```

### Step 5: Success Notification
```
Toast message:
"¡Dossier clínico generado y consolidado exitosamente!"
+ "Carpeta del paciente optimizada: X informes antiguos eliminados."
```

## What Gets Created

### Document Structure
```
FILE: DOSSIER CLÍNICO DE ALTA
  ├─ PARTE I: INFORME DE SÍNTESIS Y CIERRE
  │  ├─ Resumen Ejecutivo de Alta
  │  ├─ Cronología Clínica y Evolución
  │  ├─ Juicio Diagnóstico Final (DSM-5/CIE-10)
  │  ├─ Resumen de Intervenciones y Logros
  │  └─ Conclusiones y Recomendaciones Post-Alta
  │
  └─ PARTE II: ANEXO DOCUMENTAL (HISTORIAL COMPLETO)
     ├─ [FECHA: DD/MM/YYYY] - TIPO: primera_visita
     │  [Full content of first report]
     │
     ├─ [FECHA: DD/MM/YYYY] - TIPO: seguimiento
     │  [Full content of follow-up 1]
     │
     └─ [FECHA: DD/MM/YYYY] - TIPO: seguimiento
        [Full content of follow-up 2]
```

### What Happens in Drive
```
BEFORE:
  /iNFORiA_INFORMES/[PatientName]/
    ├─ Informe Primera Visita - [Name] - 2025-01-15.md
    ├─ Informe de Seguimiento - [Name] - 2025-02-15.md
    └─ Informe de Seguimiento - [Name] - 2025-03-15.md
    (Multiple files, harder to manage)

AFTER:
  /iNFORiA_INFORMES/[PatientName]/
    └─ DOSSIER CLÍNICO DE ALTA - [Name] - 2025-03-31.md
    (Single unified file, old files cleaned up)
```

## Console Logging

During execution, you'll see:

```
✅ MODO ALTA DOSSIER: Compilando historial COMPLETO del paciente...
✅ Informes incluidos en historial: 3
📚 Modo ALTA DOSSIER: Incluiendo historial completo...

[... normal phases 1-4 ...]

🗑️ FASE 5: Limpieza de informes antiguos en Drive...
✅ Informe antiguo eliminado: Informe Primera Visita - [Name] - ...
✅ Informe antiguo eliminado: Informe de Seguimiento - [Name] - ...
✅ Limpieza completada: 2 informes eliminados
✅ Carpeta del paciente optimizada: 2 informes antiguos eliminados.
```

## AI Synthesis Example

IA will generate something like:

```
## 1. RESUMEN EJECUTIVO DE ALTA
El paciente [Name], edad [X], fue admitido en consulta el [fecha] 
con presentación clínica de [síntomas iniciales]. Tras [N] sesiones 
de tratamiento durante [duración], se evidencia mejora significativa 
en [síntomas mejorados], estabilización en [síntomas estables], 
por lo que se procede al alta con [recomendaciones].

## 2. CRONOLOGÍA CLÍNICA Y EVOLUCIÓN

### FASE 1: Evaluación Inicial (Sesión 1 - DD/MM/YY)
Estado inicial: [Síntomas 1, 2, 3]...

### FASE 2: Intervención Activa (Sesiones 2-5 - DD/MM/YY a DD/MM/YY)
Respuesta terapéutica: [Mejoras observadas]...

### FASE 3: Seguimiento y Consolidación (Sesión 6 - DD/MM/YY)
Estado actual: [Síntomas remitidos, mejorías mantenidas]...

## 3. JUICIO DIAGNÓSTICO FINAL
**Diagnóstico Principal (DSM-5/CIE-10):**
F32.1 / Trastorno Depresivo Mayor, Episodio Moderado

**Justificación:**
Basándose en la evaluación inicial [fecha] que mostró síntomas 
consistentes con criterios DSM-5, la aplicación de la escala BDI-II 
que documentó [puntuación] con [interpretación], y la evolución 
clínica positiva documentada en los seguimientos posteriores...

## 4. RESUMEN DE INTERVENCIONES Y LOGROS
- Técnica 1: TCC + CBT - EXITOSA
  └─ Objetivo: Reducción de síntomas depresivos → LOGRADO
- Técnica 2: Psicoeducación - EXITOSA
  └─ Objetivo: Comprensión de mecanismos → LOGRADO
- Seguimiento posterior: RECOMENDADO
  └─ Objetivo: Prevención de recaída → EN PROCESO

## 5. CONCLUSIONES Y RECOMENDACIONES POST-ALTA
Se recomienda:
- Continuidad con psicólogo en seguimiento trimestral
- Vigilancia de síntomas prodromales
- Mantención de técnicas de manejo del estrés aprendidas
```

## Database Changes

After dossier creation:

```sql
-- New report created
INSERT INTO reports (
  patient_id,
  report_type,     -- 'alta_paciente' (not 'primera_visita')
  title,           -- 'DOSSIER CLÍNICO DE ALTA - [Name] - [Date]'
  content,         -- Synthesis + all previous reports
  google_drive_file_id,
  status,
  created_at
) VALUES (...)

-- Old reports remain in DB but with no corresponding Drive files
-- (For archival/audit purposes)
```

## CRM Integration

Google Sheets PatientReports worksheet gets:

| Date | Patient | ReportType | Title | Status | DriveLink |
|------|---------|-----------|-------|--------|-----------|
| 2025-03-31 | [Name] | Dossier de Alta | DOSSIER CLÍNICO DE ALTA - [Name] - 2025-03-31 | Completado | [link] |

## Troubleshooting

### Issue: "No reports found to include in dossier"
**Cause:** Patient has no existing reports
**Solution:** Create at least one "Primera Visita" report first

### Issue: "Old files not deleted from Drive"
**Cause:** Missing Google OAuth token
**Solution:** Re-authenticate with Google; dossier still created

### Issue: "Dossier doesn't include all reports"
**Cause:** Some old reports lack `google_drive_file_id`
**Solution:** This is normal - only reports with Drive links can be referenced

### Issue: "Document looks cluttered/unformatted"
**Cause:** PDF vs Markdown rendering differences
**Solution:** View in Google Docs editor (online) for best formatting

## Security & Compliance

✅ **All original data preserved**: Database records remain
✅ **Audit trail maintained**: Can see all historical reports
✅ **HIPAA compliant**: Files encrypted in Google Drive
✅ **Access controlled**: Only authorized users can access
✅ **Backup recommended**: Google Drive is backed up

## Advanced Options (Future)

These features are planned:
- [ ] Choose which reports to include (not all)
- [ ] Custom date range selection
- [ ] PDF export (not just Google Docs)
- [ ] Email dossier to patient
- [ ] Archive instead of delete old files
- [ ] Automatic dossier at milestones (5 sessions, 1 year, etc.)

## FAQ

**Q: Can I undo a dossier deletion?**
A: Not automatically, but you can export from Drive trash within 30 days.

**Q: What if I need the old files after deletion?**
A: Database records still exist. Old files are in Drive trash. Contact support.

**Q: Can I create multiple dossiers for one patient?**
A: Yes, each time you'll create a new dossier. Old ones won't be deleted again (only first dossier deletes old reports).

**Q: What format is the dossier?**
A: Markdown stored in Google Docs format (.gdoc). Convert to PDF for sharing.

**Q: Can I edit a dossier after creation?**
A: Yes, edit directly in Google Docs. Changes won't affect database.

**Q: Is there a limit to report count?**
A: No theoretical limit, but practical limit ~50 reports (becomes unwieldy).

---

## Quick Reference Card

```
ALTA DOSSIER FEATURE
====================

WHEN:     Case closing / patient discharge
WHAT:     Unified master document with synthesis + history
HOW:      Select 'alta_paciente' → Click "Generar Informe"
RESULT:   
  ✅ Master dossier created
  ✅ Old files cleaned up
  ✅ Database updated
  ✅ CRM entry added

CONTAINS:
  Part I:  AI synthesis (5 sections)
  Part II: Complete historical annexe (all reports)

MAGIC:    Automatic drive cleanup (Phase 5)
```

---

**Last Updated:** This session
**Status:** ✅ Feature Complete
**Ready for Use:** Yes
