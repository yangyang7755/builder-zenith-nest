import { Search, Menu, MapPin, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useActivities } from "../contexts/ActivitiesContext";
import FilterSystem, { FilterOptions } from "../components/FilterSystem";
import MapView from "../components/MapView";

export default function Index() {
  const { activities, searchActivities } = useActivities();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredActivities, setFilteredActivities] = useState(activities);
  const [isSearching, setIsSearching] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
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

  const applyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleActivitySelect = (activity: any) => {
    setShowMapView(false);
    // Navigate to activity details if needed
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
      filtered = filtered.filter(activity =>
        filters.activityType.some(type =>
          activity.type === type.toLowerCase() ||
          (type === "Cycling" && activity.type === "cycling") ||
          (type === "Climbing" && activity.type === "climbing")
        )
      );
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(activity =>
        activity.location.toLowerCase().includes(filters.location.toLowerCase()) ||
        activity.meetupLocation.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Filter by number of people
    filtered = filtered.filter(activity => {
      const maxPeople = parseInt(activity.maxParticipants) || 50;
      return maxPeople >= filters.numberOfPeople.min && maxPeople <= filters.numberOfPeople.max;
    });

    // Filter by gender
    if (filters.gender.length > 0) {
      filtered = filtered.filter(activity =>
        filters.gender.includes(activity.gender || "All genders")
      );
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
      <div className="px-3 pb-20">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-3xl font-bold text-explore-green font-cabin">
            Explore!
          </h1>
        </div>

        {/* Location Selector */}
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="w-6 h-6 text-black" />
          <div className="flex-1">
            <span className="text-xs text-black font-poppins">
              Chosen location
            </span>
            <span className="text-sm text-explore-text-light font-poppins ml-2">
              Notting hill, London
            </span>
          </div>
          <ChevronDown className="w-6 h-6 text-black" />
        </div>

        {/* Filter System */}
        <FilterSystem
          onFiltersChange={applyFilters}
          onShowMap={() => setShowMapView(true)}
          currentFilters={filters}
        />

        {/* Activities Section */}
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
            {/* Default activities */}
            {!isSearching && (
              <>
                <ActivityCard
                  title="Westway women's+ climb..."
                  date="📅 Wednesday"
                  location="📍London, UK"
                  imageSrc="https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop&crop=face"
                  isFirstCard={true}
                />
                <ActivityCard
                  title="Sport climbing trip"
                  date="📅 17.06 - 20.06"
                  location="📍Malham cove, UK"
                  imageSrc="https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop&crop=face"
                />
              </>
            )}

            {/* User created activities */}
            {(isSearching ? filteredActivities : activities.slice(0, 3)).map(
              (activity) => (
                <ActivityCard
                  key={activity.id}
                  title={activity.title}
                  date={`📅 ${activity.date}`}
                  location={`📍${activity.location}`}
                  imageSrc={
                    activity.imageSrc ||
                    "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop&crop=face"
                  }
                  organizer={activity.organizer}
                />
              ),
            )}

            {isSearching && filteredActivities.length === 0 && (
              <div className="text-center py-8 text-gray-500 w-full">
                No activities found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>

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
              title="Looking for a belay partner..."
              date="📅 Friday evenings"
              location="📍Westway"
              imageSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
            />
            <PartnerCard
              title="Looking for a belay partner..."
              date="📅 Monday evenings"
              location="📍The Castle"
              imageSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
            />
          </div>
        </div>

        {/* Join Local Clubs Section */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-black font-poppins mb-3">
            Your clubs & communities
          </h2>
          <div className="flex gap-4 justify-start">
            <ClubLogo
              src="https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F1e4beaadbd444b8497b8d2ef2ac43e70?format=webp&width=800"
              alt="Westway climbing gym"
              isMember={true}
              clubId="westway"
            />
            <ClubLogo
              src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=70&h=70&fit=crop"
              alt="Oxford university cycling club"
              isMember={true}
              clubId="oxford-cycling"
            />
            <ClubLogo
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=70&h=70&fit=crop"
              alt="Gorp Girls"
              isMember={false}
              clubId="gorp-girls"
            />
          </div>
        </div>
      </div>

      {/* Map View */}
      {showMapView && (
        <MapView
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
  title,
  date,
  location,
  imageSrc,
  isFirstCard = false,
  organizer = "Community",
}: {
  title: string;
  date: string;
  location: string;
  imageSrc: string;
  isFirstCard?: boolean;
  organizer?: string;
}) {
  return (
    <div className="min-w-60 w-60 h-32 border-2 border-explore-green rounded-lg p-3 flex-shrink-0 bg-white">
      <h3 className="font-bold text-explore-green font-cabin text-base mb-2">
        {title}
      </h3>
      <div className="flex items-start gap-3">
        <img
          src={imageSrc}
          alt="Profile"
          className="w-10 h-10 rounded-full border border-black object-cover"
        />
        <div className="flex-1">
          <div className="text-xs text-gray-600 font-cabin mb-1">
            By {organizer}
          </div>
          <div className="text-sm text-explore-green font-cabin mb-1">
            {date}
          </div>
          <div className="text-sm text-explore-green font-cabin">
            {location}
          </div>
        </div>
        {isFirstCard ? (
          <Link
            to="/activity/westway-womens-climb"
            className="bg-explore-green text-white px-3 py-2 rounded-lg text-sm font-cabin inline-block text-center"
          >
            Request to join
          </Link>
        ) : (
          <button className="bg-explore-green text-white px-3 py-2 rounded-lg text-sm font-cabin">
            Request to join
          </button>
        )}
      </div>
    </div>
  );
}

function PartnerCard({
  title,
  date,
  location,
  imageSrc,
}: {
  title: string;
  date: string;
  location: string;
  imageSrc: string;
}) {
  return (
    <div className="min-w-60 w-60 h-32 border-2 border-explore-green rounded-lg p-3 flex-shrink-0 bg-white">
      <h3 className="font-bold text-explore-green font-cabin text-base mb-2">
        {title}
      </h3>
      <div className="flex items-start gap-3">
        <img
          src={imageSrc}
          alt="Profile"
          className="w-10 h-10 rounded-full border border-black object-cover"
        />
        <div className="flex-1">
          <div className="text-sm text-explore-green font-cabin mb-1">
            {date}
          </div>
          <div className="text-sm text-explore-green font-cabin">
            {location}
          </div>
        </div>
        <button className="bg-explore-green text-white px-3 py-2 rounded-lg text-sm font-cabin">
          Request to join
        </button>
      </div>
    </div>
  );
}

function ClubLogo({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="w-16 h-16 rounded-full border border-black overflow-hidden">
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
}

function BottomNavigation() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white h-14 flex items-center justify-around border-t border-gray-200">
      {/* Home Icon */}
      <Link to="/explore" className="p-2">
        <svg className="w-8 h-7" viewBox="0 0 35 31" fill="none">
          <path
            d="M31.4958 7.46836L21.4451 1.22114C18.7055 -0.484058 14.5003 -0.391047 11.8655 1.42266L3.12341 7.48386C1.37849 8.693 0 11.1733 0 13.1264V23.8227C0 27.7756 3.61199 31 8.06155 31H26.8718C31.3213 31 34.9333 27.7911 34.9333 23.8382V13.328C34.9333 11.2353 33.4152 8.662 31.4958 7.46836ZM18.7753 24.7993C18.7753 25.4349 18.1821 25.9619 17.4666 25.9619C16.7512 25.9619 16.1579 25.4349 16.1579 24.7993V20.1487C16.1579 19.5132 16.7512 18.9861 17.4666 18.9861C18.1821 18.9861 18.7753 20.1487V24.7993Z"
            fill="#2F2F2F"
          />
        </svg>
      </Link>

      {/* Clock Icon */}
      <div className="p-2">
        <svg
          className="w-7 h-7"
          viewBox="0 0 30 30"
          fill="none"
          stroke="#1E1E1E"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="15" cy="15" r="12.5" />
          <path d="M15 7.5V15L20 17.5" />
        </svg>
      </div>

      {/* Plus Icon */}
      <Link to="/create" className="p-2">
        <svg
          className="w-7 h-7"
          viewBox="0 0 30 30"
          fill="none"
          stroke="#1E1E1E"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 6.25V23.75M6.25 15H23.75" />
        </svg>
      </Link>

      {/* Chat Icon */}
      <Link to="/chat" className="p-2">
        <svg className="w-7 h-7" viewBox="0 0 30 30" fill="none">
          <path
            d="M2.5 27.5V5C2.5 4.3125 2.74479 3.72396 3.23438 3.23438C3.72396 2.74479 4.3125 2.5 5 2.5H25C25.6875 2.5 26.276 2.74479 26.7656 3.23438C27.2552 3.72396 27.5 4.3125 27.5 5V20C27.5 20.6875 27.2552 21.276 26.7656 21.7656C26.276 22.2552 25.6875 22.5 25 22.5H7.5L2.5 27.5Z"
            fill="#1D1B20"
          />
        </svg>
      </Link>

      {/* Profile Icon */}
      <div className="p-2">
        <svg className="w-8 h-8" viewBox="0 0 35 35" fill="none">
          <path
            d="M17.5 17.4999C15.8958 17.4999 14.5225 16.9287 13.3802 15.7864C12.2378 14.644 11.6666 13.2708 11.6666 11.6666C11.6666 10.0624 12.2378 8.68915 13.3802 7.54679C14.5225 6.40443 15.8958 5.83325 17.5 5.83325C19.1041 5.83325 20.4774 6.40443 21.6198 7.54679C22.7621 8.68915 23.3333 10.0624 23.3333 11.6666C23.3333 13.2708 22.7621 14.644 21.6198 15.7864C20.4774 16.9287 19.1041 17.4999 17.5 17.4999ZM5.83331 29.1666V25.0833C5.83331 24.2569 6.04599 23.4973 6.47133 22.8046C6.89668 22.1119 7.46179 21.5833 8.16665 21.2187C9.67359 20.4652 11.2048 19.9001 12.7604 19.5234C14.316 19.1466 15.8958 18.9583 17.5 18.9583C19.1041 18.9583 20.684 19.1466 22.2396 19.5234C23.7951 19.9001 25.3264 20.4652 26.8333 21.2187C27.5382 21.5833 28.1033 22.1119 28.5286 22.8046C28.954 23.4973 29.1666 24.2569 29.1666 25.0833V29.1666H5.83331Z"
            fill="#1D1B20"
          />
        </svg>
      </div>

      {/* Navigation Indicator */}
      <div className="absolute bottom-2 left-12 w-2 h-2 bg-white border border-explore-green rounded-full"></div>
    </div>
  );
}
