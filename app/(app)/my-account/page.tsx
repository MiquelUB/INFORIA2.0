'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from "@/lib/supabase/client";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditsStatus } from '@/components/CreditsStatus';
import SeatsManager from '@/components/SeatsManager';
import { BillingSection } from '@/components/BillingSection';
import { toast } from 'sonner';
import { Save, ExternalLink, Loader2 } from "lucide-react";

// URL de tu Landing Page (sección de precios)
const LANDING_PRICING_URL = "https://inforia.pro/#pricing"; 

import { useStripe } from "@/lib/hooks/useStripeCheckout";

function BillingPortalButton() {
  const { handlePortalAccess, loading } = useStripe();

  return (
    <Button 
      variant="destructive" 
      onClick={() => handlePortalAccess()} 
      disabled={loading}
      className="w-full sm:w-auto"
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Cancelar Suscripción
    </Button>
  );
}

interface ProfileData {
  full_name: string | undefined;
  professional_license: string | undefined;
  clinic_name: string | undefined;
}

export default function AccountPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Fetch User
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
    };
    getUser();
  }, [supabase]);

  // Fetch Profile
  const { data: profile, refetch: refetchProfile, isLoading: profileLoading } = useUserProfile(user?.id || null);

  // Profile Form State
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: undefined,
    professional_license: undefined,
    clinic_name: undefined,
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Sync profile data to form
  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || undefined,
        professional_license: profile.professional_license || undefined,
        clinic_name: profile.clinic_name || undefined,
      });
    }
  }, [profile]);

  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSavingProfile(true);
    try {
      // Update Profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          professional_license: profileData.professional_license,
          clinic_name: profileData.clinic_name,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;
      
      toast.success('Perfil actualizado correctamente.');
      refetchProfile();
      
    } catch (error) {
      console.error("Error al guardar el perfil:", error);
      toast.error((error as Error).message || 'Error al actualizar el perfil.');
    } finally {
      setIsSavingProfile(false);
    }
    
  };

  if (authLoading || profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Debes estar autenticado para ver esta página.</p>
      </div>
    );
  }

  // Determinar si el plan actual soporta seats
  const isTeamPlan = profile.plan_type === 'clinic' || profile.plan_type === 'professional';

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* NavigationHeader removed to avoid duplication */}
      <main className="flex-1 overflow-y-auto px-4 py-8 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Mi Cuenta</h1>
        
        <Tabs defaultValue="professional" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="professional">Mis Datos Profesionales</TabsTrigger>
            <TabsTrigger value="subscription">Suscripción y Facturación</TabsTrigger>
          </TabsList>

          {/* Tab: Mis Datos Profesionales */}
          <TabsContent value="professional">
            <Card>
              <CardHeader>
                <CardTitle>Información Profesional</CardTitle>
                <CardDescription>
                  Gestiona tus datos profesionales y de acceso.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nombre Completo *</Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name || ""}
                      onChange={(e) => handleProfileChange('full_name', e.target.value)}
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="professional_license">Número de Colegiado</Label>
                    <Input
                      id="professional_license"
                      value={profileData.professional_license || ""}
                      onChange={(e) => handleProfileChange('professional_license', e.target.value)}
                      placeholder="Número de colegiado"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinic_name">Nombre del Centro</Label>
                    <Input
                      id="clinic_name"
                      value={profileData.clinic_name || ""}
                      onChange={(e) => handleProfileChange('clinic_name', e.target.value)}
                      placeholder="Nombre de tu clínica"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Login)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email || ""}
                      disabled={true}
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      El email no se puede cambiar. Es tu identificador de acceso.
                    </p>
                  </div>
                  <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSavingProfile ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Suscripción y Facturación */}
          <TabsContent value="subscription" className="space-y-6">
            
            {/* 1. Créditos */}
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Uso de Créditos</Label>
              <CreditsStatus credits={profile.credits_limit ? profile.credits_limit - (profile.credits_used || 0) : 0} />
            </div>

            {/* 2. Gestión de Equipo (Seats) */}
            {isTeamPlan && (
              <SeatsManager 
                currentPlanId={profile.plan_type || 'professional'}
                userCredits={profile.credits_limit ? profile.credits_limit - (profile.credits_used || 0) : 0}
                onCreditsChange={refetchProfile}
                user={user}
              />
            )}

            {/* 3. Enlace a Landing Page para cambios de plan */}
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Suscripción</CardTitle>
                <CardDescription>
                  Gestiona tu plan actual o cancela tu suscripción.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild className="w-full sm:w-auto">
                    <a href={LANDING_PRICING_URL} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver Planes y Precios
                    </a>
                  </Button>
                  
                  <BillingPortalButton />
                </div>
                <p className="text-sm text-muted-foreground">
                  Para cancelar tu suscripción, accede al portal seguro de Stripe usando el botón &quot;Cancelar Suscripción&quot;.
                </p>
              </CardContent>
            </Card>

            {/* 4. Portal de Facturación (Stripe) */}
            <BillingSection profile={profile} />
            
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}