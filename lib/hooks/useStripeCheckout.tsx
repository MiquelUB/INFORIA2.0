// src/hooks/useStripeCheckout.ts
// src/hooks/useStripeCheckout.ts
import axios from 'axios';
import { useState } from 'react';

// Asegúrate de que esta URL base apunte a tu backend SaaS
// Deberías definirla en .env (por ejemplo, NEXT_PUBLIC_SAAS_API_URL)
const SAAS_API_BASE_URL = process.env.NEXT_PUBLIC_SAAS_API_URL || 'http://localhost:8080'; // Puerto por defecto de Vite, cámbialo si es diferente para tu API SaaS

/**
 * Hook para iniciar el proceso de checkout de Stripe a través del backend SaaS.
 * @returns Funciones para checkout y portal de cliente.
 */
export const useStripeCheckout = () => {
  const [loading, setLoading] = useState(false);

  /**
   * Inicia el proceso de checkout para un plan específico.
   * @param planId - El ID del plan a comprar (ej: 'professional', 'clinic').
   * @returns La URL de la sesión de Stripe o null si hay un error.
   */
  const initiateCheckout = async (planId: string): Promise<string | null> => {
    setLoading(true);
    try {
      // Llama al endpoint del backend SaaS
      const response = await axios.post(`${SAAS_API_BASE_URL}/api/stripe/create-checkout`, {
        planId, // Solo se envía el planId, como se indicó en el plan
        // userId y email NO se envían aquí
      });

      // Se espera que el backend devuelva la URL de la sesión de Stripe
      const { url } = response.data;

      if (!url) {
        console.error("La respuesta del backend no contiene la URL de Stripe:", response.data);
        return null;
      }

      return url;
    } catch (error: any) {
      console.error("Error al iniciar el checkout:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handlePortalAccess = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/portal');
      const { url } = response.data;
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error al acceder al portal:", error);
      // toast.error("Error al acceder al portal de facturación");
    } finally {
      setLoading(false);
    }
  };

  return { initiateCheckout, handlePortalAccess, loading };
};

export const useStripe = useStripeCheckout;