'use server';

import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function transcribeAudioAction(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      throw new Error('No se encontró el archivo de audio');
    }

    const response = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'es',
    });

    let text = response.text;

    // FILTROS ANTI-ALUCINACIÓN WHISPER
    const HALLUCINATIONS = [
      'Subtítulos por la comunidad de Amara.org',
      'Subtítulos realizados por la comunidad de Amara.org',
      'Un, dos, tres, probando.',
      'Sígannos en nuestras redes sociales',
      'Gracias por ver el video'
    ];

    HALLUCINATIONS.forEach(phrase => {
      // Reemplazo insensible a mayúsculas/minúsculas
      const regex = new RegExp(phrase, 'gi');
      text = text.replace(regex, '');
    });

    return { success: true, text: text.trim() };
  } catch (error: any) {
    console.error('Error en transcripción (Server Action):', error);
    return { success: false, error: error.message };
  }
}
