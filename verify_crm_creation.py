"""
Script para verificar la creación del CRM en Google Drive
Verifica si el paciente tiene google_sheet_url guardada en Supabase
"""

import os
import requests
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

def check_patient_crm(patient_id):
    """Verifica si un paciente tiene CRM creado"""
    
    url = f"{SUPABASE_URL}/rest/v1/patients"
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
        'Content-Type': 'application/json'
    }
    
    params = {
        'id': f'eq.{patient_id}',
        'select': 'id,name,email,google_sheet_id,google_sheet_url,created_at'
    }
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code == 200:
        data = response.json()
        if data:
            patient = data[0]
            print("\n" + "="*60)
            print("📋 INFORMACIÓN DEL PACIENTE")
            print("="*60)
            print(f"ID: {patient['id']}")
            print(f"Nombre: {patient['name']}")
            print(f"Email: {patient.get('email', 'N/A')}")
            print(f"Creado: {patient.get('created_at', 'N/A')}")
            print("\n" + "="*60)
            print("📄 INFORMACIÓN DEL CRM")
            print("="*60)
            
            sheet_id = patient.get('google_sheet_id')
            sheet_url = patient.get('google_sheet_url')
            
            if sheet_id:
                print(f"✅ Sheet ID: {sheet_id}")
            else:
                print("❌ Sheet ID: NO DISPONIBLE")
            
            if sheet_url:
                print(f"✅ Sheet URL: {sheet_url}")
                print(f"\n🔗 Abre esta URL en tu navegador:")
                print(f"   {sheet_url}")
            else:
                print("❌ Sheet URL: NO DISPONIBLE")
            
            print("\n" + "="*60)
            
            if not sheet_id and not sheet_url:
                print("\n⚠️ DIAGNÓSTICO:")
                print("   El CRM NO se creó para este paciente")
                print("\n🔍 POSIBLES CAUSAS:")
                print("   1. Token de Google Drive expirado o no disponible")
                print("   2. Error al crear el Google Sheet")
                print("   3. Error al guardar la referencia en BD")
                print("\n💡 SOLUCIÓN:")
                print("   - Revisa la consola del navegador cuando creas un paciente")
                print("   - Busca mensajes de error en PASO 3")
                print("   - Verifica que estás autenticado con Google")
            else:
                print("\n✅ CRM CREADO EXITOSAMENTE")
                
        else:
            print(f"❌ No se encontró el paciente con ID: {patient_id}")
    else:
        print(f"❌ Error en la petición: {response.status_code}")
        print(response.text)

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1:
        patient_id = sys.argv[1]
    else:
        # ID del paciente que mencionaste
        patient_id = 'f401d685-5f30-4da0-86f5-a0c09dda471e'
    
    print(f"\n🔍 Verificando CRM para paciente: {patient_id}")
    check_patient_crm(patient_id)
