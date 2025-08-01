// Demo profile data for testing and demonstration purposes

export interface DemoProfile {
  id: string;
  email: string;
  full_name: string;
  university: string;
  bio: string;
  profile_image: string;
  created_at: string;
  updated_at: string;
  clubs: DemoClubMembership[];
  activities: DemoActivity[];
  stats: ProfileStats;
}

export interface DemoClubMembership {
  id: string;
  name: string;
  type: string;
  location: string;
  userRole: "member" | "manager";
  joinedAt: string;
}

export interface DemoActivity {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  club?: { name: string };
  participants: number;
  maxParticipants: number;
  status: "upcoming" | "completed" | "cancelled";
}

export interface ProfileStats {
  activitiesOrganized: number;
  activitiesJoined: number;
  clubsJoined: number;
  totalConnections: number;
}

export const maddieWeiProfile: DemoProfile = {
  id: "maddie-wei-demo",
  email: "maddie.wei@example.com",
  full_name: "Maddie Wei",
  university: "Oxford University",
  bio: "Passionate about outdoor adventures and connecting with like-minded people. Love cycling through the countryside and discovering new climbing spots. Always up for a challenge and making new friends along the way! 🚴‍♀️🧗‍♀️",
  profile_image:
    "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face",
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2025-01-15T14:22:00Z",
  clubs: [
    {
      id: "oucc",
      name: "Oxford University Cycling Club",
      type: "cycling",
      location: "Oxford, UK",
      userRole: "manager",
      joinedAt: "2024-02-01T09:00:00Z",
    },
    {
      id: "westway",
      name: "Westway Climbing Centre",
      type: "climbing",
      location: "London, UK",
      userRole: "member",
      joinedAt: "2024-03-15T18:00:00Z",
    },
    {
      id: "oxford-hikers",
      name: "Oxford Hiking Society",
      type: "hiking",
      location: "Oxford, UK",
      userRole: "member",
      joinedAt: "2024-04-10T12:00:00Z",
    },
  ],
  activities: [
    {
      id: "activity-1",
      title: "Morning Road Cycling Session",
      type: "cycling",
      date: "2025-02-15",
      time: "08:00",
      location: "Oxford Countryside",
      club: { name: "Oxford University Cycling Club" },
      participants: 12,
      maxParticipants: 15,
      status: "upcoming",
    },
    {
      id: "activity-2",
      title: "Beginner Rock Climbing",
      type: "climbing",
      date: "2025-02-18",
      time: "19:00",
      location: "Westway Climbing Centre",
      club: { name: "Westway Climbing Centre" },
      participants: 8,
      maxParticipants: 10,
      status: "upcoming",
    },
    {
      id: "activity-3",
      title: "Cotswolds Weekend Hike",
      type: "hiking",
      date: "2025-02-22",
      time: "09:00",
      location: "Cotswolds National Park",
      club: { name: "Oxford Hiking Society" },
      participants: 15,
      maxParticipants: 20,
      status: "upcoming",
    },
    {
      id: "activity-4",
      title: "Evening Spin Class",
      type: "cycling",
      date: "2025-01-20",
      time: "18:30",
      location: "Oxford Sports Centre",
      club: { name: "Oxford University Cycling Club" },
      participants: 20,
      maxParticipants: 20,
      status: "completed",
    },
    {
      id: "activity-5",
      title: "Indoor Climbing Competition",
      type: "climbing",
      date: "2025-01-25",
      time: "14:00",
      location: "Westway Climbing Centre",
      club: { name: "Westway Climbing Centre" },
      participants: 25,
      maxParticipants: 30,
      status: "completed",
    },
  ],
  stats: {
    activitiesOrganized: 8,
    activitiesJoined: 24,
    clubsJoined: 3,
    totalConnections: 157,
  },
};

// Additional demo profiles for variety
export const demoProfiles = {
  maddieWei: maddieWeiProfile,
  // Add more demo profiles as needed
  alexJohnson: {
    id: "alex-johnson-demo",
    email: "alex.johnson@example.com",
    full_name: "Alex Johnson",
    university: "Cambridge University",
    bio: "Adventure seeker and fitness enthusiast. Organizer of weekly running groups and cycling adventures.",
    profile_image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    created_at: "2024-01-10T08:15:00Z",
    updated_at: "2025-01-15T16:45:00Z",
    clubs: [
      {
        id: "cambridge-runners",
        name: "Cambridge Running Club",
        type: "running",
        location: "Cambridge, UK",
        userRole: "manager",
        joinedAt: "2024-01-20T10:00:00Z",
      },
    ],
    activities: [],
    stats: {
      activitiesOrganized: 12,
      activitiesJoined: 18,
      clubsJoined: 2,
      totalConnections: 89,
    },
  },
};

// Helper functions
export const getDemoProfile = (profileId: string): DemoProfile | null => {
  switch (profileId) {
    case "maddie-wei":
    case "maddie-wei-demo":
      return maddieWeiProfile;
    case "alex-johnson":
    case "alex-johnson-demo":
      return demoProfiles.alexJohnson as DemoProfile;
    default:
      return maddieWeiProfile; // Default to Maddie Wei
  }
};

export const getRandomDemoProfile = (): DemoProfile => {
  const profiles = Object.values(demoProfiles);
  return profiles[Math.floor(Math.random() * profiles.length)] as DemoProfile;
};
