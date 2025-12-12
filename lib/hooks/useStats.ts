import { useQuery } from '@tanstack/react-query';
import { statsService } from '@/lib/services/database';
import { createClient } from '@/lib/supabase/client';

export const useStats = () => {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { totalPatients: 0, newThisMonth: 0, activeCases: 0, totalReports: 0, recentReports: [] };
      
      const [dashboardStats, patientStats] = await Promise.all([
        statsService.getDashboardStats(),
        statsService.getPatientStats(user.id)
      ]);
      
      return {
        ...dashboardStats,
        ...patientStats
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};