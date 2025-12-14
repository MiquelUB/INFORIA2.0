export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          professional_license: string | null
          clinic_name: string | null
          phone: string | null
          avatar_url: string | null
          plan_type: 'professional' | 'clinic' | 'demo'
          credits_limit: number
          credits_used: number
          subscription_status: 'active' | 'warning' | 'over_quota'
          onboarding_completed: boolean
          created_at: string
          updated_at: string | null
          billing_name: string | null
          billing_email: string | null
          billing_address: string | null
          billing_city: string | null
          billing_postal_code: string | null
          billing_country: string | null
          nif_dni: string | null
          
          // From usage and lib/types.ts
          invitations_total: number
          invitations_sent: number
          is_sponsor: boolean
          sponsor_id: string | null
          billing_owner_id: string | null
          seats_allowed: number
        }
        Insert: {
          id: string
          full_name?: string | null
          professional_license?: string | null
          clinic_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          plan_type?: 'professional' | 'clinic' | 'demo'
          credits_limit?: number
          credits_used?: number
          subscription_status?: 'active' | 'warning' | 'over_quota'
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string | null
          billing_name?: string | null
          billing_email?: string | null
          billing_address?: string | null
          billing_city?: string | null
          billing_postal_code?: string | null
          billing_country?: string | null
          nif_dni?: string | null
          
          invitations_total?: number
          invitations_sent?: number
          is_sponsor?: boolean
          sponsor_id?: string | null
          billing_owner_id?: string | null
          seats_allowed?: number
        }
        Update: {
          id?: string
          full_name?: string | null
          professional_license?: string | null
          clinic_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          plan_type?: 'professional' | 'clinic' | 'demo'
          credits_limit?: number
          credits_used?: number
          subscription_status?: 'active' | 'warning' | 'over_quota'
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string | null
          billing_name?: string | null
          billing_email?: string | null
          billing_address?: string | null
          billing_city?: string | null
          billing_postal_code?: string | null
          billing_country?: string | null
          nif_dni?: string | null
          
          invitations_total?: number
          invitations_sent?: number
          is_sponsor?: boolean
          sponsor_id?: string | null
          billing_owner_id?: string | null
          seats_allowed?: number
        }
      }
      patients: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          birth_date: string | null
          gender: string | null
          address: string | null
          notes: string | null
          created_at: string
          updated_at: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          labels: string[] | null
          
          // Legacy fields found in usage and lib/types.ts
          google_sheet_id: string | null
          google_sheet_url: string | null
          sexo: string | null
          tags: string[] | null
          direccion_fisica: string | null
          persona_rescate_nombre: string | null
          persona_rescate_telefono: string | null
          persona_rescate_email: string | null
          
          Cita1: string | null
          Cita2: string | null
          Cita3: string | null
          Cita4: string | null
          Cita5: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          birth_date?: string | null
          gender?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          labels?: string[] | null
          
          google_sheet_id?: string | null
          google_sheet_url?: string | null
          sexo?: string | null
          tags?: string[] | null
          direccion_fisica?: string | null
          persona_rescate_nombre?: string | null
          persona_rescate_telefono?: string | null
          persona_rescate_email?: string | null
          
          Cita1?: string | null
          Cita2?: string | null
          Cita3?: string | null
          Cita4?: string | null
          Cita5?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          birth_date?: string | null
          gender?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          labels?: string[] | null
          
          google_sheet_id?: string | null
          google_sheet_url?: string | null
          sexo?: string | null
          tags?: string[] | null
          direccion_fisica?: string | null
          persona_rescate_nombre?: string | null
          persona_rescate_telefono?: string | null
          persona_rescate_email?: string | null
          
          Cita1?: string | null
          Cita2?: string | null
          Cita3?: string | null
          Cita4?: string | null
          Cita5?: string | null
        }
      }
      reports: {
        Row: {
          id: string
          user_id: string
          patient_id: string
          title: string
          content: string | null
          report_type: 'nuevo_paciente' | 'seguimiento' | 'alta_paciente' | string
          input_type: 'audio' | 'text' | 'mixed' | string
          status: 'draft' | 'completed' | 'failed' | string
          google_drive_file_id: string | null
          created_at: string
          updated_at: string | null
          audio_transcription: string | null
        }
        Insert: {
          id?: string
          user_id: string
          patient_id: string
          title: string
          content?: string | null
          report_type: 'nuevo_paciente' | 'seguimiento' | 'alta_paciente' | string
          input_type: 'audio' | 'text' | 'mixed' | string
          status?: 'draft' | 'completed' | 'failed' | string
          google_drive_file_id?: string | null
          created_at?: string
          updated_at?: string | null
          audio_transcription?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          patient_id?: string
          title?: string
          content?: string | null
          report_type?: 'nuevo_paciente' | 'seguimiento' | 'alta_paciente' | string
          input_type?: 'audio' | 'text' | 'mixed' | string
          status?: 'draft' | 'completed' | 'failed' | string
          google_drive_file_id?: string | null
          created_at?: string
          updated_at?: string | null
          audio_transcription?: string | null
        }
      }
      appointments: {
        Row: {
          id: string
          user_id: string
          patient_id: string
          appointment_date: string
          appointment_time: string
          start_time: string | null
          end_time: string | null
          status: 'scheduled' | 'completed' | 'cancelled' | string
          notes: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          patient_id: string
          appointment_date: string
          appointment_time: string
          start_time?: string | null
          end_time?: string | null
          status?: 'scheduled' | 'completed' | 'cancelled' | string
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          patient_id?: string
          appointment_date?: string
          appointment_time?: string
          start_time?: string | null
          end_time?: string | null
          status?: 'scheduled' | 'completed' | 'cancelled' | string
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
      },
      plan_assignments: {
        Row: {
          id: string
          owner_id: string
          email: string
          allocated_credits: number
          status: 'pending' | 'accepted' | 'revoked' | 'active' | 'suspended'
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          email: string
          allocated_credits: number
          status?: 'pending' | 'accepted' | 'revoked' | 'active' | 'suspended'
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          email?: string
          allocated_credits?: number
          status?: 'pending' | 'accepted' | 'revoked' | 'active' | 'suspended'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper para extraer tipos de tablas
export type Tables<
  PublicTableNameOrOptions extends
  | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
    Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
    Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

// Tipos de entidades exportados
export type Patient = Tables<'patients'>
export type Report = Tables<'reports'>
export type Appointment = Tables<'appointments'>
export type PlanAssignment = Tables<'plan_assignments'>

// Interfaz extendida para Profile
export interface Profile extends Tables<'profiles'> {
  email?: string;
};
