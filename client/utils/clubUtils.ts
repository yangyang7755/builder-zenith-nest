// Club Consistency System
// Ensures all clubs with the same name have consistent data across the app

export interface ClubData {
  id: string;
  name: string;
  displayName: string;
  profileImage: string;
  coverImage?: string;
  description: string;
  location: string;
  type: string;
  website?: string;
  contactEmail?: string;
  isPrivate: boolean;
  memberCount: number;
  tags: string[];
}

// Centralized club database - ensures consistency across the app
export const CLUB_DATABASE: { [key: string]: ClubData } = {
  // Climbing clubs
  "westway-climbing-centre": {
    id: "westway-climbing-centre",
    name: "westway climbing centre",
    displayName: "Westway Climbing Centre",
    profileImage:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&h=100&fit=crop",
    coverImage:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=400&fit=crop",
    description:
      "London's premier indoor climbing centre with world-class routes and training facilities.",
    location: "23 Crowthorne Rd, London W10 6RP",
    type: "climbing",
    website: "https://www.westway.org",
    contactEmail: "climbing@westway.org",
    isPrivate: false,
    memberCount: 1250,
    tags: ["indoor climbing", "bouldering", "lead climbing", "training"],
  },

  "vauxwall-climbing": {
    id: "vauxwall-climbing",
    name: "vauxwall climbing",
    displayName: "VauxWall Climbing",
    profileImage:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop",
    coverImage:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop",
    description:
      "South London's favorite climbing destination with challenging routes for all levels.",
    location: "6A South Lambeth Rd, London SW8 1SP",
    type: "climbing",
    website: "https://www.vauxwall.com",
    contactEmail: "info@vauxwall.com",
    isPrivate: false,
    memberCount: 890,
    tags: ["indoor climbing", "competitions", "coaching", "youth programs"],
  },

  // Cycling clubs
  "richmond-running-club": {
    id: "richmond-running-club",
    name: "richmond running club",
    displayName: "Richmond Running Club",
    profileImage:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop",
    coverImage:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop",
    description:
      "Exploring Richmond Park and beyond with weekend social runs and training sessions.",
    location: "Richmond Park, London",
    type: "running",
    website: "https://www.richmondrc.co.uk",
    contactEmail: "runs@richmondrc.co.uk",
    isPrivate: false,
    memberCount: 450,
    tags: ["road running", "social runs", "training", "richmond park"],
  },

  "rapha-cycling-club": {
    id: "rapha-cycling-club",
    name: "rapha cycling club",
    displayName: "Rapha Cycling Club",
    profileImage:
      "https://images.unsplash.com/photo-1544191696-15693bd10516?w=100&h=100&fit=crop",
    coverImage:
      "https://images.unsplash.com/photo-1544191696-15693bd10516?w=800&h=400&fit=crop",
    description:
      "Premium cycling experiences with a focus on style, performance, and community.",
    location: "Various locations across London",
    type: "cycling",
    website: "https://www.rapha.cc/gb/en/rcc",
    contactEmail: "london@rapha.cc",
    isPrivate: false,
    memberCount: 320,
    tags: ["premium cycling", "events", "racing", "lifestyle"],
  },

  "thames-cyclists": {
    id: "thames-cyclists",
    name: "thames cyclists",
    displayName: "Thames Cyclists",
    profileImage:
      "https://images.unsplash.com/photo-1517654443271-11c621d19e60?w=100&h=100&fit=crop",
    coverImage:
      "https://images.unsplash.com/photo-1517654443271-11c621d19e60?w=800&h=400&fit=crop",
    description:
      "Scenic rides along the Thames with a friendly community of cycling enthusiasts.",
    location: "Thames Path, London",
    type: "cycling",
    website: "https://www.thamescyclists.org",
    contactEmail: "info@thamescyclists.org",
    isPrivate: false,
    memberCount: 280,
    tags: ["scenic routes", "thames path", "leisure cycling", "photography"],
  },

  // University clubs
  "oxford-university-cycling-club": {
    id: "oxford-university-cycling-club",
    name: "oxford university cycling club",
    displayName: "Oxford University Cycling Club",
    profileImage:
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=100&h=100&fit=crop",
    coverImage:
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=400&fit=crop",
    description:
      "Oxford's premier cycling club for students and alumni, racing and touring since 1893.",
    location: "Oxford, UK",
    type: "cycling",
    website: "https://www.oucc.org",
    contactEmail: "captain@oucc.org",
    isPrivate: false,
    memberCount: 180,
    tags: ["university", "racing", "touring", "varsity match"],
  },

  "oxford-university-climbing-club": {
    id: "oxford-university-climbing-club",
    name: "oxford university climbing club",
    displayName: "Oxford University Climbing Club",
    profileImage:
      "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=100&h=100&fit=crop",
    coverImage:
      "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&h=400&fit=crop",
    description:
      "Adventure and climbing for Oxford students, from beginners to experts.",
    location: "Oxford, UK",
    type: "climbing",
    website: "https://www.oucc.org.uk",
    contactEmail: "climbing@oucc.org.uk",
    isPrivate: false,
    memberCount: 220,
    tags: ["university", "outdoor climbing", "mountaineering", "expeditions"],
  },

  uclmc: {
    id: "uclmc",
    name: "uclmc",
    displayName: "UCLMC",
    profileImage:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=100&h=100&fit=crop",
    coverImage:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=400&fit=crop",
    description:
      "UCL Mountaineering Club - exploring peaks and crags across the UK and beyond.",
    location: "University College London",
    type: "climbing",
    website: "https://www.uclmc.com",
    contactEmail: "committee@uclmc.com",
    isPrivate: false,
    memberCount: 195,
    tags: ["university", "mountaineering", "outdoor", "expeditions"],
  },

  // Running clubs
  "richmond-runners": {
    id: "richmond-runners",
    name: "richmond runners",
    displayName: "Richmond Runners",
    profileImage:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop",
    coverImage:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop",
    description:
      "A friendly running club for all abilities in the Richmond area.",
    location: "Richmond, London",
    type: "running",
    website: "https://www.richmondrunners.org",
    contactEmail: "info@richmondrunners.org",
    isPrivate: false,
    memberCount: 340,
    tags: ["running", "marathons", "social", "richmond park"],
  },
};

// Helper functions for club consistency
export const getClubByName = (clubName: string): ClubData | null => {
  const normalizedName = normalizeClubName(clubName);
  return CLUB_DATABASE[normalizedName] || null;
};

export const normalizeClubName = (name: string | any): string => {
  // Handle non-string inputs safely
  if (!name) return "";

  // If it's an object with a name property, use that
  if (typeof name === 'object' && name.name) {
    name = name.name;
  }

  // Convert to string if it's not already
  const nameStr = String(name);

  return nameStr
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .trim();
};

export const getClubProfileImage = (clubName: string): string => {
  const club = getClubByName(clubName);
  return club?.profileImage || getDefaultClubImage(clubName);
};

export const getClubDisplayName = (clubName: string): string => {
  const club = getClubByName(clubName);
  return club?.displayName || clubName;
};

export const getClubDescription = (clubName: string): string => {
  const club = getClubByName(clubName);
  return club?.description || `A community club for ${clubName} enthusiasts.`;
};

export const getClubMemberCount = (clubName: string): number => {
  const club = getClubByName(clubName);
  return club?.memberCount || Math.floor(Math.random() * 500) + 50;
};

export const getClubLocation = (clubName: string): string => {
  const club = getClubByName(clubName);
  return club?.location || "London, UK";
};

export const getClubWebsite = (clubName: string): string | undefined => {
  const club = getClubByName(clubName);
  return club?.website;
};

export const getClubTags = (clubName: string): string[] => {
  const club = getClubByName(clubName);
  return club?.tags || [];
};

export const isClubPrivate = (clubName: string): boolean => {
  const club = getClubByName(clubName);
  return club?.isPrivate || false;
};

export const getDefaultClubImage = (clubName: string): string => {
  // Generate consistent default images based on club type
  const normalizedName = normalizeClubName(clubName);

  if (
    normalizedName.includes("climbing") ||
    normalizedName.includes("mountain")
  ) {
    return "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&h=100&fit=crop";
  } else if (
    normalizedName.includes("cycling") ||
    normalizedName.includes("bike")
  ) {
    return "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=100&h=100&fit=crop";
  } else if (
    normalizedName.includes("running") ||
    normalizedName.includes("runner")
  ) {
    return "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop";
  } else if (
    normalizedName.includes("university") ||
    normalizedName.includes("oxford") ||
    normalizedName.includes("ucl")
  ) {
    return "https://images.unsplash.com/photo-1562774053-701939374585?w=100&h=100&fit=crop";
  }

  return "https://images.unsplash.com/photo-1566737236500-c8ac43014a8a?w=100&h=100&fit=crop";
};

// Function to update all existing club references in the app
export const updateClubConsistency = () => {
  // This would be used to update existing data to use consistent club information
  console.log("Updating club consistency across the app...");

  // In a real app, this would:
  // 1. Query all activities/profiles with club references
  // 2. Update them to use the standardized club data
  // 3. Ensure all club names are normalized
  // 4. Update profile images to use the standard ones
};

// Search function for clubs
export const searchClubs = (query: string, type?: string): ClubData[] => {
  const normalizedQuery = query.toLowerCase();

  return Object.values(CLUB_DATABASE).filter((club) => {
    const matchesQuery =
      club.name.includes(normalizedQuery) ||
      club.displayName.toLowerCase().includes(normalizedQuery) ||
      club.tags.some((tag) => tag.includes(normalizedQuery)) ||
      club.location.toLowerCase().includes(normalizedQuery);

    const matchesType = !type || club.type === type;

    return matchesQuery && matchesType;
  });
};

// Get popular clubs by type
export const getPopularClubs = (
  type?: string,
  limit: number = 10,
): ClubData[] => {
  let clubs = Object.values(CLUB_DATABASE);

  if (type) {
    clubs = clubs.filter((club) => club.type === type);
  }

  return clubs.sort((a, b) => b.memberCount - a.memberCount).slice(0, limit);
};

// Get nearby clubs (mock implementation)
export const getNearbyClubs = (
  location: string,
  radius: number = 10,
): ClubData[] => {
  // In a real app, this would use geolocation and distance calculation
  return Object.values(CLUB_DATABASE)
    .filter((club) =>
      club.location.toLowerCase().includes(location.toLowerCase()),
    )
    .slice(0, 5);
};

// Additional helper functions for compatibility
export const formatMemberCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

export const getActualMemberCount = (clubName: string | any): number => {
  // Handle both string club names and Club objects
  let name = clubName;

  // If it's a Club object, extract the name
  if (typeof clubName === 'object' && clubName?.name) {
    name = clubName.name;
  }

  // If we have a Club object with memberCount, use it directly
  if (typeof clubName === 'object' && typeof clubName?.memberCount === 'number') {
    return clubName.memberCount;
  }

  return getClubMemberCount(name);
};

export const getPendingRequestsCount = (clubName: string | any): number => {
  // Handle both string club names and Club objects
  let name = clubName;

  // If it's a Club object, extract the name
  if (typeof clubName === 'object' && clubName?.name) {
    name = clubName.name;
  }

  // If we have a Club object with pendingRequests, use its length
  if (typeof clubName === 'object' && Array.isArray(clubName?.pendingRequests)) {
    return clubName.pendingRequests.length;
  }

  // In a real app, this would query pending join requests
  return Math.floor(Math.random() * 10) + 1;
};
