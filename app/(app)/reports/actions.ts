"use server";

import { createClient } from "@/lib/supabase/server"; // Cliente de SERVIDOR
import { revalidatePath } from "next/cache";

// Define los tipos de retorno esperados
type ActionResult<T> = { success: true; data: T } | { success: false; error: string };



/**
 * 2. ACCIÓN DE GENERACIÓN DE INFORME (Reemplaza la lógica de /supabase/functions/generate-report)
 * Llama a la IA (ej. GPT-4o mini) de forma segura con el prompt.
 */
export async function generateReport(transcription: string, reportTemplate: string): Promise<ActionResult<string>> {
  
  // Aquí construimos el prompt del sistema, el corazón de nuestra IP
  const systemPrompt = `
    Eres iNFORiA, un asistente de psicología clínica.
    Tu tarea es tomar la siguiente transcripción de una sesión y estructurarla
    siguiendo la plantilla de informe proporcionada.
    Sé conciso, profesional y extrae solo la información clínicamente relevante.
    ---
    PLANTILLA:
    ${reportTemplate}
    ---
  `;

  try {
    const response = await fetch("https://api.openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Modelo de generación (ej. 'openai/gpt-4o-mini')
        model: "openai/gpt-4o-mini", 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: transcription },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en la API de OpenRouter: ${response.statusText}`);
    }

    const data = await response.json();
    const reportDraft = data.choices[0].message.content;
    return { success: true, data: reportDraft };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error al generar el informe:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * 3. ACCIÓN DE GUARDAR EN GOOGLE DRIVE (Reemplaza la lógica de src/services/googleDrive.ts)
 * Utiliza el token de Google del usuario (obtenido en el login) para guardar
 * el archivo en su propio Google Drive.
 */
export async function saveReportToGoogleDrive(fileName: string, content: string, mimeType: string): Promise<ActionResult<string>> {
  const supabase = createClient();

  // 1. Obtenemos la sesión del usuario desde el SERVIDOR
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, error: "Usuario no autenticado." };
  }

  // 2. Obtenemos el token de Google (provider_token) guardado durante el login
  // El provider_token se encuentra en raw_user_meta_data para el usuario
  const googleToken = user.app_metadata.provider_token;
  if (!googleToken) {
    return { success: false, error: "No se encontró el token de Google. El usuario debe volver a conectarse." };
  }

  try {
    // 3. Crear los metadatos del archivo
    const metadata = {
      name: fileName,
      mimeType: mimeType,
      // 'parents': ['ID_DE_LA_CARPETA_INFORIA'] (Opcional, si tenemos el ID)
    };

    // 4. Construir la petición multipart (Metadata + Contenido)
    const boundary = "-------314159265358979323846";
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelim = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}\r\n\r\n` +
      content +
      closeDelim;

    // 5. Llamar a la API de Google Drive
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${googleToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!response.ok) {
      throw new Error(`Error al guardar en Google Drive: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Opcional: Invalidar caché si guardamos el informe en nuestra DB
    revalidatePath('/patient-detailed-profile');

    return { success: true, data: data.id }; // Retornamos el ID del archivo
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error al guardar en Drive:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
