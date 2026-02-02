'use server';

export async function generateReportAction(
  compiledInfo: string,
  reportType: 'nuevo_paciente' | 'seguimiento' | 'alta_paciente',
  model: string = 'deepseek/deepseek-r1'
) {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return { success: false, error: 'La clave de API de OpenRouter no está configurada en el servidor.' };
  }

  const systemPrompts = {
    'nuevo_paciente': 'Eres un psicólogo clínico experto. Generas informes profesionales en ESPAÑOL, precisos y empáticos para primeras consultas.',
    'seguimiento': 'Eres un psicólogo clínico experto. Generas informes de seguimiento en ESPAÑOL.',
    'alta_paciente': 'Eres un psicólogo clínico experto. Generas dossiers de alta en ESPAÑOL.'
  };

  const systemPrompt = systemPrompts[reportType];

  try {
    // ✅ FIX: Añadir timeout de 60 segundos para evitar que se quede colgado
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://inforia.pro',
        'X-Title': 'INFORIA Clinical Assistant'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: compiledInfo }
        ],
        temperature: 0.7,
        max_tokens: 2500, // ✅ REDUCIDO de 4000 a 2500 para respuestas más rápidas
      }),
      signal: controller.signal // ✅ Añadir señal de abort
    });

    clearTimeout(timeoutId); // Limpiar timeout si la petición termina a tiempo

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error OpenRouter (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Respuesta vacía de OpenRouter');
    }

    return { success: true, text: content };

  } catch (error: unknown) {
    console.error('Error generating report (Server Action):', error);
    
    // ✅ Mensaje específico para timeout
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'La generación del informe tardó demasiado (timeout de 60s). Por favor, intenta de nuevo o reduce el contenido.' };
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}
