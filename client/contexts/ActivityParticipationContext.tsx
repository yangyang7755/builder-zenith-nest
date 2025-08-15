import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useUserProfile } from "./UserProfileContext";
import { useHaptic } from "../hooks/useMobile";
import { apiService } from "../services/apiService";

export interface ActivityParticipant {
  id: string;
  activity_id: string;
  user_id: string;
  joined_at: Date;
  status: "joined" | "left" | "completed" | "cancelled";
  user: {
    id: string;
    full_name: string;
    profile_image?: string;
  };
}

export interface ActivityParticipationStats {
  current_participants: number;
  max_participants: number;
  is_full: boolean;
  waiting_list_count: number;
}

interface ActivityParticipationContextType {
  participations: Map<string, ActivityParticipant[]>; // activity_id -> participants
  userParticipations: string[]; // activity_ids user has joined
  joinActivity: (
    activityId: string,
    activityTitle: string,
    organizerId: string,
  ) => Promise<boolean>;
  leaveActivity: (
    activityId: string,
    activityTitle: string,
  ) => Promise<boolean>;
  getParticipants: (activityId: string) => ActivityParticipant[];
  getParticipationStats: (
    activityId: string,
    maxParticipants?: number,
  ) => ActivityParticipationStats | null;
  isUserParticipating: (activityId: string) => boolean;
  canJoinActivity: (activityId: string, maxParticipants?: number) => boolean;
  refreshParticipation: () => Promise<void>;
}

const ActivityParticipationContext = createContext<
  ActivityParticipationContextType | undefined
>(undefined);

export function ActivityParticipationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [participations, setParticipations] = useState<
    Map<string, ActivityParticipant[]>
  >(new Map());
  const [userParticipations, setUserParticipations] = useState<string[]>([]);
  const { currentUserProfile } = useUserProfile();
  const haptic = useHaptic();

  useEffect(() => {
    initializeDemoParticipations();
  }, []);

  // Listen for chat request acceptance events
  useEffect(() => {
    const handleChatRequestAccepted = (event: CustomEvent) => {
      const { activityTitle, requesterId, organizerId } = event.detail;

      // Convert activity title to activity ID (in a real app, this would be passed explicitly)
      const activityId = activityTitle
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      // Auto-join the user to the activity
      if (currentUserProfile && requesterId === currentUserProfile.full_name) {
        joinActivity(activityId, activityTitle, organizerId);
      }
    };

    window.addEventListener(
      "chatRequestAccepted",
      handleChatRequestAccepted as EventListener,
    );

    return () => {
      window.removeEventListener(
        "chatRequestAccepted",
        handleChatRequestAccepted as EventListener,
      );
    };
  }, [currentUserProfile]);

  const initializeDemoParticipations = () => {
    // Demo participation data
    const demoParticipations = new Map<string, ActivityParticipant[]>();

    // Westway Women's+ Climbing Morning
    demoParticipations.set("westway-womens-climb", [
      {
        id: "part_1",
        activity_id: "westway-womens-climb",
        user_id: "user_current",
        joined_at: new Date("2024-01-20"),
        status: "joined",
        user: {
          id: "user_current",
          full_name: "Maddie Wei",
          profile_image:
            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
        },
      },
      {
        id: "part_2",
        activity_id: "westway-womens-climb",
        user_id: "user_sarah_jones",
        joined_at: new Date("2024-01-21"),
        status: "joined",
        user: {
          id: "user_sarah_jones",
          full_name: "Sarah Jones",
          profile_image:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
        },
      },
      {
        id: "part_3",
        activity_id: "westway-womens-climb",
        user_id: "user_emma_wilson",
        joined_at: new Date("2024-01-22"),
        status: "joined",
        user: {
          id: "user_emma_wilson",
          full_name: "Emma Wilson",
          profile_image:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face",
        },
      },
    ]);

    // Sunday Morning Social Ride
    demoParticipations.set("sunday-morning-ride", [
      {
        id: "part_4",
        activity_id: "sunday-morning-ride",
        user_id: "user_alex_chen",
        joined_at: new Date("2024-01-18"),
        status: "joined",
        user: {
          id: "user_alex_chen",
          full_name: "Alex Chen",
          profile_image:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
        },
      },
      {
        id: "part_5",
        activity_id: "sunday-morning-ride",
        user_id: "user_dan_smith",
        joined_at: new Date("2024-01-19"),
        status: "joined",
        user: {
          id: "user_dan_smith",
          full_name: "Dan Smith",
          profile_image:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
        },
      },
    ]);

    setParticipations(demoParticipations);
    setUserParticipations(["westway-womens-climb"]); // User is participating in this activity
  };

  const joinActivity = async (
    activityId: string,
    activityTitle: string,
    organizerId: string,
  ): Promise<boolean> => {
    if (!currentUserProfile) return false;

    try {
      haptic.medium();

      // Check if already participating
      if (isUserParticipating(activityId)) {
        showParticipationNotification(
          "You're already participating in this activity!",
          "warning",
        );
        return false;
      }

      // Try to join via API first
      const response = await apiService.joinActivity(activityId);

      if (response.error && response.error !== "BACKEND_UNAVAILABLE") {
        showParticipationNotification("Failed to join activity", "error");
        return false;
      }

      // Create new participation for local state
      const newParticipant: ActivityParticipant = {
        id: `part_${Date.now()}`,
        activity_id: activityId,
        user_id: currentUserProfile.id,
        joined_at: new Date(),
        status: "joined",
        user: {
          id: currentUserProfile.id,
          full_name: currentUserProfile.full_name,
          profile_image: currentUserProfile.profile_image,
        },
      };

      // Update local participations
      setParticipations((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(activityId) || [];
        newMap.set(activityId, [...existing, newParticipant]);
        return newMap;
      });

      // Update user participations
      setUserParticipations((prev) => [...prev, activityId]);

      // Trigger activity context update
      const event = new CustomEvent("participantJoined", {
        detail: {
          activityId,
          participant: newParticipant,
          newCount: (participations.get(activityId)?.length || 0) + 1,
        },
      });
      window.dispatchEvent(event);

      // Trigger chat creation event for organizer communication
      const chatEvent = new CustomEvent("createActivityChat", {
        detail: {
          activityId,
          activityTitle,
          organizerId,
          participantId: currentUserProfile.id,
          participantName: currentUserProfile.full_name,
          message: `Hi! I just joined "${activityTitle}". Looking forward to the activity!`,
        },
      });
      window.dispatchEvent(chatEvent);

      showParticipationNotification(
        `You joined "${activityTitle}"!`,
        "success",
      );

      return true;
    } catch (error) {
      console.error("Error joining activity:", error);
      showParticipationNotification("Failed to join activity", "error");
      return false;
    }
  };

  const leaveActivity = async (
    activityId: string,
    activityTitle: string,
  ): Promise<boolean> => {
    if (!currentUserProfile) return false;

    try {
      haptic.light();

      // Check if participating
      if (!isUserParticipating(activityId)) {
        showParticipationNotification(
          "You're not participating in this activity!",
          "warning",
        );
        return false;
      }

      // Try to leave via API first
      const response = await apiService.leaveActivity(activityId);

      if (response.error && response.error !== "BACKEND_UNAVAILABLE") {
        showParticipationNotification("Failed to leave activity", "error");
        return false;
      }

      // Update local participations
      setParticipations((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(activityId) || [];
        const filtered = existing.filter(
          (p) => p.user_id !== currentUserProfile.id,
        );
        newMap.set(activityId, filtered);
        return newMap;
      });

      // Update user participations
      setUserParticipations((prev) => prev.filter((id) => id !== activityId));

      // Trigger activity context update
      const event = new CustomEvent("participantLeft", {
        detail: {
          activityId,
          userId: currentUserProfile.id,
          newCount: Math.max(
            0,
            (participations.get(activityId)?.length || 1) - 1,
          ),
        },
      });
      window.dispatchEvent(event);

      // Trigger chat notification event
      const chatEvent = new CustomEvent("updateActivityChat", {
        detail: {
          activityId,
          activityTitle,
          participantId: currentUserProfile.id,
          participantName: currentUserProfile.full_name,
          message: `I've decided to leave "${activityTitle}". Thanks for organizing!`,
          action: "left",
        },
      });
      window.dispatchEvent(chatEvent);

      showParticipationNotification(`You left "${activityTitle}"`, "info");

      return true;
    } catch (error) {
      console.error("Error leaving activity:", error);
      showParticipationNotification("Failed to leave activity", "error");
      return false;
    }
  };

  const getParticipants = (activityId: string): ActivityParticipant[] => {
    return (
      participations.get(activityId)?.filter((p) => p.status === "joined") || []
    );
  };

  const getParticipationStats = (
    activityId: string,
    maxParticipants: number = 10,
  ): ActivityParticipationStats | null => {
    if (!activityId) return null;

    const participants = getParticipants(activityId);
    const current_participants = participants.length;

    return {
      current_participants,
      max_participants: maxParticipants,
      is_full: current_participants >= maxParticipants,
      waiting_list_count: 0, // Could implement waiting list logic
    };
  };

  const isUserParticipating = (activityId: string): boolean => {
    return userParticipations.includes(activityId);
  };

  const canJoinActivity = (
    activityId: string,
    maxParticipants: number = 10,
  ): boolean => {
    const stats = getParticipationStats(activityId, maxParticipants);
    if (!stats) return false;
    return !stats.is_full && !isUserParticipating(activityId);
  };

  const refreshParticipation = async (): Promise<void> => {
    // In a real app, this would fetch fresh data from the API
    // For demo, we'll just keep current data
    console.log("Refreshing participation data...");
  };

  return (
    <ActivityParticipationContext.Provider
      value={{
        participations,
        userParticipations,
        joinActivity,
        leaveActivity,
        getParticipants,
        getParticipationStats,
        isUserParticipating,
        canJoinActivity,
        refreshParticipation,
      }}
    >
      {children}
    </ActivityParticipationContext.Provider>
  );
}

export function useActivityParticipation() {
  const context = useContext(ActivityParticipationContext);
  if (context === undefined) {
    throw new Error(
      "useActivityParticipation must be used within an ActivityParticipationProvider",
    );
  }
  return context;
}

// Helper function for participation notifications
function showParticipationNotification(
  message: string,
  type: "success" | "error" | "warning" | "info" = "info",
) {
  const toast = document.createElement("div");
  const colorClass =
    type === "success"
      ? "bg-green-600"
      : type === "error"
        ? "bg-red-600"
        : type === "warning"
          ? "bg-yellow-600"
          : "bg-blue-600";

  toast.className = `fixed top-16 left-1/2 transform -translate-x-1/2 z-[1001] ${colorClass} text-white px-4 py-2 rounded-lg font-medium max-w-sm mx-4 text-center`;
  toast.textContent = message;

  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.style.opacity = "0.9";
  }, 100);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
}
