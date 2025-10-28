import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Mic, MicOff, FileText, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { usePatients } from "@/hooks/usePatients";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const ReportModule = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [reportType, setReportType] = useState<string>("seguimiento");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string>("");
  
  const { data: patients = [] } = usePatients();
  const { toast } = useToast();

  const handleStartRecording = () => {
    setIsRecording(true);
    // TODO: Implementar grabación de audio con Web API
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // TODO: Procesar audio y convertir a texto
  };

  const handleGenerateReport = async () => {
    if (!selectedPatient || !notes.trim()) {
      toast({
        title: "Error",
        description: "Selecciona un paciente y añade notas de la sesión",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedReport("");

    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          patientId: selectedPatient,
          sessionNotes: notes,
          reportType: reportType
        }
      });

      if (error) throw error;

      setGeneratedReport(data.content);
      toast({
        title: "Informe generado",
        description: "El informe se ha generado y guardado correctamente",
      });
      
      // Limpiar el formulario
      setNotes("");
      setSelectedPatient("");
      setReportType("seguimiento");
      
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Error al generar el informe. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <CardTitle>Generar Informe IA</CardTitle>
        </div>
        <CardDescription>
          Crea informes clínicos profesionales con asistencia de IA
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Selección de Paciente */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Paciente
          </label>
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un paciente" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tipo de Informe */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Tipo de Informe
          </label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primera_visita">Primera Visita</SelectItem>
              <SelectItem value="seguimiento">Seguimiento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Input de Notas */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Notas de la Sesión
          </label>
          <Textarea
            placeholder="Escribe las notas de la sesión o utiliza la grabación de voz..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[120px] resize-none"
          />
        </div>

        {/* Controles de Grabación */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onClick={isRecording ? handleStopRecording : handleStartRecording}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  Detener
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Grabar
                </>
              )}
            </Button>
            {isRecording && (
              <span className="text-sm text-muted-foreground animate-pulse">
                Grabando...
              </span>
            )}
          </div>

          {/* Botón Generar Informe */}
          <Button 
            onClick={handleGenerateReport}
            disabled={!notes.trim() || !selectedPatient || isGenerating}
            className="bg-primary hover:bg-primary/90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Generar Informe
              </>
            )}
          </Button>
        </div>

        {/* Informe Generado */}
        {generatedReport && (
          <div className="space-y-2 mt-6 p-4 bg-muted/50 rounded-lg">
            <label className="text-sm font-medium text-foreground">
              Informe Generado
            </label>
            <div className="bg-background p-4 rounded-md border text-sm whitespace-pre-wrap">
              {generatedReport}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};