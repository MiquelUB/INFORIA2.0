'use client'; // Este componente interactúa con hooks (useRouter, useState, useEffect)

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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from '@/lib/hooks/use-toast';
import { useEffect, useState } from 'react'; // AÑADIDO: para manejar el estado del usuario
import { User } from '@supabase/supabase-js'; // AÑADIDO: tipo de usuario de Supabase

// ELIMINADO: Import obsoleto de la arquitectura antigua
// import { useAuth } from "@/contexts/AuthContext";

// AÑADIDO: Import de la nueva arquitectura de INFORIA2.0
import { createClient } from '@/lib/supabase/client';

const DashboardHeader = () => {
  const router = useRouter();
  const { toast } = useToast();

  // CORRECCIÓN: Lógica de autenticación refactorizada
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      // Obtenemos el usuario desde el cliente Supabase
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, [supabase.auth]); // Dependencia correcta

  const handleSignOut = async () => {
    try {
      // CORRECCIÓN: 'await signOut()' reemplazado por la nueva API de Supabase
      await supabase.auth.signOut();

      toast({
        title: "Sesión cerrada",
        description: "Has cerrado tu sesión exitosamente.",
      });

      // La navegación a /login ya estaba correcta
      router.push("/login");

    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Error al cerrar sesión",
        variant: "destructive"
      });
    }
  };

  // Esta función es compatible con el nuevo objeto 'user' de Supabase
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

  return (
    <header className="border-b border-module-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            {/* CORREGIDO: href="/" */}
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
                <DropdownMenuItem className="cursor-pointer">
                  {/* CORREGIDO: 'to' cambiado a 'href' */}
                  <Link href="/" className="w-full flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  {/* CORREGIDO: 'to' cambiado a 'href' */}
                  <Link href="/patient-list" className="w-full flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Pacientes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  {/* CORREGIDO: 'to' cambiado a 'href' */}
                  <Link href="/new-patient" className="w-full flex items-center">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Ficha de Paciente
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  {/* CORREGIDO: 'to' cambiado a 'href' */}
                  <Link href="/session-workspace" className="w-full flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Nueva Sesión
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  {/* CORREGIDO: 'to' cambiado a 'href' */}
                  <Link href="/faqs" className="w-full flex items-center">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    FAQs
                  </Link>
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
                <DropdownMenuItem className="cursor-pointer">
                  {/* CORREGIDO: 'to' cambiado a 'href' */}
                  <Link href="/my-account" className="w-full flex items-center">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Mi Cuenta
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleSignOut}
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
};

export default DashboardHeader;