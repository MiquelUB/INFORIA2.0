'use client';

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, User } from "lucide-react";
import Link from "next/link";
// 1. Importamos usePathname para leer la ruta
import { useRouter, usePathname } from "next/navigation"; 
import { useToast } from "@/lib/hooks/use-toast";

export const NavigationHeader = () => {
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();
  
  // 2. Obtenemos la ruta actual
  const pathname = usePathname();

  // 3. LÓGICA DE OCULTACIÓN: Si estamos en /login, no renderizamos nada
  // Esto elimina el header de la pantalla de inicio de sesión
  if (pathname && pathname.includes('/login')) {
    return null;
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({ 
        title: "Error al cerrar sesión", 
        description: error.message, 
        variant: "destructive" 
      });
    } else {
      toast({
        title: "Cierre de sesión exitoso",
        description: "Has sido redirigido al login.",
      });
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background shadow-sm">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-lg font-semibold">
          INFORIA
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/account">
              <User className="mr-2 h-4 w-4" />
              Mi Cuenta
            </Link>
          </Button>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <Button onClick={handleSignOut} variant="ghost" size="sm">
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </header>
  );
};