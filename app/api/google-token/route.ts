// app/api/google-token/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Obtener el usuario autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ [google-token] No authenticated user:', userError);
      return NextResponse.json(
        { error: 'No authenticated session' },
        { status: 401 }
      );
    }

    // Recuperar el token de Google desde la base de datos
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('google_access_token, google_refresh_token')
      .eq('id', user.id)
      .single();

    if (dbError) {
      console.error('❌ [google-token] Error fetching user data:', dbError);
      return NextResponse.json(
        { error: 'Error fetching user data' },
        { status: 500 }
      );
    }

    if (!userData?.google_access_token) {
      console.warn('⚠️ [google-token] No Google token found for user:', user.id);
      return NextResponse.json(
        { error: 'No Google provider token available. Please re-authenticate.' },
        { status: 403 }
      );
    }

    console.log('✅ [google-token] Token retrieved successfully');
    return NextResponse.json({ 
      token: userData.google_access_token,
      refresh_token: userData.google_refresh_token
    });

  } catch (error) {
    console.error('❌ [google-token] Internal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
