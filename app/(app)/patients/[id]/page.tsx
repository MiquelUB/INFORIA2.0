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
import { ArrowLeft, Edit, Plus, FileText, Calendar, Trash2, User, Tag, FileSignature,CreditCard, FileCheck, X, Loader2, Mail, Phone, MapPin, UserCheck, AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { usePatient, useUpdatePatient, useDeletePatient } from "@/lib/hooks/usePatients";
import { useToast } from "@/lib/hooks/use-toast";

const PatientDetailedProfile = () => {
  const [searchParams] = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const patientId = searchParams.get('id');
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

  // Estados para pagos mock - EDITABLE
  const [paymentData, setPaymentData] = useState([
    { id: 1, date: '2025-01-15', amount: '85.00', status: 'Pagado', method: 'Tarjeta', concept: 'Sesión individual' },
    { id: 2, date: '2025-02-15', amount: '85.00', status: 'Pendiente', method: 'Transferencia', concept: 'Sesión individual' }
  ]);

  // Mock data para informes con enlaces Drive VÁLIDOS - MÁS INFORMES PARA TESTING
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

  // Sincronizar datos del paciente - TODOS LOS CAMPOS
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
      // Solo enviar campos que existen en el tipo base
      const updateData = {
        name: patientData.name,
        phone: patientData.phone,
        email: patientData.email,
        birth_date: patientData.birth_date,
        notes: patientData.notes
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
      navigate('/patient-list');
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
            <Button onClick={() => navigate('/patient-list')} className="mt-4">
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
              <Link href={`/session-workspace?patientId=${patientId}`}>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Iniciar Sesión
                </Button>
              </Link>
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
                              className="text-primary hover:text-primary/80 transition-colors"
                              title="Abrir informe en Google Drive"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">Sin informes registrados</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-lg flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Historial de Pagos
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {!isEditingPayments ? (
                      <Button variant="outline" size="sm" onClick={() => setIsEditingPayments(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={handleAddPayment}>
                          <Plus className="mr-2 h-4 w-4" />
                          Añadir
                        </Button>
                        <Button size="sm" onClick={() => setIsEditingPayments(false)}>
                          Guardar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {paymentData.length > 0 ? (
                  paymentData.map((payment, index) => (
                    <div key={payment.id} className="border rounded-lg p-4 space-y-3">
                      {isEditingPayments ? (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-muted-foreground">Fecha</label>
                              <Input
                                type="date"
                                value={payment.date}
                                onChange={(e) => handlePaymentChange(index, 'date', e.target.value)}
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Importe (€)</label>
                              <Input
                                value={payment.amount}
                                onChange={(e) => handlePaymentChange(index, 'amount', e.target.value)}
                                placeholder="0.00"
                                className="text-sm"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-muted-foreground">Estado</label>
                              <Select value={payment.status} onValueChange={(value) => handlePaymentChange(index, 'status', value)}>
                                <SelectTrigger className="text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pagado">Pagado</SelectItem>
                                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                                  <SelectItem value="Vencido">Vencido</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Método</label>
                              <Select value={payment.method} onValueChange={(value) => handlePaymentChange(index, 'method', value)}>
                                <SelectTrigger className="text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                                  <SelectItem value="Transferencia">Transferencia</SelectItem>
                                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                                  <SelectItem value="Bizum">Bizum</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Concepto</label>
                            <Input
                              value={payment.concept}
                              onChange={(e) => handlePaymentChange(index, 'concept', e.target.value)}
                              placeholder="Concepto del pago"
                              className="text-sm"
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleRemovePayment(index)}
                            >
                              <Trash2 className="mr-2 h-3 w-3" />
                              Eliminar
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{formatDate(payment.date)}</span>
                            </div>
                            <Badge 
                              variant={payment.status === 'Pagado' ? 'default' : payment.status === 'Pendiente' ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {payment.status}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-semibold text-foreground">€{payment.amount}</span>
                              <span className="text-xs text-muted-foreground">{payment.method}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{payment.concept}</p>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">Sin pagos registrados</p>
                    {isEditingPayments && (
                      <Button variant="outline" size="sm" onClick={handleAddPayment}>
                        <Plus className="mr-2 h-4 w-4" />
                        Añadir Primer Pago
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
};

export default PatientDetailedProfile;