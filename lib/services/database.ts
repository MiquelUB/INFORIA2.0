import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/types';

const supabase = createClient();

// Types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Patient = Database['public']['Tables']['patients']['Row'];
export type Report = Database['public']['Tables']['reports']['Row'];

export type PatientInsert = Database['public']['Tables']['patients']['Insert'];
export type PatientUpdate = Database['public']['Tables']['patients']['Update'];
export type ReportInsert = Database['public']['Tables']['reports']['Insert'];

// Profile Service
export const profileService = {
  async get(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async upsert(profile: Partial<Profile> & { id: string }): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile as any)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Patients Service
export const patientsService = {
  async getAll(): Promise<Patient[]> {
    const { data, error } = await (supabase
      .from('patients') as any)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Patient | null> {
    const { data, error } = await (supabase
      .from('patients') as any)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async create(patient: PatientInsert): Promise<Patient> {
    const { data, error } = await (supabase
      .from('patients') as any)
      .insert(patient)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: PatientUpdate): Promise<Patient> {
    const { data, error } = await (supabase
      .from('patients') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async search(query: string): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};

// Reports Service
export const reportsService = {
  async getAll(): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        patient:patients(
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByPatient(patientId: string): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(report: ReportInsert): Promise<Report> {
    const { data, error } = await (supabase
      .from('reports') as any)
      .insert(report)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Report>): Promise<Report> {
    const { data, error } = await (supabase
      .from('reports') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Appointments Service
export const appointmentsService = {
  async getByPatient(patientId: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(appointment: any) {
    const { data, error } = await (supabase
      .from('appointments') as any)
      .insert(appointment)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
};

// Analytics/Stats Service
export const statsService = {
  async getDashboardStats() {
    const [patientsCount, reportsCount, recentReports] = await Promise.all([
      supabase.from('patients').select('*', { count: 'exact', head: true }),
      supabase.from('reports').select('*', { count: 'exact', head: true }),
      supabase.from('reports')
        .select(`
          *,
          patient:patients(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    return {
      totalPatients: patientsCount.count || 0,
      totalReports: reportsCount.count || 0,
      recentReports: recentReports.data || []
    };
  },

  async getPatientStats(userId: string) {
    if (!userId) {
      return { totalPatients: 0, newThisMonth: 0, activeCases: 0 };
    }

    // First day of current month (e.g., 2025-11-01)
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    // CORRECCIÓN: Usar hora local para determinar "hoy", evitando que a las 00:30 (UTC-x) siga contando el día anterior.
    const todayStr = today.toLocaleDateString('en-CA'); // YYYY-MM-DD en local

    // Query for total patients
    const { count: totalPatients, error: totalError } = await supabase
      .from('patients')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (totalError) {
      console.error('Error fetching total patients stats:', totalError);
    }

    // Query for patients created THIS MONTH
    // (created after or on the first day of the month)
    const { count: newPatients, error: newError } = await supabase
      .from('patients')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', firstDayOfMonth); // gte = greater than or equal

    if (newError) {
      console.error('Error fetching new patients stats:', newError);
    }

    // Query for appointments TODAY
    const { count: appointmentsToday, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('appointment_date', todayStr);

    if (appointmentsError) {
      console.error('Error fetching appointments stats:', appointmentsError);
    }
    
    // Return real data
    return {
      totalPatients: totalPatients ?? 0,
      newThisMonth: newPatients ?? 0,
      activeCases: totalPatients ?? 0, // Assuming "active" is "total" for now
      appointmentsToday: appointmentsToday ?? 0
    };
  }
};