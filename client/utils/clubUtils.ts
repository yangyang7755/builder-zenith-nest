// Utility functions for club-related calculations

export interface ClubMember {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'manager';
}

export interface ClubRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  message?: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'denied';
}

export interface Club {
  id: string;
  name: string;
  description: string;
  type: string;
  location: string;
  members: ClubMember[];
  managers: string[];
  pendingRequests: ClubRequest[];
  memberCount?: number; // This should be calculated, not stored
}

/**
 * Calculate the actual member count from the members array
 */
export const getActualMemberCount = (club: Club | any): number => {
  if (!club) return 0;
  
  // If we have a members array, use its length
  if (Array.isArray(club.members)) {
    return club.members.filter(member => 
      member.status === 'approved' || !member.status // Assume approved if no status
    ).length;
  }
  
  // Fallback to managers length if available
  if (Array.isArray(club.managers)) {
    return club.managers.length;
  }
  
  // Last fallback to stored memberCount
  return club.memberCount || 0;
};

/**
 * Get pending requests count
 */
export const getPendingRequestsCount = (club: Club | any): number => {
  if (!club?.pendingRequests) return 0;
  return club.pendingRequests.filter(req => req.status === 'pending').length;
};

/**
 * Check if user is a club manager
 */
export const isClubManager = (club: Club | any, userId: string): boolean => {
  if (!club || !userId) return false;
  
  // Check managers array
  if (Array.isArray(club.managers)) {
    return club.managers.includes(userId);
  }
  
  // Check members array for manager role
  if (Array.isArray(club.members)) {
    return club.members.some(member => 
      member.id === userId && member.role === 'manager'
    );
  }
  
  return false;
};

/**
 * Check if user is a club member (including managers)
 */
export const isClubMember = (club: Club | any, userId: string): boolean => {
  if (!club || !userId) return false;
  
  // Check if user is a manager first
  if (isClubManager(club, userId)) return true;
  
  // Check members array
  if (Array.isArray(club.members)) {
    return club.members.some(member => member.id === userId);
  }
  
  return false;
};

/**
 * Get club member by user ID
 */
export const getClubMember = (club: Club | any, userId: string): ClubMember | null => {
  if (!club?.members || !userId) return null;
  
  return club.members.find(member => member.id === userId) || null;
};

/**
 * Format member count for display
 */
export const formatMemberCount = (count: number): string => {
  if (count === 0) return 'No members';
  if (count === 1) return '1 member';
  return `${count} members`;
};

/**
 * Get managers from members array
 */
export const getClubManagers = (club: Club | any): ClubMember[] => {
  if (!club?.members) return [];
  
  return club.members.filter(member => member.role === 'manager');
};

/**
 * Get regular members (non-managers) from members array
 */
export const getClubRegularMembers = (club: Club | any): ClubMember[] => {
  if (!club?.members) return [];
  
  return club.members.filter(member => member.role === 'member');
};

/**
 * Normalize club data to ensure consistent member counting
 */
export const normalizeClubData = (club: any): Club => {
  const actualMemberCount = getActualMemberCount(club);
  
  return {
    ...club,
    memberCount: actualMemberCount,
    members: club.members || [],
    pendingRequests: club.pendingRequests || [],
    managers: club.managers || []
  };
};
