'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from "next/navigation"; 
import Link from "next/link"; // Added
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PianoLoader } from '@/components/ui/PianoLoader'; // Added
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Play, Square, Trash2, Wand2, FileText, AlertTriangle, Calendar, ExternalLink, Loader2, User as UserIcon, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import FileUploadZone from '@/components/FileUploadZone';
import { useFileUpload } from '@/lib/hooks/useFileUpload';
import { useAudioRecording } from '@/lib/hooks/useAudioRecording';
import { patientsService, reportsService } from '@/lib/services/database';
import { googleDriveService } from '@/lib/services/googleDrive';
import { openRouterService } from '@/lib/services/openrouter';
import type { Patient } from '@/lib/services/database';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { deductCredits } from '@/lib/actions/credits';
import { pricingService } from '@/lib/services/pricing';
import { transcribeAudioAction } from '@/app/actions/transcribe'; // Server Action
import { generateReportAction } from '@/app/actions/generate-report'; // Server Action
import { checkUserCreditsAction } from '@/app/actions/check-credits'; // Server Action

// Constantes para el "Límite Inteligente"
const MAX_NOTES_LENGTH = 20000;
const WARNING_NOTES_LENGTH = 15000;

// ✅ CORRECCIÓN 2: Añadida la interfaz de Props para 'params'
interface PageProps {
  params: {
    patientId: string;
  };
}

export default function SessionPage({ params }: PageProps) {
  const { patientId } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get('mode');
  
  // ✅ Usamos el Hook Global para tener acceso a User + PROFILE (Créditos)
  const { user, profile } = useAuth();
  const supabase = createClient();

  // const [user, setUser] = useState<User | null>(null); // ELIMINADO: Usamos useAuth
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  interface Report {
    id: string;
    created_at: string;
    title: string;
    content?: string | null;
    report_type?: string;
    google_drive_file_id?: string | null;
    status?: string | null; // Added status
  }
  
  const [patientReports, setPatientReports] = useState<Report[]>([]);
  const [reportType, setReportType] = useState<string>('primera_visita');
  const [notes, setNotes] = useState<string>('');
  const [transcription, setTranscription] = useState<string>('');
  const [aiStatus, setAiStatus] = useState<string>('idle');
  const [driveStatus, setDriveStatus] = useState<string>('working'); // Restored
  
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isConfirmingReport, setIsConfirmingReport] = useState<boolean>(false);
  
  // Derived state or unused
  // const [generatedReportId, setGeneratedReportId] = useState<string | null>(null); // Unused read
  // const [hasGoogleToken, setHasGoogleToken] = useState<boolean>(true); // Derived below
  
  // const hasGoogleToken = !!user?.app_metadata?.provider_token;

  // const [skipCharge, setSkipCharge] = useState<boolean>(false); // Unused
  // const [totalCredits, setTotalCredits] = useState<number>(0); // Unused read
  // const [details, setDetails] = useState<string[]>([]); // Unused read

  const getReportTypeLabel = (type: string) => {
    const labels = {
      primera_visita: 'Informe Primera Visita',
      seguimiento: 'Informe Seguimiento',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const calculateAge = (birthDate: string) => {
    const diff = Date.now() - new Date(birthDate).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  /* 
   * ✅ AUTH GESTIONADO POR PROVIDER GLOBAL (useAuth)
   * Eliminamos el useEffect local que duplicaba la llamada a supabase.auth.getSession()
   */

  
  // Interfaces corregidas (tu código original)


  // ✅ patientId ya declarado al inicio del componente (línea 40)
  
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
  } = useAudioRecording(patientInitials); // Tu hook (sin 'isProcessing')

  // ✅ CÁLCULO DE COSTE EN TIEMPO REAL (Para el Modal)
  const previewCost = useMemo(() => {
    return pricingService.calculateSessionCost({
      hasAudio: !!audioBlob || !!transcription,
      files: selectedFiles,
      reportType: reportType
    });
  }, [audioBlob, transcription, selectedFiles, reportType]);

  const [isLoadingPatient, setIsLoadingPatient] = useState(true);

  useEffect(() => {
    const loadPatientAndReports = async () => {
      // Si no tenemos ID de usuario o paciente todavía, esperamos para no dar falsos negativos
      if (!user?.id || !patientId) return;

      try {
        console.log('🔍 Loading patient:', { patientId, userId: user?.id });
        const patient = await patientsService.getById(patientId);
        
        if (patient) {
          setSelectedPatient(patient);
          console.log('✅ Patient loaded:', patient);
          
          // Cargar reportes del paciente
          console.log('📋 Loading reports for patient:', patientId);
          const reports = await reportsService.getByPatient(patientId);
          console.log('✅ Reports loaded:', reports);
          setPatientReports(reports || []);

          // ✅ LOGICA DE AUTO-AJUSTE (BLINDADA)
          console.log(`🔍 Revisando modo. URL Mode: ${modeParam}, Historial: ${reports.length}`);

          if (modeParam === 'alta') {
            // CASO 1: Usuario pidió ALTA explícitamente vía ?mode=alta
            if ((reports || []).length > 0) {
              setReportType('alta_paciente');
              toast.success('Modo Dossier de Alta activado.');
              console.log('🔴 ✅ CASO 1: Alta Dossier confirmado (tiene historial)');
            } else {
              console.error('Error: No se puede generar Alta sin historial.');
              toast.error('Error: No se puede generar Alta sin historial.');
              setReportType('primera_visita');
              console.log('🔴 ❌ CASO 1: Revertiendo a Primera Visita (sin historial)');
            }
          } 
          else if ((reports || []).length > 0) {
            // CASO 2: Tiene historial y no pidió alta -> Seguimiento
            setReportType('seguimiento');
            console.log('🟢 CASO 2: Auto-ajustado a Seguimiento (paciente tiene historial)');
          } 
          else {
            // CASO 3: Nuevo paciente -> Primera Visita
            setReportType('primera_visita');
            console.log('🟢 CASO 3: Auto-ajustado a Primera Visita (paciente nuevo)');
          }
        } else {
          console.error("Paciente no encontrado en DB");
        }
      } 
      catch (error) {
        console.error('Error loading patient:', error);
        toast.error('Error al cargar datos del paciente');
      } finally {
        setIsLoadingPatient(false);
      }
    };
    loadPatientAndReports();
  }, [user?.id, patientId, modeParam]); // ✅ Añadimos modeParam a dependencias

  // ✅ DESACTIVADO: Auto-transcripción - Ahora el usuario elige entre Guardar Audio o Transcribir
  /*
  useEffect(() => {
    const handleAutoTranscription = async () => {
      if (audioBlob && !isRecording && !isTranscribing) {
        await handleTranscribeAudio();
      }
    };
    handleAutoTranscription();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBlob, isRecording]);
  */

  // Nueva función para controlar el input de notas
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    // Límite Duro: No permitir escribir más allá de 20.000 caracteres
    if (newText.length <= MAX_NOTES_LENGTH) {
      setNotes(newText);
    }
  };

  // -------------------------------------------------------------------------
  // REGLA DE NEGOCIO: SOLO 1 FUENTE DE AUDIO (Grabación O Archivo)
  // -------------------------------------------------------------------------
  
  const handleStartRecording = async () => {
    // Verificar si ya hay archivo de audio subido
    const hasAudioFile = selectedFiles.some(f => f.type.startsWith('audio/') || f.name.match(/\.(mp3|wav|m4a|ogg)$/i));
    if (hasAudioFile) {
      toast.error('⚠️ Límite de Audio: Ya has subido un archivo de audio. Elimínalo para poder grabar.');
      return;
    }
    await startRecording();
  };

  const handleUploadFiles = (files: File[]) => {
    // 1. Verificar si estamos intentando subir audio
    const incomingAudio = files.some(f => f.type.startsWith('audio/') || f.name.match(/\.(mp3|wav|m4a|ogg)$/i));
    
    if (incomingAudio) {
       // 2. Verificar conflicto con grabación existente
       if (audioBlob) {
         toast.error('⚠️ Límite de Audio: Ya tienes una grabación activa. Elimínala/Bórrala para subir un archivo de audio.');
         return;
       }
       // 3. Verificar conflicto con otro archivo de audio ya subido
       const existingAudio = selectedFiles.some(f => f.type.startsWith('audio/') || f.name.match(/\.(mp3|wav|m4a|ogg)$/i));
       if (existingAudio) {
         toast.error('⚠️ Límite de Audio: Solo se permite 1 archivo de audio por sesión.');
         return;
       }
    }
    
    uploadFiles(files);
  };

  const handleTranscribeAudio = async (skipCharge = false) => {
    if (!audioBlob) {
      toast.error('No hay audio para transcribir');
      return;
    }
    try {
      console.log('🎤 Intentando transcribir audio con Whisper (Server Action)...');
      
      const formData = new FormData();
      formData.append('file', audioBlob, 'session_audio.wav');

      const result = await transcribeAudioAction(formData);
      
      if (!result.success || !result.text) {
        throw new Error(result.error || 'Transcripción fallida');
      }

      // ✅ COBRO DIFERIDO: Solo si éxito
      if (!skipCharge && user?.id) {
        const creditResult = await deductCredits(user.id, 1, 'Transcripción de Audio (Micrófono)');
        if (!creditResult.success) {
           console.warn('Transcripción exitosa pero falló el cobro:', creditResult.error);
        } else {
           toast.success('Audio transcrito correctamente (1 crédito deducido)');
        }
      } else if (!skipCharge) {
         // Si no hay user id?
      }

      setTranscription(result.text);
      setAiStatus('working');
      console.log('✅ Transcripción completada:', result.text.substring(0, 100) + '...');
      return result.text;

    } catch (error: unknown) {
      console.error('Error transcribing audio:', error);
      setAiStatus('fallback');
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      toast.error(`Error al transcribir el audio: ${errorMessage}`);
      return null;
    } finally {
      setIsTranscribing(false); // Usando tu estado original
    }
  };





  const [showNoCreditsDialog, setShowNoCreditsDialog] = useState<boolean>(false); // ✅ Nueva Modal Sin Créditos



  // ✅ NUEVO: Función para confirmar generación de informe desde AlertDialog
  const confirmGenerateReport = async () => {
    // 🛡️ SECURITY CHECK: Verificar saldo ANTES de llamar a la IA
    const currentCost = previewCost.totalCredits; // Usamos el cálculo live
    
    // ✅ FIX CRÍTICO FINAL: Server Action para consultar saldo
    // Evita problemas de RLS, Tokens locales o Cache.
    
    let realCredits = 0;
    
    try {
      const result = await checkUserCreditsAction();
      
      if (result.success && typeof result.credits === 'number') {
        realCredits = result.credits;
        console.log('💰 Saldo verificado en SERVER:', realCredits);
      } else {
        console.warn('⚠️ Fallo verificación Server:', result.error);
        // Fallback: Si falla el server, usamos profile local, y si no, 0.
        // PERO: Si falla el server, es arriesgado bloquear. Daremos beneficio de duda si profile tiene algo?
        // No, mejor safe: 
        realCredits = profile ? (profile.credits_limit || 0) - (profile.credits_used || 0) : 0;
      }
    } catch (err) {
       console.error('Error invocando Server Action:', err);
       realCredits = profile ? (profile.credits_limit || 0) - (profile.credits_used || 0) : 0; 
    }

    if (realCredits < currentCost) {
      // ❌ SIN SALDO -> DETECTADO
      // 🚨 EMERGENCY FIX: No bloqueamos. Si el sistema de verificación falla, dejamos pasar al usuario.
      // El cobro real se intentará al finalizar.
      console.warn(`⚠️ Pre-check de saldo falló (${realCredits} vs ${currentCost}) pero permitimos continuar (Fail Open).`);
      
      /* BLOQUEO DESACTIVADO POR INCIDENCIA DE PRODUCCIÓN
      toast.error(`Bloqueo de Seguridad: Saldo Insuficiente`, {
        description: `Sistema detecta: ${realCredits} créditos. Coste operación: ${currentCost}.`,
        duration: 5000,
      });
      setShowNoCreditsDialog(true);
      return; 
      */
    }

    setIsConfirmingReport(false);
    await handleGenerateReport();
  };

  const handleGenerateReport = async () => {
    if (!selectedPatient || !user) return;

    // ---------------------------------------------------------
    // FASE 0: CÁLCULO DE COSTES Y VALIDACIÓN
    // ---------------------------------------------------------
    
    const { totalCredits } = pricingService.calculateSessionCost({
      hasAudio: !!audioBlob || !!transcription,
      files: selectedFiles,
      reportType: reportType
    });
    // setTotalCredits(totalCredits); // State removed
    // setDetails(details); // State removed

    // 2. Validación básica de contenido (excepto Alta que usa historial)
    if (totalCredits === 0 && !notes.trim() && reportType !== 'alta_paciente') {
       toast.error('Debes aportar algún contenido (audio, notas o archivos) para generar un informe.');
       return;
    }

    // 3. Confirmación de coste - ELIMINADO (Ya se hace en el Dialog previo)
    
    setIsGenerating(true);
    setAiStatus('working');

    try {
      // 4. (COBRO MOVIDO AL FINAL)
      if (totalCredits > 0) {
         // Verificación de saldo final (si hubiese condiciones de carrera)
      }

      console.log(`🚀 Iniciando generación. Modo: ${reportType}`);
      
      // ---------------------------------------------------------
      // FASE 1: PREPARACIÓN DE DATOS
      // ---------------------------------------------------------
      const dateStr = new Date().toISOString().split('T')[0];
      
      // Título dinámico
      let reportTitle = '';
      if (reportType === 'alta_paciente') {
        reportTitle = `DOSSIER DE ALTA - ${selectedPatient.name} - ${dateStr}`;
      } else {
        reportTitle = `${getReportTypeLabel(reportType)} - ${selectedPatient.name} - ${dateStr}`;
      }

      // Contexto de Archivos (Lectura)
      let filesContext = '';
      if (selectedFiles.length > 0) {
        const filePromises = selectedFiles.map(async (file) => {
          try {
            // ARCHIVOS DE AUDIO
            if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|m4a|ogg)$/i)) {
              try {
                // Convertir File a FormData para Server Action
                const formData = new FormData();
                formData.append('file', file, file.name || 'audio_file.wav');
                
                const result = await transcribeAudioAction(formData);
                if (!result.success) throw new Error(result.error);
                
                return `--- Archivo de Audio Transcrito: ${file.name} ---\n${result.text}\n`;
              } catch (audioError) {
                console.error(`Error transcribiendo: ${audioError}`);
                return `--- Error transcribiendo archivo de audio: ${file.name} ---\n`;
              }
            }
            // ARCHIVOS DE TEXTO
            else if (file.type === 'text/plain' || file.name.match(/\.(txt|md|csv|json)$/i)) {
              const text = await file.text();
              return `--- Archivo de Texto: ${file.name} ---\nContenido:\n${text}\n`;
            }
            // OTROS
            else {
              return `--- Archivo Adjunto: ${file.name} (Tipo: ${file.type}) ---\n`;
            }
          } catch (fileError) {
            console.error(`Error procesando archivo ${file.name}:`, fileError);
            return `--- Error procesando archivo: ${file.name} ---\n`;
          }
        });
        
        const processedFiles = await Promise.all(filePromises);
        filesContext = processedFiles.join('\n');
      }

      // ---------------------------------------------------------
      // FASE 1.5: TRANSCRIPCIÓN AUTOMÁTICA SI PENDIENTE
      // ---------------------------------------------------------
      let finalTranscription = transcription;
      if (audioBlob && !transcription) {
        console.log('🎙️ Audio detectado sin transcribir. Iniciando transcripción automática (ya cobrada en el total)...');
        try {
          const autoTranscribed = await handleTranscribeAudio(true); // skipCharge = true
          if (autoTranscribed) {
            finalTranscription = autoTranscribed;
          } else {
            console.warn('⚠️ Transcripción automática falló o retornó vacío.');
            toast.warning('El audio no se pudo transcribir, el report se generará sin él.');
          }
        } catch (err) {
          console.error('Error en transcripción automática:', err);
        }
      }

      const sessionData = {
        audioTranscription: finalTranscription || undefined,
        clinicalNotes: notes.trim(),
        filesContext: filesContext,
        sessionDate: dateStr,
      };

      // ---------------------------------------------------------
      // FASE 2: HISTORIAL CLÍNICO (Diferenciado)
      // ---------------------------------------------------------
      let reportsToAnalyze: string[] = [];
      
      if (reportType === 'alta_paciente') {
        // ALTA: Recuperamos TODO el historial ordenado
        console.log('📚 MODO ALTA: Recopilando historial completo...');
        reportsToAnalyze = patientReports
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map(r => `[FECHA: ${new Date(r.created_at).toLocaleDateString()}] - TIPO: ${r.title}\n${r.content || 'Sin contenido'}`);
      } else if (reportType === 'seguimiento') {
        // SEGUIMIENTO: Solo últimos 3 para contexto
        reportsToAnalyze = patientReports.map(r => r.content || '').slice(0, 3);
      }

      // ---------------------------------------------------------
      // FASE 3: LLAMADA A LA IA (OpenRouter)
      // ---------------------------------------------------------
      console.log('🤖 Enviando datos a OpenRouter...');
      
      // Mapeo correcto de los 3 tipos
      let openRouterType: 'nuevo_paciente' | 'seguimiento' | 'alta_paciente';
      if (reportType === 'primera_visita') openRouterType = 'nuevo_paciente';
      else if (reportType === 'alta_paciente') openRouterType = 'alta_paciente';
      else openRouterType = 'seguimiento';

      // ---------------------------------------------------------
      // 🛡️ CAPA DE PRIVACIDAD (Cálculo de Alias)
      // ---------------------------------------------------------
      const age = selectedPatient.birth_date ? calculateAge(selectedPatient.birth_date) : '?';
      const genderMap: Record<string, string> = {
        'femenino': 'Mujer',
        'masculino': 'Hombre',
        'mujer': 'Mujer',
        'hombre': 'Hombre',
        'niño': 'Niño',
        'niña': 'Niña'
      };
      // Recuperar género (si existe en objeto paciente, sino fallback)
      const pGender = (selectedPatient as unknown as { gender?: string }).gender || 'Paciente'; 
      const genderTerm = genderMap[pGender?.toLowerCase()] || pGender;
      
      let finalGender = genderTerm;
      if (typeof age === 'number' && age < 18) {
         if (finalGender === 'Mujer') finalGender = 'Niña';
         if (finalGender === 'Hombre') finalGender = 'Niño';
      }
      const anonymizedAlias = `${finalGender} de ${age} años`;

      const compiledInfo = await openRouterService.compileReportInfo({
        reportType: openRouterType,
        patientData: {
          alias: anonymizedAlias, // ✅ ENVÍO SOLO EL ALIAS
          age: typeof age === 'number' ? age : undefined,
          previousReports: reportsToAnalyze,
          firstVisitDate: selectedPatient.created_at || undefined,
        },
        sessionData,
      });

      const actionResult = await generateReportAction(compiledInfo, openRouterType);

      if (!actionResult.success || !actionResult.text) {
        throw new Error(actionResult.error || "La IA no devolvió resultados.");
      }
      
      const aiContent = actionResult.text;
      
      if (aiContent.length < 100) {
        throw new Error('La IA devolvió un informe demasiado corto o vacío.');
      }
      
      setAiStatus('working');

      // ---------------------------------------------------------
      // FASE 4: CONSTRUCCIÓN DEL DOCUMENTO FINAL
      // ---------------------------------------------------------
      let finalDocumentContent = '';

      if (reportType === 'alta_paciente') {
        // ESTRUCTURA DOSSIER COMPLETO
        finalDocumentContent = `
# DOSSIER CLÍNICO DE ALTA
Paciente: ${selectedPatient.name}
Fecha de Emisión: ${dateStr}

================================================================
PARTE I: INFORME DE SÍNTESIS Y CIERRE
================================================================
${aiContent}

================================================================
PARTE II: ANEXO DOCUMENTAL (HISTORIAL COMPLETO)
================================================================
A continuación se adjunta el historial clínico completo del paciente:

${reportsToAnalyze.join('\n\n------------------------------------------------\n\n')}
`;
      } else {
        // ESTRUCTURA ESTÁNDAR (Sesión)
        finalDocumentContent = `
# REGISTRO DE SESIÓN CLÍNICA
Paciente: ${selectedPatient.name}
Fecha: ${dateStr}

## TRANSCRIPCIÓN / NOTAS
${transcription || '(Sin audio)'}
${notes || ''}

---
## INFORME CLÍNICO
${aiContent}
`;
      }

      // ---------------------------------------------------------
      // FASE 5: GUARDADO (Drive + DB)
      // ---------------------------------------------------------
      console.log('💾 Guardando en Google Drive...');
      
      const driveResult = await googleDriveService.createPatientReport(
        reportTitle,
        finalDocumentContent,
        selectedPatient.name,
        selectedPatient.id
      );

      if (!driveResult.success) throw new Error(`Fallo Drive: ${driveResult.message}`);

      console.log('💽 Guardando en Supabase...');
      await reportsService.create({
        user_id: user!.id,
        patient_id: selectedPatient.id,
        title: reportTitle,
        content: aiContent, // En DB guardamos la síntesis limpia
        report_type: reportType,
        input_type: 'mixed',
        google_drive_file_id: driveResult.fileId,
        status: 'completed',
        audio_transcription: transcription || undefined
      });

      // ---------------------------------------------------------
      // FASE 5.5: COBRO DIFERIDO (Solo si todo lo anterior funciona)
      // ---------------------------------------------------------
      if (totalCredits > 0) {
        console.log(`💰 Cobrando ${totalCredits} créditos tras éxito...`);
        const creditResult = await deductCredits(user.id, totalCredits, `Informe: ${getReportTypeLabel(reportType)}`);
        
        if (!creditResult.success) {
           // Si falla el cobro pero ya entregamos el servicio, lo logueamos como error crítico pero NO borramos el trabajo.
           console.error('CRITICAL: Informe generado pero cobro fallido:', creditResult.error);
           // Opcional: toast.error('Informe generado, pero hubo un error al actualizar tu saldo.');
        } else {
           toast.success(`Se han descontado ${totalCredits} créditos.`);
        }
      }

      // ---------------------------------------------------------
      // FASE 6: REFRESCO DE LISTA (Todos los modos)
      // ---------------------------------------------------------
      // Pequeño delay para asegurar consistencia antes de recargar lista
      await new Promise(resolve => setTimeout(resolve, 500));
      const refreshedReports = await reportsService.getByPatient(selectedPatient.id);
      setPatientReports(refreshedReports);
      console.log('🔄 Lista de informes actualizada. Total:', refreshedReports.length);

      // ---------------------------------------------------------
      // FASE 7: LIMPIEZA DE DUPLICADOS (Solo Alta)
      // ---------------------------------------------------------
      if (reportType === 'alta_paciente') {
        toast.info('Finalizando Alta: Limpiando informes parciales...');
        
        const deletePromises = patientReports.map(async (r) => {
          if (r.google_drive_file_id) {
            try {
              return await googleDriveService.deleteFile(r.google_drive_file_id);
            } catch (deleteError) {
              console.warn(`No se pudo eliminar ${r.title}:`, deleteError);
              return false;
            }
          }
          return false;
        });
        
        await Promise.all(deletePromises);
        toast.success('✨ Dossier generado y carpeta optimizada.');
      } else {
        toast.success('✅ Informe guardado correctamente.');
      }

      // Limpieza de formulario
      // setGeneratedReportId(newReport.id); // State removed
      setNotes('');
      setTranscription('');
      clearFiles();
      if (deleteRecording) deleteRecording();

    } catch (error: unknown) {
      console.error('❌ Error generando informe:', error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isDriveError = errorMessage.includes('permisos de Google Drive') || errorMessage.includes('No hay provider_token');
      
      if (isDriveError) {
        setDriveStatus('no-permissions'); // Set status
        toast.error('Sesión de Google caducada o sin permisos.', {
          description: 'Por favor, cierra sesión y vuelve a entrar con Google (marcando las casillas de Drive).',
          duration: 10000,
          action: {
            label: 'Re-autenticar',
            onClick: async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }
          }
        });
      } else {
        toast.error(errorMessage || 'Error desconocido');
      }
      
      setAiStatus('fallback');
    } finally {
      setIsGenerating(false);
    }
  };





  const getTotalContent = () => {
    const parts = [];
    if (notes.trim()) parts.push(`Notas (${notes.length} chars)`);
    if (transcription.trim()) parts.push(`Transcripción (${transcription.length} chars)`);
    else if (audioBlob) parts.push(`Audio grabado pendiente de procesar`); // ✅ AVISO DE AUDIO PENDIENTE
    if (selectedFiles.length > 0) parts.push(`${selectedFiles.length} archivos`);
    return parts.join(' + ') || 'Sin contenido';
  };





  if (isLoadingPatient) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando datos del paciente...</p>
        </div>
      </div>
    );
  }

  if (!selectedPatient) {
    return (
      <>
        <div className="container mx-auto max-w-6xl px-6 py-8">
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Paciente no encontrado</h3>
            <p className="text-muted-foreground mb-6">
              El paciente especificado no existe o no tienes acceso a él.
            </p>
            {/* ✅ CORRECCIÓN 6: Cambiado navigate() por router.push() */}
            <Button onClick={() => router.push('/patient-list')}>Volver a lista de pacientes</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto max-w-6xl px-6 py-8 space-y-8">
        <div className="text-center relative">
          <h1 className="font-lora text-3xl font-bold mb-2">Registro de Sesión - {selectedPatient.name}</h1>
          <div className="absolute top-0 right-0 hidden md:block">
            <Link href={`/patients/${patientId}`}>
               <Button variant="outline" className="gap-2">
                 <UserIcon className="h-4 w-4" /> Ver Ficha
               </Button>
            </Link>
          </div>
          {/* Mobile Button */}
           <div className="md:hidden mt-4">
            <Link href={`/patients/${patientId}`}>
               <Button variant="outline" className="gap-2 w-full">
                 <UserIcon className="h-4 w-4" /> Ver Ficha
               </Button>
            </Link>
          </div>
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
                    <button
                      onClick={isRecording ?
                      stopRecording : handleStartRecording}
                      disabled={isTranscribing}
                      className="btn-neumorphic flex items-center justify-center"
                      style={{ minWidth: '250px' }}
                    >
           
                      {isRecording ?
                      (
                        <>
                          <Square className="w-4 h-4 mr-2" />
                          DETENER GRABACIÓN
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          INICIAR GRABACIÓN
                        </>
                      )}
                    </button>

                    {isRecording && (
  
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="font-mono text-lg font-semibold">{recordingTime}</span>
                     
                      </div>
                    )}

                    {isTranscribing && ( // Usando tu estado original
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full 
                        animate-spin"></div>
                        <span className="text-sm">
                          {aiStatus === 'working' ?
                          'Transcribiendo con Whisper...' : 'Procesando audio...'}
                        </span>
                      </div>
                    )}
                  </div>

           
                  {audioBlob && !isRecording && (
                    <Card className="border-blue-100 bg-blue-50/50">
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
       
                            <Button variant="outline" size="sm" onClick={playRecording} aria-label="Reproducir grabación">
                              <Play className="w-4 h-4" />
                            </Button>
                
                            <Button variant="outline" size="sm" onClick={deleteRecording} aria-label="Eliminar grabación">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                       

                          </div>
                          </div>

                      </CardContent>
                    </Card>
                  )}

                  <div className="mt-4">
                    <FileUploadZone
                      files={selectedFiles}
                      onFilesSelected={handleUploadFiles}
                      onFileRemove={removeFile}
                      acceptedTypes=".wav,.mp3,.m4a,.txt,.pdf,.doc,.docx"
                      maxFiles={10}
                    />
                  </div>

             
                  {transcription && (
                    <Card className={transcription.includes('Pendiente transcripción manual') ?
                    'border-yellow-200 bg-yellow-50' : 'border-blue-200 bg-blue-50'}>
                      <CardContent className="p-4">
                        <h4 className={`font-medium mb-2 ${transcription.includes('Pendiente transcripción manual') ?
                        'text-yellow-800' : 'text-blue-800'}`}>
                          {transcription.includes('Pendiente transcripción manual') ?
                          'Información del Audio' : 'Transcripción Automática'}
                        </h4>
                        <p className={`text-sm max-h-32 overflow-y-auto ${transcription.includes('Pendiente transcripción manual') ?
                        'text-yellow-700' : 'text-blue-700'}`}>
                          {transcription}
                        </p>
                      </CardContent>
                    </Card>
      
                  )}
                </div>

                {/* SECCIÓN DE NOTAS CLÍNICAS CON PROTECCIÓN DE TOKENS */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Notas Clínicas</label>
                    <span 
                      className={`text-xs transition-colors duration-200 ${
                        notes.length > WARNING_NOTES_LENGTH 
                          ? 'text-yellow-600 font-bold' 
                          : 'text-muted-foreground'
                      }`}
                    >
                      {notes.length} / {MAX_NOTES_LENGTH} caracteres
                    </span>
                  </div>
                  
                  <Textarea
                    placeholder="Observaciones clínicas, contexto de la sesión, notas importantes..."
                    value={notes}
                    onChange={handleNotesChange}
                    className={`min-h-[150px] resize-none transition-all duration-200 ${
                      notes.length > WARNING_NOTES_LENGTH 
                        ? 'border-yellow-400 focus-visible:ring-yellow-400 bg-yellow-50/30' 
                        : ''
                    }`}
                  />

                  {/* Zona Amarilla: Advertencia de abuso/optimización */}
                  {notes.length > WARNING_NOTES_LENGTH && (
                    <div className="flex items-start gap-2 p-2 bg-yellow-50 text-yellow-800 text-xs rounded-md border border-yellow-200 animate-in fade-in slide-in-from-top-1">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>
                        <strong>Texto muy extenso:</strong> Estás escribiendo mucho contenido. 
                        Para asegurar la mejor calidad de análisis y evitar costes extra, 
                        te recomendamos subir este texto como un <strong>archivo adjunto</strong> (.txt o .docx) en la sección inferior.
                      </p>
                    </div>
                  )}
                </div>
                {/* FIN SECCIÓN NOTAS */}
  
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Contenido del informe:</strong> {getTotalContent()}
                  </p>

                </div>
              </CardContent>
            </Card>

            {/* --- BLOQUE DE GENERACIÓN --- */}
            <div className="flex justify-center mt-6">
              {isGenerating ? (
                 <PianoLoader />
              ) : (
                <AlertDialog open={isConfirmingReport} onOpenChange={setIsConfirmingReport}>
                  <Button
                    type="button"
                    onClick={() => setIsConfirmingReport(true)}
                    disabled={isGenerating || isTranscribing}
                    className={`flex items-center justify-center ${
                      reportType === 'alta_paciente' 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white ring-2 ring-purple-200' 
                        : 'btn-neumorphic'
                    }`}
                    style={{ minWidth: '250px' }}
                  >
                    {reportType === 'alta_paciente' ? (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Generar Dossier de Alta
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generar Informe Clínico
                      </>
                    )}
                  </Button>
                  

                  {/* AlertDialog de confirmación */}
                  {/* AlertDialog de confirmación (REFINED NEUMORPHIC - SUBTLE & GRAY) */}
                  <AlertDialogContent className="bg-[#FBF9F6] border-none shadow-xl max-w-lg">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-lora text-xl text-[#2E403B]">
                        Confirmar Generación de Informe
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground space-y-4 pt-2">
                        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                          {/* Resumen de Archivos y Coste - Diseño unificado */}
                          <div className="flex items-center justify-between text-sm bg-blue-50 p-3 rounded-md">
                            <div className="flex items-center gap-2 text-blue-800">
                               <FileText className="w-4 h-4" />
                               <span>
                                 {selectedFiles.length > 0 
                                   ? `${selectedFiles.length} archivo(s) adjunto(s)` 
                                   : 'Sin archivos adjuntos'}
                               </span>
                            </div>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none font-semibold">
                              {previewCost.totalCredits} Crédito{previewCost.totalCredits !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Al confirmar, se procesará la información y se descontarán los créditos de tu saldo.
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 mt-4">
                      <AlertDialogCancel onClick={() => setIsConfirmingReport(false)}>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={confirmGenerateReport}
                        className="bg-[#2E403B] hover:bg-[#1a2623] text-white font-medium"
                      >
                        Confirmar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              
              {/* ✅ MODAL SALDO INSUFICIENTE (NUEVO) */}


              {/* ✅ MODAL SALDO INSUFICIENTE (NUEVO) */}
              <AlertDialog open={showNoCreditsDialog} onOpenChange={setShowNoCreditsDialog}>
                <AlertDialogContent className="bg-white border-none shadow-2xl max-w-md">
                   <AlertDialogHeader className="text-center">
                      {/* LOGO BRAND */}
                      <div className="flex justify-center mb-2">
                         <h1 className="font-serif text-2xl font-medium text-[#2E403B]">iNFORiA</h1>
                      </div>
                      
                      <AlertDialogTitle className="text-xl font-bold text-gray-800 text-center">
                         No detengas tu flujo de trabajo
                      </AlertDialogTitle>
                      
                      <AlertDialogDescription className="text-base text-gray-600 text-center pt-2">
                        La burocracia no debería interrumpir tu labor clínica. Reactiva tu capacidad de generar informes inmediatos y mantén tu foco donde realmente importa: tus pacientes.
                      </AlertDialogDescription>
                   </AlertDialogHeader>

                   <AlertDialogFooter className="flex-col sm:justify-center gap-3 mt-4">
                      {/* CTA PRINCIPAL */}
                      <div className="w-full">
                          <Button 
                            className="w-full bg-[#2E403B] hover:bg-[#1a2623] text-white text-lg py-6 shadow-lg hover:shadow-xl transition-all"
                            onClick={() => {
                              window.open('https://inforia.pro/#pricing', '_blank');
                              setShowNoCreditsDialog(false);
                            }}
                          >
                            Recuperar mi Paz Mental <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                          {/* Microcopy */}
                          <p className="text-[11px] text-gray-400 text-center mt-2 font-medium tracking-wide uppercase">
                            Activación inmediata y segura
                          </p>
                      </div>
                      
                      {/* Opciones Secundarias */}
                      <div className="flex justify-between w-full gap-2 mt-2">
                         <Button 
                            variant="ghost" 
                            className="flex-1 text-xs text-gray-400 hover:text-gray-600"
                            onClick={() => setShowNoCreditsDialog(false)}
                         >
                            Cancelar
                         </Button>
                         <Button 
                            variant="ghost" 
                            className="flex-1 text-xs text-gray-400 hover:text-gray-600"
                            onClick={() => window.location.href = 'mailto:soporte@inforia.pro'}
                         >
                            Contactar Soporte
                         </Button>
                      </div>
                   </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            {/* --- FIN DE BLOQUE --- */}

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
                  {patientReports.length > 0 ?
                  (
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
                            <Badge variant={report.status === 'completed' ?
                            'default' : 'secondary'} className="text-xs">
                              {report.status === 'completed' ?
                              'Completado' : 'Borrador'}
                            </Badge>
                            {report.google_drive_file_id && (
                              <a
                                href={`https://docs.google.com/document/d/${report.google_drive_file_id}/edit`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 transition-colors"
                                title="Abrir informe en Google Drive" aria-label="Abrir informe en Google Drive"
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