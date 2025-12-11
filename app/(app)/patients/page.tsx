'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader,} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback,} from "@/components/ui/avatar";
import { Plus, Eye, Edit, MoreVertical, Loader2 } from "lucide-react";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePatients } from "@/lib/hooks/usePatients";
<<<<<<< HEAD
import { useState } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce"; // New import
import { SearchModule } from "@/components/SearchModule"; // New import

const PatientList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // Debounce the search query

  const { data: patients, isLoading, error } = usePatients(debouncedSearchQuery); // Pass debounced query

  // No need for local filtering anymore, usePatients hook handles it
  const displayedPatients = patients || [];
=======
import StatsOverview from "@/components/StatsOverview";
const PatientList = () => {
  const { data: patients, isLoading, error } = usePatients();

  const filteredPatients = patients || [];
>>>>>>> feature/stripe-integration

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
<<<<<<< HEAD
  return <div className="min-h-screen bg-background">
      <NavigationHeader />
      
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

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              {/* Use the refactored SearchModule */}
              <SearchModule 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                placeholder="Buscar por nombre, email o teléfono..."
              />
              <Button variant="outline" className="font-sans">
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Pacientes</p>
                  <p className="text-2xl font-bold text-foreground">{displayedPatients?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Activos</p>
                  <p className="text-2xl font-bold text-green-600">{displayedPatients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nuevos este mes</p>
                  <p className="text-2xl font-bold text-blue-600">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
=======
  return <div className="flex flex-col h-screen bg-background">
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        {/* Stats Overview with Real Data */}
        <StatsOverview />
>>>>>>> feature/stripe-integration

        {/* Patients List */}
        <Card className="mt-8 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <h2 className="text-2xl font-serif font-semibold text-foreground">
                {filteredPatients.length} Pacientes
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Administra y supervisa todos tus pacientes
              </p>
            </div>
            
            <Link href="/new-patient">
              <Button className="btn-neumorphic font-sans">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Paciente
              </Button>
            </Link>
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
    </div>;
};
export default PatientList;