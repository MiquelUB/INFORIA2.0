// Simple OpenAI API test - auto carga las env vars cuando corre en Next.js context
async function testOpenAI() {
  // Importar dinámicamente para que Next.js cargue las env vars
  const { OpenAI } = await import('openai');
  
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  console.log('\n🔍 === DIAGNÓSTICO OPENAI API ===\n');
  console.log(`API Key: ${apiKey ? `✅ Presente (${apiKey.substring(0, 20)}...)` : '❌ NO'}`);
  
  if (!apiKey) {
    console.error('❌ No se encuentra OPENAI_API_KEY');
    return;
  }
  
  const openai = new OpenAI({ apiKey });
  
  try {
    console.log('\n📋 Test: Listando modelos...');
    const models = await openai.models.list();
    const whisper = models.data.find(m => m.id === 'whisper-1');
    console.log(`   Modelos: ${models.data.length}`);
    console.log(`   Whisper-1: ${whisper ? '✅ Disponible' : '❌ No'}`);
    
    console.log('\n💬 Test: Llamada a GPT-3.5 (verificar cuota)...');
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Di: OK' }],
      max_tokens: 3
    });
    
    console.log(`   Respuesta: "${response.choices[0].message.content}"`);
    console.log('\n✅ API OPERATIVA - Cuenta con saldo activo\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:');
    console.error(`   Status: ${error.status}`);
    console.error(`   Code: ${error.code}`);
    console.error(`   Message: ${error.message}\n`);
    
    if (error.status === 401) {
      console.error('🔑 API Key inválida o revocada');
      console.error('   → https://platform.openai.com/api-keys');
    } else if (error.status === 429 || error.code === 'insufficient_quota') {
      console.error('💳 SALDO INSUFICIENTE O CUOTA AGOTADA');
      console.error('   → https://platform.openai.com/usage');
      console.error('   → https://platform.openai.com/account/billing\n');
    }
  }
}

testOpenAI();
