"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import NeumorphicCalendar from "./NeumorphicCalendar";
import { Badge } from "./ui/badge";
import { CalendarIcon, Plus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  patient_id: string;
  patients?: { name: string };
}

const CalendarModule = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentDates, setAppointmentDates] = useState<Date[]>([]);
  // const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({ id: user.id });
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.id) {
        // setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("appointments")
          .select("id, appointment_date, appointment_time, patient_id, patients(name)")
          .eq("user_id", user.id)
          .order("appointment_date", { ascending: true });

        if (error) {
          console.error("Error fetching appointments:", error);
          // setLoading(false);
          return;
        }

        // Group appointments by date
        const dateMap = new Map<string, Appointment[]>();
        const uniqueDates: Date[] = [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data as unknown as any[])?.forEach((apt: any) => {
          const date = new Date(apt.appointment_date);
          const dateStr = date.toDateString();
          
          if (!dateMap.has(dateStr)) {
            dateMap.set(dateStr, []);
            uniqueDates.push(date);
          }
          dateMap.get(dateStr)?.push(apt);
        });

        setAppointmentDates(uniqueDates);
        
        // Set appointments for selected date
        if (selectedDate) {
          const selectedDateStr = selectedDate.toDateString();
          setAppointments(dateMap.get(selectedDateStr) || []);
        }
      } catch (error) {
        console.error("Error in fetchAppointments:", error);
      } finally {
        // setLoading(false);
      }
    };

    fetchAppointments();
  }, [user?.id, selectedDate]);

  // Update appointments when selected date changes
  useEffect(() => {
    if (!selectedDate || !user?.id) return;

    const supabase = createClient();
    const fetchSelectedDateAppointments = async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, appointment_date, appointment_time, patient_id, patients(name)")
        .eq("user_id", user.id)
        .eq("appointment_date", format(selectedDate, "yyyy-MM-dd"));

      if (!error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAppointments((data as any) || []);
      }
    };

    fetchSelectedDateAppointments();
  }, [selectedDate, user?.id]);



  return (
    <Card className="border-module-border bg-module-background hover:shadow-md transition-calm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="module-title flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Calendario
          </CardTitle>
          <Link href={`/new-patient?date=${selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}`}>
            <Button size="sm" variant="outline">
              <Plus className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Calendar Widget */}
        <div className="calendar-container">
        <div className="calendar-container">
          <NeumorphicCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            events={appointmentDates.map((date, i) => ({
                id: `date-${i}`,
                title: 'Citas',
                date: date,
                color: 1
            }))}
            onAddEvent={() => {
                // Determine date to link
                const linkDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
                window.location.href = `/new-patient?date=${linkDate}`;
            }}
          />
        </div>
        </div>

        {/* Selected Date Info */}
        {selectedDate && (
          <div className="pt-3 border-t border-module-border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-foreground text-sm">
                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
              </h4>
              {appointments.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {appointments.length} cita{appointments.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            
            {appointments.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {appointments.map((appointment) => (
                  <Link 
                    key={appointment.id}
                    href={`/patient-detailed-profile/${appointment.patient_id}`}
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/20 cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-foreground">
                            {appointment.appointment_time}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {appointment.patients?.name || 'Paciente'}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs bg-primary/10">
                        Cita
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-3">
                  No hay citas programadas
                </p>
                <Link href={`/new-patient?date=${format(selectedDate, 'yyyy-MM-dd')}`}>
                  <Button size="sm" variant="outline" className="text-xs">
                    <Plus className="mr-1 h-3 w-3" />
                    Agendar cita
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarModule;