// components/Header.tsx (CORREGIDO)
'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client'; // 👈 IMPORTAR EL NUEVO CLIENTE

export const Header = () => {
  const router = useRouter();
  // Inicializar el cliente de Supabase
  const supabase = createClient(); 

  // ❌ ELIMINADO EL 'useAuth' OBSOLETO
  // const { signOut, user } = useAuth(); 

  const handleSignOut = async () => {
    try {
      // ✅ USAR LA NUEVA FUNCIÓN 'signOut'
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success('Has cerrado sesión exitosamente.');
      router.push('/login'); // Redirigir al login
      router.refresh(); // Forzar actualización del estado
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error('Error al cerrar sesión', {
        description: msg,
      });
    }
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background">
      <div className="text-lg font-semibold">
        INFORIA 2.0
      </div>
      <div className="flex items-center gap-4">
        {/* Nota: La información del usuario ahora vendrá del 'layout'
          o se puede obtener con 'supabase.auth.getUser()' si es necesario.
          Por ahora, nos centramos en arreglar el 'signOut'.
        */}
        <Button variant="ghost" size="icon" onClick={() => router.push('/account')}>
          <User className="h-5 w-5" />
        </Button>
        <Button variant="destructive" size="sm" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </header>
  );
};