"use server";

import { createClient } from "@/lib/supabase/server";

export async function deductCredits(userId: string, amount: number, description: string) {
  const supabase = createClient();
  
  // 1. Get current credits
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('credits_limit, credits_used')
    .eq('id', userId)
    .single();

  if (fetchError || !profile) {
    console.error(`Error fetching profile for user ${userId}:`, fetchError);
    return { success: false, error: "No se pudo obtener el perfil del usuario." };
  }

  const currentUsed = profile.credits_used || 0;
  const limit = profile.credits_limit || 0;
  const available = limit - currentUsed;
  
  // 2. Check availability
  if (amount > available) {
    return { 
      success: false, 
      error: `Créditos insuficientes. Necesitas ${amount} pero tienes ${available}.` 
    };
  }

  // 3. Update credits
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ credits_used: currentUsed + amount })
    .eq('id', userId);

  if (updateError) {
    console.error(`Error deducting credits for user ${userId}:`, updateError);
    return { success: false, error: "Error al procesar el consumo de créditos." };
  }

  return { success: true };
}
