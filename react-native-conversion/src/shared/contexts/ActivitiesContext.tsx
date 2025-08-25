// Activities context for React Native (matches web implementation)
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { api } from "../services/apiService";
import { storageHelpers } from "../platform/storage";
import { STORAGE_KEYS } from "../constants";
import type { Activity, ActivitiesState, FilterOptions } from "../types";

interface ActivitiesContextType extends ActivitiesState {
  searchActivities: (query: string) => Activity[];
  refreshActivities: () => Promise<void>;
  createActivity: (
    activityData: any,
  ) => Promise<{ success: boolean; error?: string }>;
  getUserParticipatedActivities: () => Activity[];
  getUserOrganizedActivities: () => Activity[];
  joinActivity: (activityId: string) => Promise<void>;
  leaveActivity: (activityId: string) => Promise<void>;
  updateFilters: (newFilters: FilterOptions) => void;
  clearFilters: () => void;
}

const ActivitiesContext = createContext<ActivitiesContextType | undefined>(
  undefined,
);

interface ActivitiesProviderProps {
  children: ReactNode;
}

export function ActivitiesProvider({ children }: ActivitiesProviderProps) {
  const [state, setState] = useState<ActivitiesState>({
    activities: [],
    loading: false,
    error: null,
    filters: {
      activityType: [
        "Cycling",
        "Climbing",
        "Running",
        "Hiking",
        "Skiing",
        "Surfing",
        "Tennis",
        "General",
      ],
      numberOfPeople: { min: 1, max: 50 },
      location: "",
      locationRange: 10,
      date: { start: "", end: "" },
      gender: [],
      age: { min: 16, max: 80 },
      gear: [],
      pace: { min: 0, max: 100 },
      distance: { min: 0, max: 200 },
      elevation: { min: 0, max: 5000 },
      clubOnly: false,
    },
  });

  // Load activities on component mount
  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Try to load from cache first
      const cachedActivities =
        await storageHelpers.getWithExpiry<Activity[]>("cached_activities");
      if (cachedActivities) {
        setState((prev) => ({ ...prev, activities: cachedActivities }));
      }

      // Fetch fresh data from API
      const response = await api.activities.getAll();

      if (response.error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: response.error!,
          // Keep cached data if API fails
          activities: cachedActivities || prev.activities,
        }));
        return;
      }

      if (response.data) {
        const activities = response.data;

        // Cache activities for 5 minutes
        await storageHelpers.setWithExpiry(
          "cached_activities",
          activities,
          5 * 60 * 1000,
        );

        setState((prev) => ({
          ...prev,
          activities,
          loading: false,
          error: null,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          activities: cachedActivities || [],
        }));
      }
    } catch (error) {
      console.error("Load activities error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load activities";

      // Try to use cached data on error
      const cachedActivities =
        await storageHelpers.getJSON<Activity[]>("cached_activities");

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
        activities: cachedActivities || prev.activities,
      }));
    }
  };

  const searchActivities = (query: string): Activity[] => {
    if (!query.trim()) return state.activities;

    const searchTerm = query.toLowerCase();
    return state.activities.filter(
      (activity) =>
        activity.title.toLowerCase().includes(searchTerm) ||
        activity.location.toLowerCase().includes(searchTerm) ||
        activity.organizer.toLowerCase().includes(searchTerm) ||
        activity.type.toLowerCase().includes(searchTerm),
    );
  };

  const refreshActivities = async () => {
    await loadActivities();
  };

  const createActivity = async (activityData: any) => {
    try {
      const response = await api.activities.create(activityData);

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.data) {
        // Add new activity to the list
        setState((prev) => ({
          ...prev,
          activities: [response.data, ...prev.activities],
        }));

        // Refresh cache
        await refreshActivities();

        return { success: true };
      }

      return { success: false, error: "Failed to create activity" };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create activity";
      return { success: false, error: errorMessage };
    }
  };

  const getUserParticipatedActivities = (): Activity[] => {
    // This would typically come from user participation data
    // For now, return empty array - would be enhanced with actual participation tracking
    return [];
  };

  const getUserOrganizedActivities = (): Activity[] => {
    // This would filter activities where current user is the organizer
    // For now, return empty array - would be enhanced with user context
    return [];
  };

  const joinActivity = async (activityId: string) => {
    try {
      const response = await api.activities.join(activityId);

      if (response.error) {
        throw new Error(response.error);
      }

      // Update local state to reflect participation
      setState((prev) => ({
        ...prev,
        activities: prev.activities.map((activity) =>
          activity.id === activityId
            ? { ...activity, hasJoined: true }
            : activity,
        ),
      }));
    } catch (error) {
      console.error("Join activity error:", error);
      throw error;
    }
  };

  const leaveActivity = async (activityId: string) => {
    try {
      const response = await api.activities.leave(activityId);

      if (response.error) {
        throw new Error(response.error);
      }

      // Update local state to reflect leaving
      setState((prev) => ({
        ...prev,
        activities: prev.activities.map((activity) =>
          activity.id === activityId
            ? { ...activity, hasJoined: false }
            : activity,
        ),
      }));
    } catch (error) {
      console.error("Leave activity error:", error);
      throw error;
    }
  };

  const updateFilters = (newFilters: FilterOptions) => {
    setState((prev) => ({ ...prev, filters: newFilters }));
  };

  const clearFilters = () => {
    setState((prev) => ({
      ...prev,
      filters: {
        activityType: [
          "Cycling",
          "Climbing",
          "Running",
          "Hiking",
          "Skiing",
          "Surfing",
          "Tennis",
          "General",
        ],
        numberOfPeople: { min: 1, max: 50 },
        location: "",
        locationRange: 10,
        date: { start: "", end: "" },
        gender: [],
        age: { min: 16, max: 80 },
        gear: [],
        pace: { min: 0, max: 100 },
        distance: { min: 0, max: 200 },
        elevation: { min: 0, max: 5000 },
        clubOnly: false,
      },
    }));
  };

  const value: ActivitiesContextType = {
    ...state,
    searchActivities,
    refreshActivities,
    createActivity,
    getUserParticipatedActivities,
    getUserOrganizedActivities,
    joinActivity,
    leaveActivity,
    updateFilters,
    clearFilters,
  };

  return (
    <ActivitiesContext.Provider value={value}>
      {children}
    </ActivitiesContext.Provider>
  );
}

export function useActivities(): ActivitiesContextType {
  const context = useContext(ActivitiesContext);
  if (context === undefined) {
    throw new Error("useActivities must be used within an ActivitiesProvider");
  }
  return context;
}

export default ActivitiesContext;
