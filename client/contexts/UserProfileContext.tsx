import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";

export interface UserProfile {
  id: string;
  full_name: string;
  profile_image?: string;
  bio?: string;
  email: string;
  location?: string;
  institution?: string;
  climbing_grade?: string;
  cycling_level?: string;
  running_pace?: string;
  age?: number;
  gender?: string;
  nationality?: string;
  languages?: string[];
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences?: {
    visibility: {
      profile_image: boolean;
      full_name: boolean;
      age: boolean;
      gender: boolean;
      location: boolean;
      bio: boolean;
      followers: boolean;
      following: boolean;
      activities: boolean;
      clubs: boolean;
      reviews: boolean;
    };
  };
  last_updated: Date;
}

interface UserProfileContextType {
  currentUserProfile: UserProfile | null;
  allUserProfiles: Map<string, UserProfile>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  getUserProfile: (userId: string) => UserProfile | null;
  subscribeToProfileUpdates: (userId: string, callback: (profile: UserProfile) => void) => () => void;
  syncProfileAcrossApp: (profile: UserProfile) => void;
  isLoading: boolean;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [allUserProfiles, setAllUserProfiles] = useState<Map<string, UserProfile>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [profileSubscriptions, setProfileSubscriptions] = useState<Map<string, ((profile: UserProfile) => void)[]>>(new Map());

  // Initialize with demo profiles
  useEffect(() => {
    initializeDemoProfiles();
    loadCurrentUserProfile();
  }, [user]);

  const initializeDemoProfiles = () => {
    const demoProfiles: UserProfile[] = [
      {
        id: "user_current",
        full_name: "Maddie Wei", 
        profile_image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
        bio: "Weekend warrior and outdoor enthusiast. Love helping people reach new heights!",
        email: "maddie.wei@example.com",
        location: "London, UK",
        institution: "King's College London",
        climbing_grade: "6b+",
        cycling_level: "Intermediate", 
        age: 24,
        gender: "Female",
        nationality: "British-Chinese",
        languages: ["English", "Mandarin"],
        preferences: {
          visibility: {
            profile_image: true,
            full_name: true,
            age: true,
            gender: true,
            location: true,
            bio: true,
            followers: true,
            following: true,
            activities: true,
            clubs: true,
            reviews: true,
          }
        },
        last_updated: new Date()
      },
      {
        id: "user_coach_holly",
        full_name: "Coach Holly Peristiani",
        profile_image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
        bio: "Professional climbing coach and trainer",
        email: "holly@example.com",
        location: "London, UK",
        climbing_grade: "7c",
        age: 32,
        gender: "Female",
        preferences: {
          visibility: {
            profile_image: true,
            full_name: true,
            age: true,
            gender: true,
            location: true,
            bio: true,
            followers: true,
            following: true,
            activities: true,
            clubs: true,
            reviews: true,
          }
        },
        last_updated: new Date()
      },
      {
        id: "user_dan_smith",
        full_name: "Dan Smith",
        profile_image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
        bio: "Avid climber and outdoor enthusiast",
        email: "dan.smith@example.com",
        location: "London, UK",
        climbing_grade: "6c",
        age: 28,
        gender: "Male",
        preferences: {
          visibility: {
            profile_image: true,
            full_name: true,
            age: true,
            gender: true,
            location: true,
            bio: true,
            followers: true,
            following: true,
            activities: true,
            clubs: true,
            reviews: true,
          }
        },
        last_updated: new Date()
      }
    ];

    const profilesMap = new Map<string, UserProfile>();
    demoProfiles.forEach(profile => {
      profilesMap.set(profile.id, profile);
    });
    setAllUserProfiles(profilesMap);
  };

  const loadCurrentUserProfile = () => {
    // Load from localStorage if exists
    const savedProfile = localStorage.getItem('currentUserProfile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setCurrentUserProfile(profile);
        setAllUserProfiles(prev => new Map(prev.set(profile.id, profile)));
      } catch (error) {
        console.error('Error loading saved profile:', error);
      }
    } else {
      // Use demo profile
      const demoProfile = allUserProfiles.get("user_current");
      if (demoProfile) {
        setCurrentUserProfile(demoProfile);
      }
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!currentUserProfile) return;

    setIsLoading(true);
    try {
      const updatedProfile: UserProfile = {
        ...currentUserProfile,
        ...updates,
        last_updated: new Date()
      };

      // Update current user profile
      setCurrentUserProfile(updatedProfile);
      
      // Update in all profiles map
      setAllUserProfiles(prev => new Map(prev.set(updatedProfile.id, updatedProfile)));
      
      // Save to localStorage
      localStorage.setItem('currentUserProfile', JSON.stringify(updatedProfile));
      
      // Sync across the entire app
      syncProfileAcrossApp(updatedProfile);
      
      // Trigger subscribed callbacks
      const callbacks = profileSubscriptions.get(updatedProfile.id) || [];
      callbacks.forEach(callback => callback(updatedProfile));
      
      // Show success notification
      showProfileUpdateNotification("Profile updated successfully!");
      
      // In a real app, this would update the backend
      // await apiService.updateUserProfile(updatedProfile);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      showProfileUpdateNotification("Failed to update profile", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getUserProfile = (userId: string): UserProfile | null => {
    return allUserProfiles.get(userId) || null;
  };

  const subscribeToProfileUpdates = (
    userId: string, 
    callback: (profile: UserProfile) => void
  ): (() => void) => {
    setProfileSubscriptions(prev => {
      const existing = prev.get(userId) || [];
      const newMap = new Map(prev);
      newMap.set(userId, [...existing, callback]);
      return newMap;
    });

    // Return unsubscribe function
    return () => {
      setProfileSubscriptions(prev => {
        const existing = prev.get(userId) || [];
        const filtered = existing.filter(cb => cb !== callback);
        const newMap = new Map(prev);
        if (filtered.length === 0) {
          newMap.delete(userId);
        } else {
          newMap.set(userId, filtered);
        }
        return newMap;
      });
    };
  };

  const syncProfileAcrossApp = (profile: UserProfile) => {
    // Update all chat messages from this user
    syncChatMessages(profile);
    
    // Update all activities organized by this user
    syncActivityOrganizers(profile);
    
    // Update all activity participants
    syncActivityParticipants(profile);
    
    // Update follower/following lists
    syncFollowerLists(profile);
    
    // Update club member lists
    syncClubMemberships(profile);
    
    // Update activity reviews
    syncActivityReviews(profile);
  };

  const syncChatMessages = (profile: UserProfile) => {
    // This would trigger an update in ChatContext
    const event = new CustomEvent('profileUpdated', { 
      detail: { userId: profile.id, profile } 
    });
    window.dispatchEvent(event);
  };

  const syncActivityOrganizers = (profile: UserProfile) => {
    // This would trigger an update in ActivitiesContext
    const event = new CustomEvent('organizerProfileUpdated', { 
      detail: { userId: profile.id, profile } 
    });
    window.dispatchEvent(event);
  };

  const syncActivityParticipants = (profile: UserProfile) => {
    // Update activity participant lists
    const event = new CustomEvent('participantProfileUpdated', { 
      detail: { userId: profile.id, profile } 
    });
    window.dispatchEvent(event);
  };

  const syncFollowerLists = (profile: UserProfile) => {
    // Update follow context
    const event = new CustomEvent('followerProfileUpdated', { 
      detail: { userId: profile.id, profile } 
    });
    window.dispatchEvent(event);
  };

  const syncClubMemberships = (profile: UserProfile) => {
    // Update club context
    const event = new CustomEvent('clubMemberProfileUpdated', { 
      detail: { userId: profile.id, profile } 
    });
    window.dispatchEvent(event);
  };

  const syncActivityReviews = (profile: UserProfile) => {
    // Update activity completion context
    const event = new CustomEvent('reviewerProfileUpdated', { 
      detail: { userId: profile.id, profile } 
    });
    window.dispatchEvent(event);
  };

  return (
    <UserProfileContext.Provider
      value={{
        currentUserProfile,
        allUserProfiles,
        updateProfile,
        getUserProfile,
        subscribeToProfileUpdates,
        syncProfileAcrossApp,
        isLoading,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
}

// Helper function for profile update notifications
function showProfileUpdateNotification(message: string, type: "success" | "error" = "success") {
  const toast = document.createElement('div');
  toast.className = `fixed top-16 left-1/2 transform -translate-x-1/2 z-[1001] px-4 py-2 rounded-lg font-medium max-w-sm mx-4 text-center ${
    type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
  }`;
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
