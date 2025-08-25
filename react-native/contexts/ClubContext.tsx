import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { apiService } from '../services/apiService';
import { Alert } from 'react-native';

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  member_count: number;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  banner_image?: string;
  location?: string;
}

interface ClubMembership {
  id: string;
  club_id: string;
  user_id: string;
  role: 'member' | 'admin' | 'moderator';
  joined_at: string;
  club?: Club;
}

interface ClubContextType {
  clubs: Club[];
  userClubs: Club[];
  memberships: ClubMembership[];
  isLoading: boolean;
  error: string | null;
  joinClub: (clubId: string) => Promise<boolean>;
  leaveClub: (clubId: string) => Promise<boolean>;
  isMember: (clubId: string) => boolean;
  refreshClubs: () => Promise<void>;
  getUserClubs: () => Promise<void>;
  createClub: (clubData: Partial<Club>) => Promise<Club | null>;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

interface ClubProviderProps {
  children: ReactNode;
}

export const ClubProvider: React.FC<ClubProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [userClubs, setUserClubs] = useState<Club[]>([]);
  const [memberships, setMemberships] = useState<ClubMembership[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadCachedData();
      refreshClubs();
      getUserClubs();
    } else {
      // Reset data when user logs out
      setClubs([]);
      setUserClubs([]);
      setMemberships([]);
    }
  }, [user]);

  const loadCachedData = async () => {
    try {
      const [cachedClubs, cachedUserClubs, cachedMemberships] = await Promise.all([
        AsyncStorage.getItem('clubs'),
        AsyncStorage.getItem('userClubs'),
        AsyncStorage.getItem('clubMemberships')
      ]);

      if (cachedClubs) {
        setClubs(JSON.parse(cachedClubs));
      }
      if (cachedUserClubs) {
        setUserClubs(JSON.parse(cachedUserClubs));
      }
      if (cachedMemberships) {
        setMemberships(JSON.parse(cachedMemberships));
      }
    } catch (error) {
      console.error('Error loading cached club data:', error);
    }
  };

  const refreshClubs = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiService.getClubs();
      
      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        setClubs(response.data);
        await AsyncStorage.setItem('clubs', JSON.stringify(response.data));
      }
    } catch (error) {
      setError('Failed to fetch clubs');
      console.error('Error fetching clubs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserClubs = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const [clubsResponse, membershipsResponse] = await Promise.all([
        apiService.getUserClubs(user.id),
        apiService.getClubMemberships()
      ]);

      if (clubsResponse.data) {
        setUserClubs(clubsResponse.data);
        await AsyncStorage.setItem('userClubs', JSON.stringify(clubsResponse.data));
      }

      if (membershipsResponse.data) {
        setMemberships(membershipsResponse.data);
        await AsyncStorage.setItem('clubMemberships', JSON.stringify(membershipsResponse.data));
      }
    } catch (error) {
      console.error('Error fetching user clubs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const joinClub = async (clubId: string): Promise<boolean> => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to join clubs');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Optimistic update
      const club = clubs.find(c => c.id === clubId);
      if (club) {
        setUserClubs(prev => [...prev, club]);
        setMemberships(prev => [...prev, {
          id: `temp-${Date.now()}`,
          club_id: clubId,
          user_id: user.id,
          role: 'member',
          joined_at: new Date().toISOString(),
          club
        }]);
      }

      const response = await apiService.joinClub(clubId);

      if (response.error) {
        // Revert optimistic update
        setUserClubs(prev => prev.filter(c => c.id !== clubId));
        setMemberships(prev => prev.filter(m => m.club_id !== clubId));
        
        Alert.alert('Error', response.error);
        return false;
      }

      Alert.alert('Success', 'Successfully joined the club!');
      
      // Refresh data to get accurate membership info
      await Promise.all([getUserClubs(), refreshClubs()]);
      
      return true;
    } catch (error) {
      console.error('Error joining club:', error);
      Alert.alert('Error', 'Failed to join club');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const leaveClub = async (clubId: string): Promise<boolean> => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to leave clubs');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Optimistic update
      setUserClubs(prev => prev.filter(c => c.id !== clubId));
      setMemberships(prev => prev.filter(m => m.club_id !== clubId));

      const response = await apiService.leaveClub(clubId);

      if (response.error) {
        // Revert optimistic update by refreshing data
        await getUserClubs();
        
        Alert.alert('Error', response.error);
        return false;
      }

      Alert.alert('Success', 'Successfully left the club');
      
      // Refresh data to ensure consistency
      await Promise.all([getUserClubs(), refreshClubs()]);
      
      return true;
    } catch (error) {
      console.error('Error leaving club:', error);
      Alert.alert('Error', 'Failed to leave club');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const isMember = (clubId: string): boolean => {
    return memberships.some(m => m.club_id === clubId);
  };

  const createClub = async (clubData: Partial<Club>): Promise<Club | null> => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to create clubs');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiService.createClub({
        ...clubData,
        created_by: user.id
      });

      if (response.error) {
        Alert.alert('Error', response.error);
        return null;
      }

      if (response.data) {
        // Add to user clubs and all clubs
        setUserClubs(prev => [response.data, ...prev]);
        setClubs(prev => [response.data, ...prev]);
        
        Alert.alert('Success', 'Club created successfully!');
        
        // Refresh data
        await Promise.all([getUserClubs(), refreshClubs()]);
        
        return response.data;
      }

      return null;
    } catch (error) {
      console.error('Error creating club:', error);
      Alert.alert('Error', 'Failed to create club');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const value: ClubContextType = {
    clubs,
    userClubs,
    memberships,
    isLoading,
    error,
    joinClub,
    leaveClub,
    isMember,
    refreshClubs,
    getUserClubs,
    createClub,
  };

  return <ClubContext.Provider value={value}>{children}</ClubContext.Provider>;
};

export const useClubs = (): ClubContextType => {
  const context = useContext(ClubContext);
  if (context === undefined) {
    throw new Error('useClubs must be used within a ClubProvider');
  }
  return context;
};
