"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Mic, Save, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// 1. Importar las nuevas Server Actions
import { generateReport, saveReportToGoogleDrive } from "../actions";

// Componente interno que usa useSearchParams
function ReportWorkspaceContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId'); // Lee el paciente de la URL

  // 2. Añadir estados de transición para la carga
  const [isTranscribing, _startTranscription] = useTransition();
  const [isGenerating, startGeneration] = useTransition();
  const [isSaving, startSaving] = useTransition();

  const [transcription, setTranscription] = useState("");
  const [reportDraft, setReportDraft] = useState("");
  
  // Plantilla de ejemplo
  const template = "Evolución del Paciente:\nMotivo de Consulta:\nPróximos Pasos:\n";

  // 4. Refactorizar el manejador de generación
  const handleGenerateReport = () => {
    if (!transcription) {
      toast({ title: "Falta la transcripción", variant: "destructive" });
      return;
    }
    
    startGeneration(async () => {
      const result = await generateReport(transcription, template);
      if (result.success) {
        setReportDraft(result.data);
        toast({ title: "Borrador de informe generado" });
      } else {
        toast({ title: "Error de generación", description: result.error, variant: "destructive" });
      }
    });
  };

  // 5. Refactorizar el manejador de guardado
  const handleSaveReport = () => {
    if (!reportDraft) {
      toast({ title: "No hay borrador para guardar", variant: "destructive" });
      return;
    }
    
    const fileName = `Informe_${patientId || 'General'}_${new Date().toISOString().split('T')[0]}.txt`;

    startSaving(async () => {
      const result = await saveReportToGoogleDrive(fileName, reportDraft, "text/plain");
      if (result.success) {
        toast({ title: "Informe guardado", description: `Archivo ID: ${result.data}` });
      } else {
        toast({ title: "Error al guardar", description: result.error, variant: "destructive" });
      }
    });
  };

  return (
    <main className="container mx-auto px-6 py-8">
      <h1 className="font-serif text-3xl font-semibold text-primary mb-4">
        Motor de Informes (Paciente: {patientId || "No seleccionado"})
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna de Entrada (Transcripción) */}
        <div className="space-y-4">
          <Button onClick={() => { /* Lógica de UI para 'handleAudioUpload' */ }} disabled={isTranscribing}>
            {isTranscribing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mic className="mr-2 h-4 w-4" />
            )}
            {isTranscribing ? "Transcribiendo..." : "Grabar o Subir Audio"}
          </Button>
          <Textarea
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            placeholder="La transcripción de la sesión aparecerá aquí..."
            rows={15}
            disabled={isTranscribing}
          />
        </div>

        {/* Columna de Salida (Informe) */}
        <div className="space-y-4">
          <Button onClick={handleGenerateReport} disabled={isGenerating || !transcription}>
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Bot className="mr-2 h-4 w-4" />
            )}
            {isGenerating ? "Generando..." : "Generar Borrador"}
          </Button>
          <Textarea
            value={reportDraft}
            onChange={(e) => setReportDraft(e.target.value)}
            placeholder="El borrador del informe generado por la IA aparecerá aquí..."
            rows={15}
            disabled={isGenerating}
          />
        </div>
      </div>

      {/* Botón de Guardar */}
      <div className="mt-6 flex justify-end">
        <Button size="lg" onClick={handleSaveReport} disabled={isSaving || !reportDraft}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isSaving ? "Guardando en Google Drive..." : "Guardar en Google Drive"}
        </Button>
      </div>
    </main>
  );
}

// Componente página que envuelve el contenido con Suspense
export default function ReportWorkspacePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Cargando...</div>}>
      <ReportWorkspaceContent />
    </Suspense>
  );
}
