// src/services/openrouter.ts

interface OpenRouterResponse {
  choices: { message: { content: string } }[];
}

interface WhisperResponse {
  text: string;
  segments?: Array<{
    text: string;
    start: number;
    end: number;
  }>;
}

export type ReportType = 'nuevo_paciente' | 'seguimiento' | 'alta_paciente';

export class OpenRouterService {
  private openRouterKey: string;
  private openAIKey: string;
  
  // 1. URLs base separadas
  private openRouterBaseUrl = 'https://openrouter.ai/api/v1';
  private openAIBaseUrl = 'https://api.openai.com/v1';

  constructor() {
    // 2. Carga de claves
    this.openRouterKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';
    this.openAIKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

    if (!this.openRouterKey) console.warn('⚠️ NEXT_PUBLIC_OPENROUTER_API_KEY no configurada');
    if (!this.openAIKey) console.warn('⚠️ NEXT_PUBLIC_OPENAI_API_KEY no configurada');
  }

  // --- TRANSCRIPCIÓN (OpenAI Whisper) ---
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    if (!this.openAIKey) throw new Error('Clave de OpenAI no configurada para transcripción');

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'session_audio.wav');
      formData.append('model', 'whisper-1');
      formData.append('language', 'es'); // Forzamos español en la transcripción si es posible

      const response = await fetch(this.openAIBaseUrl + '/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + this.openAIKey,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error('Error OpenAI Whisper: ' + response.status + ' - ' + errorData);
      }

      const data: WhisperResponse = await response.json();
      return data.text;
    } catch (error) {
      console.error('Error crítico en transcripción (OpenAI):', error);
      throw error;
    }
  }

  // --- GENERACIÓN DE INFORMES (OpenRouter) ---
  async compileReportInfo(data: {
    reportType: ReportType;
    patientData: {
      name: string;
      age?: number;
      previousReports?: string[];
      firstVisitDate?: string;
    };
    sessionData: {
      audioTranscription?: string;
      clinicalNotes: string;
      filesContext?: string;
      sessionDate: string;
    };
  }): Promise<string> {
    
    // Instrucción común de estructura y formato
    const structureInstruction = 'ESTRUCTURA DE SALIDA OBLIGATORIA:\nGenera el contenido siguiendo estrictamente este orden.\n\n1. RESUMEN (100 PALABRAS):\n   Escribe un resumen conciso de la sesión de aproximadamente 100 palabras.\n\n2. INFORME PSICOLÓGICO DETALLADO:\n   Desarrolla el informe completo según el tipo de consulta.\n';

    const filesInput = data.sessionData.filesContext 
      ? 'DOCUMENTACIÓN ADJUNTA (Resultados de pruebas, etc.):\n' + data.sessionData.filesContext 
      : 'DOCUMENTACIÓN ADJUNTA: Ninguna';

    const compilationPrompts = {
      // --- PROMPT TRADUCIDO Y ADAPTADO AL ESPAÑOL ---
      nuevo_paciente: structureInstruction + '\n\nACTÚA COMO: Psicólogo o psiquiatra clínico experto.\nTAREA: Redactar INFORME CLÍNICO INICIAL (Primera Visita).\nTONO: Formal, objetivo, basado en criterios DSM-5/CIE-10, pero con explicaciones didácticas para la familia.\nIDIOMA DE SALIDA: **ESPAÑOL (CASTELLANO)**.\n\nINPUT DEL CASO:\n- Paciente: ' + data.patientData.name + ' (' + (data.patientData.age ? data.patientData.age + ' años' : 'Edad no especificada') + ')\n- Fecha: ' + data.sessionData.sessionDate + '\n- Transcripción: ' + (data.sessionData.audioTranscription || 'No disponible') + '\n- Notas Clínicas: ' + (data.sessionData.clinicalNotes || 'No disponible') + '\n' + filesInput + '\n\n## REGLAS ESTRICTAS DE REDACCIÓN (CRÍTICAS):\n1. **NO INVENTES DATOS:** Si falta información sobre un apartado (ej. familia, escuela), escribe explícitamente en un apartado final: "No consta información sobre [dato específico]".\n2. **PROSA INTEGRADA:** No copies frases sueltas. Transforma los "bullets" o notas telegráficas en párrafos narrativos coherentes.\n   - Ejemplo: Si dice "agresivo", escribe: "El paciente presenta conductas disruptivas que dificultan la convivencia..."\n3. **DIAGNÓSTICO:** Usa códigos oficiales (DSM-5 / CIE-10) concatenados con la explicación.\n4. **FORMATO DE SALIDA:** Usa Markdown (títulos con ##, negritas con **). NO USES JSON.\n\n---\nESTRUCTURA DEL INFORME A GENERAR (En Español):\n\n## 1. MOTIVO DE CONSULTA\n(Integra la queja principal en un párrafo narrativo).\n\n## 2. ANTECEDENTES CLÍNICOS Y FAMILIARES\n(Historial relevante, si consta).\n\n## 3. SITUACIÓN ESCOLAR / LABORAL\n(Rendimiento, adaptación, si consta).\n\n## 4. OBSERVACIONES CONDUCTUALES Y EXPLORACIÓN\n(Lo observado durante la sesión y en la transcripción).\n\n## 5. PRUEBAS REALIZADAS (Si las hay)\n(Explica qué son de forma didáctica y sus resultados concatenados. Si hay archivos adjuntos de pruebas, intégralos aquí).\n\n## 6. IMPRESIÓN DIAGNÓSTICA PRINCIPAL\n(Códigos DSM-5/CIE-10 y justificación clínica del diagnóstico principal).\n\n## 7. DIAGNÓSTICO DIFERENCIAL\n(Justificación razonada de otros trastornos considerados y descartados. Menciona 1-2 hipótesis alternativas si procede. Explica por qué se ha descartado cada una basándote en la evidencia clínica).\n\n## 8. PLAN DE TRATAMIENTO Y OBJETIVOS\n(PTI, objetivos terapéuticos y recomendaciones).\n\n## 9. ESTRATEGIAS Y RECOMENDACIONES\n(Gestión de ansiedad, pautas para casa/escuela).\n\n> **INFORMACIÓN PENDIENTE:**\n> (Lista aquí todo lo que falta: "Falta información sobre...")\n',

      seguimiento: structureInstruction + '\n\nACTÚA COMO: Psicólogo o psiquiatra clínico experto en informes evolutivos.\nTAREA: Redactar un **INFORME DE SEGUIMIENTO CLÍNICO** en formato Markdown.\nTONO: Formal, objetivo (DSM-5/CIE-10), pero con explicaciones didácticas y claras.\nIDIOMA DE SALIDA: **ESPAÑOL (CASTELLANO)**.\n\nINPUT DEL CASO (Datos Actuales):\n- Paciente: ' + data.patientData.name + ' (' + (data.patientData.age ? data.patientData.age + ' años' : 'Edad no especificada') + ')\n- Fecha Actual: ' + data.sessionData.sessionDate + '\n- Transcripción Sesión: ' + (data.sessionData.audioTranscription || 'No disponible') + '\n- Notas Clínicas: ' + (data.sessionData.clinicalNotes || 'No disponible') + '\n' + filesInput + '\n\nCONTEXTO PREVIO (Para Comparativa):\n' + (data.patientData.previousReports?.join('\n---\n') || 'No constan informes previos.') + '\n\n## INSTRUCCIONES CLAVE DE REDACCIÓN:\n\n1. **NO INVENTES DATOS:** Si un campo está vacío o no se menciona en la sesión actual, no lo rellenes. Al final del informe, añade una sección "INFORMACIÓN PENDIENTE" y lista qué datos faltan.\n\n2. **COMPARATIVA EVOLUTIVA (CRUCIAL):**\n   - Debes contrastar OBLIGATORIAMENTE los datos de la sesión actual con el "CONTEXTO PREVIO".\n   - Valida la evolución: ¿Ha habido mejoría, estancamiento o retroceso?\n   - ¿Se han cumplido los objetivos marcados en el informe anterior?\n\n3. **PROSA INTEGRADA:** No copies notas literales. Redacta párrafos coherentes.\n   - *Mal:* "Paciente triste. Duerme mal."\n   - *Bien:* "El paciente refiere un estado de ánimo disfórico persistente acompañado de alteraciones en el ciclo del sueño."\n\n4. **GUÍA DIDÁCTICA DE PRUEBAS (Si las hay):**\n   - Si se han pasado tests nuevos, explica QUÉ son y PARA QUÉ sirven.\n   - *Ejemplo:* "Se administra el BDI-II (Inventario de Depresión de Beck) para cuantificar la severidad de la sintomatología..."\n\n5. **FORMATO:** Markdown limpio. Usa títulos (##), negritas (**) y listas. Nada de JSON.\n\n---\nESTRUCTURA DEL INFORME A GENERAR (En Español):\n\n## 1. DATOS DE FILIACIÓN\n(Nombre, Edad, Sexo).\n\n## 2. RESUMEN DE LA EVOLUCIÓN (COMPARATIVA)\n(Sintetiza los cambios respecto al informe anterior. Analiza la respuesta terapéutica y la evolución de los síntomas principales. Justifica si hay mejoría o empeoramiento).\n\n## 3. EXPLORACIÓN Y OBSERVACIONES ACTUALES\n(Estado mental actual, observaciones conductuales de esta sesión y novedades en el entorno escolar/familiar/laboral).\n\n## 4. PRUEBAS REALIZADAS (En este seguimiento)\n(Si no hay nuevas, indica: "No se han realizado nuevas pruebas psicométricas en este periodo". Si las hay, nombre de la prueba + explicación didáctica + interpretación de resultados).\n\n## 5. IMPRESIÓN DIAGNÓSTICA ACTUALIZADA\n(Códigos DSM-5/CIE-10. Indica si se mantiene el diagnóstico previo o si hay cambios/nuevas hipótesis).\n\n## 6. PLAN DE TRATAMIENTO Y RECOMENDACIONES\n(Ajustes en el tratamiento, nuevos objetivos terapéuticos o derivaciones necesarias).\n\n## 7. SUGERENCIAS DIAGNÓSTICAS ALTERNATIVAS\n(Diagnóstico diferencial: 1-2 hipótesis alternativas si el cuadro no es claro).\n\n> **INFORMACIÓN PENDIENTE:**\n> (Lista aquí los datos que faltan: "No consta información sobre...")\n',

      alta_paciente: structureInstruction + '\n\nACTÚA COMO: Psicólogo o psiquiatra clínico experto en auditoría clínica y cierre de casos.\nTAREA: Redactar un **DOSSIER CLÍNICO DE ALTA (Historial Cronológico)** en formato Markdown.\nOBJETIVO: Crear un documento único que resuma toda la trayectoria clínica del paciente, justificando el diagnóstico final (DSM-5/CIE-10) basándose en la evolución observada.\nIDIOMA DE SALIDA: **ESPAÑOL (CASTELLANO)**.\n\nINPUT DEL CASO (Historial Completo):\n- Paciente: ' + data.patientData.name + '\n- Fecha de Alta: ' + data.sessionData.sessionDate + '\n\nHISTORIAL DE INFORMES PREVIOS (Cronológico):\n' + (data.patientData.previousReports && data.patientData.previousReports.length > 0 ? data.patientData.previousReports.join('\n\n--- [CAMBIO DE INFORME] ---\n\n') : 'ERROR: No constan informes previos para generar el historial.') + '\n\n## INSTRUCCIONES DE REDACCIÓN:\n\n1. **ENFOQUE CRONOLÓGICO:**\n   - No describas una "foto fija". Tu tarea es narrar la "película" del tratamiento.\n   - Identifica el estado inicial, los puntos de inflexión durante el tratamiento y el estado final.\n\n2. **RIGOR DIAGNÓSTICO (DSM-5 / CIE-10):**\n   - El diagnóstico final debe estar **fuertemente justificado**.\n   - Cita evidencias extraídas de los informes previos (síntomas que remitieron, síntomas que persistieron).\n\n3. **ESTILO:** Formal, pericial y conclusivo.\n\n---\nESTRUCTURA DEL DOSSIER A GENERAR (En Español):\n\n## 1. RESUMEN EJECUTIVO DE ALTA\n(Síntesis global del caso en 1-2 párrafos: motivo inicial, duración del tratamiento y motivo del alta).\n\n## 2. CRONOLOGÍA CLÍNICA Y EVOLUCIÓN\n(Análisis longitudinal. Divide por fases si es necesario: "Fase de Evaluación", "Fase de Intervención", "Fase de Seguimiento/Cierre". Destaca los hitos importantes).\n\n## 3. JUICIO DIAGNÓSTICO FINAL\n- **Diagnóstico Principal (DSM-5/CIE-10):** (Códigos y nombre).\n- **Justificación:** (Argumenta por qué se confirma este diagnóstico basándote en la evolución histórica).\n- **Comorbilidades o Rasgos:** (Si aplican).\n## 5. CONCLUSIONES Y RECOMENDACIONES POST-ALTA\n(Pautas de prevención de recaídas o recomendaciones de seguimiento externo).\n\n> **NOTA DE CIERRE:**\n> Este documento incluye un anexo con la copia literal de todos los informes emitidos durante el tratamiento.\n'
    };

    return compilationPrompts[data.reportType];
  }

  // --- MÉTODO PRIVADO PARA LLAMADAS ---
  private async callOpenRouter(prompt: string, model: string, systemPrompt: string): Promise<string> {
    const response = await fetch(this.openRouterBaseUrl + '/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + this.openRouterKey,
        'Content-Type': 'application/json',
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        'X-Title': 'INFORIA Clinical Assistant'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error('Error OpenRouter (' + model + '): ' + response.status + ' - ' + errorData);
    }

    const data: OpenRouterResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  // --- GENERAR INFORME (CON FALLBACK) ---
  async generateReport(
    compiledInfo: string,
    reportType: ReportType = 'nuevo_paciente',
    primaryModel: string = 'deepseek/deepseek-r1'
  ): Promise<string> {
    if (!this.openRouterKey) throw new Error('Clave de OpenRouter no configurada');

    const systemPrompts = {
      'nuevo_paciente': 'Eres un psicólogo clínico experto. Generas informes profesionales en ESPAÑOL, precisos y empáticos para primeras consultas.',
      'seguimiento': 'Eres un psicólogo clínico experto. Generas informes de seguimiento en ESPAÑOL.',
      'alta_paciente': 'Eres un psicólogo clínico experto. Generas dossiers de alta en ESPAÑOL.'
    };

    const systemPrompt = systemPrompts[reportType];

    try {
      console.log('🤖 Intentando generar con modelo principal: ' + primaryModel);
      return await this.callOpenRouter(compiledInfo, primaryModel, systemPrompt);
    } catch (error) {
      console.warn('⚠️ Fallo con ' + primaryModel + ', intentando fallback a Llama-3...', error);
      try {
        const fallbackModel = 'meta-llama/llama-3-70b-instruct';
        return await this.callOpenRouter(compiledInfo, fallbackModel, systemPrompt);
      } catch (fallbackError) {
        console.error('❌ Fallo total en generación de informe (Principal y Fallback)', fallbackError);
        throw new Error('No se pudo generar el informe con ninguno de los modelos disponibles.');
      }
    }
  }

  async processFullReport(data: {
    reportType: ReportType;
    patientData: any;
    sessionData: any;
    selectedModel?: string;
  }): Promise<string> {
    try {
      const compiledInfo = await this.compileReportInfo(data);
      return await this.generateReport(
        compiledInfo, 
        data.reportType, 
        data.selectedModel || 'deepseek/deepseek-r1'
      );
    } catch (error) {
      console.error('Error en procesamiento completo:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.openRouterKey) return false;
    try {
      const response = await fetch(this.openRouterBaseUrl + '/models', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + this.openRouterKey,
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : ''
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const openRouterService = new OpenRouterService();