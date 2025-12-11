// @ts-nocheck
import { createClient } from '@/lib/supabase/client';

export interface TeamMember {
  id: string;
  member_email: string;
  status: 'active' | 'pending' | 'disabled';
  credits_allocated: number;
  member_id?: string;
  created_at: string;
}

export const teamsService = {
  /**
   * Obtener todos los miembros del equipo del admin actual
   */
  async getMembers(ownerId: string) {
    const supabase = createClient();
    // @ts-ignore
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data as TeamMember[];
  },

  /**
   * Invitar a un nuevo miembro (crear el seat)
   */
  async inviteMember(email: string, initialCredits: number = 0) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No autenticado');

    // Nota: La validación estricta de límites de seats debería hacerse aquí o con una Policy de Supabase
    // para evitar que se salten la UI.

    // @ts-ignore
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        owner_id: user.id,
        member_email: email,
        status: 'pending',
        credits_allocated: initialCredits
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new Error('Este usuario ya ha sido invitado.');
      throw error;
    }
    
    return data;
  },

  /**
   * Transferir créditos del Admin a un Miembro
   */
  async allocateCredits(memberEmail: string, amount: number) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No autenticado');

    // @ts-ignore
    const { data, error } = await supabase.rpc('transfer_credits', {
      p_owner_id: user.id,
      p_member_email: memberEmail,
      p_amount: amount
    });

    if (error) throw error;
    return data;
  },

  /**
   * Eliminar un miembro del equipo (liberar seat)
   */
  async removeMember(memberId: string) {
    const supabase = createClient();
    // @ts-ignore
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);
      
    if (error) throw error;
    return true;
  }
};
