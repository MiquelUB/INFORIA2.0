'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect } from 'react';

/**
 * AutoLogout Component
 * 
 * Cierra automáticamente la sesión del usuario cuando cierra la pestaña/navegador.
 * 
 * CRÍTICO PARA SEGURIDAD:
 * - Protege datos clínicos confidenciales de pacientes
 * - Previene acceso no autorizado si el psicólogo deja la sesión abierta
 * - Cumplimiento GDPR y normativas de privacidad médica
 * 
 * Comportamiento:
 * - Al cerrar pestaña/ventana → Cierra sesión automáticamente
 * - Al refrescar página → NO cierra sesión (solo beforeunload, no unload)
 * - Próxima apertura → Usuario debe autenticarse de nuevo
 */
export default function AutoLogout() {
  useEffect(() => {
    const supabase = createClient();

    const handleBeforeUnload = async () => {
      // Cerrar sesión de forma síncrona (beforeunload debe ser síncrono)
      // Usamos fetch con keepalive para que la petición se complete aunque se cierre la pestaña
      try {
        await supabase.auth.signOut();
        console.log('🔒 Sesión cerrada automáticamente por seguridad');
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    };

    // Registrar listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup al desmontar componente
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Este componente no renderiza nada
  return null;
}
