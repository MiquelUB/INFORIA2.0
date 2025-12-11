'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

type Profile = {
  id: string;
  plan_type: string | null;
  credits: number;
  credits_limit: number;
  credits_used: number;
  subscription_status: string;
  // Add other profile fields as needed
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
<<<<<<< HEAD
  updateProfile: (updates: any) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
=======
  refreshProfile: () => Promise<void>;
>>>>>>> feature/stripe-integration
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
<<<<<<< HEAD
  updateProfile: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => {},
=======
  refreshProfile: async () => {},
>>>>>>> feature/stripe-integration
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data as unknown as Profile);
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { user: initialUser } } = await supabase.auth.getUser();
      setUser(initialUser);

      if (initialUser) {
        await fetchProfile(initialUser.id);
      }

      setLoading(false);

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // Only fetch if user changed or profile is missing
          if (currentUser.id !== user?.id || !profile) {
             await fetchProfile(currentUser.id);
          }
        } else {
          setProfile(null);
        }
        
        if (event === 'SIGNED_OUT') {
            setProfile(null);
            setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    initializeAuth();
  }, [supabase]);

<<<<<<< HEAD
  const updateProfile = async (updates: any) => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (error) {
      throw error;
    }
    // Refresh profile
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(profileData);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signInWithGoogle = async () => {
    try {
      console.log('🔐 Iniciando autenticación con Google...');
      
      // ✅ REDIRECT EXPLÍCITO A /auth/callback
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'email profile https://www.googleapis.com/auth/drive.file'
        },
      });
  
      if (error) {
        console.error('❌ Error en signInWithOAuth:', error);
        throw error;
      }
  
      if (!data?.url) {
        throw new Error('No se generó URL de autenticación');
      }
  
      console.log('✅ Redirección a Google:', data.url);
  
    } catch (error) {
      console.error('❌ Google sign in failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    loading,
    updateProfile,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
=======
  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
>>>>>>> feature/stripe-integration
};

export const useAuth = () => useContext(AuthContext);
