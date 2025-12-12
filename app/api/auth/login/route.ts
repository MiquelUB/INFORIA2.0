// En: app/api/auth/login/route.ts

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const requestUrl = new URL(request.url);

  // 1. Determinar la URL de origen
  //    (usamos requestUrl.origin para asegurar que sea la URL correcta de despliegue)
  const redirectTo = `${requestUrl.origin}/auth/callback`;

  // 2. Generar la URL de OAuth
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // CAMBIO ÚNICO: Corregir la URL de callback
      // Antes: `${new URL(request.url).origin}/auth/auth/callback`
      redirectTo: redirectTo,
      
      // Funcionalidad preservada:
      scopes: 'https://www.googleapis.com/auth/drive.file',
    },
  });

  if (error) {
    console.error('Error creating Google Auth URL:', error);
    return NextResponse.json({ error: 'Failed to create auth URL' }, { status: 500 });
  }

  return NextResponse.json({ url: data.url });
}