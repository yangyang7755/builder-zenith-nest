import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { apiService } from "../services/apiService";

export interface Activity {
  id: string;
  title: string;
  description?: string;
  activity_type: "cycling" | "climbing" | "running" | "hiking" | "skiing" | "surfing" | "tennis" | "general";
  date_time: string; // ISO 8601 format
  location: string;
  coordinates?: { lat: number; lng: number };
  max_participants: number;
  current_participants: number;
  difficulty_level: "beginner" | "intermediate" | "advanced" | "all";
  activity_image?: string;
  route_link?: string;
  special_requirements?: string;
  price_per_person: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  organizer_id: string;
  club_id?: string;
  activity_data?: Record<string, any>;
  created_at: string;
  updated_at: string;

  // Related data from joins
  organizer?: {
    id: string;
    full_name: string;
    profile_image?: string;
    email?: string;
  };
  club?: {
    id: string;
    name: string;
    profile_image?: string;
  };
  participants?: ActivityParticipant[];

  // Legacy fields for backward compatibility
  type?: string;
  date?: string;
  time?: string;
  meetupLocation?: string;
  organizer?: string;
  maxParticipants?: string;
  specialComments?: string;
  imageSrc?: string;
  visibility?: string;
  createdAt?: Date;
}

export interface ActivityParticipant {
  id: string;
  user_id: string;
  activity_id: string;
  joined_at: string;
  status: "joined" | "left" | "completed" | "cancelled";
  user: {
    id: string;
    full_name: string;
    profile_image?: string;
    email?: string;
  };
}

interface ActivitiesContextType {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  pagination: { total: number; limit: number; offset: number };

  // Core CRUD operations
  getActivities: (filters?: ActivityFilters) => Promise<void>;
  getActivity: (activityId: string) => Promise<Activity | null>;
  createActivity: (activityData: CreateActivityData) => Promise<{ success: boolean; error?: string; data?: Activity }>;
  updateActivity: (activityId: string, updates: UpdateActivityData) => Promise<{ success: boolean; error?: string }>;
  deleteActivity: (activityId: string) => Promise<{ success: boolean; error?: string }>;

  // Participation operations
  joinActivity: (activityId: string) => Promise<{ success: boolean; error?: string }>;
  leaveActivity: (activityId: string) => Promise<{ success: boolean; error?: string }>;
  getActivityParticipants: (activityId: string) => Promise<ActivityParticipant[]>;

  // Utility operations
  searchActivities: (query: string, filters?: ActivityFilters) => Promise<void>;
  refreshActivities: () => Promise<void>;

  // Legacy methods for backward compatibility
  addActivity: (activity: any) => Promise<boolean>;
}

export interface ActivityFilters {
  club_id?: string;
  activity_type?: string;
  location?: string;
  difficulty_level?: string;
  date_from?: string;
  date_to?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface CreateActivityData {
  title: string;
  description?: string;
  activity_type: string;
  date_time: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  max_participants?: number;
  difficulty_level?: string;
  activity_image?: string;
  route_link?: string;
  special_requirements?: string;
  price_per_person?: number;
  club_id?: string;
  activity_data?: Record<string, any>;
}

export interface UpdateActivityData {
  title?: string;
  description?: string;
  activity_type?: string;
  date_time?: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
  max_participants?: number;
  difficulty_level?: string;
  activity_image?: string;
  route_link?: string;
  special_requirements?: string;
  price_per_person?: number;
  club_id?: string;
  activity_data?: Record<string, any>;
}

const ActivitiesContext = createContext<ActivitiesContextType | undefined>(
  undefined,
);

// Demo data as fallback when backend isn't available
const demoActivities: Activity[] = [
  {
    id: "westway-womens-climb",
    type: "climbing",
    title: "Westway women's+ climbing morning",
    date: "2025-08-06",
    time: "10:00",
    location: "Westway Climbing Centre",
    meetupLocation: "Westway Climbing Centre",
    organizer: "Coach Holly Peristiani",
    maxParticipants: "12",
    difficulty: "Intermediate",
    specialComments:
      "This session is perfect for meeting fellow climbers and boosting your confidence. Holly can provide expert tips on top-roping, lead climbing, abseiling, fall practice and more.",
    imageSrc:
      "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=80&h=80&fit=crop&crop=face",
    climbingLevel: "Intermediate",
    gender: "Female only",
    visibility: "All",
    club: "westway",
    createdAt: new Date(),
  },
  {
    id: "sunday-morning-ride",
    type: "cycling",
    title: "Sunday Morning Social Ride",
    date: "2025-08-10",
    time: "08:00",
    location: "Richmond Park",
    meetupLocation: "Richmond Park Main Gate",
    organizer: "Richmond Cycling Club",
    distance: "25",
    distanceUnit: "km",
    pace: "20",
    paceUnit: "kph",
    elevation: "150",
    elevationUnit: "m",
    maxParticipants: "15",
    difficulty: "Beginner",
    specialComments:
      "Join us for a friendly social ride through Richmond Park and surrounding areas. Perfect for cyclists looking to meet new people and explore beautiful routes. Coffee stop included at Roehampton Cafe.",
    imageSrc:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    cafeStop: "Roehampton Cafe",
    gender: "All genders",
    visibility: "All",
    club: "oucc",
    createdAt: new Date(),
  },
  {
    id: "mens-football-training",
    type: "running",
    title: "Men's Football Training Session",
    date: "2025-08-12",
    time: "19:00",
    location: "Hampstead Heath",
    meetupLocation: "Hampstead Heath Athletics Track",
    organizer: "London FC Training",
    maxParticipants: "20",
    difficulty: "Intermediate",
    specialComments:
      "High-intensity football training session focusing on fitness, technique, and team play. All skill levels welcome.",
    imageSrc:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=40&h=40&fit=crop&crop=face",
    gender: "Male only",
    visibility: "All",
    club: null,
    createdAt: new Date(),
  },
];

export function ActivitiesProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0 });

  // Load activities from backend on component mount
  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Loading activities from backend...");
      const response = await apiService.getActivities();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data && response.data.length > 0) {
        // Transform backend data to frontend format
        const transformedActivities = response.data.map((activity: any) => ({
          id: activity.id,
          type: activity.type,
          title: activity.title,
          date: activity.date,
          time: activity.time,
          location: activity.location,
          meetupLocation: activity.meetup_location || activity.location,
          organizer: activity.organizer?.full_name || activity.organizer_id || "Unknown",
          maxParticipants: activity.max_participants?.toString() || "10",
          difficulty: activity.difficulty || "Beginner",
          specialComments: activity.special_comments || "",
          club: activity.club_id,
          visibility: "All",
          gender: "All genders",
          createdAt: new Date(activity.created_at),
          organizer_id: activity.organizer_id,
        }));
        
        console.log("Loaded activities from backend:", transformedActivities);
        setActivities(transformedActivities);
      } else {
        // No backend data, use demo data
        console.log("No backend data found, using demo activities");
        setActivities(demoActivities);
      }
    } catch (err) {
      console.error("Failed to load activities from backend:", err);
      console.log("Using demo activities as fallback");
      setError("Failed to load activities from backend, using demo data");
      setActivities(demoActivities);
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async (
    activityData: Omit<Activity, "id" | "createdAt">
  ): Promise<boolean> => {
    try {
      // Transform frontend data to backend format
      const backendActivity = {
        title: activityData.title,
        type: activityData.type,
        date: activityData.date,
        time: activityData.time,
        location: activityData.location,
        meetup_location: activityData.meetupLocation,
        max_participants: parseInt(activityData.maxParticipants) || null,
        special_comments: activityData.specialComments,
        difficulty: activityData.difficulty,
        club_id: activityData.club || null,
      };

      const response = await apiService.createActivity(backendActivity);
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Add to local state
      const newActivity: Activity = {
        ...activityData,
        id: response.data?.id || Date.now().toString(),
        createdAt: new Date(),
      };
      
      setActivities(prev => [newActivity, ...prev]);
      return true;
    } catch (err) {
      console.error("Failed to create activity:", err);
      
      // Fallback: add to local state only
      const newActivity: Activity = {
        ...activityData,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      setActivities(prev => [newActivity, ...prev]);
      return false;
    }
  };

  const createActivity = async (activityData: any) => {
    try {
      const response = await apiService.createActivity(activityData);
      
      if (response.error) {
        return { success: false, error: response.error };
      }

      // Refresh activities list
      await loadActivities();
      return { success: true };
    } catch (err) {
      console.error("Failed to create activity:", err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Failed to create activity" 
      };
    }
  };

  const searchActivities = (query: string): Activity[] => {
    if (!query.trim()) return activities;
    
    const lowercaseQuery = query.toLowerCase();
    return activities.filter(
      (activity) =>
        activity.title.toLowerCase().includes(lowercaseQuery) ||
        activity.location.toLowerCase().includes(lowercaseQuery) ||
        activity.organizer.toLowerCase().includes(lowercaseQuery) ||
        activity.type.toLowerCase().includes(lowercaseQuery)
    );
  };

  const refreshActivities = async () => {
    await loadActivities();
  };

  return (
    <ActivitiesContext.Provider
      value={{
        activities,
        loading,
        error,
        addActivity,
        searchActivities,
        refreshActivities,
        createActivity,
      }}
    >
      {children}
    </ActivitiesContext.Provider>
  );
}

export function useActivities() {
  const context = useContext(ActivitiesContext);
  if (context === undefined) {
    throw new Error("useActivities must be used within an ActivitiesProvider");
  }
  return context;
}
