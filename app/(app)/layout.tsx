// app/(app)/layout.tsx
import DashboardHeader from "@/components/DashboardHeader"; // Esta ruta está bien aquí
import QueryProvider from "@/components/QueryProvider"; // <-- 1. IMPORTAR EL PROVIDER

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider> {/* <-- 2. ENVOLVER AQUÍ */}
      {/* El <AuthGuard> se ha eliminado */} {/* <-- 3. COMENTARIO CORREGIDO */}
      <div className="flex h-screen bg-background">
        {/* ... (Sidebar, etc.) ... */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      {/* El </AuthGuard> se ha eliminado */} {/* <-- 4. COMENTARIO CORREGIDO */}
    </QueryProvider>
  );
}