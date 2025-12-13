import { createServerClient, type CookieOptions } from '@supabase/ssr'
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

  // Verificar sesión para el resto de rutas (OPTIMIZADO)
  // Usamos getSession() en lugar de getUser() para que sea LOCAL y RÁPIDO.
  // La seguridad real está en RLS (Base de datos). El middleware solo enruta.
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  const user = session?.user

  console.log(`[MIDDLEWARE] getSession result: User=${!!user}, Error=${sessionError?.message}`);

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
  if (!user || sessionError) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // 5. LÓGICA DE NEGOCIO (Créditos) -> MOVIDO A CLIENT-SIDE (AuthGuard)
  // Eliminamos la consulta a base de datos bloqueante para acelerar la navegación.
  // La verificación de créditos se hace en @/components/auth/AuthGuard.tsx


  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|\\.well-known).*)',
  ],
}