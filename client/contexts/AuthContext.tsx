import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile, signIn, signUp, signOut, getCurrentUser } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signUp: (email: string, password: string, userData?: { full_name?: string }) => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from our API
  const fetchProfile = async (userId: string, authToken: string) => {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Update profile via API
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!session?.access_token) return;
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (user && session?.access_token) {
      await fetchProfile(user.id, session.access_token);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      if (!supabase) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      const { data: { session: initialSession } } = await supabase.auth.getSession();

      if (mounted) {
        setSession(initialSession);
        setUser(initialSession?.user || null);

        if (initialSession?.user && initialSession?.access_token) {
          await fetchProfile(initialSession.user.id, initialSession.access_token);
        }

        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes (only if Supabase is available)
    let subscription: any = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          console.log('Auth state changed:', event, currentSession?.user?.email);

          if (mounted) {
            setSession(currentSession);
            setUser(currentSession?.user || null);

            if (currentSession?.user && currentSession?.access_token) {
              await fetchProfile(currentSession.user.id, currentSession.access_token);
            } else {
              setProfile(null);
            }

            setLoading(false);
          }
        }
      );
      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn: async (email: string, password: string) => {
      const result = await signIn(email, password);

      // In demo mode, manually set user state since we don't have real auth state changes
      if (result.data.user && !supabase) {
        setUser(result.data.user);
        const demoProfile = {
          id: result.data.user.id,
          email: result.data.user.email,
          full_name: result.data.user.user_metadata?.full_name || 'Demo User',
          university: 'Demo University',
          bio: 'Demo user profile',
          profile_image: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProfile(demoProfile);
        setLoading(false);
      }

      return { user: result.data.user, error: result.error };
    },
    signUp: async (email: string, password: string, userData?: { full_name?: string }) => {
      const result = await signUp(email, password, userData);

      // In demo mode, don't automatically sign in after signup
      // Just return success so user can proceed to signin page

      return { user: result.data.user, error: result.error };
    },
    signOut: async () => {
      const result = await signOut();
      if (!result.error) {
        setUser(null);
        setProfile(null);
        setSession(null);
      }
      return { error: result.error };
    },
    updateProfile,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
