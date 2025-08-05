import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, MapPin, Users, Clock, Filter, Search, Sliders, Calendar, Star, TrendingUp, Grid3X3, List } from "lucide-react";
import { useActivities } from "../contexts/ActivitiesContext";
import ActivityCard from "../components/ActivityCard";
import BottomNavigation from "../components/BottomNavigation";

export default function CategoryActivities() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activities } = useActivities();
  const [filteredActivities, setFilteredActivities] = useState(activities);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const category = searchParams.get("category") || "Recent activities nearby";
  const type = searchParams.get("type");
  const location = searchParams.get("location");

  useEffect(() => {
    let filtered = activities;

    // Filter by category/type if specified
    if (type && type !== "all") {
      filtered = filtered.filter(
        (activity) => activity.type.toLowerCase() === type.toLowerCase(),
      );
    }

    // Filter by location proximity (mock implementation)
    if (location) {
      filtered = filtered.filter(
        (activity) =>
          activity.location.toLowerCase().includes(location.toLowerCase()) ||
          activity.location.toLowerCase().includes("london"), // Default area
      );
    }

    // Sort by date (upcoming first)
    filtered = filtered.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Apply additional filters
    if (selectedFilter !== "all") {
      switch (selectedFilter) {
        case "today":
          const today = new Date().toISOString().split("T")[0];
          filtered = filtered.filter((activity) =>
            activity.date.startsWith(today),
          );
          break;
        case "week":
          const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(
            (activity) =>
              new Date(activity.date) <= nextWeek &&
              new Date(activity.date) >= new Date(),
          );
          break;
        case "month":
          const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(
            (activity) =>
              new Date(activity.date) <= nextMonth &&
              new Date(activity.date) >= new Date(),
          );
          break;
      }
    }

    setFilteredActivities(filtered);
  }, [activities, type, location, selectedFilter]);

  const filterOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
  ];

  const activityTypes = [
    { value: "all", label: "All Types" },
    { value: "cycling", label: "Cycling" },
    { value: "climbing", label: "Climbing" },
    { value: "running", label: "Running" },
    { value: "hiking", label: "Hiking" },
    { value: "skiing", label: "Skiing" },
    { value: "surfing", label: "Surfing" },
    { value: "tennis", label: "Tennis" },
  ];

  return (
    <div className="min-h-screen bg-white font-cabin max-w-md mx-auto">
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

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="w-6 h-6 text-black" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-black font-cabin">
              {category}
            </h1>
            <p className="text-sm text-gray-500 font-cabin">
              {filteredActivities.length} activities found
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
        </div>

        {/* Time Filter */}
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedFilter(option.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedFilter === option.value
                  ? "bg-explore-green text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 overflow-x-auto">
          {activityTypes.map((activityType) => (
            <Link
              key={activityType.value}
              to={`/category-activities?category=${encodeURIComponent(category)}&type=${activityType.value}`}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                (type || "all") === activityType.value
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {activityType.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Activities List */}
      <div className="px-6 pb-20">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No activities found
            </h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your filters or check back later for new activities.
            </p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 bg-explore-green text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              Create Activity
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
