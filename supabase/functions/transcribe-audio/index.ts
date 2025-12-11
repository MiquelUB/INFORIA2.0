import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }

    // Log only non-sensitive info (PILAR 2: Volatilidad - no loguear datos clínicos)
    console.log('Transcription request from user');

    // Parse form data for audio file
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      throw new Error('No audio file provided');
    }

    // Log only metadata, not content (PILAR 2: Volatilidad)
    console.log('Processing audio file - Size:', audioFile.size);

    // Prepare form data for OpenAI Whisper API
    const whisperFormData = new FormData();
    whisperFormData.append('file', audioFile);
    whisperFormData.append('model', 'whisper-1');
    whisperFormData.append('language', 'es'); // Spanish language
    whisperFormData.append('response_format', 'json');

    // Call OpenAI Whisper API (data only in memory - PILAR 2: Volatilidad)
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: whisperFormData,
    });

    if (!whisperResponse.ok) {
      console.error('Whisper API error status:', whisperResponse.status);
      throw new Error(`Whisper API error: ${whisperResponse.status}`);
    }

    const whisperData = await whisperResponse.json();
    const transcription = whisperData.text;

    // Log only completion, not content (PILAR 2: Volatilidad)
    console.log('Audio transcription completed');

    // Return transcription (now in memory, will be used by client/further processing)
    return new Response(
      JSON.stringify({
        success: true,
        transcription: transcription,
        duration: whisperData.duration || null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in transcribe-audio function:', error.message);
    
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});