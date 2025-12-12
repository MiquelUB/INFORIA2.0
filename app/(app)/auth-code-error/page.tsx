// app/auth-code-error/page.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button'; //
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'; //
import { AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// Separem el component per poder utilitzar useSearchParams
function AuthErrorContent() {
  const searchParams = useSearchParams();
  const errorDescription = searchParams.get('error_description');

  let defaultTitle = "Error d'Autenticació";
  let defaultDescription = "No s'ha pogut completar l'inici de sessió. El proveïdor (Google) no ha retornat el codi d'autorització necessari.";

  if (errorDescription) {
    defaultTitle = "S'ha rebut un error";
    defaultDescription = decodeURIComponent(errorDescription);
  }
  
  return (
    <Card className="w-full max-w-md text-center">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <AlertTriangle className="w-12 h-12 text-destructive" />
        </div>
        <CardTitle className="text-2xl">{defaultTitle}</CardTitle>
        <CardDescription>
          {defaultDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href="/auth/login">Tornar a l&apos;inici de sessió</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// L'exportació per defecte ha d'embolcallar el component amb Suspense
export default function AuthErrorPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Suspense fallback={<div>Carregant error...</div>}>
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}