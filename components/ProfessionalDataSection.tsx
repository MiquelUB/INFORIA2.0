// Ruta: src/components/ProfessionalDataSection.tsx (versión sin foto de perfil)
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Loader2, User, FileText, Phone, Mail, MapPin } from 'lucide-react';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

export function ProfessionalDataSection() {
  const supabase = createClient();
  const { user } = useAuth();
  const { data: profile, isLoading, refetch: refreshProfile } = useUserProfile(user?.id || null);
  const [formData, setFormData] = useState<BillingFormData>({
    full_name: '',
    professional_license: '',
    billing_name: '',
    billing_email: '',
    phone: '',
    billing_address: '',
    billing_city: '',
    billing_postal_code: '',
    billing_country: 'ES',
    nif_dni: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Inicializar formulario cuando se carguen los datos
  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        professional_license: profile.professional_license || '',
        billing_name: profile.billing_name || '',
        billing_email: profile.billing_email || '',
        phone: profile.phone || '',
        billing_address: profile.billing_address || '',
        billing_city: profile.billing_city || '',
        billing_postal_code: profile.billing_postal_code || '',
        billing_country: profile.billing_country || 'ES',
        nif_dni: profile.nif_dni || ''
      });
    }
  }, [profile]);

  const handleInputChange = (field: keyof BillingFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const required = ['full_name', 'professional_license', 'billing_name', 'billing_email', 'phone', 'billing_address', 'billing_city', 'billing_postal_code', 'nif_dni'];
    const missing = required.filter(field => !formData[field as keyof BillingFormData]?.trim());
    return missing;
  };

  const handleSaveChanges = async () => {
    if (!profile) return;

    const missingFields = validateForm();
    if (missingFields.length > 0) {
      toast({
        title: "Campos obligatorios incompletos",
        description: `Faltan: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
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

      refreshProfile();

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
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="space-y-2">
                <div className="h-4 bg-secondary rounded w-1/4"></div>
                <div className="h-10 bg-secondary rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const missingFields = validateForm();
  const isFormComplete = missingFields.length === 0;

  return (
    <div className="space-y-6">
      {/* Alerta de información */}
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          <strong>Información obligatoria:</strong> Estos datos son necesarios para la facturación 
          y se sincronizarán con Stripe. El nombre profesional aparecerá en informes, 
          el nombre de facturación en las facturas. La foto de perfil se toma automáticamente de tu cuenta de Google.
        </AlertDescription>
      </Alert>

      {/* Datos profesionales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2E403B] font-lora">
            <User className="h-5 w-5" />
            Datos Profesionales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre Completo *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={handleInputChange('full_name')}
                placeholder="Dr. Juan Pérez García"
                required
                className={!formData.full_name.trim() ? 'border-red-300' : ''}
              />
              <p className="text-xs text-muted-foreground">
                Aparecerá en la firma de informes profesionales
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="professional_license">Número de Colegiado *</Label>
              <Input
                id="professional_license"
                value={formData.professional_license}
                onChange={handleInputChange('professional_license')}
                placeholder="28-1234-56"
                required
                className={!formData.professional_license.trim() ? 'border-red-300' : ''}
              />
              <p className="text-xs text-muted-foreground">
                Se incluirá en la firma de documentos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información de Facturación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2E403B] font-lora">
            <FileText className="h-5 w-5" />
            Información de Facturación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primera fila: Nombre de facturación y Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="billing_name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nombre de Facturación *
              </Label>
              <Input
                id="billing_name"
                value={formData.billing_name}
                onChange={handleInputChange('billing_name')}
                placeholder="Centro de Psicología S.L."
                required
                className={!formData.billing_name.trim() ? 'border-red-300' : ''}
              />
              <p className="text-xs text-muted-foreground">
                Nombre que aparecerá en las facturas (puede ser diferente al profesional)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email de Facturación *
              </Label>
              <Input
                id="billing_email"
                value={formData.billing_email}
                onChange={handleInputChange('billing_email')}
                placeholder="facturacion@ejemplo.com"
                type="email"
                required
                className={!formData.billing_email.trim() ? 'border-red-300' : ''}
              />
              <p className="text-xs text-muted-foreground">
                Independiente del email de autenticación de Gmail
              </p>
            </div>
          </div>

          {/* Segunda fila: NIF/DNI y Teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nif_dni">NIF/DNI/CIF *</Label>
              <Input
                id="nif_dni"
                value={formData.nif_dni}
                onChange={handleInputChange('nif_dni')}
                placeholder="12345678Z o B12345678"
                required
                className={!formData.nif_dni.trim() ? 'border-red-300' : ''}
              />
              <p className="text-xs text-muted-foreground">
                DNI personal o CIF de empresa para facturación
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Teléfono *
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                placeholder="+34 600 123 456"
                type="tel"
                required
                className={!formData.phone.trim() ? 'border-red-300' : ''}
              />
            </div>
          </div>

          {/* Dirección completa */}
          <div className="space-y-2">
            <Label htmlFor="billing_address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Dirección Completa *
            </Label>
            <Input
              id="billing_address"
              value={formData.billing_address}
              onChange={handleInputChange('billing_address')}
              placeholder="Calle Principal, 123, 2º A"
              required
              className={!formData.billing_address.trim() ? 'border-red-300' : ''}
            />
          </div>

          {/* Ciudad, CP y País */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="billing_city">Ciudad *</Label>
              <Input
                id="billing_city"
                value={formData.billing_city}
                onChange={handleInputChange('billing_city')}
                placeholder="Madrid"
                required
                className={!formData.billing_city.trim() ? 'border-red-300' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_postal_code">Código Postal *</Label>
              <Input
                id="billing_postal_code"
                value={formData.billing_postal_code}
                onChange={handleInputChange('billing_postal_code')}
                placeholder="28001"
                required
                className={!formData.billing_postal_code.trim() ? 'border-red-300' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_country">País</Label>
              <Input
                id="billing_country"
                value={formData.billing_country}
                onChange={handleInputChange('billing_country')}
                placeholder="ES"
                disabled
              />
            </div>
          </div>

          {/* Información explicativa */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-1">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Diferencia entre nombres
                </h4>
                <p className="text-sm text-blue-700">
                  <strong>Nombre Profesional:</strong> Aparece en la firma de informes y documentos clínicos.<br/>
                  <strong>Nombre de Facturación:</strong> Aparece en las facturas (puede ser tu nombre, empresa o clínica).
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón guardar */}
      <div className="flex justify-between items-center pt-4">
        <div className="text-sm text-muted-foreground">
          {!isFormComplete && (
            <span className="text-red-600">
              * Faltan {missingFields.length} campos obligatorios
            </span>
          )}
        </div>
        
        <Button 
          onClick={handleSaveChanges}
          disabled={isSaving}
          size="lg"
          className="min-w-[150px]"
        >
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Save className="h-4 w-4 mr-2" />
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}