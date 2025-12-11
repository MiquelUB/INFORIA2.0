'use client';

import { CreditsValidator } from '@/components/CreditsValidator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreditsTestPage() {
  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <div className="grid gap-6 max-w-2xl">
        <CreditsValidator />

        <Card>
          <CardHeader>
            <CardTitle>📋 Guía de Validación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">✅ Validar Créditos</h3>
              <p className="text-sm text-muted-foreground">
                Verifica que:
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>El usuario está autenticado</li>
                  <li>El perfil existe en la BD</li>
                  <li>Existen los campos credits_limit y credits_used</li>
                  <li>Los valores son válidos (números)</li>
                </ul>
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">🧪 Test Descuento</h3>
              <p className="text-sm text-muted-foreground">
                Realiza un test reversible que:
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Descuenta 1 crédito</li>
                  <li>Verifica que se aplicó correctamente</li>
                  <li>Revierte el cambio (no es destructivo)</li>
                </ul>
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">📊 Reporte Completo</h3>
              <p className="text-sm text-muted-foreground">
                Muestra:
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Créditos totales (limit)</li>
                  <li>Créditos usados</li>
                  <li>Créditos disponibles</li>
                  <li>Porcentaje de uso</li>
                  <li>Plan del usuario</li>
                </ul>
              </p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-mono">
                💡 Consola: Presiona F12 y abre la pestaña "Console" para ver logs detallados
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🚀 Checklist de Verificación</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>☐ Tabla profiles existe en Supabase</li>
              <li>☐ Columnas credits_limit y credits_used existen</li>
              <li>☐ Usuario tiene permisos de lectura/escritura</li>
              <li>☐ Validar Créditos muestra ✅ Exitoso</li>
              <li>☐ Test Descuento muestra valores antes/después</li>
              <li>☐ Reporte muestra créditos disponibles correctamente</li>
              <li>☐ Al generar un informe, credits_used aumenta en 1</li>
              <li>☐ Cuando quedan ≤10 créditos, se envía email</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
