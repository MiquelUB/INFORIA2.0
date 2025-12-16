'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';

const Auth = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-background p-8">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="mt-2 text-sm text-muted-foreground">Cargando...</span>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
};

export default Auth;