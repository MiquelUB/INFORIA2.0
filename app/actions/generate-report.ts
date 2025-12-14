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
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://inforia.pro', // Hardcoded or from env
        'X-Title': 'INFORIA Clinical Assistant'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: compiledInfo }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      })
    });

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

  } catch (error: any) {
    console.error('Error generating report (Server Action):', error);
    // Fallback logic could go here, for now return error
    return { success: false, error: error.message };
  }
}
