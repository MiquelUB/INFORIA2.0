// app/(app)/layout.tsx
import DashboardHeader from "@/components/DashboardHeader"; // Ajustar ruta si es necesario

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col">
      {/* <DashboardHeader />  // Ejemplo de cabecera compartida */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}