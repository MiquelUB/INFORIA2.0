'use client';

// import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, AlertCircle } from 'lucide-react';
import { useStripe } from '@/lib/hooks/useStripeCheckout';
import { Profile } from '@/lib/types';

interface BillingSectionProps {
  profile: Profile;
}

export function BillingSection({ profile }: BillingSectionProps) {
  const { handlePortalAccess, loading: billingLoading } = useStripe();

  if (!profile) return null;

  // DETECCIÓN CLAVE: ¿Es una cuenta gestionada (Hijo)?
  const isManagedAccount = !!profile.billing_owner_id;

  // Si es una cuenta gestionada, no mostramos facturas (las ve el dueño)
  if (isManagedAccount) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Facturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => handlePortalAccess()}
              disabled={billingLoading}
              className="w-full"
            >
              Ver Historial de Facturas
            </Button>
            <div className="flex items-center gap-2 mt-2 p-3 bg-yellow-50 text-yellow-800 rounded text-xs">
              <AlertCircle className="h-4 w-4" />
              <span>Las facturas se generan automáticamente a nombre de: <strong>{profile.billing_name || profile.full_name}</strong></span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}