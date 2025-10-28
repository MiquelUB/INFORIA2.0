// D:\iNFORiA\SaaS\INFORIA2.0\middleware.ts

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 1. Crear el cliente de Supabase para el middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        // ...
      // ...
remove(name: string, options) {
  request.cookies.set({ name, value: '', ...options }) // <-- CORREGIDO
  response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
  response.cookies.set({ name, value: '', ...options }) // <-- CORREGIDO
},
  
      },
    }
  )

  // 2. Obtener la sesión del usuario
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname

  // 3. Lógica de redirección (Usuario NO autenticado)
  if (!session && pathname !== '/login') {
    // Redirigir al login si no está en login e intenta acceder a algo
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 4. Lógica de redirección (Usuario SÍ autenticado)
  if (session) {
    // Si intenta ir al login estando logueado, redirigir al dashboard
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 5. Lógica de Onboarding (Basada en la BBDD)
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', session.user.id)
      .single()

    // Si no ha completado el onboarding Y NO está en la página de onboarding
    if (profile && !profile.onboarding_completed && pathname !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  // 6. Permitir el acceso
  return response
}

// 7. Configuración del Matcher (Rutas protegidas)
export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas excepto:
     * - api (rutas de API)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (archivo de favicon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}