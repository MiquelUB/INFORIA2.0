// Ruta: src/components/VoiceRecorder.tsx
import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, Square, Upload, Play, Pause, FileAudio, Trash2, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, recordingType: 'realtime' | 'upload') => void;
  isDisabled?: boolean;
  onTranscriptionStart?: () => void;
  className?: string;
}

export function VoiceRecorder({
  onRecordingComplete,
  isDisabled = false,
  onTranscriptionStart,
  className
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Iniciar grabación en tiempo real
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      audioChunksRef.current = [];
      setRecordingTime(0);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm;codecs=opus' 
        });
        setAudioBlob(audioBlob);
        setRecordingDuration(formatTime(recordingTime));
        onRecordingComplete(audioBlob, 'realtime');
        stream.getTracks().forEach(track => track.stop());
        
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);

      // Contador de tiempo
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('🎤 Grabación iniciada - Habla claramente');
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('❌ Error de micrófono. Verifica los permisos del navegador.');
    }
  }, [onRecordingComplete, recordingTime]);

  // Detener grabación
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      if (onTranscriptionStart) {
        onTranscriptionStart();
      }
      
      toast.success(`✅ Grabación finalizada - Duración: ${formatTime(recordingTime)}`);
    }
  }, [isRecording, recordingTime, onTranscriptionStart]);

  // Manejar upload de archivo
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/m4a', 'audio/webm', 'audio/ogg', 'audio/mpeg'];
    if (!allowedTypes.some(type => file.type.includes(type.split('/')[1]))) {
      toast.error('❌ Formato no soportado. Usa: WAV, MP3, M4A, WebM, OGG');
      return;
    }

    // Validar tamaño (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      toast.error('❌ Archivo muy grande. Máximo 25MB');
      return;
    }

    setAudioBlob(file);
    const duration = formatFileSize(file.size);
    setRecordingDuration(duration);
    onRecordingComplete(file, 'upload');
    
    if (onTranscriptionStart) {
      onTranscriptionStart();
    }
    
    toast.success(`📁 ${file.name} cargado correctamente`);

    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onRecordingComplete, onTranscriptionStart]);

  // Reproducir audio
  const togglePlayback = useCallback(() => {
    if (!audioBlob) return;

    if (isPlaying && audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioElementRef.current = new Audio(audioUrl);
      
      audioElementRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audioElementRef.current.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        toast.error('❌ Error al reproducir el audio');
      };
      
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  }, [audioBlob, isPlaying]);

  // Eliminar grabación
  const deleteRecording = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    setAudioBlob(null);
    setIsPlaying(false);
    setRecordingDuration('');
    toast.success('🗑️ Grabación eliminada');
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Grabación de Sesión
        </CardTitle>
        <CardDescription>
          Graba en tiempo real o carga un archivo de audio existente
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Indicador de estado de grabación */}
        {isRecording && (
          <Alert>
            <Volume2 className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>🔴 Grabando sesión...</span>
              <span className="font-mono font-bold text-red-600">
                {formatTime(recordingTime)}
              </span>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Grabación en tiempo real */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              🎙️ Grabación en Tiempo Real
            </h4>
            {!isRecording ? (
              <Button
                onClick={startRecording}
                disabled={isDisabled}
                className="w-full gap-2"
                variant="default"
              >
                <Mic className="h-4 w-4" />
                Iniciar Grabación
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                className="w-full gap-2"
                variant="destructive"
              >
                <Square className="h-4 w-4" />
                Detener Grabación
              </Button>
            )}
          </div>

          {/* Upload de archivo */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              📁 Cargar Archivo de Audio
            </h4>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isDisabled}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isDisabled}
              className="w-full gap-2"
              variant="outline"
            >
              <Upload className="h-4 w-4" />
              Seleccionar Archivo
            </Button>
          </div>
        </div>

        {/* Controles de audio grabado */}
        {audioBlob && (
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileAudio className="h-4 w-4" />
                <span className="text-sm font-medium">Audio grabado</span>
                <span className="text-xs text-muted-foreground">
                  ({recordingDuration})
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={togglePlayback}
                >
                  {isPlaying ? (
                    <Pause className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={deleteRecording}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}