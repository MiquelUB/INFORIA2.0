'use client'; // LoginForm (que usa hooks) requiere 'use client'

import { LoginForm } from '@/components/auth/LoginForm';
// import { AuthGuard } from '@/components/auth/AuthGuard'; // ELIMINADO (Protocolo ERROR0)

const Auth = () => {
  return (
    // El <AuthGuard> se ha eliminado, el middleware maneja la protección
    <div className="flex h-screen items-center justify-center bg-background p-8">
      <LoginForm />
    </div>
  );
};

// CORRECCIÓN: Añadido el 'export default' que faltaba
export default Auth;