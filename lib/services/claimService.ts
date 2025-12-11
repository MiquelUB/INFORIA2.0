import { createClient } from '@supabase/supabase-js';

// Usamos Service Role para saltarnos RLS y escribir en tablas protegidas
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const claimService = {
  async redeemToken(userId: string, token: string) {
    console.log(`[Claim] Intentando canjear token: ${token} para usuario: ${userId}`);

    // 1. Buscar la invitación pendiente
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from('access_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (fetchError || !invitation) {
      console.error('[Claim] Token inválido o ya usado:', fetchError);
      return { success: false, error: 'Token inválido' };
    }

    // 2. Transacción: Actualizar Perfil y Marcar Invitación
    // Nota: Idealmente usaríamos RPC, pero haremos operaciones secuenciales por simplicidad
    try {
      // A. Actualizar Perfil del Usuario (Asignar Plan)
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          plan_type: invitation.plan_type,
          credits_limit: invitation.credits_limit,
          // Opcional: guardar stripe_customer_id si lo tienes en la invitación
          // stripe_customer_id: invitation.stripe_customer_id 
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // B. Marcar Invitación como RECLAMADA
      const { error: inviteError } = await supabaseAdmin
        .from('access_invitations')
        .update({
          status: 'claimed',
          claimed_by: userId,
          claimed_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      if (inviteError) throw inviteError;

      return { success: true };

    } catch (error) {
      console.error('[Claim] Error en transacción:', error);
      return { success: false, error: 'Error interno al procesar' };
    }
  }
};
