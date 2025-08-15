import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Activity } from "./ActivitiesContext";
import { apiService } from "../services/apiService";

interface SavedActivitiesContextType {
  savedActivities: Activity[];
  saveActivity: (activity: Activity) => Promise<boolean>;
  unsaveActivity: (activityId: string) => Promise<boolean>;
  isActivitySaved: (activityId: string) => boolean;
  loading: boolean;
  refreshSavedActivities: () => Promise<void>;
}

const SavedActivitiesContext = createContext<
  SavedActivitiesContextType | undefined
>(undefined);

export function SavedActivitiesProvider({ children }: { children: ReactNode }) {
  const [savedActivities, setSavedActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  // Load saved activities from backend on mount
  useEffect(() => {
    loadSavedActivities();
  }, []);

  const loadSavedActivities = async () => {
    try {
      setLoading(true);

      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );

      const response = await Promise.race([
        apiService.getSavedActivities(),
        timeoutPromise
      ]) as any;

      if (response.error) {
        if (response.error === "BACKEND_UNAVAILABLE") {
          console.log(
            "Backend unavailable, keeping existing saved activities state",
          );
        } else {
          console.error("Failed to load saved activities:", response.error);
        }
        return;
      }

      // Handle successful response or backend unavailable (use demo mode)
      if (response.data?.success) {
        const savedData = response.data.data || [];

        if (savedData.length > 0) {
          // Transform backend data to Activity format
          const activities = savedData.map((saved: any) => {
            // Handle both nested activity data and direct activity data
            const activityData = saved.activity || saved;

            return {
              ...activityData,
              // Ensure legacy fields for backward compatibility
              date: activityData.date_time
                ? new Date(activityData.date_time).toISOString().split("T")[0]
                : "",
              time: activityData.date_time
                ? new Date(activityData.date_time).toTimeString().slice(0, 5)
                : "",
              type: activityData.activity_type,
              organizerName: activityData.organizer?.full_name || "Unknown",
              maxParticipants: activityData.max_participants?.toString() || "0",
            };
          });
          setSavedActivities(activities);
        } else {
          // Empty array or no saved activities
          setSavedActivities([]);
        }
      } else if (response.error === "BACKEND_UNAVAILABLE") {
        // Backend unavailable, keep existing demo/local state
        console.log(
          "Backend unavailable, keeping local saved activities state",
        );
      }
    } catch (error) {
      console.error("Error loading saved activities:", error);
      // On error, keep existing state but ensure we don't stay in loading state
      // Could be network error, timeout, or other connectivity issue
      if (error instanceof Error && error.message === 'Request timeout') {
        console.log("Saved activities request timed out, keeping current state");
      }
    } finally {
      setLoading(false);
    }
  };

  const saveActivity = async (activity: Activity): Promise<boolean> => {
    try {
      // Optimistically update UI
      setSavedActivities((prev) => {
        if (prev.some((saved) => saved.id === activity.id)) {
          return prev; // Already saved
        }
        return [...prev, activity];
      });

      const response = await apiService.saveActivity(activity.id);

      if (response.error) {
        if (response.error === "BACKEND_UNAVAILABLE") {
          // Backend unavailable - use localStorage fallback
          console.log("Backend unavailable, saving to localStorage");
          try {
            const savedActivities = JSON.parse(localStorage.getItem('savedActivities') || '[]');
            const newSavedActivities = [...savedActivities, activity];
            localStorage.setItem('savedActivities', JSON.stringify(newSavedActivities));
            return true; // Keep optimistic update
          } catch (storageError) {
            console.error("Failed to save to localStorage:", storageError);
            // Revert optimistic update
            setSavedActivities((prev) =>
              prev.filter((saved) => saved.id !== activity.id),
            );
            return false;
          }
        } else {
          // Other error - revert optimistic update
          setSavedActivities((prev) =>
            prev.filter((saved) => saved.id !== activity.id),
          );
          console.error("Failed to save activity:", response.error);
          return false;
        }
      }

      return true;
    } catch (error) {
      // Revert optimistic update
      setSavedActivities((prev) =>
        prev.filter((saved) => saved.id !== activity.id),
      );
      console.error("Error saving activity:", error);
      return false;
    }
  };

  const unsaveActivity = async (activityId: string): Promise<boolean> => {
    try {
      // Optimistically update UI
      const removedActivity = savedActivities.find(
        (activity) => activity.id === activityId,
      );
      setSavedActivities((prev) =>
        prev.filter((activity) => activity.id !== activityId),
      );

      const response = await apiService.unsaveActivity(activityId);

      if (response.error) {
        if (response.error === "BACKEND_UNAVAILABLE") {
          // Backend unavailable - use localStorage fallback
          console.log("Backend unavailable, removing from localStorage");
          try {
            const savedActivities = JSON.parse(localStorage.getItem('savedActivities') || '[]');
            const filteredActivities = savedActivities.filter((activity: Activity) => activity.id !== activityId);
            localStorage.setItem('savedActivities', JSON.stringify(filteredActivities));
            return true; // Keep optimistic update
          } catch (storageError) {
            console.error("Failed to remove from localStorage:", storageError);
            // Revert optimistic update
            if (removedActivity) {
              setSavedActivities((prev) => [...prev, removedActivity]);
            }
            return false;
          }
        } else {
          // Other error - revert optimistic update
          if (removedActivity) {
            setSavedActivities((prev) => [...prev, removedActivity]);
          }
          console.error("Failed to unsave activity:", response.error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error unsaving activity:", error);
      return false;
    }
  };

  const isActivitySaved = (activityId: string): boolean => {
    return savedActivities.some((activity) => activity.id === activityId);
  };

  const refreshSavedActivities = async (): Promise<void> => {
    await loadSavedActivities();
  };

  return (
    <SavedActivitiesContext.Provider
      value={{
        savedActivities,
        saveActivity,
        unsaveActivity,
        isActivitySaved,
        loading,
        refreshSavedActivities,
      }}
    >
      {children}
    </SavedActivitiesContext.Provider>
  );
}

export function useSavedActivities() {
  const context = useContext(SavedActivitiesContext);
  if (context === undefined) {
    throw new Error(
      "useSavedActivities must be used within a SavedActivitiesProvider",
    );
  }
  return context;
}
