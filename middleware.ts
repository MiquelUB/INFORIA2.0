// middleware.ts (VERSIÓN SEGURA Y OPERATIVA)
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: { headers: req.headers }
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          req.cookies.set({ name, value, ...options });
          res = NextResponse.next({ request: { headers: req.headers } });
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          req.cookies.set({ name, value: '', ...options });
          res = NextResponse.next({ request: { headers: req.headers } });
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // 1. Verificar sesión
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  // 2. Rutas públicas (siempre permitidas)
  const publicPaths = ['/', '/auth', '/login', '/signup', '/blocked'];
  if (publicPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
    return res;
  }

  // 3. Redireccionar si no hay sesión
  if (!session || sessionError) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  // 4. Verificar créditos en la DB (NO en user_metadata)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', session.user.id)
    .single();

  // 5. Manejar errores de consulta
  if (profileError) {
    console.error('[MIDDLEWARE] Error fetching profile:', profileError);
    return res; // Permitir acceso si falla la consulta (fail-open)
  }

  // 6. Bloquear si no hay créditos
  if (profile.credits <= 0 && req.nextUrl.pathname !== '/blocked') {
    const blockedUrl = new URL('/blocked', req.url);
    blockedUrl.searchParams.set('reason', 'no_credits');
    return NextResponse.redirect(blockedUrl);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};