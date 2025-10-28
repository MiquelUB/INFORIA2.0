// src/components/ReportGenerator.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, FileText, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReportGeneratorProps {
  patientId: string;
  patientName: string;
  onReportGenerated: () => void;
}

export default function ReportGenerator({ 
  patientId, 
  patientName, 
  onReportGenerated 
}: ReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState<string>('');
  const [sessionNotes, setSessionNotes] = useState<string>('');

  const handleGenerateReport = async () => {
    if (!reportType || !sessionNotes.trim()) {
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simular generación de reporte
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aquí iría la lógica real de generación
      console.log('Generando reporte para:', {
        patientId,
        patientName,
        reportType,
        sessionNotes
      });
      
      onReportGenerated();
    } catch (error) {
      console.error('Error generando reporte:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generador de Informes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tipo de informe */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo de informe</label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el tipo de informe..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primera_visita">Primera Visita</SelectItem>
              <SelectItem value="seguimiento">Seguimiento</SelectItem>
              <SelectItem value="alta">Alta Médica</SelectItem>
              <SelectItem value="evaluacion">Evaluación Psicológica</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notas de la sesión */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Notas de la sesión con {patientName}
          </label>
          <Textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="Describe los puntos clave de la sesión, observaciones, evolución del paciente, etc."
            className="min-h-[120px]"
          />
        </div>

        {/* Información del paciente */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            El informe incluirá automáticamente los datos del paciente y sesiones anteriores del historial.
          </AlertDescription>
        </Alert>

        {/* Botón de generación */}
        <Button 
          onClick={handleGenerateReport}
          disabled={isGenerating || !reportType || !sessionNotes.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generando informe...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Generar Informe Profesional
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// Export adicional para compatibilidad
export { ReportGenerator };