'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Edit, Plus, FileText, Calendar, Trash2, User, 
  FileSignature, CreditCard, FileCheck, X, Loader2,
  AlertTriangle, ExternalLink 
} from "lucide-react";
import { usePatient, useUpdatePatient, useDeletePatient } from "@/lib/hooks/usePatients";
import { useToast } from "@/lib/hooks/use-toast";
import { reportsService, appointmentsService } from "@/lib/services/database";
import { googleDriveService } from "@/lib/services/googleDrive";
import { openRouterService } from "@/lib/services/openrouter";
import { createClient } from "@/lib/supabase/client";
import { generateReportAction } from "@/app/actions/generate-report";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface Report {
    id: string;
    title: string;
    created_at: string;
    content?: string | null;
    report_type?: string;
    google_drive_file_id?: string | null;
    status?: string;
}

interface Appointment {
    id: string;
    appointment_date: string;
    time?: string;
    duration?: string;
}

interface Payment {
  id: number;
  date: string;
  amount: string;
  status: string;
  method: string;
  concept: string;
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function PatientDetailedProfile({ params }: PageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [supabase] = useState(() => createClient());
  
  const patientId = params.id;
  const { data: patient, isLoading: patientLoading } = usePatient(patientId || '');
  const updatePatientMutation = useUpdatePatient();
  const deletePatientMutation = useDeletePatient();
  
  // Estados UI
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPayments, setIsEditingPayments] = useState(false);
  const [isGeneratingDossier, setIsGeneratingDossier] = useState(false);
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);

  // Datos Reales
  const [realReports, setRealReports] = useState<Report[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]); // New State
  
  const [patientData, setPatientData] = useState({
    name: "", phone: "", email: "", birth_date: "", sexo: "",
    direccion_fisica: "", persona_rescate_nombre: "", persona_rescate_telefono: "",
    persona_rescate_email: "", notes: "", tags: [] as string[]
  });

  const [paymentData, setPaymentData] = useState<Payment[]>([]); // CORRECCIÓN: Datos de pago vacíos por defecto

  // 1. Auth
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, [supabase.auth]);

  // 2. Cargar Informes y Citas
  useEffect(() => {
    const loadData = async () => {
        if (patientId) {
            try {
                // Parallel fetching
                const [reports, appts] = await Promise.all([
                  reportsService.getByPatient(patientId),
                  appointmentsService.getByPatient(patientId)
                ]);
                
                setRealReports((reports as unknown as Report[]) || []);
                setAppointments((appts as unknown as Appointment[]) || []);
            } catch (error) {
                console.error("Error cargando datos del paciente:", error);
            }
        }
    };
    loadData();
  }, [patientId]);
  
  // ... (rest of code)
  


  // 3. Sincronizar Datos
  useEffect(() => {
    if (patient) {
      setPatientData({
        name: patient.name || "", 
        phone: patient.phone || "", 
        email: patient.email || "",
        birth_date: patient.birth_date || "", 
        sexo: patient.sexo || "",
        direccion_fisica: patient.direccion_fisica || "",
        persona_rescate_nombre: patient.persona_rescate_nombre || "",
        persona_rescate_telefono: patient.persona_rescate_telefono || "",
        persona_rescate_email: patient.persona_rescate_email || "",
        notes: patient.notes || "", 
        tags: patient.tags || []
      });
    }
  }, [patient]);

  // Logic for Appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = appointments.filter(a => new Date(a.appointment_date) >= today)
    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());

  const pastAppointments = appointments.filter(a => new Date(a.appointment_date) < today)
    .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());


  // --- LÓGICA ALTA DOSSIER ---
  const handleGenerateDossier = async () => {
    // ... (sin cambios)
    if (!patientId || !patient || !currentUser) return;

    setIsGeneratingDossier(true);
    toast({ title: "Iniciando Alta", description: "Compilando historial...", duration: 3000 });

    try {
        const sortedReports = [...realReports].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        const historicalContext = sortedReports.map(r => 
            `[FECHA: ${new Date(r.created_at).toLocaleDateString()}] - TIPO: ${r.title}\n${r.content || 'Sin contenido'}`
        );

        const dateStr = new Date().toISOString().split('T')[0];
        
        // 1. IA - Compilación en cliente (Prompt)
        const compiledInfo = await openRouterService.compileReportInfo({
            reportType: 'alta_paciente',
            patientData: {
                name: patient.name,
                alias: `Paciente ${patient.id.slice(0, 4)}`,
                age: patient.birth_date ? calculateAge(patient.birth_date) : undefined,
                previousReports: historicalContext,
                firstVisitDate: patient.created_at || undefined,
            },
            sessionData: {
                clinicalNotes: "Cierre de expediente.",
                audioTranscription: undefined,
                sessionDate: dateStr
            }
        });

        // 2. IA - Generación en Servidor (Secure Action)
        const aiResult = await generateReportAction(compiledInfo, 'alta_paciente');
        
        if (!aiResult.success || !aiResult.text) {
             throw new Error(aiResult.error || "Error generando el informe");
        }
        
        const aiContent = aiResult.text;

        // 3. Documento
        const finalDocument = `
# DOSSIER CLÍNICO DE ALTA
Paciente: ${patient.name}
Fecha de Emisión: ${dateStr}

================================================================
PARTE I: INFORME DE SÍNTESIS Y CIERRE
================================================================
${aiContent}

================================================================
PARTE II: ANEXO DOCUMENTAL (HISTORIAL COMPLETO)
================================================================
${historicalContext.join('\n\n------------------------------------------------\n\n')}
`;

        // 4. Drive
        const reportTitle = `DOSSIER DE ALTA - ${patient.name} - ${dateStr}`;
        const driveResult = await googleDriveService.createPatientReport(
            reportTitle,
            finalDocument,
            patient.name,
            patientId
        );

        if (!driveResult.success) throw new Error("Fallo Drive");

        // 5. DB
        await reportsService.create({
            user_id: currentUser.id,
            patient_id: patientId,
            title: reportTitle,
            content: aiContent,
            report_type: 'alta_paciente',
            input_type: 'mixed',
            google_drive_file_id: driveResult.fileId,
            status: 'completed'
        });

        // 6. Limpieza
        toast({ title: "Limpiando", description: "Eliminando informes antiguos..." });
        const deletePromises = realReports.map(async (r) => {
            if (r.google_drive_file_id) {
                try {
                    return await googleDriveService.deleteFile(r.google_drive_file_id);
                } catch (e) { return false; }
            }
            return false;
        });
        await Promise.all(deletePromises);

        toast({ title: "✅ Dossier Completado", description: "Historial unificado." });
        
        const refreshed = await reportsService.getByPatient(patientId);
        setRealReports(refreshed || []);

    } catch (error: unknown) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
        setIsGeneratingDossier(false);
    }
  };

  // --- UTILS ---
  const handleSaveChanges = async () => {
    try {
      await updatePatientMutation.mutateAsync({ 
        id: patientId!, 
        updates: { 
            name: patientData.name, 
            phone: patientData.phone, 
            email: patientData.email, 
            birth_date: patientData.birth_date, 
            notes: patientData.notes,
            // Removed ts-ignore by ensuring properties exist or handling them
            sexo: patientData.sexo,
            direccion_fisica: patientData.direccion_fisica,
            persona_rescate_nombre: patientData.persona_rescate_nombre,
            persona_rescate_telefono: patientData.persona_rescate_telefono,
            persona_rescate_email: patientData.persona_rescate_email,
        } 
      });
      setIsEditing(false);
      toast({ title: "Guardado", description: "Datos del paciente actualizados." });
    } catch (e) { toast({ title: "Error", variant: "destructive" }); }
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    // Revertir cambios
    if (patient) {
        setPatientData({
            name: patient.name || "", 
            phone: patient.phone || "", 
            email: patient.email || "",
            birth_date: patient.birth_date || "", 
            sexo: patient.sexo || "",
            direccion_fisica: patient.direccion_fisica || "",
            persona_rescate_nombre: patient.persona_rescate_nombre || "",
            persona_rescate_telefono: patient.persona_rescate_telefono || "",
            persona_rescate_email: patient.persona_rescate_email || "",
            notes: patient.notes || "", 
            tags: patient.tags || []
        });
    }
  };
  
  const handleDeletePatient = async () => {
    try {
      await deletePatientMutation.mutateAsync(patientId!);
      router.push('/patients');
      toast({ title: "Eliminado" });
    } catch (e) { toast({ title: "Error", variant: "destructive" }); }
  };

  // Helpers
  const handlePaymentChange = (i: number, f: keyof Payment, v: string) => {
     const n = [...paymentData];
     n[i] = { ...n[i], [f]: v };
     setPaymentData(n);
  };
  const handleRemovePayment = (i: number) => { setPaymentData(paymentData.filter((_, idx) => idx !== i)); };
  const handleAddPayment = () => {
     setPaymentData([...paymentData, { id: Date.now(), date: '', amount: '', status: 'Pendiente', method: '', concept: '' }]);
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('es-ES') : '-';
  const calculateAge = (d: string) => d ? Math.floor((Date.now() - new Date(d).getTime())/31557600000) : undefined;
  const formatAge = (d: string) => { const a = calculateAge(d); return a ? `${a} años` : ''; };

  if (patientLoading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin" /></div>;
  if (!patient && patientId) return <div className="p-8 text-center">Paciente no encontrado</div>;

  return (
    <div className="min-h-screen bg-background">
      {/* CORRECCIÓN: Eliminado DashboardHeader duplicado */}
      
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* HEADER DE PAGINA (Movido dentro del main para evitar efecto duplicado) */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex items-center space-x-4">
              <h1 className="font-serif text-3xl font-medium text-primary">{patient?.name}</h1>
              <span className="text-muted-foreground hidden md:inline">|</span>
              <div className="text-sm text-muted-foreground flex gap-2">
                <Calendar className="h-4 w-4" /> Alta: {formatDate(patient?.created_at || '')}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href={`/session/${patientId}`}>
                <Button variant="neumorphic" className="h-12 px-6 font-semibold text-primary flex gap-2">
                  <FileText className="h-4 w-4" /> Iniciar Sesión
                </Button>
              </Link>

               {/* AlertDialog Alta Dossier */}
                <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    disabled={realReports.length === 0 || isGeneratingDossier}
                    variant="neumorphic"
                    className={`h-12 px-6 font-semibold flex gap-2 ${realReports.length === 0 ? 'opacity-50' : 'text-[#800020] hover:text-[#a00028]'}`}
                  >
                    {isGeneratingDossier ? <Loader2 className="animate-spin h-4 w-4" /> : <FileSignature className="h-4 w-4" />}
                    {isGeneratingDossier ? 'Generando...' : 'Alta Dossier'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                   <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle /> Confirmar Alta Clínica
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Se generará el Dossier unificado y se eliminarán los <strong>{realReports.length} informes parciales</strong> de Drive.
                        <br/><br/>
                        Esta acción es irreversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleGenerateDossier} className="bg-purple-600 hover:bg-purple-700">
                      Confirmar y Generar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* DATOS COMPLETOS EDITABLES */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex gap-2"><User /> Datos Personales Completos</CardTitle>
                    {!isEditing ? (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 mr-2"/> Editar Ficha</Button>
                    ) : (
                        <div className="flex gap-2 items-center">
                             <Button size="sm" onClick={handleSaveChanges} className="bg-green-600 hover:bg-green-700"><FileCheck className="w-4 h-4 mr-2"/> Guardar</Button>
                             <Button variant="ghost" size="sm" onClick={handleCancelEdit}><X className="w-4 h-4 mr-2"/> Cancelar</Button>
                             
                             <div className="w-px h-6 bg-gray-300 mx-2 hidden md:block"></div>

                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" className="bg-red-100 text-red-600 hover:bg-red-200 shadow-none border border-red-200"><Trash2 className="w-4 h-4 mr-2"/> Eliminar</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Está seguro de eliminar este paciente?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción eliminará permanentemente la ficha de <strong>{patient?.name}</strong> y todos sus informes asociados.
                                            <br/><br/>
                                            Esta acción no se puede deshacer.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeletePatient} className="bg-red-600 hover:bg-red-700 text-white">Confirmar Eliminación</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                             </AlertDialog>
                        </div>
                    )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                 {/* BLOQUE I: Identificación */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Nombre Completo</label>
                        {isEditing ? <Input value={patientData.name} onChange={e => setPatientData({...patientData, name: e.target.value})} /> : <p className="p-2 bg-slate-50 rounded">{patientData.name}</p>}
                    </div>
                    <div className="space-y-1">
                         <label className="text-xs font-semibold text-muted-foreground">Fecha Nacimiento / Edad</label>
                         {isEditing ? <Input type="date" value={patientData.birth_date} onChange={e => setPatientData({...patientData, birth_date: e.target.value})} /> 
                         : <p className="p-2 bg-slate-50 rounded">{formatDate(patientData.birth_date)} {patientData.birth_date && `(${formatAge(patientData.birth_date)})`}</p>}
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Email</label>
                        {isEditing ? <Input value={patientData.email} onChange={e => setPatientData({...patientData, email: e.target.value})} /> : <p className="p-2 bg-slate-50 rounded break-all">{patientData.email || '-'}</p>}
                    </div>
                     <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Teléfono</label>
                        {isEditing ? <Input value={patientData.phone} onChange={e => setPatientData({...patientData, phone: e.target.value})} /> : <p className="p-2 bg-slate-50 rounded">{patientData.phone || '-'}</p>}
                    </div>
                     <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Sexo / Género</label>
                        {isEditing ? <Input value={patientData.sexo} placeholder="Ej: Mujer, Hombre, NB..." onChange={e => setPatientData({...patientData, sexo: e.target.value})} /> : <p className="p-2 bg-slate-50 rounded">{patientData.sexo || '-'}</p>}
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-semibold text-muted-foreground">Dirección Física</label>
                        {isEditing ? <Input value={patientData.direccion_fisica} placeholder="Calle, número, piso, ciudad..." onChange={e => setPatientData({...patientData, direccion_fisica: e.target.value})} /> : <p className="p-2 bg-slate-50 rounded">{patientData.direccion_fisica || '-'}</p>}
                    </div>
                 </div>

                 <div className="border-t pt-4">
                     <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><AlertTriangle className="w-3 h-3 text-orange-500"/> Contacto de Emergencia</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-orange-50/50 p-4 rounded-lg">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground">Nombre Contacto</label>
                            {isEditing ? <Input value={patientData.persona_rescate_nombre} onChange={e => setPatientData({...patientData, persona_rescate_nombre: e.target.value})} /> : <p className="text-sm">{patientData.persona_rescate_nombre || '-'}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground">Teléfono Contacto</label>
                            {isEditing ? <Input value={patientData.persona_rescate_telefono} onChange={e => setPatientData({...patientData, persona_rescate_telefono: e.target.value})} /> : <p className="text-sm">{patientData.persona_rescate_telefono || '-'}</p>}
                        </div>
                        <div className="space-y-1 md:col-span-2">
                             <label className="text-xs font-semibold text-muted-foreground">Email Contacto</label>
                             {isEditing ? <Input value={patientData.persona_rescate_email} onChange={e => setPatientData({...patientData, persona_rescate_email: e.target.value})} /> : <p className="text-sm">{patientData.persona_rescate_email || '-'}</p>}
                        </div>
                     </div>
                 </div>

                 <div className="border-t pt-4">
                    <label className="text-xs font-semibold text-muted-foreground block mb-2">Notas Fijas (Alergias, Antecedentes clave...)</label>
                    {isEditing ? <Textarea value={patientData.notes} rows={4} onChange={e => setPatientData({...patientData, notes: e.target.value})} /> : <p className="text-sm bg-yellow-50/50 p-3 rounded border border-yellow-100 min-h-[80px]">{patientData.notes || 'Sin notas'}</p>}
                 </div>
              </CardContent>
            </Card>
          </div>

          {/* HISTORIAL & CITAS */}
          <div className="space-y-8">
             {/* CITAS (NEUMORRHIC STYLE - REFINED) */}
             <Card>
                <CardHeader>
                    <CardTitle className="flex gap-2">
                        <Calendar className="text-gray-500"/> Citas
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* UPCOMING */}
                    <div>
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Próximas Sesiones</h4>
                        <div className="space-y-3">
                            {upcomingAppointments.length > 0 ? upcomingAppointments.map(app => (
                                <div key={app.id} className="flex justify-between items-center p-3 rounded-lg border bg-card/50 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                        <div>
                                            <p className="font-medium text-sm">{formatDate(app.appointment_date)}</p>
                                            <p className="text-xs text-muted-foreground">{app.time || '10:00'} - {app.duration || '60min'}</p>
                                        </div>
                                    </div>
                                </div>
                            )) : <p className="text-sm text-muted-foreground italic pl-2">No hay citas programadas.</p>}
                        </div>
                    </div>

                    {/* PAST */}
                    <div>
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Historial</h4>
                        <div className="space-y-2">
                             {pastAppointments.slice(0, 3).map(app => (
                                <div key={app.id} className="flex justify-between items-center p-2 opacity-70 hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-3">
                                        <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
                                        <p className="text-sm text-gray-600 line-through decoration-gray-400">{formatDate(app.appointment_date)}</p>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] border-gray-300 text-gray-500">Realizada</Badge>
                                </div>
                            ))}
                            {pastAppointments.length === 0 && <p className="text-sm text-muted-foreground italic pl-2">Sin historial.</p>}
                        </div>
                    </div>
                </CardContent>
             </Card>

             <Card>
               <CardHeader><CardTitle className="flex gap-2"><FileText/> Historial ({realReports.length})</CardTitle></CardHeader>
               <CardContent>
                  <div className="h-64 overflow-y-auto space-y-2 pr-2">
                    {realReports.length > 0 ? realReports.map(r => (
                        <div key={r.id} className="border p-3 rounded hover:bg-slate-50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium text-sm">{r.title}</p>
                                    <div className="flex gap-2 mt-1">
                                        <Badge variant="outline" className="text-[10px]">{formatDate(r.created_at)}</Badge>
                                        <Badge variant={r.report_type === 'alta_paciente' ? 'default' : 'secondary'} className="text-[10px]">{r.report_type}</Badge>
                                    </div>
                                </div>
                                {r.google_drive_file_id && (
                                    <a href={`https://docs.google.com/document/d/${r.google_drive_file_id}/edit`} target="_blank" className="text-blue-600"><ExternalLink className="w-4 h-4" /></a>
                                )}
                            </div>
                        </div>
                    )) : <p className="text-center text-sm text-muted-foreground">Sin informes</p>}
                  </div>
               </CardContent>
             </Card>

             <Card>
               <CardHeader>
                 <div className="flex justify-between items-center">
                    <CardTitle className="flex gap-2"><CreditCard/> Pagos</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingPayments(!isEditingPayments)}><Edit className="w-4 h-4"/></Button>
                 </div>
               </CardHeader>
               <CardContent>
                  <div className="space-y-2">
                     {paymentData.map((p, idx) => (
                        <div key={p.id} className="border p-3 rounded space-y-2 text-sm">
                            {isEditingPayments ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-end">
                                    <div>
                                        <label className="text-[10px] text-muted-foreground">Fecha</label>
                                        <Input type="date" value={p.date} onChange={e => handlePaymentChange(idx, 'date', e.target.value)} className="h-8 text-xs" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-muted-foreground">Cantidad (€)</label>
                                        <Input type="number" step="0.01" value={p.amount} onChange={e => handlePaymentChange(idx, 'amount', e.target.value)} className="h-8 text-xs" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-muted-foreground">Estado</label>
                                        <Select value={p.status} onValueChange={v => handlePaymentChange(idx, 'status', v)}>
                                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pagado">Pagado</SelectItem>
                                                <SelectItem value="Pendiente">Pendiente</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-muted-foreground">Método</label>
                                        <Select value={p.method} onValueChange={v => handlePaymentChange(idx, 'method', v)}>
                                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="-"/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                                                <SelectItem value="Efectivo">Efectivo</SelectItem>
                                                <SelectItem value="Transferencia">Transferencia</SelectItem>
                                                <SelectItem value="Bizum">Bizum</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="md:col-span-3">
                                        <Input placeholder="Concepto (ej. Sesión Inicial)" value={p.concept} onChange={e => handlePaymentChange(idx, 'concept', e.target.value)} className="h-8 text-xs" />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button variant="ghost" size="icon" onClick={() => handleRemovePayment(idx)} className="h-8 w-8 text-red-500"><Trash2 className="w-4 h-4"/></Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{formatDate(p.date)}</span>
                                        <span className="text-xs text-muted-foreground">{p.concept}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-base">{p.amount}€</div>
                                        <div className="flex gap-2 justify-end mt-1">
                                            <Badge variant={p.status === 'Pagado' ? 'default' : 'outline'} className="text-[10px]">{p.status}</Badge>
                                            {p.method && <Badge variant="secondary" className="text-[10px]">{p.method}</Badge>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                     ))}
                     {isEditingPayments && <Button variant="outline" size="sm" className="w-full" onClick={handleAddPayment}><Plus className="w-4 h-4 mr-2"/> Añadir Pago</Button>}
                  </div>
               </CardContent>
             </Card>
          </div>

        </div>
      </main>
    </div>
  );
}