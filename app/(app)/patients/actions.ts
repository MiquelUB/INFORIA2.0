"use server";

import { createClient } from "@/lib/supabase/server"; // Importamos el cliente de SERVIDOR
import { Database } from "@/lib/types"; // Asumiendo que tus tipos están aquí
import { revalidatePath } from "next/cache";

//
// ACCIÓN PARA ACTUALIZAR PACIENTE (Migrada desde useUpdatePatient)
//
export async function updatePatient(
  patientId: string,
  updates: Partial<Database['public']['Tables']['patients']['Row']>
) {
  const supabase = createClient();
  
  const { data, error }  = await supabase
    .from('patients')
    .update(updates)
    .eq('id', patientId)
    .select()
    .single();

  if (error) {
    console.error("Error al actualizar paciente:", error.message);
    return { success: false, error: error.message };
  }

  // Invalidamos el caché para que la UI se refresque
  revalidatePath(`/patient-detailed-profile?id=${patientId}`);
  revalidatePath('/patient-list');

  return { success: true, data };
}

//
// ACCIÓN PARA ELIMINAR PACIENTE (Migrada desde useDeletePatient)
//
export async function deletePatient(patientId: string) {
  const supabase = createClient();

  try {
    // 1. Obtener información del paciente antes de eliminarlo
    const { data: patient, error: fetchError } = await supabase
      .from('patients')
      .select('id, name, google_sheet_id, user_id')
      .eq('id', patientId)
      .single();

    if (fetchError) {
      console.error("Error al obtener paciente:", fetchError.message);
      return { success: false, error: fetchError.message };
    }

    if (!patient) {
      return { success: false, error: "Paciente no encontrado" };
    }

    // 2. Intentar eliminar del CRM de Google Sheets (si existe google_sheet_id)
    if (patient.google_sheet_id) {
      try {
        console.log(`🗑️ Eliminando paciente ${patient.name} del CRM de Google Sheets...`);
        
        // Obtener el token de Google del usuario
        const { data: userData, error: tokenError } = await supabase
          .from('profiles')
          .select('google_access_token')
          .eq('id', patient.user_id)
          .single();

        if (!tokenError && userData?.google_access_token) {
          const { googleSheetsPatientCRM } = await import('@/lib/services/googleSheetsPatientCRM');
          const deleted = await googleSheetsPatientCRM.deletePatientFromCRM(
            userData.google_access_token,
            patient.id,
            patient.google_sheet_id
          );

          if (deleted) {
            console.log(`✅ Paciente ${patient.name} eliminado del CRM de Google Sheets`);
          } else {
            console.warn(`⚠️ No se pudo eliminar paciente ${patient.name} del CRM (puede que no exista)`);
          }
        } else {
          console.warn('⚠️ No se pudo obtener token de Google para eliminar del CRM');
        }
      } catch (crmError) {
        // No bloqueamos la eliminación si falla el CRM
        console.error('Error eliminando del CRM (continuando con eliminación de DB):', crmError);
      }
    }

    // 3. Eliminar el paciente de la base de datos
    const { error: deleteError } = await supabase
      .from('patients')
      .delete()
      .eq('id', patientId);

    if (deleteError) {
      console.error("Error al eliminar paciente de la base de datos:", deleteError.message);
      return { success: false, error: deleteError.message };
    }

    // 4. Invalidar el caché de la lista de pacientes
    revalidatePath('/patient-list');

    console.log(`✅ Paciente ${patient.name} eliminado completamente`);
    return { success: true };

  } catch (error) {
    console.error("Error inesperado al eliminar paciente:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error desconocido" 
    };
  }
}

//
// ACCIÓN PARA CREAR PACIENTE (Migrada desde useCreatePatient)
//
export async function createPatient(
  patientData: Database['public']['Tables']['patients']['Insert']
) {
  const supabase = createClient();

  // 1. Obtener usuario actual para descontar créditos
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, error: "Usuario no autenticado." };
  }

  // 2. Descontar 2 créditos por "Alta Cliente"
  const { deductCredits } = await import("@/lib/actions/credits");
  const creditResult = await deductCredits(user.id, 2, "Alta Cliente");
  
  if (!creditResult.success) {
    return { success: false, error: creditResult.error };
  }

  const { data, error } = await supabase
    .from('patients')
    .insert(patientData)
    .select()
    .single();

  if (error) {
    console.error("Error al crear paciente:", error.message);
    return { success: false, error: error.message };
  }

  // Invalidamos el caché de la lista de pacientes
  revalidatePath('/patient-list');

  return { success: true, data };
}
