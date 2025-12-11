'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye, Edit, MoreVertical, Loader2, Play } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePatients } from "@/lib/hooks/usePatients";
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import StatsOverview from '@/components/StatsOverview';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PatientList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.toLowerCase() || '';

  const { data: patients, isLoading, error } = usePatients();

  const displayedPatients = useMemo(() => {
     if (!patients) return [];
     if (!query) return patients;
     return patients.filter(p => 
       p.name.toLowerCase().includes(query) || 
       p.email?.toLowerCase().includes(query) ||
       p.phone?.includes(query)
     );
  }, [patients, query]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-destructive">Error al cargar los pacientes</p>
        </div>
      </main>
    );
  }
  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8">
        {/* Stats Overview with Real Data */}
        <StatsOverview />

        {/* Patients List */}
        <Card className="mt-8 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="font-serif text-2xl">
              {displayedPatients.length} Pacientes
            </CardTitle>
            <Button 
              variant="outline" 
              onClick={() => router.push('/new-patient')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Paciente
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                  <TableHead className="hidden lg:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Creado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedPatients.length > 0 ? (
                  displayedPatients.map((patient) => (
                    <TableRow 
                      key={patient.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/patients/${patient.id}`)}
                    >
                      <TableCell>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-muted-foreground md:hidden">
                          {patient.phone || 'Sin teléfono'}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{patient.phone || '-'}</TableCell>
                      <TableCell className="hidden lg:table-cell">{patient.email || '-'}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(patient.created_at ?? '')}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/patients/${patient.id}`);
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Ficha
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/session/${patient.id}`);
                            }}>
                              <Play className="mr-2 h-4 w-4" />
                              Nueva Sesión
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No se encontraron pacientes.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    );
};

export default PatientList;