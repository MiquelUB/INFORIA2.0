import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Trash2, Save, Wand2, FileText, AlertTriangle, Calendar, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import DashboardHeader from '@/components/DashboardHeader';
import FileUploadZone from '@/components/FileUploadZone';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { useAuth } from '@/contexts/AuthContext';
import { patientsService, reportsService } from '@/services/database';
import { googleDriveService } from '@/services/googleDrive';
import { googleSheetsPatientCRM } from '@/services/googleSheetsPatientCRM';
import { openRouterService } from '@/services/openrouter';
import type { Patient } from '@/services/database';

export default function SessionWorkspace() {
  const router = useRouter();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [notes, setNotes] = useState('');
  const [reportType, setReportType] = useState<'primera_visita' | 'seguimiento'>('primera_visita');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [generatedReportId, setGeneratedReportId] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<'working' | 'fallback' | 'unknown'>('unknown');
  const [driveStatus, setDriveStatus] = useState<'working' | 'no-permissions' | 'unknown'>('unknown');
  const [patientReports, setPatientReports] = useState<any[]>([]);

  // Interfaces corregidas
  interface PatientData {
    name: string;
    age?: number;
    previousReports: string[];
    firstVisitDate?: string;
  }

  interface SelectedPatient {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    birth_date: string | null;
    created_at: string | null;
    notes: string | null;
  }

  const patientId = searchParams.get('patientId');

  const patientInitials = selectedPatient
    ? selectedPatient.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : undefined;

  const { selectedFiles, uploadFiles, removeFile, clearFiles } = useFileUpload(patientInitials);

  const {
    isRecording,
    recordingTime,
    audioBlob,
    startRecording,
    stopRecording,
    deleteRecording,
    playRecording,
  } = useAudioRecording(patientInitials);

  useEffect(() => {
    const loadPatient = async () => {
      if (!user?.id || !patientId) return;
      try {
        const patient = await patientsService.getById(patientId);
        if (patient) {
          setSelectedPatient(patient);
          const reports = await reportsService.getByPatient(patientId);
          setPatientReports(reports);
        }
      } catch (error) {
        console.error('Error loading patient:', error);
        toast.error('Error al cargar datos del paciente');
      }
    };
    loadPatient();
  }, [user?.id, patientId]);

  useEffect(() => {
    const handleAutoTranscription = async () => {
      if (audioBlob && !isRecording && !isTranscribing) {
        await handleTranscribeAudio();
      }
    };
    handleAutoTranscription();
  }, [audioBlob, isRecording]);

  const testOpenRouterConnectivity = async () => {
    console.log('🧪 Testing OpenRouter connectivity...');
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    console.log('🔑 API Key debug info:', {
      exists: !!apiKey,
      length: apiKey?.length,
      firstChars: apiKey?.substring(0, 15),
      lastChars: apiKey?.substring(apiKey?.length - 5),
      hasNewlines: apiKey?.includes('\n'),
      hasSpaces: apiKey?.includes(' '),
      hasTabs: apiKey?.includes('\t'),
      isString: typeof apiKey,
    });

    try {
      console.log('🌐 Attempting fetch to OpenRouter...');
      const cleanApiKey = apiKey?.trim();
      const headers = {
        Authorization: `Bearer ${cleanApiKey}`,
        'Content-Type': 'application/json',
      };

      console.log('📋 Headers debug:', {
        authHeaderLength: headers.Authorization?.length,
        authStarts: headers.Authorization?.substring(0, 20),
        contentType: headers['Content-Type'],
      });

      const response = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        headers,
      });

      console.log('📡 OpenRouter response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ OpenRouter conectado - Modelos:', data.data?.length || 0);
        return true;
      } else {
        const errorText = await response.text();
        console.log('❌ OpenRouter error response:', errorText);
        return false;
      }
    } catch (fetchError) {
      const err = fetchError as Error;
      console.log('❌ Fetch exception details:', {
        name: err.name,
        message: err.message,
        stack: err.stack?.substring(0, 200),
      });
      return false;
    }
  };

  const handleTranscribeAudio = async () => {
    if (!audioBlob) {
      toast.error('No hay audio para transcribir');
      return;
    }
    setIsTranscribing(true);
    try {
      console.log('🎤 Intentando transcribir audio con Whisper...');
      const isConnected = await testOpenRouterConnectivity();
      if (!isConnected) {
        throw new Error('OpenRouter no disponible');
      }
      const transcriptionText = await openRouterService.transcribeAudio(audioBlob);
      setTranscription(transcriptionText);
      setAiStatus('working');
      toast.success('Audio transcrito correctamente con IA');
      console.log('✅ Transcripción completada:', transcriptionText.substring(0, 100) + '...');
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setAiStatus('fallback');
      const fallbackTranscription = `[AUDIO GRABADO - ${recordingTime}]
Archivo: ${new Date().toLocaleDateString()}_${recordingTime}_${patientInitials}_session.wav
Duración: ${recordingTime}
Estado: Pendiente transcripción manual
Nota: La transcripción automática no está disponible. Por favor, revise el audio manualmente.`;
      setTranscription(fallbackTranscription);
      toast.error('Transcripción automática no disponible. Usando información básica del audio.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const generateStructuredReport = (title: string, date: string) => {
    return `# ${title}

## INFORMACIÓN DE LA SESIÓN
- **Fecha**: ${date}
- **Paciente**: ${selectedPatient?.name}
- **Tipo de consulta**: ${getReportTypeLabel(reportType)}
- **Profesional**: ${user?.email}

## DESARROLLO DE LA SESIÓN

${notes.trim() ? `### Observaciones Clínicas
${notes.trim()}

` : ''}

${transcription ? `### Registro de Audio
${transcription}

` : ''}

${selectedFiles.length > 0 ? `### Documentación Adjunta
${selectedFiles
  .map((file, index) => `${index + 1}. ${file.name} (${Math.round(file.size / 1024)} KB)`)
  .join('\n')}

` : ''}

## EVALUACIÓN Y SEGUIMIENTO

### Estado Actual
- Sesión documentada completamente
- ${audioBlob ? 'Incluye grabación de audio' : 'Sesión basada en notas escritas'}
- ${selectedFiles.length > 0 ? `${selectedFiles.length} documento(s) adicional(es)` : 'Sin documentación adicional'}

### Próximos Pasos
- Revisar contenido de la sesión
- ${reportType === 'primera_visita' ? 'Planificar seguimiento inicial' : 'Continuar con plan terapéutico establecido'}
- Actualizar historial clínico

---
*Informe generado automáticamente el ${new Date().toLocaleString()}*
*Sistema: iNFORiA Clinical Assistant*`;
  };

  const handleGenerateReport = async () => {
    if (!selectedPatient || (!notes.trim() && !transcription.trim() && selectedFiles.length === 0)) {
      toast.error('Por favor proporciona contenido para el informe');
      return;
    }
    setIsGenerating(true);
    try {
      console.log('🚀 Generando informe con sistema híbrido IA/Estructurado:', {
        patient: selectedPatient.name,
        type: reportType,
        hasAudio: !!audioBlob,
        hasTranscription: !!transcription,
        filesCount: selectedFiles.length,
        notesLength: notes.length,
      });

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const reportTitle = `${getReportTypeLabel(reportType)} - ${selectedPatient.name} - ${dateStr}`;

      let aiGeneratedContent: string;
      let reportMethod = 'structured';

      if (notes.trim() || transcription.trim()) {
        try {
          console.log('🤖 Intentando generar informe con IA...');
          const isConnected = await testOpenRouterConnectivity();
          if (!isConnected) {
            throw new Error('OpenRouter no disponible - usando fallback estructurado');
          }

          const previousReports = reportType === 'seguimiento'
            ? await reportsService.getByPatient(selectedPatient.id)
            : [];

          const patientData: PatientData = {
            name: selectedPatient.name,
            age: selectedPatient.birth_date
              ? Math.floor(
                  (Date.now() - new Date(selectedPatient.birth_date).getTime()) /
                    (365.25 * 24 * 60 * 60 * 1000)
                )
              : undefined,
            previousReports: previousReports.map((r) => r.content || '').slice(0, 3),
            firstVisitDate: selectedPatient.created_at || undefined,
          };

          const sessionData = {
            audioTranscription: transcription || undefined,
            clinicalNotes: notes.trim(),
            sessionDate: dateStr,
          };

          const compiledInfo = await openRouterService.compileReportInfo({
            reportType: reportType === 'primera_visita' ? 'nuevo_paciente' : 'seguimiento',
            patientData,
            sessionData,
          });

          aiGeneratedContent = await openRouterService.generateReport(compiledInfo);
          reportMethod = 'ai-generated';
          setAiStatus('working');
          console.log('✅ IA generó informe exitosamente');
        } catch (aiError) {
          console.warn('⚠️ Error IA, usando contenido estructurado:', aiError);
          setAiStatus('fallback');
          aiGeneratedContent = generateStructuredReport(reportTitle, dateStr);
          reportMethod = 'structured-fallback';
        }
      } else {
        aiGeneratedContent = generateStructuredReport(reportTitle, dateStr);
        reportMethod = 'structured-direct';
      }

      console.log('📝 Informe generado con método:', reportMethod);

      let driveResult: {
        fileId: string;
        webViewLink: string;
        success: boolean;
        message: string;
      };
      let driveSuccess = false;

      try {
        driveResult = await googleDriveService.createPatientReport(
          reportTitle,
          aiGeneratedContent,
          selectedPatient.name,
          selectedPatient.id
        );
        if (driveResult.success) {
          driveSuccess = true;
          setDriveStatus('working');
          console.log('💾 Informe guardado en Google Drive:', driveResult.fileId);
        } else {
          throw new Error(driveResult.message);
        }
      } catch (driveError) {
        console.warn('⚠️ Error Google Drive:', driveError);
        setDriveStatus('no-permissions');
        driveResult = {
          fileId: '',
          webViewLink: '',
          success: false,
          message: 'Sin permisos de Google Drive',
        };
      }

      const reportData = {
        user_id: user!.id,
        patient_id: selectedPatient.id,
        title: reportTitle,
        content: aiGeneratedContent,
        report_type: reportType,
        input_type: audioBlob ? ('voice' as const) : selectedFiles.length > 0 ? ('mixed' as const) : ('text' as const),
        google_drive_file_id: driveResult?.fileId || null,
        status: 'completed' as const,
        audio_transcription: transcription || undefined,
      };

      const newReport = await reportsService.create(reportData);
      console.log('💽 Informe guardado en base de datos:', newReport.id);

      if (driveSuccess) {
        try {
          await googleSheetsPatientCRM.addReportToCRM({
            date: dateStr,
            patientId: selectedPatient.id,
            patientName: selectedPatient.name,
            reportType: getReportTypeLabel(reportType),
            title: reportTitle,
            status: 'Completado',
            driveLink: driveResult.webViewLink,
            inputMethod: `${reportMethod} + ${audioBlob ? 'audio' : selectedFiles.length > 0 ? 'archivos' : 'notas'}`,
          });

          const patientReportsCount = await reportsService.getByPatient(selectedPatient.id);
          const patientFolderUrl = await googleDriveService.getPatientFolderUrl(
            selectedPatient.name,
            selectedPatient.id
          );

          await googleSheetsPatientCRM.upsertPatientInCRM({
            id: selectedPatient.id,
            name: selectedPatient.name,
            email: selectedPatient.email || undefined,
            phone: selectedPatient.phone || undefined,
            birth_date: selectedPatient.birth_date || undefined,
            created_at: selectedPatient.created_at || new Date().toISOString(),
            total_reports: patientReportsCount.length + 1,
            last_report_date: dateStr,
            payment_status: 'Pendiente',
            total_paid: 0,
            status: 'active',
            notes: selectedPatient.notes || undefined,
            drive_folder_url: patientFolderUrl || undefined,
          });
          console.log('📊 CRM actualizado exitosamente');
        } catch (crmError) {
          console.warn('Error actualizando CRM (no crítico):', crmError);
        }
      }

      const updatedReports = await reportsService.getByPatient(selectedPatient.id);
      setPatientReports(updatedReports);
      setGeneratedReportId(newReport.id);

      let successMessage = '';
      if (reportMethod === 'ai-generated' && driveSuccess) {
        successMessage = '¡Informe clínico generado por IA y guardado en Google Drive exitosamente!';
      } else if (reportMethod === 'ai-generated') {
        successMessage = '¡Informe clínico generado por IA exitosamente! (Guardado localmente - Google Drive no disponible)';
      } else if (driveSuccess) {
        successMessage = '¡Informe estructurado creado y guardado en Google Drive exitosamente!';
      } else {
        successMessage = '¡Informe estructurado creado exitosamente! (Guardado localmente - Google Drive no disponible)';
      }
      toast.success(successMessage, { duration: 6000 });

      setNotes('');
      setTranscription('');
      clearFiles();
      deleteRecording();
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(`Error al generar el informe: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = () => {
    const draftData = {
      patient_id: selectedPatient?.id,
      patient_name: selectedPatient?.name,
      notes,
      transcription,
      files: selectedFiles.map((f) => f.name),
      hasRecording: !!audioBlob,
      recordingDuration: recordingTime,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('session_draft', JSON.stringify(draftData));
    toast.success('Borrador guardado localmente');
  };

  const loadDraft = () => {
    try {
      const draft = localStorage.getItem('session_draft');
      if (draft) {
        const draftData = JSON.parse(draft);
        if (draftData.notes) setNotes(draftData.notes);
        if (draftData.transcription) setTranscription(draftData.transcription);
        toast.success('Borrador cargado');
      } else {
        toast.error('No hay borrador guardado');
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      toast.error('Error al cargar el borrador');
    }
  };

  const getReportTypeLabel = (type: string) => {
    const labels = {
      primera_visita: 'Informe Primera Visita',
      seguimiento: 'Informe Seguimiento',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTotalContent = () => {
    const parts = [];
    if (notes.trim()) parts.push(`Notas (${notes.length} chars)`);
    if (transcription.trim()) parts.push(`Transcripción (${transcription.length} chars)`);
    if (selectedFiles.length > 0) parts.push(`${selectedFiles.length} archivos`);
    return parts.join(' + ') || 'Sin contenido';
  };

  const getSystemStatusColor = () => {
    if (aiStatus === 'working' && driveStatus === 'working') return 'text-green-600';
    if (aiStatus === 'fallback' || driveStatus === 'no-permissions') return 'text-yellow-600';
    return 'text-gray-500';
  };

  const getSystemStatusText = () => {
    if (aiStatus === 'working' && driveStatus === 'working') return 'IA + Google Drive operativos';
    if (aiStatus === 'working' && driveStatus === 'no-permissions') return 'IA operativa - Drive sin permisos';
    if (aiStatus === 'fallback' && driveStatus === 'working') return 'Informes estructurados + Google Drive';
    if (aiStatus === 'fallback' && driveStatus === 'no-permissions') return 'Informes estructurados - Drive sin permisos';
    return 'Estado del sistema: Verificando...';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (!selectedPatient) {
    return (
      <>
        <DashboardHeader />
        <div className="container mx-auto max-w-6xl px-6 py-8">
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Paciente no encontrado</h3>
            <p className="text-muted-foreground mb-6">
              El paciente especificado no existe o no tienes acceso a él.
            </p>
            <Button onClick={() => navigate('/patient-list')}>Volver a lista de pacientes</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader />
      <div className="container mx-auto max-w-6xl px-6 py-8 space-y-8">
        <div className="text-center">
          <h1 className="font-lora text-3xl font-bold mb-2">Registro de Sesión - {selectedPatient.name}</h1>
          <p className="text-muted-foreground">
            Sistema híbrido de documentación clínica con IA y fallbacks robustos
          </p>
          <p className={`text-sm mt-1 ${getSystemStatusColor()}`}>{getSystemStatusText()}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Registro de la Sesión</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Grabación de Sesión</h3>
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? 'destructive' : 'default'}
                      size="lg"
                      className="bg-primary hover:bg-primary/90"
                      disabled={isTranscribing}
                    >
                      {isRecording ? (
                        <>
                          <Square className="w-4 h-4 mr-2" />
                          Parar Grabación
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Empezar Grabación
                        </>
                      )}
                    </Button>

                    {isRecording && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="font-mono text-lg font-semibold">{recordingTime}</span>
                      </div>
                    )}

                    {isTranscribing && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">
                          {aiStatus === 'working' ? 'Transcribiendo con Whisper...' : 'Procesando audio...'}
                        </span>
                      </div>
                    )}
                  </div>

                  {audioBlob && !isRecording && (
                    <Card className={transcription.includes('Pendiente transcripción manual') ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Grabación finalizada - {recordingTime}</p>
                            <p className="text-sm text-muted-foreground">
                              {`${new Date().toLocaleDateString()}_${recordingTime}_${patientInitials}_session.wav`}
                            </p>
                            {transcription && !transcription.includes('Pendiente transcripción manual') && (
                              <p className="text-xs text-green-700 mt-1">✓ Transcrito automáticamente ({transcription.length} caracteres)</p>
                            )}
                            {transcription && transcription.includes('Pendiente transcripción manual') && (
                              <p className="text-xs text-yellow-700 mt-1">⚠ Transcripción automática no disponible - Información básica guardada</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={playRecording}>
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={deleteRecording}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {transcription && (
                    <Card className={transcription.includes('Pendiente transcripción manual') ? 'border-yellow-200 bg-yellow-50' : 'border-blue-200 bg-blue-50'}>
                      <CardContent className="p-4">
                        <h4 className={`font-medium mb-2 ${transcription.includes('Pendiente transcripción manual') ? 'text-yellow-800' : 'text-blue-800'}`}>
                          {transcription.includes('Pendiente transcripción manual') ? 'Información del Audio' : 'Transcripción Automática'}
                        </h4>
                        <p className={`text-sm max-h-32 overflow-y-auto ${transcription.includes('Pendiente transcripción manual') ? 'text-yellow-700' : 'text-blue-700'}`}>
                          {transcription}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notas Clínicas</label>
                  <Textarea
                    placeholder="Observaciones clínicas, contexto de la sesión, notas importantes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[150px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Archivos Adicionales</label>
                  <FileUploadZone
                    files={selectedFiles}
                    onFilesSelected={uploadFiles}
                    onFileRemove={removeFile}
                    acceptedTypes=".wav,.mp3,.m4a,.txt,.pdf,.doc,.docx"
                    maxFiles={5}
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Contenido del informe:</strong> {getTotalContent()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Sistema: {aiStatus === 'working' ? 'IA disponible' : 'Informes estructurados'} | Drive: {driveStatus === 'working' ? 'Conectado' : 'Sin permisos'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" size="lg" onClick={handleSaveDraft} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Guardar Borrador
              </Button>

              <Button variant="outline" size="lg" onClick={loadDraft} className="flex items-center gap-2">
                Cargar Borrador
              </Button>

              <Button
                size="lg"
                onClick={handleGenerateReport}
                disabled={isGenerating || isTranscribing}
                className="bg-primary hover:bg-primary/90 flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                {isGenerating ? 'Generando Informe...' : aiStatus === 'working' ? 'Generar con IA' : 'Generar Informe Estructurado'}
              </Button>
            </div>

            {(aiStatus === 'fallback' || driveStatus === 'no-permissions') && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800">Sistema funcionando en modo híbrido</p>
                      {aiStatus === 'fallback' && (
                        <p className="text-yellow-700">• IA no disponible - Usando informes estructurados profesionales</p>
                      )}
                      {driveStatus === 'no-permissions' && (
                        <p className="text-yellow-700">• Google Drive sin permisos - Informes guardados localmente</p>
                      )}
                      <p className="text-yellow-600 text-xs mt-1">Los informes se crean correctamente independientemente del estado de los servicios externos.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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
                  {patientReports.length > 0 ? (
                    patientReports.map((report) => (
                      <div key={report.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground text-sm leading-tight">{report.title}</h4>
                            <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(report.created_at)}</span>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                {report.report_type === 'primera_visita' ? 'Primera Visita' : 'Seguimiento'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={report.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                              {report.status === 'completed' ? 'Completado' : 'Borrador'}
                            </Badge>
                            {report.google_drive_file_id && (
                              <a
                                href={`https://docs.google.com/document/d/${report.google_drive_file_id}/edit`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 transition-colors"
                                title="Abrir informe en Google Drive"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
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
          </div>
        </div>
      </div>
    </>
  );
}