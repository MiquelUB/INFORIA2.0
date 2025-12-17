'use client';
import StatsOverview from "@/components/StatsOverview";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePatients } from "@/lib/hooks/usePatients";
import { Edit, Eye, Loader2, MoreVertical, Plus } from "lucide-react";
import Link from "next/link";

const PatientList = () => {
  const { data: patients, isLoading, error } = usePatients(); 

  const displayedPatients = patients || [];
  const filteredPatients = displayedPatients;

  const getInitials = (name: string) => {
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="text-center py-12">
            <p className="text-destructive">Error al cargar los pacientes</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-semibold text-foreground mb-2">
              Gestión de Pacientes
            </h1>
            <p className="text-muted-foreground font-sans">
              Administra y supervisa todos tus pacientes desde un solo lugar
            </p>
          </div>
          
          <Link href="/new-patient">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Paciente
            </Button>
          </Link>
        </div>


        {/* Stats Overview */}
        <StatsOverview />

        {/* Patients List */}
        <Card className="mt-8 border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div>
              <h2 className="text-2xl font-serif font-semibold text-foreground">
                {filteredPatients.length} Pacientes
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Administra y supervisa todos tus pacientes
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {displayedPatients.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No hay pacientes registrados
                </p>
                <Link href="/new-patient">
                  <Button className="mt-4 btn-neumorphic">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear primer paciente
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {displayedPatients.map(patient => (
                  <div key={patient.id} className="p-6 hover:bg-secondary/50 transition-calm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary text-primary-foreground font-sans">
                            {getInitials(patient.name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="space-y-1">
                          <Link 
                            href={`/patients/${patient.id}`} 
                            className="font-serif text-lg font-medium text-foreground hover:text-primary transition-calm"
                          >
                            {patient.name}
                          </Link>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground font-sans">
                            {patient.email && <span>{patient.email}</span>}
                            {patient.email && patient.phone && <span>•</span>}
                            {patient.phone && <span>{patient.phone}</span>}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                              Activo
                            </Badge>
                            {patient.notes && (
                              <Badge variant="outline" className="font-sans">
                                Con notas
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground font-sans">
                          Creado: {formatDate(patient.created_at ?? '')}
                        </span>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" aria-label="Opciones del paciente">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Link href={`/patients/${patient.id}`} className="w-full flex items-center">
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Ficha
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link href={`/session/${patient.id}`} className="w-full flex items-center">
                                <Edit className="mr-2 h-4 w-4" />
                                Nueva Sesión
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
export default PatientList;