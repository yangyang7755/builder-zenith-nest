import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { apiService } from "../services/apiService";

interface Follower {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower: {
    id: string;
    full_name: string;
    profile_image?: string;
    university?: string;
  };
}

interface Following {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  following: {
    id: string;
    full_name: string;
    profile_image?: string;
    university?: string;
  };
}

interface FollowStats {
  followers: number;
  following: number;
}

interface FollowContextType {
  followers: Follower[];
  following: Following[];
  followStats: FollowStats;
  isLoading: boolean;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  getFollowerCount: (userId?: string) => number;
  getFollowingCount: (userId?: string) => number;
  refreshFollowData: () => Promise<void>;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

interface FollowProviderProps {
  children: ReactNode;
}

export const FollowProvider: React.FC<FollowProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Following[]>([]);
  const [followStats, setFollowStats] = useState<FollowStats>({ followers: 0, following: 0 });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      refreshFollowData();
    } else {
      // Reset to empty when user logs out
      setFollowers([]);
      setFollowing([]);
      setFollowStats({ followers: 0, following: 0 });
    }
  }, [user]);

  const refreshFollowData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Load cached data first for better UX
      await loadCachedData();
      
      // Then try to fetch fresh data
      const [followersData, followingData, statsData] = await Promise.allSettled([
        fetchFollowersData(user.id),
        fetchFollowingData(user.id),
        fetchFollowStats(user.id)
      ]);

      // Handle followers response
      if (followersData.status === 'fulfilled' && Array.isArray(followersData.value)) {
        setFollowers(followersData.value);
        await AsyncStorage.setItem('followers', JSON.stringify(followersData.value));
      }

      // Handle following response
      if (followingData.status === 'fulfilled' && Array.isArray(followingData.value)) {
        setFollowing(followingData.value);
        await AsyncStorage.setItem('following', JSON.stringify(followingData.value));
      }

      // Handle stats response
      if (statsData.status === 'fulfilled' && statsData.value) {
        setFollowStats({
          followers: statsData.value.followers || 0,
          following: statsData.value.following || 0
        });
        await AsyncStorage.setItem('followStats', JSON.stringify(statsData.value));
      } else {
        // Use local data count as fallback
        setFollowStats({ 
          followers: followers.length, 
          following: following.length 
        });
      }
    } catch (error) {
      console.error('Error refreshing follow data:', error);
      // Keep cached data on error
    } finally {
      setIsLoading(false);
    }
  };

  const loadCachedData = async () => {
    try {
      const [cachedFollowers, cachedFollowing, cachedStats] = await Promise.all([
        AsyncStorage.getItem('followers'),
        AsyncStorage.getItem('following'),
        AsyncStorage.getItem('followStats')
      ]);

      if (cachedFollowers) {
        const parsedFollowers = JSON.parse(cachedFollowers);
        if (Array.isArray(parsedFollowers)) {
          setFollowers(parsedFollowers);
        }
      }

      if (cachedFollowing) {
        const parsedFollowing = JSON.parse(cachedFollowing);
        if (Array.isArray(parsedFollowing)) {
          setFollowing(parsedFollowing);
        }
      }

      if (cachedStats) {
        const parsedStats = JSON.parse(cachedStats);
        setFollowStats({
          followers: parsedStats.followers || 0,
          following: parsedStats.following || 0
        });
      }
    } catch (error) {
      console.error('Error loading cached follow data:', error);
    }
  };

  const followUser = async (userId: string) => {
    if (!user) {
      console.warn('No authenticated user for follow action');
      return;
    }

    if (userId === user.id) {
      console.warn('Cannot follow yourself');
      return;
    }

    try {
      setIsLoading(true);
      
      // Optimistic update
      const newFollow: Following = {
        id: `temp-${Date.now()}`,
        follower_id: user.id,
        following_id: userId,
        created_at: new Date().toISOString(),
        following: {
          id: userId,
          full_name: 'User',
          profile_image: undefined
        }
      };

      setFollowing(prev => {
        const currentFollowing = Array.isArray(prev) ? prev : [];
        return [...currentFollowing, newFollow];
      });
      setFollowStats(prev => ({
        ...prev,
        following: (prev?.following || 0) + 1
      }));

      // Try to make API call
      await followUserAPI(userId);
      
      // Update cache
      await AsyncStorage.setItem('following', JSON.stringify(following));
      
    } catch (error) {
      console.error('Error following user:', error);
      // Revert optimistic update on error
      await refreshFollowData();
    } finally {
      setIsLoading(false);
    }
  };

  const unfollowUser = async (userId: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Optimistic update
      setFollowing(prev => {
        const currentFollowing = Array.isArray(prev) ? prev : [];
        return currentFollowing.filter(f => f.following_id !== userId);
      });
      setFollowStats(prev => ({
        ...prev,
        following: Math.max(0, (prev?.following || 0) - 1)
      }));

      // Try to make API call
      await unfollowUserAPI(userId);
      
      // Update cache
      await AsyncStorage.setItem('following', JSON.stringify(following));
      
    } catch (error) {
      console.error('Error unfollowing user:', error);
      // Revert optimistic update on error
      await refreshFollowData();
    } finally {
      setIsLoading(false);
    }
  };

  const isFollowing = (userId: string): boolean => {
    // Ensure following is an array before using array methods
    if (!Array.isArray(following)) {
      return false;
    }
    return following.some(f => f.following_id === userId);
  };

  const getFollowerCount = (userId?: string): number => {
    if (userId && userId !== user?.id) {
      // For other users, return demo data or cached data
      return 0;
    }
    return followStats?.followers || 0;
  };

  const getFollowingCount = (userId?: string): number => {
    if (userId && userId !== user?.id) {
      // For other users, return demo data or cached data
      return 0;
    }
    return followStats?.following || 0;
  };

  const value: FollowContextType = {
    followers,
    following,
    followStats,
    isLoading,
    followUser,
    unfollowUser,
    isFollowing,
    getFollowerCount,
    getFollowingCount,
    refreshFollowData,
  };

  return (
    <FollowContext.Provider value={value}>
      {children}
    </FollowContext.Provider>
  );
};

// API functions (React Native compatible)
const fetchFollowersData = async (userId: string): Promise<Follower[]> => {
  // In React Native, return demo data or implement your API call
  return [
    {
      id: 'demo-follower-1',
      follower_id: 'demo-user-1',
      following_id: userId,
      created_at: new Date().toISOString(),
      follower: {
        id: 'demo-user-1',
        full_name: 'Sarah Johnson',
        profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        university: 'Cambridge University'
      }
    },
    {
      id: 'demo-follower-2', 
      follower_id: 'demo-user-2',
      following_id: userId,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      follower: {
        id: 'demo-user-2',
        full_name: 'Alex Chen',
        profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        university: 'Oxford University'
      }
    }
  ];
};

const fetchFollowingData = async (userId: string): Promise<Following[]> => {
  // In React Native, return demo data or implement your API call
  return [
    {
      id: 'demo-following-1',
      follower_id: userId,
      following_id: 'demo-user-3',
      created_at: new Date().toISOString(),
      following: {
        id: 'demo-user-3',
        full_name: 'Emma Wilson',
        profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        university: 'Imperial College'
      }
    }
  ];
};

const fetchFollowStats = async (userId: string): Promise<FollowStats> => {
  // In React Native, return demo data or implement your API call
  return {
    followers: 152,
    following: 87
  };
};

const followUserAPI = async (userId: string): Promise<void> => {
  // Implement actual API call here
  // For now, simulate success
  await new Promise(resolve => setTimeout(resolve, 500));
};

const unfollowUserAPI = async (userId: string): Promise<void> => {
  // Implement actual API call here
  // For now, simulate success
  await new Promise(resolve => setTimeout(resolve, 500));
};

export const useFollow = (): FollowContextType => {
  const context = useContext(FollowContext);
  if (context === undefined) {
    throw new Error('useFollow must be used within a FollowProvider');
  }
  return context;
};
