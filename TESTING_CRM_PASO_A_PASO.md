# 🧪 GUÍA PASO A PASO: CREAR PACIENTE + CRM Y VERIFICAR URL

## 📋 OBJETIVO

Crear un paciente y verificar que:
1. ✅ El paciente se crea en Supabase
2. ✅ El Google Sheet (CRM) se crea en Google Drive
3. ✅ La **URL del CRM se obtiene correctamente**
4. ✅ La **URL se guarda en la BD** (Supabase)

---

## 🔧 MEJORAS REALIZADAS

He actualizado el código para que el logging sea **muy explícito** sobre la URL:

### En `NewPatientClient.tsx`:
```typescript
console.log('✅ PASO 3 OK - CRM creado en Google Sheets');
console.log('  📄 ID del Sheet:', crmResult.fileId);
console.log('  🔗 URL del CRM:', crmResult.webViewLink);  // ← AQUÍ ESTÁ LA URL
console.log('✅ Referencias del CRM guardadas exitosamente en BD');
console.log('  📄 google_sheet_id:', crmResult.fileId);
console.log('  🔗 google_sheet_url:', crmResult.webViewLink);  // ← AQUÍ ESTÁ GUARDADA
```

### En `googleDrive.ts`:
```typescript
const webViewLink = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;
console.log('✅ CRM Sheet creado para paciente:', sheetId);
console.log('🔗 URL del CRM:', webViewLink);  // ← LOG EXPLÍCITO DE LA URL
```

---

## ⚙️ PASOS A SEGUIR

### PASO 1: Abre DevTools

```
1. Ve a http://localhost:3000/new-patient
2. Presiona F12 (o Ctrl+Shift+I)
3. Abre la pestaña "Console"
4. Deja la consola visible
```

### PASO 2: Rellena el Formulario

```
Nombre:                Juan
Apellido:              Pérez  
Email:                 juan.perez.test@example.com
Teléfono:              +34 612 345 678
Fecha de Nacimiento:   15/05/1990
Género:                Masculino
Dirección:             Calle Test 123
Contacto de Emergencia: María García
Teléfono Emergencia:   +34 612 345 679
Notas:                 Paciente de prueba para verificar CRM
```

### PASO 3: Click "Crear Paciente"

```
1. Click en el botón azul "Crear Paciente"
2. Observa la consola (F12 → Console tab)
3. Espera 3-5 segundos mientras procesa
```

---

## 📝 LOGS QUE DEBERÍAS VER EN CONSOLA

Copia y pega esto en búsqueda de orden exacto:

```
✅ PASO 1 OK - Paciente creado (ID: [UUID])

⏭️ PASO 2 OMITIDO - Sin fecha/hora de cita

📝 PASO 3: Creando CRM en Google Sheets...
✅ Google Sheet creado - ID: [ID-LARGO-AQUI]
✅ CRM Sheet creado para paciente: [ID-LARGO-AQUI]
🔗 URL del CRM: https://docs.google.com/spreadsheets/d/[ID-LARGO-AQUI]/edit

💾 Guardando referencias del CRM en BD...
✅ Referencias del CRM guardadas exitosamente en BD
  📄 google_sheet_id: [ID-LARGO-AQUI]
  🔗 google_sheet_url: https://docs.google.com/spreadsheets/d/[ID-LARGO-AQUI]/edit

📊 RESUMEN DE CREACIÓN:
  - Paciente: ✅ Creado (ID: [UUID])
  - Cita: ⏭️ No solicitada
  - CRM: ✅ Creado

✅ Éxito - Paciente y datos asociados creados correctamente
```

---

## ✅ VERIFICACIONES

### VERIFICACIÓN 1: Redirección

```
✓ Después de crear, deberías ir a /patient-list
✓ El navegador debe mostrar una lista de pacientes
✓ "Juan Pérez" debe aparecer en la lista
```

### VERIFICACIÓN 2: Google Drive

```
1. Abre Google Drive en otra pestaña
2. Busca la carpeta "Pacientes"
3. Dentro debe existir: "Juan Pérez [UUID]"
4. Dentro debe existir Google Sheet: "CRM - Juan Pérez"

Estructura esperada:
  Mi unidad
  ├─ Pacientes/
  │  ├─ Juan Pérez 12a34b5c-d6e7-8f9g-0hijk-lmn1opq2r3s4/
  │  │  ├─ CRM - Juan Pérez (Google Sheet)
  │  │  ├─ Reportes/ (carpeta)
  │  │  └─ ...
```

### VERIFICACIÓN 3: Supabase

```
1. Abre Supabase (https://app.supabase.com)
2. Ve a tu proyecto INFORIA
3. Tabla: "patients"
4. Busca el nuevo paciente "Juan Pérez"
5. Revisa estos campos:
   ✓ google_sheet_id: [debe tener un valor]
   ✓ google_sheet_url: https://docs.google.com/spreadsheets/d/[ID]/edit
   ✓ name: Juan Pérez
   ✓ email: juan.perez.test@example.com
   ✓ user_id: [tu ID de usuario]
```

### VERIFICACIÓN 4: Contenido del CRM en Google Sheets

```
1. Abre el Google Sheet "CRM - Juan Pérez"
2. Debe tener 3 hojas:
   ✓ Hoja 1: "Información"
      - Nombre: Juan Pérez
      - Email: juan.perez.test@example.com
      - Teléfono: +34 612 345 678
      - Fecha Nacimiento: 15/05/1990
      - Fecha Creación CRM: [fecha de hoy]
   
   ✓ Hoja 2: "Pagos"
      - Headers: Fecha, Concepto, Monto, Estado
   
   ✓ Hoja 3: "Informes"
      - Headers: Fecha, Tipo de Sesión, Duración, Notas Clínicas, Próxima Cita
```

---

## 🔗 URL DEL CRM - INFORMACIÓN IMPORTANTE

La URL del CRM sigue este patrón:

```
https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
```

**Donde:**
- `SHEET_ID` = ID único del Google Sheet
- Es diferente para cada paciente
- Se obtiene de la respuesta de Google Drive API
- Se construye como: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`

**Ejemplo real:**
```
https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7/edit
```

---

## 🚨 POSIBLES PROBLEMAS

### Problema: "No tienes permisos de Google Drive"

```
❌ Error: No tienes permisos de Google Drive. Re-autentica tu cuenta.
```

**Solución:**
1. Logout de la app (/login → logout)
2. Vuelve a hacer login
3. Acepta todos los permisos de Google
4. Intenta crear paciente de nuevo

---

### Problema: "URL del CRM no válida"

```
❌ ERROR: URL del CRM no válida: undefined
```

**Solución:**
1. Revisa console → Network tab
2. Busca llamada a `https://www.googleapis.com/drive/v3/files`
3. Verifica que la respuesta tenga un campo `id`
4. Asegúrate de que los headers de Authorization sean correctos

---

### Problema: "Error guardando CRM"

```
❌ Error al guardar referencia del CRM: ...
```

**Solución:**
1. Verifica que la tabla `patients` existe en Supabase
2. Verifica que existen columnas: `google_sheet_id` y `google_sheet_url`
3. Verifica que no hay RLS restrictivo en esas columnas
4. Revisa la consola para más detalles

---

### Problema: La carpeta no se crea

```
❌ Error creando carpeta del paciente
```

**Solución:**
1. Verifica que Google Drive API esté habilitada en Google Cloud
2. Verifica que la service account tenga permisos de Drive
3. Revisa las variables de entorno

---

## 📊 TABLA DE VERIFICACIÓN FINAL

| Verificación | ¿Se completó? | Detalles |
|---|---|---|
| Paciente creado en BD | ✅/❌ | ID: __________ |
| Google Sheet creado | ✅/❌ | ID: __________ |
| URL obtenida | ✅/❌ | https://docs.google.com/spreadsheets/d/... |
| URL guardada en BD | ✅/❌ | Campo google_sheet_url tiene valor |
| Redirigido a /patient-list | ✅/❌ | Aparece "Juan Pérez" en lista |
| Carpeta en Google Drive | ✅/❌ | "Pacientes/Juan Pérez [ID]" existe |
| Sheet en carpeta | ✅/❌ | "CRM - Juan Pérez" existe |
| 3 hojas creadas | ✅/❌ | Información, Pagos, Informes |
| Datos en Hoja Información | ✅/❌ | Nombre, Email, Teléfono, etc. |

---

## 📞 SI HAY PROBLEMAS

1. **Abre DevTools (F12)**
2. **Copia TODOS los logs de la consola**
3. **Busca líneas que empiecen con:**
   - ❌ (error)
   - ⚠️ (warning)
   - ✅ (success)
4. **Proporciona esos logs para análisis**

---

## ✨ RESUMEN

Este flujo ahora:
- ✅ Crea el paciente en Supabase
- ✅ Crea la carpeta en Google Drive
- ✅ Crea el Google Sheet (CRM)
- ✅ Obtiene la URL correctamente
- ✅ Guarda la URL en Supabase
- ✅ Muestra logs explícitos de cada paso
- ✅ Valida que la URL sea válida antes de guardar

**Toda la información del CRM está centralizada y accesible.**

¡Listo para probar! 🚀
