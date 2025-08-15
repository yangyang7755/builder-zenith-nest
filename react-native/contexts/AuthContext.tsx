import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  full_name: string;
  profile_image?: string;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  bio?: string;
  location?: string;
  profile_image?: string;
  gender?: string;
  age?: number;
  nationality?: string;
  institution?: string;
  occupation?: string;
  sports?: any[];
  languages?: string[];
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check for stored auth data
      const storedUser = await AsyncStorage.getItem('user');
      const storedProfile = await AsyncStorage.getItem('profile');
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
      
      // In a real app, you would validate the stored token here
      // and refresh it if necessary
      
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Mock API call - replace with actual authentication
      const response = await mockSignIn(email, password);
      
      const { user: userData, profile: profileData, token } = response;
      
      // Store auth data
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('profile', JSON.stringify(profileData));
      await AsyncStorage.setItem('token', token);
      
      setUser(userData);
      setProfile(profileData);
      
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      
      // Mock API call - replace with actual registration
      const response = await mockSignUp(email, password, fullName);
      
      const { user: userData, profile: profileData, token } = response;
      
      // Store auth data
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('profile', JSON.stringify(profileData));
      await AsyncStorage.setItem('token', token);
      
      setUser(userData);
      setProfile(profileData);
      
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Clear stored auth data
      await AsyncStorage.multiRemove(['user', 'profile', 'token']);
      
      setUser(null);
      setProfile(null);
      
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!profile) throw new Error('No profile to update');
      
      // Mock API call - replace with actual profile update
      const updatedProfile = { ...profile, ...updates };
      
      // Store updated profile
      await AsyncStorage.setItem('profile', JSON.stringify(updatedProfile));
      
      setProfile(updatedProfile);
      
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const refreshAuth = async () => {
    try {
      setIsLoading(true);
      await initializeAuth();
    } catch (error) {
      console.error('Refresh auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Mock API functions - replace with actual API calls
const mockSignIn = async (email: string, password: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock response
  return {
    user: {
      id: 'user_1',
      email: email,
      full_name: 'Maddie Wei',
      profile_image: 'https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2Fb4460a1279a84ad1b10626393196b1cf?format=webp&width=800',
    },
    profile: {
      id: 'profile_1',
      user_id: 'user_1',
      full_name: 'Maddie Wei',
      bio: 'Passionate climber and outdoor enthusiast from Oxford.',
      location: 'Oxford, UK',
      profile_image: 'https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2Fb4460a1279a84ad1b10626393196b1cf?format=webp&width=800',
      gender: 'Female',
      age: 22,
      nationality: 'British',
      institution: 'Oxford University',
      occupation: 'Student',
      sports: ['Climbing', 'Cycling'],
      languages: ['English', 'Mandarin'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    token: 'mock_jwt_token',
  };
};

const mockSignUp = async (email: string, password: string, fullName: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock response
  return {
    user: {
      id: 'user_new',
      email: email,
      full_name: fullName,
    },
    profile: {
      id: 'profile_new',
      user_id: 'user_new',
      full_name: fullName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    token: 'mock_jwt_token',
  };
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
