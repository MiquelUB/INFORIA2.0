'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// New component to encapsulate useSearchParams
const BlockedContent = () => {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  let title = 'Acceso Restringido';
  let description = 'No tienes los permisos necesarios para acceder a esta sección.';
  let callToAction = 'Contacta a soporte';
  let callToActionLink = 'mailto:support@inforia.com';

  if (reason === 'no_credits') {
    title = 'Créditos Insuficientes';
    description = 'Te has quedado sin créditos. Por favor, recarga tu cuenta para continuar utilizando nuestros servicios.';
    callToAction = 'Recargar Créditos';
    callToActionLink = '/account/billing'; // Assuming a billing page exists
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background p-8">
      <Card className="w-full max-w-md shadow-lg text-center">
        <CardHeader>
          <CardTitle className="inforia-h2">{title}</CardTitle>
          <CardDescription className="inforia-body">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href={callToActionLink} passHref>
            <Button className="w-full mt-4">{callToAction}</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

const BlockedPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BlockedContent />
    </Suspense>
  );
};

export default BlockedPage;
