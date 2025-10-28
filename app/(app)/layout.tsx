// app/(app)/layout.tsx
import DashboardHeader from "@/components/DashboardHeader"; // Ajustar ruta si es necesario

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    // El <AuthGuard> se ha eliminado
    <div className="flex h-screen bg-background">
      {/* ... (Sidebar, etc.) ... */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
    // El </AuthGuard> se ha eliminado
  );
}