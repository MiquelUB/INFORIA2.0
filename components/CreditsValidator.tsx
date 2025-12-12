'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { creditsValidator, ValidationResult } from '@/lib/services/creditsValidator';
import { toast } from 'sonner';

export function CreditsValidator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);

  const handleValidateCredits = async () => {
    setLoading(true);
    try {
      const validationResult = await creditsValidator.validateUserCredits();
      setResult(validationResult);
      creditsValidator.printReport(validationResult);
      
      if (validationResult.success) {
        toast.success(validationResult.message);
      } else {
        toast.error(validationResult.message);
      }
    } catch (error) {
      toast.error('Error durante la validación');
    } finally {
      setLoading(false);
    }
  };

  const handleTestDecrement = async () => {
    setLoading(true);
    try {
      const testResult = await creditsValidator.testCreditDecrement();
      setResult(testResult);
      creditsValidator.printReport(testResult);
      
      if (testResult.success) {
        toast.success(testResult.message);
      } else {
        toast.error(testResult.message);
      }
    } catch (error) {
      toast.error('Error durante el test de descuento');
    } finally {
      setLoading(false);
    }
  };

  const handleGetReport = async () => {
    setLoading(true);
    try {
      const report = await creditsValidator.getCreditsReport();
      setResult(report);
      creditsValidator.printReport(report);
      
      if (report.success) {
        toast.success(report.message);
      }
    } catch (error) {
      toast.error('Error al obtener el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>🧪 Validador de Créditos</CardTitle>
        <CardDescription>
          Herramienta de debug para verificar el sistema de créditos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={handleValidateCredits}
            disabled={loading}
            className="btn-neumorphic"
          >
            {loading ? 'Validando...' : 'Validar Créditos'}
          </Button>
          
          <Button 
            onClick={handleTestDecrement}
            disabled={loading}
            className="btn-neumorphic"
          >
            {loading ? 'Testeando...' : 'Test Descuento'}
          </Button>

          <Button 
            onClick={handleGetReport}
            disabled={loading}
            className="btn-neumorphic"
          >
            {loading ? 'Obteniendo...' : 'Reporte Completo'}
          </Button>
        </div>

        {result && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={result.success ? 'default' : 'destructive'}>
                {result.success ? '✅ Exitoso' : '❌ Fallido'}
              </Badge>
              <p className="font-medium">{result.message}</p>
            </div>

            <div className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
              <pre className="text-xs font-mono">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </div>

            <div className="text-xs text-muted-foreground">
              💡 Abre la consola del navegador (F12) para ver más detalles
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
