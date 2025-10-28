// Ruta: src/services/stripe.ts (código completo y funcional)
import { Invoice, Subscription, EarlyRenewalResponse, SubscriptionPlan } from '@/types/billing';

// Configuración de planes según documentación INFORIA
const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  professional: {
    id: 'professional',
    name: 'Plan Profesional',
    price: 99,
    reports: 100,
    features: [
      '100 informes mensuales',
      'Transcripción automática de sesiones',
      'Generación de informes con IA',
      'Integración con Google Workspace',
      'Soporte estándar por email',
      'Almacenamiento seguro Zero-Knowledge'
    ],
    stripeProductId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRODUCT_ID || '',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID || ''
  },
  clinic: {
    id: 'clinic',
    name: 'Plan Clínica',
    price: 149,
    reports: 150,
    features: [
      '150 informes mensuales',
      'Transcripción automática de sesiones',
      'Generación de informes con IA',
      'Integración con Google Workspace',
      'Soporte prioritario',
      'Almacenamiento seguro Zero-Knowledge',
      'Gestión multi-profesional',
      'Dashboards analíticos avanzados'
    ],
    stripeProductId: process.env.NEXT_PUBLIC_STRIPE_CLINIC_PRODUCT_ID || '',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_CLINIC_PRICE_ID || ''
  }
};

interface StripeError {
  message: string;
  code?: string;
  type?: string;
}

interface CheckoutSessionResponse {
  url: string;
  sessionId: string;
}

interface StripeService {
  // Gestión de suscripciones
  createCheckoutSession(planId: 'professional' | 'clinic', userId: string, email?: string): Promise<CheckoutSessionResponse>;
  changePlan(subscriptionId: string, newPlanId: 'professional' | 'clinic'): Promise<boolean>;
  cancelSubscription(subscriptionId: string, immediately?: boolean): Promise<boolean>;
  
  // Renovación anticipada (funcionalidad clave de INFORIA)
  renewEarly(subscriptionId: string): Promise<EarlyRenewalResponse>;
  canRenewEarly(subscription: Subscription): boolean;
  
  // Gestión de facturas
  getInvoices(userId: string, limit?: number): Promise<Invoice[]>;
  downloadInvoice(invoiceId: string): Promise<string>;
  
  // Portal del cliente
  createCustomerPortalSession(customerId: string): Promise<{ url: string }>;
  
  // Utilidades
  getPlans(): SubscriptionPlan[];
  getPlan(planId: string): SubscriptionPlan | undefined;
  formatPrice(amount: number): string;
  
  // Webhook handling
  handleWebhook(event: any): Promise<void>;
}

class StripeServiceImplementation implements StripeService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }

  private async apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/api/stripe${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...defaultHeaders, ...options.headers },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`Stripe API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Crear sesión de checkout para nueva suscripción
  async createCheckoutSession(
    planId: 'professional' | 'clinic', 
    userId: string, 
    email?: string
  ): Promise<CheckoutSessionResponse> {
    if (!SUBSCRIPTION_PLANS[planId]) {
      throw new Error(`Plan inválido: ${planId}`);
    }

    return this.apiRequest<CheckoutSessionResponse>('/create-checkout', {
      method: 'POST',
      body: JSON.stringify({ planId, userId, email }),
    });
  }

  // Cambiar plan de suscripción
  async changePlan(subscriptionId: string, newPlanId: 'professional' | 'clinic'): Promise<boolean> {
    if (!SUBSCRIPTION_PLANS[newPlanId]) {
      throw new Error(`Plan inválido: ${newPlanId}`);
    }

    try {
      await this.apiRequest('/change-plan', {
        method: 'POST',
        body: JSON.stringify({ subscriptionId, newPlanId }),
      });
      return true;
    } catch (error) {
      console.error('Error cambiando plan:', error);
      return false;
    }
  }

  // Renovación anticipada - funcionalidad clave de INFORIA
  async renewEarly(subscriptionId: string): Promise<EarlyRenewalResponse> {
    try {
      return await this.apiRequest<EarlyRenewalResponse>('/renew-early', {
        method: 'POST',
        body: JSON.stringify({ subscriptionId }),
      });
    } catch (error) {
      return {
        success: false,
        newPeriodEnd: '',
        error: error instanceof Error ? error.message : 'Error en renovación anticipada'
      };
    }
  }

  // Verificar si puede renovar anticipadamente
  canRenewEarly(subscription: Subscription): boolean {
    const plan = SUBSCRIPTION_PLANS[subscription.planId];
    if (!plan) return false;

    // Puede renovar si ha usado más del 80% de sus informes
    const usagePercentage = (subscription.reportsUsed / subscription.reportsLimit) * 100;
    return usagePercentage >= 80;
  }

  // Obtener facturas del usuario
  async getInvoices(userId: string, limit: number = 12): Promise<Invoice[]> {
    try {
      return await this.apiRequest<Invoice[]>(`/invoices?userId=${userId}&limit=${limit}`);
    } catch (error) {
      console.error('Error obteniendo facturas:', error);
      return [];
    }
  }

  // Descargar factura específica
  async downloadInvoice(invoiceId: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stripe/download-invoice/${invoiceId}`);
      
      if (!response.ok) {
        throw new Error('Error descargando factura');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Crear enlace temporal para descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      
      return url;
    } catch (error) {
      console.error('Error descargando factura:', error);
      throw error;
    }
  }

  // Cancelar suscripción
  async cancelSubscription(subscriptionId: string, immediately: boolean = false): Promise<boolean> {
    try {
      await this.apiRequest('/cancel', {
        method: 'POST',
        body: JSON.stringify({ subscriptionId, immediately }),
      });
      return true;
    } catch (error) {
      console.error('Error cancelando suscripción:', error);
      return false;
    }
  }

  // Crear sesión del portal del cliente
  async createCustomerPortalSession(customerId: string): Promise<{ url: string }> {
    return this.apiRequest<{ url: string }>('/customer-portal', {
      method: 'POST',
      body: JSON.stringify({ customerId }),
    });
  }

  // Obtener todos los planes disponibles
  getPlans(): SubscriptionPlan[] {
    return Object.values(SUBSCRIPTION_PLANS);
  }

  // Obtener plan específico
  getPlan(planId: string): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS[planId];
  }

  // Formatear precio para mostrar
  formatPrice(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // Manejar webhooks de Stripe
  async handleWebhook(event: any): Promise<void> {
    try {
      await this.apiRequest('/webhook', {
        method: 'POST',
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Error procesando webhook:', error);
      throw error;
    }
  }
}

// Instancia singleton del servicio
export const stripeService = new StripeServiceImplementation();

// Exportar tipos y constantes útiles
export { SUBSCRIPTION_PLANS };
export type { StripeService, CheckoutSessionResponse, StripeError };

// Hook personalizado para React
export const useStripe = () => {
  return {
    service: stripeService,
    plans: SUBSCRIPTION_PLANS,
    formatPrice: stripeService.formatPrice,
  };
};

// Utilidades adicionales
export const StripeUtils = {
  // Calcular próxima fecha de facturación
  getNextBillingDate(currentPeriodEnd: string): string {
    return new Date(currentPeriodEnd).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  // Verificar si suscripción está activa
  isSubscriptionActive(status: string): boolean {
    return ['active', 'trialing'].includes(status);
  },

  // Obtener color para estado de suscripción
  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
      case 'trialing':
        return 'text-green-600 bg-green-50';
      case 'past_due':
      case 'incomplete':
        return 'text-yellow-600 bg-yellow-50';
      case 'canceled':
      case 'incomplete_expired':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  },

  // Traducciones de estados
  translateStatus(status: string): string {
    const translations: Record<string, string> = {
      'active': 'Activa',
      'trialing': 'Período de prueba',
      'past_due': 'Pago pendiente',
      'canceled': 'Cancelada',
      'incomplete': 'Incompleta',
      'incomplete_expired': 'Expirada',
      'unpaid': 'No pagada',
    };
    return translations[status] || status;
  },

  // Validar plan ID
  isValidPlan(planId: string): planId is 'professional' | 'clinic' {
    return planId === 'professional' || planId === 'clinic';
  },
};