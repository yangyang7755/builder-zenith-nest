import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MapPin, Users, Star, Bookmark } from "lucide-react";
import { useActivities } from "../contexts/ActivitiesContext";
import { useSavedActivities } from "../contexts/SavedActivitiesContext";
import FilterSystem, { FilterOptions } from "../components/FilterSystem";
import MapView from "../components/MapView";
import EnhancedMapView from "../components/EnhancedMapView";
import BottomNavigation from "../components/BottomNavigation";

export default function Activities() {
  const { activities } = useActivities();
  const { saveActivity, unsaveActivity, isActivitySaved } =
    useSavedActivities();
  const location = useLocation();
  const navigate = useNavigate();
  const [showMapView, setShowMapView] = useState(false);
  const [filteredActivities, setFilteredActivities] = useState(activities);

  // Check URL parameters for specific activity filter
  const urlParams = new URLSearchParams(location.search);
  const filterParam = urlParams.get("filter");

  const [filters, setFilters] = useState<FilterOptions>({
    activityType: filterParam
      ? [filterParam.charAt(0).toUpperCase() + filterParam.slice(1)]
      : [
          "Cycling",
          "Climbing",
          "Running",
          "Hiking",
          "Skiing",
          "Surfing",
          "Tennis",
        ],
    numberOfPeople: { min: 1, max: 50 },
    location: "",
    date: { start: "", end: "" },
    gender: [],
    age: { min: 16, max: 80 },
    gear: [],
    pace: { min: 0, max: 100 },
    distance: { min: 0, max: 200 },
    elevation: { min: 0, max: 5000 },
    clubOnly: false,
  });

  const formatActivityDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const applyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleActivitySelect = (activity: any) => {
    setShowMapView(false);
  };

  useEffect(() => {
    let filtered = activities;

    // Apply comprehensive filters
    if (filters.activityType.length > 0) {
      filtered = filtered.filter((activity) =>
        filters.activityType.some(
          (type) =>
            activity.type === type.toLowerCase() ||
            (type === "Cycling" && activity.type === "cycling") ||
            (type === "Climbing" && activity.type === "climbing") ||
            (type === "Running" && activity.type === "running") ||
            (type === "Hiking" && activity.type === "hiking") ||
            (type === "Skiing" && activity.type === "skiing") ||
            (type === "Surfing" && activity.type === "surfing") ||
            (type === "Tennis" && activity.type === "tennis"),
        ),
      );
    }

    // Filter by date range
    if (filters.date.start || filters.date.end) {
      filtered = filtered.filter((activity) => {
        const activityDate = new Date(activity.date);
        const startDate = filters.date.start
          ? new Date(filters.date.start)
          : null;
        const endDate = filters.date.end ? new Date(filters.date.end) : null;

        if (startDate && activityDate < startDate) return false;
        if (endDate && activityDate > endDate) return false;
        return true;
      });
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(
        (activity) =>
          activity.location
            .toLowerCase()
            .includes(filters.location.toLowerCase()) ||
          activity.meetupLocation
            .toLowerCase()
            .includes(filters.location.toLowerCase()),
      );
    }

    // Filter by number of people
    filtered = filtered.filter((activity) => {
      const maxPeople = parseInt(activity.maxParticipants) || 50;
      return (
        maxPeople >= filters.numberOfPeople.min &&
        maxPeople <= filters.numberOfPeople.max
      );
    });

    // Filter by gender
    if (filters.gender.length > 0) {
      filtered = filtered.filter((activity) =>
        filters.gender.includes(activity.gender || "All genders"),
      );
    }

    setFilteredActivities(filtered);
  }, [activities, filters]);

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
      <div className="px-6 pb-20">
        {/* Title */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-explore-green font-cabin">
            {filterParam
              ? `${filterParam.charAt(0).toUpperCase() + filterParam.slice(1)} Activities`
              : "All Activities"}
          </h1>
        </div>

        {/* Filter System */}
        <FilterSystem
          onFiltersChange={applyFilters}
          onShowMap={() => setShowMapView(true)}
          currentFilters={filters}
        />

        {/* Activities List */}
        <div className="space-y-4 mt-6">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <Users className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No activities found
              </h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your filters or create a new activity
              </p>
              <Link
                to="/create"
                className="inline-block bg-explore-green text-white px-6 py-3 rounded-lg font-cabin font-medium hover:bg-explore-green-dark transition-colors"
              >
                Create Activity
              </Link>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                formatActivityDate={formatActivityDate}
              />
            ))
          )}
        </div>

        {/* Show sample activities if no user activities */}
        {activities.length === 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Sample Activities
            </h3>
            <div className="space-y-4">
              <SampleActivityCard
                title="Westway Women's Climbing Morning"
                type="climbing"
                date="6 August 2025"
                location="Westway Climbing Centre"
                organizer="Coach Holly Peristiani"
                participants="8/12"
                difficulty="Intermediate"
              />
              <SampleActivityCard
                title="Sunday Morning Social Ride"
                type="cycling"
                date="10 August 2025"
                location="Richmond Park"
                organizer="Richmond Cycling Club"
                participants="12/15"
                difficulty="Beginner"
                distance="25km"
              />
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Map View */}
      {showMapView && (
        <EnhancedMapView
          activities={filteredActivities}
          onClose={() => setShowMapView(false)}
          onActivitySelect={handleActivitySelect}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

function ActivityCard({
  activity,
  formatActivityDate,
}: {
  activity: any;
  formatActivityDate: (date: string) => string;
}) {
  const { saveActivity, unsaveActivity, isActivitySaved } =
    useSavedActivities();
  const navigate = useNavigate();

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isActivitySaved(activity.id)) {
      unsaveActivity(activity.id);
    } else {
      saveActivity(activity);
    }
  };

  const handleCardClick = () => {
    navigate(`/activity/${activity.id}`);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "cycling":
        return "🚴";
      case "climbing":
        return "🧗";
      case "running":
        return "🏃";
      case "hiking":
        return "🥾";
      case "skiing":
        return "🎿";
      case "surfing":
        return "🏄";
      case "tennis":
        return "🎾";
      default:
        return "⚡";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
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

  return (
    <div
      className="border-2 border-gray-200 rounded-lg p-4 bg-white cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xl">{getActivityIcon(activity.type)}</span>
          <h3 className="font-bold text-black font-cabin text-lg line-clamp-2 leading-tight flex-1">
            {activity.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleSaveClick}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title={
              isActivitySaved(activity.id) ? "Unsave activity" : "Save activity"
            }
          >
            <Bookmark
              className={`w-5 h-5 ${
                isActivitySaved(activity.id)
                  ? "fill-explore-green text-explore-green"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            />
          </button>
          {activity.difficulty && (
            <span
              className={`text-xs px-2 py-1 rounded-full font-cabin font-medium ${getDifficultyColor(activity.difficulty)}`}
            >
              {activity.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Organizer */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-gray-600 font-cabin">
          By {activity.organizer}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 font-cabin">
            📅 {formatActivityDate(activity.date)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700 font-cabin">
            {activity.location}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700 font-cabin">
            Max {activity.maxParticipants} participants
          </span>
        </div>
      </div>

      {/* Activity-specific metrics */}
      {(activity.type === "cycling" || activity.type === "running") &&
        (activity.distance || activity.pace) && (
          <div className="mt-3 flex gap-4">
            {activity.distance && (
              <div className="text-sm text-gray-600">
                {getActivityIcon(activity.type)} {activity.distance}
                {activity.distanceUnit}
              </div>
            )}
            {activity.pace && (
              <div className="text-sm text-gray-600">
                ⚡ {activity.pace} {activity.paceUnit}
              </div>
            )}
          </div>
        )}

      {activity.type === "climbing" && activity.climbingLevel && (
        <div className="mt-3">
          <div className="text-sm text-gray-600">
            🧗 Level: {activity.climbingLevel}
          </div>
        </div>
      )}

      {activity.type === "hiking" &&
        (activity.distance || activity.elevation) && (
          <div className="mt-3 flex gap-4">
            {activity.distance && (
              <div className="text-sm text-gray-600">
                🥾 {activity.distance}
                {activity.distanceUnit}
              </div>
            )}
            {activity.elevation && (
              <div className="text-sm text-gray-600">
                ⛰️ {activity.elevation}
                {activity.elevationUnit}
              </div>
            )}
          </div>
        )}

      {(activity.type === "skiing" ||
        activity.type === "surfing" ||
        activity.type === "tennis") &&
        activity.difficulty && (
          <div className="mt-3">
            <div className="text-sm text-gray-600">
              {getActivityIcon(activity.type)} {activity.difficulty} level
            </div>
          </div>
        )}
    </div>
  );
}

function SampleActivityCard({
  title,
  type,
  date,
  location,
  organizer,
  participants,
  difficulty,
  distance,
}: {
  title: string;
  type: string;
  date: string;
  location: string;
  organizer: string;
  participants: string;
  difficulty: string;
  distance?: string;
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (type === "cycling") {
      navigate("/activity/sunday-morning-ride");
    } else {
      navigate("/activity/westway-womens-climb");
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "cycling":
        return "🚴";
      case "climbing":
        return "🧗";
      case "running":
        return "🏃";
      case "hiking":
        return "🥾";
      case "skiing":
        return "🎿";
      case "surfing":
        return "🏄";
      case "tennis":
        return "🎾";
      default:
        return "⚡";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
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

  return (
    <div
      className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xl">{getActivityIcon(type)}</span>
          <h3 className="font-bold text-black font-cabin text-lg line-clamp-2 leading-tight flex-1">
            {title}
          </h3>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-cabin font-medium ${getDifficultyColor(difficulty)}`}
        >
          {difficulty}
        </span>
      </div>

      {/* Organizer */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-gray-600 font-cabin">By {organizer}</span>
      </div>

      {/* Details */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 font-cabin">📅 {date}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700 font-cabin">{location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700 font-cabin">
            {participants} participants
          </span>
        </div>
      </div>

      {distance && (
        <div className="mt-3">
          <div className="text-sm text-gray-600">
            {getActivityIcon(type)} {distance}
          </div>
        </div>
      )}
    </div>
  );
}
