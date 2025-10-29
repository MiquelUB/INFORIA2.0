import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsService, type PatientInsert, type PatientUpdate } from '@/lib/services/database';
import { useToast } from '@/lib/hooks/use-toast';

export const usePatients = () => {
  return useQuery({
    queryKey: ['patients'],
    queryFn: patientsService.getAll,
  });
};

export const usePatient = (id: string) => {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientsService.getById(id),
    enabled: !!id,
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (patient: PatientInsert) => patientsService.create(patient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({
        title: "Paciente creado",
        description: "El paciente se ha creado correctamente",
      });
    },
    onError: (error) => {
      console.error('Error creating patient:', JSON.stringify(error, null, 2));
      toast({
        title: "Error",
        description: "Error al crear el paciente",
        variant: "destructive",
      });
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: PatientUpdate }) => 
      patientsService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({
        title: "Paciente actualizado",
        description: "Los datos del paciente se han actualizado correctamente",
      });
    },
    onError: (error) => {
      console.error('Error updating patient:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el paciente",
        variant: "destructive",
      });
    },
  });
};

export const useDeletePatient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => patientsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({
        title: "Paciente eliminado",
        description: "El paciente se ha eliminado correctamente",
      });
    },
    onError: (error) => {
      console.error('Error deleting patient:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el paciente",
        variant: "destructive",
      });
    },
  });
};

export const useSearchPatients = (query: string) => {
  return useQuery({
    queryKey: ['patients', 'search', query],
    queryFn: () => patientsService.search(query),
    enabled: query.length > 0,
  });
};