import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface CreateAppointmentRequest {
  patientId: string;
  userId: string;
  appointmentDate: Date;
  appointmentTime: string;
  notes?: string;
}

export class AppointmentService {
  /**
   * Guarda una nueva cita en la base de datos
   */
  async createAppointment(request: CreateAppointmentRequest): Promise<{ success: boolean; error?: string; appointmentId?: string }> {
    try {
      // Formatear la fecha como YYYY-MM-DD
      const dateStr = request.appointmentDate.toISOString().split('T')[0];

      const { data, error } = await (supabase
        .from('appointments') as any)
        .insert({
          patient_id: request.patientId,
          user_id: request.userId,
          appointment_date: dateStr,
          appointment_time: request.appointmentTime,
          notes: request.notes || null,
          status: 'scheduled'
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating appointment:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        appointmentId: data?.id
      };
    } catch (error) {
      console.error('Appointment service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene todas las citas de un usuario para un mes específico
   */
  async getAppointmentsByMonth(userId: string, month: number, year: number): Promise<any[]> {
    try {
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('appointments')
        .select('*, patients(id, name, email, phone)')
        .eq('user_id', userId)
        .gte('appointment_date', startDate)
        .lte('appointment_date', endDate)
        .order('appointment_date', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Appointment service error:', error);
      return [];
    }
  }

  /**
   * Obtiene las citas de un paciente específico
   */
  async getPatientAppointments(patientId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('appointment_date', { ascending: true });

      if (error) {
        console.error('Error fetching patient appointments:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Appointment service error:', error);
      return [];
    }
  }
}

export const appointmentService = new AppointmentService();
