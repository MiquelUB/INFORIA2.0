// app/api/google-token/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Obtener la sesión del usuario
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return NextResponse.json(
        { error: 'No authenticated session' },
        { status: 401 }
      );
    }

    // Verificar si hay provider_token
    if (!session.provider_token) {
      return NextResponse.json(
        { error: 'No Google provider token available. Please re-authenticate.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ 
      token: session.provider_token
    });

  } catch (error) {
    console.error('Error getting Google token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
