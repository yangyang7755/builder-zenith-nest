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
      await loadCachedData();

      const [followersRes, followingRes, statsRes] = await Promise.allSettled([
        apiService.getUserFollowers(user.id),
        apiService.getUserFollowing(user.id),
        apiService.getFollowStats(user.id),
      ]);

      if (
        followersRes.status === "fulfilled" &&
        followersRes.value.data &&
        Array.isArray(followersRes.value.data)
      ) {
        setFollowers(followersRes.value.data);
        await AsyncStorage.setItem("followers", JSON.stringify(followersRes.value.data));
      }

      if (
        followingRes.status === "fulfilled" &&
        followingRes.value.data &&
        Array.isArray(followingRes.value.data)
      ) {
        setFollowing(followingRes.value.data);
        await AsyncStorage.setItem("following", JSON.stringify(followingRes.value.data));
      }

      if (statsRes.status === "fulfilled" && statsRes.value.data) {
        setFollowStats({
          followers: statsRes.value.data.followers || 0,
          following: statsRes.value.data.following || 0,
        });
        await AsyncStorage.setItem("followStats", JSON.stringify(statsRes.value.data));
      } else {
        setFollowStats({ followers: followers.length, following: following.length });
      }
    } catch (error) {
      console.error("Error refreshing follow data:", error);
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
      console.warn("No authenticated user for follow action");
      return;
    }
    if (userId === user.id) {
      console.warn("Cannot follow yourself");
      return;
    }
    try {
      setIsLoading(true);
      const res = await apiService.followUser(userId);
      if (res.error) throw new Error(res.error);
      await refreshFollowData();
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const unfollowUser = async (userId: string) => {
    if (!user) return;
    try {
      setIsLoading(true);
      const res = await apiService.unfollowUser(userId);
      if (res.error) throw new Error(res.error);
      await refreshFollowData();
    } catch (error) {
      console.error("Error unfollowing user:", error);
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
      return 0;
    }
    return followStats?.followers || 0;
  };

  const getFollowingCount = (userId?: string): number => {
    if (userId && userId !== user?.id) {
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


export const useFollow = (): FollowContextType => {
  const context = useContext(FollowContext);
  if (context === undefined) {
    throw new Error('useFollow must be used within a FollowProvider');
  }
  return context;
};
