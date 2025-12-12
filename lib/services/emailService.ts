// lib/services/emailService.ts
import { createClient } from '@/lib/supabase/client';

export const emailService = {
  /**
   * Envía un email de alerta de créditos bajos
   * @param userEmail - Email del usuario
   * @param creditsRemaining - Créditos restantes
   * @returns true si el email se envió exitosamente
   */
  async sendLowCreditsAlert(userEmail: string, creditsRemaining: number): Promise<boolean> {
    try {
      const supabase = createClient();
      
      // Usar la función edge de Supabase para enviar emails
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: userEmail,
          subject: `⚠️ Créditos bajos - Te quedan ${creditsRemaining} informes`,
          templateName: 'low-credits-alert',
          variables: {
            creditsRemaining,
            renewalUrl: `${window.location.origin}/my-account?tab=subscription`,
          },
        },
      });

      if (error) {
        console.error('Error sending low credits email:', error);
        return false;
      }

      console.log('✅ Email de alerta de créditos enviado exitosamente');
      return true;
    } catch (error) {
      console.error('Error en emailService.sendLowCreditsAlert:', error);
      return false;
    }
  },

  /**
   * Envía un email simple con contenido HTML
   * @param userEmail - Email del usuario
   * @param subject - Asunto del email
   * @param htmlContent - Contenido HTML del email
   * @returns true si el email se envió exitosamente
   */
  async sendCustomEmail(
    userEmail: string,
    subject: string,
    htmlContent: string
  ): Promise<boolean> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: userEmail,
          subject,
          html: htmlContent,
        },
      });

      if (error) {
        console.error('Error sending custom email:', error);
        return false;
      }

      console.log('✅ Email personalizado enviado exitosamente');
      return true;
    } catch (error) {
      console.error('Error en emailService.sendCustomEmail:', error);
      return false;
    }
  },
};
