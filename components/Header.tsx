// src/components/Header.tsx - Adaptado para Next.js
import { Search, Menu, UserCircle, Calendar, Users, Plus, HelpCircle, LogOut, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import Link from 'next/link'; // <-- CAMBIO: Importar Link de Next.js
import { useRouter } from 'next/navigation'; // <-- CAMBIO: Importar useRouter
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const router = useRouter(); // <-- CAMBIO: Usar useRouter
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      router.push("/"); // <-- CAMBIO: Usar router.push y redirigir a la raíz
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Error al cerrar sesión",
        variant: "destructive"
      });
    }
  };

  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'U';
  };

  // Helper para simplificar los items del menú Link
  const MenuItemLink = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <Link href={href} legacyBehavior>
      <a className={`w-full flex items-center ${className || ''}`}>
        {children}
      </a>
    </Link>
  );

  return (
    <header className="border-b border-module-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
             {/* Código modernizado según la recomendación de Next.js */}
      <Link href="/" className="hover:opacity-80 transition-calm">
        <h1 className="font-serif text-2xl font-medium text-primary">iNFORiA</h1>
      </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar paciente por nombre, etiqueta..."
                className="pl-10 bg-background"
                // Aquí podrías añadir lógica de búsqueda en el futuro
              />
            </div>
          </div>

          {/* Right Side - Menu and Avatar */}
          <div className="flex items-center space-x-4">
            {/* Dropdown Menu - TRES RAYAS HORIZONTALES */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-secondary">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                 {/* CAMBIO: Usar MenuItemLink helper */}
                <DropdownMenuItem className="cursor-pointer p-0">
                  <MenuItemLink href="/dashboard">
                    <Calendar className="mr-2 h-4 w-4" />
                    Dashboard
                  </MenuItemLink>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer p-0">
                  <MenuItemLink href="/patient-list">
                    <Users className="mr-2 h-4 w-4" />
                    Pacientes
                  </MenuItemLink>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer p-0">
                  <MenuItemLink href="/new-patient">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Ficha de Paciente
                  </MenuItemLink>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer p-0">
                  <MenuItemLink href="/session-workspace">
                    <FileText className="mr-2 h-4 w-4" />
                    Nueva Sesión
                  </MenuItemLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer p-0">
                  <MenuItemLink href="/faqs">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    FAQs
                  </MenuItemLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary">
                  <Avatar className="h-8 w-8">
                    {user?.user_metadata?.avatar_url ? (
                      <AvatarImage
                        src={user.user_metadata.avatar_url}
                        alt={user?.user_metadata?.full_name || "Usuario"}
                      />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getUserInitials()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {/* User Info */}
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-foreground">
                    {user?.user_metadata?.full_name || "Usuario"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer p-0">
                   {/* CAMBIO: Usar MenuItemLink helper */}
                  <MenuItemLink href="/my-account">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Mi Cuenta
                  </MenuItemLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleSignOut} // onClick sigue igual
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}