// Ruta: src/components/PricingCards.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Users, Building2 } from 'lucide-react';

interface PricingPlan {
  id: 'professional' | 'clinic';
  name: string;
  price: number;
  period: string;
  reports: number;
  icon: React.ReactNode;
  features: string[];
  recommended?: boolean;
  description: string;
}

interface PricingCardsProps {
  currentPlan?: 'professional' | 'clinic';
  onPlanSelect?: (planId: 'professional' | 'clinic') => void;
  showCurrentPlan?: boolean;
}

export const PricingCards: React.FC<PricingCardsProps> = ({
  currentPlan,
  onPlanSelect,
  showCurrentPlan = false
}) => {
  const plans: PricingPlan[] = [
    {
      id: 'professional',
      name: 'Plan Profesional',
      price: 99,
      period: 'mes',
      reports: 100,
      icon: <Users className="h-6 w-6" />,
      description: 'Perfecto para psicólogos autónomos',
      features: [
        '100 informes mensuales',
        'Transcripción automática de sesiones',
        'Generación de informes con IA',
        'Integración con Google Workspace',
        'Soporte estándar por email',
        'Almacenamiento seguro Zero-Knowledge'
      ]
    },
    {
      id: 'clinic',
      name: 'Plan Clínica',
      price: 149,
      period: 'mes',
      reports: 150,
      icon: <Building2 className="h-6 w-6" />,
      description: 'Ideal para clínicas y centros de psicología',
      recommended: true,
      features: [
        '150 informes mensuales',
        'Transcripción automática de sesiones',
        'Generación de informes con IA',
        'Integración con Google Workspace',
        'Soporte prioritario',
        'Almacenamiento seguro Zero-Knowledge',
        'Gestión multi-profesional',
        'Dashboards analíticos avanzados'
      ]
    }
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {plans.map((plan) => (
        <Card 
          key={plan.id}
          className={`relative transition-all duration-200 hover:shadow-lg ${
            plan.recommended ? 'border-primary shadow-md' : ''
          } ${
            currentPlan === plan.id ? 'ring-2 ring-primary/20' : ''
          }`}
        >
          {plan.recommended && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground font-sans text-sm px-3 py-1">
                <Star className="h-3 w-3 mr-1" />
                Recomendado
              </Badge>
            </div>
          )}
          
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-2 text-primary">
              {plan.icon}
            </div>
            <CardTitle className="font-serif text-xl">{plan.name}</CardTitle>
            <CardDescription className="font-sans text-sm text-muted-foreground">
              {plan.description}
            </CardDescription>
            <div className="mt-4">
              <div className="flex items-baseline justify-center">
                <span className="text-4xl font-bold text-foreground">{plan.price}€</span>
                <span className="text-muted-foreground ml-1">/{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {plan.reports} informes incluidos
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-sans text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            
            {showCurrentPlan && currentPlan === plan.id ? (
              <Button 
                disabled 
                variant="outline" 
                className="w-full font-sans"
              >
                Plan Actual
              </Button>
            ) : (
              <Button 
                onClick={() => onPlanSelect?.(plan.id)}
                className={`w-full font-sans ${
                  plan.recommended 
                    ? 'bg-primary hover:bg-primary/90' 
                    : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                }`}
                variant={plan.recommended ? 'default' : 'secondary'}
              >
                {currentPlan ? 'Cambiar a este plan' : 'Seleccionar plan'}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};