// src/hooks/useStripeCheckout.ts
import axios from 'axios';

// Asegúrate de que esta URL base apunte a tu backend SaaS
// Deberías definirla en .env (por ejemplo, VITE_SAAS_API_URL)
const SAAS_API_BASE_URL = import.meta.env.VITE_SAAS_API_URL || 'http://localhost:8080'; // Puerto por defecto de Vite, cámbialo si es diferente para tu API SaaS

/**
 * Hook para iniciar el proceso de checkout de Stripe a través del backend SaaS.
 * @returns Una función para iniciar el checkout.
 */
export const useStripeCheckout = () => {

  /**
   * Inicia el proceso de checkout para un plan específico.
   * @param planId - El ID del plan a comprar (ej: 'professional', 'clinic').
   * @returns La URL de la sesión de Stripe o null si hay un error.
   */
  const initiateCheckout = async (planId: string): Promise<string | null> => {
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
      // Manejar errores específicos si es necesario (por ejemplo, network errors, errores del backend)
      // Puedes lanzar el error o devolver null
      return null;
    }
  };

  return { initiateCheckout };
};