import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import { useFollowSocket } from "@/hooks/useSocket";

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
  const { emitFollowUser, emitUnfollowUser, subscribeToFollowEvents } = useFollowSocket();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Following[]>([]);
  const [followStats, setFollowStats] = useState<FollowStats>({
    followers: 0,
    following: 0,
  });
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

  // Subscribe to real-time follow events
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToFollowEvents({
      onNewFollower: (data) => {
        // Someone followed the current user
        if (data.followedUserId === user.id) {
          const newFollower: Follower = {
            id: `realtime-${Date.now()}`,
            follower_id: data.followerId,
            following_id: user.id,
            created_at: data.timestamp,
            follower: data.followerData || {
              id: data.followerId,
              full_name: 'New Follower',
              profile_image: undefined,
            }
          };

          setFollowers(prev => [newFollower, ...prev]);
          setFollowStats(prev => ({ ...prev, followers: prev.followers + 1 }));

          toast({
            title: "New Follower!",
            description: `${newFollower.follower.full_name} started following you`,
            duration: 5000,
          });
        }
      },

      onFollowerRemoved: (data) => {
        // Someone unfollowed the current user
        if (data.unfollowedUserId === user.id) {
          setFollowers(prev => prev.filter(f => f.follower_id !== data.unfollowerId));
          setFollowStats(prev => ({ ...prev, followers: Math.max(0, prev.followers - 1) }));

          toast({
            title: "Follower Update",
            description: "Someone unfollowed you",
          });
        }
      },

      onFollowingUpdate: (data) => {
        // Current user's following list changed
        if (data.followerId === user.id && data.type === 'following_added') {
          // User started following someone
          setFollowStats(prev => ({ ...prev, following: prev.following + 1 }));
        } else if (data.unfollowerId === user.id && data.type === 'following_removed') {
          // User unfollowed someone
          setFollowStats(prev => ({ ...prev, following: Math.max(0, prev.following - 1) }));
        }
      }
    });

    return unsubscribe;
  }, [user, subscribeToFollowEvents, toast]);

  const refreshFollowData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Use Promise.allSettled to handle individual failures gracefully
      const [followersResult, followingResult, statsResult] =
        await Promise.allSettled([
          apiService.getUserFollowers(user.id),
          apiService.getUserFollowing(user.id),
          apiService.getFollowStats(user.id),
        ]);

      // Handle followers response
      if (
        followersResult.status === "fulfilled" &&
        followersResult.value.data &&
        Array.isArray(followersResult.value.data)
      ) {
        setFollowers(followersResult.value.data);
      } else {
        console.warn(
          "Failed to fetch followers:",
          followersResult.status === "rejected"
            ? followersResult.reason
            : followersResult.value.error,
        );
        setFollowers([]);
      }

      // Handle following response
      if (
        followingResult.status === "fulfilled" &&
        followingResult.value.data &&
        Array.isArray(followingResult.value.data)
      ) {
        setFollowing(followingResult.value.data);
      } else {
        console.warn(
          "Failed to fetch following:",
          followingResult.status === "rejected"
            ? followingResult.reason
            : followingResult.value.error,
        );
        setFollowing([]);
      }

      // Handle stats response
      if (statsResult.status === "fulfilled" && statsResult.value.data) {
        setFollowStats({
          followers: statsResult.value.data.followers || 0,
          following: statsResult.value.data.following || 0,
        });
      } else {
        console.warn(
          "Failed to fetch follow stats:",
          statsResult.status === "rejected"
            ? statsResult.reason
            : statsResult.value.error,
        );
        // Use local data count as fallback
        setFollowStats({
          followers: followers.length,
          following: following.length,
        });
      }
    } catch (error) {
      console.error("Error refreshing follow data:", error);
      // Set safe defaults on error
      setFollowers([]);
      setFollowing([]);
      setFollowStats({ followers: 0, following: 0 });
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

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        // Update local state optimistically
        setFollowing((prev) => {
          const currentFollowing = Array.isArray(prev) ? prev : [];
          return [...currentFollowing, response.data];
        });
        setFollowStats((prev) => ({
          ...prev,
          following: (prev?.following || 0) + 1,
        }));

        // Emit real-time event
        emitFollowUser(userId, {
          id: user.id,
          full_name: user.email || 'User', // TODO: Get actual user name
          profile_image: undefined,
        });

        toast({
          title: "Following! 👥",
          description: `You are now following ${response.data.following?.full_name || "this user"}`,
        });
      } else {
        throw new Error("No data returned from follow request");
      }
    } catch (error: any) {
      console.error("Error following user:", error);

      let errorMessage = "Please try again later.";
      if (error.message?.includes("timeout")) {
        errorMessage = "Request timed out. Please check your connection.";
      } else if (error.message?.includes("Failed to fetch")) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error Following User",
        description: errorMessage,
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
      const response = await apiService.unfollowUser(userId);

      if (response.error) {
        throw new Error(response.error);
      }

      // Update local state optimistically
      setFollowing((prev) => {
        const currentFollowing = Array.isArray(prev) ? prev : [];
        return currentFollowing.filter((f) => f.following_id !== userId);
      });
      setFollowStats((prev) => ({
        ...prev,
        following: Math.max(0, (prev?.following || 0) - 1),
      }));

      // Emit real-time event
      emitUnfollowUser(userId);

      toast({
        title: "Unfollowed",
        description: "You have unfollowed this user.",
      });
    } catch (error: any) {
      console.error("Error unfollowing user:", error);

      let errorMessage = "Please try again later.";
      if (error.message?.includes("timeout")) {
        errorMessage = "Request timed out. Please check your connection.";
      } else if (error.message?.includes("Failed to fetch")) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error Unfollowing User",
        description: errorMessage,
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
    return following.some((f) => f.following_id === userId);
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
    <FollowContext.Provider value={value}>{children}</FollowContext.Provider>
  );
};

export const useFollow = (): FollowContextType => {
  const context = useContext(FollowContext);
  if (context === undefined) {
    throw new Error("useFollow must be used within a FollowProvider");
  }
  return context;
};
