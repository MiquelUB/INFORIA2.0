# 🗺️ Flujo de Navegación - INFORIA 2.0

## 📍 Rutas Principales

### 1. **Autenticación**
```
GET /login
└─ Supabase Auth + Google OAuth
   └─ Redirect a /dashboard (si autenticado)
   └─ Redirect a /auth/callback (OAuth callback)
```

**Componentes:**
- `app/(app)/(auth)/login/page.tsx` - Página de login
- Supabase client-side auth

**APIs Involucradas:**
- ✅ Supabase Auth (Google OAuth)
- ✅ NEXT_PUBLIC_GOOGLE_CLIENT_ID

---

### 2. **Dashboard Principal**
```
GET /dashboard
├─ Muestra estadísticas generales
├─ Citas del mes (calendario)
├─ Lista de pacientes hoy
└─ Acciones rápidas
```

**Componentes:**
- `app/(app)/dashboard/page.tsx`
- `DashboardHeader.tsx`
- `CalendarModule.tsx`

**APIs Involucradas:**
- `GET /api/get-patient-appointments?month={m}&year={y}` - Citas por mes
- Supabase: tabla `appointments` con RLS
- ✅ OPENROUTER_API_KEY (para análisis)
- ✅ OPENAI_API_KEY (transcripción)

**Flujo de Datos:**
```
useEffect → fetchAppointments()
    ↓
GET /api/get-patient-appointments
    ↓
Supabase (appointments table)
    ↓
Map a structure de citas
    ↓
Render calendar + list
```

---

### 3. **Lista de Pacientes**
```
GET /patients
├─ Búsqueda por nombre, email, teléfono
├─ Ordenado por fecha de creación
├─ Cada paciente tiene opciones (Ver, Editar, Más)
└─ Botón "+ Nuevo Paciente"
```

**Componentes:**
- `app/(app)/patients/page.tsx`
- Hook: `usePatients()` → Supabase directamente

**APIs Involucradas:**
- Supabase `patients` table (RLS protect)
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY

**Flujo de Datos:**
```
usePatients() hook
    ↓
patientsService.getAll() 
    ↓
Supabase query (.select('*').order('created_at'))
    ↓
Filter en cliente (search)
    ↓
Render lista con Avatar + datos
```

---

### 4. **Detalle del Paciente**
```
GET /patients/:id
├─ Info personal (nombre, email, teléfono, etc)
├─ 📋 REPORTES DEL PACIENTE ← Connected to API
│  ├─ Título, fecha, tipo
│  ├─ Ver en Google Drive
│  └─ Descargar/Eliminar
├─ 💳 HISTORIAL DE PAGOS (pending)
├─ 🔔 Historial clínico
└─ Botones: Editar, Eliminar, + Nuevo Reporte
```

**Componentes:**
- `app/(app)/patients/[id]/page.tsx` - Main page
- Tabs para diferentes secciones

**APIs Involucradas:**
- ✅ `GET /api/get-patient-reports?patientId={id}` - **CONECTADO**
- `GET /api/get-patient-payments?patientId={id}` - Placeholder (vacío por ahora)
- Supabase: `patients`, `reports` tables (RLS protected)

**Flujo de Datos - REPORTES:**
```
usePatientReportsAndPayments(patientId)
    ↓
fetch('/api/get-patient-reports?patientId={id}')
    ↓
GET /api/get-patient-reports/route.ts
    ├─ Verifica autenticación
    ├─ Query Supabase reports.where(patient_id={id})
    └─ Devuelve Array[{id, title, created_at, status, google_drive_file_id}]
    ↓
Hook devuelve { reports, payments, loading }
    ↓
Component mapea reports → display format
    ↓
Render en tabla + links a Google Drive
```

---

### 5. **Crear Nuevo Reporte**
```
GET /reports/new
├─ Seleccionar paciente
├─ Input: texto
├─ Input: audio (VoiceRecorder)
└─ IA genera reporte automático
    
GET /reports/new/:patientId
└─ Pre-seleccionado el paciente
```

**Componentes:**
- `app/(app)/reports/new/page.tsx`
- `app/(app)/reports/new/[patientId]/page.tsx`
- `VoiceRecorder.tsx`
- `ReportGenerator.tsx`

**APIs Involucradas:**
- ✅ `OPENROUTER_API_KEY` - Generación de reportes con IA
- ✅ `OPENAI_API_KEY` - Transcripción de audio
- Supabase: insert en `reports` table (RLS protected)
- ✅ Google Drive API - Guardar PDF

**Flujo de Datos:**
```
User input (texto + audio)
    ↓
VoiceRecorder → transcribe with OpenAI Whisper
    ↓
ReportGenerator → send to OpenRouter
    ├─ Input: patientId + texto + transcripción
    └─ Output: clinical report (Markdown)
    ↓
Save a Supabase reports table
    ├─ Campos: patient_id, content, title, status, report_type
    └─ RLS rule: user_id debe coincidir con paciente.user_id
    ↓
Upload PDF a Google Drive
    └─ google_drive_file_id stored en reports.metadata
    ↓
Redirect a /patients/{id} (ver nuevo reporte)
```

---

### 6. **Sesión Clínica / Workspace**
```
GET /session/:patientId
├─ Grabación de audio
├─ Notas en tiempo real
├─ Playback de grabaciones anteriores
└─ Transcripción automática
```

**Componentes:**
- `app/(app)/session/[patientId]/page.tsx`
- `app/(app)/session-workspace/[patientId]/page.tsx`
- Audio recording + playback

**APIs Involucradas:**
- ✅ `OPENAI_API_KEY` - Transcripción Whisper
- Supabase: guardar sesiones + audio

---

### 7. **Nuevos Pacientes**
```
GET /new-patient
├─ Formulario: nombre, email, teléfono, etc
├─ Datos opcionales: dirección, persona de rescate
└─ Crear
    ↓
POST to Supabase
    ↓
Redirect a /patients/{newId}
```

**Componentes:**
- `app/(app)/new-patient/page.tsx`

**APIs Involucradas:**
- Supabase `patients` insert (RLS protected)

---

### 8. **Mi Cuenta**
```
GET /account
├─ Datos del usuario (perfil)
├─ Datos del profesional (especialidad, licencia, etc)
└─ Preferencias
```

**Componentes:**
- `app/(app)/account/page.tsx` - Perfil usuario
- `app/(app)/my-account/page.tsx` - Datos profesionales

**APIs Involucradas:**
- Supabase `profiles` + `professional_data` tables

---

### 9. **Búsqueda Universal**
```
GET /reports (o búsqueda global)
├─ Buscar reportes por contenido
├─ Buscar pacientes
└─ Búsqueda avanzada
```

**Componentes:**
- `SearchModule.tsx`

**APIs Involucradas:**
- Full-text search en Supabase

---

## 🔄 Flujo Principal Completo

### Caso de Uso: Psicólogo crea reporte para un paciente

```
1️⃣  LOGIN
    /login 
    └─ Supabase Auth + Google OAuth
    └─ Redirect /dashboard

2️⃣  DASHBOARD
    /dashboard
    └─ Ve citas del mes
    └─ Mira lista de pacientes de hoy

3️⃣  LISTA DE PACIENTES
    /patients
    └─ Busca paciente por nombre
    └─ Click en "Ver" o nombre del paciente

4️⃣  DETALLE DEL PACIENTE ⭐ AQUÍ ESTÁN LOS REPORTES
    /patients/[id]
    └─ Carga datos del paciente
    └─ usePatientReportsAndPayments() ← Get real reports from API
    └─ Muestra tabla de reportes
    └─ Click "+ Nuevo Reporte"

5️⃣  CREAR REPORTE
    /reports/new/[patientId]
    ├─ Graba audio (VoiceRecorder)
    ├─ Escribe notas (texto)
    ├─ Click "Generar Reporte"
    ├─ IA procesa con OpenRouter + OpenAI
    ├─ Guarda en Supabase
    ├─ Upload a Google Drive
    └─ Redirect /patients/[id]

6️⃣  DETALLE DEL PACIENTE (actualizado)
    /patients/[id]
    └─ usePatientReportsAndPayments() ← Re-fetch
    └─ Nuevo reporte aparece en tabla
    └─ User puede ver en Google Drive
```

---

## 🔌 Endpoints API Creados

### 1. `GET /api/get-patient-reports?patientId={id}`
**Status:** ✅ ACTIVO Y CONECTADO

```typescript
// Request
GET /api/get-patient-reports?patientId=uuid-del-paciente

// Response
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Reporte de seguimiento",
      "created_at": "2025-11-15T10:30:00Z",
      "report_type": "Seguimiento",
      "status": "Completado",
      "google_drive_file_id": "doc-id-123",
      "content": "..."
    }
  ]
}
```

**Implementación:** `/app/api/get-patient-reports/route.ts`
- ✅ Verifica autenticación
- ✅ Aplica RLS de Supabase
- ✅ Filtra por patient_id
- ✅ Retorna Array[Report]

---

### 2. `GET /api/get-patient-payments?patientId={id}`
**Status:** ⚠️ PLACEHOLDER (vacío, listo para pagos)

```typescript
// Request
GET /api/get-patient-payments?patientId=uuid-del-paciente

// Response
{
  "success": true,
  "data": []
}
```

---

### 3. `GET /api/get-dashboard-stats`
**Status:** ✅ ACTIVO

```typescript
// Response
{
  "total_patients": 15,
  "total_reports": 47,
  "total_appointments": 120,
  "recent_reports": [...]
}
```

---

### 4. `GET /api/get-patient-appointments?month={m}&year={y}`
**Status:** ✅ ACTIVO

```typescript
// Request
GET /api/get-patient-appointments?month=11&year=2025

// Response
{
  "success": true,
  "data": [
    {
      "date": "2025-11-15",
      "patient_name": "Juan Pérez",
      "time": "10:30",
      "type": "Sesión"
    }
  ]
}
```

---

### 5. `GET /api/health`
**Status:** ✅ VALIDACIÓN

Tests conexión a todas las APIs externas:
- ✅ Supabase
- ✅ OpenRouter
- ✅ OpenAI
- ✅ Google OAuth
- ❌ Stripe (401 - no importa por ahora)

---

### 6. `GET /api/validate-env`
**Status:** ✅ VALIDACIÓN

Verifica que todas las variables de entorno estén configuradas.

---

## 🛠️ Variables de Entorno Requeridas

### ✅ Configuradas correctamente

| Variable | Estado | Servicio |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase |
| `NEXT_PUBLIC_OPENROUTER_API_KEY` | ✅ | OpenRouter (IA reports) |
| `OPENAI_API_KEY` | ✅ | OpenAI (Whisper) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | ✅ | Google OAuth |
| `NEXT_GOOGLE_SERVICE_ACCOUNT_EMAIL` | ✅ | Google Drive |
| `NEXT_GOOGLE_ACCOUNT_PRIVATE_KEY` | ✅ | Google Drive |

### ⚠️ No funciona

| Variable | Estado | Servicio |
|----------|--------|---------|
| `STRIPE_SECRET_KEY` | ❌ 401 | Stripe (no usado aún) |

---

## 📊 Estado de la App

### Flujos Operacionales ✅
- [x] Login con Supabase + Google OAuth
- [x] Dashboard con citas del mes
- [x] Lista de pacientes (búsqueda funciona)
- [x] Detalle del paciente (carga datos reales)
- [x] **Reportes en detalle del paciente** ← CONECTADO A API
- [x] Crear nuevo paciente

### Flujos Parciales ⚠️
- [ ] Crear reporte (necesita flujo completo)
- [ ] Sesiones clínicas (grabar audio)
- [ ] Pagos (placeholder)

### Flujos No Iniciados ❌
- [ ] Integración de pagos (Stripe)
- [ ] Exportar reportes
- [ ] Búsqueda avanzada

---

## 🧪 Cómo Probar el Flujo

### Test 1: Ver reportes de un paciente
```bash
1. Login en /login
2. Ir a /patients
3. Buscar/seleccionar un paciente
4. Click en el paciente
5. Ver sección de "REPORTES"
   └─ Los reportes se cargan desde /api/get-patient-reports
   └─ Si no hay reportes, array estará vacío
```

### Test 2: Crear un nuevo reporte
```bash
1. En detalle del paciente (/patients/[id])
2. Click "+ Nuevo Reporte"
3. Ir a /reports/new/[patientId]
4. Llenar datos (texto + audio)
5. Click "Generar"
6. Esperar a que IA procese
7. Volver a /patients/[id]
8. Ver nuevo reporte en lista
```

### Test 3: Validar todas las APIs
```bash
1. python validate_apis.py
2. Ver estado de cada servicio:
   - ✅ Supabase
   - ✅ OpenRouter
   - ✅ OpenAI
   - ✅ Google
   - ❌ Stripe (ignorar por ahora)
```

---

## 🔐 Seguridad (RLS en Supabase)

Todas las tablas tienen **Row Level Security** configurado:

```sql
-- Solo pueden ver sus propios datos
SELECT * FROM patients WHERE user_id = auth.uid()
SELECT * FROM reports WHERE patient.user_id = auth.uid()
SELECT * FROM appointments WHERE user_id = auth.uid()
```

El usuario no puede acceder a datos de otros psicólogos.

---

## 📝 Notas

- Todos los datos están en **Supabase PostgreSQL**
- Reportes se guardan en **Google Drive**
- IA usa **OpenRouter** (LLM) + **OpenAI** (Whisper)
- Autenticación: **Supabase + Google OAuth**
- Base de datos: **PostgreSQL** en Supabase
- Frontend: **Next.js 14** App Router

---

## 🚀 Próximos Pasos

1. **Probar flujo de crear reportes**
   - Verificar que OpenRouter + OpenAI funcionan correctamente
   - Guardar en Supabase
   - Upload a Google Drive

2. **Implementar Pagos**
   - Corregir Stripe (o usar alternativa)
   - Crear endpoint de pagos

3. **Optimizaciones**
   - Cache de queries
   - Paginación en listas
   - Búsqueda avanzada

4. **Testing**
   - Test e2e con Playwright
   - Unit tests para servicios
   - Integration tests para APIs
