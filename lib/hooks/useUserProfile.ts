import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types';

const mapSupabaseToUserProfile = (data: any): UserProfile => ({
  ...data,
});

export function useUserProfile(userId: string | null) {
  return useQuery<UserProfile | null>({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      return data ? mapSupabaseToUserProfile(data) : null;
    },
    enabled: !!userId,
  });
}
