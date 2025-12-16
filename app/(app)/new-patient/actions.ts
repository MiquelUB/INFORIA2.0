// Contenido para: app/(app)/new-patient/actions.ts
'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { googleSheetsPatientCRM } from "@/lib/services/googleSheetsPatientCRM";
import { format } from "date-fns";

// Definimos la interfaz aquí ya que el formulario la necesita
interface PatientData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: Date | undefined;
  appointmentDate: Date | undefined;
  appointmentTime: string;
  gender: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  emergencyEmail: string;
  profession: string;
  referredBy: string;
  tags: string[];
  notes: string;
}

interface PatientCRMData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  created_at: string;
  total_reports: number;
  last_report_date?: string;
  payment_status: string;
  total_paid: number;
  next_payment_due?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'discharged';
  drive_folder_url?: string;
}

interface ActionResult {
  success: boolean;
  message: string;
  patientId?: string;
  crmUrl?: string;
}

export async function createPatientAction(
  googleToken: string,
  patientData: PatientData
): Promise<ActionResult> {
  
  const supabase = createClient();

  // 1. Obtener usuario del SERVIDOR
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('Error obteniendo usuario:', userError);
    return { success: false, message: "Usuario no autenticado." };
  }

  // 2. El token ya viene del cliente
  if (!googleToken) {
    return { 
      success: false, 
      message: "No se encontró el token de Google." 
    };
  }

  let patientId = '';
  let patientName = '';
  let appointmentCreated = false;

  try {
    // 3. Crear paciente en Supabase
    const { data, error } = await supabase
      .from('patients')
      .insert([
        {
          user_id: user.id,
          name: `${patientData.firstName} ${patientData.lastName}`,
          email: patientData.email || null,
          phone: patientData.phone || null,
          birth_date: patientData.birthDate ? format(patientData.birthDate, 'yyyy-MM-dd') : null,
          notes: patientData.notes || null,
          // Nuevos campos mapeados
          sexo: patientData.gender || null,
          direccion_fisica: patientData.address || null,
          persona_rescate_nombre: patientData.emergencyContact || null,
          persona_rescate_telefono: patientData.emergencyPhone || null,
          persona_rescate_email: patientData.emergencyEmail || null,
        }
      ])
      .select()
      .single();

    if (error) throw new Error(`PASO 1 (Supabase): ${error.message}`);
    
    patientId = data.id;
    patientName = data.name;

    // 4. Crear la cita en Supabase (si aplica)
    if (patientData.appointmentDate && patientData.appointmentTime) {

      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientId,
          user_id: user.id, // <-- El user_id del servidor
          appointment_date: format(patientData.appointmentDate, 'yyyy-MM-dd'),
          appointment_time: patientData.appointmentTime,
          notes: patientData.notes || null,
          status: 'scheduled'
        });

      if (appointmentError) {
        // Si falla, lanza un error para que el 'catch' principal lo capture
        throw new Error(`PASO 2 (Cita Supabase): ${appointmentError.message}`);
      }
      appointmentCreated = true;
    }

    // 5. Añadir Paciente al CRM de Google Sheets
    // Aquí pasamos el token de servidor
    const patientRowData: PatientCRMData = {
      id: patientId,
      name: patientName,
      email: patientData.email || '',
      phone: patientData.phone || '',
      birth_date: patientData.birthDate ? format(patientData.birthDate, 'yyyy-MM-dd') : '',
      created_at: format(new Date(), 'yyyy-MM-dd'),
      total_reports: 0,
      last_report_date: '',
      payment_status: 'Pendiente',
      total_paid: 0,
      next_payment_due: '',
      notes: patientData.notes || '',
      status: 'active',
      drive_folder_url: '' 
    };

    // Pasamos el token del servidor al servicio
    const crmPatientResult = await googleSheetsPatientCRM.upsertPatientInCRM(googleToken, patientRowData);
    if (!crmPatientResult) {
      throw new Error("PASO 3 (CRM): No se pudo guardar el paciente en Google Sheets.");
    }

    // 6. Añadir Cita al CRM de Google Sheets (si aplica)
    if (appointmentCreated) {
      await googleSheetsPatientCRM.addCitaToCRM(
        googleToken, // Pasamos el token del servidor
        {
          date: format(patientData.appointmentDate!, 'yyyy-MM-dd'),
          time: patientData.appointmentTime,
          patientId: patientId,
          patientName: patientName,
          sessionType: 'Primera Visita',
          status: 'Programada',
          notes: patientData.notes || ''
        }
      );
    }
    
    // 7. Refrescar la caché y devolver éxito
    revalidatePath('/patient-list');
    revalidatePath('/dashboard');
    
    return {
      success: true,
      message: "Paciente creado con éxito",
      patientId: patientId
    };

  } catch (error) {
    console.error('❌ ERROR CRÍTICO creando paciente (Server Action):', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido en el servidor."
    };
  }
}
