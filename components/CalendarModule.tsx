import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Badge } from "./ui/badge";
import { CalendarIcon, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const CalendarModule = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Mock data for appointments on specific dates
  const appointmentDates = [
    new Date(2025, 7, 22), // August 22, 2025
    new Date(2025, 7, 24), // August 24, 2025
    new Date(2025, 7, 26), // August 26, 2025
    new Date(2025, 7, 28), // August 28, 2025
  ];

  const hasAppointments = (date: Date) => {
    return appointmentDates.some(appointmentDate => 
      appointmentDate.toDateString() === date.toDateString()
    );
  };

  const getAppointmentsForDate = (date: Date) => {
    if (!hasAppointments(date)) return [];
    
    // Mock appointments for the selected date
    return [
      { id: 1, time: "09:30", patient: "María González", type: "Primera Visita" },
      { id: 2, time: "14:00", patient: "Carlos Ruiz", type: "Seguimiento" }
    ];
  };

  const appointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  return (
    <Card className="border-module-border bg-module-background hover:shadow-md transition-calm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="module-title flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Calendario
          </CardTitle>
          <Link to={`/new-patient?date=${selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}`}>
            <Button size="sm" variant="outline">
              <Plus className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Calendar Widget */}
        <div className="calendar-container">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={es}
            className="rounded-md border-0 p-0"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "text-center text-xs p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
            }}
            modifiers={{
              hasAppointments: appointmentDates
            }}
            modifiersClassNames={{
              hasAppointments: "relative after:absolute after:bottom-0 after:left-1/2 after:transform after:-translate-x-1/2 after:w-1 after:h-1 after:bg-burgundy after:rounded-full"
            }}
            components={{
              IconLeft: () => <ChevronLeft className="h-4 w-4" />,
              IconRight: () => <ChevronRight className="h-4 w-4" />,
            }}
          />
        </div>

        {/* Selected Date Info */}
        {selectedDate && (
          <div className="pt-3 border-t border-module-border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-foreground text-sm">
                {format(selectedDate, "d 'de' MMMM", { locale: es })}
              </h4>
              {appointments.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {appointments.length} cita{appointments.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            
            {appointments.length > 0 ? (
              <div className="space-y-2">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-calm text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-foreground">
                        {appointment.time}
                      </span>
                      <span className="text-muted-foreground">
                        {appointment.patient}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {appointment.type}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">
                  No hay citas programadas
                </p>
                <Link to={`/new-patient?date=${format(selectedDate, 'yyyy-MM-dd')}`}>
                  <Button size="sm" variant="outline" className="mt-2 text-xs">
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