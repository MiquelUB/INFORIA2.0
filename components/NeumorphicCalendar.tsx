"use client";

import React, { useState, useEffect } from 'react';
import styles from './NeumorphicCalendar.module.css';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  color?: 1 | 2 | 3 | 4; // correspond to .eventType1, .eventType2, etc.
}

interface NeumorphicCalendarProps {
  className?: string;
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  events?: CalendarEvent[];
  onAddEvent?: () => void;
  viewDate?: Date;
  onViewDateChange?: (date: Date) => void;
}

const NeumorphicCalendar: React.FC<NeumorphicCalendarProps> = ({
  className,
  selectedDate: initialSelectedDate,
  onDateSelect,
  events = [],
  onAddEvent,
  viewDate,
  onViewDateChange
}) => {
  const [internalDate, setInternalDate] = useState(new Date());
  
  // Use viewDate from props if available, otherwise internal state
  const currentDate = viewDate || internalDate;
  
  // Update internal logic to call onViewDateChange
  const setCurrentDate = (date: Date) => {
    if (onViewDateChange) {
      onViewDateChange(date);
    } else {
      setInternalDate(date);
    }
  };

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialSelectedDate);

  useEffect(() => {
    if (initialSelectedDate) {
      setSelectedDate(initialSelectedDate);
      if (!viewDate) { // Only update view if not controlled
        setCurrentDate(initialSelectedDate);
      }
    }
  }, [initialSelectedDate]);

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const weekDays = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDayClick = (day: number, isCurrentMonth: boolean = true) => {
    if (!isCurrentMonth) return;
    
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
    if (onDateSelect) {
      onDateSelect(newDate);
    }
  };

  const renderDays = () => {
    const days = [];
    
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    
    // Adjust for Monday start (0 = Sunday in JS, but we want 0 = Monday)
    // JS: Sun=0, Mon=1, ..., Sat=6
    // Goal: Mon=0, ..., Sun=6
    let startingDay = firstDayOfMonth.getDay() - 1;
    if (startingDay === -1) startingDay = 6; // Sunday becomes 6

    // Previous month filler
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push(
        <div key={`prev-${i}`} className={cn(styles.day, styles.dayInactive)}>
          <div className={styles.dayNumber}>{prevMonthLastDay - i}</div>
        </div>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();

      // Find events for this day
      const dayEvents = events.filter(event => 
        event.date.getDate() === day &&
        event.date.getMonth() === currentMonth &&
        event.date.getFullYear() === currentYear
      );

      days.push(
        <div 
          key={`curr-${day}`} 
          className={cn(
            styles.day, 
            isToday && styles.dayToday,
            isSelected && styles.daySelected,
            dayEvents.length > 0 && styles.dayHasAppointments // Nueva clase Burdeos
          )}
          onClick={() => handleDayClick(day)}
        >
          <div className={styles.dayNumber}>{day}</div>
          
          {/* 
            Update: Eliminadas las franjas individuales. 
            Ahora, si hay citas, la celda entera cambia de color (Burdeos Suave).
            Opcional: Mostramos un pequeño indicador de cantidad si hiciera falta, 
            pero la petición fue "sustituye por todo el día cambia de color".
          */}
        </div>
      );
    }

    // Next month filler
    // Calculate how many days we need to add to finish the current week row
    const filledCells = days.length;
    const remainingCells = (7 - (filledCells % 7)) % 7;
    
    for (let i = 1; i <= remainingCells; i++) {
        days.push(
            <div key={`next-${i}`} className={cn(styles.day, styles.dayInactive)}>
                <div className={styles.dayNumber}>{i}</div>
            </div>
        );
    }

    return days;
  };

  return (
    <div className={cn(styles.container, className)}>
      <div className={styles.monthSelector}>
        <div className={styles.monthYear}>
            <button onClick={handlePrevMonth} className={styles.navButton}>
                <ChevronLeft size={20} />
            </button>
            <span className={cn(styles.month, "font-serif")}>{monthNames[currentMonth]}</span>
            <span className={cn(styles.year, "font-serif")}>{currentYear}</span>
            <button onClick={handleNextMonth} className={styles.navButton}>
                <ChevronRight size={20} />
            </button>
        </div>
        
        {onAddEvent && (
          <button className={styles.addEventBtn} onClick={onAddEvent}>
            <i>&#10010;</i> Cita
          </button>
        )}
      </div>

      <div className={styles.weekdays}>
        {weekDays.map((day) => (
          <div key={day} className={styles.weekday}>{day}</div>
        ))}
      </div>

      <div className={styles.calendarGrid}>
        {renderDays()}
      </div>
    </div>
  );
};

export default NeumorphicCalendar;
