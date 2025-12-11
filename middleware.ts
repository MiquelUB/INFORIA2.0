<<<<<<< HEAD
// middleware.ts (VERSIÓN CORREGIDA DEFINITIVA)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
=======
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
>>>>>>> feature/stripe-integration

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

<<<<<<< HEAD
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname, searchParams } = request.nextUrl

  // 🔥 GESTIÓN COMPLETA DE /auth/callback
  if (pathname === '/auth/callback') {
    console.log('[MIDDLEWARE] Entering /auth/callback handler.')
    
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const errorCode = searchParams.get('error_code')
    const errorDescription = searchParams.get('error_description')

    // 🔴 SI HAY ERROR DE SUPABASE/GOOGLE
    if (error || !code) {
      console.error('[MIDDLEWARE] ❌ OAuth Error:', {
        error,
        errorCode,
        errorDescription,
        hasCode: !!code,
        fullUrl: request.url
      })

      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('error', 'oauth_error')
      loginUrl.searchParams.set('message', 
        errorDescription || 
        'Error de autenticación. Verifica la configuración de OAuth en Supabase.'
      )
      
      return NextResponse.redirect(loginUrl)
    }

    // ✅ INTERCAMBIO DE CÓDIGO
    try {
      console.log('[MIDDLEWARE] ✅ Code found, exchanging with Supabase...')
      
      const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('[MIDDLEWARE] ❌ Exchange failed:', {
          error: exchangeError.message,
          status: exchangeError.status,
          name: exchangeError.name
        })
        
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('error', 'exchange_failed')
        loginUrl.searchParams.set('message', 
          'No se pudo completar la autenticación. Verifica que el Redirect URI de Supabase esté registrado en Google Cloud Console.'
        )
        
        return NextResponse.redirect(loginUrl)
      }

      if (!sessionData?.session) {
        console.error('[MIDDLEWARE] ❌ No session created')
        
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('error', 'no_session')
        loginUrl.searchParams.set('message', 'No se pudo crear la sesión')
        
        return NextResponse.redirect(loginUrl)
      }

      console.log('[MIDDLEWARE] ✅ Session established successfully')
      
      // ✅ REDIRIGIR A ONBOARDING O DASHBOARD
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', sessionData.session.user.id)
        .single()

      const redirectPath = profile?.onboarding_completed === false 
        ? '/onboarding' 
        : '/dashboard'

      console.log(`[MIDDLEWARE] 🎯 Redirecting to ${redirectPath}`)
      return NextResponse.redirect(new URL(redirectPath, request.url))

    } catch (error) {
      console.error('[MIDDLEWARE] ❌ Unexpected error:', error)
      
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('error', 'unexpected')
      loginUrl.searchParams.set('message', 'Error inesperado durante autenticación')
      
      return NextResponse.redirect(loginUrl)
    }
  }

  // ... resto del middleware

  return supabaseResponse
=======
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { 
            try {
              return req.cookies.get(name)?.value;
            } catch (error) {
              console.error(`Error getting cookie ${name}:`, error);
              return undefined;
            }
          },
          set(name: string, value: string, options) {
            try {
              req.cookies.set({ name, value, ...options });
              res = NextResponse.next({ request: { headers: req.headers } });
              res.cookies.set({ name, value, ...options });
            } catch (error) {
              console.error(`Error setting cookie ${name}:`, error);
            }
          },
          remove(name: string, options) {
            try {
              req.cookies.delete(name);
              res = NextResponse.next({ request: { headers: req.headers } });
              res.cookies.delete(name);
            } catch (error) {
              console.error(`Error removing cookie ${name}:`, error);
            }
          },
        },
      }
    );

    // 1. Verificar sesión
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    const { pathname } = req.nextUrl;

    // Handle root path for authenticated users
    if (user && pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // 2. LÓGICA DE USUARIO AUTENTICADO
    // Si el usuario TIENE sesión y está en /login, llévalo al dashboard.
    if (user && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    // 3. RUTAS PÚBLICAS
    // Añadimos /pricing a las rutas públicas para que el usuario bloqueado pueda verla
    const publicPaths = ['/login', '/signup', '/blocked', '/pricing'];
    
    if (
      publicPaths.includes(pathname) ||
      pathname.startsWith('/auth/') // Para /auth/callback, /auth/auth-code-error
    ) {
      return res;
    }

    // 4. LÓGICA DE USUARIO NO AUTENTICADO
    // Si no es pública (ej. "/") y no hay sesión, redirigimos a /login.
    if (!user || userError) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // 5. LÓGICA DE NEGOCIO (Créditos)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('onboarding_completed, credits_limit, credits_used')
      .eq('id', user.id) 
      .single();

    if (profileError) {
      console.error('[MIDDLEWARE] Error fetching profile:', profileError);
      return res; 
    }

    // 5.5 Lógica de Créditos
    // Verificar que profile existe antes de acceder a credits
    if (profile) {
      const availableCredits = (profile.credits_limit || 0) - (profile.credits_used || 0);
      
      console.log(`[MIDDLEWARE DEBUG] User: ${user.id} | Limit: ${profile.credits_limit} | Used: ${profile.credits_used} | Available: ${availableCredits} | Path: ${pathname}`);

      // Excluir rutas de API y cuenta del bloqueo para permitir recargas y gestión
      const isApiRoute = pathname.startsWith('/api');
      const isAccountPage = pathname.startsWith('/account');
      const isPricingPage = pathname.startsWith('/pricing');
      const isActivatePage = pathname.startsWith('/activate');

      // ✅ REGLA ESTRICTA: Si está a 0 créditos, NO entra. Redirigir a recarga.
      if (availableCredits <= 0 && !isPricingPage && !isApiRoute && !isAccountPage && !isActivatePage) {
        console.log('[MIDDLEWARE] ⛔ Bloqueo por falta de créditos (0). Redirigiendo a /pricing.');
        return NextResponse.redirect(new URL('/pricing?reason=no_credits', req.url));
      }
    }

    // 6. Permitir acceso al Dashboard
    return res;
  } catch (error) {
    console.error('[MIDDLEWARE] Error:', error);
    // Si hay error en middleware, permitir continuar pero registrar el error
    return res;
  }
>>>>>>> feature/stripe-integration
}

export const config = {
  matcher: [
<<<<<<< HEAD
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
=======
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
>>>>>>> feature/stripe-integration
  ],
}