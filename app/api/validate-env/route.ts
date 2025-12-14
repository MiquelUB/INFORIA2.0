import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const results: Record<string, any> = {};

  try {
    // 1. Validar Supabase
    results.supabase = {
      status: 'checking',
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ No configurada',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada',
      serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ No configurada',
    };

    // Intentar conectar a Supabase
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error && error.status !== 400) {
        results.supabase.connection = `⚠️ Error: ${error.message}`;
      } else {
        results.supabase.connection = '✅ Conectado';
      }
    } catch (e: any) {
      results.supabase.connection = `❌ Error de conexión: ${e.message}`;
    }
  } catch (error: any) {
    results.supabase = {
      status: 'error',
      message: error.message
    };
  }

  try {
    // 2. Validar OpenRouter API
    results.openrouter = {
      status: 'checking',
      apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ? '✅ Configurada' : '❌ No configurada',
    };

    if (process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            'X-Title': 'INFORIA',
          },
        });

        if (response.ok) {
          results.openrouter.connection = '✅ Conectado';
          const data = await response.json();
          results.openrouter.modelsAvailable = data.data?.length || 0;
        } else {
          results.openrouter.connection = `❌ HTTP ${response.status}`;
        }
      } catch (e: any) {
        results.openrouter.connection = `❌ Error: ${e.message}`;
      }
    }
  } catch (error: any) {
    results.openrouter = {
      status: 'error',
      message: error.message
    };
  }

  try {
    // 3. Validar Google OAuth
    results.google = {
      status: 'checking',
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? '✅ Configurada' : '❌ No configurada',
      serviceAccount: process.env.NEXT_GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✅ Configurada' : '❌ No configurada',
      privateKey: process.env.NEXT_GOOGLE_ACCOUNT_PRIVATE_KEY ? '✅ Configurada' : '❌ No configurada',
    };
  } catch (error: any) {
    results.google = {
      status: 'error',
      message: error.message
    };
  }

  try {
    // 4. Validar OpenAI API
    results.openai = {
      status: 'checking',
      apiKey: process.env.OPENAI_API_KEY ? '✅ Configurada' : '❌ No configurada',
    };

    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        });

        if (response.ok) {
          results.openai.connection = '✅ Conectado';
          const data = await response.json();
          results.openai.modelsAvailable = data.data?.length || 0;
        } else {
          results.openai.connection = `❌ HTTP ${response.status}`;
        }
      } catch (e: any) {
        results.openai.connection = `❌ Error: ${e.message}`;
      }
    }
  } catch (error: any) {
    results.openai = {
      status: 'error',
      message: error.message
    };
  }

  try {
    // 5. Validar Stripe API
    results.stripe = {
      status: 'checking',
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Configurada' : '❌ No configurada',
      secretKey: process.env.STRIPE_SECRET_KEY ? '✅ Configurada' : '❌ No configurada',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? '✅ Configurada' : '❌ No configurada',
    };

    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const response = await fetch('https://api.stripe.com/v1/account', {
          headers: {
            'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          },
        });

        if (response.ok) {
          results.stripe.connection = '✅ Conectado';
          const data = await response.json();
          results.stripe.accountType = data.type;
        } else if (response.status === 401) {
          results.stripe.connection = '❌ Clave inválida (401)';
        } else {
          results.stripe.connection = `❌ HTTP ${response.status}`;
        }
      } catch (e: any) {
        results.stripe.connection = `❌ Error: ${e.message}`;
      }
    }
  } catch (error: any) {
    results.stripe = {
      status: 'error',
      message: error.message
    };
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    results,
    summary: {
      supabase: results.supabase?.connection ? 'ok' : 'error',
      openrouter: results.openrouter?.connection ? 'ok' : 'error',
      google: 'configured',
      openai: results.openai?.connection ? 'ok' : 'error',
      stripe: results.stripe?.connection ? 'ok' : 'error',
    }
  });
}
