import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useActivities } from "./ActivitiesContext";
import { useAuth } from "./AuthContext";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import { showNativeAlert } from "../utils/mobileUtils";

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

  // Check for completed activities every minute
  useEffect(() => {
    const interval = setInterval(() => {
      checkForCompletedActivities();
    }, 60000); // Check every minute

    // Initial check
    checkForCompletedActivities();

    return () => clearInterval(interval);
  }, [activities]);

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
    showNativeAlert(
      "Activity Completed?",
      `Did you complete "${activityTitle}"?`,
      [
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
      ],
    );
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

    showNativeAlert(
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
            showReviewModal(
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

  const showReviewModal = (
    activityId: string,
    activityTitle: string,
    organizerId: string,
    organizerName: string,
  ) => {
    // Create review modal
    const modal = document.createElement("div");
    modal.className = "native-modal open";

    const content = document.createElement("div");
    content.className = "native-modal-content";

    content.innerHTML = `
      <div class="mb-4">
        <h3 class="text-xl font-bold text-explore-green mb-2">Review ${organizerName}</h3>
        <p class="text-gray-600">How was your experience with "${activityTitle}"?</p>
      </div>
      
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">Rating</label>
        <div class="flex gap-2 mb-4" id="rating-stars">
          ${[1, 2, 3, 4, 5]
            .map(
              (i) =>
                `<button class="star-btn text-2xl text-gray-300 hover:text-yellow-400" data-rating="${i}">⭐</button>`,
            )
            .join("")}
        </div>
      </div>
      
      <div class="mb-6">
        <label class="block text-sm font-medium mb-2">Comment (optional)</label>
        <textarea id="review-comment" class="w-full native-input h-20 resize-none" placeholder="Share your experience..."></textarea>
      </div>
      
      <div class="flex gap-3">
        <button id="cancel-review" class="flex-1 native-button-secondary">Cancel</button>
        <button id="submit-review" class="flex-1 native-button">Submit Review</button>
      </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    let selectedRating = 0;

    // Handle star selection
    const stars = content.querySelectorAll(".star-btn");
    stars.forEach((star, index) => {
      star.addEventListener("click", () => {
        selectedRating = index + 1;
        stars.forEach((s, i) => {
          s.classList.toggle("text-yellow-400", i < selectedRating);
          s.classList.toggle("text-gray-300", i >= selectedRating);
        });
      });
    });

    // Handle cancel
    content.querySelector("#cancel-review")?.addEventListener("click", () => {
      document.body.removeChild(modal);
    });

    // Handle submit
    content.querySelector("#submit-review")?.addEventListener("click", () => {
      if (selectedRating === 0) {
        alert("Please select a rating");
        return;
      }

      const comment =
        (content.querySelector("#review-comment") as HTMLTextAreaElement)
          ?.value || "";

      submitReview({
        activity_id: activityId,
        reviewer_id: "user_current",
        organizer_id: organizerId,
        rating: selectedRating,
        comment,
        activity_title: activityTitle,
        organizer_name: organizerName,
      });

      document.body.removeChild(modal);
    });
  };

  const markActivityCompleted = async (activityId: string): Promise<void> => {
    const completion: ActivityCompletion = {
      id: `completion_${Date.now()}`,
      activity_id: activityId,
      user_id: "user_current",
      completed: true,
      completion_date: new Date(),
      review_submitted: false,
      created_at: new Date(),
    };

    setCompletions((prev) => [...prev, completion]);

    // In a real app, this would save to database
    // await apiService.markActivityCompleted(activityId);
  };

  const markActivityNotCompleted = (activityId: string) => {
    const completion: ActivityCompletion = {
      id: `completion_${Date.now()}`,
      activity_id: activityId,
      user_id: "user_current",
      completed: false,
      created_at: new Date(),
    };

    setCompletions((prev) => [...prev, completion]);
  };

  const submitReview = async (
    reviewData: Omit<ActivityReview, "id" | "created_at">,
  ): Promise<void> => {
    const review: ActivityReview = {
      ...reviewData,
      id: `review_${Date.now()}`,
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

    // Show success message
    showNativeAlert(
      "Review Submitted",
      `Thank you for reviewing ${reviewData.organizer_name}!`,
    );

    // In a real app, this would save to database
    // await apiService.submitActivityReview(review);
  };

  const hasReviewedActivity = (activityId: string): boolean => {
    return reviews.some(
      (r) => r.activity_id === activityId && r.reviewer_id === "user_current",
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
