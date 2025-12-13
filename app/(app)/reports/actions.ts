"use server";

import { createClient } from "@/lib/supabase/server"; // Cliente de SERVIDOR
import { revalidatePath } from "next/cache";

// Define los tipos de retorno esperados
type ActionResult<T> = { success: true; data: T } | { success: false; error: string };



/**
 * 2. ACCIÓN DE GENERACIÓN DE INFORME (Reemplaza la lógica de /supabase/functions/generate-report)
 * Llama a la IA (ej. GPT-4o mini) de forma segura con el prompt.
 */
import { differenceInYears } from 'date-fns';

/**
 * 2. ACCIÓN DE GENERACIÓN DE INFORME (Reemplaza la lógica de /supabase/functions/generate-report)
 * Llama a la IA (ej. GPT-4o mini) de forma segura con el prompt.
 */
export async function generateReport(transcription: string, reportTemplate: string, patientId?: string): Promise<ActionResult<string>> {
  const supabase = createClient();
  let anonymizedAlias = "Paciente";

  // Si tenemos patientId, obtenemos datos para "Anonymization Layer"
  if (patientId) {
    const { data: patient } = await supabase
      .from('patients')
      .select('birth_date, gender')
      .eq('id', patientId)
      .single();

    if (patient) {
      const age = patient.birth_date ? differenceInYears(new Date(), new Date(patient.birth_date)) : '?';
      // Mapeo básico de género
      const genderMap: Record<string, string> = {
        'femenino': 'Mujer',
        'masculino': 'Hombre',
        'mujer': 'Mujer',
        'hombre': 'Hombre',
        'niño': 'Niño',
        'niña': 'Niña'
      };
      // Intentamos normalizar, si no, usamos el valor directo
      const genderTerm = genderMap[patient.gender?.toLowerCase()] || patient.gender || 'Paciente';
      
      // Si la edad es menor a 18, podríamos forzar "Niño/a" si se desea, pero "Hombre de 17" también vale.
      // Ajuste semántico simple:
      let finalGender = genderTerm;
      if (typeof age === 'number' && age < 18) {
         if (finalGender === 'Mujer') finalGender = 'Niña';
         if (finalGender === 'Hombre') finalGender = 'Niño';
      }

      anonymizedAlias = `${finalGender} de ${age} años`;
    }
  }
  
  // Aquí construimos el prompt del sistema, el corazón de nuestra IP
  const systemPrompt = `
    Eres iNFORiA, un asistente de psicología clínica.
    Tu tarea es tomar la siguiente transcripción de una sesión y estructurarla
    siguiendo la plantilla de informe proporcionada.
    Sé conciso, profesional y extrae solo la información clínicamente relevante.

    ⚠️ PRIVACIDAD CRÍTICA:
    - NO utilices el nombre real del paciente en el informe.
    - Refiérete al paciente únicamente como: "${anonymizedAlias}".
    - Si en la transcripción aparece el nombre real, omítelo o sustitúyelo por este alias.
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
export async function saveReportToGoogleDrive(
  fileName: string, 
  content: string, 
  mimeType: string,
  patientId?: string
): Promise<ActionResult<string>> {
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

  let finalFileName = fileName;

  // 2.5 Si tenemos patientId, intentamos obtener el nombre real para el archivo en Drive
  if (patientId) {
    const { data: patient } = await supabase
      .from('patients')
      .select('first_name, last_name')
      .eq('id', patientId)
      .single();
      
    if (patient && patient.first_name && patient.last_name) {
      // Reconstruimos el nombre del archivo para que sea legible en Drive
      // Formato: Informe_Nombre_Apellido_YYYY-MM-DD.txt
      const datePart = new Date().toISOString().split('T')[0];
      // Sanitize names to remove special chars if any
      const safeName = `${patient.first_name}_${patient.last_name}`.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_]/g, '');
      finalFileName = `Informe_${safeName}_${datePart}.txt`;
    }
  }

  // --- LÓGICA DE CARPETAS ---
  let parentFolderId: string | undefined = undefined;

  const FOLDER_NAME = 'INFORIA-INFORMES';

  // Función Helper para buscar/crear carpeta
  const getOrCreateFolder = async (folderName: string, parentId?: string): Promise<string> => {
    // 1. Buscar
    let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    }

    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`, {
      headers: { 'Authorization': `Bearer ${googleToken}` }
    });
    
    if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.files && searchData.files.length > 0) {
            return searchData.files[0].id;
        }
    }

    // 2. Crear si no existe
    const createBody: any = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
    };
    if (parentId) {
        createBody.parents = [parentId];
    }

    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${googleToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(createBody)
    });

    if (!createRes.ok) {
        throw new Error(`Error creando carpeta ${folderName}: ${createRes.statusText}`);
    }

    const createData = await createRes.json();
    return createData.id;
  };

  try {
    // A. Obtener/Crear Carpeta Raíz
    const rootFolderId = await getOrCreateFolder(FOLDER_NAME);

    // B. Obtener/Crear Carpeta Paciente (si aplica)
    if (patientId) {
        // Necesitamos el nombre del paciente para la carpeta
         const { data: patient } = await supabase
            .from('patients')
            .select('name') // Usamos 'name' directo para consistencia con googleDriveService
            .eq('id', patientId)
            .single();
        
        if (patient) {
            const safeName = (patient.name || 'Paciente Sin Nombre').trim();
            // Sanitize folder name - Debería coincidir con lógica de cliente
            const folderName = safeName.replace(/[<>:"/\\|?*']/g, '_');
            
            // CORRECCIÓN: Usar 8 caracteres para el ID, igual que lib/services/googleDrive.ts
            // Antes usábamos 6, lo que creaba duplicados con sufijo distinto.
            const uniqueFolderName = `${folderName}_${patientId.substring(0,8)}`; 
            
            parentFolderId = await getOrCreateFolder(uniqueFolderName, rootFolderId);
        } else {
            // Fallback a raíz si no hay datos de paciente
            parentFolderId = rootFolderId;
        }
    } else {
        // Reporte General -> Raíz
        parentFolderId = rootFolderId;
    }

    // 3. Crear los metadatos del archivo
    const metadata: any = {
      name: finalFileName,
      mimeType: mimeType,
    };
    
    if (parentFolderId) {
        metadata.parents = [parentFolderId];
    }

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
    const googleDriveId = data.id;

    // 6. Zero-Knowledge persistence: Guardar METADATOS en Supabase, pero contenido NULL
    if (patientId) {
       // Asumimos que la tabla 'reports' tiene 'google_drive_id' o 'metadata'
       // Si no existe la columna, esto fallará, pero es la implementación solicitada.
       const { error: dbError } = await supabase.from('reports').insert({
          user_id: user.id,
          patient_id: patientId,
          content: null, // 🔒 ZERO-KNOWLEDGE: No guardamos el texto clínico
          google_drive_id: googleDriveId, 
          session_type: 'general',
          created_at: new Date().toISOString()
       });
       
       if (dbError) {
         console.error("⚠️ El archivo se subió a Drive, pero falló el registro en DB:", dbError);
         // No fallamos la acción completa porque el usuario ya tiene su archivo
       } else {
         console.log("✅ Metadatos de informe registrados (Sin Contenido).");
       }
    }
    
    // Opcional: Invalidar caché si guardamos el informe en nuestra DB
    revalidatePath('/patient-detailed-profile');

    return { success: true, data: googleDriveId }; // Retornamos el ID del archivo
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error al guardar en Drive:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
