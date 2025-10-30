// Ruta: src/components/SubscriptionSection.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreditCard, Download, Check, Crown, Building2, TestTube, FileText, Calendar } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

const plans = [
  {
    id: 'professional',
    name: 'Plan Profesional',
    price: '99€',
    period: '/mes',
    icon: Crown,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    features: [
      '100 informes por mes',
      'Todos los tipos de informes',
      'Integración con Google Drive',
      'Soporte por email',
      'Firma digital profesional'
    ],
    popular: true
  },
  {
    id: 'clinic',
    name: 'Plan Clínica',
    price: '299€',
    period: '/mes',
    icon: Building2,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    features: [
      '500 informes por mes',
      'Multi-usuario (hasta 5)',
      'Gestión de pacientes avanzada',
      'Reportes estadísticos',
      'Soporte prioritario',
      'API personalizada'
    ]
  },
  {
    id: 'demo',
    name: 'Plan Demo',
    price: '0€',
    period: '/mes',
    icon: TestTube,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    features: [
      '5 informes por mes',
      'Funcionalidades básicas',
      'Soporte limitado',
      'Válido por 30 días'
    ]
  }
];

const mockInvoices = [
  {
    id: 'INV-2025-001',
    date: '2025-01-01',
    concept: 'Plan Profesional - Enero 2025',
    amount: '99,00 €',
    status: 'paid',
    downloadUrl: '#'
  },
  {
    id: 'INV-2024-012',
    date: '2024-12-01',
    concept: 'Plan Profesional - Diciembre 2024',
    amount: '99,00 €',
    status: 'paid',
    downloadUrl: '#'
  },
  {
    id: 'INV-2024-011',
    date: '2024-11-01',
    concept: 'Plan Profesional - Noviembre 2024',
    amount: '99,00 €',
    status: 'paid',
    downloadUrl: '#'
  },
  {
    id: 'INV-2024-010',
    date: '2024-10-01',
    concept: 'Plan Profesional - Octubre 2024',
    amount: '99,00 €',
    status: 'paid',
    downloadUrl: '#'
  },
  {
    id: 'INV-2024-009',
    date: '2024-09-01',
    concept: 'Plan Profesional - Septiembre 2024',
    amount: '99,00 €',
    status: 'paid',
    downloadUrl: '#'
  }
];

export function SubscriptionSection() {
  const { user } = useAuth();
  const { data: profile } = useUserProfile(user?.id || null);

  const currentPlan = plans.find(plan => plan.id === profile?.plan_type) || plans[0];
  
  const handlePlanChange = (planId: string) => {
    // TODO: Integrar con Stripe para cambio de plan
    console.log('Cambiar a plan:', planId);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // TODO: Implementar descarga real de facturas
    console.log('Descargar factura:', invoiceId);
  };

  return (
    <div className="space-y-6">
      {/* Plan actual */}
      <Card className="border-l-4 border-l-[#2E403B]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2E403B] font-lora">
            <CreditCard className="h-5 w-5" />
            Tu Suscripción Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${currentPlan.color}`}>
                <currentPlan.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{currentPlan.name}</h3>
                <p className="text-muted-foreground">
                  {currentPlan.price}{currentPlan.period}
                </p>
              </div>
            </div>
            
            {profile && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Uso actual</p>
                <p className="text-lg font-semibold">
                  {profile.credits_used}/{profile.credits_limit} informes
                </p>
                <Progress 
                  value={(profile.credits_used / profile.credits_limit) * 100} 
                  className="w-32 h-2 mt-2" 
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Planes disponibles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2E403B] font-lora">
            <Crown className="h-5 w-5" />
            Planes Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const PlanIcon = plan.icon;
              const isCurrentPlan = plan.id === profile?.plan_type;
              
              return (
                <div 
                  key={plan.id}
                  className={`relative border rounded-lg p-6 ${
                    plan.popular ? 'border-[#2E403B] shadow-lg' : 'border-gray-200'
                  } ${isCurrentPlan ? 'bg-blue-50' : 'bg-white'}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#2E403B] text-white">
                      Más Popular
                    </Badge>
                  )}
                  
                  {isCurrentPlan && (
                    <Badge className="absolute -top-3 right-4 bg-green-500 text-white">
                      Plan Actual
                    </Badge>
                  )}

                  <div className="text-center mb-6">
                    <div className={`mx-auto w-12 h-12 rounded-full ${plan.color} flex items-center justify-center mb-4`}>
                      <PlanIcon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-[#2E403B]">
                      {plan.price}
                      <span className="text-lg font-normal text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handlePlanChange(plan.id)}
                    disabled={isCurrentPlan}
                    className="w-full"
                    variant={plan.popular && !isCurrentPlan ? "default" : "outline"}
                  >
                    {isCurrentPlan ? 'Plan Actual' : 'Cambiar Plan'}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Historial de facturas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2E403B] font-lora">
            <FileText className="h-5 w-5" />
            Historial de Facturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-80 overflow-y-auto">
            <div className="space-y-3">
              {mockInvoices.map((invoice) => (
                <div 
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.concept}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(invoice.date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{invoice.amount}</p>
                      <Badge 
                        variant="secondary" 
                        className="bg-green-100 text-green-800"
                      >
                        Pagada
                      </Badge>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {mockInvoices.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay facturas disponibles</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card>
        <CardContent className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-1">
                <CreditCard className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Gestión de pagos
                </h4>
                <p className="text-sm text-blue-700">
                  Los cambios de plan y la gestión de métodos de pago se realizarán 
                  a través de Stripe. Esta funcionalidad estará disponible próximamente.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}