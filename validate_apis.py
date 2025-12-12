#!/usr/bin/env python3
"""
Script para validar todas las variables de entorno y conexiones a APIs.
Uso: python validate_apis.py
"""

import os
import sys
import requests
import json
from pathlib import Path
from dotenv import load_dotenv

# Cargar variables de entorno desde .env.local
env_path = Path(__file__).parent / '.env.local'
if env_path.exists():
    load_dotenv(env_path)
else:
    print(f"❌ No se encontró {env_path}")
    sys.exit(1)

def check_env_var(var_name):
    """Verifica si una variable de entorno está configurada."""
    value = os.getenv(var_name)
    if value:
        # Mostrar solo los primeros y últimos caracteres por seguridad
        visible = value[:20] + '...' + value[-20:] if len(value) > 40 else value
        return True, visible
    return False, None

def test_supabase():
    """Prueba conexión a Supabase."""
    print("\n🔷 SUPABASE")
    print("-" * 50)
    
    url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    anon_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    print(f"  URL: {'✅' if url else '❌'}")
    print(f"  Anon Key: {'✅' if anon_key else '❌'}")
    print(f"  Service Role Key: {'✅' if service_key else '❌'}")
    
    if url:
        try:
            response = requests.get(
                f"{url}/rest/v1/",
                headers={
                    'Authorization': f'Bearer {anon_key}',
                    'apikey': anon_key
                },
                timeout=5
            )
            print(f"  Connection: {'✅ OK' if response.status_code < 500 else f'❌ {response.status_code}'}")
        except Exception as e:
            print(f"  Connection: ❌ {str(e)}")

def test_openrouter():
    """Prueba conexión a OpenRouter API."""
    print("\n🤖 OPENROUTER API")
    print("-" * 50)
    
    api_key = os.getenv('NEXT_PUBLIC_OPENROUTER_API_KEY')
    print(f"  API Key: {'✅' if api_key else '❌'}")
    
    if api_key:
        try:
            response = requests.get(
                'https://openrouter.ai/api/v1/models',
                headers={
                    'Authorization': f'Bearer {api_key}',
                    'HTTP-Referer': 'http://localhost:3000',
                    'X-Title': 'INFORIA',
                },
                timeout=10
            )
            if response.status_code == 200:
                data = response.json()
                models = len(data.get('data', []))
                print(f"  Connection: ✅ OK")
                print(f"  Models Available: {models}")
            else:
                print(f"  Connection: ❌ {response.status_code}")
        except Exception as e:
            print(f"  Connection: ❌ {str(e)}")

def test_openai():
    """Prueba conexión a OpenAI API."""
    print("\n🧠 OPENAI API")
    print("-" * 50)
    
    api_key = os.getenv('OPENAI_API_KEY')
    print(f"  API Key: {'✅' if api_key else '❌'}")
    
    if api_key:
        try:
            response = requests.get(
                'https://api.openai.com/v1/models',
                headers={
                    'Authorization': f'Bearer {api_key}',
                },
                timeout=10
            )
            if response.status_code == 200:
                data = response.json()
                models = len(data.get('data', []))
                print(f"  Connection: ✅ OK")
                print(f"  Models Available: {models}")
            else:
                print(f"  Connection: ❌ {response.status_code}")
        except Exception as e:
            print(f"  Connection: ❌ {str(e)}")

def test_google():
    """Verifica configuración de Google OAuth."""
    print("\n🔵 GOOGLE OAUTH")
    print("-" * 50)
    
    client_id = os.getenv('NEXT_PUBLIC_GOOGLE_CLIENT_ID')
    service_account = os.getenv('NEXT_GOOGLE_SERVICE_ACCOUNT_EMAIL')
    private_key = os.getenv('NEXT_GOOGLE_ACCOUNT_PRIVATE_KEY')
    
    print(f"  Client ID: {'✅' if client_id else '❌'}")
    print(f"  Service Account: {'✅' if service_account else '❌'}")
    print(f"  Private Key: {'✅' if private_key else '❌'}")
    
    if all([client_id, service_account, private_key]):
        print(f"  Status: ✅ Configurado completamente")
    else:
        print(f"  Status: ❌ Falta configuración")

def test_stripe():
    """Prueba conexión a Stripe API."""
    print("\n💳 STRIPE")
    print("-" * 50)
    
    pub_key = os.getenv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')
    secret_key = os.getenv('STRIPE_SECRET_KEY')
    webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    
    print(f"  Publishable Key: {'✅' if pub_key else '❌'}")
    print(f"  Secret Key: {'✅' if secret_key else '❌'}")
    print(f"  Webhook Secret: {'✅' if webhook_secret else '❌'}")
    
    if secret_key:
        try:
            response = requests.get(
                'https://api.stripe.com/v1/account',
                auth=(secret_key, ''),
                timeout=10
            )
            if response.status_code == 200:
                print(f"  Connection: ✅ OK")
            elif response.status_code == 401:
                print(f"  Connection: ❌ Invalid API Key (401)")
            else:
                print(f"  Connection: ❌ {response.status_code}")
        except Exception as e:
            print(f"  Connection: ❌ {str(e)}")

def main():
    """Ejecuta todas las pruebas."""
    print("=" * 50)
    print("🔍 VALIDACIÓN DE APIS Y VARIABLES DE ENTORNO")
    print("=" * 50)
    
    test_supabase()
    test_openrouter()
    test_openai()
    test_google()
    test_stripe()
    
    print("\n" + "=" * 50)
    print("✅ Validación completada")
    print("=" * 50)

if __name__ == '__main__':
    main()
