'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation'; // ✅ IMPORTACIÓN CORRECTA
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { 
  User, 
  IdCard, 
  Phone, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft 
} from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  {
    id: 'basic',
    title: 'Información Básica',
    description: 'Datos personales y profesionales',
    icon: User
  },
  {
    id: 'professional',
    title: 'Datos Profesionales',
    description: 'Número de colegiado y consulta',
    icon: IdCard
  },
  {
    id: 'contact',
    title: 'Información de Contacto',
    description: 'Teléfono y detalles adicionales',
    icon: Phone
  },
  {
    id: 'complete',
    title: 'Completado',
    description: '¡Todo listo para comenzar!',
    icon: CheckCircle2
  }
];

export default function Onboarding() {
  const { profile, updateProfile } = useAuth();
  const router = useRouter(); // ✅ HOOK CORRECTO
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    professional_license: profile?.professional_license || '',
    clinic_name: profile?.clinic_name || '',
    phone: profile?.phone || ''
  });

  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleNext = () => {
    // Validar paso actual
    if (currentStep === 0 && !formData.full_name.trim()) {
      toast.error('Por favor ingresa tu nombre completo');
      return;
    }
    if (currentStep === 1 && !formData.professional_license.trim()) {
      toast.error('Por favor ingresa tu número de colegiado');
      return;
    }

    if (currentStep < STEPS.length - 2) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!formData.full_name.trim() || !formData.professional_license.trim()) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        ...formData,
        onboarding_completed: true
      });
      
      setCurrentStep(STEPS.length - 1); // Ir al paso de completado
      
      setTimeout(() => {
        // ✅ CORRECCIÓN CRÍTICA: Usar router.replace() en lugar de navigate()
        router.replace('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Error al completar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const CurrentStepIcon = STEPS[currentStep].icon;

  return (
    <AuthGuard requireOnboarding={false}>
      <div className="min-h-screen bg-inforia-cream flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="h-10 w-10 bg-gold rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-lg font-serif">i</span>
              </div>
              <span className="text-2xl font-serif font-semibold text-primary">
                iNFORiA
              </span>
            </div>
            
            <div>
              <CardTitle className="text-2xl font-serif text-primary mb-2">
                ¡Bienvenido a INFORIA!
              </CardTitle>
              <CardDescription>
                Completa tu perfil profesional para comenzar
              </CardDescription>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Paso {currentStep + 1} de {STEPS.length}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {currentStep < STEPS.length - 1 ? (
              <div className="space-y-6">
                {/* Step Header */}
                <div className="flex items-center space-x-3 p-4 bg-inforia-cream rounded-lg">
                  <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                    <CurrentStepIcon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">
                      {STEPS[currentStep].title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {STEPS[currentStep].description}
                    </p>
                  </div>
                </div>

                {/* Step Content */}
                <div className="space-y-4">
                  {currentStep === 0 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="full_name">
                          Nombre Completo *
                          <span className="text-xs text-muted-foreground ml-2">
                            (Como aparece en tu título profesional)
                          </span>
                        </Label>
                        <Input
                          id="full_name"
                          type="text"
                          placeholder="Dr. María García López"
                          value={formData.full_name}
                          onChange={handleInputChange('full_name')}
                          className="mt-1"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="professional_license">
                          Número de Colegiado *
                          <span className="text-xs text-muted-foreground ml-2">
                            (Colegio Oficial de Psicólogos)
                          </span>
                        </Label>
                        <Input
                          id="professional_license"
                          type="text"
                          placeholder="M-12345, AN-67890, etc."
                          value={formData.professional_license}
                          onChange={handleInputChange('professional_license')}
                          className="mt-1"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="clinic_name">
                          Nombre de la Consulta
                          <span className="text-xs text-muted-foreground ml-2">
                            (Opcional)
                          </span>
                        </Label>
                        <Input
                          id="clinic_name"
                          type="text"
                          placeholder="Centro de Psicología García"
                          value={formData.clinic_name}
                          onChange={handleInputChange('clinic_name')}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="phone">
                          Teléfono
                          <span className="text-xs text-muted-foreground ml-2">
                            (Opcional)
                          </span>
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+34 600 000 000"
                          value={formData.phone}
                          onChange={handleInputChange('phone')}
                          className="mt-1"
                        />
                      </div>

                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">
                          🔒 Privacidad y Seguridad
                        </h4>
                        <p className="text-sm text-blue-800">
                          INFORIA utiliza un modelo de "conocimiento cero". Los informes de 
                          tus pacientes se guardan directamente en tu Google Drive personal, 
                          nunca en nuestros servidores.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 0 || loading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Anterior
                  </Button>

                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={loading}
                    variant="inforia"
                  >
                    {currentStep === STEPS.length - 2 ? (
                      loading ? 'Completando...' : 'Completar Configuración'
                    ) : (
                      <>
                        Siguiente
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              // Completion step
              <div className="text-center space-y-6 py-8">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-primary mb-2">
                    ¡Configuración Completada!
                  </h3>
                  <p className="text-muted-foreground">
                    Tu perfil ha sido configurado exitosamente. 
                    Serás redirigido al dashboard en breve.
                  </p>
                </div>

                <div className="animate-pulse">
                  <p className="text-sm text-muted-foreground">
                    Redirigiendo a tu Puesto de Mando Clínico...
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}