// src/components/CreditsStatus.tsx
// Eliminada la importación: import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { creditsService } from '@/services/credits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Definición de props
interface CreditsStatusProps {
  credits?: number; // Hacerlo opcional para mantener compatibilidad
}

export function CreditsStatus({ credits }: CreditsStatusProps) {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: creditsService.getUserProfile,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="animate-pulse h-4 bg-secondary rounded"></div>
        </CardContent>
      </Card>
    );
  }

  // Si se pasa credits como prop, usarlo. Si no, calcularlo del perfil
  const creditsToUse = credits !== undefined 
    ? credits 
    : profile && profile.credits_limit !== null && profile.credits_used !== null
      ? profile.credits_limit - profile.credits_used 
      : 0;

  // Si no tenemos profile ni credits, mostrar estado vacío
  if (!profile && credits === undefined) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            Datos no disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  // Usar datos del profile o valores por defecto, manejando nulls
  const planType = profile?.plan_type || 'professional';
  const subscriptionStatus = profile?.subscription_status || 'active';
  const creditsUsed = profile?.credits_used ?? 0;
  const creditsLimit = profile?.credits_limit ?? 100; // Valor por defecto
  
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
    <Card className="w-full">
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
  );
}