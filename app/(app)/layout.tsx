'use client'; // Necesario para usar usePathname

import { usePathname } from "next/navigation"; // Hook para leer la ruta
import DashboardHeader from "@/components/DashboardHeader";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import LegalNoticeModal from "@/components/LegalNoticeModal";
import CookieBanner from "@/components/CookieBanner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Lógica: Definición estricta de páginas de autenticación/públicas
  const isAuthPage = ['/login', '/signup', '/auth/', '/auth/login', '/auth/signup'].some(path => pathname?.startsWith(path));

  return (
    <AuthProvider>
      <AuthGuard>
        <div className="flex flex-col h-screen bg-background">
          
          {/* Renderizado Condicional: Header solo si NO es página de auth */}
          {!isAuthPage && <DashboardHeader />}
          
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
        {!isAuthPage && (
          <>
            <LegalNoticeModal />
            <CookieBanner />
          </>
        )}
      </AuthGuard>
    </AuthProvider>
  );
}