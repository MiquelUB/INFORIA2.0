'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardHeader from "@/components/DashboardHeader";
import { ArrowLeft, Edit, Plus, FileText, Calendar, Trash2, User, Tag, FileSignature, CreditCard, FileCheck, X, Loader2, Mail, Phone, MapPin, UserCheck, AlertTriangle, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation"; // ✅ Next.js App Router
import { usePatient, useUpdatePatient, useDeletePatient } from "@/lib/hooks/usePatients";
import { useToast } from "@/lib/hooks/use-toast"; // ✅ RUTA DE IMPORTACIÓN CORREGIDA

// Define la interfaz de props para capturar el parámetro dinámico
interface PageProps {
  params: {
    id: string; // ✅ Captura el ID de la ruta [id]
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export default function PatientDetailedProfile({ params, searchParams }: PageProps) {
  const router = useRouter();
  const { toast } = useToast();

  // ✅ CORRECCIÓN 1: Obtener patientId directamente de params (App Router)
  const patientId = params.id;
  
  const { data: patient, isLoading: patientLoading } = usePatient(patientId || '');
  const updatePatientMutation = useUpdatePatient();
  const deletePatientMutation = useDeletePatient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPayments, setIsEditingPayments] = useState(false);
  
  // TODOS LOS CAMPOS DEL PACIENTE - INCLUIDOS ADICIONALES
  const [patientData, setPatientData] = useState({
    name: "",
    phone: "",
    email: "",
    birth_date: "",
    sexo: "",
    direccion_fisica: "",
    persona_rescate_nombre: "",
    persona_rescate_telefono: "",
    persona_rescate_email: "",
    notes: "",
    tags: [] as string[]
  });

  // Estados para pagos mock - EDITABLE (Lógica extensa preservada)
  const [paymentData, setPaymentData] = useState([
    { id: 1, date: '2025-01-15', amount: '85.00', status: 'Pagado', method: 'Tarjeta', concept: 'Sesión individual' },
    { id: 2, date: '2025-02-15', amount: '85.00', status: 'Pendiente', method: 'Transferencia', concept: 'Sesión individual' }
  ]);

  // Mock data para informes con enlaces Drive VÁLIDOS (Lógica extensa preservada)
  const mockReports = [
    {
      id: 1,
      title: "Informe Inicial - Evaluación Psicológica",
      date: "2025-01-10",
      type: "Evaluación",
      status: "Completado",
      driveUrl: "https://docs.google.com/document/d/1abc123/edit"
    },
    {
      id: 2,
      title: "Seguimiento Sesión 5",
      date: "2025-02-05",
      type: "Seguimiento", 
      status: "Completado",
      driveUrl: "https://docs.google.com/document/d/1def456/edit"
    },
    {
      id: 3,
      title: "Informe de Progreso Mensual",
      date: "2025-02-28",
      type: "Progreso",
      status: "Borrador",
      driveUrl: "https://docs.google.com/document/d/1ghi789/edit"
    },
    {
      id: 4,
      title: "Evaluación Neuropsicológica Completa",
      date: "2025-01-20",
      type: "Evaluación",
      status: "Completado",
      driveUrl: "https://docs.google.com/document/d/1jkl012/edit"
    },
    {
      id: 5,
      title: "Seguimiento Sesión 10",
      date: "2025-02-10",
      type: "Seguimiento",
      status: "Completado",
      driveUrl: "https://docs.google.com/document/d/1mno345/edit"
    },
    {
      id: 6,
      title: "Informe Familiar - Entorno de Apoyo",
      date: "2025-02-15",
      type: "Familiar",
      status: "Completado",
      driveUrl: "https://docs.google.com/document/d/1pqr678/edit"
    },
    {
      id: 7,
      title: "Seguimiento Sesión 15",
      date: "2025-02-20",
      type: "Seguimiento",
      status: "Completado",
      driveUrl: "https://docs.google.com/document/d/1stu901/edit"
    },
    {
      id: 8,
      title: "Evaluación de Riesgo",
      date: "2025-02-25",
      type: "Evaluación",
      status: "Borrador",
      driveUrl: "https://docs.google.com/document/d/1vwx234/edit"
    },
    {
      id: 9,
      title: "Plan de Tratamiento Trimestral",
      date: "2025-03-01",
      type: "Plan",
      status: "Borrador",
      driveUrl: "https://docs.google.com/document/d/1yz567/edit"
    },
    {
      id: 10,
      title: "Seguimiento Sesión 20",
      date: "2025-03-05",
      type: "Seguimiento",
      status: "Completado",
      driveUrl: "https://docs.google.com/document/d/1abc890/edit"
    }
  ];

  // Sincronizar datos del paciente
  useEffect(() => {
    if (patient) {
      setPatientData({
        name: patient.name || "",
        phone: patient.phone || "",
        email: patient.email || "",
        birth_date: patient.birth_date || "",
        sexo: (patient as any).sexo || "",
        direccion_fisica: (patient as any).direccion_fisica || "",
        persona_rescate_nombre: (patient as any).persona_rescate_nombre || "",
        persona_rescate_telefono: (patient as any).persona_rescate_telefono || "",
        persona_rescate_email: (patient as any).persona_rescate_email || "",
        notes: patient.notes || "",
        tags: (patient as any).tags || []
      });
    }
  }, [patient]);

  const handleSaveChanges = async () => {
    try {
      const updateData = {
        name: patientData.name,
        phone: patientData.phone,
        email: patientData.email,
        birth_date: patientData.birth_date,
        notes: patientData.notes,
        sexo: patientData.sexo,
        direccion_fisica: patientData.direccion_fisica,
        persona_rescate_nombre: patientData.persona_rescate_nombre,
        persona_rescate_telefono: patientData.persona_rescate_telefono,
        persona_rescate_email: patientData.persona_rescate_email,
        tags: patientData.tags
      };
      
      await updatePatientMutation.mutateAsync({
        id: patientId!,
        updates: updateData
      });
      setIsEditing(false);
      toast({
        title: "Datos actualizados",
        description: "Los datos del paciente se han guardado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    if (patient) {
      setPatientData({
        name: patient.name || "",
        phone: patient.phone || "",
        email: patient.email || "",
        birth_date: patient.birth_date || "",
        sexo: (patient as any).sexo || "",
        direccion_fisica: (patient as any).direccion_fisica || "",
        persona_rescate_nombre: (patient as any).persona_rescate_nombre || "",
        persona_rescate_telefono: (patient as any).persona_rescate_telefono || "",
        persona_rescate_email: (patient as any).persona_rescate_email || "",
        notes: patient.notes || "",
        tags: (patient as any).tags || []
      });
    }
    setIsEditing(false);
  };

  const handleDeletePatient = async () => {
    try {
      await deletePatientMutation.mutateAsync(patientId!);
      router.push('/patients'); 
      toast({
        title: "Paciente eliminado",
        description: "El paciente ha sido eliminado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el paciente.",
        variant: "destructive"
      });
    }
  };

  const handleAddTag = () => {
    const newTagName = prompt("Escribe la nueva etiqueta:");
    if (newTagName && newTagName.trim() && !patientData.tags.includes(newTagName.trim())) {
      setPatientData({
        ...patientData,
        tags: [...patientData.tags, newTagName.trim()]
      });
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setPatientData({
      ...patientData,
      tags: patientData.tags.filter((_, index) => index !== indexToRemove)
    });
  };

  const handleAddPayment = () => {
    const newPayment = {
      id: paymentData.length + 1,
      date: new Date().toISOString().split('T')[0],
      amount: '0.00',
      status: 'Pendiente',
      method: 'Transferencia',
      concept: 'Sesión individual'
    };
    setPaymentData([...paymentData, newPayment]);
  };

  const handlePaymentChange = (index: number, field: string, value: string) => {
    const updatedPayments = paymentData.map((payment, i) => 
      i === index ? { ...payment, [field]: value } : payment
    );
    setPaymentData(updatedPayments);
  };

  const handleRemovePayment = (index: number) => {
    setPaymentData(paymentData.filter((_, i) => i !== index));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'No especificada';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} años`;
  };

  if (patientLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Cargando perfil del paciente...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!patient && patientId) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Paciente no encontrado</h3>
            <p className="text-muted-foreground mb-6">El paciente solicitado no existe o ha sido eliminado.</p>
            <Button onClick={() => router.push('/patients')} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la lista de pacientes
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="font-serif text-2xl font-medium text-foreground">
                {patient?.name || 'Paciente'}
              </h1>
              <span className="text-muted-foreground">|</span>
              <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                <Calendar className="h-4 w-4" />
                <span>Alta: {patient?.created_at ? formatDate(patient.created_at) : 'No disponible'}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => router.push(`/session-workspace/${patientId}`)}>
                <FileText className="mr-2 h-4 w-4" />
                Iniciar Sesión
              </Button>
              <Button>
                <FileSignature className="mr-2 h-4 w-4" />
                Alta Dossier
              </Button>
            </div>
          </div>
        </div>
      </div>
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-xl flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Datos del Paciente
                  </CardTitle>
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar Datos
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Button size="sm" onClick={handleSaveChanges}>
                        <FileCheck className="mr-2 h-4 w-4" />
                        Guardar
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                        <X className="mr-2 h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-foreground flex items-center">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Información Personal
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground block mb-2">
                        Nombre Completo
                      </label>
                      {isEditing ? (
                        <Input
                          value={patientData.name}
                          onChange={(e) => setPatientData({...patientData, name: e.target.value})}
                          placeholder="Nombre completo del paciente"
                        />
                      ) : (
                        <p className="text-foreground">{patientData.name || 'No especificado'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground block mb-2">
                        Sexo
                      </label>
                      {isEditing ? (
                        <Select value={patientData.sexo} onValueChange={(value) => setPatientData({...patientData, sexo: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar sexo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Masculino">Masculino</SelectItem>
                            <SelectItem value="Femenino">Femenino</SelectItem>
                            <SelectItem value="No binario">No binario</SelectItem>
                            <SelectItem value="Prefiero no decir">Prefiero no decir</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-foreground">{patientData.sexo || 'No especificado'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground block mb-2">
                        Fecha de Nacimiento
                      </label>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={patientData.birth_date}
                          onChange={(e) => setPatientData({...patientData, birth_date: e.target.value})}
                        />
                      ) : (
                        <p className="text-foreground">
                          {patientData.birth_date ? `${formatDate(patientData.birth_date)} (${calculateAge(patientData.birth_date)})` : 'No especificada'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground block mb-2">
                        <Phone className="inline mr-1 h-3 w-3" />
                        Teléfono
                      </label>
                      {isEditing ? (
                        <Input
                          value={patientData.phone}
                          onChange={(e) => setPatientData({...patientData, phone: e.target.value})}
                          placeholder="+34 000 000 000"
                        />
                      ) : (
                        <p className="text-foreground">{patientData.phone || 'No especificado'}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground block mb-2">
                        <Mail className="inline mr-1 h-3 w-3" />
                        Email
                      </label>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={patientData.email}
                          onChange={(e) => setPatientData({...patientData, email: e.target.value})}
                          placeholder="email@ejemplo.com"
                        />
                      ) : (
                        <p className="text-foreground">{patientData.email || 'No especificado'}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground block mb-2">
                        <MapPin className="inline mr-1 h-3 w-3" />
                        Dirección Física
                      </label>
                      {isEditing ? (
                        <Textarea
                          value={patientData.direccion_fisica}
                          onChange={(e) => setPatientData({...patientData, direccion_fisica: e.target.value})}
                          placeholder="Dirección completa del paciente"
                          rows={2}
                        />
                      ) : (
                        <p className="text-foreground">{patientData.direccion_fisica || 'No especificada'}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4 border-t pt-6">
                  <h3 className="font-medium text-foreground flex items-center">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Persona Responsable / Emergencia
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground block mb-2">
                        Nombre Completo
                      </label>
                      {isEditing ? (
                        <Input
                          value={patientData.persona_rescate_nombre}
                          onChange={(e) => setPatientData({...patientData, persona_rescate_nombre: e.target.value})}
                          placeholder="Nombre de la persona responsable"
                        />
                      ) : (
                        <p className="text-foreground">{patientData.persona_rescate_nombre || 'No especificado'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground block mb-2">
                        <Phone className="inline mr-1 h-3 w-3" />
                        Teléfono
                      </label>
                      {isEditing ? (
                        <Input
                          value={patientData.persona_rescate_telefono}
                          onChange={(e) => setPatientData({...patientData, persona_rescate_telefono: e.target.value})}
                          placeholder="+34 000 000 000"
                        />
                      ) : (
                        <p className="text-foreground">{patientData.persona_rescate_telefono || 'No especificado'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground block mb-2">
                        <Mail className="inline mr-1 h-3 w-3" />
                        Email
                      </label>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={patientData.persona_rescate_email}
                          onChange={(e) => setPatientData({...patientData, persona_rescate_email: e.target.value})}
                          placeholder="email@ejemplo.com"
                        />
                      ) : (
                        <p className="text-foreground">{patientData.persona_rescate_email || 'No especificado'}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4 border-t pt-6">
                  <h3 className="font-medium text-foreground">Notas Clínicas</h3>
                  {isEditing ? (
                    <Textarea
                      value={patientData.notes}
                      onChange={(e) => setPatientData({...patientData, notes: e.target.value})}
                      placeholder="Notas importantes sobre el paciente..."
                      rows={4}
                    />
                  ) : (
                    <p className="text-foreground text-sm leading-relaxed bg-muted/30 p-4 rounded-lg">
                      {patientData.notes || 'Sin notas registradas'}
                    </p>
                  )}
                </div>
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground flex items-center">
                      <Tag className="mr-2 h-4 w-4" />
                      Etiquetas
                    </h3>
                    {isEditing && (
                      <Button variant="outline" size="sm" onClick={handleAddTag}>
                        <Plus className="mr-2 h-4 w-4" />
                        Añadir Etiqueta
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {patientData.tags.length > 0 ? (
                      patientData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          {isEditing && (
                            <button
                              onClick={() => handleRemoveTag(index)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">Sin etiquetas</p>
                    )}
                  </div>
                </div>
                {isEditing && (
                  <div className="space-y-4 border-t border-destructive/20 pt-6">
                    <div className="flex items-center space-x-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      <h3 className="font-medium">Zona de Peligro</h3>
                    </div>
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Esta acción eliminará permanentemente todos los datos del paciente, incluyendo informes y historial. 
                        Esta acción no se puede deshacer.
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar Paciente
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center">
                              <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
                              ¿Eliminar paciente permanentemente?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará permanentemente a <strong>{patient?.name}</strong> y todos sus datos asociados, incluyendo:
                              <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Informes clínicos</li>
                                <li>Historial de pagos</li>
                                <li>Notas y etiquetas</li>
                                <li>Archivos adjuntos</li>
                              </ul>
                              <p className="mt-4 font-medium text-destructive">Esta acción no se puede deshacer.</p>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeletePatient} className="bg-destructive hover:bg-destructive/90">
                              Eliminar Definitivamente
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Actividad - Informes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-60 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                  {mockReports.length > 0 ? (
                    mockReports.map((report) => (
                      <div key={report.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground text-sm leading-tight">
                              {report.title}
                            </h4>
                            <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(report.date)}</span>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                {report.type}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={report.status === 'Completado' ? 'default' : 'secondary'} className="text-xs">
                              {report.status}
                            </Badge>
                            <a
                              href={report.driveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">Aún no hay informes registrados.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* CARD: Historial de Pagos - LÓGICA COMPLETA */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-lg flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Historial de Pagos
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditingPayments(!isEditingPayments)}
                  >
                    {isEditingPayments ? 'Terminar Edición' : 'Editar Pagos'}
                    {isEditingPayments ? <X className="ml-2 h-4 w-4" /> : <Edit className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentData.length === 0 && !isEditingPayments ? (
                  <p className="text-muted-foreground text-sm">No hay pagos registrados.</p>
                ) : (
                  <div className="space-y-3">
                    {paymentData.map((payment, index) => (
                      <div key={payment.id} className="border p-3 rounded-lg flex items-center justify-between">
                        {isEditingPayments ? (
                          <div className="grid grid-cols-5 gap-2 w-full items-center">
                            <Input
                              type="date"
                              value={payment.date}
                              onChange={(e) => handlePaymentChange(index, 'date', e.target.value)}
                              className="col-span-1"
                            />
                            <Input
                              type="number"
                              value={payment.amount}
                              onChange={(e) => handlePaymentChange(index, 'amount', e.target.value)}
                              className="col-span-1"
                            />
                            <Select value={payment.status} onValueChange={(value) => handlePaymentChange(index, 'status', value)}>
                              <SelectTrigger className="col-span-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pagado">Pagado</SelectItem>
                                <SelectItem value="Pendiente">Pendiente</SelectItem>
                                <SelectItem value="Cancelado">Cancelado</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              value={payment.concept}
                              onChange={(e) => handlePaymentChange(index, 'concept', e.target.value)}
                              className="col-span-2"
                            />
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              onClick={() => handleRemovePayment(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-between w-full items-center">
                            <div className="space-y-1">
                              <p className="font-semibold text-sm">
                                {payment.concept}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(payment.date)} • {payment.method}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={payment.status === 'Pagado' ? 'default' : 'secondary'} className="font-semibold">
                                {payment.amount} €
                              </Badge>
                              {/* ✅ CORRECCIÓN 3: Variantes de Badge válidas (default, secondary, destructive) */}
                              <Badge variant={payment.status === 'Pagado' ? 'default' : payment.status === 'Pendiente' ? 'secondary' : 'destructive'}>
                                {payment.status}
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {isEditingPayments && (
                      <Button 
                        variant="outline" 
                        className="w-full border-dashed mt-4"
                        onClick={handleAddPayment}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Añadir Nuevo Pago
                      </Button>
                    )}
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