import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark } from "lucide-react";
import RequestJoinModal from "./RequestJoinModal";
import { useSavedActivities } from "../contexts/SavedActivitiesContext";
import { Activity } from "../contexts/ActivitiesContext";
import { useChat } from "../contexts/ChatContext";
import { useActivityParticipation } from "../contexts/ActivityParticipationContext";
import { useTouchFeedback, useHaptic } from "../hooks/useMobile";

interface ActivityCardProps {
  title: string;
  date: string;
  location: string;
  imageSrc: string;
  isFirstCard?: boolean;
  organizer?: string;
  type?: string;
  distance?: string;
  pace?: string;
  elevation?: string;
  difficulty?: string;
  activityId?: string;
  isOrganizerFollowed?: boolean;
  isFromUserClub?: boolean;
}

export default function ActivityCard({
  title,
  date,
  location,
  imageSrc,
  isFirstCard = false,
  organizer = "Community",
  type = "climbing",
  distance,
  pace,
  elevation,
  difficulty,
  activityId,
  isOrganizerFollowed = false,
  isFromUserClub = false,
}: ActivityCardProps) {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const navigate = useNavigate();
  const { saveActivity, unsaveActivity, isActivitySaved } =
    useSavedActivities();
  const { hasRequestedActivity } = useChat();
  const {
    joinActivity,
    leaveActivity,
    isUserParticipating,
    getParticipationStats,
    canJoinActivity,
  } = useActivityParticipation();
  const { createTouchableProps } = useTouchFeedback();
  const haptic = useHaptic();

  const currentActivityId =
    activityId || `${title}-${organizer}`.replace(/\s+/g, "-").toLowerCase();
  const isParticipating = isUserParticipating(currentActivityId);
  const participationStats = getParticipationStats(currentActivityId);
  const canJoin = canJoinActivity(currentActivityId);

  useEffect(() => {
    // Check if this activity has already been requested
    setIsRequested(hasRequestedActivity(currentActivityId));
  }, [hasRequestedActivity, currentActivityId]);

  const handleCardClick = () => {
    haptic.light();
    // Show request modal instead of navigating to activity details
    setShowRequestModal(true);
  };

  const handleRequestClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    if (isParticipating) {
      // User is already participating, allow them to leave
      haptic.medium();
      await leaveActivity(currentActivityId, title);
    } else if (canJoin && !isRequested) {
      // User can join directly
      haptic.medium();
      await joinActivity(currentActivityId, title, organizer);
    } else if (!isRequested) {
      // Activity is full or requires request
      haptic.medium();
      setShowRequestModal(true);
    }
  };

  const handleRequestSent = () => {
    haptic.success();
    setIsRequested(true);
    setShowRequestModal(false);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    if (isActivitySaved(currentActivityId)) {
      haptic.light();
      unsaveActivity(currentActivityId);
    } else {
      haptic.medium();
      // Create activity object for saving
      const activityToSave: Activity = {
        id: currentActivityId,
        type: type as "cycling" | "climbing",
        title,
        date: date.includes("📅") ? date.replace("📅 ", "") : date,
        time: "09:00", // Default time
        location: location.includes("📍")
          ? location.replace("📍", "")
          : location,
        meetupLocation: location.includes("📍")
          ? location.replace("📍", "")
          : location,
        organizer,
        distance,
        elevation,
        pace,
        maxParticipants: "10",
        specialComments: "",
        imageSrc,
        climbingLevel: difficulty,
        gender: "All genders",
        visibility: "All",
        createdAt: new Date(),
      };
      saveActivity(activityToSave);
    }
  };

  // Determine difficulty level and color
  const getDifficultyBadge = () => {
    if (!difficulty && type === "cycling") {
      if (pace && parseInt(pace) > 30)
        return { label: "Advanced", color: "bg-red-100 text-red-700" };
      if (pace && parseInt(pace) > 25)
        return {
          label: "Intermediate",
          color: "bg-yellow-100 text-yellow-700",
        };
      return { label: "Beginner", color: "bg-green-100 text-green-700" };
    }
    if (!difficulty)
      return { label: "All levels", color: "bg-gray-100 text-gray-700" };

    const level = difficulty.toLowerCase();
    if (level.includes("beginner") || level.includes("all"))
      return { label: difficulty, color: "bg-green-100 text-green-700" };
    if (level.includes("intermediate"))
      return { label: difficulty, color: "bg-yellow-100 text-yellow-700" };
    if (level.includes("advanced") || level.includes("expert"))
      return { label: difficulty, color: "bg-red-100 text-red-700" };
    return { label: difficulty, color: "bg-blue-100 text-blue-700" };
  };

  const difficultyBadge = getDifficultyBadge();

  return (
    <>
      <div
        className="min-w-72 w-72 native-card flex-shrink-0 touchable native-button-press"
        onClick={handleCardClick}
      >
        {/* Header with title, save button, and difficulty badge */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-black font-cabin text-lg line-clamp-2 leading-tight flex-1 pr-2">
            {title}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleSaveClick}
              className="p-1 hover:bg-gray-100 rounded transition-all duration-150 haptic-light"
              title={
                isActivitySaved(
                  activityId ||
                    `${title}-${organizer}`.replace(/\s+/g, "-").toLowerCase(),
                )
                  ? "Unsave activity"
                  : "Save activity"
              }
            >
              <Bookmark
                className={`w-5 h-5 ${
                  isActivitySaved(
                    activityId ||
                      `${title}-${organizer}`
                        .replace(/\s+/g, "-")
                        .toLowerCase(),
                  )
                    ? "fill-explore-green text-explore-green"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              />
            </button>
            <span
              className={`text-xs px-3 py-1 rounded-full font-cabin font-medium ${difficultyBadge.color}`}
            >
              {difficultyBadge.label}
            </span>
            {isFromUserClub && (
              <span className="text-xs px-2 py-1 rounded-full font-cabin font-medium bg-green-100 text-green-700">
                🏛️ Club
              </span>
            )}
          </div>
        </div>

        {/* Organizer info */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={imageSrc}
            alt="Organizer"
            className="w-12 h-12 rounded-full border border-black object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              if (organizer === "Coach Holly Peristiani") {
                navigate("/profile/coach-holly");
              }
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-600 font-cabin flex items-center gap-1">
              By {organizer}
              {isOrganizerFollowed && (
                <span className="text-xs text-blue-600 font-medium">👥</span>
              )}
            </div>
          </div>
        </div>

        {/* Date and Location */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">📅</span>
            <span className="text-sm text-black font-cabin">{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">📍</span>
            <span className="text-sm text-black font-cabin">{location}</span>
          </div>
        </div>

        {/* Activity Metrics */}
        {type === "cycling" && (distance || pace || elevation) && (
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              {distance && (
                <div>
                  <div className="text-xs text-gray-500 font-cabin mb-1">
                    Distance
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-yellow-600">🚴</span>
                    <span className="text-sm font-medium text-black font-cabin">
                      {distance}
                    </span>
                  </div>
                </div>
              )}
              {pace && (
                <div>
                  <div className="text-xs text-gray-500 font-cabin mb-1">
                    Pace
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-yellow-500">⚡</span>
                    <span className="text-sm font-medium text-black font-cabin">
                      {pace}
                    </span>
                  </div>
                </div>
              )}
              {elevation && (
                <div>
                  <div className="text-xs text-gray-500 font-cabin mb-1">
                    Elevation
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-green-600">⛰️</span>
                    <span className="text-sm font-medium text-black font-cabin">
                      {elevation}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Participation button */}
        <div className="w-full">
          {/* Participant count */}
          <div className="flex justify-between items-center mb-2 text-xs text-gray-600">
            <span>
              {participationStats?.current_participants ?? 0}/
              {participationStats?.max_participants ?? activity.max_participants ?? 10} participants
            </span>
            {participationStats?.is_full && (
              <span className="text-red-600 font-medium">Full</span>
            )}
          </div>

          <button
            onClick={handleRequestClick}
            disabled={isRequested && !isParticipating}
            className={`w-full native-button ${
              isRequested && !isParticipating
                ? "native-button:disabled"
                : isParticipating
                  ? "native-button-destructive"
                  : participationStats?.is_full
                    ? "native-button-secondary"
                    : ""
            }`}
          >
            {isRequested && !isParticipating
              ? "Pending"
              : isParticipating
                ? "Leave Activity"
                : participationStats?.is_full
                  ? "Request to Join"
                  : "Join Activity"}
          </button>
        </div>
      </div>

      {/* Request Modal */}
      <RequestJoinModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        activityTitle={title}
        organizerName={organizer}
        organizerImage={imageSrc}
        activityId={currentActivityId}
        onRequestSent={handleRequestSent}
      />
    </>
  );
}
