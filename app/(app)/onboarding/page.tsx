// app/(app)/onboarding/page.tsx (CORREGIDO)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client'; // ✅ AÑADIDO
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { User } from '@supabase/supabase-js';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient(); // ✅ AÑADIDO
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado del formulario
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState('');

  // 1. Obtener el usuario al cargar
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        router.push('/login'); // Si no hay usuario, redirigir
      }
      setLoading(false);
    };
    fetchUser();
  }, [supabase, router]);

  // 2. Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    // 3. Actualizar la tabla 'profiles'
    const { error } = await (supabase
      .from('profiles') as any)
      .update({
        full_name: fullName,
        specialty: specialty,
        onboarding_completed: true, 
      } as any)
      .eq('id', user.id);

    if (error) {
      alert(error.message);
      setIsSubmitting(false);
    } else {
      // Redirigir al dashboard
      router.push('/dashboard');
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Bienvenido a INFORIA</CardTitle>
          <CardDescription>
            Completa tu perfil para continuar.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidad (Opcional)</Label>
              <Input
                id="specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Ej. Psicólogo Clínico"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar y Entrar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}