// Ruta: src/components/AccountHeader.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, AlertCircle, Crown, Building2, TestTube } from 'lucide-react';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';

export function AccountHeader() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useUserProfile(user?.id || null);

  if (isLoading || !profile) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-8 bg-secondary rounded w-1/3"></div>
              <div className="h-6 bg-secondary rounded w-24"></div>
            </div>
            <div className="h-2 bg-secondary rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const creditsUsed = profile.credits_used ?? 0;
  const creditsLimit = profile.credits_limit ?? 0;

  const usagePercentage = (creditsUsed / creditsLimit) * 100;
  const remainingCredits = creditsLimit - creditsUsed;

  const getPlanInfo = (planType: string) => {
    switch (planType) {
      case 'professional':
        return { name: 'Plan Profesional', icon: Crown, color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'clinic':
        return { name: 'Plan Clínica', icon: Building2, color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'demo':
        return { name: 'Plan Demo', icon: TestTube, color: 'bg-gray-100 text-gray-800 border-gray-200' };
      default:
        return { name: 'Plan Desconocido', icon: FileText, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'over_quota': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const planInfo = getPlanInfo(profile.plan_type ?? 'unknown');
  const PlanIcon = planInfo.icon;

  return (
    <Card className="mb-8 border-l-4 border-l-[#2E403B]">
      <CardContent className="p-6">
        {/* Fila superior: Plan y estado */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Badge className={planInfo.color} variant="outline">
              <PlanIcon className="h-4 w-4 mr-2" />
              {planInfo.name}
            </Badge>
            <div className="text-sm text-muted-foreground">
              Usuario: <span className="font-medium">{profile.full_name ?? 'Miquel'}</span>
            </div>
          </div>
          
          {profile.subscription_status === 'over_quota' && (
            <Badge variant="destructive" className="animate-pulse">
              <AlertCircle className="h-3 w-3 mr-1" />
              Límite Alcanzado
            </Badge>
          )}
        </div>

        {/* Contador principal de informes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#2E403B]" />
              <h3 className="text-lg font-semibold text-[#2E403B]">Contador de Informes</h3>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#2E403B]">
                {profile.credits_used}
                <span className="text-lg text-muted-foreground">/{profile.credits_limit}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {remainingCredits} restantes
              </div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="space-y-2">
            <Progress 
              value={usagePercentage} 
              className="h-3"
              style={{
                background: usagePercentage >= 90 ? '#fee2e2' : usagePercentage >= 70 ? '#fef3c7' : '#f0f9ff'
              }}
            />
            
            <div className="flex items-center justify-between text-xs">
              <span className={getStatusColor(profile.subscription_status ?? 'unknown')}>
                {usagePercentage.toFixed(1)}% utilizado
              </span>
              <span className="text-muted-foreground">
                Límite mensual: {profile.credits_limit}
              </span>
            </div>
          </div>

          {/* Alertas de estado */}
          {profile.subscription_status === 'warning' && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-md text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">¡Atención!</span>
              </div>
              <p className="mt-1">
                Te quedan solo {remainingCredits} informes. Considera actualizar tu plan antes de que se agoten.
              </p>
            </div>
          )}

          {profile.subscription_status === 'over_quota' && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Límite alcanzado</span>
              </div>
              <p className="mt-1">
                Has utilizado todos tus informes disponibles. Actualiza tu plan para continuar generando informes.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
