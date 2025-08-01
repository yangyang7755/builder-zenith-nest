import { createContext, useContext, useState, ReactNode, useEffect } from "react";

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
  const [currentUserId] = useState("current-user"); // In real app, this would come from auth
  
  const [clubs, setClubs] = useState<Club[]>(() => {
    try {
      const saved = localStorage.getItem(CLUBS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((club: any) => ({
          ...club,
          createdAt: new Date(club.createdAt),
          pendingRequests: club.pendingRequests?.map((req: any) => ({
            ...req,
            requestedAt: new Date(req.requestedAt),
          })) || [],
        }));
      }
    } catch (error) {
      console.error("Error loading clubs:", error);
    }
    
    // Default clubs
    return [
      {
        id: "oucc",
        name: "Oxford University Cycling Club (OUCC)",
        description: "The premier cycling club at Oxford University. We organize regular rides, training sessions, and social events for cyclists of all levels.",
        profileImage: "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F2ef8190dcf74499ba685f251b701545c?format=webp&width=800",
        coverImage: "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F2ef8190dcf74499ba685f251b701545c?format=webp&width=800",
        type: "cycling",
        location: "Oxford, UK",
        memberCount: 156,
        managerId: "current-user",
        managers: ["current-user"],
        members: ["current-user", "user2", "user3"],
        pendingRequests: [
          {
            id: "req1",
            userId: "user4",
            userName: "Sarah Chen",
            userEmail: "sarah.chen@oxford.ac.uk",
            message: "Hi! I'm a keen cyclist and would love to join the club for weekend rides.",
            requestedAt: new Date("2025-01-10"),
            status: "pending",
          },
          {
            id: "req2",
            userId: "user5",
            userName: "Mike Johnson",
            userEmail: "mike.j@oxford.ac.uk",
            requestedAt: new Date("2025-01-12"),
            status: "pending",
          },
        ],
        isPrivate: false,
        website: "https://oucc.co.uk",
        contactEmail: "info@oucc.co.uk",
        createdAt: new Date("2020-01-01"),
      },
      {
        id: "westway",
        name: "Westway Climbing Centre",
        description: "London's premier climbing facility offering indoor climbing, coaching, and community events for climbers of all abilities.",
        profileImage: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=200&h=200&fit=crop",
        coverImage: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&h=300&fit=crop",
        type: "climbing",
        location: "London, UK",
        memberCount: 342,
        managerId: "coach-holly",
        managers: ["coach-holly"],
        members: ["coach-holly", "current-user", "user6", "user7"],
        pendingRequests: [],
        isPrivate: false,
        website: "https://westway.org",
        contactEmail: "info@westway.org",
        createdAt: new Date("2019-03-15"),
      },
    ];
  });

  const [userClubs, setUserClubs] = useState<UserClubInfo[]>(() => {
    try {
      const saved = localStorage.getItem(USER_CLUBS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((info: any) => ({
          ...info,
          joinedAt: new Date(info.joinedAt),
        }));
      }
    } catch (error) {
      console.error("Error loading user clubs:", error);
    }
    
    // Default user club memberships
    return [
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
    ];
  });

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

  const requestToJoinClub = (clubId: string, message?: string) => {
    const club = getClubById(clubId);
    if (!club) return;

    const newRequest: ClubRequest = {
      id: Date.now().toString(),
      userId: currentUserId,
      userName: "You", // In real app, get from user profile
      userEmail: "you@example.com", // In real app, get from user profile
      message,
      requestedAt: new Date(),
      status: "pending",
    };

    setClubs(prev => prev.map(c => 
      c.id === clubId 
        ? { ...c, pendingRequests: [...c.pendingRequests, newRequest] }
        : c
    ));
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

  const removeMember = (clubId: string, memberId: string) => {
    if (!isClubManager(clubId)) return;

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
