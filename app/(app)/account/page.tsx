'use client';
// src/pages/MyAccount.tsx

import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { UserProfile } from "@/lib/types";
import { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NavigationHeader } from "@/components/NavigationHeader";
import { CreditsStatus } from '@/components/CreditsStatus';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import { createClient } from "@/lib/supabase/client"; // ✅ CORREGIDO: Importación por defecto

// Definiciones de tipos para los datos del perfil
interface ProfileData {
  full_name: string | undefined;
  professional_license: string | undefined;
  clinic_name: string | undefined;
  password: string; // Campo local para la contraseña
}

export default function MyAccount() {
  const { user, profile, loading: authLoading, updateProfile } = useAuth();
  
  // Estados para la pestaña "Mis Datos Profesionales"
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: undefined,
    professional_license: undefined,
    clinic_name: undefined,
    password: "", // Inicializado vacío
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Estados para la pestaña "Suscripción y Facturación"
  const [isCancelling, setIsCancelling] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  // Cargar datos del perfil al montar el componente o cuando cambie el perfil
  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || undefined,
        professional_license: profile.professional_license || undefined,
        clinic_name: profile.clinic_name || undefined,
        password: "", // No se carga desde el perfil, es solo para el formulario
      });
    }
  }, [profile]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Cargando datos del usuario...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Debes estar autenticado para ver esta página.</p>
      </div>
    );
  }

  // Calcular créditos disponibles, manejando correctamente profile null o propiedades undefined/null
const availableCredits = profile?.credits_limit != null && profile?.credits_used != null
  ? profile.credits_limit - profile.credits_used
  : 0;

  // --- Lógica para "Mis Datos Profesionales" ---
  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      // 1. Lógica de Perfil (Base de Datos - Tipado correcto)
      // Solo enviar los campos que pertenecen a la tabla 'profiles' (UserProfile)
      const dbUpdates: Partial<UserProfile> = {
        full_name: profileData.full_name,
        professional_license: profileData.professional_license,
        clinic_name: profileData.clinic_name,
      };
      
      // Ejecutar actualización de la Base de Datos (perfil)
      await updateProfile(dbUpdates);

      // 2. Lógica de Contraseña (Servicio de Autenticación)
      if (profileData.password && profileData.password.length > 0) {
        if (profileData.password.length < 6) {
          toast.error('La contraseña debe tener al menos 6 caracteres.');
          setIsSavingProfile(false);
          return;
        }

        const supabase = createClient();
        
        // Ejecutar actualización de la Autenticación (contraseña)
        const { error: authError } = await supabase.auth.updateUser({
          password: profileData.password,
        });

        if (authError) {
          console.error("Error al actualizar la contraseña:", authError);
          toast.error('Error al actualizar la contraseña: ' + authError.message);
        } else {
          // Limpiar el campo y notificar éxito
          setProfileData(prev => ({ ...prev, password: "" }));
          toast.success('Contraseña actualizada con éxito.');
        }
      }

      toast.success('Perfil actualizado correctamente.');

    } catch (error: any) {
      console.error("Error al guardar el perfil:", error);
      toast.error(error.message || 'Error al actualizar el perfil.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- Lógica para "Suscripción y Facturación" ---

  // Función para cambiar de plan
  const handleChangePlan = async (newPlanId: 'professional' | 'clinic') => {
    if (profile?.plan_type === newPlanId) {
      toast.info('Ya tienes este plan activo.');
      return;
    }
    setIsChangingPlan(true);
    try {
      const response = await axios.post('/api/stripe/change-plan', {
        newPlanId,
      });

      const { url } = response.data;
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No se recibió la URL de Stripe.');
      }
    } catch (error: any) {
      console.error("Error al cambiar de plan:", error);
      toast.error(error.response?.data?.error || error.message || 'Error al iniciar el cambio de plan.');
    } finally {
      setIsChangingPlan(false);
    }
  };

  // Función para cancelar suscripción
  const handleCancelSubscription = async () => {
    const subscriptionId = profile?.subscription_id;
    
    if (!subscriptionId) {
      toast.error('No se encontró la suscripción.');
      return;
    }

    const confirmed = window.confirm("¿Estás seguro de que quieres cancelar tu suscripción? Se mantendrá activa hasta el final del período actual.");
    if (!confirmed) return;

    setIsCancelling(true);
    try {
      const response = await axios.post('/api/stripe/cancel-subscription', {
        subscriptionId,
      });

      if (response.data.success) {
        toast.success('Suscripción cancelada. Se mantendrá activa hasta el final del período actual.');
      } else {
        throw new Error(response.data.error || 'Error al cancelar la suscripción.');
      }
    } catch (error: any) {
      console.error("Error al cancelar la suscripción:", error);
      toast.error(error.response?.data?.error || error.message || 'Error al cancelar la suscripción.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Función para descargar factura
  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      toast.info('Descargando factura...');
      const response = await axios.get(`/api/stripe/download-invoice/${invoiceId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factura-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Factura descargada');
    } catch (error) {
      console.error('Error descargando factura:', error);
      toast.error('Error al descargar la factura.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavigationHeader />
      <main className="flex-1 px-4 py-8 lg:px-8">
        <div className="grid gap-6">
          <Tabs defaultValue="professional">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="professional">Mis Datos Profesionales</TabsTrigger>
              <TabsTrigger value="subscription">Suscripción y Facturación</TabsTrigger>
            </TabsList>

            {/* Pestaña: Mis Datos Profesionales */}
            <TabsContent value="professional" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-sans">Información Profesional</CardTitle>
                  <CardDescription className="font-sans">
                    Gestiona tus datos profesionales.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="font-sans">Nombre Completo *</Label>
                      <Input
                        id="full_name"
                        value={profileData.full_name || ""}
                        onChange={(e) => handleProfileChange('full_name', e.target.value)}
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="professional_license" className="font-sans">Número de Colegiado</Label>
                      <Input
                        id="professional_license"
                        value={profileData.professional_license || ""}
                        onChange={(e) => handleProfileChange('professional_license', e.target.value)}
                        placeholder="Número de colegiado"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clinic_name" className="font-sans">Nombre del Centro</Label>
                      <Input
                        id="clinic_name"
                        value={profileData.clinic_name || ""}
                        onChange={(e) => handleProfileChange('clinic_name', e.target.value)}
                        placeholder="Nombre de tu clínica"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-sans">Email (Login)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user.email || ""}
                        disabled={true}
                        className="bg-muted"
                      />
                      <p className="text-sm text-muted-foreground font-sans">
                        El email no se puede cambiar. Es tu identificador de acceso.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="font-sans">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        value={profileData.password}
                        onChange={(e) => handleProfileChange('password', e.target.value)}
                        placeholder="Ingresa tu nueva contraseña"
                      />
                    </div>
                    <Button className="font-sans" onClick={handleSaveProfile} disabled={isSavingProfile}>
                      <Save className="mr-2 h-4 w-4" />
                      {isSavingProfile ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pestaña: Suscripción y Facturación */}
            <TabsContent value="subscription" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-sans">Tu Suscripción</CardTitle>
                  <CardDescription className="font-sans">
                    Gestiona tu plan y el estado de tu suscripción.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Badge variant="secondary" className="font-sans text-xs px-3 py-1">
                      {profile?.plan_type === 'professional' ? 'Plan Profesional' : 'Plan Clínicas'}
                    </Badge>
                    <p className="font-sans text-sm text-foreground">
                      Estado: <span className="font-medium text-green-500">Activo</span>
                    </p>
                    <div className="space-y-2">
                      <Label className="font-sans">Créditos Restantes</Label>
                      <CreditsStatus credits={availableCredits} />
                    </div>
                    <p className="text-sm text-muted-foreground font-sans">
                      Tienes <b>{availableCredits}</b> informes restantes.
                    </p>
                    <div className="pt-4 space-y-2">
                      <h4 className="font-semibold">Cambiar de Plan:</h4>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleChangePlan('professional')}
                          disabled={isChangingPlan || profile?.plan_type === 'professional'}
                          variant={profile?.plan_type === 'professional' ? 'default' : 'outline'}
                        >
                          {isChangingPlan ? 'Procesando...' : 'Plan Profesional'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleChangePlan('clinic')}
                          disabled={isChangingPlan || profile?.plan_type === 'clinic'}
                          variant={profile?.plan_type === 'clinic' ? 'default' : 'outline'}
                        >
                          {isChangingPlan ? 'Procesando...' : 'Plan Clínicas'}
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleCancelSubscription}
                        disabled={isCancelling}
                      >
                        <X className="mr-2 h-4 w-4" />
                        {isCancelling ? 'Cancelando...' : 'Cancelar Suscripción'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sección de Facturas (CON SCROLL) */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="font-sans">Historial de Facturación</CardTitle>
                  <CardDescription className="font-sans">
                    Descarga tus facturas y consulta el historial de pagos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Contenedor con scroll */}
                  <div className="max-h-60 overflow-y-auto pr-2">
                    <div className="space-y-3">
                      {[
                        // Aquí irían tus facturas reales
                        { id: "inv_1", date: "23-08-2025", amount: "€99.00", description: "Suscripción Plan Profesional", status: "Pagado" },
                        { id: "inv_2", date: "23-09-2025", amount: "€99.00", description: "Suscripción Plan Profesional", status: "Pagado" },
                        { id: "inv_3", date: "23-10-2025", amount: "€99.00", description: "Suscripción Plan Profesional", status: "Pagado" },
                        { id: "inv_4", date: "23-11-2025", amount: "€99.00", description: "Suscripción Plan Profesional", status: "Pagado" },
                        { id: "inv_5", date: "23-12-2025", amount: "€99.00", description: "Suscripción Plan Profesional", status: "Pagado" },
                        { id: "inv_6", date: "24-01-2026", amount: "€99.00", description: "Suscripción Plan Profesional", status: "Pagado" },
                      ].map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                          <div>
                            <p className="font-sans text-sm font-medium">{invoice.description}</p>
                            <p className="font-sans text-xs text-muted-foreground">{invoice.date}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <p className="font-sans text-sm font-medium">{invoice.amount}</p>
                            <Button variant="outline" size="sm" className="font-sans" onClick={() => handleDownloadInvoice(invoice.id)}>
                              Descargar
                            </Button>
                          </div>
                        </div>
                      ))}
                      {[
                        // Esta parte se puede eliminar, es redundante
                      ].length === 0 && (
                        <p className="text-center text-muted-foreground font-sans">
                          Aún no tienes facturas.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}