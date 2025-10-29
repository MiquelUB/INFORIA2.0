import { supabase } from '@/lib/supabase/client';
import { UserProfile } from '@/types';

const mapSupabaseToUserProfile = (data: any): UserProfile => ({
  ...data,
});

export const creditsService = {
  async getUserProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data ? mapSupabaseToUserProfile(data) : null;
  }
};
