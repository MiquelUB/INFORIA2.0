import { NextResponse } from 'next/server';

interface HealthCheckResult {
  [key: string]: {
    [key: string]: string;
  };
}

export async function GET() {
  // Security: This endpoint exposes configuration information
  // Only allow in development or require authentication
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is disabled in production' },
      { status: 403 }
    );
  }

  const results: HealthCheckResult = {};

  // 1. Supabase
  results.supabase = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌',
    serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌',
  };

  // 2. OpenRouter
  results.openrouter = {
    apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ? '✅' : '❌',
  };

  // Test OpenRouter connection
  if (process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'INFORIA',
        },
      });
      results.openrouter.connection = response.ok ? '✅ Connected' : `❌ Status ${response.status}`;
    } catch (e: unknown) {
      results.openrouter.connection = `❌ ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  // 3. Google
  results.google = {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? '✅' : '❌',
    serviceAccount: process.env.NEXT_GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✅' : '❌',
    privateKey: process.env.NEXT_GOOGLE_ACCOUNT_PRIVATE_KEY ? '✅' : '❌',
  };

  // 4. OpenAI
  results.openai = {
    apiKey: process.env.OPENAI_API_KEY ? '✅' : '❌',
  };

  // Test OpenAI connection
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      });
      results.openai.connection = response.ok ? '✅ Connected' : `❌ Status ${response.status}`;
    } catch (e: unknown) {
      results.openai.connection = `❌ ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  // 5. Stripe
  results.stripe = {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅' : '❌',
    secretKey: process.env.STRIPE_SECRET_KEY ? '✅' : '❌',
  };

  // Test Stripe connection
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const response = await fetch('https://api.stripe.com/v1/account', {
        headers: {
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        },
      });
      results.stripe.connection = response.ok ? '✅ Connected' : `❌ Status ${response.status}`;
    } catch (e: unknown) {
      results.stripe.connection = `❌ ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  return NextResponse.json(results, {
    headers: {
      'Content-Type': 'application/json',
    }
  });
}
