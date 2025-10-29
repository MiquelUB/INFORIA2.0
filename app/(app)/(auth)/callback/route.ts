// en app/auth/callback/route.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'; // Importar CookieOptions
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'; // Redirige a /dashboard por defecto

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) { // Tipado explícito
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) { // Tipado explícito
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Redirección exitosa al dashboard o a 'next'
      return NextResponse.redirect(`${origin}${next}`);
    }
    // Loguear error si falla el intercambio
    console.error('Error exchanging code for session:', error.message);
  } else {
     // Loguear si no se recibe código
     console.error('No authorization code received in callback.');
  }

  // Si hay error o no hay código, redirigir a página de error
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}