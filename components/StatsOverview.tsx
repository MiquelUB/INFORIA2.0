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
      color: "text-inforia",
      bgColor: "bg-inforia/10"
    },
    {
      title: "Informes",
      value: stats?.totalReports || 0,
      icon: FileText,
      color: "text-burgundy",
      bgColor: "bg-burgundy/10"
    },
    {
      title: "Este Mes",
      value: stats?.newThisMonth || 0,
      icon: TrendingUp,
      color: "text-gold",
      bgColor: "bg-gold/10"
    },
    {
      title: "Citas Hoy",
      value: stats?.appointmentsToday || 0,
      icon: Calendar,
      color: "text-foreground",
      bgColor: "bg-muted/50"
    }
  ];

  // Credit Status Logic (from CreditsStatus.tsx)
  const creditsToUse = profile && profile.credits_limit !== null && profile.credits_used !== null
    ? profile.credits_limit - profile.credits_used
    : 0;

  const planType = profile?.plan_type || 'professional';
  const subscriptionStatus = profile?.subscription_status || 'active';
  const creditsUsed = profile?.credits_used ?? 0;
  const creditsLimit = profile?.credits_limit ?? 100;

  const usagePercentage = creditsLimit > 0
    ? (creditsUsed / creditsLimit) * 100
    : 0;
  const remainingCredits = creditsToUse;

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'over_quota': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'warning': return 'Límite Próximo';
      case 'over_quota': return 'Límite Alcanzado';
      default: return 'Estado Desconocido';
    }
  };

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
            <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform duration-200`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* New Credit Status Card */}
      <Card className="col-span-2 group hover:shadow-md transition-calm border-module-border hover-scale">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Estado de Suscripción</CardTitle>
            <Badge variant="outline" className={getStatusColor(subscriptionStatus)}>
              {getStatusText(subscriptionStatus)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Plan {planType === 'professional' ? 'Profesional' : 'Clínica'}</span>
              <span>{remainingCredits} informes restantes</span>
            </div>
            
            <Progress value={usagePercentage} className="h-2" />
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{creditsUsed} de {creditsLimit} utilizados</span>
              <span>{usagePercentage.toFixed(1)}%</span>
            </div>
            
            {subscriptionStatus === 'warning' && (
              <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                ⚠️ Te quedan pocos informes. Considera actualizar tu plan.
              </div>
            )}
            
            {subscriptionStatus === 'over_quota' && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                🚫 Has alcanzado tu límite. Actualiza tu plan para continuar.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview;