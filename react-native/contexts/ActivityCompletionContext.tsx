import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { useAuth } from "./AuthContext";
import { useActivities } from "./ActivitiesContext";
import { apiService } from "../services/apiService";

export interface ActivityCompletion {
  id: string;
  activity_id: string;
  user_id: string;
  completed: boolean;
  completion_date?: Date;
  review_submitted?: boolean;
  created_at: Date;
}

export interface ActivityReview {
  id: string;
  activity_id: string;
  reviewer_id: string;
  organizer_id: string;
  rating: number; // 1-5 stars
  comment: string;
  created_at: Date;
  activity_title: string;
  organizer_name: string;
}

interface ActivityCompletionContextType {
  completions: ActivityCompletion[];
  reviews: ActivityReview[];
  checkForCompletedActivities: () => void;
  markActivityCompleted: (activityId: string) => Promise<void>;
  submitReview: (
    review: Omit<ActivityReview, "id" | "created_at">,
  ) => Promise<void>;
  hasReviewedActivity: (activityId: string) => boolean;
  getActivityReviews: (activityId: string) => ActivityReview[];
  showCompletionPrompt: (
    activityId: string,
    activityTitle: string,
    organizerId: string,
    organizerName: string,
  ) => void;
}

const ActivityCompletionContext = createContext<
  ActivityCompletionContextType | undefined
>(undefined);

export function ActivityCompletionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const [completions, setCompletions] = useState<ActivityCompletion[]>([]);
  const [reviews, setReviews] = useState<ActivityReview[]>([]);
  const [checkedActivities, setCheckedActivities] = useState<Set<string>>(
    new Set(),
  );

  // Safely get activities with fallback
  let activities: any[] = [];
  try {
    const activitiesContext = useActivities();
    activities = activitiesContext.activities || [];
  } catch (error) {
    console.warn(
      "ActivitiesContext not available yet, using empty activities list",
    );
    activities = [];
  }

  // Load cached data on mount
  useEffect(() => {
    if (user) {
      loadCachedData();
    }
  }, [user]);

  // Check for completed activities every minute
  useEffect(() => {
    const interval = setInterval(() => {
      checkForCompletedActivities();
    }, 60000); // Check every minute

    // Initial check
    checkForCompletedActivities();

    return () => clearInterval(interval);
  }, [activities]);

  const loadCachedData = async () => {
    try {
      const [cachedCompletions, cachedReviews] = await Promise.all([
        AsyncStorage.getItem("activityCompletions"),
        AsyncStorage.getItem("activityReviews"),
      ]);

      if (cachedCompletions) {
        const parsed = JSON.parse(cachedCompletions);
        setCompletions(
          parsed.map((c: any) => ({
            ...c,
            completion_date: c.completion_date
              ? new Date(c.completion_date)
              : undefined,
            created_at: new Date(c.created_at),
          })),
        );
      }

      if (cachedReviews) {
        const parsed = JSON.parse(cachedReviews);
        setReviews(
          parsed.map((r: any) => ({
            ...r,
            created_at: new Date(r.created_at),
          })),
        );
      }
    } catch (error) {
      console.error("Error loading cached completion data:", error);
    }
  };

  const checkForCompletedActivities = () => {
    const now = new Date();

    activities.forEach((activity) => {
      // Skip if already checked
      if (checkedActivities.has(activity.id)) {
        return;
      }

      // Check if activity date has passed
      const activityDate = new Date(activity.date_time || activity.date || "");
      const dayAfterActivity = new Date(activityDate);
      dayAfterActivity.setDate(dayAfterActivity.getDate() + 1);

      if (now >= dayAfterActivity) {
        // Mark as checked to avoid repeated prompts
        setCheckedActivities((prev) => new Set([...prev, activity.id]));

        // Show completion prompt
        setTimeout(() => {
          showCompletionPrompt(
            activity.id,
            activity.title,
            activity.organizer_id || "unknown",
            activity.organizer?.full_name ||
              activity.organizerName ||
              "Unknown Organizer",
          );
        }, 1000); // Delay to avoid multiple prompts at once
      }
    });
  };

  const showCompletionPrompt = (
    activityId: string,
    activityTitle: string,
    organizerId: string,
    organizerName: string,
  ) => {
    Alert.alert("Activity Completed?", `Did you complete "${activityTitle}"?`, [
      {
        text: "No",
        style: "cancel",
        onPress: () => {
          // Mark as not completed
          markActivityNotCompleted(activityId);
        },
      },
      {
        text: "Yes",
        style: "default",
        onPress: () => {
          markActivityCompleted(activityId).then(() => {
            // Prompt for review
            setTimeout(() => {
              showReviewPrompt(
                activityId,
                activityTitle,
                organizerId,
                organizerName,
              );
            }, 500);
          });
        },
      },
    ]);
  };

  const showReviewPrompt = (
    activityId: string,
    activityTitle: string,
    organizerId: string,
    organizerName: string,
  ) => {
    // Check if already reviewed
    if (hasReviewedActivity(activityId)) {
      return;
    }

    Alert.alert(
      "Leave a Review",
      `Would you like to review ${organizerName} for organizing "${activityTitle}"?`,
      [
        {
          text: "Skip",
          style: "cancel",
        },
        {
          text: "Review",
          style: "default",
          onPress: () => {
            // In a full implementation, this would navigate to a review screen
            // For now, create a simple rating prompt
            showSimpleRatingPrompt(
              activityId,
              activityTitle,
              organizerId,
              organizerName,
            );
          },
        },
      ],
    );
  };

  const showSimpleRatingPrompt = (
    activityId: string,
    activityTitle: string,
    organizerId: string,
    organizerName: string,
  ) => {
    // Simple rating options
    Alert.alert(
      `Rate ${organizerName}`,
      `How would you rate your experience with "${activityTitle}"?`,
      [
        {
          text: "⭐ (1 star)",
          onPress: () =>
            submitSimpleReview(
              activityId,
              organizerId,
              organizerName,
              activityTitle,
              1,
            ),
        },
        {
          text: "⭐⭐ (2 stars)",
          onPress: () =>
            submitSimpleReview(
              activityId,
              organizerId,
              organizerName,
              activityTitle,
              2,
            ),
        },
        {
          text: "⭐⭐⭐ (3 stars)",
          onPress: () =>
            submitSimpleReview(
              activityId,
              organizerId,
              organizerName,
              activityTitle,
              3,
            ),
        },
        {
          text: "⭐⭐⭐⭐ (4 stars)",
          onPress: () =>
            submitSimpleReview(
              activityId,
              organizerId,
              organizerName,
              activityTitle,
              4,
            ),
        },
        {
          text: "⭐⭐⭐⭐⭐ (5 stars)",
          onPress: () =>
            submitSimpleReview(
              activityId,
              organizerId,
              organizerName,
              activityTitle,
              5,
            ),
        },
        { text: "Skip", style: "cancel" },
      ],
    );
  };

  const submitSimpleReview = async (
    activityId: string,
    organizerId: string,
    organizerName: string,
    activityTitle: string,
    rating: number,
  ) => {
    await submitReview({
      activity_id: activityId,
      reviewer_id: user?.id || "unknown",
      organizer_id: organizerId,
      rating,
      comment: "",
      activity_title: activityTitle,
      organizer_name: organizerName,
    });
  };

  const markActivityCompleted = async (activityId: string): Promise<void> => {
    if (!user) {
      Alert.alert(
        "Authentication Required",
        "Please log in to mark activities as completed",
      );
      return;
    }

    try {
      const response = await apiService.markActivityCompleted(activityId);

      if (response.error) {
        Alert.alert("Error", response.error);
        return;
      }

      const completion: ActivityCompletion = {
        id: response.data?.id || `completion_${Date.now()}`,
        activity_id: activityId,
        user_id: user.id,
        completed: true,
        completion_date: new Date(),
        review_submitted: false,
        created_at: new Date(),
      };

      setCompletions((prev) => [...prev, completion]);

      // Cache the updated completions
      const updatedCompletions = [...completions, completion];
      await AsyncStorage.setItem(
        "activityCompletions",
        JSON.stringify(updatedCompletions),
      );

      Alert.alert("Success", "Activity marked as completed!");
    } catch (error) {
      console.error("Error marking activity as completed:", error);
      Alert.alert("Error", "Failed to mark activity as completed");
    }
  };

  const markActivityNotCompleted = async (activityId: string) => {
    if (!user) return;

    const completion: ActivityCompletion = {
      id: `completion_${Date.now()}`,
      activity_id: activityId,
      user_id: user.id,
      completed: false,
      created_at: new Date(),
    };

    setCompletions((prev) => [...prev, completion]);

    // Cache the updated completions
    const updatedCompletions = [...completions, completion];
    await AsyncStorage.setItem(
      "activityCompletions",
      JSON.stringify(updatedCompletions),
    );
  };

  const submitReview = async (
    reviewData: Omit<ActivityReview, "id" | "created_at">,
  ): Promise<void> => {
    if (!user) {
      Alert.alert("Authentication Required", "Please log in to submit reviews");
      return;
    }

    try {
      const response = await apiService.createActivityReview({
        activity_id: reviewData.activity_id,
        reviewee_id: reviewData.organizer_id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });

      if (response.error) {
        Alert.alert("Error", response.error);
        return;
      }

      const review: ActivityReview = {
        ...reviewData,
        id: response.data?.id || `review_${Date.now()}`,
        reviewer_id: user.id,
        created_at: new Date(),
      };

      setReviews((prev) => [...prev, review]);

      // Update completion to mark review as submitted
      setCompletions((prev) =>
        prev.map((c) =>
          c.activity_id === reviewData.activity_id
            ? { ...c, review_submitted: true }
            : c,
        ),
      );

      // Cache the updated data
      const updatedReviews = [...reviews, review];
      await AsyncStorage.setItem(
        "activityReviews",
        JSON.stringify(updatedReviews),
      );

      Alert.alert(
        "Review Submitted",
        `Thank you for reviewing ${reviewData.organizer_name}!`,
      );
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "Failed to submit review");
    }
  };

  const hasReviewedActivity = (activityId: string): boolean => {
    return reviews.some(
      (r) => r.activity_id === activityId && r.reviewer_id === user?.id,
    );
  };

  const getActivityReviews = (activityId: string): ActivityReview[] => {
    return reviews.filter((r) => r.activity_id === activityId);
  };

  return (
    <ActivityCompletionContext.Provider
      value={{
        completions,
        reviews,
        checkForCompletedActivities,
        markActivityCompleted,
        submitReview,
        hasReviewedActivity,
        getActivityReviews,
        showCompletionPrompt,
      }}
    >
      {children}
    </ActivityCompletionContext.Provider>
  );
}

export function useActivityCompletion() {
  const context = useContext(ActivityCompletionContext);
  if (context === undefined) {
    throw new Error(
      "useActivityCompletion must be used within an ActivityCompletionProvider",
    );
  }
  return context;
}
