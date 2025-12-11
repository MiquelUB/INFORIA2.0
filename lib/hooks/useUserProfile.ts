import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/lib/types';

export function useUserProfile(userId: string | null) {
  const supabase = createClient();
  return useQuery<Profile | null>({
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

      return data as Profile;
    },
    enabled: !!userId,
  });
}
