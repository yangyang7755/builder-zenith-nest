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

// Comprehensive activity data structure
const activitiesData = {
  "westway-womens-climb": {
    id: "westway-womens-climb",
    type: "climbing",
    title: "Westway women's+ climbing morning",
    organizer: {
      name: "Coach Holly Peristiani",
      image:
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=80&h=80&fit=crop&crop=face",
    },
    description:
      "This session is perfect for meeting fellow climbers and boosting your confidence. Holly can provide expert tips on top-roping, lead climbing, abseiling, fall practice and more. Standard entry fees apply.",
    location: "Westway Climbing Centre",
    schedule: "Wednesday, August 6th, 10:00-12:00 AM",
    difficulty: "Intermediate",
    requirements: {
      title: "competent top-rope climbers",
      details: [
        "Tie into a harness using a figure-eight knot",
        "Belay using an appropriate device (e.g. GriGri, ATC)",
        "Perform safety checks and communicate clearly",
        "Catch falls and lower a partner safely",
      ],
      warning:
        "If you're unsure about any of the above, please check with a coach or ask in advance. This ensures a safe and enjoyable session for everyone.",
    },
    tags: ["Top rope", "Lead climbing", "Coaching", "Women's+"],
    capacity: 12,
    currentParticipants: 8,
    fee: "Standard entry",
  },
  "sunday-morning-ride": {
    id: "sunday-morning-ride",
    type: "cycling",
    title: "Sunday Morning Social Ride",
    organizer: {
      name: "Richmond Cycling Club",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    description:
      "Join us for a friendly social ride through Richmond Park and surrounding areas. Perfect for cyclists looking to meet new people and explore beautiful routes. Coffee stop included at Roehampton Cafe.",
    location: "Richmond Park Main Gate",
    schedule: "Sunday, August 10th, 8:00 AM",
    difficulty: "Beginner",
    distance: "25km",
    pace: "20 kph",
    elevation: "150m",
    requirements: {
      title: "road bike and helmet required",
      details: [
        "Road bike in good working condition",
        "Helmet mandatory for all participants",
        "Basic bike maintenance knowledge helpful",
        "Ability to ride 25km at moderate pace",
      ],
      warning:
        "Please ensure your bike is roadworthy and bring a spare tube and basic tools.",
    },
    tags: ["Social", "Coffee stop", "Scenic route", "All levels"],
    capacity: 15,
    currentParticipants: 12,
    route: "Richmond Park → Kingston → Roehampton",
    cafeStop: "Roehampton Cafe",
  },
  "chaingang-training": {
    id: "chaingang-training",
    type: "cycling",
    title: "Intermediate Chaingang",
    organizer: {
      name: "Surrey Road Cycling",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    description:
      "High-intensity training session for intermediate to advanced cyclists. We'll focus on paceline skills, hill repeats, and interval training. This is a structured workout designed to improve your cycling performance.",
    location: "Box Hill, Surrey",
    schedule: "Tuesday, August 12th, 6:30 PM",
    difficulty: "Intermediate",
    distance: "40km",
    pace: "32 kph",
    elevation: "420m",
    requirements: {
      title: "intermediate cycling experience",
      details: [
        "Comfortable maintaining 30+ kph on flats",
        "Experience riding in groups",
        "Good bike handling skills",
        "Able to ride for 1.5+ hours continuously",
      ],
      warning:
        "This is a demanding training session. Please ensure you're adequately fit and experienced.",
    },
    tags: ["Training", "High intensity", "Group riding", "Hill climbs"],
    capacity: 12,
    currentParticipants: 9,
    trainingFocus: "Power & climbing",
  },
  "peak-district-climb": {
    id: "peak-district-climb",
    type: "climbing",
    title: "Peak District Sport Climbing",
    organizer: {
      name: "Peak Adventures",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    description:
      "Weekend climbing adventure in the Peak District. We'll tackle some classic sport routes at Stanage Edge and Burbage. Perfect for those looking to transition from indoor to outdoor climbing or improve their outdoor skills.",
    location: "Stanage Edge & Burbage",
    schedule: "Weekend, September 6-7th",
    difficulty: "Advanced",
    requirements: {
      title: "experienced indoor climbers",
      details: [
        "Comfortable leading 6a+ routes indoors",
        "Basic outdoor climbing experience preferred",
        "Own climbing shoes and harness",
        "Comfortable with multi-pitch belaying",
      ],
      warning:
        "Outdoor climbing involves additional risks. Weather conditions may affect the trip.",
    },
    tags: ["Outdoor", "Sport climbing", "Weekend trip", "Camping"],
    capacity: 8,
    currentParticipants: 6,
    accommodation: "Camping included",
    transport: "Minibus from London",
    gradeRange: "E1 - E4 / 5.6 - 5.10",
  },
  "morning-trail-run": {
    id: "morning-trail-run",
    type: "running",
    title: "Richmond Park Morning Trail Run",
    organizer: {
      name: "Richmond Runners",
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=40&h=40&fit=crop&crop=face",
    },
    description:
      "Join us for an energizing trail run through the beautiful paths of Richmond Park. Perfect for intermediate runners looking to improve their trail running skills and meet like-minded fitness enthusiasts.",
    location: "Richmond Park",
    schedule: "Friday, August 16th, 7:00 AM",
    difficulty: "Intermediate",
    distance: "8km",
    pace: "5:30 min/km",
    requirements: {
      title: "intermediate running fitness",
      details: [
        "Comfortable running 5km continuously",
        "Trail running shoes recommended",
        "Basic experience with uneven terrain",
        "Ability to maintain conversational pace",
      ],
      warning:
        "Trail running involves uneven surfaces and potential hazards. Please run within your ability level.",
    },
    tags: ["Trail running", "Morning", "Fitness", "Nature"],
    capacity: 20,
    currentParticipants: 14,
    terrain: "Mixed trails and paths",
    meetupPoint: "Roehampton Gate",
  },
  "lake-district-hike": {
    id: "lake-district-hike",
    type: "hiking",
    title: "Lake District Day Hike - Helvellyn",
    organizer: {
      name: "Lake District Hiking Club",
      image:
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=40&h=40&fit=crop&crop=face",
    },
    description:
      "Challenging day hike up Helvellyn via Striding Edge. Experience the thrill of one of England's most famous ridge walks with stunning views across the Lake District. This is a full day adventure for experienced hikers.",
    location: "Lake District - Helvellyn",
    schedule: "Saturday, August 23rd, 8:00 AM",
    difficulty: "Advanced",
    distance: "12km",
    elevation: "950m",
    requirements: {
      title: "experienced mountain hikers",
      details: [
        "Comfortable hiking 10+ km with elevation gain",
        "Proper hiking boots with ankle support",
        "Experience with scrambling and exposure",
        "Good physical fitness and endurance",
      ],
      warning:
        "Striding Edge involves scrambling and exposure. Weather conditions can change rapidly in mountains.",
    },
    tags: ["Mountain hiking", "Scrambling", "Adventure", "Lake District"],
    capacity: 15,
    currentParticipants: 11,
    route: "Glenridding → Striding Edge → Helvellyn → Swirral Edge",
    equipment: "Full hiking kit required",
  },
  "alps-skiing-weekend": {
    id: "alps-skiing-weekend",
    type: "skiing",
    title: "French Alps Skiing Weekend",
    organizer: {
      name: "Alpine Adventures UK",
      image:
        "https://images.unsplash.com/photo-1551524164-6cf2ac426081?w=40&h=40&fit=crop&crop=face",
    },
    description:
      "Weekend skiing adventure in Chamonix with stunning views of Mont Blanc. All skill levels welcome with expert instruction available. Equipment rental included. Transport and accommodation arranged.",
    location: "Chamonix, French Alps",
    schedule: "Weekend, September 14-15th",
    difficulty: "Intermediate",
    requirements: {
      title: "basic skiing ability",
      details: [
        "Comfortable on blue runs",
        "Basic snow plow and parallel turns",
        "Valid passport for travel",
        "Travel insurance recommended",
      ],
      warning:
        "Mountain skiing involves inherent risks. Weather conditions may affect skiing plans.",
    },
    tags: ["Alpine skiing", "Weekend trip", "Mont Blanc", "All levels"],
    capacity: 12,
    currentParticipants: 8,
    accommodation: "Chamonix hotel included",
    transport: "Coach from London",
    skiPass: "2-day lift pass included",
    equipment: "Rental available on-site",
  },
  "cornwall-surf-session": {
    id: "cornwall-surf-session",
    type: "surfing",
    title: "Cornwall Dawn Patrol Surf",
    organizer: {
      name: "Cornwall Surf Collective",
      image:
        "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=40&h=40&fit=crop&crop=face",
    },
    description:
      "Early morning surf session at one of Cornwall's most famous breaks. Perfect waves for intermediate surfers. Experience the magic of dawn patrol surfing with cleaner conditions and fewer crowds.",
    location: "Fistral Beach, Cornwall",
    schedule: "Saturday, August 30th, 6:30 AM",
    difficulty: "Intermediate",
    requirements: {
      title: "intermediate surfing skills",
      details: [
        "Comfortable paddling in ocean conditions",
        "Able to catch and ride unbroken waves",
        "Strong swimming ability essential",
        "Basic surf etiquette knowledge",
      ],
      warning:
        "Ocean surfing involves strong currents and changing conditions. Always respect the ocean and local conditions.",
    },
    tags: ["Dawn patrol", "Ocean surfing", "Cornwall", "Beach break"],
    capacity: 10,
    currentParticipants: 7,
    waveHeight: "3-4 feet predicted",
    tideInfo: "High tide at 7:15 AM",
    equipment: "Wetsuit and board rental available",
  },
  "wimbledon-tennis-singles": {
    id: "wimbledon-tennis-singles",
    type: "tennis",
    title: "Competitive Singles Tournament",
    organizer: {
      name: "London Tennis League",
      image:
        "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=40&h=40&fit=crop&crop=face",
    },
    description:
      "Competitive singles tournament for advanced players. Round-robin format followed by knockout stages. Prizes for winners and refreshments provided. Great opportunity to test your skills against quality opposition.",
    location: "Wimbledon Tennis Club",
    schedule: "Saturday, September 21st, 10:00 AM",
    difficulty: "Advanced",
    requirements: {
      title: "advanced tennis players",
      details: [
        "Consistent serve and groundstrokes",
        "Match play experience required",
        "Own tennis racquet essential",
        "Appropriate tennis attire (whites preferred)",
      ],
      warning:
        "This is a competitive tournament. Please ensure you're match fit and prepared for intensive play.",
    },
    tags: ["Tournament", "Competitive", "Singles", "Prizes"],
    capacity: 16,
    currentParticipants: 12,
    format: "Round-robin followed by knockout",
    prizes: "Trophies for top 3 finishers",
    courtSurface: "Grass courts",
    refreshments: "Lunch and refreshments provided",
  },
};

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

  // Get activity data from context first, then fallback to static data
  const contextActivity = activities.find((a) => a.id === activityId);
  const staticActivity = activityId
    ? activitiesData[activityId as keyof typeof activitiesData]
    : null;

  // Prefer context activity data (user-created activities) over static data
  const activity = contextActivity || staticActivity;

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
      if (!agreedToRequirements) {
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
              {activity.difficulty && (
                <span
                  className={`text-sm px-3 py-1 rounded-full font-cabin font-medium ${getDifficultyColor(activity.difficulty)}`}
                >
                  {activity.difficulty}
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
            {activity.description || activity.specialComments || activity.special_requirements || "No description provided."}
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
              {participationStats?.participantCount ||
                activity.currentParticipants ||
                "0"}
              /
              {contextActivity?.max_participants ||
                contextActivity?.maxParticipants ||
                activity.capacity ||
                "N/A"}{" "}
              joined
            </p>
          </div>

          {/* Activity-specific details */}
          {(activity.type === "cycling" || activity.type === "running") && (
            <>
              {(activity.distance ||
                (contextActivity?.distance &&
                  contextActivity?.distanceUnit)) && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-green-500" />
                    <h4 className="text-lg font-bold text-black font-cabin">
                      Distance
                    </h4>
                  </div>
                  <p className="text-sm text-black font-cabin ml-6">
                    {contextActivity
                      ? `${contextActivity.distance} ${contextActivity.distanceUnit}`
                      : activity.distance}
                  </p>
                </div>
              )}
              {(activity.pace ||
                (contextActivity?.pace && contextActivity?.paceUnit)) && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-500">⚡</span>
                    <h4 className="text-lg font-bold text-black font-cabin">
                      Pace
                    </h4>
                  </div>
                  <p className="text-sm text-black font-cabin ml-6">
                    {contextActivity
                      ? `${contextActivity.pace} ${contextActivity.paceUnit}`
                      : activity.pace}
                  </p>
                </div>
              )}
              {(activity.elevation ||
                (contextActivity?.elevation &&
                  contextActivity?.elevationUnit)) && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-green-600">⛰️</span>
                    <h4 className="text-lg font-bold text-black font-cabin">
                      Elevation
                    </h4>
                  </div>
                  <p className="text-sm text-black font-cabin ml-6">
                    {contextActivity
                      ? `${contextActivity.elevation} ${contextActivity.elevationUnit}`
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
        {(contextActivity?.routeLink || activity.routeLink) && (
          <div className="mb-6">
            <h3 className="text-xl font-bold text-black font-cabin mb-3">
              Route Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-600" />
                <a
                  href={contextActivity?.routeLink || activity.routeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-cabin text-blue-600 hover:text-blue-800 underline"
                >
                  View {activity.type} route
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        {(activity.fee ||
          activity.accommodation ||
          activity.transport ||
          contextActivity?.cafeStop ||
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
          activity.refreshments) && (
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
              {(contextActivity?.cafeStop || activity.cafeStop) && (
                <div className="flex items-center gap-2">
                  <span className="text-brown-600">☕</span>
                  <span className="text-sm font-cabin">
                    Cafe stop: {contextActivity?.cafeStop || activity.cafeStop}
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
                  <span className="text-blue-600">��</span>
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
        {activity.requirements && (
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
                  {activity.requirements.title}
                </span>{" "}
                <Info className="inline w-4 h-4 text-gray-400" />.
              </p>

              {/* Tooltip positioned outside the paragraph */}
              {showTooltip && activity.requirements.details && (
                <div className="absolute left-0 top-16 bg-explore-green text-white p-4 rounded-lg shadow-lg z-50 w-80 text-sm font-cabin">
                  <div className="font-bold text-base mb-2">
                    Requirements Details
                  </div>
                  <div className="mb-2">
                    To join this session, you should be able to:
                  </div>
                  <ul className="space-y-1 mb-3">
                    {activity.requirements.details.map((detail, index) => (
                      <li key={index}>• {detail}</li>
                    ))}
                  </ul>
                  {activity.requirements.warning && (
                    <div className="flex items-start gap-2 bg-yellow-500 bg-opacity-20 p-2 rounded">
                      <span className="text-yellow-300 font-bold">⚠</span>
                      <div className="text-sm">
                        {activity.requirements.warning}
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
            disabled={!isParticipating && !agreedToRequirements}
            className={`w-full py-3 rounded-lg text-lg font-cabin font-medium transition-colors ${
              isParticipating
                ? "bg-red-500 text-white hover:bg-red-600"
                : agreedToRequirements
                  ? "bg-explore-green text-white hover:bg-explore-green-light"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
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
