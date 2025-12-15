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
      .select('credits_limit, credits_used')
      .eq('id', user.id)
      .single();

    const calculatedCredits = profile ? (profile.credits_limit || 0) - (profile.credits_used || 0) : 0;

    console.log('🔍 [ServerAction] CheckCredits:', { 
      userId: user.id, 
      email: user.email, 
      profileFound: !!profile, 
      credits: calculatedCredits,
      error: profileError?.message 
    });

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    return { success: true, credits: calculatedCredits };
  } catch (error) {
    return { success: false, error: 'Unexpected error checking credits' };
  }
}
