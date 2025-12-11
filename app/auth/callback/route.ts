import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { claimService } from '@/lib/services/claimService'; // IMPORTANTE

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token = searchParams.get('token'); // 1. LEER TOKEN
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
          remove(name: string, options: CookieOptions) { cookieStore.delete({ name, ...options }); },
        },
      }
    );

    // 2. INTERCAMBIAR CÓDIGO POR SESIÓN
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      // 3. LÓGICA DE RECLAMACIÓN (CLAIM)
      if (token) {
        console.log('🎟️ Callback detectó token de compra:', token);
        const result = await claimService.redeemToken(user.id, token);
        
        if (result.success) {
          console.log('✅ Compra vinculada exitosamente');
          return NextResponse.redirect(`${origin}/dashboard?welcome=true`);
        } else {
          console.error('❌ Fallo al vincular compra:', result.error);
          return NextResponse.redirect(`${origin}/login?error=invalid_claim`);
        }
      }

      // Flujo normal (sin token)
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
