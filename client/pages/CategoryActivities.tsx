import { useState, useEffect, useMemo } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sortBy, setSortBy] = useState<"date" | "popularity" | "distance" | "difficulty">("date");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [showQuickStats, setShowQuickStats] = useState(true);

  const category = searchParams.get("category") || "Recent activities nearby";
  const type = searchParams.get("type");
  const location = searchParams.get("location");

  // Enhanced activity data with more diversity for demo - memoized to prevent infinite re-renders
  const enhancedActivities = useMemo(() => [
    ...activities,
    {
      id: "demo-morning-run-1",
      title: "Richmond Park 5K Morning Run",
      type: "running",
      date: "2024-12-27",
      time: "07:00",
      location: "Richmond Park, London",
      organizer: "Richmond Running Club",
      description: "Join us for an energizing morning run through the beautiful Richmond Park. Perfect for all fitness levels!",
      participants: 12,
      maxParticipants: 20,
      difficulty: "Beginner",
      distance: "5km",
      activityType: "Running",
      meetupLocation: "Richmond Park Main Gate",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
    },
    {
      id: "demo-climbing-2",
      title: "Advanced Sport Climbing Workshop",
      type: "climbing",
      date: "2024-12-28",
      time: "14:00",
      location: "VauxWall Climbing Centre",
      organizer: "VauxWall Climbing",
      description: "Learn advanced techniques with certified instructors. Multi-pitch climbing and anchor building.",
      participants: 8,
      maxParticipants: 12,
      difficulty: "Advanced",
      activityType: "Climbing",
      meetupLocation: "VauxWall Reception",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop"
    },
    {
      id: "demo-cycling-3",
      title: "Thames Path Leisure Ride",
      type: "cycling",
      date: "2024-12-29",
      time: "10:00",
      location: "Thames Path, London",
      organizer: "Thames Cyclists",
      description: "Scenic riverside cycling with photography stops. Family-friendly pace through historic London.",
      participants: 15,
      maxParticipants: 25,
      difficulty: "Beginner",
      distance: "20km",
      activityType: "Cycling",
      meetupLocation: "London Bridge Station",
      image: "https://images.unsplash.com/photo-1517654443271-11c621d19e60?w=400&h=300&fit=crop"
    },
    {
      id: "demo-hiking-4",
      title: "Box Hill Summit Challenge",
      type: "hiking",
      date: "2024-12-30",
      time: "09:00",
      location: "Box Hill, Surrey",
      organizer: "Surrey Hikers",
      description: "Challenging hike to Box Hill summit with stunning views. Includes lunch stop at the top.",
      participants: 18,
      maxParticipants: 30,
      difficulty: "Intermediate",
      distance: "12km",
      activityType: "Hiking",
      meetupLocation: "Box Hill Car Park",
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop"
    },
    {
      id: "demo-tennis-5",
      title: "Doubles Tournament Prep",
      type: "tennis",
      date: "2024-12-31",
      time: "16:00",
      location: "Queen's Club, London",
      organizer: "London Tennis Academy",
      description: "Practice doubles strategies and techniques. Coaching included with professional instructor.",
      participants: 6,
      maxParticipants: 8,
      difficulty: "Intermediate",
      activityType: "Tennis",
      meetupLocation: "Queen's Club Reception",
      image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=300&fit=crop"
    },
    {
      id: "demo-surfing-6",
      title: "Beginner Surf Lesson",
      type: "surfing",
      date: "2025-01-02",
      time: "11:00",
      location: "Fistral Beach, Cornwall",
      organizer: "Cornwall Surf School",
      description: "Learn to surf with qualified instructors. All equipment provided including wetsuits.",
      participants: 4,
      maxParticipants: 10,
      difficulty: "Beginner",
      activityType: "Surfing",
      meetupLocation: "Fistral Beach Surf School",
      image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&h=300&fit=crop"
    }
  ], [activities]);

  useEffect(() => {
    let filtered = enhancedActivities;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(activity => {
        const organizerName = typeof activity.organizer === 'string'
          ? activity.organizer
          : activity.organizer?.full_name || activity.organizerName || '';

        return activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          organizerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.description?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Filter by category/type if specified
    if (type && type !== "all") {
      filtered = filtered.filter(activity =>
        activity.type.toLowerCase() === type.toLowerCase()
      );
    }

    // Filter by difficulty
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(activity =>
        activity.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase()
      );
    }

    // Filter by location
    if (selectedLocation !== "all") {
      filtered = filtered.filter(activity =>
        activity.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    // Filter by location proximity (from URL params)
    if (location) {
      filtered = filtered.filter(activity =>
        activity.location.toLowerCase().includes(location.toLowerCase()) ||
        activity.location.toLowerCase().includes("london") // Default area
      );
    }

    // Apply time-based filters
    if (selectedFilter !== "all") {
      const now = new Date();
      const today = new Date().toISOString().split("T")[0];

      switch (selectedFilter) {
        case "today":
          filtered = filtered.filter(activity => activity.date.startsWith(today));
          break;
        case "week":
          const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(activity =>
            new Date(activity.date) <= nextWeek &&
            new Date(activity.date) >= now
          );
          break;
        case "month":
          const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(activity =>
            new Date(activity.date) <= nextMonth &&
            new Date(activity.date) >= now
          );
          break;
      }
    }

    // Apply sorting
    switch (sortBy) {
      case "date":
        filtered = filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case "popularity":
        filtered = filtered.sort((a, b) => (b.participants || 0) - (a.participants || 0));
        break;
      case "distance":
        filtered = filtered.sort((a, b) => {
          const aDistance = parseFloat(a.distance?.replace('km', '') || '0');
          const bDistance = parseFloat(b.distance?.replace('km', '') || '0');
          return aDistance - bDistance;
        });
        break;
      case "difficulty":
        const difficultyOrder = { "Beginner": 1, "Intermediate": 2, "Advanced": 3 };
        filtered = filtered.sort((a, b) => {
          const aDiff = difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0;
          const bDiff = difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0;
          return aDiff - bDiff;
        });
        break;
    }

    setFilteredActivities(filtered);
  }, [enhancedActivities, type, location, selectedFilter, searchTerm, selectedDifficulty, selectedLocation, sortBy]);

  // Calculate quick stats
  const stats = {
    total: filteredActivities.length,
    thisWeek: filteredActivities.filter(a => {
      const activityDate = new Date(a.date);
      const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      return activityDate <= weekFromNow && activityDate >= new Date();
    }).length,
    spots: filteredActivities.reduce((sum, a) => sum + ((a.maxParticipants || 20) - (a.participants || 0)), 0),
    avgDifficulty: filteredActivities.length > 0 ?
      filteredActivities.filter(a => a.difficulty).length / filteredActivities.length * 100 : 0
  };

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

  const difficultyOptions = [
    { value: "all", label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];

  const locationOptions = [
    { value: "all", label: "All Locations" },
    { value: "london", label: "London" },
    { value: "richmond", label: "Richmond" },
    { value: "surrey", label: "Surrey" },
    { value: "cornwall", label: "Cornwall" },
  ];

  const sortOptions = [
    { value: "date", label: "Date", icon: Calendar },
    { value: "popularity", label: "Popularity", icon: TrendingUp },
    { value: "distance", label: "Distance", icon: MapPin },
    { value: "difficulty", label: "Difficulty", icon: Star },
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
      <div className="px-6 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {viewMode === "grid" ? <List className="w-5 h-5" /> : <Grid3X3 className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? "bg-explore-green text-white" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <Sliders className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search activities, organizers, locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-explore-green focus:border-transparent font-cabin"
          />
        </div>
      </div>

      {/* Quick Stats */}
      {showQuickStats && (
        <div className="px-6 py-4 bg-gradient-to-r from-explore-green/5 to-blue-50 border-b border-gray-100">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-explore-green">{stats.total}</div>
              <div className="text-xs text-gray-600 font-cabin">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.thisWeek}</div>
              <div className="text-xs text-gray-600 font-cabin">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.spots}</div>
              <div className="text-xs text-gray-600 font-cabin">Spots Left</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.round(stats.avgDifficulty)}%</div>
              <div className="text-xs text-gray-600 font-cabin">Have Info</div>
            </div>
          </div>
        </div>
      )}

      {/* Sorting */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {sortOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  sortBy === option.value
                    ? "bg-explore-green text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Advanced Filters</span>
            <button
              onClick={() => setShowQuickStats(!showQuickStats)}
              className="text-sm text-explore-green hover:text-green-600"
            >
              {showQuickStats ? "Hide Stats" : "Show Stats"}
            </button>
          </div>

          {/* Time Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Time Range</label>
            <div className="flex gap-2 overflow-x-auto">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedFilter(option.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    selectedFilter === option.value
                      ? "bg-explore-green text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Type Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Activity Type</label>
            <div className="flex gap-2 overflow-x-auto">
              {activityTypes.map((activityType) => (
                <Link
                  key={activityType.value}
                  to={`/category-activities?category=${encodeURIComponent(category)}&type=${activityType.value}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    (type || "all") === activityType.value
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {activityType.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Difficulty Level</label>
            <div className="flex gap-2 overflow-x-auto">
              {difficultyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedDifficulty(option.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    selectedDifficulty === option.value
                      ? "bg-purple-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
            <div className="flex gap-2 overflow-x-auto">
              {locationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedLocation(option.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    selectedLocation === option.value
                      ? "bg-orange-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
          <>
            {/* Results Summary */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">
                Showing {filteredActivities.length} activities
              </div>
              <div className="text-sm text-gray-500">
                Sorted by {sortOptions.find(s => s.value === sortBy)?.label}
              </div>
            </div>

            {/* Activities Grid/List */}
            <div className={viewMode === "grid" ? "grid grid-cols-2 gap-4" : "space-y-4"}>
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => navigate(`/activity/${activity.id}`)}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    viewMode === "grid"
                      ? "bg-white rounded-lg border border-gray-200 p-4"
                      : "bg-white rounded-lg border border-gray-200 p-4 hover:border-explore-green"
                  }`}
                >
                  {/* Activity Image */}
                  {viewMode === "grid" && activity.image && (
                    <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 overflow-hidden">
                      <img
                        src={activity.image}
                        alt={activity.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Activity Content */}
                  <div className={viewMode === "grid" ? "" : "flex gap-4"}>
                    {viewMode === "list" && activity.image && (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                        <img
                          src={activity.image}
                          alt={activity.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`font-bold text-black font-cabin ${
                          viewMode === "grid" ? "text-sm" : "text-lg"
                        } line-clamp-2`}>
                          {activity.title}
                        </h3>
                        {activity.difficulty && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            activity.difficulty === "Beginner" ? "bg-green-100 text-green-700" :
                            activity.difficulty === "Intermediate" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {activity.difficulty}
                          </span>
                        )}
                      </div>

                      {/* Organizer */}
                      <p className={`text-explore-green font-cabin font-medium ${
                        viewMode === "grid" ? "text-xs" : "text-sm"
                      } mb-2`}>
                        {typeof activity.organizer === 'string'
                          ? activity.organizer
                          : activity.organizer?.full_name || activity.organizerName || "Unknown Organizer"}
                      </p>

                      {/* Description (list view only) */}
                      {viewMode === "list" && activity.description && (
                        <p className="text-sm text-gray-600 font-cabin mb-2 line-clamp-2">
                          {activity.description}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className={`space-y-1 ${viewMode === "grid" ? "text-xs" : "text-sm"}`}>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-3 h-3" />
                          <span className="font-cabin">
                            {new Date(activity.date).toLocaleDateString()} at {activity.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span className="font-cabin line-clamp-1">{activity.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users className="w-3 h-3" />
                          <span className="font-cabin">
                            {activity.participants || 0}/{activity.maxParticipants || 20} joined
                          </span>
                        </div>
                        {activity.distance && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="w-3 h-3" />
                            <span className="font-cabin">{activity.distance}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      {viewMode === "list" && (
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {activity.participants && activity.maxParticipants && (
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-explore-green h-2 rounded-full"
                                  style={{
                                    width: `${Math.min((activity.participants / activity.maxParticipants) * 100, 100)}%`
                                  }}
                                />
                              </div>
                            )}
                            <span className="text-xs text-gray-500">
                              {activity.maxParticipants && activity.participants
                                ? Math.max(0, activity.maxParticipants - activity.participants)
                                : "~"} spots left
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Join logic here
                            }}
                            className="px-3 py-1 bg-explore-green text-white text-xs rounded-full hover:bg-green-600 transition-colors"
                          >
                            Join
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
