'use client';
// --- VERSIÓN CORREGIDA Y COMPLETA ---
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { usePatients } from "@/lib/hooks/usePatients";
import NeumorphicCalendar from "@/components/NeumorphicCalendar";

// 1. INTERFAZ ACTUALIZADA: Coincide con la respuesta de la API de 'appointments'
interface Appointment {
  id: string;
  appointment_date: string; // "YYYY-MM-DD"
  appointment_time: string; // "HH:MM:SS"
  status: string;
  patients: { // Objeto anidado de pacientes
    id: string;
    name: string;
  } | null; // Permitir que 'patients' sea null
}

export default function Dashboard() {
  const router = useRouter();
  const { data: patients = [], isLoading } = usePatients();
  const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  // El tipo de estado ahora usa la nueva interfaz Appointment
  const [monthlyAppointments, setMonthlyAppointments] = useState<Record<number, Appointment[]>>({});

  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  // 2. LÓGICA DE FETCH ACTUALIZADA
  const fetchAppointments = async (month: number, year: number) => {
    setIsLoadingAppointments(true);
    try {
      const response = await fetch(`/api/get-patient-appointments?month=${month + 1}&year=${year}`);
      if (!response.ok) throw new Error(`Error HTTP! status: ${response.status}`);
      
      const data: Appointment[] = await response.json();
      const map: Record<number, Appointment[]> = {};

      data.forEach((appointment) => {
        const dateObj = new Date(appointment.appointment_date + 'T00:00:00');
        if (dateObj.getMonth() === month && dateObj.getFullYear() === year) {
          const day = dateObj.getDate();
          if (!map[day]) map[day] = [];
          map[day].push(appointment);
        }
      });

      setMonthlyAppointments(map);
    } catch (error) {
      console.error("Error cargando citas:", error);
    } finally {
        setIsLoadingAppointments(false);
    }
  };


  useEffect(() => {
    fetchAppointments(currentMonth, currentYear);
  }, [currentMonth, currentYear]);

  // Transform appointments to NeumorphicCalendar events
  const calendarEvents = useMemo(() => {
    return Object.values(monthlyAppointments).flat().map(app => ({
        id: app.id,
        title: app.patients?.name || 'Cita',
        date: new Date(app.appointment_date + 'T00:00:00'),
        color: 1 as const // Type assertion to match 1|2|3|4
    }));
  }, [monthlyAppointments]);

  // Las citas ya vienen ordenadas desde la API (que arreglamos)
  const todaysAppointments = monthlyAppointments[selectedDate] || [];

  const handleNavigateToPatient = (appointment: Appointment) => {
    if (!appointment.patients?.id) return;
    router.push(`/patients/${appointment.patients.id}`);
  };

  const handleStartSession = (patientName: string, patientUuid: string) => {
    if (!patientUuid) return;
    router.push(`/session/${patientUuid}`);
  };

  return (
    <div className="min-h-screen bg-background">      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="inforia-h1 mb-2">Registro de Citas</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="col-span-1 md:col-span-3 space-y-8">
            <NeumorphicCalendar 
                viewDate={new Date(currentYear, currentMonth, 1)}
                onViewDateChange={(date) => {
                    setCurrentMonth(date.getMonth());
                    setCurrentYear(date.getFullYear());
                }}
                selectedDate={new Date(currentYear, currentMonth, selectedDate)}
                onDateSelect={(date) => {
                    setSelectedDate(date.getDate());
                    if (date.getMonth() !== currentMonth) {
                        setCurrentMonth(date.getMonth());
                        setCurrentYear(date.getFullYear());
                    }
                }}
                events={calendarEvents}
                onAddEvent={() => router.push("/new-patient")}
            />
          </div>

          <div className="col-span-1 md:col-span-2 space-y-8">
            <Card className="card-neumorphic border-0">
              <CardHeader className="pb-4">
                <CardTitle className="inforia-h3 flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-primary" /> Citas del Día {selectedDate}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                {isLoadingAppointments ? (
                  <div className="text-center py-8">
                    <p className="inforia-body text-muted-foreground">Cargando citas...</p>
                  </div>
                ) : todaysAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {todaysAppointments.map((appointment) => {
                      
                      let displayTime = 'Hora no definida';
                      if (appointment.appointment_time) {
                        try {
                          const timeParts = appointment.appointment_time.split(':');
                          const dateForTime = new Date();
                          dateForTime.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0);
                          displayTime = dateForTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                        } catch (e) { console.warn(e); }
                      }

                      const displayName = appointment.patients?.name ?? 'Paciente desconocido';
                      const displayPatientId = appointment.patients?.id ?? '';

                      return (
                        <div key={appointment.id} className="p-4 rounded-xl transition-calm" style={{
                            boxShadow: 'inset 4px 4px 8px rgba(46, 64, 59, 0.1), inset -4px -4px 8px rgba(255, 255, 255, 0.9)',
                            backgroundColor: 'var(--bg-color)',
                            border: '1px solid rgba(255,255,255,0.5)'
                        }}>
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-3">
                                <Clock className="h-4 w-4 text-primary" />
                                <span className="inforia-body font-semibold text-primary">
                                  {displayTime}
                                </span>
                              </div>
                              <div>
                                <button
                                  onClick={() => handleNavigateToPatient(appointment)}
                                  className="inforia-body font-medium hover:text-primary underline-offset-4 hover:underline text-left block"
                                  disabled={!displayPatientId}
                                >
                                  {displayName}
                                </button>
                                {appointment.status && appointment.status !== 'scheduled' && (
                                    <p className="inforia-small capitalize mt-1">
                                        {appointment.status}
                                    </p>
                                )}
                              </div>
                            </div>
                              {(() => {
                                const now = new Date();
                                const isToday = 
                                  selectedDate === now.getDate() && 
                                  currentMonth === now.getMonth() && 
                                  currentYear === now.getFullYear();

                                return isToday ? (
                                  <button
                                    className="btn-neumorphic text-sm"
                                    style={{ padding: '0.5em 1.2em' }}
                                    onClick={() => handleStartSession(displayName, displayPatientId)}
                                    disabled={!displayPatientId}
                                  >
                                    Iniciar Sesión
                                  </button>
                                ) : (
                                  <button
                                    className="btn-neumorphic text-sm"
                                    style={{ padding: '0.5em 1.2em' }}
                                    onClick={() => handleNavigateToPatient(appointment)}
                                    disabled={!displayPatientId}
                                  >
                                    Ver Ficha
                                  </button>
                                );
                              })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="inforia-h3 mb-2 text-muted-foreground">No hay citas para este día</h3>
                    <p className="inforia-body text-muted-foreground mb-6">
                      Selecciona otro día en el calendario.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}