// en app/auth/callback/route.ts
import { claimService } from '@/lib/services/claimService';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

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
          set(name: string, value: string, options: CookieOptions) { 
            console.log(`[CALLBACK_ROUTE] Setting Cookie: ${name}, Options:`, options);
            
            // 🔥 CRITICAL FIX: Force cookies to be insecure on localhost to prevent browser rejection
            const isDev = process.env.NODE_ENV === 'development';
            const finalOptions = {
              ...options,
              secure: isDev ? false : options.secure,
              sameSite: isDev ? 'lax' : options.sameSite,
              path: '/',
            };

            cookieStore.set({ name, value, ...finalOptions }); 
          },
          remove(name: string, options: CookieOptions) { cookieStore.delete({ name, ...options }); },
        },
      }
    );

    // 2. INTERCAMBIAR CÓDIGO POR SESIÓN
    const { data: { session, user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user && session) {
      // 2.1. GUARDAR TOKENS DE GOOGLE EN LA BASE DE DATOS
      try {
        const { provider_token, provider_refresh_token } = session;
        
        if (provider_token) {
          console.log('💾 [CALLBACK] Guardando Google tokens en la base de datos...');
          
          const { error: updateError } = await supabase
            .from('users')
            .update({
              google_access_token: provider_token,
              google_refresh_token: provider_refresh_token || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

          if (updateError) {
            console.error('❌ [CALLBACK] Error guardando tokens:', updateError);
          } else {
            console.log('✅ [CALLBACK] Tokens guardados exitosamente');
          }
        }
      } catch (tokenError) {
        console.error('❌ [CALLBACK] Error procesando tokens:', tokenError);
        // No bloqueamos el flujo si falla el guardado de tokens
      }

      // 3. LÓGICA DE RECLAMACIÓN (CLAIM)
      if (token) {
        console.log('🎟️ Callback detectó token de compra:', token);
        const result = await claimService.redeemToken(user.id, token);
        
        if (result.success) {
          console.log('✅ Compra vinculada exitosamente');
          return NextResponse.redirect(`${origin}/dashboard?welcome=true`);
        } else {
          console.error('❌ Fallo al vincular compra:', result.error);
          return NextResponse.redirect(`${origin}/auth/login?error=invalid_claim`);
        }
      }

      // Flujo normal (sin token)
      return NextResponse.redirect(`${origin}${next}`);
    } else if (error) {
        console.error('Error exchanging code for session:', error.message);
    }
  } else {
      console.error('No authorization code received in callback.');
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
