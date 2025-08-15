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

// No demo data - fully backend dependent

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

      // Extract activity-specific data from activity_data JSONB field for legacy compatibility
      distance: backendActivity.activity_data?.distance,
      distanceUnit: backendActivity.activity_data?.distanceUnit,
      pace: backendActivity.activity_data?.pace,
      paceUnit: backendActivity.activity_data?.paceUnit,
      elevation: backendActivity.activity_data?.elevation,
      elevationUnit: backendActivity.activity_data?.elevationUnit,
      cafeStop: backendActivity.activity_data?.cafeStop,
      difficulty: backendActivity.difficulty_level || backendActivity.activity_data?.difficulty,
      requirements: backendActivity.activity_data?.requirements,
      // Climbing fields
      climbingLevel: backendActivity.activity_data?.climbingLevel,
      languages: backendActivity.activity_data?.languages,
      gearRequired: backendActivity.activity_data?.gearRequired,
      gradeRange: backendActivity.activity_data?.gradeRange,
      // Running fields
      terrain: backendActivity.activity_data?.terrain,
      elevationGain: backendActivity.activity_data?.elevationGain,
      targetPace: backendActivity.activity_data?.targetPace,
      waterStations: backendActivity.activity_data?.waterStations,
      // Tennis fields
      skillLevel: backendActivity.activity_data?.skillLevel,
      courtSurface: backendActivity.activity_data?.courtSurface,
      isCompetitive: backendActivity.activity_data?.isCompetitive,
      duration: backendActivity.activity_data?.duration,
      equipmentProvided: backendActivity.activity_data?.equipmentProvided,
      coachingIncluded: backendActivity.activity_data?.coachingIncluded,
      refreshments: backendActivity.activity_data?.refreshments,
      // Surfing fields
      surfingType: backendActivity.activity_data?.surfingType,
      waveHeight: backendActivity.activity_data?.waveHeight,
      waveConditions: backendActivity.activity_data?.waveConditions,
      tideInfo: backendActivity.activity_data?.tideInfo,
      waterTemp: backendActivity.activity_data?.waterTemp,
      // Skiing fields
      snowConditions: backendActivity.activity_data?.snowConditions,
      liftPass: backendActivity.activity_data?.liftPass,
      instructionIncluded: backendActivity.activity_data?.instructionIncluded,
      aprèsSkiIncluded: backendActivity.activity_data?.aprèsSkiIncluded,
      transport: backendActivity.activity_data?.transport,
      // Hiking fields
      hikingType: backendActivity.activity_data?.hikingType,
      navigationRequired: backendActivity.activity_data?.navigationRequired,
      waterSources: backendActivity.activity_data?.waterSources,
      shelterAvailable: backendActivity.activity_data?.shelterAvailable,
      wildlifeWarning: backendActivity.activity_data?.wildlifeWarning,
      permitRequired: backendActivity.activity_data?.permitRequired,
      transportIncluded: backendActivity.activity_data?.transportIncluded,
      guidedTour: backendActivity.activity_data?.guidedTour,
    };
  };

  const getActivities = async (filters?: ActivityFilters) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Loading activities from backend...", filters);
      const response = await apiService.getActivities(filters);
      console.log("Raw response from getActivities:", response);

      if (response.error) {
        // Backend error - show actual error to user
        console.error("Backend error in getActivities:", response.error);
        throw new Error(response.error);
      }

      if (response.data?.success && response.data.data) {
        const transformedActivities = response.data.data.map(transformActivity);
        console.log("Loaded activities from backend (success format):", transformedActivities);
        setActivities(transformedActivities);
        setPagination(
          response.data.pagination || { total: 0, limit: 20, offset: 0 },
        );
      } else if (response.data && Array.isArray(response.data)) {
        // Handle legacy response format
        const transformedActivities = response.data.map(transformActivity);
        console.log("Loaded activities from backend (legacy format):", transformedActivities);
        setActivities(transformedActivities);
      } else {
        // No backend data - set empty activities array
        console.log("No activities found in backend - response.data:", response.data);
        setActivities([]);
      }
    } catch (err) {
      console.error("Failed to load activities from backend:", err);
      setError(err instanceof Error ? err.message : "Failed to load activities");
      setActivities([]);
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
      console.log("Creating activity with data:", activityData);
      const response = await apiService.createActivity(activityData);
      console.log("Create activity response:", response);

      if (response.error) {
        console.error("Create activity error:", response.error);
        return { success: false, error: response.error };
      }

      const newActivity = response.data?.success
        ? response.data.data
        : response.data;
      console.log("New activity from response:", newActivity);

      if (newActivity) {
        const transformedActivity = transformActivity(newActivity);
        console.log("Transformed activity:", transformedActivity);
        setActivities((prev) => {
          const updatedActivities = [transformedActivity, ...prev];
          console.log("Updated activities after creation:", updatedActivities);
          return updatedActivities;
        });

        // Also refresh activities from backend to ensure sync
        setTimeout(() => {
          console.log("Refreshing activities after creation...");
          getActivities();
        }, 100);
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
      console.log("Creating activity with legacy data:", activityData);

      // Validate required fields
      if (!activityData.title || !activityData.date || !activityData.time || !activityData.location) {
        console.error("Missing required fields for activity creation");
        return false;
      }

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
        difficulty_level: (activityData.difficulty?.toLowerCase() as any) || "beginner",
        club_id: activityData.club || activityData.club_id,
        special_requirements: activityData.specialComments,
        activity_image: activityData.imageSrc || activityData.activity_image,
        route_link: activityData.routeLink || activityData.route_link,
        price_per_person: 0, // Default to free for legacy activities
        activity_data: {
          // Store activity-specific data in the flexible JSONB field
          distance: activityData.distance,
          distanceUnit: activityData.distanceUnit,
          pace: activityData.pace,
          paceUnit: activityData.paceUnit,
          elevation: activityData.elevation,
          elevationUnit: activityData.elevationUnit,
          cafeStop: activityData.cafeStop,
          subtype: activityData.subtype,
          gender: activityData.gender,
          ageMin: activityData.ageMin,
          ageMax: activityData.ageMax,
          visibility: activityData.visibility,
          requirements: activityData.requirements,
          description: activityData.description,
          // Add any other legacy fields that should be preserved
          // Climbing fields
          ...(activityData.climbingLevel && { climbingLevel: activityData.climbingLevel }),
          ...(activityData.languages && { languages: activityData.languages }),
          ...(activityData.gearRequired && { gearRequired: activityData.gearRequired }),
          ...(activityData.gradeRange && { gradeRange: activityData.gradeRange }),
          // Running fields
          ...(activityData.terrain && { terrain: activityData.terrain }),
          ...(activityData.elevationGain && { elevationGain: activityData.elevationGain }),
          ...(activityData.targetPace && { targetPace: activityData.targetPace }),
          ...(activityData.waterStations && { waterStations: activityData.waterStations }),
          // Tennis fields
          ...(activityData.skillLevel && { skillLevel: activityData.skillLevel }),
          ...(activityData.courtSurface && { courtSurface: activityData.courtSurface }),
          ...(activityData.isCompetitive && { isCompetitive: activityData.isCompetitive }),
          ...(activityData.duration && { duration: activityData.duration }),
          ...(activityData.equipmentProvided && { equipmentProvided: activityData.equipmentProvided }),
          ...(activityData.coachingIncluded && { coachingIncluded: activityData.coachingIncluded }),
          ...(activityData.refreshments && { refreshments: activityData.refreshments }),
          // Surfing fields
          ...(activityData.surfingType && { surfingType: activityData.surfingType }),
          ...(activityData.waveHeight && { waveHeight: activityData.waveHeight }),
          ...(activityData.waveConditions && { waveConditions: activityData.waveConditions }),
          ...(activityData.tideInfo && { tideInfo: activityData.tideInfo }),
          ...(activityData.waterTemp && { waterTemp: activityData.waterTemp }),
          // Skiing fields
          ...(activityData.snowConditions && { snowConditions: activityData.snowConditions }),
          ...(activityData.liftPass && { liftPass: activityData.liftPass }),
          ...(activityData.instructionIncluded && { instructionIncluded: activityData.instructionIncluded }),
          ...(activityData.aprèsSkiIncluded && { aprèsSkiIncluded: activityData.aprèsSkiIncluded }),
          ...(activityData.transport && { transport: activityData.transport }),
          // Hiking fields
          ...(activityData.hikingType && { hikingType: activityData.hikingType }),
          ...(activityData.navigationRequired && { navigationRequired: activityData.navigationRequired }),
          ...(activityData.waterSources && { waterSources: activityData.waterSources }),
          ...(activityData.shelterAvailable && { shelterAvailable: activityData.shelterAvailable }),
          ...(activityData.wildlifeWarning && { wildlifeWarning: activityData.wildlifeWarning }),
          ...(activityData.permitRequired && { permitRequired: activityData.permitRequired }),
          ...(activityData.transportIncluded && { transportIncluded: activityData.transportIncluded }),
          ...(activityData.guidedTour && { guidedTour: activityData.guidedTour }),
        },
      };

      console.log("Transformed activity data:", newActivityData);

      const result = await createActivity(newActivityData);
      console.log("Activity creation result:", result);

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
