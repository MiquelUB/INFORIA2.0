"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server"; // Importamos el cliente de SERVIDOR
import { Database } from "@/lib/types"; // Asumiendo que tus tipos están aquí

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

  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', patientId);

  if (error) {
    console.error("Error al eliminar paciente:", error.message);
    return { success: false, error: error.message };
  }

  // Invalidamos el caché de la lista de pacientes
  revalidatePath('/patient-list');

  return { success: true };
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
