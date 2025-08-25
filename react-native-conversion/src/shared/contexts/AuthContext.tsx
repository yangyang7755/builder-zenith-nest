// Auth context for React Native (matches web implementation)
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../services/apiService';
import { authTokenManager } from '../services/configureApiService';
import { storage, storageHelpers } from '../platform/storage';
import { STORAGE_KEYS } from '../constants';
import type { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ user: User | null; error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  });

  // Initialize auth state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Check for stored auth token
      const token = await authTokenManager.getToken();
      if (!token) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      // Try to get user profile with stored token
      const profileResponse = await api.profile.get();
      if (profileResponse.data) {
        const user = profileResponse.data;
        
        // Store user profile
        await storageHelpers.setJSON(STORAGE_KEYS.userProfile, user);
        
        setState(prev => ({
          ...prev,
          user,
          profile: user,
          isAuthenticated: true,
          loading: false,
        }));
      } else {
        // Token is invalid, clear it
        await authTokenManager.removeToken();
        await storage.removeItem(STORAGE_KEYS.userProfile);
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Clear potentially invalid auth data
      await authTokenManager.removeToken();
      await storage.removeItem(STORAGE_KEYS.userProfile);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to initialize authentication',
      }));
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.auth.login({ email, password });
      
      if (response.error) {
        setState(prev => ({ ...prev, loading: false, error: response.error! }));
        return { user: null, error: response.error };
      }

      if (response.data) {
        const { user, token } = response.data;
        
        // Store auth token
        await authTokenManager.setToken(token);
        
        // Store user profile
        await storageHelpers.setJSON(STORAGE_KEYS.userProfile, user);
        
        setState(prev => ({
          ...prev,
          user,
          profile: user,
          isAuthenticated: true,
          loading: false,
          error: null,
        }));

        return { user, error: null };
      }

      setState(prev => ({ ...prev, loading: false }));
      return { user: null, error: 'Login failed' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { user: null, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.auth.register({
        email,
        password,
        full_name: metadata?.full_name || '',
        ...metadata,
      });
      
      if (response.error) {
        setState(prev => ({ ...prev, loading: false, error: response.error! }));
        return { user: null, error: response.error };
      }

      if (response.data) {
        const { user, token } = response.data;
        
        // Store auth token
        if (token) {
          await authTokenManager.setToken(token);
        }
        
        // Store user profile
        await storageHelpers.setJSON(STORAGE_KEYS.userProfile, user);
        
        setState(prev => ({
          ...prev,
          user,
          profile: user,
          isAuthenticated: !!token,
          loading: false,
          error: null,
        }));

        return { user, error: null };
      }

      setState(prev => ({ ...prev, loading: false }));
      return { user: null, error: 'Sign up failed' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { user: null, error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      // Call logout API
      await api.auth.logout();
      
      // Clear stored auth data
      await authTokenManager.removeToken();
      await storage.removeItem(STORAGE_KEYS.userProfile);
      await storage.removeItem(STORAGE_KEYS.savedActivities);
      
      setState({
        user: null,
        profile: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if API call fails, clear local auth data
      await authTokenManager.removeToken();
      await storage.removeItem(STORAGE_KEYS.userProfile);
      
      setState({
        user: null,
        profile: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.profile.update(updates);
      
      if (response.error) {
        setState(prev => ({ ...prev, loading: false, error: response.error! }));
        return;
      }

      if (response.data) {
        const updatedUser = { ...state.user, ...response.data };
        
        // Store updated user profile
        await storageHelpers.setJSON(STORAGE_KEYS.userProfile, updatedUser);
        
        setState(prev => ({
          ...prev,
          user: updatedUser,
          profile: updatedUser,
          loading: false,
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.profile.get();
      
      if (response.data) {
        const user = response.data;
        
        // Store updated user profile
        await storageHelpers.setJSON(STORAGE_KEYS.userProfile, user);
        
        setState(prev => ({
          ...prev,
          user,
          profile: user,
        }));
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
