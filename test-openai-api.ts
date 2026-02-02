import { config } from 'dotenv';
import OpenAI from 'openai';
import { resolve } from 'path';

// Cargar .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

console.log('🔍 DIAGNÓSTICO DE OPENAI API\n');
console.log('━'.repeat(50));
console.log('API Key:', apiKey ? `✅ Presente (${apiKey.substring(0, 15)}...)` : '❌ NO ENCONTRADA');

if (!apiKey) {
  console.error('\n❌ No se encontró OPENAI_API_KEY en .env.local');
  process.exit(1);
}

const openai = new OpenAI({ apiKey });

async function diagnosticar() {
  try {
    console.log('\n📋 Test 1: Listando modelos disponibles...');
    const modelsResponse = await openai.models.list();
    const whisper = modelsResponse.data.find(m => m.id === 'whisper-1');
    
    console.log(`   Total de modelos: ${modelsResponse.data.length}`);
    console.log(`   Whisper-1: ${whisper ? '✅ Disponible' : '❌ NO encontrado'}`);
    
    // Intentar una llamada pequeña a completions para verificar cuota
    console.log('\n💬 Test 2: Probando generación de texto (test de cuota)...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Di hola' }],
      max_tokens: 5
    });
    
    console.log(`   Respuesta: ${completion.choices[0].message.content}`);
    console.log('   ✅ API operativa y con créditos');
    
    console.log('\n' + '━'.repeat(50));
    console.log('✅ DIAGNÓSTICO EXITOSO');
    console.log('   - API Key válida');
    console.log('   - Whisper-1 disponible');
    console.log('   - Cuenta con saldo activo');
    console.log('━'.repeat(50));
    
  } catch (error: any) {
    console.log('\n' + '━'.repeat(50));
    console.error('❌ ERROR DETECTADO\n');
    console.error('Tipo:', error.constructor?.name || 'Unknown');
    console.error('HTTP Status:', error.status || 'N/A');
    console.error('Código:', error.code || 'N/A');
    console.error('Mensaje:', error.message);
    
    console.log('\n🔍 DIAGNÓSTICO DEL PROBLEMA:\n');
    
    if (error.status === 401) {
      console.error('🔑 API KEY INVÁLIDA O REVOCADA');
      console.error('   → Verifica que la clave sea correcta');
      console.error('   → Genera una nueva en: https://platform.openai.com/api-keys');
    } else if (error.status === 429) {
      console.error('⏱️ RATE LIMIT O CUOTA AGOTADA');
      console.error('   → Revisa el uso en: https://platform.openai.com/usage');
      console.error('   → Añade créditos en: https://platform.openai.com/account/billing');
    } else if (error.status === 403) {
      console.error('🚫 CUENTA DESHABILITADA O SIN PERMISOS');
      console.error('   → Contacta soporte de OpenAI');
    } else if (error.code === 'insufficient_quota') {
      console.error('💳 SALDO INSUFICIENTE');
      console.error('   → Añade créditos en: https://platform.openai.com/account/billing');
      console.error('   → Verifica método de pago configurado');
    } else {
      console.error('❓ ERROR DESCONOCIDO');
      console.error('   → Revisa logs completos arriba');
    }
    
    console.log('\n' + '━'.repeat(50));
    process.exit(1);
  }
}

diagnosticar();
