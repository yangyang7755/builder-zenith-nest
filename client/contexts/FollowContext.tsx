import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
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
      const [followersResponse, followingResponse, statsResponse] = await Promise.all([
        apiService.getUserFollowers(user.id),
        apiService.getUserFollowing(user.id),
        apiService.getFollowStats(user.id)
      ]);

      if (followersResponse.data) {
        setFollowers(followersResponse.data);
      }

      if (followingResponse.data) {
        setFollowing(followingResponse.data);
      }

      if (statsResponse.data) {
        setFollowStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error refreshing follow data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const followUser = async (userId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to follow users.",
        variant: "destructive",
      });
      return;
    }

    if (userId === user.id) {
      toast({
        title: "Invalid Action",
        description: "You cannot follow yourself.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiService.followUser(userId);
      
      if (response.data) {
        // Update local state optimistically
        setFollowing(prev => {
          const currentFollowing = Array.isArray(prev) ? prev : [];
          return [...currentFollowing, response.data];
        });
        setFollowStats(prev => ({
          ...prev,
          following: (prev?.following || 0) + 1
        }));

        toast({
          title: "Following! 👥",
          description: `You are now following ${response.data.following?.full_name || 'this user'}`,
        });
      }
    } catch (error: any) {
      console.error('Error following user:', error);
      toast({
        title: "Error Following User",
        description: error.response?.data?.error || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unfollowUser = async (userId: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      await apiService.unfollowUser(userId);
      
      // Update local state optimistically
      setFollowing(prev => prev.filter(f => f.following_id !== userId));
      setFollowStats(prev => ({
        ...prev,
        following: Math.max(0, prev.following - 1)
      }));

      toast({
        title: "Unfollowed",
        description: "You have unfollowed this user.",
      });
    } catch (error: any) {
      console.error('Error unfollowing user:', error);
      toast({
        title: "Error Unfollowing User",
        description: error.response?.data?.error || "Please try again later.",
        variant: "destructive",
      });
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
      // For other users, we would need to fetch their stats
      // For now, return 0 or implement a separate API call
      return 0;
    }
    return followStats?.followers || 0;
  };

  const getFollowingCount = (userId?: string): number => {
    if (userId && userId !== user?.id) {
      // For other users, we would need to fetch their stats
      // For now, return 0 or implement a separate API call
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
