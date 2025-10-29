"use client"; // CRÍTICO: Asegura que el componente se renderice en el cliente para usar cualquier hook de React.

import { Header } from "./Header";
import CalendarModule from "./CalendarModule";
import { ReportModule } from "./ReportModule";
import { SearchModule } from "./SearchModule";

// Nota: Se ha eliminado 'import { useSearchParams } from "next/navigation";' ya que no se utiliza en el cuerpo del componente Dashboard, manteniendo el código limpio.

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />
      
      {/* Main Content - Two Column Layout 50/50 (Responsive en escritorio) */}
      <div className="flex flex-col md:flex-row h-full md:h-[calc(100vh-4rem)]">
        
        {/* Left Column - Calendar Module (50%) */}
        <div className="w-full md:w-1/2 p-6 md:pr-3">
          {/* Recomendación: Asegurar que CalendarModule sea responsive. */}
          <CalendarModule />
        </div>
        
        {/* Right Column - Report & Search Modules (50%) */}
        <div className="w-full md:w-1/2 p-6 md:pl-3 flex flex-col space-y-6">
          
          {/* Top Sub-module - Report Module */}
          <div className="flex-1 min-h-[30vh] md:min-h-0">
            {/* El flex-1 asegura que ocupe el espacio disponible, crucial para el diseño de la derecha. */}
            <ReportModule />
          </div>
          
          {/* Bottom Sub-module - Search Module */}
          <div className="flex-1 min-h-[30vh] md:min-h-0">
            <SearchModule />
          </div>
        </div>
      </div>
    </div>
  );
};