# ✅ Guía de Validación: Sistema de Créditos

## 📋 Requisitos Previos

Antes de validar, asegúrate de que:

1. **Base de datos Supabase está activa**
   ```sql
   -- Verificar que la tabla profiles existe
   SELECT * FROM profiles LIMIT 1;
   ```

2. **Columnas de créditos existen**
   ```sql
   -- En Supabase SQL Editor, ejecuta:
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'profiles' 
   AND column_name LIKE 'credit%';
   ```

3. **El usuario tiene créditos asignados**
   ```sql
   -- Ver créditos del usuario actual
   SELECT id, full_name, credits_limit, credits_used 
   FROM profiles 
   WHERE id = 'tu-user-id';
   ```

---

## 🧪 Pasos de Validación

### Paso 1: Abrir la Página de Testing

1. En la aplicación, navega a: `/credits-test`
2. Deberías ver el componente **"Validador de Créditos"**

### Paso 2: Validar Créditos

**Botón**: `Validar Créditos`

**Qué verifica**:
- ✅ Usuario está autenticado
- ✅ Perfil existe en BD
- ✅ Campo `credits_limit` existe y tiene un valor
- ✅ Campo `credits_used` existe y tiene un valor
- ✅ Se calcula correctamente: `available = limit - used`

**Resultado esperado**:
```
✅ EXITOSO
Créditos validados correctamente. Usuario: [nombre]

Detalles:
{
  "userExists": true,
  "profileExists": true,
  "hasCreditsLimit": true,
  "hasCreditsUsed": true,
  "creditsLimit": 50,
  "creditsUsed": 0,
  "availableCredits": 50
}
```

**Si falla**:
- Mensaje: "❌ No se encontró perfil de usuario"
- Causa: El usuario no tiene un registro en `profiles`
- Solución: Crear el registro manualmente o ejecutar la función de onboarding

---

### Paso 3: Test de Descuento

**Botón**: `Test Descuento`

**Qué hace** (es REVERSIBLE):
1. Lee créditos actuales
2. Descuenta 1 crédito
3. Verifica que se aplicó
4. **Revierte el cambio** (importante: no es destructivo)

**Resultado esperado**:
```
✅ EXITOSO
Test de descuento completado exitosamente (crédito revertido)

Detalles:
{
  "creditsLimit": 50,
  "beforeDecrement": { "credits_used": 0 },
  "afterDecrement": { "credits_used": 1 },
  "decrementSuccessful": true
}
```

**Si falla**:
- Mensaje: "❌ No hay créditos disponibles"
- Causa: `credits_used >= credits_limit`
- Solución: Aumentar `credits_limit` en Supabase

---

### Paso 4: Reporte Completo

**Botón**: `Reporte Completo`

**Qué muestra**:
- Nombre del usuario
- Plan actual (professional/clinic)
- Créditos totales (limit)
- Créditos usados
- Créditos disponibles
- **Porcentaje de uso**
- Fecha de creación/actualización

**Resultado esperado**:
```
✅ EXITOSO
📊 Reporte de Créditos - Juan Pérez

Detalles:
{
  "full_name": "Juan Pérez",
  "plan_type": "professional",
  "creditsLimit": 50,
  "creditsUsed": 25,
  "availableCredits": 25,
  "percentageUsed": 50
}
```

---

## 🔍 Validación Manual en SQL

Si prefieres verificar directamente en la BD:

```sql
-- 1. Ver todos los usuarios con créditos
SELECT 
  id,
  full_name,
  email,
  credits_limit,
  credits_used,
  (credits_limit - credits_used) as available_credits,
  ROUND((credits_used::float / credits_limit * 100), 2) as percentage_used
FROM profiles
WHERE credits_limit IS NOT NULL
ORDER BY percentage_used DESC;

-- 2. Verificar que el descuento se aplica
SELECT id, full_name, credits_used, updated_at 
FROM profiles 
WHERE id = 'uuid-del-usuario'
ORDER BY updated_at DESC 
LIMIT 5;

-- 3. Contar cuántos usuarios tienen créditos bajos (≤10)
SELECT COUNT(*) as low_credits_users
FROM profiles
WHERE (credits_limit - credits_used) <= 10
AND credits_limit > 0;
```

---

## 📊 Flujo Completo de Validación

```
┌─────────────────────────────────────────┐
│  1. Validar Créditos                    │
│  ✓ Usuario existe                       │
│  ✓ Perfil existe                        │
│  ✓ Campos están presentes               │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  2. Test Descuento (Reversible)         │
│  ✓ Descuenta 1 crédito                  │
│  ✓ Verifica cambio                      │
│  ✓ Revierte cambio                      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  3. Reporte Completo                    │
│  ✓ Muestra estado actual                │
│  ✓ Calcula porcentaje                   │
│  ✓ Información completa                 │
└─────────────────────────────────────────┘
                  │
                  ▼
        ✅ SISTEMA VALIDADO
```

---

## 🚀 Validar en Producción

Una vez que hayas confirmado que todo funciona:

### Test Real: Generar Informe

1. Ve a una sesión de paciente
2. Genera un informe
3. Espera a que se descuente el crédito
4. Abre `/credits-test` y ejecuta **Reporte Completo**
5. Verifica que `credits_used` incrementó en 1

### Test Email: Créditos Bajos

1. Tener usuario con ≤10 créditos disponibles
2. Generar un informe
3. **Debe llegar un email automático** con:
   - ⚠️ Alerta de créditos bajos
   - 📊 Créditos restantes
   - 🔗 Enlace a renovación de plan

---

## 🐛 Troubleshooting

### Error: "No hay usuario autenticado"
```
Causa: No iniciaste sesión
Solución: Completa el login primero
```

### Error: "Los campos de créditos no están configurados"
```
Causa: Falta credits_limit o credits_used
Solución: En Supabase, agrega estos campos al perfil del usuario:
  UPDATE profiles 
  SET credits_limit = 50, credits_used = 0
  WHERE id = 'uuid-usuario';
```

### Error: "No hay créditos disponibles"
```
Causa: credits_used >= credits_limit
Solución: En Supabase, resetea los créditos:
  UPDATE profiles 
  SET credits_used = 0
  WHERE id = 'uuid-usuario';
```

### El descuento no se aplica
```
Causa: Problema con permisos de Supabase
Solución: 
  1. Verifica que el usuario puede actualizar profiles
  2. Revisa RLS policies en Supabase
  3. Asegúrate de que profiles.id = auth.uid()
```

---

## ✅ Checklist Final

- [ ] Página `/credits-test` se abre sin errores
- [ ] Botón "Validar Créditos" muestra ✅ Exitoso
- [ ] Botón "Test Descuento" muestra reversión exitosa
- [ ] Botón "Reporte Completo" muestra datos correctos
- [ ] Al generar informe, credits_used aumenta
- [ ] Con ≤10 créditos, se envía email de alerta
- [ ] Créditos se descuentan solo cuando hay disponibles
- [ ] No se permite generar informe sin créditos

---

## 📞 Soporte

Si algo no funciona:

1. Abre consola (F12)
2. Ejecuta las validaciones
3. Copia los resultados
4. Revisa los logs de Supabase
5. Verifica las variables de entorno

