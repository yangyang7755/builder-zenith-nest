import {
  Search,
  SlidersHorizontal,
  Calendar,
  MapPin,
  Bike,
  Mountain,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { useActivities } from "../contexts/ActivitiesContext";
import FilterSystem, { FilterOptions } from "../components/FilterSystem";
import MapView from "../components/MapView";

const activitiesData = [
  {
    id: 1,
    title: "Westway women's+ climbing ses...",
    date: "Wednesday",
    location: "",
    isWestway: true,
  },
  {
    id: 2,
    title: "Sport climbing taster session",
    date: "17.06",
    location: "Malham",
  },
  {
    id: 3,
    title: "Lead climbing at Parthian",
    date: "Friday",
    location: "Manchester",
  },
  {
    id: 4,
    title: "Westway women's+ climbing ses...",
    date: "19.06",
    location: "London, UK",
  },
  {
    id: 5,
    title: "Sports climbing taster session",
    date: "Monday",
    location: "Gower",
  },
  {
    id: 6,
    title: "Climbing at Parthian, Matchworks",
    date: "Thursday",
    location: "Parthian Matchworks",
  },
  {
    id: 7,
    title: "Sports climbing with new friends",
    date: "Sunday",
    location: "Llanberis",
  },
];

export default function Activities() {
  const { activities } = useActivities();
  const location = useLocation();
  const [showMapView, setShowMapView] = useState(false);
  const [filteredActivities, setFilteredActivities] = useState(activities);

  // Check URL parameters for specific activity filter
  const urlParams = new URLSearchParams(location.search);
  const filterParam = urlParams.get("filter");

  const [filters, setFilters] = useState<FilterOptions>({
    activityType: filterParam
      ? [filterParam.charAt(0).toUpperCase() + filterParam.slice(1)]
      : ["Cycling", "Climbing"],
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

    // Apply comprehensive filters
    if (filters.activityType.length > 0) {
      filtered = filtered.filter((activity) =>
        filters.activityType.some(
          (type) =>
            activity.type === type.toLowerCase() ||
            (type === "Cycling" && activity.type === "cycling") ||
            (type === "Climbing" && activity.type === "climbing"),
        ),
      );
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
              : "Activities"}
          </h1>
        </div>

        {/* Filter System */}
        <FilterSystem
          onFiltersChange={applyFilters}
          onShowMap={() => setShowMapView(true)}
          currentFilters={filters}
        />

        {/* Activities Content - Climbing or Cycling specific or mixed */}
        {filters.activityType.length === 1 &&
        filters.activityType.includes("Climbing") ? (
          <AllClimbingActivities userActivities={filteredActivities} />
        ) : filters.activityType.length === 1 &&
          filters.activityType.includes("Cycling") ? (
          <AllCyclingActivities userActivities={filteredActivities} />
        ) : (
          /* Mixed Activities List */
          <div className="space-y-2">
            {/* User Created Activities */}
            {filteredActivities.map((activity) => (
              <CreatedActivityItem key={activity.id} activity={activity} />
            ))}

            {/* Default Activities */}
            {activitiesData.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
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

function AllClimbingActivities({ userActivities }: { userActivities: any[] }) {
  const partnerRequests = [
    {
      id: "partner1",
      title: "Looking for belay partner",
      date: "Tonight",
      time: "7:00 PM",
      location: "Westway Climbing Centre",
      organizer: "Sarah Chen",
      type: "climbing",
      climbingLevel: "5.9 - 5.11a",
      maxParticipants: "2",
    },
    {
      id: "partner2",
      title: "Lead climbing session",
      date: "Friday evenings",
      time: "6:30 PM",
      location: "The Castle Climbing Centre",
      organizer: "Alex Rodriguez",
      type: "climbing",
      climbingLevel: "6a - 6c",
      maxParticipants: "4",
    },
    {
      id: "partner3",
      title: "Weekend bouldering buddy",
      date: "Saturday",
      time: "2:00 PM",
      location: "VauxWall East",
      organizer: "Mike Johnson",
      type: "climbing",
      climbingLevel: "V3 - V6",
      maxParticipants: "3",
    },
  ];

  const gymActivities = [
    {
      id: "gym1",
      title: "Women's+ Climbing Morning",
      date: "Every Wednesday",
      time: "10:00 AM",
      location: "Westway Climbing Centre",
      organizer: "Coach Holly Peristiani",
      type: "climbing",
      climbingLevel: "Competent top-rope climbers",
      maxParticipants: "15",
      isWestway: true,
    },
    {
      id: "gym2",
      title: "Bouldering Competition Training",
      date: "Saturday",
      time: "2:00 PM",
      location: "The Arch Climbing Wall",
      organizer: "The Arch Coaching Team",
      type: "climbing",
      climbingLevel: "V4 - V8",
      maxParticipants: "12",
    },
    {
      id: "gym3",
      title: "Youth Climbing Club",
      date: "Saturday",
      time: "11:00 AM",
      location: "VauxWall East",
      organizer: "Youth Development Team",
      type: "climbing",
      climbingLevel: "Beginner to 6a",
      maxParticipants: "20",
    },
  ];

  const competitions = [
    {
      id: "comp1",
      title: "London Bouldering League",
      date: "Monthly",
      time: "Next: July 20, 6:00 PM",
      location: "Various London gyms",
      organizer: "London Climbing Coalition",
      type: "climbing",
      climbingLevel: "V0 - V12",
      maxParticipants: "150",
    },
    {
      id: "comp2",
      title: "Lead Climbing Championships",
      date: "Saturday, August 5",
      time: "9:00 AM",
      location: "Westway Climbing Centre",
      organizer: "British Mountaineering Council",
      type: "climbing",
      climbingLevel: "5.10a - 5.13d",
      maxParticipants: "80",
    },
  ];

  const outdoorTrips = [
    {
      id: "trip1",
      title: "Peak District Sport Climbing",
      date: "Weekend, July 22-23",
      time: "6:00 AM departure",
      location: "Stanage Edge & Burbage",
      organizer: "Peak Adventures",
      type: "climbing",
      climbingLevel: "E1 - E4 / 5.6 - 5.10",
      maxParticipants: "8",
    },
    {
      id: "trip2",
      title: "Multi-pitch Climbing Course",
      date: "3 days, Aug 12-14",
      time: "All day",
      location: "Lake District",
      organizer: "Mountain Skills Academy",
      type: "climbing",
      climbingLevel: "Multi-pitch routes",
      maxParticipants: "6",
    },
    {
      id: "trip3",
      title: "Portland Sport Trip",
      date: "Long weekend, Sept 15-18",
      time: "All weekend",
      location: "Portland, Dorset",
      organizer: "South Coast Climbing",
      type: "climbing",
      climbingLevel: "5.8 - 5.12",
      maxParticipants: "12",
    },
  ];

  return (
    <div className="space-y-6">
      {/* User Created Activities */}
      {userActivities.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-black font-poppins mb-4">
            Your Activities
          </h2>
          <div className="space-y-3">
            {userActivities.map((activity) => (
              <CreatedActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      )}

      {/* Partner Requests */}
      <div>
        <h2 className="text-lg font-bold text-black font-poppins mb-4">
          Partner Requests
        </h2>
        <div className="space-y-3">
          {partnerRequests.map((activity) => (
            <CreatedActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>

      {/* Gym Activities */}
      <div>
        <h2 className="text-lg font-bold text-black font-poppins mb-4">
          Climbing Gym Activities
        </h2>
        <div className="space-y-3">
          {gymActivities.map((activity) => (
            <CreatedActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>

      {/* Competitions */}
      <div>
        <h2 className="text-lg font-bold text-black font-poppins mb-4">
          Competitions
        </h2>
        <div className="space-y-3">
          {competitions.map((activity) => (
            <CreatedActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>

      {/* Outdoor Trips */}
      <div>
        <h2 className="text-lg font-bold text-black font-poppins mb-4">
          Climbing Trips
        </h2>
        <div className="space-y-3">
          {outdoorTrips.map((activity) => (
            <CreatedActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AllCyclingActivities({ userActivities }: { userActivities: any[] }) {
  const groupRides = [
    {
      id: "group1",
      title: "Sunday Morning Social Ride",
      date: "Sunday",
      time: "8:00 AM",
      location: "Richmond Park, London",
      organizer: "Richmond Cycling Club",
      type: "cycling",
      distance: "25",
      distanceUnit: "km",
      pace: "20",
      paceUnit: "kph",
      elevation: "150",
      elevationUnit: "m",
      maxParticipants: "15",
    },
    {
      id: "group2",
      title: "Intermediate Chaingang",
      date: "Tuesday",
      time: "6:30 PM",
      location: "Box Hill, Surrey",
      organizer: "Surrey Road Cycling",
      type: "cycling",
      distance: "40",
      distanceUnit: "km",
      pace: "32",
      paceUnit: "kph",
      elevation: "420",
      elevationUnit: "m",
      maxParticipants: "12",
    },
  ];

  const sportives = [
    {
      id: "sportive1",
      title: "London to Brighton Challenge",
      date: "Saturday",
      time: "7:00 AM",
      location: "Clapham Common, London",
      organizer: "British Heart Foundation",
      type: "cycling",
      distance: "54",
      distanceUnit: "miles",
      elevation: "900",
      elevationUnit: "m",
      maxParticipants: "2000",
    },
    {
      id: "sportive2",
      title: "Cotswolds Century",
      date: "Sunday",
      time: "8:00 AM",
      location: "Chipping Campden",
      organizer: "Sportive Series",
      type: "cycling",
      distance: "100",
      distanceUnit: "miles",
      elevation: "1850",
      elevationUnit: "m",
      maxParticipants: "500",
    },
  ];

  const training = [
    {
      id: "training1",
      title: "Hill Climbing Intervals",
      date: "Thursday",
      time: "6:00 PM",
      location: "Leith Hill, Surrey",
      organizer: "Watts Cycling Club",
      type: "cycling",
      distance: "35",
      distanceUnit: "km",
      elevation: "650",
      elevationUnit: "m",
      maxParticipants: "8",
    },
  ];

  return (
    <div className="space-y-6">
      {/* User Created Activities */}
      {userActivities.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-black font-poppins mb-4">
            Your Activities
          </h2>
          <div className="space-y-3">
            {userActivities.map((activity) => (
              <CreatedActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      )}

      {/* Group Rides */}
      <div>
        <h2 className="text-lg font-bold text-black font-poppins mb-4">
          Group Rides
        </h2>
        <div className="space-y-3">
          {groupRides.map((activity) => (
            <CreatedActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>

      {/* Sportives */}
      <div>
        <h2 className="text-lg font-bold text-black font-poppins mb-4">
          Sportives & Events
        </h2>
        <div className="space-y-3">
          {sportives.map((activity) => (
            <CreatedActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>

      {/* Training */}
      <div>
        <h2 className="text-lg font-bold text-black font-poppins mb-4">
          Training Sessions
        </h2>
        <div className="space-y-3">
          {training.map((activity) => (
            <CreatedActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CreatedActivityItem({ activity }: { activity: any }) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to appropriate activity detail page based on activity type
    if (activity.organizer === "Coach Holly Peristiani" || activity.title.includes("Westway")) {
      navigate("/activity/westway-womens-climb");
    } else if (activity.type === "cycling") {
      if (activity.title.includes("Chaingang") || activity.title.includes("Training")) {
        navigate("/activity/chaingang-training");
      } else {
        navigate("/activity/sunday-morning-ride");
      }
    } else if (activity.type === "climbing") {
      if (activity.title.includes("Peak") || activity.title.includes("Sport") || activity.title.includes("Outdoor")) {
        navigate("/activity/peak-district-climb");
      } else {
        navigate("/activity/westway-womens-climb");
      }
    } else {
      navigate("/activity/westway-womens-climb");
    }
  };

  const handleRequestClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`Request to join ${activity.title}`);
  };

  return (
    <div
      className="bg-explore-gray border-2 border-explore-green rounded-lg p-4 mb-3 cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-explore-green rounded-full flex items-center justify-center flex-shrink-0">
            {activity.type === "cycling" ? (
              <Bike className="w-6 h-6 text-white" />
            ) : (
              <Mountain className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-explore-green font-cabin text-base">
              {activity.title}
            </h3>
            <p className="text-xs text-gray-600 font-cabin">
              By {activity.organizer}
            </p>
          </div>
        </div>
        <button className="bg-explore-green text-white px-4 py-2 rounded-lg text-sm font-cabin font-medium">
          Request to join
        </button>
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-explore-green" />
          <span className="text-sm text-black font-cabin">{activity.date}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center">
            <span className="text-explore-green text-xs">🕒</span>
          </div>
          <span className="text-sm text-black font-cabin">{activity.time}</span>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-explore-green" />
        <span className="text-sm text-black font-cabin">
          {activity.location}
        </span>
      </div>

      {/* Activity specific metrics */}
      {activity.type === "cycling" && (
        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
          {activity.distance && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <span className="text-explore-green text-xs">📍</span>
              </div>
              <span className="text-black font-cabin">
                {activity.distance} {activity.distanceUnit}
              </span>
            </div>
          )}
          {activity.elevation && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <span className="text-explore-green text-xs">⛰️</span>
              </div>
              <span className="text-black font-cabin">
                {activity.elevation} {activity.elevationUnit}
              </span>
            </div>
          )}
          {activity.pace && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <span className="text-explore-green text-xs">🚴</span>
              </div>
              <span className="text-black font-cabin">
                {activity.pace} {activity.paceUnit}
              </span>
            </div>
          )}
          {activity.maxParticipants && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <span className="text-explore-green text-xs">👥</span>
              </div>
              <span className="text-black font-cabin">
                Max {activity.maxParticipants} riders
              </span>
            </div>
          )}
        </div>
      )}

      {activity.type === "climbing" && (
        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
          {activity.climbingLevel && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <span className="text-explore-green text-xs">����</span>
              </div>
              <span className="text-black font-cabin">
                Level: {activity.climbingLevel}
              </span>
            </div>
          )}
          {activity.maxParticipants && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <span className="text-explore-green text-xs">👥</span>
              </div>
              <span className="text-black font-cabin">
                Max {activity.maxParticipants} people
              </span>
            </div>
          )}
          {activity.languages && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <span className="text-explore-green text-xs">🗣️</span>
              </div>
              <span className="text-black font-cabin">
                {activity.languages}
              </span>
            </div>
          )}
          {activity.gearRequired && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <span className="text-explore-green text-xs">⚙️</span>
              </div>
              <span className="text-black font-cabin">
                {activity.gearRequired}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Special comments */}
      {activity.specialComments && (
        <div className="mt-3 p-3 bg-white rounded-lg">
          <p className="text-sm text-black font-cabin">
            <span className="font-bold text-explore-green">
              Special comments:
            </span>
            <br />
            {activity.specialComments}
          </p>
        </div>
      )}
    </div>
  );
}

function ActivityItem({ activity }: { activity: (typeof activitiesData)[0] }) {
  return (
    <div className="flex items-center gap-3 py-4">
      {/* Activity Icon */}
      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
        <svg
          className="w-6 h-6 text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm1 14v6h-2v-6H8.5l2-8h3l2 8H13z" />
        </svg>
      </div>

      {/* Activity Details */}
      <div className="flex-1">
        <h3 className="font-bold text-black font-cabin text-base mb-2">
          {activity.title}
        </h3>
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-black" />
            <span className="text-sm text-black font-cabin">
              {activity.date}
            </span>
          </div>
          {activity.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-black" />
              <span className="text-sm text-black font-cabin">
                {activity.location}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Join Button */}
      {activity.isWestway ? (
        <Link
          to="/activity/westway-womens-climb"
          className="bg-explore-green text-white px-4 py-2 rounded-lg text-sm font-cabin font-medium"
        >
          Request to join
        </Link>
      ) : (
        <button className="bg-explore-green text-white px-4 py-2 rounded-lg text-sm font-cabin font-medium">
          Request to join
        </button>
      )}
    </div>
  );
}

function BottomNavigation() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white h-14 flex items-center justify-around border-t border-gray-200 max-w-md mx-auto">
      {/* Home Icon */}
      <Link to="/explore" className="p-2">
        <svg className="w-8 h-7" viewBox="0 0 35 31" fill="none">
          <path
            d="M31.4958 7.46836L21.4451 1.22114C18.7055 -0.484058 14.5003 -0.391047 11.8655 1.42266L3.12341 7.48386C1.37849 8.693 0 11.1733 0 13.1264V23.8227C0 27.7756 3.61199 31 8.06155 31H26.8718C31.3213 31 34.9333 27.7911 34.9333 23.8382V13.328C34.9333 11.2353 33.4152 8.662 31.4958 7.46836ZM18.7753 24.7993C18.7753 25.4349 18.1821 25.9619 17.4666 25.9619C16.7512 25.9619 16.1579 25.4349 16.1579 24.7993V20.1487C16.1579 19.5132 16.7512 18.9861 17.4666 18.9861C18.1821 18.9861 18.7753 19.5132 18.7753 20.1487V24.7993Z"
            fill="#2F2F2F"
          />
        </svg>
      </Link>

      {/* Clock Icon */}
      <Link to="/saved" className="p-2">
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
      </Link>

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
      <Link to="/profile" className="p-2">
        <svg className="w-8 h-8" viewBox="0 0 35 35" fill="none">
          <path
            d="M17.5 17.4999C15.8958 17.4999 14.5225 16.9287 13.3802 15.7864C12.2378 14.644 11.6666 13.2708 11.6666 11.6666C11.6666 10.0624 12.2378 8.68915 13.3802 7.54679C14.5225 6.40443 15.8958 5.83325 17.5 5.83325C19.1041 5.83325 20.4774 6.40443 21.6198 7.54679C22.7621 8.68915 23.3333 10.0624 23.3333 11.6666C23.3333 13.2708 22.7621 14.644 21.6198 15.7864C20.4774 16.9287 19.1041 17.4999 17.5 17.4999ZM5.83331 29.1666V25.0833C5.83331 24.2569 6.04599 23.4973 6.47133 22.8046C6.89668 22.1119 7.46179 21.5833 8.16665 21.2187C9.67359 20.4652 11.2048 19.9001 12.7604 19.5234C14.316 19.1466 15.8958 18.9583 17.5 18.9583C19.1041 18.9583 20.684 19.1466 22.2396 19.5234C23.7951 19.9001 25.3264 20.4652 26.8333 21.2187C27.5382 21.5833 28.1033 22.1119 28.5286 22.8046C28.954 23.4973 29.1666 24.2569 29.1666 25.0833V29.1666H5.83331Z"
            fill="#1D1B20"
          />
        </svg>
      </Link>

      {/* Navigation Indicator */}
      <div className="absolute bottom-2 left-12 w-2 h-2 bg-white border border-explore-green rounded-full"></div>
    </div>
  );
}
