import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"; // Added CardHeader, CardTitle
import { Users, FileText, TrendingUp, Calendar } from "lucide-react";
import { useStats } from "@/lib/hooks/useStats";
import { Skeleton } from "./ui/skeleton";
import { useQuery } from '@tanstack/react-query'; // New import
import { creditsService } from '@/lib/services/credits'; // New import
import { Progress } from '@/components/ui/progress'; // New import
import { Badge } from '@/components/ui/badge'; // New import

const StatsOverview = () => {
  const { data: stats, isLoading } = useStats();
  const { data: profile, isLoading: isLoadingCredits } = useQuery({
    queryKey: ['user-profile'],
    queryFn: creditsService.getUserProfile,
    refetchInterval: 30000,
  });

  if (isLoading || isLoadingCredits) {
    return (
      <div className="grid grid-cols-2 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-4 w-16" />
          </Card>
        ))}
        {/* Skeleton for the new credits card */}
        <Card className="p-4 col-span-2">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </Card>
      </div>
    );
  }

  const statsData = [
    {
      title: "Pacientes",
      value: stats?.totalPatients || 0,
      icon: Users,
    },
    {
      title: "Informes",
      value: stats?.totalReports || 0,
      icon: FileText,
    },
    {
      title: "Este Mes",
      value: stats?.newThisMonth || 0,
      icon: TrendingUp,
    },
    {
      title: "Citas Hoy",
      value: stats?.appointmentsToday || 0,
      icon: Calendar,
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mb-6 animate-fade-in">
      {statsData.map((stat, index) => (
        <Card 
          key={stat.title} 
          className="group hover:shadow-md transition-calm border-module-border hover-scale"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {stat.value}
              </p>
            </div>
            {/* Neumorphic Gray Icon Style */}
            <div className="p-2 rounded-lg bg-gray-100 text-gray-500 shadow-inner group-hover:scale-110 transition-transform duration-200">
              <stat.icon className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsOverview;