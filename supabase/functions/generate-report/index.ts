
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚨 DEBUG: Function called');
    
    // Verificar variables de entorno
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    console.log('🚨 DEBUG Environment:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasOpenAIKey: !!openAIApiKey,
      supabaseUrlLength: supabaseUrl?.length || 0,
      openAIKeyLength: openAIApiKey?.length || 0
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    if (!openAIApiKey) {
      throw new Error('Missing OpenAI API key');
    }

    // Leer body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('🚨 DEBUG Request body:', JSON.stringify(requestBody, null, 2));
    } catch (e) {
      console.log('🚨 DEBUG Error reading body:', e);
      throw new Error('Failed to parse request body');
    }

    // Verificar auth
    const authHeader = req.headers.get('Authorization');
    console.log('🚨 DEBUG Auth header present:', !!authHeader);

    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    
    console.log('🚨 DEBUG Token length:', token.length);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    console.log('🚨 DEBUG Auth result:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message
    });

    if (authError || !user) {
      throw new Error(`Auth failed: ${authError?.message || 'No user'}`);
    }

    // RETORNAR ÉXITO TEMPORAL PARA VER SI LLEGA HASTA AQUÍ
    return new Response(JSON.stringify({
      success: true,
      debug: 'Function is working up to auth verification',
      userId: user.id,
      receivedParams: Object.keys(requestBody || {})
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.log('🚨 DEBUG ERROR:', error.message);
    console.log('🚨 DEBUG ERROR Stack:', error.stack);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      debug: 'Function failed',
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});