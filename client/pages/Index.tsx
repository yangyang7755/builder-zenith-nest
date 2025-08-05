import { Search, Menu, MapPin, ChevronDown, X, PartyPopper } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useActivities } from "../contexts/ActivitiesContext";
import { useOnboarding } from "../contexts/OnboardingContext";
import { useClub } from "../contexts/ClubContext";
import { useChat } from "../contexts/ChatContext";
import { useSavedActivities } from "../contexts/SavedActivitiesContext";
import { useActivityParticipation } from "../contexts/ActivityParticipationContext";
import { useFollow } from "../contexts/FollowContext";
import { useClubMembership } from "../contexts/ClubMembershipContext";
import FilterSystem, { FilterOptions } from "../components/FilterSystem";
import MapView from "../components/MapView";
import ActivityCard from "../components/ActivityCard";
import RequestJoinModal from "../components/RequestJoinModal";
import BottomNavigation from "../components/BottomNavigation";
import { FloatingSettingsButton } from "../components/FloatingSettingsButton";
import { usePullToRefresh, useDeviceInfo, useHaptic } from "../hooks/useMobile";

// Mock coordinates for demo locations
const LOCATION_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  "westway climbing centre": { lat: 51.5200, lng: -0.2375 },
  "richmond park": { lat: 51.4545, lng: -0.2727 },
  "stanage edge": { lat: 53.3403, lng: -1.6286 },
  "oxford": { lat: 51.7520, lng: -1.2577 },
  "london": { lat: 51.5074, lng: -0.1278 },
  "peak district": { lat: 53.3403, lng: -1.6286 },
  "hampstead heath": { lat: 51.5557, lng: -0.1657 },
  "regents park": { lat: 51.5268, lng: -0.1554 }
};

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lng1: number, locationName: string): number {
  const locationKey = locationName.toLowerCase();
  const coords = LOCATION_COORDINATES[locationKey];

  if (!coords) {
    // If we don't have coordinates for this location, assume it's within range
    return 0;
  }

  const lat2 = coords.lat;
  const lng2 = coords.lng;

  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  return distance;
}

export default function Index() {
  const { activities, searchActivities, loading, error, refreshActivities, createActivity } = useActivities();
  const { showWelcomeMessage, dismissWelcomeMessage, userProfile } = useOnboarding();
  const { getUserClubs, isClubMember } = useClub();
  const { savedActivities, isActivitySaved } = useSavedActivities();
  const { getParticipationStatus, getUserParticipatedActivities } = useActivityParticipation();
  const { following, isFollowing } = useFollow();
  const {
    getUserClubs: getUserMemberships,
    isClubMember: isMemberOfClub,
    getClubMembers
  } = useClubMembership();
  const [searchParams] = useSearchParams();

  const formatActivityDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredActivities, setFilteredActivities] = useState(activities);
  const [isSearching, setIsSearching] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(
    "Notting hill, London",
  );
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    activityType: ["Cycling", "Climbing"],
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

  // Mobile functionality
  const deviceInfo = useDeviceInfo();
  const haptic = useHaptic();
  const { elementRef: pullRefreshRef, isRefreshing } = usePullToRefresh(
    async () => {
      haptic.light();
      await refreshActivities();
    }
  );

  const applyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  // Get activities from followed users
  const getActivitiesFromFollowedUsers = () => {
    if (following.length === 0) return [];

    const followedUserIds = following.map(rel => rel.following_id);
    const followedUserNames = following.map(rel => rel.following?.full_name).filter(Boolean);

    return activities.filter(activity => {
      // Check if organizer is a followed user by ID or name
      const organizerId = activity.organizer_id || activity.organizer?.id;
      const organizerName = activity.organizer?.full_name || activity.organizerName;

      return followedUserIds.includes(organizerId) ||
             followedUserNames.includes(organizerName);
    });
  };

  const activitiesFromFollowedUsers = getActivitiesFromFollowedUsers();

  // Helper function to check if organizer is followed
  const isOrganizerFollowed = (activity: any) => {
    const organizerId = activity.organizer_id || activity.organizer?.id;
    const organizerName = activity.organizer?.full_name || activity.organizerName;

    return following.some(rel =>
      rel.following_id === organizerId ||
      rel.following?.full_name === organizerName
    );
  };

  // Get activities from user's clubs
  const getActivitiesFromUserClubs = () => {
    const userClubs = getUserMemberships();
    if (userClubs.length === 0) return [];

    const userClubIds = userClubs.map(membership => membership.club_id);
    const userClubNames = userClubs.map(membership => membership.club_name);

    return activities.filter(activity => {
      // Check if activity is associated with a club the user is a member of
      const activityClubId = activity.club_id;
      const activityClubName = activity.club?.name;

      return userClubIds.includes(activityClubId) ||
             userClubNames.includes(activityClubName);
    });
  };

  const activitiesFromUserClubs = getActivitiesFromUserClubs();

  // Helper function to check if activity is from user's club
  const isFromUserClub = (activity: any) => {
    const userClubs = getUserMemberships();
    const userClubIds = userClubs.map(membership => membership.club_id);
    const userClubNames = userClubs.map(membership => membership.club_name);

    return userClubIds.includes(activity.club_id) ||
           userClubNames.includes(activity.club?.name);
  };

  // Handle clubOnly query parameter
  useEffect(() => {
    const clubOnly = searchParams.get('clubOnly');
    if (clubOnly === 'true') {
      setFilters(prev => ({ ...prev, clubOnly: true }));
    }
  }, [searchParams]);

  const handleActivitySelect = (activity: any) => {
    setShowMapView(false);
    // Navigate to activity details if needed
  };

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Use reverse geocoding to get location name (simplified version)
          const locationName = `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
          setCurrentLocation(`Current Location (${locationName})`);
          setShowLocationModal(false);
        } catch (error) {
          setCurrentLocation("Current Location");
          setShowLocationModal(false);
        }
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        alert(
          "Unable to get your location. Please check your location settings.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  };

  const handleLocationChange = (newLocation: string) => {
    setCurrentLocation(newLocation);
    setShowLocationModal(false);
  };

  useEffect(() => {
    let filtered = activities;

    if (searchQuery.trim()) {
      filtered = searchActivities(searchQuery);
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }

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

    // Filter by location (text search)
    if (filters.location && !filters.location.includes("Current Location")) {
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

    // Filter by location distance (if current location is set)
    if (filters.location && filters.location.includes("Current Location") && filters.locationRange) {
      // Extract coordinates from current location string
      const coordMatch = filters.location.match(/\(([-\d.]+),\s*([-\d.]+)\)/);
      if (coordMatch) {
        const userLat = parseFloat(coordMatch[1]);
        const userLng = parseFloat(coordMatch[2]);

        filtered = filtered.filter((activity) => {
          const distance = calculateDistance(userLat, userLng, activity.location);
          return distance <= filters.locationRange;
        });
      }
    }

    // Filter by number of people
    filtered = filtered.filter((activity) => {
      const maxPeople = parseInt(activity.maxParticipants) || 50;
      return (
        maxPeople >= filters.numberOfPeople.min &&
        maxPeople <= filters.numberOfPeople.max
      );
    });

    // Filter by gender - "Female only" is exclusive filter
    if (filters.gender.length > 0) {
      if (filters.gender.includes("Female only")) {
        // When "Female only" is selected, show only female-only activities
        filtered = filtered.filter((activity) =>
          activity.gender === "Female only"
        );
      } else {
        // When "Female only" is NOT selected, show all non-female-only activities
        filtered = filtered.filter((activity) =>
          activity.gender !== "Female only" || filters.gender.includes(activity.gender || "All genders")
        );
      }
    }

    // Filter by club only
    if (filters.clubOnly) {
      const userClubIds = getUserClubs().map(club => club.id);
      filtered = filtered.filter((activity) => {
        // Show activities that are either:
        // 1. Created by members of clubs the user belongs to
        // 2. Explicitly tagged with a club the user is a member of
        if (activity.club && userClubIds.includes(activity.club)) {
          return true;
        }

        // Check if the activity organizer is from one of the user's clubs
        // This would require additional logic to map organizers to clubs
        // For now, just filter by explicit club tags
        return false;
      });
    }

    setFilteredActivities(filtered);
  }, [searchQuery, activities, searchActivities, filters]);

  const handleSearchClick = () => {
    const searchInput = document.getElementById(
      "search-input",
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  };

  const testCreateActivity = async () => {
    console.log("Testing activity creation...");

    const testActivity = {
      title: "Test Backend Activity",
      type: "climbing",
      date: "2025-02-15",
      time: "14:00",
      location: "Test Location",
      meetup_location: "Test Meetup Point",
      max_participants: 10,
      special_comments: "This is a test activity created through the backend API",
      difficulty: "Beginner",
    };

    const result = await createActivity(testActivity);

    if (result.success) {
      alert("✅ Activity created successfully in backend!");
    } else {
      alert(`❌ Failed to create activity: ${result.error}`);
    }
  };

  return (
    <div ref={pullRefreshRef} className="react-native-container bg-white font-cabin relative native-scroll">
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

      {/* Pull to refresh indicator */}
      <div className="pull-refresh">
        <div className="native-spinner"></div>
      </div>

      {/* Main Content */}
      <div className="px-3 pb-20">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-3xl font-bold text-explore-green font-cabin">
            Explore!
          </h1>

          {/* Backend Status Indicator */}
          <div className="mt-2 flex items-center justify-center gap-2 text-sm">
            {loading ? (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600">Loading activities...</span>
              </>
            ) : error ? (
              <>
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">Using demo data</span>
                <button
                  onClick={refreshActivities}
                  className="text-explore-green hover:underline ml-2"
                >
                  Retry
                </button>
                <button
                  onClick={testCreateActivity}
                  className="text-blue-600 hover:underline ml-2"
                >
                  Test Create
                </button>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Connected to backend</span>
              </>
            )}
          </div>
        </div>

        {/* Location Selector */}
        <button
          onClick={() => setShowLocationModal(true)}
          className="flex items-center gap-2 mb-6 w-full hover:bg-gray-50 p-2 rounded-lg transition-colors"
        >
          <MapPin className="w-6 h-6 text-black" />
          <div className="flex-1 text-left">
            <div className="text-xs text-black font-poppins">
              Chosen location
            </div>
            <div className="text-sm text-explore-text-light font-poppins">
              {currentLocation}
            </div>
          </div>
          <ChevronDown className="w-6 h-6 text-black" />
        </button>

        {/* Filter System */}
        <FilterSystem
          onFiltersChange={applyFilters}
          onShowMap={() => setShowMapView(true)}
          currentFilters={filters}
        />

        {/* Cycling-Focused Activities Section */}
        {!isSearching &&
        filters.activityType.length === 1 &&
        filters.activityType.includes("Cycling") ? (
          <CyclingExploreSection />
        ) : !isSearching &&
          filters.activityType.length === 1 &&
          filters.activityType.includes("Climbing") ? (
          <ClimbingExploreSection />
        ) : (
          /* Mixed Activities Section */
          <MixedActivitiesSection
            filters={filters}
            filteredActivities={filteredActivities}
            isSearching={isSearching}
            searchQuery={searchQuery}
            activities={activities}
            formatActivityDate={formatActivityDate}
            activitiesFromFollowedUsers={activitiesFromFollowedUsers}
            activitiesFromUserClubs={activitiesFromUserClubs}
            isOrganizerFollowed={isOrganizerFollowed}
            isFromUserClub={isFromUserClub}
          />
        )}

        {/* Partner Requests Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-black font-poppins">
              Partner requests
            </h2>
            <Link
              to="/activities"
              className="text-sm text-black underline font-poppins"
            >
              See all
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <PartnerCard
              id="partner-1"
              title="Looking for a belay partner..."
              name="Sarah K."
              age={28}
              climbingLevel="5.9-5.11"
              date="📅 Friday evenings"
              location="📍 Westway Climbing Centre"
              description="Looking for a regular climbing partner for Friday evening sessions. I'm working on lead climbing and could use someone experienced."
              availability="Fridays 6-9pm"
              experience="2 years indoor, 6 months outdoor"
              imageSrc="https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=40&h=40&fit=crop&crop=face"
            />
            <PartnerCard
              id="partner-2"
              title="Climbing buddy needed!"
              name="Alex M."
              age={35}
              climbingLevel="V4-V6 Bouldering"
              date="📅 Monday evenings"
              location="📍 The Castle Climbing Centre"
              description="Experienced boulderer looking for motivation and someone to work projects with. Happy to share beta and spot!"
              availability="Monday & Wednesday 7-10pm"
              experience="5 years climbing, love outdoor bouldering"
              imageSrc="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
            />
            <PartnerCard
              id="partner-3"
              title="Lead climbing partner wanted"
              name="Emma R."
              age={26}
              climbingLevel="6a-6c Sport"
              date="📅 Weekend mornings"
              location="📍 VauxWall East"
              description="Keen sport climber seeking a reliable partner for weekend sessions. Planning outdoor trips to Portland and Peak District."
              availability="Saturdays 9am-1pm"
              experience="3 years indoor, outdoor certified"
              imageSrc="https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=40&h=40&fit=crop&crop=face"
            />
          </div>
        </div>

        {/* My Clubs Section */}
        <div className="mb-6">
          <h2 className="text-base font-semibold text-black font-poppins mb-3">
            Your clubs & communities
          </h2>
          <div className="flex gap-4 justify-start">
            <ClubLogo
              src="https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2Fcce50dcf455a49d6aa9a7694c8a58f26?format=webp&width=800"
              alt="Westway climbing gym"
              isMember={true}
              clubId="westway"
            />
            <ClubLogo
              src="https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F2ef8190dcf74499ba685f251b701545c?format=webp&width=800"
              alt="Oxford university cycling club"
              isMember={true}
              clubId="oxford-cycling"
            />
          </div>
        </div>

        {/* Discover More Clubs Section */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-black font-poppins mb-3">
            Discover local clubs
          </h2>
          <div className="flex gap-4 justify-start flex-wrap">
            <ClubLogo
              src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=70&h=70&fit=crop"
              alt="Rapha Cycling Club London"
              isMember={false}
              clubId="rapha-cycling"
            />
            <ClubLogo
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=70&h=70&fit=crop"
              alt="VauxWall East Climbing Centre"
              isMember={false}
              clubId="vauxwall-climbing"
            />
            <ClubLogo
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=70&h=70&fit=crop"
              alt="Richmond Park Runners"
              isMember={false}
              clubId="richmond-runners"
            />
            <ClubLogo
              src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=70&h=70&fit=crop"
              alt="Thames Path Cyclists"
              isMember={false}
              clubId="thames-cyclists"
            />
          </div>
          <p className="text-xs text-gray-500 font-cabin mt-2">
            Request to join clubs to see their activities and events
          </p>
        </div>

        {/* Car Sharing Section */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-black font-poppins mb-3">
            Car sharing for trips
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <CarShareCard
              destination="Peak District"
              date="📅 10 August 2025"
              time="7:00 AM"
              driver="Mike Johnson"
              availableSeats={3}
              cost="£15 per person"
              imageSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
              carShareId="peak-district"
            />
            <CarShareCard
              destination="Snowdonia"
              date="📅 17 August 2025"
              time="6:00 AM"
              driver="Sarah Chen"
              availableSeats={2}
              cost="£25 per person"
              imageSrc="https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=40&h=40&fit=crop&crop=face"
              carShareId="snowdonia"
            />
            <CarShareCard
              destination="Brighton Beach"
              date="📅 24 August 2025"
              time="8:00 AM"
              driver="Alex Rodriguez"
              availableSeats={4}
              cost="£12 per person"
              imageSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
              carShareId="brighton-beach"
            />
            <CarShareCard
              destination="Lake District"
              date="📅 31 August 2025"
              time="7:30 AM"
              driver="Emma Wilson"
              availableSeats={3}
              cost="£18 per person"
              imageSrc="https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=40&h=40&fit=crop&crop=face"
              carShareId="lake-district"
            />
            <CarShareCard
              destination="Wales Coast"
              date="📅 7 September 2025"
              time="6:30 AM"
              driver="David Brown"
              availableSeats={2}
              cost="£22 per person"
              imageSrc="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
              carShareId="wales-coast"
            />
          </div>
          <p className="text-xs text-gray-500 font-cabin mt-2">
            Share transport costs and meet fellow adventurers
          </p>
        </div>
      </div>

      {/* Location Selection Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-black font-cabin mb-2">
                Choose Location
              </h3>
              <p className="text-gray-600 font-cabin">
                Select your preferred location for finding activities
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={requestCurrentLocation}
                disabled={isGettingLocation}
                className="w-full py-3 bg-explore-green text-white rounded-lg font-cabin font-medium hover:bg-explore-green-dark transition-colors flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                {isGettingLocation
                  ? "Getting location..."
                  : "Use Current Location"}
              </button>

              <div className="text-center text-sm text-gray-500 font-cabin">
                or choose from popular areas
              </div>

              {[
                "Notting hill, London",
                "Shoreditch, London",
                "Camden, London",
                "Westminster, London",
                "Canary Wharf, London",
                "Greenwich, London",
                "Richmond, London",
                "Clapham, London",
              ].map((location) => (
                <button
                  key={location}
                  onClick={() => handleLocationChange(location)}
                  className="w-full py-2 text-left px-3 rounded-lg hover:bg-gray-100 transition-colors font-cabin"
                >
                  {location}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowLocationModal(false)}
              className="w-full py-2 text-gray-500 font-cabin hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Map View */}
      {showMapView && (
        <MapView
          activities={filteredActivities}
          onClose={() => setShowMapView(false)}
          onActivitySelect={handleActivitySelect}
        />
      )}

      {/* Welcome Message Modal */}
      {showWelcomeMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-lg w-full max-w-sm text-center p-6 relative">
            <div className="mb-4">
              <PartyPopper className="w-16 h-16 text-explore-green mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-explore-green font-cabin mb-2">
                Welcome to Explore!
              </h2>
              <p className="text-gray-700 font-cabin mb-4">
                Thanks for completing onboarding{userProfile.name && `, ${userProfile.name}`}!
                Now you can explore the different clubs and activities.
              </p>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600 font-cabin">
                  �� <strong>Discover</strong> activities that match your interests<br/>
                  🤝 <strong>Connect</strong> with like-minded people<br/>
                  🏆 <strong>Join</strong> clubs and events near you
                </p>
              </div>
            </div>
            <button
              onClick={dismissWelcomeMessage}
              className="w-full bg-explore-green text-white py-3 rounded-lg font-cabin font-medium hover:bg-green-600 transition-colors"
            >
              Start Exploring!
            </button>
          </div>
        </div>
      )}

      {/* Floating Settings Button */}
      <FloatingSettingsButton show={!showMapView} />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

function MixedActivitiesSection({
  filters,
  filteredActivities,
  isSearching,
  searchQuery,
  activities,
  formatActivityDate,
  activitiesFromFollowedUsers,
  activitiesFromUserClubs,
  isOrganizerFollowed,
  isFromUserClub,
}: {
  filters: any;
  filteredActivities: any[];
  isSearching: boolean;
  searchQuery: string;
  activities: any[];
  formatActivityDate: (dateStr: string) => string;
  activitiesFromFollowedUsers: any[];
  activitiesFromUserClubs: any[];
  isOrganizerFollowed: (activity: any) => boolean;
  isFromUserClub: (activity: any) => boolean;
}) {
  // Mixed activities with alternating cycling and climbing
  const mixedActivities = [
    // Climbing activity
    {
      title: "Westway women's+ climbing morning",
      date: `📅 ${formatActivityDate("2025-01-26")}`,
      location: "📍 London, UK",
      imageSrc:
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop&crop=face",
      type: "climbing",
      organizer: "Coach Holly Peristiani",
      difficulty: "Intermediate",
      isFirstCard: true,
    },
    // Cycling activity
    {
      title: "Sunday Morning Social Ride",
      date: `📅 ${formatActivityDate("2025-02-02")}`,
      location: "📍 Richmond Park, London",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      organizer: "Richmond Cycling Club",
      type: "cycling",
      distance: "25km",
      pace: "20 kph",
      elevation: "150m",
      difficulty: "Beginner",
    },
    // Climbing activity
    {
      title: "Sport climbing trip",
      date: `📅 ${formatActivityDate("2025-02-15")}`,
      location: "📍 Malham Cove, UK",
      imageSrc:
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop&crop=face",
      type: "climbing",
      organizer: "Peak Adventures",
      difficulty: "Advanced",
    },
    // Cycling activity
    {
      title: "Intermediate Chaingang",
      date: `📅 ${formatActivityDate("2025-01-28")}`,
      location: "📍 Box Hill, Surrey",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      type: "cycling",
      organizer: "Surrey Road Cycling",
      distance: "40km",
      pace: "32 kph",
      elevation: "420m",
      difficulty: "Intermediate",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Recent Activities Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black font-poppins">
            {isSearching
              ? `Search Results (${filteredActivities.length})`
              : "Recent activities nearby"}
          </h2>
          {!isSearching && (
            <Link
              to="/activities"
              className="text-sm text-black underline font-poppins"
            >
              See all
            </Link>
          )}
        </div>

        {/* No Activities Message */}
        {!isSearching && filteredActivities.length === 0 && (
          <div className="text-center py-4 text-gray-500 font-cabin">
            Change filters to see more activities...
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2">
          {/* Show mixed activities or search results */}
          {isSearching ? (
            filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500 w-full">
                No activities found matching "{searchQuery}"
              </div>
            ) : (
              filteredActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  title={activity.title}
                  date={`📅 ${activity.date}`}
                  location={`📍 ${activity.location}`}
                  imageSrc={
                    activity.imageSrc ||
                    "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop&crop=face"
                  }
                  organizer={activity.organizer?.full_name || activity.organizerName || "Community"}
                  type={activity.type}
                  distance={activity.distance}
                  pace={activity.pace}
                  elevation={activity.elevation}
                  difficulty="Intermediate"
                  activityId={activity.id}
                  isOrganizerFollowed={isOrganizerFollowed(activity)}
                  isFromUserClub={isFromUserClub(activity)}
                />
              ))
            )
          ) : (
            <>
              {/* Mixed default activities */}
              {mixedActivities
                .filter((activity) =>
                  filters.activityType.some(
                    (type) =>
                      type.toLowerCase() === activity.type ||
                      (type === "Cycling" && activity.type === "cycling") ||
                      (type === "Climbing" && activity.type === "climbing") ||
                      (type === "Running" && activity.type === "running"),
                  ),
                )
                .map((activity, index) => (
                  <ActivityCard
                    key={index}
                    title={activity.title}
                    date={activity.date}
                    location={activity.location}
                    imageSrc={activity.imageSrc}
                    organizer={activity.organizer?.full_name || activity.organizerName || "Community"}
                    type={activity.type}
                    distance={activity.distance}
                    pace={activity.pace}
                    elevation={activity.elevation}
                    difficulty={activity.difficulty}
                    isFirstCard={activity.isFirstCard}
                    activityId={
                      activity.type === "climbing"
                        ? "westway-womens-climb"
                        : activity.type === "cycling"
                          ? "sunday-morning-ride"
                          : "westway-womens-climb"
                    }
                  />
                ))}

              {/* User created activities */}
              {activities.slice(0, 2).map((activity) => (
                <ActivityCard
                  key={activity.id}
                  title={activity.title}
                  date={`📅 ${formatActivityDate(activity.date)}`}
                  location={`📍 ${activity.location}`}
                  imageSrc={
                    activity.imageSrc ||
                    "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop&crop=face"
                  }
                  organizer={activity.organizer?.full_name || activity.organizerName || "Community"}
                  type={activity.type}
                  distance={activity.distance}
                  pace={activity.pace}
                  elevation={activity.elevation}
                  difficulty="Intermediate"
                  activityId={activity.id}
                  isOrganizerFollowed={isOrganizerFollowed(activity)}
                  isFromUserClub={isFromUserClub(activity)}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Activities from Followed Users Section */}
      {!isSearching && activitiesFromFollowedUsers.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-black font-poppins">
              From people you follow ({activitiesFromFollowedUsers.length})
            </h2>
            <Link
              to="/activities"
              className="text-sm text-black underline font-poppins"
            >
              See all
            </Link>
          </div>
          <div className="space-y-4">
            {activitiesFromFollowedUsers.slice(0, 3).map((activity) => (
              <div key={activity.id} className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                    👥 Following
                  </div>
                </div>
                <ActivityCard
                  title={activity.title}
                  date={`📅 ${formatActivityDate(activity.date)}`}
                  location={`📍 ${activity.location}`}
                  imageSrc={
                    activity.imageSrc ||
                    activity.organizer?.profile_image ||
                    "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop&crop=face"
                  }
                  organizer={activity.organizer?.full_name || activity.organizerName || "Community"}
                  type={activity.type || activity.activity_type}
                  distance={activity.distance}
                  pace={activity.pace}
                  elevation={activity.elevation}
                  difficulty={activity.difficulty_level || activity.difficulty || "Intermediate"}
                  activityId={activity.id}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activities from User's Clubs Section */}
      {!isSearching && activitiesFromUserClubs.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-black font-poppins">
              From your clubs ({activitiesFromUserClubs.length})
            </h2>
            <Link
              to="/activities"
              className="text-sm text-black underline font-poppins"
            >
              See all
            </Link>
          </div>
          <div className="space-y-4">
            {activitiesFromUserClubs.slice(0, 3).map((activity) => (
              <div key={activity.id} className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                    🏛️ Club
                  </div>
                </div>
                <ActivityCard
                  title={activity.title}
                  date={`📅 ${formatActivityDate(activity.date)}`}
                  location={`📍 ${activity.location}`}
                  imageSrc={
                    activity.imageSrc ||
                    activity.club?.profile_image ||
                    "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop&crop=face"
                  }
                  organizer={activity.organizer?.full_name || activity.organizerName || "Community"}
                  type={activity.type || activity.activity_type}
                  distance={activity.distance}
                  pace={activity.pace}
                  elevation={activity.elevation}
                  difficulty={activity.difficulty_level || activity.difficulty || "Intermediate"}
                  activityId={activity.id}
                  isOrganizerFollowed={isOrganizerFollowed(activity)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cycling Activities Section */}
      {!isSearching && filters.activityType.includes("Cycling") && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-black font-poppins">
              Cycling Activities
            </h2>
            <Link
              to="/activities?filter=cycling"
              className="text-sm text-black underline font-poppins"
            >
              See all
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {mixedActivities
              .filter((activity) => activity.type === "cycling")
              .slice(0, 2)
              .map((activity, index) => (
                <ActivityCard
                  key={`cycling-${index}`}
                  title={activity.title}
                  date={activity.date}
                  location={activity.location}
                  imageSrc={activity.imageSrc}
                  organizer={activity.organizer?.full_name || activity.organizerName || "Community"}
                  type={activity.type}
                  distance={activity.distance}
                  pace={activity.pace}
                  elevation={activity.elevation}
                  difficulty={activity.difficulty}
                  activityId={
                    index === 0 ? "sunday-morning-ride" : "chaingang-training"
                  }
                />
              ))}
          </div>
        </div>
      )}

      {/* Climbing Activities Section */}
      {!isSearching && filters.activityType.includes("Climbing") && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-black font-poppins">
              Climbing Activities
            </h2>
            <Link
              to="/activities?filter=climbing"
              className="text-sm text-black underline font-poppins"
            >
              See all
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {mixedActivities
              .filter((activity) => activity.type === "climbing")
              .slice(0, 2)
              .map((activity, index) => (
                <ActivityCard
                  key={`climbing-${index}`}
                  title={activity.title}
                  date={activity.date}
                  location={activity.location}
                  imageSrc={activity.imageSrc}
                  organizer={activity.organizer?.full_name || activity.organizerName || "Community"}
                  type={activity.type}
                  difficulty={activity.difficulty}
                  isFirstCard={activity.isFirstCard}
                  activityId={
                    index === 0 ? "westway-womens-climb" : "peak-district-climb"
                  }
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ClimbingExploreSection() {
  const partnerRequests = [
    {
      title: "Looking for belay partner",
      date: "📅 Tonight, 7:00 PM",
      location: "📍Westway Climbing Centre",
      organizer: "Sarah Chen",
      grade: "5.9 - 5.11a",
      discipline: "Top rope",
      level: "Intermediate",
      imageSrc:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
    },
    {
      title: "Lead climbing session",
      date: "📅 Friday evenings",
      location: "📍The Castle Climbing Centre",
      organizer: "Alex Rodriguez",
      grade: "6a - 6c",
      discipline: "Lead climbing",
      level: "Advanced",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
  ];

  const gymActivities = [
    {
      title: "Women's+ Climbing Morning",
      date: "📅 Every Wednesday, 10:00 AM",
      location: "📍Westway Climbing Centre",
      organizer: "Coach Holly Peristiani",
      grade: "Competent top-rope climbers",
      discipline: "Top rope coaching",
      level: "All levels",
      fee: "Standard entry",
      imageSrc:
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop&crop=face",
    },
    {
      title: "Bouldering Competition Training",
      date: "📅 Saturday, 2:00 PM",
      location: "📍The Arch Climbing Wall",
      organizer: "The Arch Coaching Team",
      grade: "V4 - V8",
      discipline: "Bouldering",
      level: "Advanced",
      equipment: "Shoes provided",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    {
      title: "Youth Climbing Club",
      date: "📅 Saturday, 11:00 AM",
      location: "📍VauxWall East",
      organizer: "Youth Development Team",
      grade: "Beginner to 6a",
      discipline: "Multi-discipline",
      level: "Youth (8-16)",
      imageSrc:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
    },
  ];

  const competitions = [
    {
      title: "London Bouldering League",
      date: "📅 Monthly, Next: July 20",
      location: "📍Various London gyms",
      organizer: "London Climbing Coalition",
      grade: "V0 - V12",
      discipline: "Bouldering competition",
      level: "All categories",
      prize: "Prizes & rankings",
      registration: "Open",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    {
      title: "Lead Climbing Championships",
      date: "📅 Saturday, August 5, 9:00 AM",
      location: "📍Westway Climbing Centre",
      organizer: "British Mountaineering Council",
      grade: "5.10a - 5.13d",
      discipline: "Lead competition",
      level: "Regional qualifiers",
      registration: "Closes July 15",
      imageSrc:
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop&crop=face",
    },
  ];

  const outdoorTrips = [
    {
      title: "Peak District Sport Climbing",
      date: "📅 Weekend, July 22-23",
      location: "📍Stanage Edge & Burbage",
      organizer: "Peak Adventures",
      grade: "E1 - E4 / 5.6 - 5.10",
      discipline: "Trad & Sport",
      level: "Experienced outdoor",
      accommodation: "Camping included",
      transport: "Minibus from London",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    {
      title: "Multi-pitch Climbing Course",
      date: "📅 3 days, Aug 12-14",
      location: "📍Lake District",
      organizer: "Mountain Skills Academy",
      grade: "Multi-pitch routes",
      discipline: "Trad climbing",
      level: "Lead climbing experience required",
      certification: "RCI certification",
      imageSrc:
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop&crop=face",
    },
    {
      title: "Portland Sport Trip",
      date: "📅 Long weekend, Sept 15-18",
      location: "📍Portland, Dorset",
      organizer: "South Coast Climbing",
      grade: "5.8 - 5.12",
      discipline: "Sport climbing",
      level: "Intermediate+",
      accommodation: "Shared cottages",
      imageSrc:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Partner Requests Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black font-poppins">
            Partner Requests
          </h2>
          <span className="text-sm text-gray-500 font-cabin">
            Find climbing partners
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {partnerRequests.map((request, index) => (
            <ClimbingActivityCard key={index} activity={request} />
          ))}
        </div>
      </div>

      {/* Gym Activities Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black font-poppins">
            Climbing Gym Activities
          </h2>
          <span className="text-sm text-gray-500 font-cabin">
            Sessions & coaching
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {gymActivities.map((activity, index) => (
            <ClimbingActivityCard key={index} activity={activity} />
          ))}
        </div>
      </div>

      {/* Competitions Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black font-poppins">
            Competitions
          </h2>
          <span className="text-sm text-gray-500 font-cabin">
            Events & contests
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {competitions.map((comp, index) => (
            <ClimbingActivityCard key={index} activity={comp} />
          ))}
        </div>
      </div>

      {/* Outdoor Trips Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black font-poppins">
            Climbing Trips
          </h2>
          <span className="text-sm text-gray-500 font-cabin">
            Outdoor adventures
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {outdoorTrips.map((trip, index) => (
            <ClimbingActivityCard key={index} activity={trip} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ClimbingActivityCard({ activity }: { activity: any }) {
  const navigate = useNavigate();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const { hasRequestedActivity } = useChat();

  const activityId = `${activity.title}-${activity.organizer}`.replace(/\s+/g, "-").toLowerCase();

  useEffect(() => {
    setIsRequested(hasRequestedActivity(activityId));
  }, [hasRequestedActivity, activityId]);

  const handleRequestSent = () => {
    setIsRequested(true);
    setShowRequestModal(false);
  };

  const handleCardClick = () => {
    // Navigate to appropriate climbing activity based on type
    if (
      activity.title?.includes("Peak") ||
      activity.title?.includes("Sport") ||
      activity.title?.includes("Outdoor")
    ) {
      navigate("/activity/peak-district-climb");
    } else {
      navigate("/activity/westway-womens-climb");
    }
  };

  return (
    <div
      className="min-w-72 w-72 border-2 border-explore-green rounded-lg p-4 flex-shrink-0 bg-white cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-explore-green font-cabin text-base line-clamp-2 leading-tight flex-1 pr-2">
          {activity.title}
        </h3>
        <div className="flex-shrink-0">
          <span
            className={`text-xs px-2 py-1 rounded-full font-cabin font-medium ${
              activity.level === "Beginner" || activity.level === "All levels"
                ? "bg-green-100 text-green-700"
                : activity.level === "Intermediate" ||
                    activity.level === "Intermediate+"
                  ? "bg-yellow-100 text-yellow-700"
                  : activity.level === "Advanced" ||
                      activity.level === "Experienced outdoor"
                    ? "bg-red-100 text-red-700"
                    : activity.level === "Youth (8-16)"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-700"
            }`}
          >
            {activity.level}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-3 mb-4">
        <img
          src={activity.imageSrc}
          alt="Organizer"
          className="w-12 h-12 rounded-full border border-black object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-600 font-cabin mb-1 truncate">
            By {activity.organizer}
          </div>
          <div className="text-sm text-explore-green font-cabin mb-1 truncate">
            {activity.date}
          </div>
          <div className="text-sm text-explore-green font-cabin truncate">
            {activity.location}
          </div>
        </div>
      </div>

      {/* Climbing Details */}
      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-2 gap-2 text-xs font-cabin">
          <div>
            <div className="text-gray-500">Grade/Difficulty</div>
            <div className="font-medium text-black">🧗 {activity.grade}</div>
          </div>
          <div>
            <div className="text-gray-500">Discipline</div>
            <div className="font-medium text-black">
              🧗‍��️ {activity.discipline}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {(activity.fee ||
          activity.equipment ||
          activity.prize ||
          activity.accommodation ||
          activity.transport ||
          activity.certification ||
          activity.registration) && (
          <div className="flex flex-wrap gap-1 mt-2">
            {activity.fee && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-cabin">
                💰 {activity.fee}
              </span>
            )}
            {activity.equipment && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-cabin">
                🥾 {activity.equipment}
              </span>
            )}
            {activity.prize && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-cabin">
                🏆 {activity.prize}
              </span>
            )}
            {activity.accommodation && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-cabin">
                🏕️ {activity.accommodation}
              </span>
            )}
            {activity.transport && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-cabin">
                🚐 {activity.transport}
              </span>
            )}
            {activity.certification && (
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-cabin">
                📜 {activity.certification}
              </span>
            )}
            {activity.registration && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-cabin">
                ��� {activity.registration}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!isRequested) {
            setShowRequestModal(true);
          }
        }}
        disabled={isRequested}
        className={`w-full py-3 rounded-lg text-sm font-cabin font-medium transition-colors ${
          isRequested
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-explore-green text-white hover:bg-explore-green-dark"
        }`}
      >
        {isRequested ? "Pending" : "Request to join"}
      </button>

      {/* Request Modal */}
      <RequestJoinModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        activityTitle={activity.title}
        organizerName={activity.organizer}
        organizerImage={activity.imageSrc}
        activityId={activityId}
        onRequestSent={handleRequestSent}
      />
    </div>
  );
}

function CyclingExploreSection() {
  const groupRides = [
    {
      title: "Sunday Morning Social Ride",
      date: "📅 Sunday, 8:00 AM",
      location: "📍Richmond Park, London",
      organizer: "Richmond Cycling Club",
      distance: "25km",
      pace: "20 kph",
      elevation: "150m",
      difficulty: "Beginner",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    {
      title: "Intermediate Chaingang",
      date: "📅 Tuesday, 6:30 PM",
      location: "📍Box Hill, Surrey",
      organizer: "Surrey Road Cycling",
      distance: "40km",
      pace: "32 kph",
      elevation: "420m",
      difficulty: "Intermediate",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
  ];

  const sportives = [
    {
      title: "London to Brighton Challenge",
      date: "📅 Saturday, 7:00 AM",
      location: "📍Clapham Common, London",
      organizer: "British Heart Foundation",
      distance: "54 miles",
      pace: "Self-paced",
      elevation: "900m",
      difficulty: "Challenge",
      fee: "£45",
      imageSrc:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
    },
    {
      title: "Cotswolds Century",
      date: "📅 Sunday, 8:00 AM",
      location: "📍Chipping Campden",
      organizer: "Sportive Series",
      distance: "100 miles",
      pace: "Self-paced",
      elevation: "1850m",
      difficulty: "Epic",
      fee: "£38",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
  ];

  const bikepacking = [
    {
      title: "South Downs Way Bikepacking",
      date: "📅 Fri-Sun, July 15-17",
      location: "📍Winchester to Eastbourne",
      organizer: "Adventure Cycling UK",
      distance: "160km over 3 days",
      pace: "Touring pace",
      elevation: "2100m total",
      difficulty: "Multi-day",
      gear: "Camping required",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
  ];

  const training = [
    {
      title: "Hill Climbing Intervals",
      date: "📅 Thursday, 6:00 PM",
      location: "📍Leith Hill, Surrey",
      organizer: "Watts Cycling Club",
      distance: "35km",
      pace: "Interval training",
      elevation: "650m",
      difficulty: "Advanced",
      focus: "Power & climbing",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Group Rides Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black font-poppins">
            Group Rides
          </h2>
          <span className="text-sm text-gray-500 font-cabin">
            Social & Club rides
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {groupRides.map((ride, index) => (
            <CyclingActivityCard key={index} activity={ride} />
          ))}
        </div>
      </div>

      {/* Sportives Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black font-poppins">
            Sportives & Events
          </h2>
          <span className="text-sm text-gray-500 font-cabin">
            Organized events
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {sportives.map((event, index) => (
            <CyclingActivityCard key={index} activity={event} />
          ))}
        </div>
      </div>

      {/* Bikepacking Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black font-poppins">
            Bikepacking Adventures
          </h2>
          <span className="text-sm text-gray-500 font-cabin">
            Multi-day tours
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {bikepacking.map((adventure, index) => (
            <CyclingActivityCard key={index} activity={adventure} />
          ))}
        </div>
      </div>

      {/* Training Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black font-poppins">
            Training Sessions
          </h2>
          <span className="text-sm text-gray-500 font-cabin">
            Structured workouts
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {training.map((session, index) => (
            <CyclingActivityCard key={index} activity={session} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CyclingActivityCard({ activity }: { activity: any }) {
  const navigate = useNavigate();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const { hasRequestedActivity } = useChat();

  const activityId = `${activity.title}-${activity.organizer}`.replace(/\s+/g, "-").toLowerCase();

  useEffect(() => {
    setIsRequested(hasRequestedActivity(activityId));
  }, [hasRequestedActivity, activityId]);

  const handleRequestSent = () => {
    setIsRequested(true);
    setShowRequestModal(false);
  };

  const handleCardClick = () => {
    // Navigate to appropriate cycling activity based on type
    if (
      activity.title?.includes("Chaingang") ||
      activity.title?.includes("Training") ||
      activity.title?.includes("Hill")
    ) {
      navigate("/activity/chaingang-training");
    } else {
      navigate("/activity/sunday-morning-ride");
    }
  };

  return (
    <div
      className="min-w-72 w-72 border-2 border-explore-green rounded-lg p-4 flex-shrink-0 bg-white cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-explore-green font-cabin text-base line-clamp-2 leading-tight flex-1 pr-2">
          {activity.title}
        </h3>
        <div className="flex-shrink-0">
          <span
            className={`text-xs px-2 py-1 rounded-full font-cabin font-medium ${
              activity.difficulty === "Beginner"
                ? "bg-green-100 text-green-700"
                : activity.difficulty === "Intermediate"
                  ? "bg-yellow-100 text-yellow-700"
                  : activity.difficulty === "Advanced"
                    ? "bg-red-100 text-red-700"
                    : activity.difficulty === "Epic"
                      ? "bg-purple-100 text-purple-700"
                      : activity.difficulty === "Challenge"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
            }`}
          >
            {activity.difficulty}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-3 mb-4">
        <img
          src={activity.imageSrc}
          alt="Organizer"
          className="w-12 h-12 rounded-full border border-black object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-600 font-cabin mb-1 truncate">
            By {activity.organizer}
          </div>
          <div className="text-sm text-explore-green font-cabin mb-1 truncate">
            {activity.date}
          </div>
          <div className="text-sm text-explore-green font-cabin truncate">
            {activity.location}
          </div>
        </div>
      </div>

      {/* Cycling Details */}
      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-3 gap-2 text-xs font-cabin">
          <div className="text-center">
            <div className="text-gray-500">Distance</div>
            <div className="font-medium text-black">🚴 {activity.distance}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Pace</div>
            <div className="font-medium text-black">��� {activity.pace}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Elevation</div>
            <div className="font-medium text-black">
              ⛰️ {activity.elevation}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {(activity.fee || activity.gear || activity.focus) && (
          <div className="flex flex-wrap gap-1 mt-2">
            {activity.fee && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-cabin">
                💰 {activity.fee}
              </span>
            )}
            {activity.gear && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-cabin">
                ⚙��� {activity.gear}
              </span>
            )}
            {activity.focus && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-cabin">
                🎯 {activity.focus}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!isRequested) {
            setShowRequestModal(true);
          }
        }}
        disabled={isRequested}
        className={`w-full py-3 rounded-lg text-sm font-cabin font-medium transition-colors ${
          isRequested
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-explore-green text-white hover:bg-explore-green-dark"
        }`}
      >
        {isRequested ? "Pending" : "Request to join"}
      </button>

      {/* Request Modal */}
      <RequestJoinModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        activityTitle={activity.title}
        organizerName={activity.organizer}
        organizerImage={activity.imageSrc}
        activityId={activityId}
        onRequestSent={handleRequestSent}
      />
    </div>
  );
}

function ActivityCard({
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
}: {
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
}) {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (activityId) {
      navigate(`/activity/${activityId}`);
    } else {
      // For default activities without specific IDs, navigate to westway-womens-climb as example
      navigate("/activity/westway-womens-climb");
    }
  };

  const handleRequestClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setShowRequestModal(true);
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
    <div
      className="min-w-72 w-72 border-2 border-explore-green rounded-lg p-4 flex-shrink-0 bg-white cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleCardClick}
    >
      {/* Header with title and difficulty badge */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-black font-cabin text-lg line-clamp-2 leading-tight flex-1 pr-2">
          {title}
        </h3>
        <span
          className={`text-xs px-3 py-1 rounded-full font-cabin font-medium flex-shrink-0 ${difficultyBadge.color}`}
        >
          {difficultyBadge.label}
        </span>
      </div>

      {/* Organizer info */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={imageSrc}
          alt="Organizer"
          className="w-12 h-12 rounded-full border border-black object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-600 font-cabin">By {organizer}</div>
        </div>
      </div>

      {/* Date and Location */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-orange-500 text-base">📅</span>
          <span className="text-sm text-black font-cabin">
            {date.replace("📅 ", "")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-red-500 text-base">📍</span>
          <span className="text-sm text-black font-cabin">
            {location.replace("📍", "")}
          </span>
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

      {/* Request to join button */}
      <div className="w-full">
        {isFirstCard ? (
          <button
            onClick={handleRequestClick}
            className="w-full bg-explore-green text-white py-3 rounded-lg text-sm font-cabin font-medium hover:bg-explore-green-dark transition-colors"
          >
            Request to join
          </button>
        ) : (
          <button
            onClick={handleRequestClick}
            className="w-full bg-explore-green text-white py-3 rounded-lg text-sm font-cabin font-medium hover:bg-explore-green-dark transition-colors"
          >
            Request to join
          </button>
        )}
      </div>
    </div>
  );
}

function PartnerCard({
  id,
  title,
  name,
  age,
  climbingLevel,
  date,
  location,
  description,
  availability,
  experience,
  imageSrc,
}: {
  id: string;
  title: string;
  name: string;
  age: number;
  climbingLevel: string;
  date: string;
  location: string;
  description: string;
  availability: string;
  experience: string;
  imageSrc: string;
}) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/partner/${id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="min-w-72 w-72 border-2 border-explore-green rounded-lg p-4 flex-shrink-0 bg-white cursor-pointer hover:shadow-lg transition-shadow duration-200"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-explore-green font-cabin text-base line-clamp-1 flex-1 pr-2">
          {title}
        </h3>
        <span className="text-xs bg-explore-green bg-opacity-10 text-explore-green px-2 py-1 rounded-full font-cabin font-medium">
          🧗 {climbingLevel}
        </span>
      </div>

      {/* Profile Info */}
      <div className="flex items-start gap-3 mb-3">
        <img
          src={imageSrc}
          alt={name}
          className="w-12 h-12 rounded-full border border-black object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-black font-cabin">{name}</span>
            <span className="text-sm text-gray-600 font-cabin">({age})</span>
          </div>
          <div className="text-sm text-gray-600 font-cabin mb-1">
            {experience}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 font-cabin mb-3 line-clamp-2">
        {description}
      </p>

      {/* Details */}
      <div className="space-y-1 mb-3">
        <div className="text-sm text-explore-green font-cabin">{date}</div>
        <div className="text-sm text-explore-green font-cabin">{location}</div>
        <div className="text-xs text-gray-600 font-cabin">
          Available: {availability}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          alert(`Sent partner request to ${name}!`);
        }}
        className="w-full bg-explore-green text-white py-2 rounded-lg text-sm font-cabin font-medium hover:bg-explore-green-dark transition-colors"
      >
        Send Partner Request
      </button>
    </div>
  );
}

function ClubLogo({
  src,
  alt,
  isMember,
  clubId,
}: {
  src: string;
  alt: string;
  isMember: boolean;
  clubId: string;
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isMember) {
      navigate(`/club/${clubId}`);
    } else {
      // For non-member clubs, navigate to club detail page
      navigate(`/club/${clubId}`);
    }
  };

  return (
    <div
      className={`relative w-16 h-16 rounded-full border-2 overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 ${
        isMember
          ? "border-explore-green shadow-lg"
          : "border-gray-300 hover:border-explore-green"
      }`}
      onClick={handleClick}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      {isMember && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-explore-green rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
    </div>
  );
}



function CarShareCard({
  destination,
  date,
  time,
  driver,
  availableSeats,
  cost,
  imageSrc,
  carShareId,
}: {
  destination: string;
  date: string;
  time: string;
  driver: string;
  availableSeats: number;
  cost: string;
  imageSrc: string;
  carShareId: string;
}) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/carshare/${carShareId}`);
  };

  return (
    <div
      className="min-w-72 w-72 border-2 border-blue-300 rounded-lg p-4 flex-shrink-0 bg-blue-50 cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-blue-800 font-cabin text-lg line-clamp-2 leading-tight flex-1 pr-2">
          🏔️ {destination}
        </h3>
        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-cabin font-medium">
          {availableSeats} seats
        </span>
      </div>

      {/* Driver info */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={imageSrc}
          alt={driver}
          className="w-10 h-10 rounded-full border border-blue-600 object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm text-blue-700 font-cabin font-medium">
            Driver: {driver}
          </div>
        </div>
      </div>

      {/* Trip details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-blue-800 font-cabin">{date}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-blue-800 font-cabin">
            🕐 Departure: {time}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-blue-800 font-cabin font-medium">
            💰 {cost}
          </span>
        </div>
      </div>

      {/* Request button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/carshare/${carShareId}`);
        }}
        className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-cabin font-medium hover:bg-blue-700 transition-colors"
      >
        View Details
      </button>
    </div>
  );
}
