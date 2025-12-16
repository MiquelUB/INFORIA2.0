'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { acceptLegalTerms } from '@/app/actions/user';
import { toast } from '@/components/ui/use-toast';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CURRENT_TERMS_VERSION = 'v1.0-2025-12-15';

export default function TermsAcceptancePopup() {
  const { user, profile, refreshProfile } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (user && profile) {
      // Check if user has accepted the current terms
      const hasAccepted = profile.terms_version === CURRENT_TERMS_VERSION || profile.terms_accepted_at;
      if (!hasAccepted) {
        setIsVisible(true);
      }
    }
  }, [user, profile]);

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      await acceptLegalTerms(CURRENT_TERMS_VERSION);
      await refreshProfile();
      setIsVisible(false);
      toast({
        title: "Términos aceptados",
        description: "Gracias por aceptar nuestras políticas.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al guardar tu aceptación. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[50] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md shadow-lg border-2 border-primary/10">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-bold text-primary">
            Actualización Legal
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            El uso del software implica la aceptación de nuestros términos legales.
            Hemos actualizado nuestra{' '}
            <Link href="/legal/privacy" className="text-primary hover:underline font-medium" target="_blank">
              Política de Privacidad
            </Link>{' '}
            y{' '}
            <Link href="/legal/terms" className="text-primary hover:underline font-medium" target="_blank">
              Términos de Uso
            </Link>
            .
          </p>
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
            Nuestro compromiso &quot;Zero-Knowledge&quot; garantiza que tus datos clínicos permanecen exclusivamente en tu Google Drive.
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Button 
            variant="ghost" 
            onClick={handleReject}
            className="w-full sm:w-auto text-muted-foreground hover:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            No Aceptar (Salir)
          </Button>
          <Button 
            onClick={handleAccept} 
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Guardando..." : "Aceptar y Continuar"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
