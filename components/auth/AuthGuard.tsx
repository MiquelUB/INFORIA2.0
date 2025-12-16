'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      const isPublicPage = ['/login', '/auth/login', '/signup', '/auth/signup', '/activate', '/pricing', '/account', '/auth/callback', '/auth/auth-code-error'].some(path => pathname?.startsWith(path));

      // 1. Si no está logueado -> Login (solo si no es página pública)
      if (!user) {
        if (!isPublicPage) {
          router.push('/auth/login');
        }
        return;
      }

      // 2. Si está logueado pero NO tiene plan Y NO TIENE CRÉDITOS
      // Excluímos las páginas de configuración para no crear un bucle infinito
      const isExcluded = ['/pricing', '/account', '/activate'].some(path => pathname?.startsWith(path));
      
      const availableCredits = (profile?.credits_limit || 0) - (profile?.credits_used || 0);
      const hasCredits = availableCredits > 0;

      // ✅ REGLA ESTRICTA: Si no tiene créditos, bloqueo total (salvo páginas permitidas)
      if (!isExcluded && !hasCredits) {
        // Redirigir a la selección de planes
        router.push('/pricing?reason=no_credits');
      }
    }
  }, [user, profile, loading, router, pathname]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-gray-500">Verificando acceso...</span>
      </div>
    );
  }

  // Si no hay usuario y no es pública, no renderizamos nada (esperamos redirect)
  // Si es pública, renderizamos
  if (!user) {
     const isPublicPage = ['/login', '/auth/login', '/signup', '/auth/signup', '/activate', '/pricing', '/account', '/auth/callback'].some(path => pathname?.startsWith(path));
     if (!isPublicPage) return null;
  }

  return <>{children}</>;
};