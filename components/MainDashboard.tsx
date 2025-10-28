import { Header } from "@/components/Header";
import DayFocus from "@/components/DayFocus";
import CalendarModule from "@/components/CalendarModule";
import { ReportModule } from "@/components/ReportModule";
import { SearchModule } from "@/components/SearchModule";
import StatsOverview from "@/components/StatsOverview";
import QuickActions from "@/components/QuickActions";
import { CreditsStatus } from "@/components/CreditsStatus";

const MainDashboard = () => {
  return (
    <div className="min-h-screen bg-bone">
      {/* Header Principal con navegación e identidad de marca */}
      <Header />

      {/* Puesto de Mando Clínico - Layout principal */}
      <main className="p-8 max-w-7xl mx-auto">
        {/* Layout 70/30 - Foco del Día (Izquierda) + Módulos (Derecha) */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          
          {/* Columna Principal - Foco del Día (70% - 7/10 columns) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Estadísticas Overview */}
            <div className="animate-fade-in">
              <h2 className="font-serif text-xl font-medium text-foreground mb-4">
                Resumen de Actividad
              </h2>
              <StatsOverview />
            </div>

            {/* Foco del Día - Citas de Hoy */}
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <DayFocus />
            </div>
          </div>

          {/* Columna Secundaria - Módulos de Control (30% - 3/10 columns) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Estado de Créditos */}
            <div className="animate-fade-in" style={{ animationDelay: '250ms' }}>
              <CreditsStatus />
            </div>

            {/* Calendario Compacto */}
            <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
              <CalendarModule />
            </div>

            {/* Acciones Rápidas */}
            <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
              <QuickActions />
            </div>

            {/* Módulo de Generación de Informes */}
            <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
              <ReportModule />
            </div>

            {/* Módulo de Búsqueda */}
            <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
              <SearchModule />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainDashboard;