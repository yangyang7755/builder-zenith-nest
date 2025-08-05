import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useUserProfile } from "./UserProfileContext";
import { useHaptic } from "../hooks/useMobile";
import { getClubByName, getClubDisplayName, getClubProfileImage } from "../utils/clubUtils";

export interface ClubMembership {
  id: string;
  user_id: string;
  club_id: string;
  club_name: string;
  role: "member" | "manager" | "admin";
  joined_at: Date;
  status: "active" | "pending" | "inactive";
  club_data: {
    id: string;
    name: string;
    displayName: string;
    profileImage: string;
    type: string;
    location: string;
    memberCount: number;
  };
}

export interface ClubChatAccess {
  club_id: string;
  can_view_chat: boolean;
  can_post_messages: boolean;
  can_moderate: boolean;
}

interface ClubMembershipContextType {
  userMemberships: ClubMembership[];
  clubMembers: Map<string, ClubMembership[]>; // club_id -> members
  joinClub: (clubName: string, message?: string) => Promise<boolean>;
  leaveClub: (clubId: string) => Promise<boolean>;
  getUserClubs: () => ClubMembership[];
  getClubMembers: (clubId: string) => ClubMembership[];
  isClubMember: (clubId: string) => boolean;
  getClubRole: (clubId: string) => "member" | "manager" | "admin" | null;
  getClubChatAccess: (clubId: string) => ClubChatAccess;
  canAccessClubChat: (clubId: string) => boolean;
  updateMemberRole: (clubId: string, userId: string, newRole: "member" | "manager") => Promise<boolean>;
  refreshMemberships: () => Promise<void>;
}

const ClubMembershipContext = createContext<ClubMembershipContextType | undefined>(undefined);

export function ClubMembershipProvider({ children }: { children: ReactNode }) {
  const [userMemberships, setUserMemberships] = useState<ClubMembership[]>([]);
  const [clubMembers, setClubMembers] = useState<Map<string, ClubMembership[]>>(new Map());

  // Safe access to UserProfile context
  let currentUserProfile = null;
  try {
    const userProfileContext = useUserProfile();
    currentUserProfile = userProfileContext.currentUserProfile;
  } catch (error) {
    console.warn("UserProfile context not available yet:", error);
  }

  const haptic = useHaptic();

  useEffect(() => {
    initializeDemoMemberships();
  }, []);

  const initializeDemoMemberships = () => {
    // Demo user memberships
    const demoUserMemberships: ClubMembership[] = [
      {
        id: "membership_1",
        user_id: "user_current",
        club_id: "westway-climbing-centre",
        club_name: "westway climbing centre",
        role: "member",
        joined_at: new Date("2024-01-10"),
        status: "active",
        club_data: {
          id: "westway-climbing-centre",
          name: "westway climbing centre",
          displayName: getClubDisplayName("westway climbing centre"),
          profileImage: getClubProfileImage("westway climbing centre"),
          type: "climbing",
          location: "London, UK",
          memberCount: 1250
        }
      },
      {
        id: "membership_2",
        user_id: "user_current",
        club_id: "richmond-cycling-club",
        club_name: "richmond cycling club",
        role: "member", 
        joined_at: new Date("2024-01-15"),
        status: "active",
        club_data: {
          id: "richmond-cycling-club",
          name: "richmond cycling club",
          displayName: getClubDisplayName("richmond cycling club"),
          profileImage: getClubProfileImage("richmond cycling club"),
          type: "cycling",
          location: "Richmond, London",
          memberCount: 450
        }
      }
    ];

    // Demo club members for Westway
    const westwayMembers: ClubMembership[] = [
      {
        id: "membership_1",
        user_id: "user_current",
        club_id: "westway-climbing-centre",
        club_name: "westway climbing centre",
        role: "member",
        joined_at: new Date("2024-01-10"),
        status: "active",
        club_data: {
          id: "westway-climbing-centre",
          name: "westway climbing centre",
          displayName: "Westway Climbing Centre",
          profileImage: getClubProfileImage("westway climbing centre"),
          type: "climbing",
          location: "London, UK",
          memberCount: 1250
        }
      },
      {
        id: "membership_coach_holly",
        user_id: "user_coach_holly",
        club_id: "westway-climbing-centre",
        club_name: "westway climbing centre",
        role: "manager",
        joined_at: new Date("2023-06-01"),
        status: "active",
        club_data: {
          id: "westway-climbing-centre",
          name: "westway climbing centre",
          displayName: "Westway Climbing Centre",
          profileImage: getClubProfileImage("westway climbing centre"),
          type: "climbing",
          location: "London, UK",
          memberCount: 1250
        }
      },
      {
        id: "membership_dan_smith",
        user_id: "user_dan_smith",
        club_id: "westway-climbing-centre",
        club_name: "westway climbing centre",
        role: "member",
        joined_at: new Date("2023-12-01"),
        status: "active",
        club_data: {
          id: "westway-climbing-centre",
          name: "westway climbing centre",
          displayName: "Westway Climbing Centre",
          profileImage: getClubProfileImage("westway climbing centre"),
          type: "climbing",
          location: "London, UK",
          memberCount: 1250
        }
      }
    ];

    setUserMemberships(demoUserMemberships);
    setClubMembers(new Map([["westway-climbing-centre", westwayMembers]]));
  };

  const joinClub = async (clubName: string, message?: string): Promise<boolean> => {
    if (!currentUserProfile) return false;

    try {
      haptic.medium();

      const clubData = getClubByName(clubName);
      if (!clubData) {
        showMembershipNotification("Club not found", "error");
        return false;
      }

      // Check if already a member
      if (isClubMember(clubData.id)) {
        showMembershipNotification("You're already a member of this club!", "warning");
        return false;
      }

      const newMembership: ClubMembership = {
        id: `membership_${Date.now()}`,
        user_id: currentUserProfile.id,
        club_id: clubData.id,
        club_name: clubData.name,
        role: "member",
        joined_at: new Date(),
        status: "active",
        club_data: {
          id: clubData.id,
          name: clubData.name,
          displayName: clubData.displayName,
          profileImage: clubData.profileImage,
          type: clubData.type,
          location: clubData.location,
          memberCount: clubData.memberCount
        }
      };

      // Add to user memberships
      setUserMemberships(prev => [...prev, newMembership]);

      // Add to club members
      setClubMembers(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(clubData.id) || [];
        newMap.set(clubData.id, [...existing, newMembership]);
        return newMap;
      });

      // Trigger profile update
      const event = new CustomEvent('clubMembershipChanged', {
        detail: { 
          action: 'joined',
          clubId: clubData.id,
          clubName: clubData.displayName,
          userId: currentUserProfile.id,
          membership: newMembership
        }
      });
      window.dispatchEvent(event);

      showMembershipNotification(`You joined ${clubData.displayName}!`, "success");
      
      // In a real app, this would call the API
      // await apiService.joinClub(clubData.id, message);
      
      return true;
    } catch (error) {
      console.error("Error joining club:", error);
      showMembershipNotification("Failed to join club", "error");
      return false;
    }
  };

  const leaveClub = async (clubId: string): Promise<boolean> => {
    if (!currentUserProfile) return false;

    try {
      haptic.light();

      const membership = userMemberships.find(m => m.club_id === clubId);
      if (!membership) {
        showMembershipNotification("You're not a member of this club!", "warning");
        return false;
      }

      // Remove from user memberships
      setUserMemberships(prev => prev.filter(m => m.club_id !== clubId));

      // Remove from club members
      setClubMembers(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(clubId) || [];
        const filtered = existing.filter(m => m.user_id !== currentUserProfile.id);
        newMap.set(clubId, filtered);
        return newMap;
      });

      // Trigger profile update
      const event = new CustomEvent('clubMembershipChanged', {
        detail: { 
          action: 'left',
          clubId,
          clubName: membership.club_data.displayName,
          userId: currentUserProfile.id
        }
      });
      window.dispatchEvent(event);

      showMembershipNotification(`You left ${membership.club_data.displayName}`, "info");
      
      // In a real app, this would call the API
      // await apiService.leaveClub(clubId);
      
      return true;
    } catch (error) {
      console.error("Error leaving club:", error);
      showMembershipNotification("Failed to leave club", "error");
      return false;
    }
  };

  const getUserClubs = (): ClubMembership[] => {
    return userMemberships.filter(m => m.status === "active");
  };

  const getClubMembers = (clubId: string): ClubMembership[] => {
    return clubMembers.get(clubId)?.filter(m => m.status === "active") || [];
  };

  const isClubMember = (clubId: string): boolean => {
    return userMemberships.some(m => m.club_id === clubId && m.status === "active");
  };

  const getClubRole = (clubId: string): "member" | "manager" | "admin" | null => {
    const membership = userMemberships.find(m => m.club_id === clubId && m.status === "active");
    return membership?.role || null;
  };

  const getClubChatAccess = (clubId: string): ClubChatAccess => {
    const role = getClubRole(clubId);
    const isMember = isClubMember(clubId);
    
    return {
      club_id: clubId,
      can_view_chat: isMember,
      can_post_messages: isMember,
      can_moderate: role === "manager" || role === "admin"
    };
  };

  const canAccessClubChat = (clubId: string): boolean => {
    return getClubChatAccess(clubId).can_view_chat;
  };

  const updateMemberRole = async (
    clubId: string, 
    userId: string, 
    newRole: "member" | "manager"
  ): Promise<boolean> => {
    try {
      // Check if current user has permission
      const currentRole = getClubRole(clubId);
      if (currentRole !== "manager" && currentRole !== "admin") {
        showMembershipNotification("You don't have permission to change roles", "error");
        return false;
      }

      // Update in club members
      setClubMembers(prev => {
        const newMap = new Map(prev);
        const members = newMap.get(clubId) || [];
        const updated = members.map(m => 
          m.user_id === userId ? { ...m, role: newRole } : m
        );
        newMap.set(clubId, updated);
        return newMap;
      });

      // Update in user memberships if it's the current user
      if (userId === currentUserProfile?.id) {
        setUserMemberships(prev => 
          prev.map(m => 
            m.club_id === clubId ? { ...m, role: newRole } : m
          )
        );
      }

      showMembershipNotification(`Role updated to ${newRole}`, "success");
      
      // In a real app, this would call the API
      // await apiService.updateMemberRole(clubId, userId, newRole);
      
      return true;
    } catch (error) {
      console.error("Error updating member role:", error);
      showMembershipNotification("Failed to update role", "error");
      return false;
    }
  };

  const refreshMemberships = async (): Promise<void> => {
    // In a real app, this would fetch fresh data from the API
    console.log("Refreshing club memberships...");
  };

  return (
    <ClubMembershipContext.Provider
      value={{
        userMemberships,
        clubMembers,
        joinClub,
        leaveClub,
        getUserClubs,
        getClubMembers,
        isClubMember,
        getClubRole,
        getClubChatAccess,
        canAccessClubChat,
        updateMemberRole,
        refreshMemberships,
      }}
    >
      {children}
    </ClubMembershipContext.Provider>
  );
}

export function useClubMembership() {
  const context = useContext(ClubMembershipContext);
  if (context === undefined) {
    throw new Error("useClubMembership must be used within a ClubMembershipProvider");
  }
  return context;
}

// Helper function for membership notifications
function showMembershipNotification(
  message: string, 
  type: "success" | "error" | "warning" | "info" = "info"
) {
  const toast = document.createElement('div');
  const colorClass = 
    type === "success" ? "bg-green-600" :
    type === "error" ? "bg-red-600" :
    type === "warning" ? "bg-yellow-600" :
    "bg-blue-600";
    
  toast.className = `fixed top-16 left-1/2 transform -translate-x-1/2 z-[1001] ${colorClass} text-white px-4 py-2 rounded-lg font-medium max-w-sm mx-4 text-center`;
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
