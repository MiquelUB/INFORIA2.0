'use client'; // Necesario para hooks como useState, useRouter

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/lib/hooks/use-toast';
import { useRouter } from 'next/navigation'; // AÑADIDO: Para refrescar después del login

// ELIMINADO: Import obsoleto del contexto de autenticación
// import { useAuth } from '@/contexts/AuthContext';

// AÑADIDO: Import del cliente Supabase para componentes de cliente
import { createClient } from '@/lib/supabase/client';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false); // Para el estado de enlace mágico (si se usara)
  const { toast } = useToast();
  const router = useRouter(); // AÑADIDO: Hook de enrutamiento

  // CORRECCIÓN: Cliente Supabase inicializado
  const supabase = createClient();

  // ELIMINADO: Hook obsoleto
  // const { signInWithEmail, signInWithGoogle } = useAuth();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingEmail(true);
    setError(null);

    try {
      // CORRECCIÓN: Usar la nueva API de Supabase para iniciar sesión
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Inicio de sesión exitoso',
        description: 'Bienvenido de nuevo.',
      });

      // CORRECCIÓN: Refrescar la página. El middleware se encargará de la redirección.
      router.refresh();

      // No necesitamos redirigir manualmente aquí, el middleware lo hará.
      // router.push('/dashboard'); // Opcional, pero refresh es mejor con middleware

    } catch (err: any) {
      console.error('Error signing in with email:', err);
      setError(err.message || 'Error al iniciar sesión.');
      toast({
        title: 'Error de inicio de sesión',
        description: err.message || 'No se pudo iniciar sesión con correo y contraseña.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    setError(null);
    try {
      // CORRECCIÓN: Usar la nueva API de Supabase para OAuth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Asegúrate de que esta URL está en tu lista de 'Redirect URLs' en Supabase Auth Settings
          redirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
      // La redirección a Google ocurre automáticamente.
      // No necesitamos hacer nada más aquí. El callback manejará el resto.

    } catch (err: any) {
      console.error('Error signing in with Google:', err);
      setError(err.message || 'Error al iniciar sesión con Google.');
      toast({
        title: 'Error con Google',
        description: err.message || 'No se pudo iniciar sesión con Google.',
        variant: 'destructive',
      });
      setIsLoadingGoogle(false); // Asegúrate de detener la carga si hay un error *antes* de redirigir
    }
    // No establecemos setIsLoadingGoogle(false) aquí porque la página redirigirá
  };


  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="inforia-h2">¡Bienvenido de Nuevo!</CardTitle>
        <CardDescription className="inforia-body">Accede a tu Puesto de Mando Clínico.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="text-destructive text-sm mb-4 text-center">{error}</p>}
        {isSent && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-md text-green-800 text-sm flex items-center">
            <CheckCircle className="mr-2 h-4 w-4"/> Revisa tu correo para el enlace de inicio de sesión.
          </div>
        )}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoadingEmail || isLoadingGoogle}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoadingEmail || isLoadingGoogle}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoadingEmail || isLoadingGoogle}>
            {isLoadingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Iniciar Sesión
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={isLoadingEmail || isLoadingGoogle}
        >
          {isLoadingGoogle ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
            <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
              <path
                fill="currentColor"
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.63-4.58 1.63-5.45 0-9.88-4.45-9.88-9.88s4.43-9.88 9.88-9.88c2.6 0 4.58.98 5.92 2.18l2.6-2.6C19.8 1.94 16.63 0 12.48 0 5.88 0 .02 5.88.02 12.48s5.86 12.48 12.46 12.48c3.33 0 6.22-1.1 8.35-3.28 2.18-2.18 3.28-5.05 3.28-8.35 0-.73-.08-1.45-.2-2.18H12.48z"
              />
            </svg>
          )}
          Google
        </Button>

        {/* Puedes añadir un enlace para registrarse o recuperar contraseña si es necesario */}
        {/* <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿No tienes cuenta? <Link href="/signup" className="underline">Regístrate</Link>
        </p> */}
      </CardContent>
    </Card>
  );
};