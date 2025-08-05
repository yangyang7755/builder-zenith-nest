import { createContext, useContext, useState, ReactNode, useEffect } from "react";
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
      const response = await apiService.getSavedActivities();
      
      if (response.error) {
        console.error("Failed to load saved activities:", response.error);
        return;
      }

      if (response.data?.success && response.data.data) {
        // Transform backend data to Activity format
        const activities = response.data.data.map((saved: any) => ({
          ...saved.activity,
          // Ensure legacy fields for backward compatibility
          date: saved.activity.date_time ? new Date(saved.activity.date_time).toISOString().split('T')[0] : '',
          time: saved.activity.date_time ? new Date(saved.activity.date_time).toTimeString().slice(0, 5) : '',
          type: saved.activity.activity_type,
          organizerName: saved.activity.organizer?.full_name || "Unknown",
          maxParticipants: saved.activity.max_participants?.toString() || "0"
        }));
        setSavedActivities(activities);
      }
    } catch (error) {
      console.error("Error loading saved activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveActivity = async (activity: Activity): Promise<boolean> => {
    try {
      // Optimistically update UI
      setSavedActivities(prev => {
        if (prev.some(saved => saved.id === activity.id)) {
          return prev; // Already saved
        }
        return [...prev, activity];
      });

      const response = await apiService.saveActivity(activity.id);
      
      if (response.error) {
        // Revert optimistic update
        setSavedActivities(prev => prev.filter(saved => saved.id !== activity.id));
        console.error("Failed to save activity:", response.error);
        return false;
      }

      return true;
    } catch (error) {
      // Revert optimistic update
      setSavedActivities(prev => prev.filter(saved => saved.id !== activity.id));
      console.error("Error saving activity:", error);
      return false;
    }
  };

  const unsaveActivity = async (activityId: string): Promise<boolean> => {
    try {
      // Optimistically update UI
      const removedActivity = savedActivities.find(activity => activity.id === activityId);
      setSavedActivities(prev => prev.filter(activity => activity.id !== activityId));

      const response = await apiService.unsaveActivity(activityId);
      
      if (response.error) {
        // Revert optimistic update
        if (removedActivity) {
          setSavedActivities(prev => [...prev, removedActivity]);
        }
        console.error("Failed to unsave activity:", response.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error unsaving activity:", error);
      return false;
    }
  };

  const isActivitySaved = (activityId: string): boolean => {
    return savedActivities.some(activity => activity.id === activityId);
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
        refreshSavedActivities 
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
