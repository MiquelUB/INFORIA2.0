'use server';

import { createClient } from '@/lib/supabase/server';

export async function checkUserCreditsAction() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    return { success: true, credits: profile.credits };
  } catch (error) {
    return { success: false, error: 'Unexpected error checking credits' };
  }
}
