import { useQuery } from '@tanstack/react-query';
import { statsService } from '@/lib/services/database';

export const useStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: statsService.getDashboardStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};