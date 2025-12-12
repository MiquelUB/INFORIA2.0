'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, ArrowRight, HelpCircle } from 'lucide-react';

export default function PricingPage() {
  const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL || 'https://inforia.pro/#pricing';

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FBF9F6] p-4">
      <Card className="max-w-lg w-full shadow-xl border-none bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-12 pb-12 px-8 text-center space-y-8">
          
          {/* Icono Amigable */}
          <div className="mx-auto w-20 h-20 bg-[#E8F5E9] rounded-full flex items-center justify-center mb-6 shadow-inner">
            <FileText className="w-10 h-10 text-[#2E403B]" />
          </div>

          {/* Textos de Marca */}
          <div className="space-y-4">
            <h1 className="font-serif text-3xl font-bold text-[#2E403B]">
              Activemos tu Puesto de Mando
            </h1>
            <p className="text-muted-foreground font-sans text-lg leading-relaxed">
              Tu cuenta está lista, pero necesitas una suscripción activa para empezar a generar informes.
              <br /><br />
              Elige tu plan y transforma la burocracia en tiempo para tus pacientes.
            </p>
          </div>

          {/* Botón de Acción Principal */}
          <div className="pt-4">
            <Button 
              size="lg"
              className="w-full bg-[#2E403B] hover:bg-[#1e2b27] text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
              onClick={() => window.location.href = landingUrl}
            >
              Ver Planes y Activar Cuenta
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              Serás redirigido a nuestra web principal de forma segura.
            </p>
          </div>

          {/* Footer de Soporte */}
          <div className="border-t border-gray-100 pt-6 mt-8">
            <button 
              className="text-sm text-gray-500 hover:text-[#2E403B] flex items-center justify-center mx-auto gap-2 transition-colors"
              onClick={() => window.location.href = 'mailto:soporte@inforia.pro'}
            >
              <HelpCircle className="w-4 h-4" />
              ¿Ya has pagado y ves esto por error? Contacta con Soporte
            </button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
