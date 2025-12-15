'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NeumorphicCalendar from "@/components/NeumorphicCalendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X, Save, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useToast } from '@/components/ui/use-toast';
import { createClient } from "@/lib/supabase/client";
import { appointmentService } from "@/lib/services/appointmentService";
import { googleDriveService } from "@/lib/services/googleDrive";
import { googleSheetsPatientCRM } from "@/lib/services/googleSheetsPatientCRM";
import { createPatientAction } from "./actions";
import { User } from "@supabase/supabase-js";

// Generate an array with all hours of the day in 30-minute intervals
// (e.g., ["00:00", "00:30", "01:00", ..., "23:30"])
const allTimeSlots = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = (i % 2) * 30;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
});

interface PatientData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: Date | undefined;
  appointmentDate: Date | undefined;
  appointmentTime: string;
  gender: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  emergencyEmail: string; // New field
  profession: string;
  referredBy: string;
  tags: string[];
  notes: string;
}

export default function NewPatientClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [supabase] = useState(() => createClient());
  // -- OPTIMIZACIÓN: Eliminada la verificación bloqueante de getUser() --
  // El middleware ya protege la ruta.
  // const [user, setUser] = useState<User | null>(null);
  
  const [patientData, setPatientData] = useState<PatientData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: undefined,
    appointmentDate: undefined,
    appointmentTime: "",
    gender: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    emergencyEmail: "", // New field
    profession: "",
    referredBy: "",
    tags: [],
    notes: ""
  });

  const [newTag, setNewTag] = useState("");
  const [birthDateInput, setBirthDateInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [authLoading, setAuthLoading] = useState(true); // ELIMINADO
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // useEffect(() => { ... } ELIMINADO

  // Sincronizar birthDateInput cuando cambia patientData.birthDate
  useEffect(() => {
    if (patientData.birthDate && !birthDateInput) {
      setBirthDateInput(format(patientData.birthDate, "dd/MM/yyyy"));
    }
  }, [patientData.birthDate, birthDateInput]);

  // Fetch occupied slots when appointment date changes
  useEffect(() => {
    if (!patientData.appointmentDate) {
      setOccupiedSlots([]);
      return;
    }

    const fetchOccupiedSlots = async () => {
      setIsLoadingSlots(true);
      try {
        const formattedDate = format(patientData.appointmentDate!, 'yyyy-MM-dd');
        const response = await fetch(`/api/get-occupied-slots?date=${formattedDate}`);
        if (!response.ok) {
          throw new Error('No se pudieron cargar las horas');
        }
        const slots: string[] = await response.json();
        setOccupiedSlots(slots);
      } catch (error) {
        console.error("Error fetching occupied slots:", error);
        toast({
          title: "Error",
          description: "No se pudieron verificar las horas ocupadas.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchOccupiedSlots();
  }, [patientData.appointmentDate, toast]);

  // Validaciones
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string): boolean => {
    // Acepta formatos: +34 612 345 678, 612345678, +34612345678
    const phoneRegex = /^(\+\d{1,3}[-.\s]?)?\d{6,14}$/;
    return phoneRegex.test(phone.replace(/[\s\-\.]/g, ''));
  };

  const handleInputChange = (field: keyof PatientData, value: string) => {
    setPatientData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !patientData.tags.includes(newTag.trim())) {
      setPatientData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPatientData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSavePatient = async (redirectTo: 'patient-list' | 'session-workspace') => {
    console.log('🔘 [NewPatient] handleSavePatient clicked. Redirect to:', redirectTo);
    console.log('📝 [NewPatient] Form Validity:', isFormValid, 'Submitting:', isSubmitting);
    
    // Validaciones del lado del cliente
    if (!isFormValid) {
      toast({
        title: "Faltan datos",
        description: "Por favor completa todos los campos obligatorios marcados con *",
        variant: "destructive"
      });
      return;
    }
    if (!isValidEmail(patientData.email)) {
      toast({ title: "Email inválido", variant: "destructive" });
      return;
    }
    if (!isValidPhone(patientData.phone)) {
      toast({ title: "Teléfono inválido", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw new Error(sessionError.message);
      
      const googleToken = session?.provider_token;
      if (!googleToken) {
        throw new Error("No se encontró el token de Google. Reinicia sesión.");
      }

      const result = await createPatientAction(googleToken, patientData, redirectTo);

      if (result.success) {
        toast({
          title: "Éxito",
          description: "Paciente creado correctamente. Redirigiendo..."
        });

        if (redirectTo === 'session-workspace' && result.patientId) {
          router.push(`/session/${result.patientId}`);
        } else {
          router.push('/patient-list');
        }
        // NO desactivamos isSubmitting aquí para mantener el spinner durante la redirección
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      console.error('Error creating patient:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
      setIsSubmitting(false); // Solo restauramos el botón si falló
    }
  };

  // Validación más robusta del formulario
  const isFormValid = !!(
    patientData.firstName && 
    patientData.lastName && 
    patientData.email && 
    patientData.phone && 
    patientData.gender && 
    patientData.birthDate
  );

  // if (authLoading) ... BLOQUE ELIMINADO para carga instantánea

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-semibold text-foreground mb-2">
            Alta de Nuevo Paciente
          </h1>
          <p className="text-muted-foreground font-sans">
            Crea una nueva ficha de paciente con toda la información necesaria para comenzar el tratamiento
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Information */}
            <Card className="card-neumorphic border-0">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Información Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="font-sans">Nombre *</Label>
                    <Input
                      id="firstName"
                      value={patientData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Nombre del paciente"
                      className="font-sans"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="font-sans">Apellidos *</Label>
                    <Input
                      id="lastName"
                      value={patientData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Apellidos del paciente"
                      className="font-sans"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-sans">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={patientData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="email@ejemplo.com"
                      className="font-sans"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-sans">Teléfono *</Label>
                    <Input
                      id="phone"
                      value={patientData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+34 612 345 678"
                      className="font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="font-sans">Fecha de Nacimiento *</Label>
                    <Input
                      id="birthDate"
                      type="text"
                      placeholder="DD/MM/AAAA"
                      value={birthDateInput}
                      onChange={(e) => {
                        let value = e.target.value;
                        
                        // Permitir solo dígitos y barras
                        value = value.replace(/[^\d/]/g, '');
                        
                        // Auto-insertar barras inteligentemente
                        if (value.length === 2 && !value.includes('/')) {
                          value = value + '/';
                        } else if (value.length === 5 && (value.match(/\//g) || []).length === 1) {
                          value = value + '/';
                        }
                        
                        // Limitar a 10 caracteres (DD/MM/YYYY)
                        if (value.length > 10) {
                          value = value.slice(0, 10);
                        }
                        
                        // Actualizar input
                        setBirthDateInput(value);
                        
                        // Si está vacío, limpiar fecha
                        if (value === "") {
                          setPatientData(prev => ({ ...prev, birthDate: undefined }));
                          return;
                        }
                        
                        // Si es una fecha completa y válida, actualizar state
                        const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
                        const match = value.match(dateRegex);
                        
                        if (match) {
                          const day = parseInt(match[1], 10);
                          const month = parseInt(match[2], 10);
                          const year = parseInt(match[3], 10);
                          
                          // Validar rangos básicos
                          if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
                            const date = new Date(year, month - 1, day);
                            // Verificar que la fecha es válida (ej: no 31 de febrero)
                            if (date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year) {
                              setPatientData(prev => ({ ...prev, birthDate: date }));
                            }
                          }
                        }
                      }}
                      className="font-sans"
                      maxLength={10}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-sans">Género *</Label>
                    <Select onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger className="font-sans">
                        <SelectValue placeholder="Selecciona género" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="femenino">Femenino</SelectItem>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="no-binario">No binario</SelectItem>
                        <SelectItem value="prefiero-no-decir">Prefiero no decir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="font-sans">Dirección</Label>
                  <Input
                    id="address"
                    value={patientData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Dirección completa"
                    className="font-sans"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profession" className="font-sans">Profesión</Label>
                  <Input
                    id="profession"
                    value={patientData.profession}
                    onChange={(e) => handleInputChange("profession", e.target.value)}
                    placeholder="Profesión del paciente"
                    className="font-sans"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Appointment Information */}
            <Card className="card-neumorphic border-0">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Información de Cita</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-sans">Fecha de Cita</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-sans",
                            !patientData.appointmentDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {patientData.appointmentDate ? (
                            format(patientData.appointmentDate, "d 'de' MMMM 'de' yyyy", { locale: es })
                          ) : (
                            <span>Selecciona fecha de cita</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <NeumorphicCalendar
                          selectedDate={patientData.appointmentDate}
                          onDateSelect={(date) => setPatientData(prev => ({ ...prev, appointmentDate: date }))}
                          className="w-full"
                          compact={true} 
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="appointmentTime" className="font-sans">Hora de Cita</Label>
                    <Select 
                      onValueChange={(value) => handleInputChange("appointmentTime", value)}
                      disabled={!patientData.appointmentDate}
                    >
                      <SelectTrigger className="font-sans">
                        <SelectValue placeholder={!patientData.appointmentDate ? "Selecciona una fecha primero" : (isLoadingSlots ? "Cargando horas..." : "Selecciona hora")} />
                      </SelectTrigger>
                      <SelectContent>
                        {allTimeSlots.map(time => {
                          const isOccupied = occupiedSlots.includes(time);
                          return (
                            <SelectItem 
                              key={time} 
                              value={time} 
                              disabled={isOccupied}
                              className={isOccupied ? "text-muted-foreground line-through" : ""}
                            >
                              {time} {isOccupied && "(Ocupada)"}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="card-neumorphic border-0">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Contacto de Emergencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact" className="font-sans">Nombre del Contacto</Label>
                    <Input
                      id="emergencyContact"
                      value={patientData.emergencyContact}
                      onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                      placeholder="Nombre completo"
                      className="font-sans"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone" className="font-sans">Teléfono de Emergencia</Label>
                    <Input
                      id="emergencyPhone"
                      value={patientData.emergencyPhone}
                      onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                      placeholder="+34 612 345 678"
                      className="font-sans"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyEmail" className="font-sans">Email de Emergencia</Label>
                    <Input
                      id="emergencyEmail"
                      value={patientData.emergencyEmail}
                      onChange={(e) => handleInputChange("emergencyEmail", e.target.value)}
                      placeholder="email@ejemplo.com"
                      className="font-sans"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="card-neumorphic border-0">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Información Adicional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="referredBy" className="font-sans">Derivado por</Label>
                  <Input
                    id="referredBy"
                    value={patientData.referredBy}
                    onChange={(e) => handleInputChange("referredBy", e.target.value)}
                    placeholder="Médico, otro profesional, autoreferencia..."
                    className="font-sans"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-sans">Etiquetas</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {patientData.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="font-sans">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Nueva etiqueta..."
                      className="font-sans"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="btn-add-tag"
                    >
                      <div className="button">
                        <Plus className="h-5 w-5" />
                      </div>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="font-sans">Notas Iniciales</Label>
                  <Textarea
                    id="notes"
                    value={patientData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Observaciones iniciales, motivo de consulta..."
                    className="font-sans min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="card-neumorphic border-0">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Show warning if form is not valid and not submitting */}
                {!isFormValid && !isSubmitting && (
                  <p className="text-sm font-medium text-destructive text-center mb-2">
                    Faltan campos obligatorios (*)
                  </p>
                )}
                
                <button
                  type="button"
                  onClick={() => handleSavePatient('session-workspace')}
                  disabled={isSubmitting}
                  className={`btn-neumorphic flex items-center justify-center ${!isFormValid ? 'opacity-70' : ''}`}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  {isSubmitting ? "Guardando..." : "Guardar y Crear 1er Informe"}
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSavePatient('patient-list')}
                  disabled={isSubmitting}
                  className={`btn-neumorphic flex items-center justify-center ${!isFormValid ? 'opacity-70' : ''}`}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isSubmitting ? "Guardando..." : "Solo Guardar Ficha"}
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
