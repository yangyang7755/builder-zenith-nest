// Enhanced demo profile data with all new features

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned_at: string;
  category: "activities" | "social" | "skills" | "consistency";
}

export interface ProfileStats {
  activitiesOrganized: number;
  activitiesJoined: number;
  clubsJoined: number;
  totalConnections: number;
  achievementsEarned: number;
  currentStreak: number;
  totalDistance: number;
  averageRating: number;
}

export interface EnhancedProfileData {
  id: string;
  email: string;
  full_name: string;
  university: string;
  bio: string;
  profile_image: string;
  created_at: string;
  updated_at: string;
  
  // Enhanced fields
  location: string;
  age_range: string;
  interests: string[];
  skill_levels: Record<string, number>;
  equipment: string[];
  preferred_times: string[];
  fitness_goals: string[];
  group_size_preference: string;
  activity_style: string;
  travel_distance: number;
  budget_range: string;
  emergency_contact: string;
  medical_conditions: string;
  dietary_restrictions: string[];
  visibility: string;
  show_achievements: boolean;
  allow_messages: boolean;
  verified: boolean;
  member_since: string;
  achievements: Achievement[];
  stats: ProfileStats;
}

const SAMPLE_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_activity",
    title: "First Steps",
    description: "Joined your first activity",
    icon: "star",
    earned_at: "2024-02-15T10:00:00Z",
    category: "activities"
  },
  {
    id: "organizer",
    title: "Event Organizer",
    description: "Organized 5 activities",
    icon: "trophy",
    earned_at: "2024-05-20T14:30:00Z",
    category: "activities"
  },
  {
    id: "social_butterfly",
    title: "Social Butterfly",
    description: "Connected with 50 people",
    icon: "users",
    earned_at: "2024-07-10T16:45:00Z",
    category: "social"
  },
  {
    id: "streak_7",
    title: "Week Warrior",
    description: "7-day activity streak",
    icon: "target",
    earned_at: "2024-08-15T09:20:00Z",
    category: "consistency"
  },
  {
    id: "distance_100",
    title: "Century Rider",
    description: "Cycled 100km in total",
    icon: "activity",
    earned_at: "2024-09-22T18:15:00Z",
    category: "skills"
  },
  {
    id: "club_leader",
    title: "Club Leader",
    description: "Became a club manager",
    icon: "trophy",
    earned_at: "2024-10-05T12:00:00Z",
    category: "social"
  }
];

export const enhancedMaddieWeiProfile: EnhancedProfileData = {
  id: "maddie-wei-enhanced",
  email: "maddie.wei@oxford.ac.uk",
  full_name: "Maddie Wei",
  university: "Oxford University",
  bio: "Passionate about outdoor adventures and connecting with like-minded people. Love cycling through the countryside and discovering new climbing spots. Always up for a challenge and making new friends along the way! 🚴‍♀️🧗‍♀️",
  profile_image: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face",
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2025-01-15T14:22:00Z",
  
  // Enhanced fields
  location: "Oxford, UK",
  age_range: "25-34",
  interests: ["cycling", "climbing", "hiking", "running", "yoga"],
  skill_levels: {
    "cycling": 3,
    "climbing": 2,
    "hiking": 3,
    "running": 2,
    "yoga": 1
  },
  equipment: ["Road Bike", "Climbing Shoes", "Helmet", "Yoga Mat"],
  preferred_times: ["Morning (9-12 PM)", "Evening (5-8 PM)", "Weekends Only"],
  fitness_goals: ["Endurance", "Social Connection", "Stress Relief", "General Fitness"],
  group_size_preference: "medium",
  activity_style: "casual",
  travel_distance: 25,
  budget_range: "medium",
  emergency_contact: "Sarah Wei - +44 7700 900123",
  medical_conditions: "",
  dietary_restrictions: ["Vegetarian"],
  visibility: "public",
  show_achievements: true,
  allow_messages: true,
  verified: true,
  member_since: "2024-01-15T10:30:00Z",
  achievements: SAMPLE_ACHIEVEMENTS,
  stats: {
    activitiesOrganized: 12,
    activitiesJoined: 47,
    clubsJoined: 3,
    totalConnections: 89,
    achievementsEarned: 6,
    currentStreak: 14,
    totalDistance: 347.5,
    averageRating: 4.7
  }
};

export const enhancedAlexJohnsonProfile: EnhancedProfileData = {
  id: "alex-johnson-enhanced",
  email: "alex.johnson@cambridge.ac.uk",
  full_name: "Alex Johnson",
  university: "Cambridge University",
  bio: "Adventure seeker and fitness enthusiast. Organizer of weekly running groups and cycling adventures. Love exploring new trails and pushing my limits!",
  profile_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  created_at: "2024-01-10T08:15:00Z",
  updated_at: "2025-01-15T16:45:00Z",
  
  location: "Cambridge, UK",
  age_range: "25-34",
  interests: ["running", "cycling", "swimming", "triathlon"],
  skill_levels: {
    "running": 4,
    "cycling": 3,
    "swimming": 2,
    "triathlon": 3
  },
  equipment: ["Running Shoes", "Road Bike", "Wetsuit", "GPS Watch"],
  preferred_times: ["Early Morning (6-9 AM)", "Evening (5-8 PM)"],
  fitness_goals: ["Competition", "Endurance", "General Fitness"],
  group_size_preference: "small",
  activity_style: "competitive",
  travel_distance: 50,
  budget_range: "high",
  emergency_contact: "Emma Johnson - +44 7700 900456",
  medical_conditions: "",
  dietary_restrictions: ["None"],
  visibility: "public",
  show_achievements: true,
  allow_messages: true,
  verified: true,
  member_since: "2024-01-10T08:15:00Z",
  achievements: [
    ...SAMPLE_ACHIEVEMENTS,
    {
      id: "triathlon_finisher",
      title: "Triathlon Finisher",
      description: "Completed your first triathlon",
      icon: "trophy",
      earned_at: "2024-06-15T14:30:00Z",
      category: "skills"
    }
  ],
  stats: {
    activitiesOrganized: 28,
    activitiesJoined: 63,
    clubsJoined: 4,
    totalConnections: 156,
    achievementsEarned: 7,
    currentStreak: 21,
    totalDistance: 892.3,
    averageRating: 4.9
  }
};

export const enhancedSarahChenProfile: EnhancedProfileData = {
  id: "sarah-chen-enhanced",
  email: "sarah.chen@manchester.ac.uk",
  full_name: "Sarah Chen",
  university: "University of Manchester",
  bio: "Yoga instructor and wellness enthusiast. Love helping others find balance through mindful movement and building supportive communities.",
  profile_image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  created_at: "2024-02-20T15:45:00Z",
  updated_at: "2025-01-15T11:20:00Z",
  
  location: "Manchester, UK",
  age_range: "25-34",
  interests: ["yoga", "pilates", "meditation", "dancing", "hiking"],
  skill_levels: {
    "yoga": 4,
    "pilates": 3,
    "meditation": 4,
    "dancing": 2,
    "hiking": 2
  },
  equipment: ["Yoga Mat", "Meditation Cushion", "Resistance Bands"],
  preferred_times: ["Morning (9-12 PM)", "Evening (5-8 PM)", "Flexible"],
  fitness_goals: ["Flexibility", "Stress Relief", "Social Connection", "General Fitness"],
  group_size_preference: "medium",
  activity_style: "casual",
  travel_distance: 15,
  budget_range: "low",
  emergency_contact: "Michael Chen - +44 7700 900789",
  medical_conditions: "",
  dietary_restrictions: ["Vegan", "Gluten Free"],
  visibility: "members",
  show_achievements: true,
  allow_messages: true,
  verified: false,
  member_since: "2024-02-20T15:45:00Z",
  achievements: [
    {
      id: "first_activity",
      title: "First Steps",
      description: "Joined your first activity",
      icon: "star",
      earned_at: "2024-02-25T10:00:00Z",
      category: "activities"
    },
    {
      id: "yoga_teacher",
      title: "Yoga Teacher",
      description: "Led 10 yoga sessions",
      icon: "heart",
      earned_at: "2024-04-10T16:30:00Z",
      category: "skills"
    },
    {
      id: "community_builder",
      title: "Community Builder",
      description: "Helped 25 people join activities",
      icon: "users",
      earned_at: "2024-06-05T14:15:00Z",
      category: "social"
    }
  ],
  stats: {
    activitiesOrganized: 18,
    activitiesJoined: 35,
    clubsJoined: 2,
    totalConnections: 67,
    achievementsEarned: 3,
    currentStreak: 8,
    totalDistance: 123.7,
    averageRating: 4.8
  }
};

// Helper functions
export const getEnhancedDemoProfile = (profileId: string): EnhancedProfileData | null => {
  switch (profileId) {
    case "maddie-wei":
    case "maddie-wei-enhanced":
      return enhancedMaddieWeiProfile;
    case "alex-johnson":
    case "alex-johnson-enhanced":
      return enhancedAlexJohnsonProfile;
    case "sarah-chen":
    case "sarah-chen-enhanced":
      return enhancedSarahChenProfile;
    default:
      return enhancedMaddieWeiProfile; // Default fallback
  }
};

export const getRandomEnhancedProfile = (): EnhancedProfileData => {
  const profiles = [enhancedMaddieWeiProfile, enhancedAlexJohnsonProfile, enhancedSarahChenProfile];
  return profiles[Math.floor(Math.random() * profiles.length)];
};

export const getAllEnhancedProfiles = (): EnhancedProfileData[] => {
  return [enhancedMaddieWeiProfile, enhancedAlexJohnsonProfile, enhancedSarahChenProfile];
};
