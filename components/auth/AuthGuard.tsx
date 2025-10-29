'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const AuthGuard = ({
  children,
  requireOnboarding = true,
}: {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}) => {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (requireOnboarding && !profile?.onboarding_completed) {
        router.push('/onboarding');
      }
    }
  }, [user, profile, loading, requireOnboarding, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};
