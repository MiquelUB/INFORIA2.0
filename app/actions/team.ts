'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
// import { Database } from '@/lib/types'

// Cliente Admin para operaciones privilegiadas (INVITAR)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function inviteTeamMember(formData: FormData) {
  const email = formData.get('email') as string
  
  if (!email) {
    return { error: 'El email es requerido' }
  }

  // 1. Verificar quién está haciendo la petición
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'No autenticado' }

  // 2. Leer datos del Patrocinador (Sponsor)
  const { data: sponsorProfile } = await supabase
    .from('profiles')
    .select('invitations_total, invitations_sent, is_sponsor')
    .eq('id', user.id)
    .single()

  if (!sponsorProfile?.is_sponsor) {
    return { error: 'No tienes un plan de Clínica o Dúo activo.' }
  }

  const invitationsSent = sponsorProfile.invitations_sent || 0
  const invitationsTotal = sponsorProfile.invitations_total || 1

  if (invitationsSent >= invitationsTotal) {
    return { error: 'Has agotado todas tus licencias. Mejora tu plan.' }
  }

  // 3. ENVIAR INVITACIÓN (Usando la API de Admin)
  const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    email,
    {
      data: {
        // Metadatos que se guardarán en el usuario nuevo
        sponsor_id: user.id,
        plan_type: 'professional', // El invitado hereda un plan pro
        credits_limit: 150 // O los que decidas dar al invitado
      }
    }
  )

  if (inviteError) {
    console.error('Error invitando:', inviteError)
    return { error: 'Error al enviar invitación: ' + inviteError.message }
  }

  // 4. Actualizar contador de invitaciones usadas
  await supabaseAdmin
    .from('profiles')
    .update({ invitations_sent: invitationsSent + 1 })
    .eq('id', user.id)

  // 5. Refrescar la página
  revalidatePath('/account')
  return { success: true }
}

export async function getTeamMembers() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'No autenticado', members: [] }

  // Obtener todos los usuarios que fueron invitados por este sponsor
  const { data: members, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, plan_type, credits_limit')
    .eq('sponsor_id', user.id)

  if (error) {
    console.error('Error obteniendo miembros del equipo:', error)
    return { error: error.message, members: [] }
  }

  return { success: true, members: members || [] }
}
