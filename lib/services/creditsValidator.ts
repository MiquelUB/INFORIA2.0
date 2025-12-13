// lib/services/creditsValidator.ts
/**
 * Servicio de validación de créditos
 * Verifica que el sistema de descuento de créditos funciona correctamente
 */

import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export interface ValidationResult {
  success: boolean;
  message: string;
  details: {
    userExists: boolean;
    profileExists: boolean;
    hasCreditsLimit: boolean;
    hasCreditsUsed: boolean;
    creditsLimit?: number;
    creditsUsed?: number;
    availableCredits?: number;
    beforeDecrement?: { credits_limit: number; credits_used: number };
    afterDecrement?: { credits_limit: number; credits_used: number };
    decrementAmount?: number;
    decrementSuccessful?: boolean;
    error?: string;
  };
}

export const creditsValidator = {
  /**
   * Valida que el usuario actual tiene créditos configurados
   */
  async validateUserCredits(): Promise<ValidationResult> {
    const supabase = createClient();
    
    try {
      // 1. Obtener usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return {
          success: false,
          message: 'No hay usuario autenticado',
          details: {
            userExists: false,
            profileExists: false,
            hasCreditsLimit: false,
            hasCreditsUsed: false,
            error: userError?.message || 'Usuario no autenticado',
          },
        };
      }

      // 2. Obtener perfil del usuario
      const { data: profile, error: profileError } = await (supabase
        .from('profiles') as any)
        .select('id, credits_limit, credits_used, full_name, plan_type')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        return {
          success: false,
          message: 'No se encontró perfil de usuario',
          details: {
            userExists: true,
            profileExists: false,
            hasCreditsLimit: false,
            hasCreditsUsed: false,
            error: profileError?.message || 'Perfil no encontrado',
          },
        };
      }

      // 3. Validar que existen los campos de créditos
      const hasCreditsLimit = profile.credits_limit !== null && profile.credits_limit !== undefined;
      const hasCreditsUsed = profile.credits_used !== null && profile.credits_used !== undefined;

      if (!hasCreditsLimit || !hasCreditsUsed) {
        return {
          success: false,
          message: 'Los campos de créditos no están configurados',
          details: {
            userExists: true,
            profileExists: true,
            hasCreditsLimit,
            hasCreditsUsed,
            creditsLimit: profile.credits_limit ?? undefined,
            creditsUsed: profile.credits_used ?? undefined,
            error: 'Faltan campos de créditos en la tabla profiles',
          },
        };
      }

      const availableCredits = (profile.credits_limit ?? 0) - (profile.credits_used ?? 0);

      return {
        success: true,
        message: `✅ Créditos validados correctamente. Usuario: ${profile.full_name || user.email}`,
        details: {
          userExists: true,
          profileExists: true,
          hasCreditsLimit: true,
          hasCreditsUsed: true,
          creditsLimit: profile.credits_limit ?? undefined,
          creditsUsed: profile.credits_used ?? undefined,
          availableCredits,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error durante la validación de créditos',
        details: {
          userExists: false,
          profileExists: false,
          hasCreditsLimit: false,
          hasCreditsUsed: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        },
      };
    }
  },

  /**
   * Realiza un test de descuento de 1 crédito (REVERSIBLE)
   * Solo para testing - descuenta y luego devuelve el crédito
   */
  async testCreditDecrement(): Promise<ValidationResult> {
    const supabase = createClient();
    
    try {
      // 1. Obtener usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return {
          success: false,
          message: 'No hay usuario autenticado',
          details: {
            userExists: false,
            profileExists: false,
            hasCreditsLimit: false,
            hasCreditsUsed: false,
          },
        };
      }

      // 2. Obtener créditos actuales
      const { data: beforeProfile, error: fetchError } = await (supabase
        .from('profiles') as any)
        .select('credits_limit, credits_used')
        .eq('id', user.id)
        .single();

      if (fetchError || !beforeProfile) {
        return {
          success: false,
          message: 'No se pudo obtener el perfil del usuario',
          details: {
            userExists: true,
            profileExists: false,
            hasCreditsLimit: false,
            hasCreditsUsed: false,
            error: fetchError?.message,
          },
        };
      }

      const beforeCreditsUsed = beforeProfile.credits_used || 0;
      const beforeCreditsLimit = beforeProfile.credits_limit || 0;

      // 3. Validar que hay créditos disponibles
      if (beforeCreditsUsed >= beforeCreditsLimit) {
        return {
          success: false,
          message: 'No hay créditos disponibles para el test de descuento',
          details: {
            userExists: true,
            profileExists: true,
            hasCreditsLimit: true,
            hasCreditsUsed: true,
            creditsLimit: beforeCreditsLimit,
            creditsUsed: beforeCreditsUsed,
            availableCredits: beforeCreditsLimit - beforeCreditsUsed,
            error: 'Créditos insuficientes',
          },
        };
      }

      // 4. Descontar 1 crédito (TEST)
      const newCreditsUsed = beforeCreditsUsed + 1;
      const { error: decrementError } = await (supabase
        .from('profiles') as any)
        .update({ credits_used: newCreditsUsed })
        .eq('id', user.id);

      if (decrementError) {
        return {
          success: false,
          message: 'Error al descontar crédito',
          details: {
            userExists: true,
            profileExists: true,
            hasCreditsLimit: true,
            hasCreditsUsed: true,
            beforeDecrement: {
              credits_limit: beforeCreditsLimit,
              credits_used: beforeCreditsUsed,
            },
            decrementAmount: 1,
            decrementSuccessful: false,
            error: decrementError.message,
          },
        };
      }

      // 5. Verificar que el descuento se realizó
      const { data: afterProfile, error: verifyError } = await (supabase
        .from('profiles') as any)
        .select('credits_used')
        .eq('id', user.id)
        .single();

      if (verifyError || !afterProfile) {
        return {
          success: false,
          message: 'Error al verificar el descuento',
          details: {
            userExists: true,
            profileExists: true,
            hasCreditsLimit: true,
            hasCreditsUsed: true,
            beforeDecrement: {
              credits_limit: beforeCreditsLimit,
              credits_used: beforeCreditsUsed,
            },
            decrementAmount: 1,
            decrementSuccessful: false,
            error: verifyError?.message,
          },
        };
      }

      const afterCreditsUsed = afterProfile.credits_used || 0;
      const isDecremented = afterCreditsUsed === newCreditsUsed;

      // 6. REVERTIR EL DESCUENTO (importante para testing)
      const { error: revertError } = await (supabase
        .from('profiles') as any)
        .update({ credits_used: beforeCreditsUsed })
        .eq('id', user.id);

      if (revertError) {
        console.warn('⚠️ Error al revertir el descuento de test:', revertError);
      }

      return {
        success: isDecremented && !revertError,
        message: isDecremented 
          ? '✅ Test de descuento completado exitosamente (crédito revertido)'
          : '❌ El descuento no se aplicó correctamente',
        details: {
          userExists: true,
          profileExists: true,
          hasCreditsLimit: true,
          hasCreditsUsed: true,
          creditsLimit: beforeCreditsLimit,
          beforeDecrement: {
            credits_limit: beforeCreditsLimit,
            credits_used: beforeCreditsUsed,
          },
          afterDecrement: {
            credits_limit: beforeCreditsLimit,
            credits_used: afterCreditsUsed,
          },
          decrementAmount: 1,
          decrementSuccessful: isDecremented,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error durante el test de descuento',
        details: {
          userExists: false,
          profileExists: false,
          hasCreditsLimit: false,
          hasCreditsUsed: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        },
      };
    }
  },

  /**
   * Obtiene un resumen completo de los créditos del usuario
   */
  async getCreditsReport(): Promise<ValidationResult> {
    const supabase = createClient();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          message: 'No hay usuario autenticado',
          details: {
            userExists: false,
            profileExists: false,
            hasCreditsLimit: false,
            hasCreditsUsed: false,
          },
        };
      }

      const { data: profile } = await (supabase
        .from('profiles') as any)
        .select('full_name, plan_type, credits_limit, credits_used, created_at, updated_at')
        .eq('id', user.id)
        .single();

      if (!profile) {
        return {
          success: false,
          message: 'Perfil no encontrado',
          details: {
            userExists: true,
            profileExists: false,
            hasCreditsLimit: false,
            hasCreditsUsed: false,
          },
        };
      }

      const creditsLimit = profile.credits_limit || 0;
      const creditsUsed = profile.credits_used || 0;
      const availableCredits = creditsLimit - creditsUsed;
      const percentageUsed = creditsLimit > 0 ? Math.round((creditsUsed / creditsLimit) * 100) : 0;

      return {
        success: true,
        message: `📊 Reporte de Créditos - ${profile.full_name || user.email}`,
        details: {
          userExists: true,
          profileExists: true,
          hasCreditsLimit: true,
          hasCreditsUsed: true,
          creditsLimit,
          creditsUsed,
          availableCredits,
          // Información adicional para el reporte
          ...(profile as any), // spread del perfil completo
          percentageUsed,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener el reporte de créditos',
        details: {
          userExists: false,
          profileExists: false,
          hasCreditsLimit: false,
          hasCreditsUsed: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        },
      };
    }
  },

  /**
   * Imprime un reporte formateado en consola
   */
  printReport(result: ValidationResult): void {
    console.group('📊 VALIDACIÓN DE CRÉDITOS');
    console.log('Estado:', result.success ? '✅ EXITOSO' : '❌ FALLIDO');
    console.log('Mensaje:', result.message);
    console.table(result.details);
    console.groupEnd();
  },
};
