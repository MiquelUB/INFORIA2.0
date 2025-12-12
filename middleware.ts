import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { pathname, searchParams } = request.nextUrl
  
  console.log(`[MIDDLEWARE] ${request.method} ${pathname}`);
  // Debug cookies (omit sensitive values in prod, but useful here)
  // const allCookies = request.cookies.getAll().map(c => c.name).join(', ');
  // console.log(`[MIDDLEWARE] Cookies: ${allCookies}`);

  // 🚫 BLOCK REMOVED: /auth/callback logic is handled by app/auth/callback/route.ts

  // Verificar sesión para el resto de rutas
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  console.log(`[MIDDLEWARE] getUser result: User=${!!user}, Error=${userError?.message}`);

  if (user) {
     console.log(`[MIDDLEWARE] ✅ User authenticated: ${user.email} (${user.id})`);
  } else {
     console.log(`[MIDDLEWARE] ❌ No active session found.`);
  }

  // Handle root path for authenticated users
  if (user && pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 2. LÓGICA DE USUARIO AUTENTICADO
  // Si el usuario TIENE sesión y está en /auth/login, llévalo al dashboard.
  if (user && pathname === '/auth/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // 3. RUTAS PÚBLICAS
  // Añadimos /pricing a las rutas públicas para que el usuario bloqueado pueda verla
  const publicPaths = ['/auth/login', '/signup', '/blocked', '/pricing']
  
  if (
    publicPaths.includes(pathname) ||
    pathname.startsWith('/auth/') // Para /auth/callback, /auth/auth-code-error
  ) {
    return supabaseResponse
  }

  // 4. LÓGICA DE USUARIO NO AUTENTICADO
  // Si no es pública (ej. "/") y no hay sesión, redirigimos a /auth/login.
  if (!user || userError) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // 5. LÓGICA DE NEGOCIO (Créditos)
  try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_completed, credits_limit, credits_used')
        .eq('id', user.id) 
        .single()

      if (profileError) {
        console.error('[MIDDLEWARE] Error fetching profile:', profileError)
      }

      // 5.5 Lógica de Créditos
      // Verificar que profile existe antes de acceder a credits
      if (profile) {
        const availableCredits = (profile.credits_limit || 0) - (profile.credits_used || 0)
        
        console.log(`[MIDDLEWARE DEBUG] User: ${user.id} | Limit: ${profile.credits_limit} | Used: ${profile.credits_used} | Available: ${availableCredits} | Path: ${pathname}`)

        // Excluir rutas de API y cuenta del bloqueo para permitir recargas y gestión
        const isApiRoute = pathname.startsWith('/api')
        const isAccountPage = pathname.startsWith('/account')
        const isPricingPage = pathname.startsWith('/pricing')
        const isActivatePage = pathname.startsWith('/activate')

        // ✅ REGLA ESTRICTA: Si está a 0 créditos, NO entra. Redirigir a recarga.
        if (availableCredits <= 0 && !isPricingPage && !isApiRoute && !isAccountPage && !isActivatePage) {
          console.log('[MIDDLEWARE] ⛔ Bloqueo por falta de créditos (0). Redirigiendo a /pricing.')
          return NextResponse.redirect(new URL('/pricing?reason=no_credits', request.url))
        }
      }
  } catch (err) {
      console.error('[MIDDLEWARE] Credits logic error:', err)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}