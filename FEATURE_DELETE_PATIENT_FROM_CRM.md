# 🗑️ Feature: Eliminar Paciente del CRM de Google Sheets

**Fecha**: 2025-12-17  
**Feature**: Sincronización de eliminación de pacientes entre base de datos y CRM de Google Sheets

---

## 📋 Descripción

Cuando se elimina un paciente de la base de datos, ahora también se elimina automáticamente del CRM de Google Sheets para mantener la sincronización de datos.

---

## ✅ Implementación

### **1. Nuevo Método en `googleSheetsPatientCRM.ts`**

```typescript
async deletePatientFromCRM(
  token: string | null, 
  patientId: string, 
  sheetId?: string
): Promise<boolean>
```

**Funcionalidad**:
1. Busca la fila del paciente en la pestaña 'Pacientes' por ID
2. Obtiene el `sheetId` numérico de la pestaña
3. Elimina la fila completa usando la API de Google Sheets (`deleteDimension`)
4. Retorna `true` si se eliminó exitosamente, `false` si no se encontró o hubo error

**Características**:
- ✅ Manejo robusto de errores
- ✅ Logs descriptivos con emojis
- ✅ No bloquea si el paciente no existe en el CRM
- ✅ Usa la API de Google Sheets `batchUpdate` para eliminar filas

---

### **2. Actualización de `deletePatient` en `actions.ts`**

**Flujo Actualizado**:

```
1. Obtener información del paciente (id, name, google_sheet_id, user_id)
   ↓
2. Si tiene google_sheet_id:
   a. Obtener google_access_token del usuario
   b. Llamar a deletePatientFromCRM()
   c. Log del resultado
   ↓
3. Eliminar paciente de la base de datos
   ↓
4. Invalidar caché de /patient-list
   ↓
5. Retornar success: true
```

**Manejo de Errores**:
- Si falla la eliminación del CRM, **no se bloquea** la eliminación de la base de datos
- Se registran warnings pero se continúa con el proceso
- Solo se bloquea si falla la eliminación de la base de datos

---

## 🔄 Flujo de Eliminación

### **Caso 1: Paciente con CRM**
```
Usuario hace clic en "Eliminar Paciente"
  ↓
Confirma en el diálogo
  ↓
deletePatient(patientId) se ejecuta
  ↓
1. Obtiene datos del paciente (incluye google_sheet_id)
  ↓
2. Obtiene google_access_token del perfil del usuario
  ↓
3. Llama a deletePatientFromCRM()
   - Busca la fila en Google Sheets
   - Elimina la fila
   - Log: "✅ Paciente eliminado del CRM"
  ↓
4. Elimina el paciente de Supabase
  ↓
5. Invalida caché
  ↓
6. Redirige a /patient-list
```

### **Caso 2: Paciente sin CRM**
```
Usuario hace clic en "Eliminar Paciente"
  ↓
Confirma en el diálogo
  ↓
deletePatient(patientId) se ejecuta
  ↓
1. Obtiene datos del paciente (google_sheet_id es null)
  ↓
2. Salta la eliminación del CRM
  ↓
3. Elimina el paciente de Supabase
  ↓
4. Invalida caché
  ↓
5. Redirige a /patient-list
```

---

## 📝 Logs Implementados

### **Logs de Éxito**
```
🗑️ Eliminando paciente Juan Pérez del CRM de Google Sheets...
✅ Paciente Juan Pérez eliminado del CRM de Google Sheets
✅ Paciente Juan Pérez eliminado completamente
```

### **Logs de Warning**
```
⚠️ No token provided for deleting patient from CRM
⚠️ No CRM sheet found
⚠️ Paciente abc-123 no encontrado en CRM
⚠️ No se pudo obtener token de Google para eliminar del CRM
```

### **Logs de Error**
```
❌ Error eliminando paciente del CRM: [detalles del error]
Error eliminando del CRM (continuando con eliminación de DB): [error]
```

---

## 🧪 Testing

### **Escenarios de Prueba**

1. **Eliminar paciente con CRM sincronizado**
   - Crear paciente
   - Verificar que aparece en Google Sheets
   - Eliminar paciente
   - ✅ Verificar que se elimina de Google Sheets
   - ✅ Verificar que se elimina de la base de datos

2. **Eliminar paciente sin CRM**
   - Crear paciente sin sincronizar con Google Sheets
   - Eliminar paciente
   - ✅ Verificar que se elimina de la base de datos sin errores

3. **Eliminar paciente cuando falla el CRM**
   - Simular error en Google Sheets API
   - Eliminar paciente
   - ✅ Verificar que se elimina de la base de datos de todos modos
   - ✅ Verificar que se registra el warning

---

## 🔐 Seguridad

- ✅ Solo el propietario del paciente puede eliminarlo (verificado por RLS de Supabase)
- ✅ Se usa el `google_access_token` del usuario autenticado
- ✅ No se exponen tokens en los logs
- ✅ Manejo seguro de errores sin exponer información sensible

---

## 📊 Impacto

### **Archivos Modificados**
1. `lib/services/googleSheetsPatientCRM.ts` (+105 líneas)
   - Nuevo método `deletePatientFromCRM`

2. `app/(app)/patients/actions.ts` (+61 líneas, -20 líneas)
   - Actualizada función `deletePatient`

### **Beneficios**
- ✅ Sincronización automática entre base de datos y CRM
- ✅ Evita datos huérfanos en Google Sheets
- ✅ Mejor experiencia de usuario
- ✅ Logs claros para debugging

---

## 🚀 Próximos Pasos

1. **Testing en producción**
   - Probar eliminación de pacientes
   - Verificar logs en Vercel
   - Confirmar sincronización con Google Sheets

2. **Posibles Mejoras Futuras**
   - Eliminar también informes y citas del paciente en el CRM
   - Implementar "soft delete" en lugar de eliminación permanente
   - Añadir confirmación adicional para pacientes con muchos informes

---

**Implementado por**: Gemini AI Agent  
**Fecha**: 2025-12-17
