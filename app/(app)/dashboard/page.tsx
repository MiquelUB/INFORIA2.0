'use client';
// src/pages/Dashboard.tsx - Adaptado para Next.js App Router
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useRouter } from "next/navigation"; // <-- CAMBIO: Importar de next/navigation
import { useState, useEffect } from "react";
import { usePatients } from "@/hooks/usePatients";

interface Appointment {
  patientUuid: string;
  patient: string;
  time: string;
  type: string;
  status: string;
  date: string;
}

export default function Dashboard() {
  const router = useRouter(); // <-- CAMBIO: Usar useRouter
  const { data: patients = [], isLoading } = usePatients();
  const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [monthlyAppointments, setMonthlyAppointments] = useState<Record<number, Appointment[]>>({});

  const realPatients = patients.length > 0 ? patients : [];

  // Función para cargar citas del mes desde backend (API Route Handler)
  const fetchAppointments = async (month: number, year: number) => {
    try {
      const response = await fetch(`/api/get-patient-appointments?month=${month + 1}&year=${year}`);
      // Validación robusta de la respuesta
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("Oops, we haven't got JSON!");
      }
      const data = await response.json(); // Array de pacientes con columnas de citas

      const map: Record<number, Appointment[]> = {};

      // El resto de la lógica de mapeo sigue igual...
      data.forEach((patient: any) => {
        const patientUuid = patient.ID;
        Object.keys(patient)
          .filter((key) => key.startsWith("Cita"))
          .forEach((citaKey) => {
            const citaValue = patient[citaKey];
            if (citaValue) {
              try {
                const dateObj = new Date(citaValue);
                 // Validar fecha antes de usarla
                 if (isNaN(dateObj.getTime())) {
                  console.warn(`Fecha inválida encontrada para paciente ${patientUuid}, cita ${citaKey}: ${citaValue}`);
                  return; // Saltar esta cita inválida
                }
                if (dateObj.getMonth() === month && dateObj.getFullYear() === year) {
                  const day = dateObj.getDate();
                  if (!map[day]) map[day] = [];
                  map[day].push({
                    patientUuid,
                    patient: patient["Nombre Completo"],
                    time: dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    type: "Consulta", // Asumiendo tipo por ahora
                    status: "confirmada", // Asumiendo estado por ahora
                    date: citaValue,
                  });
                }
              } catch (dateError) {
                console.error(`Error procesando fecha '${citaValue}' para cita ${citaKey}:`, dateError);
              }
            }
          });
      });
      setMonthlyAppointments(map);
    } catch (error) {
       // Mejor manejo de errores
      console.error("Error cargando citas:", error);
      // Aquí podrías mostrar un toast al usuario, por ejemplo:
      // toast({ title: "Error al cargar citas", description: "No se pudieron obtener las citas. Inténtalo de nuevo.", variant: "destructive" });
    }
  };


  useEffect(() => {
    fetchAppointments(currentMonth, currentYear);
  }, [currentMonth, currentYear]);

  const todaysAppointments = monthlyAppointments[selectedDate] || [];

  const getMonthName = (monthIndex: number): string => {
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return months[monthIndex] ?? "";
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((m) => {
      if (direction === "prev") {
        if (m === 0) {
          setCurrentYear((y) => y - 1);
          return 11;
        }
        return m - 1;
      } else {
        if (m === 11) {
          setCurrentYear((y) => y + 1);
          return 0;
        }
        return m + 1;
      }
    });
  };

  const generateCalendarDays = () => {
    const year = currentYear;
    const month = currentMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7; // lunes=0
    const daysInMonth = lastDay.getDate();
    const days: { day: number; isCurrentMonth: boolean; isToday: boolean; hasAppointments: boolean; }[] = [];

    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, isCurrentMonth: false, isToday: false, hasAppointments: false });
    }

    const today = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
      days.push({ day: d, isCurrentMonth: true, isToday, hasAppointments: !!monthlyAppointments[d] });
    }

    // Ajuste para asegurar que siempre haya 35 días (5 semanas)
    const totalDaysDisplayed = days.length;
    const nextMonthDayCount = (7 - (totalDaysDisplayed % 7)) % 7; // Días necesarios del mes siguiente

    for (let d = 1; d <= nextMonthDayCount; d++) {
       days.push({ day: d, isCurrentMonth: false, isToday: false, hasAppointments: false });
    }

    // Si aún no tenemos 35, rellenar una semana más del mes siguiente
    if (days.length < 35) {
       const remainingForFullGrid = 35 - days.length;
       for (let d = nextMonthDayCount + 1; d <= nextMonthDayCount + remainingForFullGrid; d++) {
         days.push({ day: d, isCurrentMonth: false, isToday: false, hasAppointments: false });
       }
    }


    return days.slice(0, 35); // Asegura exactamente 35 días
  };

  const days = generateCalendarDays();

  const handleNavigateToPatient = (appointment: Appointment) => {
    // CAMBIO: Usar router.push
    router.push(`/patient-detailed-profile?id=${appointment.patientUuid}`);
  };

  const handleStartSession = (patientName: string, patientUuid: string) => {
    // CAMBIO: Usar router.push
    router.push(`/session-workspace?patientId=${patientUuid}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-primary mb-2">Registro de Citas</h1>
        </div>
        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-3 space-y-8">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-center space-x-6">
                  <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => navigateMonth("prev")}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="font-serif text-xl font-medium">{getMonthName(currentMonth)} {currentYear}</h2>
                  <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => navigateMonth("next")}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-muted-foreground">
                    <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div><div>Dom</div>
                  </div>
                  <div className="grid grid-cols-7 gap-2 mt-4">
                    {days.map((dayObj, idx) => {
                      const isSelected = selectedDate === dayObj.day && dayObj.isCurrentMonth;
                      return (
                        <button
                          key={idx}
                          onClick={() => dayObj.isCurrentMonth && setSelectedDate(dayObj.day)}
                          className={`
                            aspect-square flex items-center justify-center text-sm rounded-lg transition-all
                            ${!dayObj.isCurrentMonth ? "text-muted-foreground/50 cursor-default" : "hover:bg-muted cursor-pointer"} 
                            ${dayObj.isToday ? "bg-primary text-primary-foreground font-semibold" : ""}
                            ${isSelected && !dayObj.isToday ? "bg-muted border-2 border-primary" : ""}
                            ${dayObj.hasAppointments && dayObj.isCurrentMonth ? "bg-[#800020] text-white font-medium" : ""} 
                          `}
                          disabled={!dayObj.isCurrentMonth} // Deshabilitar días fuera del mes
                        >
                          {dayObj.day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-2 space-y-8">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif text-xl flex items-center">
                  <Calendar className="mr-2 h-5 w-5" /> Citas del Día {selectedDate}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Cargando pacientes...</p>
                  </div>
                ) : todaysAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {todaysAppointments.map((appointment, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{appointment.time}</span>
                            </div>
                            <div>
                              <button
                                onClick={() => handleNavigateToPatient(appointment)}
                                className="font-medium text-foreground hover:text-primary underline-offset-4 hover:underline text-left"
                              >
                                {appointment.patient}
                              </button>
                              <p className="text-sm text-muted-foreground">{appointment.type}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartSession(appointment.patient, appointment.patientUuid)}
                          >
                            Iniciar Sesión
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium text-foreground mb-2">No hay citas para este día</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {realPatients.length === 0 ? "Primero necesitas crear pacientes" : "Selecciona otra fecha en el calendario"}
                    </p>
                    {realPatients.length === 0 && (
                       // CAMBIO: Usar router.push
                      <Button variant="outline" onClick={() => router.push("/patient-list")}>Ir a Pacientes</Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
               {/* CAMBIO: Usar router.push */}
              <Button className="mt-2" onClick={() => router.push("/new-patient")}>Nueva Cita</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}