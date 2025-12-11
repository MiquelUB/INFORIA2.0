
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateReportRequest {
  patientId: string;
  textNotes?: string;
  audioTranscription?: string;
  sessionType?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar variables de entorno (no loguear valores)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    if (!openAIApiKey) {
      throw new Error('Missing OpenAI API key');
    }

    // Leer body (sin loguear contenido - PILAR 2: Volatilidad)
    let requestBody: GenerateReportRequest;
    try {
      requestBody = await req.json();
    } catch (e) {
      throw new Error('Failed to parse request body');
    }

    // Verificar auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error(`Auth failed: ${authError?.message || 'No user'}`);
    }

    // Validar que el usuario es propietario del paciente
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id, user_id')
      .eq('id', requestBody.patientId)
      .single();

    if (patientError || !patient || patient.user_id !== user.id) {
      throw new Error('Patient not found or access denied');
    }

    // Preparar contenido para IA (solo en memoria - PILAR 2: Volatilidad)
    const clinicalContent = requestBody.audioTranscription || requestBody.textNotes || '';
    
    if (!clinicalContent) {
      throw new Error('No clinical content provided');
    }

    // Construir prompt para OpenAI (sin loguear)
    const systemPrompt = `Eres un asistente experto en redacción de informes clínicos. 
Tu tarea es generar un informe profesional, estructurado y clínicamente relevante basado en las notas proporcionadas.
El informe debe incluir: Resumen, Evaluación, Hallazgos Clave, Recomendaciones y Plan de Seguimiento.
Mantén un tono profesional y académico.`;

    const userMessage = `Por favor, genera un informe clínico basado en lo siguiente:\n\n${clinicalContent}`;

    // Llamar a OpenAI GPT (datos sensibles solo en memoria, no persistidos antes de enviar)
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      console.error('OpenAI API error status:', openAIResponse.status);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const reportContent = openAIData.choices?.[0]?.message?.content;

    if (!reportContent) {
      throw new Error('No report content generated from OpenAI');
    }

    // Guardar en BD (datos ahora persistidos de forma segura por RLS)
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .insert([
        {
          patient_id: requestBody.patientId,
          user_id: user.id,
          content: reportContent,
          session_type: requestBody.sessionType || 'general',
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (reportError) {
      console.error('Report save error status:', reportError.code);
      throw new Error(`Failed to save report: ${reportError.message}`);
    }

    // Retornar solo metadatos (sin contenido clínico en respuesta)
    return new Response(
      JSON.stringify({
        success: true,
        reportId: report.id,
        createdAt: report.created_at,
        message: 'Report generated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Report generation error:', error.message);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});