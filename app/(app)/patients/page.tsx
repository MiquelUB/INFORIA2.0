import { NavigationHeader } from "@/components/NavigationHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader,} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback,} from "@/components/ui/avatar";
import { Search, Plus, Eye, Edit, MoreVertical, Loader2 } from "lucide-react";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePatients } from "@/hooks/usePatients";
import { useState } from "react";
const PatientList = () => {
  const { data: patients, isLoading, error } = usePatients();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = patients?.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <main className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <main className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="text-center py-12">
            <p className="text-destructive">Error al cargar los pacientes</p>
          </div>
        </main>
      </div>
    );
  }
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
          
          <Link to="/new-patient">
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
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por nombre, email o teléfono..." 
                  className="pl-10" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
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
                  <p className="text-2xl font-bold text-foreground">{patients?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Activos</p>
                  <p className="text-2xl font-bold text-green-600">{filteredPatients.length}</p>
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

        {/* Patients List */}
        <Card>
          <CardHeader>
            
          </CardHeader>
          <CardContent className="p-0">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery ? 'No se encontraron pacientes con ese criterio' : 'No hay pacientes registrados'}
                </p>
                {!searchQuery && (
                  <Link to="/new-patient">
                    <Button className="mt-4 bg-primary hover:bg-primary/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Crear primer paciente
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredPatients.map(patient => (
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
                            to={`/patient-detailed-profile?id=${patient.id}`} 
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
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Link to={`/patient-detailed-profile?id=${patient.id}`} className="w-full flex items-center">
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Ficha
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link to={`/session-workspace?patientId=${patient.id}`} className="w-full flex items-center">
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