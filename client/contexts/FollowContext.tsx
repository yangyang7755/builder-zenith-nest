import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { apiService } from "../services/apiService";

export interface FollowRelationship {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: Date;
  follower?: {
    id: string;
    full_name: string;
    profile_image?: string;
    bio?: string;
  };
  following?: {
    id: string;
    full_name: string;
    profile_image?: string;
    bio?: string;
  };
}

interface FollowContextType {
  followers: FollowRelationship[];
  following: FollowRelationship[];
  isLoading: boolean;
  followUser: (userId: string) => Promise<boolean>;
  unfollowUser: (userId: string) => Promise<boolean>;
  isFollowing: (userId: string) => boolean;
  getFollowerCount: (userId: string) => number;
  getFollowingCount: (userId: string) => number;
  refreshFollowData: () => Promise<void>;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export function FollowProvider({ children }: { children: ReactNode }) {
  const [followers, setFollowers] = useState<FollowRelationship[]>([]);
  const [following, setFollowing] = useState<FollowRelationship[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Listen for profile updates and sync follower/following data
  useEffect(() => {
    const handleFollowerProfileUpdate = (event: CustomEvent) => {
      const { userId, profile } = event.detail;

      // Update followers list
      setFollowers(prev =>
        prev.map(relationship =>
          relationship.follower_id === userId
            ? {
                ...relationship,
                follower: {
                  ...relationship.follower,
                  full_name: profile.full_name,
                  profile_image: profile.profile_image,
                  bio: profile.bio
                }
              }
            : relationship
        )
      );

      // Update following list
      setFollowing(prev =>
        prev.map(relationship =>
          relationship.following_id === userId
            ? {
                ...relationship,
                following: {
                  ...relationship.following,
                  full_name: profile.full_name,
                  profile_image: profile.profile_image,
                  bio: profile.bio
                }
              }
            : relationship
        )
      );
    };

    window.addEventListener('followerProfileUpdated', handleFollowerProfileUpdate as EventListener);

    return () => {
      window.removeEventListener('followerProfileUpdated', handleFollowerProfileUpdate as EventListener);
    };
  }, []);

  // Initialize with real backend data or empty arrays for new users
  useEffect(() => {
    initializeFollowData();
  }, []);

  const initializeFollowData = async () => {
    try {
      // Try to fetch real follower data from backend
      // const [followersData, followingData] = await Promise.all([
      //   apiService.getFollowers(),
      //   apiService.getFollowing()
      // ]);
      // setFollowers(followersData || []);
      // setFollowing(followingData || []);

      // For now, start with empty arrays for new users
      // Only show demo data for specific demo users
      const isDemoUser = window.location.pathname.includes('demo') ||
                        localStorage.getItem('isDemoUser') === 'true';

      if (isDemoUser) {
        initializeDemoData();
      } else {
        // New users start with no followers
        setFollowers([]);
        setFollowing([]);
      }
    } catch (error) {
      console.error("Error initializing follow data:", error);
      // Fallback to empty arrays
      setFollowers([]);
      setFollowing([]);
    }
  };

  const initializeDemoData = () => {
    // Demo follower relationships (only for demo users)
    const demoFollowers: FollowRelationship[] = [
      {
        id: "follow_1",
        follower_id: "user_dan_smith",
        following_id: "user_current", // Current user
        created_at: new Date("2024-01-15"),
        follower: {
          id: "user_dan_smith",
          full_name: "Dan Smith",
          profile_image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
          bio: "Avid climber and outdoor enthusiast"
        }
      },
      {
        id: "follow_2",
        follower_id: "user_coach_holly",
        following_id: "user_current",
        created_at: new Date("2024-01-20"),
        follower: {
          id: "user_coach_holly",
          full_name: "Coach Holly Peristiani",
          profile_image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
          bio: "Professional climbing coach and trainer"
        }
      }
    ];

    const demoFollowing: FollowRelationship[] = [
      {
        id: "follow_3",
        follower_id: "user_current",
        following_id: "user_sarah_jones",
        created_at: new Date("2024-01-10"),
        following: {
          id: "user_sarah_jones",
          full_name: "Sarah Jones",
          profile_image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
          bio: "Marathon runner and cycling enthusiast"
        }
      }
    ];

    setFollowers(demoFollowers);
    setFollowing(demoFollowing);
  };

  const followUser = async (userId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Check if already following
      if (isFollowing(userId)) {
        return false;
      }

      // In a real app, this would make an API call
      // const result = await apiService.followUser(userId);
      
      // For now, simulate the API call
      const newFollowRelationship: FollowRelationship = {
        id: `follow_${Date.now()}`,
        follower_id: "user_current",
        following_id: userId,
        created_at: new Date(),
        following: {
          id: userId,
          full_name: getUserDisplayName(userId),
          profile_image: getUserProfileImage(userId),
        }
      };

      setFollowing(prev => [...prev, newFollowRelationship]);
      
      // Show success notification
      showFollowNotification(`You are now following ${getUserDisplayName(userId)}`);
      
      return true;
    } catch (error) {
      console.error("Error following user:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unfollowUser = async (userId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // In a real app, this would make an API call
      // const result = await apiService.unfollowUser(userId);
      
      setFollowing(prev => prev.filter(f => f.following_id !== userId));
      
      // Show notification
      showFollowNotification(`You unfollowed ${getUserDisplayName(userId)}`);
      
      return true;
    } catch (error) {
      console.error("Error unfollowing user:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const isFollowing = (userId: string): boolean => {
    return following.some(f => f.following_id === userId);
  };

  const getFollowerCount = (userId: string): number => {
    if (userId === "user_current") {
      return followers.length;
    }
    // In a real app, this would query the database
    return Math.floor(Math.random() * 100) + 10; // Demo random count
  };

  const getFollowingCount = (userId: string): number => {
    if (userId === "user_current") {
      return following.length;
    }
    // In a real app, this would query the database
    return Math.floor(Math.random() * 80) + 5; // Demo random count
  };

  const refreshFollowData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      // In a real app, this would fetch fresh data from the API
      // const [followersData, followingData] = await Promise.all([
      //   apiService.getFollowers(),
      //   apiService.getFollowing()
      // ]);
      // setFollowers(followersData);
      // setFollowing(followingData);
    } catch (error) {
      console.error("Error refreshing follow data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FollowContext.Provider
      value={{
        followers,
        following,
        isLoading,
        followUser,
        unfollowUser,
        isFollowing,
        getFollowerCount,
        getFollowingCount,
        refreshFollowData,
      }}
    >
      {children}
    </FollowContext.Provider>
  );
}

export function useFollow() {
  const context = useContext(FollowContext);
  if (context === undefined) {
    throw new Error("useFollow must be used within a FollowProvider");
  }
  return context;
}

// Helper functions
function getUserDisplayName(userId: string): string {
  const userMap: { [key: string]: string } = {
    "user_dan_smith": "Dan Smith",
    "user_coach_holly": "Coach Holly Peristiani",
    "user_sarah_jones": "Sarah Jones",
    "user_maddie_wei": "Maddie Wei",
    "user_alex_chen": "Alex Chen",
  };
  return userMap[userId] || "Unknown User";
}

function getUserProfileImage(userId: string): string {
  const imageMap: { [key: string]: string } = {
    "user_dan_smith": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    "user_coach_holly": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
    "user_sarah_jones": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    "user_maddie_wei": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
    "user_alex_chen": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
  };
  return imageMap[userId] || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face";
}

function showFollowNotification(message: string) {
  // Create a native-style toast notification
  const toast = document.createElement('div');
  toast.className = 'fixed top-16 left-1/2 transform -translate-x-1/2 z-[1001] bg-green-600 text-white px-4 py-2 rounded-lg font-medium max-w-sm mx-4';
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.opacity = '0.9';
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
}
