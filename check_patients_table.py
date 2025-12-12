#!/usr/bin/env python3
"""
Script para verificar que la tabla 'patients' en Supabase tiene los campos
necesarios para guardar la información del CRM.
"""

import requests
import json
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

def check_patients_table():
    """Verifica la estructura de la tabla patients."""
    
    print("\n" + "="*70)
    print("🔍 VERIFICANDO TABLA 'patients' EN SUPABASE")
    print("="*70)
    
    if not SUPABASE_URL or not SERVICE_ROLE_KEY:
        print("❌ Variables de entorno no configuradas")
        print(f"  SUPABASE_URL: {'✅' if SUPABASE_URL else '❌'}")
        print(f"  SERVICE_ROLE_KEY: {'✅' if SERVICE_ROLE_KEY else '❌'}")
        return
    
    headers = {
        'Authorization': f'Bearer {SERVICE_ROLE_KEY}',
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY
    }
    
    # 1. Obtener información de la tabla
    print("\n1️⃣  ESTRUCTURA DE LA TABLA")
    print("-" * 70)
    
    try:
        # Usar endpoint de Supabase para obtener info de la tabla
        url = f"{SUPABASE_URL}/rest/v1/information_schema.columns?table_name=eq.patients&table_schema=eq.public"
        
        response = requests.get(
            url,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            columns = response.json()
            print(f"✅ Tabla encontrada con {len(columns)} columnas:")
            
            required_fields = {
                'id': 'UUID (clave primaria)',
                'user_id': 'UUID (user que crea el paciente)',
                'name': 'Nombre del paciente',
                'email': 'Email',
                'phone': 'Teléfono',
                'birth_date': 'Fecha de nacimiento',
                'google_sheet_id': '⭐ ID del Google Sheet (CRM)',
                'google_sheet_url': '⭐ URL del Google Sheet (CRM)',
                'created_at': 'Fecha de creación',
            }
            
            found_columns = {col['column_name'] for col in columns}
            
            print("\n📋 Columnas encontradas:")
            for field, description in required_fields.items():
                if field in found_columns:
                    print(f"  ✅ {field:20s} - {description}")
                else:
                    print(f"  ❌ {field:20s} - {description} [FALTA]")
            
            # Verificar columnas adicionales
            additional = found_columns - set(required_fields.keys())
            if additional:
                print(f"\n📦 Columnas adicionales ({len(additional)}):")
                for col in sorted(additional):
                    print(f"  • {col}")
        else:
            print(f"❌ Error obteniendo estructura: {response.status_code}")
            print(f"   {response.text}")
    
    except Exception as e:
        print(f"❌ Error conectando a Supabase: {str(e)}")
        return
    
    # 2. Contar registros
    print("\n2️⃣  REGISTROS EN LA TABLA")
    print("-" * 70)
    
    try:
        url = f"{SUPABASE_URL}/rest/v1/patients?select=count()"
        
        response = requests.get(
            url,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            print(f"✅ La tabla patients está accesible")
            print(f"   Total de registros: {len(response.json())} (aproximado)")
        else:
            print(f"⚠️  No se pudo contar registros: {response.status_code}")
    
    except Exception as e:
        print(f"⚠️  Error contando registros: {str(e)}")
    
    # 3. Ejemplo de un registro si existe
    print("\n3️⃣  VERIFICAR CONTENIDO DE EJEMPLO")
    print("-" * 70)
    
    try:
        url = f"{SUPABASE_URL}/rest/v1/patients?limit=1&select=id,name,email,google_sheet_id,google_sheet_url"
        
        response = requests.get(
            url,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            records = response.json()
            if records:
                record = records[0]
                print("✅ Ejemplo de un registro existente:")
                print(f"  ID: {record.get('id', 'N/A')}")
                print(f"  Nombre: {record.get('name', 'N/A')}")
                print(f"  Email: {record.get('email', 'N/A')}")
                print(f"  Google Sheet ID: {record.get('google_sheet_id') or '(vacío)'}")
                print(f"  Google Sheet URL: {record.get('google_sheet_url') or '(vacío)'}")
                
                if record.get('google_sheet_url'):
                    print(f"\n  🔗 URL guardada: {record['google_sheet_url']}")
                else:
                    print(f"\n  ⚠️  Sin URL del CRM (será llenado en próxima creación)")
            else:
                print("ℹ️  No hay registros en la tabla (tabla vacía, que es normal)")
        else:
            print(f"⚠️  Error obteniendo ejemplo: {response.status_code}")
    
    except Exception as e:
        print(f"⚠️  Error obteniendo ejemplo: {str(e)}")
    
    # 4. Conclusión
    print("\n4️⃣  CONCLUSIÓN")
    print("-" * 70)
    print("""
✅ Si todos los campos requeridos están marcados como ✅:
   - La tabla está correctamente configurada
   - El flujo de creación de CRM funcionará correctamente
   - Las URLs se guardarán correctamente en Supabase

⚠️  Si algún campo ❌:
   - Contacta al administrador para agregar los campos
   - Los campos necesarios son: google_sheet_id y google_sheet_url

📝 Los campos google_sheet_id y google_sheet_url son:
   - Creados automáticamente después de crear un paciente
   - Guardados en BD para referencia futura
   - Usados para acceder al CRM del paciente
    """)
    
    print("="*70 + "\n")

if __name__ == '__main__':
    check_patients_table()
