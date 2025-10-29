"use client"; // CRÍTICO: Debe ser Client Component para usar hooks
import Link from 'next/link'; // ✅ Importación correcta de Next.js
import { useRouter } from 'next/navigation'; // ✅ Hook de navegación correcto
import { LogOut, User } from 'lucide-react'; 
import { Button } from '@/components/ui/button'; 
import { useAuth } from '@/contexts/AuthContext'; // Importar el contexto de Auth
import { toast } from 'sonner';

// Nota: No se necesita createClient aquí si useAuth ya proporciona signOut
// import { createClient } from '@/lib/supabase/client'; 

export const Header = () => { // ✅ SOLUCIÓN AL BUCLE: Declaración y Exportación explícita
  const router = useRouter(); 
  const { signOut } = useAuth(); // ✅ useAuth debe proporcionar la función signOut
  
  const handleSignOut = async () => {
    try {
      // 🎯 CORRECCIÓN DE TIPADO: El error era SingOut, la función correcta es signOut.
      // Se asume que useAuth().signOut() maneja la lógica de Supabase y la limpieza local.
      await signOut(); 
      
      toast.info('Sesión cerrada correctamente.');
      
      // Redirección a /login después del logout
      router.push('/login'); 
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error('Fallo al cerrar sesión.');
    }
  };

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <Link href="/dashboard" className="text-xl font-bold text-primary"> 
        INFORIA2.0
      </Link>

      <nav className="flex items-center space-x-4">
        <Link href="/account" className="text-sm font-medium hover:text-primary flex items-center">
          <User className="w-4 h-4 mr-1" />
          Cuenta
        </Link>
        
        <Button 
          variant="destructive"
          size="sm"
          onClick={handleSignOut} 
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </nav>
    </header>
  );
};