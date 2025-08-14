import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { apiService } from "../services/apiService";
import { useUserProfile } from "./UserProfileContext";

export interface Activity {
  id: string;
  title: string;
  description?: string;
  activity_type:
    | "cycling"
    | "climbing"
    | "running"
    | "hiking"
    | "skiing"
    | "surfing"
    | "tennis"
    | "general";
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
  organizerName?: string;
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
  createActivity: (
    activityData: CreateActivityData,
  ) => Promise<{ success: boolean; error?: string; data?: Activity }>;
  updateActivity: (
    activityId: string,
    updates: UpdateActivityData,
  ) => Promise<{ success: boolean; error?: string }>;
  deleteActivity: (
    activityId: string,
  ) => Promise<{ success: boolean; error?: string }>;

  // Participation operations
  joinActivity: (
    activityId: string,
  ) => Promise<{ success: boolean; error?: string }>;
  leaveActivity: (
    activityId: string,
  ) => Promise<{ success: boolean; error?: string }>;
  getActivityParticipants: (
    activityId: string,
  ) => Promise<ActivityParticipant[]>;

  // Utility operations
  searchActivities: (query: string, filters?: ActivityFilters) => Promise<void>;
  refreshActivities: () => Promise<void>;

  // Legacy methods for backward compatibility
  addActivity: (activity: any) => Promise<boolean>;

  // User activity tracking
  getUserOrganizedActivities: () => Activity[];
  getUserParticipatedActivities: () => Activity[];
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
  const { currentUserProfile } = useUserProfile();

  // Listen for profile updates and sync activity organizers/participants
  useEffect(() => {
    const handleOrganizerProfileUpdate = (event: CustomEvent) => {
      const { userId, profile } = event.detail;

      setActivities((prev) =>
        prev.map((activity) =>
          activity.organizer_id === userId || activity.organizer?.id === userId
            ? {
                ...activity,
                organizer: {
                  ...activity.organizer,
                  full_name: profile.full_name,
                  profile_image: profile.profile_image,
                },
              }
            : activity,
        ),
      );
    };

    const handleParticipantProfileUpdate = (event: CustomEvent) => {
      const { userId, profile } = event.detail;

      setActivities((prev) =>
        prev.map((activity) => ({
          ...activity,
          participants: activity.participants?.map((participant) =>
            participant.user_id === userId
              ? {
                  ...participant,
                  user: {
                    ...participant.user,
                    full_name: profile.full_name,
                    profile_image: profile.profile_image,
                  },
                }
              : participant,
          ),
        })),
      );
    };

    const handleParticipantJoined = (event: CustomEvent) => {
      const { activityId, participant, newCount } = event.detail;

      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === activityId
            ? {
                ...activity,
                current_participants: newCount,
                participants: [...(activity.participants || []), participant],
              }
            : activity,
        ),
      );
    };

    const handleParticipantLeft = (event: CustomEvent) => {
      const { activityId, userId, newCount } = event.detail;

      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === activityId
            ? {
                ...activity,
                current_participants: newCount,
                participants:
                  activity.participants?.filter((p) => p.user_id !== userId) ||
                  [],
              }
            : activity,
        ),
      );
    };

    window.addEventListener(
      "organizerProfileUpdated",
      handleOrganizerProfileUpdate as EventListener,
    );
    window.addEventListener(
      "participantProfileUpdated",
      handleParticipantProfileUpdate as EventListener,
    );
    window.addEventListener(
      "participantJoined",
      handleParticipantJoined as EventListener,
    );
    window.addEventListener(
      "participantLeft",
      handleParticipantLeft as EventListener,
    );

    return () => {
      window.removeEventListener(
        "organizerProfileUpdated",
        handleOrganizerProfileUpdate as EventListener,
      );
      window.removeEventListener(
        "participantProfileUpdated",
        handleParticipantProfileUpdate as EventListener,
      );
      window.removeEventListener(
        "participantJoined",
        handleParticipantJoined as EventListener,
      );
      window.removeEventListener(
        "participantLeft",
        handleParticipantLeft as EventListener,
      );
    };
  }, []);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
  });

  // Load activities from backend on component mount
  useEffect(() => {
    getActivities();
  }, []);

  // Transform backend activity to frontend format with backward compatibility
  const transformActivity = (backendActivity: any): Activity => {
    return {
      // New schema fields
      id: backendActivity.id,
      title: backendActivity.title,
      description: backendActivity.description,
      activity_type: backendActivity.activity_type,
      date_time: backendActivity.date_time,
      location: backendActivity.location,
      coordinates: backendActivity.coordinates,
      max_participants: backendActivity.max_participants || 10,
      current_participants: backendActivity.current_participants || 0,
      difficulty_level: backendActivity.difficulty_level || "beginner",
      activity_image: backendActivity.activity_image,
      route_link: backendActivity.route_link,
      special_requirements: backendActivity.special_requirements,
      price_per_person: backendActivity.price_per_person || 0,
      status: backendActivity.status || "upcoming",
      organizer_id: backendActivity.organizer_id,
      club_id: backendActivity.club_id,
      activity_data: backendActivity.activity_data,
      created_at: backendActivity.created_at,
      updated_at: backendActivity.updated_at,
      organizer: backendActivity.organizer,
      club: backendActivity.club,
      participants: backendActivity.participants,

      // Legacy fields for backward compatibility
      type: backendActivity.activity_type,
      date: backendActivity.date_time
        ? new Date(backendActivity.date_time).toISOString().split("T")[0]
        : undefined,
      time: backendActivity.date_time
        ? new Date(backendActivity.date_time).toTimeString().slice(0, 5)
        : undefined,
      meetupLocation: backendActivity.location,
      organizerName: backendActivity.organizer?.full_name || "Unknown",
      maxParticipants: backendActivity.max_participants?.toString() || "10",
      specialComments:
        backendActivity.special_requirements ||
        backendActivity.description ||
        "",
      imageSrc: backendActivity.activity_image,
      visibility: "All",
      createdAt: new Date(backendActivity.created_at),
    };
  };

  const getActivities = async (filters?: ActivityFilters) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Loading activities from backend...", filters);
      const response = await apiService.getActivities(filters);

      if (response.error) {
        // Check if backend is unavailable - this is not an error, just use demo mode
        if (response.error === "BACKEND_UNAVAILABLE") {
          console.log("Backend unavailable, seamlessly using demo data");
          const transformedDemoActivities = demoActivities.map((activity) => ({
            ...activity,
            activity_type: activity.type as any,
            date_time: `${activity.date}T${activity.time}:00Z`,
            max_participants: parseInt(activity.maxParticipants),
            current_participants: Math.floor(
              Math.random() * parseInt(activity.maxParticipants),
            ),
            difficulty_level: (activity.difficulty?.toLowerCase() ||
              "beginner") as any,
            price_per_person: 0,
            status: "upcoming" as any,
            organizer_id: "demo-user-id",
            created_at: activity.createdAt.toISOString(),
            updated_at: activity.createdAt.toISOString(),
          }));
          setActivities(transformedDemoActivities);
          setLoading(false);
          return;
        }
        throw new Error(response.error);
      }

      if (response.data?.success && response.data.data) {
        const transformedActivities = response.data.data.map(transformActivity);
        console.log("Loaded activities from backend:", transformedActivities);
        setActivities(transformedActivities);
        setPagination(
          response.data.pagination || { total: 0, limit: 20, offset: 0 },
        );
      } else if (response.data && Array.isArray(response.data)) {
        // Handle legacy response format
        const transformedActivities = response.data.map(transformActivity);
        setActivities(transformedActivities);
      } else {
        // No backend data, use demo data
        console.log("No backend data found, using demo activities");
        const transformedDemoActivities = demoActivities.map((activity) => ({
          ...activity,
          activity_type: activity.type as any,
          date_time: `${activity.date}T${activity.time}:00Z`,
          max_participants: parseInt(activity.maxParticipants),
          current_participants: Math.floor(
            Math.random() * parseInt(activity.maxParticipants),
          ),
          difficulty_level: (activity.difficulty?.toLowerCase() ||
            "beginner") as any,
          price_per_person: 0,
          status: "upcoming" as any,
          organizer_id: "demo-user-id",
          created_at: activity.createdAt.toISOString(),
          updated_at: activity.createdAt.toISOString(),
        }));
        setActivities(transformedDemoActivities);
      }
    } catch (err) {
      console.error("Failed to load activities from backend:", err);
      console.log("Using demo activities as fallback");
      setError("Failed to load activities from backend, using demo data");

      // Transform demo activities to new format
      const transformedDemoActivities = demoActivities.map((activity) => ({
        ...activity,
        activity_type: activity.type as any,
        date_time: `${activity.date}T${activity.time}:00Z`,
        max_participants: parseInt(activity.maxParticipants),
        current_participants: Math.floor(
          Math.random() * parseInt(activity.maxParticipants),
        ),
        difficulty_level: (activity.difficulty?.toLowerCase() ||
          "beginner") as any,
        price_per_person: 0,
        status: "upcoming" as any,
        organizer_id: "demo-user-id",
        created_at: activity.createdAt.toISOString(),
        updated_at: activity.createdAt.toISOString(),
      }));
      setActivities(transformedDemoActivities);
    } finally {
      setLoading(false);
    }
  };

  const getActivity = async (activityId: string): Promise<Activity | null> => {
    try {
      const response = await apiService.getActivity(activityId);

      if (response.error) {
        console.error("Failed to get activity:", response.error);
        return null;
      }

      if (response.data?.success && response.data.data) {
        return transformActivity(response.data.data);
      } else if (response.data) {
        return transformActivity(response.data);
      }

      return null;
    } catch (err) {
      console.error("Failed to get activity:", err);
      return null;
    }
  };

  const createActivity = async (activityData: CreateActivityData) => {
    try {
      const response = await apiService.createActivity(activityData);

      if (response.error) {
        // Handle backend unavailability - create demo activity
        if (response.error === "BACKEND_UNAVAILABLE") {
          console.log("Backend unavailable, creating demo activity");
          const demoActivity: Activity = {
            id: `demo-activity-${Date.now()}`,
            activity_type: activityData.activity_type,
            title: activityData.title,
            description: activityData.description,
            date_time: activityData.date_time,
            location: activityData.location,
            coordinates: activityData.coordinates,
            max_participants: activityData.max_participants,
            current_participants: 1,
            difficulty_level: activityData.difficulty_level,
            activity_image: activityData.activity_image,
            route_link: activityData.route_link,
            special_requirements: activityData.special_requirements,
            price_per_person: activityData.price_per_person || 0,
            status: "upcoming",
            organizer_id: currentUserProfile?.id || "demo-user-id",
            club_id: activityData.club_id,
            activity_data: activityData.activity_data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            organizer: currentUserProfile
              ? {
                  id: currentUserProfile.id,
                  full_name: currentUserProfile.full_name,
                  profile_image: currentUserProfile.profile_image,
                }
              : {
                  id: "demo-user-id",
                  full_name: "You",
                  profile_image: "/placeholder.svg",
                },
            // Legacy fields for backward compatibility
            type: activityData.activity_type,
            date: activityData.date_time.split("T")[0],
            time: activityData.date_time.split("T")[1].substring(0, 5),
            meetupLocation: activityData.location,
            organizerName: currentUserProfile?.full_name || "You",
            maxParticipants: activityData.max_participants.toString(),
            specialComments: activityData.special_requirements || "",
            imageSrc: activityData.activity_image,
            visibility: "All",
            createdAt: new Date(),
          };

          setActivities((prev) => [demoActivity, ...prev]);
          return { success: true, data: demoActivity };
        }
        return { success: false, error: response.error };
      }

      const newActivity = response.data?.success
        ? response.data.data
        : response.data;
      if (newActivity) {
        const transformedActivity = transformActivity(newActivity);
        setActivities((prev) => [transformedActivity, ...prev]);
      }

      return {
        success: true,
        data: newActivity ? transformActivity(newActivity) : undefined,
      };
    } catch (err) {
      console.error("Failed to create activity:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to create activity",
      };
    }
  };

  const updateActivity = async (
    activityId: string,
    updates: UpdateActivityData,
  ) => {
    try {
      const response = await apiService.updateActivity(activityId, updates);

      if (response.error) {
        return { success: false, error: response.error };
      }

      // Update local state
      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === activityId
            ? { ...activity, ...updates, updated_at: new Date().toISOString() }
            : activity,
        ),
      );

      return { success: true };
    } catch (err) {
      console.error("Failed to update activity:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to update activity",
      };
    }
  };

  const deleteActivity = async (activityId: string) => {
    try {
      const response = await apiService.deleteActivity(activityId);

      if (response.error) {
        return { success: false, error: response.error };
      }

      // Remove from local state
      setActivities((prev) =>
        prev.filter((activity) => activity.id !== activityId),
      );

      return { success: true };
    } catch (err) {
      console.error("Failed to delete activity:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete activity",
      };
    }
  };

  const joinActivity = async (activityId: string) => {
    try {
      const response = await apiService.joinActivity(activityId);

      if (response.error) {
        return { success: false, error: response.error };
      }

      // Update local state to increment participant count
      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === activityId
            ? {
                ...activity,
                current_participants: activity.current_participants + 1,
              }
            : activity,
        ),
      );

      return { success: true };
    } catch (err) {
      console.error("Failed to join activity:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to join activity",
      };
    }
  };

  const leaveActivity = async (activityId: string) => {
    try {
      const response = await apiService.leaveActivity(activityId);

      if (response.error) {
        return { success: false, error: response.error };
      }

      // Update local state to decrement participant count
      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === activityId
            ? {
                ...activity,
                current_participants: Math.max(
                  0,
                  activity.current_participants - 1,
                ),
              }
            : activity,
        ),
      );

      return { success: true };
    } catch (err) {
      console.error("Failed to leave activity:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to leave activity",
      };
    }
  };

  const getActivityParticipants = async (
    activityId: string,
  ): Promise<ActivityParticipant[]> => {
    try {
      const response = await apiService.getActivityParticipants(activityId);

      if (response.error) {
        console.error("Failed to get activity participants:", response.error);
        return [];
      }

      return response.data?.success ? response.data.data : response.data || [];
    } catch (err) {
      console.error("Failed to get activity participants:", err);
      return [];
    }
  };

  const searchActivities = async (query: string, filters?: ActivityFilters) => {
    const searchFilters = {
      ...filters,
      location: query, // Use location search for now
    };

    await getActivities(searchFilters);
  };

  const refreshActivities = async () => {
    await getActivities();
  };

  // User activity tracking functions
  const getUserOrganizedActivities = (): Activity[] => {
    if (!currentUserProfile) return [];
    return activities.filter(
      (activity) =>
        activity.organizer_id === currentUserProfile.id ||
        activity.organizer?.id === currentUserProfile.id,
    );
  };

  const getUserParticipatedActivities = (): Activity[] => {
    if (!currentUserProfile) return [];
    return activities.filter(
      (activity) =>
        activity.participants?.some(
          (p) => p.user_id === currentUserProfile.id,
        ) ||
        (activity.organizer_id !== currentUserProfile.id &&
          activity.current_participants > 0),
    );
  };

  // Legacy method for backward compatibility
  const addActivity = async (activityData: any): Promise<boolean> => {
    try {
      // Transform legacy format to new format
      const newActivityData: CreateActivityData = {
        title: activityData.title,
        description: activityData.specialComments || activityData.description,
        activity_type: activityData.type || activityData.activity_type,
        date_time:
          activityData.date_time ||
          `${activityData.date}T${activityData.time}:00.000Z`,
        location: activityData.location,
        max_participants:
          typeof activityData.maxParticipants === "string"
            ? parseInt(activityData.maxParticipants)
            : activityData.max_participants || 10,
        difficulty_level: activityData.difficulty?.toLowerCase() || "beginner",
        club_id: activityData.club || activityData.club_id,
        special_requirements: activityData.specialComments,
        activity_image: activityData.imageSrc || activityData.activity_image,
        route_link: activityData.routeLink || activityData.route_link,
      };

      const result = await createActivity(newActivityData);
      return result.success;
    } catch (err) {
      console.error("Failed to add activity (legacy):", err);
      return false;
    }
  };

  return (
    <ActivitiesContext.Provider
      value={{
        activities,
        loading,
        error,
        pagination,

        // Core CRUD operations
        getActivities,
        getActivity,
        createActivity,
        updateActivity,
        deleteActivity,

        // Participation operations
        joinActivity,
        leaveActivity,
        getActivityParticipants,

        // Utility operations
        searchActivities,
        refreshActivities,

        // User activity tracking
        getUserOrganizedActivities,
        getUserParticipatedActivities,

        // Legacy methods for backward compatibility
        addActivity,
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
