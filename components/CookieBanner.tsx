'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Cookie } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Small delay to prevent layout shift feeling or immediate popup
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'false');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6",
      "bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]",
      "transition-transform duration-500 ease-in-out",
      isVisible ? "translate-y-0" : "translate-y-full"
    )}>
      <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-2 bg-primary/10 rounded-full hidden sm:block">
            <Cookie className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">Utilizamos cookies</h3>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Utilizamos cookies propias y de terceros para mejorar nuestros servicios, analizar estadísticas de uso y personalizar tu experiencia. 
              Puedes aceptar todas las cookies o configurarlas. Para más información, consulta nuestra{' '}
              <Link href="/legal/privacy" className="underline hover:text-primary transition-colors">
                Política de Privacidad
              </Link>.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={handleDecline}
            className="flex-1 md:flex-none"
          >
            Solo necesarias
          </Button>
          <Button 
            onClick={handleAccept}
            className="flex-1 md:flex-none"
          >
            Aceptar todas
          </Button>
        </div>
      </div>
    </div>
  );
}
