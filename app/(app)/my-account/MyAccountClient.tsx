// Ruta: app/(main)/my-account/MyAccountClient.tsx
"use client";

import { useState, useEffect } from "react";
// CAMBIO: Imports de 'next/navigation' en lugar de 'react-router-dom'
import { useSearchParams, useRouter } from "next/navigation";
import { useUserProfile } from "@/lib/hooks/useUserProfile"; // Asumiendo que existe
import { ProfessionalDataSection } from "@/components/ProfessionalDataSection";
import { SubscriptionSection } from "@/components/SubscriptionSection";
import { BillingSection } from "@/components/BillingSection";
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface BillingFormData {
  full_name: string;
  professional_license: string;
  billing_name: string;
  billing_email: string;
  phone: string;
  billing_address: string;
  billing_city: string;
  billing_postal_code: string;
  billing_country: string;
  nif_dni: string;
}

export default function MyAccountClient() {
  // CAMBIO: Hooks de Next.js
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase.auth]);

  // Asumiendo que tu hook 'useUserProfile' obtiene los datos del psicólogo
  // (nombre, email, plan actual, créditos restantes) desde Supabase.
  const { data: profile, isLoading: profileLoading, refetch } = useUserProfile(user?.id || null);

  const [loading, setLoading] = useState(false);

  const handleSaveChanges = async (formData: BillingFormData) => {
    if (!profile) return;

    const missingFields = validateForm(formData);
    if (missingFields.length > 0) {
      toast({
        title: "Campos obligatorios incompletos",
        description: `Faltan: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name.trim(),
          professional_license: formData.professional_license.trim(),
          billing_name: formData.billing_name.trim(),
          billing_email: formData.billing_email.trim(),
          phone: formData.phone.trim(),
          billing_address: formData.billing_address.trim(),
          billing_city: formData.billing_city.trim(),
          billing_postal_code: formData.billing_postal_code.trim(),
          billing_country: formData.billing_country,
          nif_dni: formData.nif_dni.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;

      refetch();

      toast({
        title: "Datos guardados correctamente",
        description: "Tu información profesional y de facturación está actualizada."
      });

    } catch (error) {
      console.error('Error saving billing data:', error);
      toast({
        title: "Error al guardar",
        description: "No se pudieron guardar los cambios. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (formData: BillingFormData) => {
    const required = ['full_name', 'professional_license', 'billing_name', 'billing_email', 'phone', 'billing_address', 'billing_city', 'billing_postal_code', 'nif_dni'];
    const missing = required.filter(field => !formData[field as keyof BillingFormData]?.trim());
    return missing;
  };

  useEffect(() => {
    // Lógica para verificar sesión de Stripe (ver checklist de QA)
    const checkStripeSession = async (sessionId: string) => {
      setLoading(true);
      try {
        // La API Route ya fue migrada a app/api/stripe/verify-session/...
        const res = await fetch(`/api/stripe/verify-session/${sessionId}`);
        if (!res.ok) throw new Error("Falló la verificación de la sesión");

        const sessionData = await res.json();

        if (sessionData.status === 'paid' || sessionData.status === 'complete') {
          toast({
            title: "Suscripción activada",
            description: "¡Tu cuenta ha sido actualizada con éxito!",
            variant: "default",
          });

          // Refrescamos los datos del usuario (créditos, plan)
          if (refetch) refetch();

        } else {
          toast({
            title: "Pago no completado",
            description: "El pago de tu suscripción no se ha completado.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Error al verificar pago",
          description: "Hubo un error al verificar el estado de tu pago.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        // CAMBIO: Limpiamos la URL usando el router de Next.js
        router.replace('/my-account');
      }
    };

    // Leemos el 'session_id' de la URL (ej: /my-account?session_id=...)
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      checkStripeSession(sessionId);
    }
  }, [searchParams, router, refetch, toast]);

  if (profileLoading || loading || !profile) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-primary mb-2">
          Mi Cuenta
        </h1>
        <p className="text-muted-foreground">
          Gestiona tu información profesional, suscripción y facturación.
        </p>
      </div>

      <div className="space-y-8">
        {/* Sección de Datos Profesionales */}
        {/* Este componente recibe los datos del perfil */}
        <ProfessionalDataSection />

        {/* Sección de Suscripción y Créditos */}
        {/* Este componente gestiona la lógica de 'create-checkout' */}
        <SubscriptionSection />

        {/* Sección de Facturación */}
        {/* Este componente muestra el historial o portal de Stripe */}
        <BillingSection profile={profile} />
      </div>
    </main>
  );
}
