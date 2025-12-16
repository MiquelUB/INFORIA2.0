'use client'; 

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, AlertTriangle, Key } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/lib/hooks/use-toast';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const LoginForm = () => {
  const [tokenInput, setTokenInput] = useState('');
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  
  const { toast } = useToast();
  // const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const urlToken = searchParams.get('token');
  const errorParam = searchParams.get('error');

  // Sincronizar token de URL con el input
  useEffect(() => {
    if (urlToken) {
      setTokenInput(urlToken);
    }
  }, [urlToken]);

  // Efecto para mostrar error
  useEffect(() => {
    if (errorParam === 'invalid_claim') {
      toast({
        variant: "destructive",
        title: "Error de Activación",
        description: "El enlace de compra no es válido o ya ha sido utilizado."
      });
    }
  }, [errorParam, toast]);

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    try {
      const origin = location.origin;
      let redirectUrl = `${origin}/auth/callback`;
      
      // Usamos el token del input (que puede venir de URL o manual)
      if (tokenInput.trim()) {
        redirectUrl += `?token=${tokenInput.trim()}`;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'openid email profile https://www.googleapis.com/auth/drive.file',
        },
      });

      if (error) throw error;
    } catch (err: unknown) {
      console.error('Error Google:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      toast({ variant: 'destructive', title: 'Error', description: errMsg });
      setIsLoadingGoogle(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <Card className="w-full max-w-md shadow-lg border-none">
      <CardHeader className="text-center space-y-4 pb-8">
        <div className="flex justify-center mb-2">
          <h1 className="font-serif text-5xl font-medium text-primary tracking-tight">
            iNFORiA
          </h1>
        </div>
        <div className="space-y-2">
           {/* Text removed per user request */}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* UI DE ERROR */}
        {errorParam === 'invalid_claim' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Enlace Caducado</AlertTitle>
            <AlertDescription>
              No pudimos activar tu compra. Contacta a soporte.
            </AlertDescription>
          </Alert>
        )}

        {/* UI DE ÉXITO/INFO */}
        {tokenInput && !errorParam && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <Key className="h-4 w-4" />
            <AlertTitle>Código de Activación Detectado</AlertTitle>
            <AlertDescription>
              Inicia sesión para vincular tu compra.
            </AlertDescription>
          </Alert>
        )}

        {/* INPUT DE TOKEN MANUAL */}
        <div className="space-y-2">
          <Label htmlFor="token" className="text-sm font-medium text-gray-700">
            ¿Tienes un código de activación?
          </Label>
          <div className="relative">
            <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              id="token" 
              placeholder="Pega tu código aquí (opcional)" 
              value={tokenInput} 
              onChange={(e) => setTokenInput(e.target.value)} 
              className="pl-9"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Si has hecho clic en el enlace de tu email, este campo se rellenará automáticamente.
          </p>
        </div>

        {/* BOTÓN DE GOOGLE */}
        <Button
          variant="outline"
          size="lg"
          className="w-full border-2 border-primary/20 hover:bg-primary/5 hover:border-primary text-foreground font-medium text-base py-6 h-auto transition-all"
          onClick={handleGoogleLogin}
          disabled={isLoadingGoogle}
        >
          {isLoadingGoogle ? (
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
          ) : (
             <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
             </svg>
          )}
          {tokenInput ? 'Continuar y Activar Cuenta' : 'Continuar con Google'}
        </Button>

        <div className="text-xs text-muted-foreground text-center space-y-1 pt-4">
          <p>
            Al continuar, aceptas nuestros{' '}
            <Link href="/legal/terms" className="underline hover:text-primary transition-colors">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link href="/legal/privacy" className="underline hover:text-primary transition-colors">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
    </div>
  );
};