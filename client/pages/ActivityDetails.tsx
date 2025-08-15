import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import {
  MapPin,
  Clock,
  AlertTriangle,
  Info,
  X,
  Calendar,
  Users,
  Target,
  Trophy,
  Bookmark,
  ExternalLink,
} from "lucide-react";
import { useChat } from "../contexts/ChatContext";
import BottomNavigation from "../components/BottomNavigation";
import { useSavedActivities } from "../contexts/SavedActivitiesContext";
import { useActivities } from "../contexts/ActivitiesContext";
import { useActivityParticipation } from "../contexts/ActivityParticipationContext";
import { useUserProfile } from "../contexts/UserProfileContext";
import ReviewModal from "../components/ReviewModal";

// No static data - activities come from backend only

export default function ActivityDetails() {
  const navigate = useNavigate();
  const { activityId } = useParams();
  const { addJoinRequest } = useChat();
  const { saveActivity, unsaveActivity, isActivitySaved } =
    useSavedActivities();
  const {
    joinActivity,
    leaveActivity,
    isUserParticipating,
    getParticipationStats,
    canJoinActivity,
  } = useActivityParticipation();
  const { currentUserProfile } = useUserProfile();
  const [agreedToRequirements, setAgreedToRequirements] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const { activities } = useActivities();

  // Get activity data from backend activities only
  const activity = activities.find((a) => a.id === activityId);

  // Get participation status for the current activity
  const currentActivityId = activityId || activity?.id;
  const isParticipating = currentActivityId
    ? isUserParticipating(currentActivityId)
    : false;
  const participationStats = currentActivityId
    ? getParticipationStats(currentActivityId)
    : null;
  const canJoin = currentActivityId
    ? canJoinActivity(currentActivityId)
    : false;

  useEffect(() => {
    if (!activity) {
      navigate("/explore");
    }
  }, [activity, navigate]);

  if (!activity) {
    return null;
  }

  const handleJoinActivity = async () => {
    if (!currentActivityId) return;

    if (isParticipating) {
      // Leave activity
      try {
        await leaveActivity(currentActivityId);
        alert("You have left this activity.");
      } catch (error) {
        alert("Failed to leave activity. Please try again.");
      }
    } else {
      // Join activity
      const hasRequirements = activity.requirements || activity.activity_data?.requirements;
      if (hasRequirements && !agreedToRequirements) {
        alert("Please agree to the requirements before joining.");
        return;
      }

      try {
        await joinActivity(currentActivityId);
        alert("Successfully joined the activity!");
      } catch (error) {
        alert("Failed to join activity. Please try again.");
      }
    }
  };

  const handleSendRequest = () => {
    addJoinRequest({
      activityTitle: activity.title,
      activityOrganizer:
        typeof activity.organizer === "string"
          ? activity.organizer
          : activity.organizer?.name || "Unknown Organizer",
      requesterName: "You",
      message: requestMessage || "Hi! I'd like to join this activity.",
    });

    setShowRequestModal(false);
    setRequestMessage("");
    alert("Request sent! You can check your message in the Chat page.");
    navigate("/chat");
  };

  const getDifficultyColor = (difficulty: string | undefined) => {
    if (!difficulty) return "bg-gray-100 text-gray-700";

    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-700";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700";
      case "advanced":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Check if activity date has passed
  const hasActivityPassed = () => {
    if (!activity) return false;

    // Extract date from activity schedule or use activity.date if available
    let activityDate: Date;

    if (activity.date && activity.time) {
      // If activity has date and time properties (from backend)
      activityDate = new Date(`${activity.date}T${activity.time}`);
    } else if (activity.schedule) {
      // Parse date from schedule string (for static data)
      // Examples: "Wednesday, August 6th, 10:00-12:00 AM" or "Friday, August 16th, 7:00 AM"
      const scheduleStr = activity.schedule;

      // For demo, manually parse some known dates
      if (scheduleStr.includes("August 6th")) {
        activityDate = new Date("2025-08-06T10:00:00");
      } else if (scheduleStr.includes("August 16th")) {
        activityDate = new Date("2025-08-16T07:00:00");
      } else if (scheduleStr.includes("September 6-7th")) {
        activityDate = new Date("2025-09-06T09:00:00");
      } else {
        // Default to a future date if we can't parse
        activityDate = new Date("2025-12-31T23:59:59");
      }
    } else {
      return false;
    }

    // Check if activity date + 1 day has passed (so reviews are available the day after)
    const now = new Date();
    const dayAfterActivity = new Date(activityDate);
    dayAfterActivity.setDate(dayAfterActivity.getDate() + 1);

    return now > dayAfterActivity;
  };

  const handleReviewSubmitted = () => {
    // Refresh activity data if needed
    console.log("Review submitted for activity:", activity.id);
  };

  const handleSaveActivity = () => {
    if (!activity) return;

    // Create a simplified activity object for saving
    const activityToSave = {
      id: activity.id,
      title: activity.title,
      type: activity.type,
      date: "2025-08-06", // Use appropriate date from the schedule
      time: "10:00", // Extract time from schedule
      location: activity.location,
      organizer:
        typeof activity.organizer === "string"
          ? activity.organizer
          : activity.organizer?.name || "Unknown Organizer",
      difficulty: activity.difficulty,
      maxParticipants: activity.capacity?.toString() || "N/A",
      imageSrc:
        typeof activity.organizer === "string"
          ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
          : activity.organizer?.image,
      specialComments: "",
      gender: "All genders",
      visibility: "All",
      createdAt: new Date(),
    };

    if (isActivitySaved(activity.id)) {
      unsaveActivity(activity.id);
    } else {
      saveActivity(activityToSave);
    }
  };

  return (
    <div className="min-h-screen bg-white font-cabin max-w-md mx-auto relative">
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
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mt-4 mb-4 text-explore-green font-cabin"
        >
          ← Back to activities
        </button>

        {/* Title and Difficulty */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-3">
            <h1 className="text-2xl font-bold text-explore-green font-cabin leading-tight flex-1 pr-4">
              {activity.title}
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveActivity}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title={
                  isActivitySaved(activity.id)
                    ? "Unsave activity"
                    : "Save activity"
                }
              >
                <Bookmark
                  className={`w-6 h-6 ${
                    isActivitySaved(activity.id)
                      ? "fill-explore-green text-explore-green"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                />
              </button>
              {(activity.difficulty || activity.difficulty_level) && (
                <span
                  className={`text-sm px-3 py-1 rounded-full font-cabin font-medium ${getDifficultyColor(activity.difficulty || activity.difficulty_level)}`}
                >
                  {activity.difficulty || (activity.difficulty_level && activity.difficulty_level.charAt(0).toUpperCase() + activity.difficulty_level.slice(1))}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Organizer Section */}
        <div
          className="flex items-center gap-3 mb-6 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
          onClick={() => {
            const organizerName =
              typeof activity.organizer === "string"
                ? activity.organizer
                : activity.organizer?.name;
            if (organizerName === "Coach Holly Peristiani") {
              navigate("/profile/coach-holly");
            }
          }}
        >
          <img
            src={
              typeof activity.organizer === "string"
                ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" // Default avatar
                : activity.organizer?.image || activity.organizer?.profile_image || activity.imageSrc ||
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
            }
            alt={
              typeof activity.organizer === "string"
                ? activity.organizer
                : activity.organizer?.name || activity.organizer?.full_name || activity.organizerName || "Organizer"
            }
            className="w-12 h-12 rounded-full border border-black object-cover"
          />
          <div>
            <h2 className="text-lg font-bold text-black font-cabin">
              {typeof activity.organizer === "string"
                ? activity.organizer
                : activity.organizer?.name || activity.organizer?.full_name || activity.organizerName || "Unknown Organizer"}
            </h2>
            {(typeof activity.organizer === "string"
              ? activity.organizer
              : activity.organizer?.name) === "Coach Holly Peristiani" && (
              <p className="text-xs text-gray-500 font-cabin">
                Click to view profile
              </p>
            )}
          </div>
        </div>

        {/* Description Section */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-black font-cabin mb-3">
            Description
          </h3>
          <p className="text-sm text-black font-cabin leading-relaxed">
            {activity.description || activity.specialComments || activity.special_requirements || activity.activity_data?.description || "No description provided."}
          </p>
        </div>

        {/* Activity Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Location */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-1">
              <MapPin className="w-5 h-5 text-red-500" />
              <h3 className="text-xl font-bold text-black font-cabin">
                Location
              </h3>
            </div>
            <p className="text-sm text-gray-600 font-cabin ml-8">
              {activity.location || activity.meetupLocation}
            </p>
          </div>

          {/* Time */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-1">
              <Clock className="w-5 h-5 text-gray-400" />
              <h3 className="text-xl font-bold text-black font-cabin">Time</h3>
            </div>
            <p className="text-sm text-black font-cabin ml-8">
              {activity.date && activity.time
                ? `${activity.date}, ${activity.time}`
                : activity.date_time
                  ? new Date(activity.date_time).toLocaleString()
                  : activity.id === "westway-womens-climb"
                    ? "Every Wednesday, 10:00-12:00 AM"
                    : activity.schedule}
            </p>
          </div>

          {/* Capacity */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-500" />
              <h4 className="text-lg font-bold text-black font-cabin">
                Capacity
              </h4>
            </div>
            <p className="text-sm text-black font-cabin ml-6">
              {(participationStats?.current_participants ??
                activity.current_participants ??
                activity.currentParticipants ??
                0)}
              /
              {activity.max_participants ||
                activity.maxParticipants ||
                activity.capacity ||
                "N/A"}{" "}
              joined
            </p>
          </div>

          {/* Activity-specific details */}
          {(activity.type === "cycling" || activity.type === "running") && (
            <>
              {((activity.distance || activity.activity_data?.distance) ||
                (activity.distance && activity.distanceUnit)) && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-green-500" />
                    <h4 className="text-lg font-bold text-black font-cabin">
                      Distance
                    </h4>
                  </div>
                  <p className="text-sm text-black font-cabin ml-6">
                    {activity.distance && activity.distanceUnit
                      ? `${activity.distance} ${activity.distanceUnit}`
                      : activity.activity_data?.distance
                        ? `${activity.activity_data.distance} ${activity.activity_data.distanceUnit || 'km'}`
                        : activity.distance}
                  </p>
                </div>
              )}
              {((activity.pace || activity.activity_data?.pace) ||
                (activity.pace && activity.paceUnit)) && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-500">⚡</span>
                    <h4 className="text-lg font-bold text-black font-cabin">
                      Pace
                    </h4>
                  </div>
                  <p className="text-sm text-black font-cabin ml-6">
                    {activity.pace && activity.paceUnit
                      ? `${activity.pace} ${activity.paceUnit}`
                      : activity.activity_data?.pace
                        ? `${activity.activity_data.pace} ${activity.activity_data.paceUnit || 'kph'}`
                        : activity.pace}
                  </p>
                </div>
              )}
              {((activity.elevation || activity.activity_data?.elevation) ||
                (activity.elevation && activity.elevationUnit)) && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-green-600">⛰️</span>
                    <h4 className="text-lg font-bold text-black font-cabin">
                      Elevation
                    </h4>
                  </div>
                  <p className="text-sm text-black font-cabin ml-6">
                    {activity.elevation && activity.elevationUnit
                      ? `${activity.elevation} ${activity.elevationUnit}`
                      : activity.activity_data?.elevation
                        ? `${activity.activity_data.elevation} ${activity.activity_data.elevationUnit || 'm'}`
                        : activity.elevation}
                  </p>
                </div>
              )}
            </>
          )}

          {activity.type === "hiking" && (
            <>
              {activity.distance && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-green-500" />
                    <h4 className="text-lg font-bold text-black font-cabin">
                      Distance
                    </h4>
                  </div>
                  <p className="text-sm text-black font-cabin ml-6">
                    {activity.distance}
                  </p>
                </div>
              )}
              {activity.elevation && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-green-600">⛰️</span>
                    <h4 className="text-lg font-bold text-black font-cabin">
                      Elevation
                    </h4>
                  </div>
                  <p className="text-sm text-black font-cabin ml-6">
                    {activity.elevation}
                  </p>
                </div>
              )}
            </>
          )}

          {activity.type === "climbing" && activity.gradeRange && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-purple-500" />
                <h4 className="text-lg font-bold text-black font-cabin">
                  Grade Range
                </h4>
              </div>
              <p className="text-sm text-black font-cabin ml-6">
                {activity.gradeRange}
              </p>
            </div>
          )}
        </div>

        {/* Route Links Section */}
        {(activity.routeLink || activity.route_link || activity.activity_data?.routeLink) && (
          <div className="mb-6">
            <h3 className="text-xl font-bold text-black font-cabin mb-3">
              Route Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-600" />
                <a
                  href={activity.routeLink || activity.route_link || activity.activity_data?.routeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-cabin text-blue-600 hover:text-blue-800 underline"
                >
                  View {activity.type || activity.activity_type} route
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        {(activity.fee ||
          activity.accommodation ||
          activity.transport ||
          activity.cafeStop ||
          activity.route ||
          activity.trainingFocus ||
          activity.terrain ||
          activity.meetupPoint ||
          activity.equipment ||
          activity.skiPass ||
          activity.waveHeight ||
          activity.tideInfo ||
          activity.format ||
          activity.prizes ||
          activity.courtSurface ||
          activity.refreshments ||
          activity.activity_data?.waterTemp ||
          activity.activity_data?.liftPass ||
          activity.activity_data?.snowConditions ||
          activity.activity_data?.waveConditions ||
          activity.activity_data?.skillLevel ||
          activity.activity_data?.duration ||
          activity.activity_data?.hikingType ||
          activity.activity_data?.surfingType) && (
          <div className="mb-6">
            <h3 className="text-xl font-bold text-black font-cabin mb-3">
              Additional Information
            </h3>
            <div className="space-y-2">
              {activity.fee && (
                <div className="flex items-center gap-2">
                  <span className="text-green-600">💰</span>
                  <span className="text-sm font-cabin">
                    Fee: {activity.fee}
                  </span>
                </div>
              )}
              {activity.accommodation && (
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">🏕️</span>
                  <span className="text-sm font-cabin">
                    Accommodation: {activity.accommodation}
                  </span>
                </div>
              )}
              {activity.transport && (
                <div className="flex items-center gap-2">
                  <span className="text-orange-600">🚐</span>
                  <span className="text-sm font-cabin">
                    Transport: {activity.transport}
                  </span>
                </div>
              )}
              {(activity.cafeStop || activity.activity_data?.cafeStop) && (
                <div className="flex items-center gap-2">
                  <span className="text-brown-600">☕</span>
                  <span className="text-sm font-cabin">
                    Cafe stop: {activity.cafeStop || activity.activity_data?.cafeStop}
                  </span>
                </div>
              )}
              {activity.route && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">🗺️</span>
                  <span className="text-sm font-cabin">
                    Route: {activity.route}
                  </span>
                </div>
              )}
              {activity.trainingFocus && (
                <div className="flex items-center gap-2">
                  <span className="text-red-600">🎯</span>
                  <span className="text-sm font-cabin">
                    Focus: {activity.trainingFocus}
                  </span>
                </div>
              )}
              {activity.terrain && (
                <div className="flex items-center gap-2">
                  <span className="text-green-600">🌲</span>
                  <span className="text-sm font-cabin">
                    Terrain: {activity.terrain}
                  </span>
                </div>
              )}
              {activity.meetupPoint && (
                <div className="flex items-center gap-2">
                  <span className="text-red-600">📍</span>
                  <span className="text-sm font-cabin">
                    Meetup: {activity.meetupPoint}
                  </span>
                </div>
              )}
              {activity.equipment && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">🎒</span>
                  <span className="text-sm font-cabin">
                    Equipment: {activity.equipment}
                  </span>
                </div>
              )}
              {activity.skiPass && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">⛷️</span>
                  <span className="text-sm font-cabin">
                    Ski pass: {activity.skiPass}
                  </span>
                </div>
              )}
              {activity.waveHeight && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">🌊</span>
                  <span className="text-sm font-cabin">
                    Waves: {activity.waveHeight}
                  </span>
                </div>
              )}
              {activity.tideInfo && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">🌊</span>
                  <span className="text-sm font-cabin">
                    Tide: {activity.tideInfo}
                  </span>
                </div>
              )}
              {activity.format && (
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">🏆</span>
                  <span className="text-sm font-cabin">
                    Format: {activity.format}
                  </span>
                </div>
              )}
              {activity.prizes && (
                <div className="flex items-center gap-2">
                  <span className="text-gold-600">🏅</span>
                  <span className="text-sm font-cabin">
                    Prizes: {activity.prizes}
                  </span>
                </div>
              )}
              {activity.courtSurface && (
                <div className="flex items-center gap-2">
                  <span className="text-green-600">🎾</span>
                  <span className="text-sm font-cabin">
                    Courts: {activity.courtSurface}
                  </span>
                </div>
              )}
              {activity.refreshments && (
                <div className="flex items-center gap-2">
                  <span className="text-orange-600">🍽️</span>
                  <span className="text-sm font-cabin">
                    Food: {activity.refreshments}
                  </span>
                </div>
              )}
              {(activity.activity_data?.waterTemp) && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">🌡️</span>
                  <span className="text-sm font-cabin">
                    Water temp: {activity.activity_data.waterTemp}°C
                  </span>
                </div>
              )}
              {(activity.activity_data?.liftPass) && (
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">🎫</span>
                  <span className="text-sm font-cabin">
                    Lift pass: {activity.activity_data.liftPass}
                  </span>
                </div>
              )}
              {(activity.activity_data?.snowConditions) && (
                <div className="flex items-center gap-2">
                  <span className="text-white">❄️</span>
                  <span className="text-sm font-cabin">
                    Snow: {activity.activity_data.snowConditions}
                  </span>
                </div>
              )}
              {(activity.activity_data?.waveConditions) && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">🌊</span>
                  <span className="text-sm font-cabin">
                    Conditions: {activity.activity_data.waveConditions}
                  </span>
                </div>
              )}
              {(activity.activity_data?.duration) && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">⏱️</span>
                  <span className="text-sm font-cabin">
                    Duration: {activity.activity_data.duration} minutes
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {activity.tags && activity.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-bold text-black font-cabin mb-3">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {activity.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-explore-green bg-opacity-10 text-explore-green px-3 py-1 rounded-full font-cabin"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Requirements Section */}
        {(activity.requirements || activity.activity_data?.requirements) && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <h3 className="text-xl font-bold text-black font-cabin">
                Requirements
              </h3>
            </div>
            <div className="ml-8 relative">
              <p className="text-sm text-black font-cabin mb-6">
                Participants must be{" "}
                <span
                  className="underline cursor-pointer"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  {(activity.requirements || activity.activity_data?.requirements)?.title}
                </span>{" "}
                <Info className="inline w-4 h-4 text-gray-400" />.
              </p>

              {/* Tooltip positioned outside the paragraph */}
              {showTooltip && (activity.requirements || activity.activity_data?.requirements)?.details && (
                <div className="absolute left-0 top-16 bg-explore-green text-white p-4 rounded-lg shadow-lg z-50 w-80 text-sm font-cabin">
                  <div className="font-bold text-base mb-2">
                    Requirements Details
                  </div>
                  <div className="mb-2">
                    To join this session, you should be able to:
                  </div>
                  <ul className="space-y-1 mb-3">
                    {((activity.requirements || activity.activity_data?.requirements)?.details || []).map((detail, index) => (
                      <li key={index}>• {detail}</li>
                    ))}
                  </ul>
                  {(activity.requirements || activity.activity_data?.requirements)?.warning && (
                    <div className="flex items-start gap-2 bg-yellow-500 bg-opacity-20 p-2 rounded">
                      <span className="text-yellow-300 font-bold">���</span>
                      <div className="text-sm">
                        {(activity.requirements || activity.activity_data?.requirements)?.warning}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Checkbox */}
              <div className="flex items-start gap-3 mb-8">
                <input
                  type="checkbox"
                  id="requirements-agreement"
                  checked={agreedToRequirements}
                  onChange={(e) => setAgreedToRequirements(e.target.checked)}
                  className="w-4 h-4 mt-0.5 border-2 border-gray-300 rounded"
                />
                <label
                  htmlFor="requirements-agreement"
                  className="text-sm text-black font-cabin cursor-pointer"
                >
                  I agree I adhere to the requirements{" "}
                  <Info className="inline w-4 h-4 text-gray-400" />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Request to Join Button or Review Button */}
        {hasActivityPassed() && isParticipating ? (
          <button
            onClick={() => setShowReviewModal(true)}
            className="w-full py-3 rounded-lg text-lg font-cabin font-medium bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
          >
            Leave a Review
          </button>
        ) : hasActivityPassed() && !isParticipating ? (
          <div className="w-full py-3 rounded-lg text-lg font-cabin font-medium bg-gray-300 text-gray-500 text-center">
            Activity Completed
          </div>
        ) : (
          <button
            onClick={handleJoinActivity}
            disabled={!isParticipating && (activity.requirements || activity.activity_data?.requirements) && !agreedToRequirements}
            className={`w-full py-3 rounded-lg text-lg font-cabin font-medium transition-colors ${
              isParticipating
                ? "bg-red-500 text-white hover:bg-red-600"
                : (activity.requirements || activity.activity_data?.requirements) ?
                    (agreedToRequirements ? "bg-explore-green text-white hover:bg-explore-green-light" : "bg-gray-300 text-gray-500 cursor-not-allowed")
                  : "bg-explore-green text-white hover:bg-explore-green-light"
            }`}
          >
            {isParticipating ? "Leave Activity" : "Join Activity"}
          </button>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-explore-green font-cabin">
                Send Request
              </h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 font-cabin mb-3">
                Send a message to{" "}
                {typeof activity.organizer === "string"
                  ? activity.organizer
                  : activity.organizer?.name || "organizer"}{" "}
                (optional):
              </p>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Hi! I'd like to join this activity..."
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin h-24 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 py-3 border-2 border-gray-300 rounded-lg text-gray-600 font-cabin font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSendRequest}
                className="flex-1 py-3 bg-explore-green text-white rounded-lg font-cabin font-medium"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        activity={{
          id: activity.id,
          title: activity.title,
          organizer_id: "demo-organizer-id", // In real app, this would come from activity data
          organizer_name:
            typeof activity.organizer === "string"
              ? activity.organizer
              : activity.organizer?.name || "Organizer",
        }}
        onReviewSubmitted={handleReviewSubmitted}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
