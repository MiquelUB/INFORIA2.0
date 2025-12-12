export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      patients: {
        Row: {
          birth_date: string | null
          created_at: string | null
          email: string | null
          google_sheet_id: string | null
          google_sheet_url: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
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
          birth_date?: string | null
          created_at?: string | null
          email?: string | null
          google_sheet_id?: string | null
          google_sheet_url?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
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
          birth_date?: string | null
          created_at?: string | null
          email?: string | null
          google_sheet_id?: string | null
          google_sheet_url?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
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
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          user_id: string
          appointment_date: string
          appointment_time: string
          status: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          user_id: string
          appointment_date: string
          appointment_time: string
          status?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          patient_id?: string
          user_id?: string
          appointment_date?: string
          appointment_time?: string
          status?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          clinic_name: string | null
          created_at: string | null
          credits_limit: number | null
          credits_used: number | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          phone: string | null
          plan_type: string | null
          professional_license: string | null
          subscription_status: string | null
          updated_at: string | null
          billing_name: string | null
          billing_email: string | null
          billing_address: string | null
          billing_city: string | null
          billing_postal_code: string | null
          billing_country: string | null
          nif_dni: string | null
          billing_owner_id: string | null
          seats_allowed: number
        }
        Insert: {
          avatar_url?: string | null
          clinic_name?: string | null
          created_at?: string | null
          credits_limit?: number | null
          credits_used?: number | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          phone?: string | null
          plan_type?: string | null
          professional_license?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          billing_name?: string | null
          billing_email?: string | null
          billing_address?: string | null
          billing_city?: string | null
          billing_postal_code?: string | null
          billing_country?: string | null
          nif_dni?: string | null
          billing_owner_id?: string | null
          seats_allowed?: number
        }
        Update: {
          avatar_url?: string | null
          clinic_name?: string | null
          created_at?: string | null
          credits_limit?: number | null
          credits_used?: number | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          phone?: string | null
          plan_type?: string | null
          professional_license?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          billing_name?: string | null
          billing_email?: string | null
          billing_address?: string | null
          billing_city?: string | null
          billing_postal_code?: string | null
          billing_country?: string | null
          nif_dni?: string | null
          billing_owner_id?: string | null
          seats_allowed?: number
        }
        Relationships: []
      }
      reports: {
        Row: {
          audio_transcription: string | null
          content: string | null
          created_at: string | null
          google_drive_file_id: string | null
          id: string
          input_type: string
          patient_id: string
          report_type: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          audio_transcription?: string | null
          content?: string | null
          created_at?: string | null
          google_drive_file_id?: string | null
          id?: string
          input_type: string
          patient_id: string
          report_type: string
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          audio_transcription?: string | null
          content?: string | null
          created_at?: string | null
          google_drive_file_id?: string | null
          id?: string
          input_type?: string
          patient_id?: string
          report_type?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      // ✅ TABLA AÑADIDA CORRECTAMENTE
      plan_assignments: {
        Row: {
          id: string
          owner_id: string
          email: string
          allocated_credits: number
          status: 'active' | 'suspended'
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          email: string
          allocated_credits: number
          status: 'active' | 'suspended'
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          email?: string
          allocated_credits?: number
          status?: 'active' | 'suspended'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_assignments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      // ✅ FIN TABLA AÑADIDA
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

export type Patient = Tables<'patients'>
export type Report = Tables<'reports'>
export type Appointment = Tables<'appointments'>
// ✅ NUEVO TIPO EXPORTADO
export type PlanAssignment = Tables<'plan_assignments'>

// Interfaz extendida para Profile (para tener el email accesible fácilmente)
export interface Profile extends Tables<'profiles'> {
  email?: string;
};