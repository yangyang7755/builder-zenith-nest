import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";

export interface Club {
  id: string;
  name: string;
  description: string;
  profileImage: string;
  coverImage?: string;
  type: "cycling" | "climbing" | "running" | "hiking" | "skiing" | "surfing" | "tennis" | "general";
  location: string;
  memberCount: number;
  managerId: string;
  managers: string[]; // Array of user IDs who can manage the club
  members: string[]; // Array of user IDs who are members
  pendingRequests: ClubRequest[]; // Pending membership requests
  isPrivate: boolean;
  website?: string;
  contactEmail?: string;
  createdAt: Date;
}

export interface ClubRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  message?: string;
  requestedAt: Date;
  status: "pending" | "approved" | "denied";
}

export type UserClubRole = "non-member" | "member" | "manager";

export interface UserClubInfo {
  clubId: string;
  role: UserClubRole;
  joinedAt: Date;
}

interface ClubContextType {
  clubs: Club[];
  userClubs: UserClubInfo[];
  getUserClubRole: (clubId: string) => UserClubRole;
  getUserClubs: () => Club[];
  isClubManager: (clubId: string) => boolean;
  isClubMember: (clubId: string) => boolean;
  getClubById: (clubId: string) => Club | undefined;
  requestToJoinClub: (clubId: string, message?: string) => void;
  approveClubRequest: (clubId: string, requestId: string) => void;
  denyClubRequest: (clubId: string, requestId: string) => void;
  removeMember: (clubId: string, memberId: string) => void;
  updateClub: (clubId: string, updates: Partial<Club>) => void;
  getClubActivities: (clubId: string) => any[];
  currentUserId: string;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

const CLUBS_STORAGE_KEY = "explore_app_clubs";
const USER_CLUBS_STORAGE_KEY = "explore_app_user_clubs";

export function ClubProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const currentUserId = user?.id || "demo-user";

  // Listen for club membership changes
  useEffect(() => {
    const handleMembershipChange = (event: CustomEvent) => {
      const { action, clubId, userId } = event.detail;

      setClubs(prev =>
        prev.map(club => {
          if (club.id === clubId) {
            if (action === 'joined') {
              return {
                ...club,
                members: [...club.members, userId],
                memberCount: club.memberCount + 1
              };
            } else if (action === 'left') {
              return {
                ...club,
                members: club.members.filter(id => id !== userId),
                memberCount: Math.max(0, club.memberCount - 1)
              };
            }
          }
          return club;
        })
      );
    };

    window.addEventListener('clubMembershipChanged', handleMembershipChange as EventListener);

    return () => {
      window.removeEventListener('clubMembershipChanged', handleMembershipChange as EventListener);
    };
  }, []);

  const [clubs, setClubs] = useState<Club[]>([]);
  const [userClubs, setUserClubs] = useState<UserClubInfo[]>([]);
  const [loading, setLoading] = useState(false);

  // Load clubs and user memberships from backend
  const loadClubData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [clubsResponse, userClubsResponse] = await Promise.allSettled([
        apiService.getClubs(),
        apiService.getClubMemberships(),
      ]);

      // Handle clubs response
      if (clubsResponse.status === 'fulfilled' && clubsResponse.value.data) {
        setClubs(clubsResponse.value.data);
      } else {
        console.warn('Failed to load clubs, using demo data');
        // Use demo clubs as fallback
        setClubs([
          {
            id: "oucc",
            name: "Oxford University Cycling Club",
            description: "The premier cycling club at Oxford University.",
            profileImage: "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F2ef8190dcf74499ba685f251b701545c?format=webp&width=800",
            type: "cycling",
            location: "Oxford, UK",
            memberCount: 156,
            managerId: currentUserId,
            managers: [currentUserId],
            members: [currentUserId],
            pendingRequests: [],
            isPrivate: false,
            website: "https://oucc.co.uk",
            contactEmail: "info@oucc.co.uk",
            createdAt: new Date("2020-01-01"),
          },
          {
            id: "westway",
            name: "Westway Climbing Centre",
            description: "London's premier climbing facility.",
            profileImage: "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2Fcce50dcf455a49d6aa9a7694c8a58f26?format=webp&width=800",
            type: "climbing",
            location: "London, UK",
            memberCount: 342,
            managerId: "coach-holly",
            managers: ["coach-holly"],
            members: ["coach-holly", currentUserId],
            pendingRequests: [],
            isPrivate: false,
            website: "https://westway.org",
            contactEmail: "info@westway.org",
            createdAt: new Date("2019-03-15"),
          },
        ]);
      }

      // Handle user clubs response
      if (userClubsResponse.status === 'fulfilled' && userClubsResponse.value.data) {
        setUserClubs(userClubsResponse.value.data.map((club: any) => ({
          clubId: club.id,
          role: club.role || 'member',
          joinedAt: new Date(club.joined_at || Date.now()),
        })));
      } else {
        console.warn('Failed to load user clubs, using demo data');
        // Use demo memberships as fallback
        setUserClubs([
          {
            clubId: "oucc",
            role: "manager" as UserClubRole,
            joinedAt: new Date("2024-09-01"),
          },
          {
            clubId: "westway",
            role: "member" as UserClubRole,
            joinedAt: new Date("2024-10-15"),
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading club data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadClubData();
    } else {
      setClubs([]);
      setUserClubs([]);
    }
  }, [user]);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem(CLUBS_STORAGE_KEY, JSON.stringify(clubs));
  }, [clubs]);

  useEffect(() => {
    localStorage.setItem(USER_CLUBS_STORAGE_KEY, JSON.stringify(userClubs));
  }, [userClubs]);

  const getUserClubRole = (clubId: string): UserClubRole => {
    const userClub = userClubs.find(uc => uc.clubId === clubId);
    return userClub?.role || "non-member";
  };

  const getUserClubs = (): Club[] => {
    return userClubs.map(uc => clubs.find(c => c.id === uc.clubId)).filter(Boolean) as Club[];
  };

  const isClubManager = (clubId: string): boolean => {
    return getUserClubRole(clubId) === "manager";
  };

  const isClubMember = (clubId: string): boolean => {
    const role = getUserClubRole(clubId);
    return role === "member" || role === "manager";
  };

  const getClubById = (clubId: string): Club | undefined => {
    return clubs.find(c => c.id === clubId);
  };

  const requestToJoinClub = async (clubId: string, message?: string) => {
    const club = getClubById(clubId);
    if (!club || !user) return;

    try {
      setLoading(true);
      const response = await apiService.joinClub(clubId);

      if (response.error) {
        throw new Error(response.error);
      }

      // Update local state optimistically
      setUserClubs(prev => [
        ...prev.filter(uc => uc.clubId !== clubId),
        {
          clubId,
          role: "member",
          joinedAt: new Date(),
        },
      ]);

      setClubs(prev => prev.map(c =>
        c.id === clubId
          ? {
              ...c,
              members: [...c.members, currentUserId],
              memberCount: c.memberCount + 1
            }
          : c
      ));

      toast({
        title: "Joined Club! 🎉",
        description: `You are now a member of ${club.name}`,
      });

      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('clubMembershipChanged', {
        detail: { action: 'joined', clubId, userId: currentUserId }
      }));

    } catch (error: any) {
      console.error('Error joining club:', error);
      toast({
        title: "Error Joining Club",
        description: error.message || "Failed to join club. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const approveClubRequest = (clubId: string, requestId: string) => {
    const club = getClubById(clubId);
    const request = club?.pendingRequests.find(r => r.id === requestId);
    if (!club || !request || !isClubManager(clubId)) return;

    // Add user to club members
    setClubs(prev => prev.map(c => 
      c.id === clubId 
        ? { 
            ...c, 
            members: [...c.members, request.userId],
            memberCount: c.memberCount + 1,
            pendingRequests: c.pendingRequests.filter(r => r.id !== requestId)
          }
        : c
    ));

    // Add club to user's clubs if it's the current user
    if (request.userId === currentUserId) {
      setUserClubs(prev => [
        ...prev.filter(uc => uc.clubId !== clubId),
        {
          clubId,
          role: "member",
          joinedAt: new Date(),
        },
      ]);
    }
  };

  const denyClubRequest = (clubId: string, requestId: string) => {
    if (!isClubManager(clubId)) return;

    setClubs(prev => prev.map(c => 
      c.id === clubId 
        ? { ...c, pendingRequests: c.pendingRequests.filter(r => r.id !== requestId) }
        : c
    ));
  };

  const removeMember = async (clubId: string, memberId: string) => {
    if (!isClubManager(clubId) && memberId !== currentUserId) return;

    try {
      setLoading(true);
      const response = await apiService.leaveClub(clubId);

      if (response.error) {
        throw new Error(response.error);
      }

      // Update local state
      setClubs(prev => prev.map(c =>
        c.id === clubId
          ? {
              ...c,
              members: c.members.filter(m => m !== memberId),
              memberCount: Math.max(0, c.memberCount - 1)
            }
          : c
      ));

      // Remove club from user's clubs if it's the current user
      if (memberId === currentUserId) {
        setUserClubs(prev => prev.filter(uc => uc.clubId !== clubId));

        const club = getClubById(clubId);
        toast({
          title: "Left Club",
          description: `You have left ${club?.name}`,
        });

        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('clubMembershipChanged', {
          detail: { action: 'left', clubId, userId: currentUserId }
        }));
      }

    } catch (error: any) {
      console.error('Error leaving club:', error);
      toast({
        title: "Error Leaving Club",
        description: error.message || "Failed to leave club. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateClub = (clubId: string, updates: Partial<Club>) => {
    if (!isClubManager(clubId)) return;

    setClubs(prev => prev.map(c => 
      c.id === clubId 
        ? { ...c, ...updates }
        : c
    ));
  };

  const getClubActivities = (clubId: string) => {
    // This would integrate with the activities context
    // For now, return empty array - will be implemented when integrating with activities
    return [];
  };

  return (
    <ClubContext.Provider value={{
      clubs,
      userClubs,
      getUserClubRole,
      getUserClubs,
      isClubManager,
      isClubMember,
      getClubById,
      requestToJoinClub,
      approveClubRequest,
      denyClubRequest,
      removeMember,
      updateClub,
      getClubActivities,
      currentUserId,
    }}>
      {children}
    </ClubContext.Provider>
  );
}

export function useClub() {
  const context = useContext(ClubContext);
  if (context === undefined) {
    throw new Error("useClub must be used within a ClubProvider");
  }
  return context;
}
