import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePatients } from "@/lib/hooks/usePatients";

const DayFocus = () => {
  const { data: patients = [] } = usePatients();
  
  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Citas de hoy vacías - se cargarían desde la API en una implementación real
  interface Appointment {
    id: string;
    time: string;
    patient: string;
    type: string;
    status: string;
    patientId: string;
  }

  const todayAppointments: Appointment[] = [];

  const getInitials = (name: string) => {
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      default: return 'Desconocido';
    }
  };

  return (
    <Card className="border-module-border bg-module-background">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="module-title flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              Foco del Día
            </CardTitle>
            <p className="text-sm text-muted-foreground capitalize mt-1">
              {today}
            </p>
          </div>
          <Link href="/new-patient?date=2025-08-22">
            <Button size="sm" className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Cita
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {todayAppointments.length > 0 ? (
          <>
            {todayAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center space-x-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-calm border border-module-border group cursor-pointer"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(appointment.patient)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-foreground">
                        {appointment.patient}
                      </h4>
                      <Badge variant="outline" className={getStatusColor(appointment.status)}>
                        {getStatusText(appointment.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{appointment.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link href={`/session/${appointment.patientId}`}>
                    <Button size="sm" variant="outline">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href={`/patients/${appointment.patientId}`}>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors cursor-pointer" />
                  </Link>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t border-module-border">
              <Link href="/patient-list">
                <Button variant="ghost" className="w-full justify-between hover:bg-muted/50">
                  <span>Ver todos los pacientes</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-foreground mb-2">
              No hay citas programadas para hoy
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Aprovecha para ponerte al día con informes pendientes
            </p>
            <Link href="/new-patient">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Programar Cita
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DayFocus;