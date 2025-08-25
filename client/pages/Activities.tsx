import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark, Clock, MapPin, Users, CheckCircle } from "lucide-react";
import { useSavedActivities } from "../contexts/SavedActivitiesContext";
import { Activity, useActivities } from "../contexts/ActivitiesContext";
import { useActivityParticipation } from "../contexts/ActivityParticipationContext";
import { useUserProfile } from "../contexts/UserProfileContext";
import { useAuth } from "../contexts/AuthContext";
import BackendTest from "../components/BackendTest";
import DemoAuth from "../components/DemoAuth";
import UserNav from "../components/UserNav";
import BottomNavigation from "../components/BottomNavigation";
import ReviewPrompt from "../components/ReviewPrompt";
import { apiService } from "../services/apiService";

export default function Activities() {
  const { user } = useAuth();
  const { savedActivities, unsaveActivity } = useSavedActivities();
  const {
    activities,
    getUserParticipatedActivities,
    getUserOrganizedActivities,
  } = useActivities();
  const { getUserParticipatedActivities: getParticipationData } =
    useActivityParticipation();
  const { currentUserProfile } = useUserProfile();
  const [selectedTab, setSelectedTab] = useState("Saved");
  const [pastActivitiesNeedingReview, setPastActivitiesNeedingReview] =
    useState<Activity[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // Sort activities by date (future vs past) - memoized to prevent unnecessary recalculations
  const { upcomingSavedActivities, pastSavedActivities } = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    const upcoming = savedActivities.filter((activity) => {
      const activityDate = new Date(activity.date);
      const activityDateString = activityDate.toISOString().split("T")[0];
      return activityDateString >= today;
    });

    const past = savedActivities.filter((activity) => {
      const activityDate = new Date(activity.date);
      const activityDateString = activityDate.toISOString().split("T")[0];
      return activityDateString < today;
    });

    return { upcomingSavedActivities: upcoming, pastSavedActivities: past };
  }, [savedActivities]);

  // Get activities user has joined using participation context (memoized to prevent infinite loops)
  const participatedActivities = useMemo(() => {
    return getUserParticipatedActivities();
  }, [activities, currentUserProfile]);

  // Get activities user has organized (memoized for consistency)
  const organizedActivities = useMemo(() => {
    return getUserOrganizedActivities();
  }, [activities, currentUserProfile]);

  // Combine participated and organized activities, removing duplicates (memoized)
  const allJoinedActivities = useMemo(() => {
    return [
      ...participatedActivities,
      ...organizedActivities.filter(
        (org) => !participatedActivities.some((part) => part.id === org.id),
      ),
    ];
  }, [participatedActivities, organizedActivities]);

  const navigate = useNavigate();

  // Load past activities that need reviews
  useEffect(() => {
    if (user && selectedTab === "Joined") {
      loadPastActivitiesNeedingReview();
    }
  }, [user, selectedTab, participatedActivities]);

  const loadPastActivitiesNeedingReview = async () => {
    if (!user) return;

    setIsLoadingReviews(true);
    try {
      // Get past participated activities
      const pastActivities = participatedActivities.filter((activity) => {
        const activityDate = new Date(activity.date || activity.date_time);
        const now = new Date();
        return activityDate < now;
      });

      // Check which ones need reviews
      const activitiesNeedingReview = [];
      for (const activity of pastActivities) {
        try {
          const reviewsResponse = await apiService.getActivityReviews(
            activity.id,
          );
          const userReview = reviewsResponse.data?.find(
            (review: any) => review.reviewer_id === user.id,
          );

          if (!userReview) {
            activitiesNeedingReview.push(activity);
          }
        } catch (error) {
          console.error(
            "Error checking reviews for activity:",
            activity.id,
            error,
          );
        }
      }

      setPastActivitiesNeedingReview(activitiesNeedingReview);
    } catch (error) {
      console.error("Error loading past activities needing review:", error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleReviewSubmitted = () => {
    // Refresh the activities needing review
    loadPastActivitiesNeedingReview();
  };

  const handleActivityClick = (activity: Activity) => {
    if (activity.type === "cycling") {
      navigate("/activity/sunday-morning-ride");
    } else if (activity.type === "climbing") {
      navigate("/activity/westway-womens-climb");
    } else if (activity.type === "running") {
      navigate("/activity/westway-womens-climb"); // Default for now
    } else {
      navigate("/activity/westway-womens-climb"); // Default
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "cycling":
        return "🚴";
      case "climbing":
        return "🧗";
      case "running":
        return "����";
      case "hiking":
        return "🥾";
      case "skiing":
        return "🎿";
      case "surfing":
        return "🌊";
      case "tennis":
        return "🎾";
      default:
        return "⚡";
    }
  };

  const ActivityCard = ({ activity }: { activity: Activity }) => {
    // Extract organizer name from new Activity interface
    const organizerName =
      activity.organizer?.full_name || activity.organizerName || "Unknown";

    // Extract date and time from date_time or legacy fields
    const activityDate = activity.date_time
      ? new Date(activity.date_time)
      : activity.date
        ? new Date(activity.date + "T" + (activity.time || "00:00") + ":00")
        : new Date();

    const activityType = activity.activity_type || activity.type || "general";
    const maxParticipants =
      activity.max_participants || parseInt(activity.maxParticipants || "0");

    return (
      <div
        onClick={() => handleActivityClick(activity)}
        className="bg-white rounded-lg border border-gray-200 p-4 mb-4 cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-black font-cabin mb-1">
              {activity.title}
            </h3>
            <p className="text-sm text-gray-600 font-cabin">
              By {organizerName}
            </p>
          </div>
          <div className="text-2xl ml-2">{getActivityIcon(activityType)}</div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="font-cabin">
              {activityDate.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}{" "}
              at {activityDate.toTimeString().slice(0, 5)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="font-cabin">{activity.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span className="font-cabin">
              {activity.current_participants || 0}/{maxParticipants} people
            </span>
          </div>
        </div>

        {activity.status && (
          <div className="flex items-center gap-2 mt-3">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-600 font-cabin capitalize">
              {activity.status}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="react-native-container bg-white font-cabin relative native-scroll">
      {/* Status Bar */}
      <div className="h-11 bg-white flex items-center justify-between px-6 text-black font-medium">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-1 h-3 bg-black rounded-sm"></div>
            ))}
          </div>
          <svg className="w-6 h-4" viewBox="0 0 24 16" fill="none">
            <rect
              x="1"
              y="3"
              width="22"
              height="10"
              rx="2"
              stroke="black"
              strokeWidth="1"
              fill="none"
            />
            <rect x="23" y="6" width="2" height="4" rx="1" fill="black" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-24">
        {/* Title */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-explore-green font-cabin">
            All Activities
          </h1>
        </div>

        {/* Review Prompt Badge */}
        {user && pastActivitiesNeedingReview.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">⭐</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  {pastActivitiesNeedingReview.length} activities need your
                  review
                </p>
                <p className="text-xs text-yellow-600">
                  Help others by sharing your experience
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setSelectedTab("Saved")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedTab === "Saved"
                ? "bg-white text-explore-green shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Saved Activities
          </button>
          <button
            onClick={() => setSelectedTab("Joined")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedTab === "Joined"
                ? "bg-white text-explore-green shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Joined Activities
            {pastActivitiesNeedingReview.length > 0 && (
              <span className="ml-1 bg-yellow-500 text-white text-xs rounded-full px-1">
                {pastActivitiesNeedingReview.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        {selectedTab === "Saved" && (
          <div>
            <h2 className="text-xl font-bold text-black font-cabin mb-4">
              Upcoming Activities ({upcomingSavedActivities.length})
            </h2>
            {upcomingSavedActivities.length > 0 ? (
              upcomingSavedActivities.map((activity, index) => (
                <ActivityCard key={index} activity={activity} />
              ))
            ) : (
              <div className="text-center py-8">
                <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-cabin">
                  No upcoming saved activities
                </p>
                <Link
                  to="/explore"
                  className="text-explore-green font-medium font-cabin hover:underline"
                >
                  Explore activities to save
                </Link>
              </div>
            )}

            {pastSavedActivities.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-black font-cabin mb-4">
                  Past Activities ({pastSavedActivities.length})
                </h2>
                {pastSavedActivities.map((activity, index) => (
                  <ActivityCard key={index} activity={activity} />
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === "Joined" && (
          <div>
            {/* Organized Activities Section */}
            {organizedActivities.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-black font-cabin mb-4">
                  Your Organized Activities ({organizedActivities.length})
                </h2>
                {organizedActivities.map((activity, index) => (
                  <ActivityCard
                    key={`organized-${activity.id}-${index}`}
                    activity={activity}
                  />
                ))}
              </div>
            )}

            {/* Participated Activities Section */}
            <h2 className="text-xl font-bold text-black font-cabin mb-4">
              Joined Activities ({participatedActivities.length})
            </h2>
            {participatedActivities.length > 0 ? (
              participatedActivities.map((activity, index) => (
                <ActivityCard
                  key={`participated-${activity.id}-${index}`}
                  activity={activity}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-cabin">
                  No joined activities yet
                </p>
                <Link
                  to="/explore"
                  className="text-explore-green font-medium font-cabin hover:underline"
                >
                  Find activities to join
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Prompt Modal */}
      <ReviewPrompt
        pastActivities={pastActivitiesNeedingReview}
        onReviewSubmitted={handleReviewSubmitted}
      />

      {/* Development Tools */}
      <div className="px-6 pb-6">
        <BackendTest />
        <DemoAuth />
        <UserNav />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
