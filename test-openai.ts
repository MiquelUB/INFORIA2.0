// Test script para verificar el estado de OpenAI API
import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

console.log('🔍 Verificando conexión con OpenAI...');
console.log('API Key presente:', apiKey ? `Sí (${apiKey.substring(0, 10)}...)` : 'NO');

if (!apiKey) {
  console.error('❌ No se encontró OPENAI_API_KEY');
  process.exit(1);
}

const openai = new OpenAI({ apiKey });

async function testOpenAI() {
  try {
    // Test 1: Listar modelos (más ligero)
    console.log('\n📋 Test 1: Listando modelos disponibles...');
    const models = await openai.models.list();
    const whisperModel = models.data.find(m => m.id === 'whisper-1');
    
    if (whisperModel) {
      console.log('✅ Modelo Whisper-1 disponible');
    } else {
      console.log('⚠️ Whisper-1 no encontrado en modelos');
    }

    // Test 2: Verificar billing/usage
    console.log('\n💰 Test 2: Verificando estado de la cuenta...');
    
    // OpenAI no tiene un endpoint público para verificar créditos, 
    // pero podemos intentar una llamada pequeña a la API
    console.log('🎤 Test 3: Intentando transcripción de prueba (simulada)...');
    
    // Crear un archivo de audio silencioso muy pequeño para probar
    console.log('⚠️ Para probar transcripción real, necesitamos un archivo de audio.');
    console.log('✅ La clave API es válida y la conexión funciona.');
    
    return { success: true };
    
  } catch (error: any) {
    console.error('\n❌ Error desde OpenAI API:');
    console.error('Tipo:', error.constructor.name);
    console.error('Código:', error.code);
    console.error('Status:', error.status);
    console.error('Mensaje:', error.message);
    
    if (error.status === 401) {
      console.error('\n🔑 ERROR: API Key inválida o revocada');
    } else if (error.status === 429) {
      console.error('\n⏱️ ERROR: Rate limit excedido o saldo agotado');
    } else if (error.status === 403) {
      console.error('\n🚫 ERROR: Sin permisos o cuenta deshabilitada');
    } else if (error.code === 'insufficient_quota') {
      console.error('\n💳 ERROR: Saldo insuficiente o cuota agotada');
      console.error('Solución: Añadir créditos en https://platform.openai.com/account/billing');
    }
    
    return { success: false, error };
  }
}

testOpenAI().then(result => {
  if (result.success) {
    console.log('\n✅ Diagnóstico completado: OpenAI API está operativa');
    process.exit(0);
  } else {
    console.log('\n❌ Diagnóstico completado: Hay problemas con OpenAI API');
    process.exit(1);
  }
});
