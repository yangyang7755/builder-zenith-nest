import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  CheckCircle,
  Circle,
  Star,
  Settings,
  Trophy,
  Award,
} from "lucide-react";
import BottomNavigation from "../components/BottomNavigation";

export default function Profile() {
  const [selectedTab, setSelectedTab] = useState("Climb");
  const navigate = useNavigate();

  // Sample user data - this would normally come from a context or API
  const userProfile = {
    name: "Maddie Wei",

    location: "Notting Hill, London",
    profileImage:
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=200&h=200&fit=crop&crop=face",
    followers: 100,
    following: 105,
    overallRating: 4.8,
    totalReviews: 24,
    sports: ["climbing", "cycling", "running"],
    skillLevels: {
      climbing: "Intermediate",
      cycling: "Advanced",
      running: "Beginner",
    },
    // Additional user details
    personalDetails: {
      gender: "Female",
      age: 25,
      nationality: "Spanish",
      profession: "Student",
      institution: "Oxford University",
      languages: ["🇬🇧", "🇪🇸", "🇫🇷"],
      joinedDate: "January 2024",
    },
  };

  const reviews = [
    {
      id: 1,
      reviewer: "Sarah Chen",
      reviewerImage:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
      rating: 5,
      comment: "Great climbing partner! Very supportive and reliable.",
      activity: "Westway Women's Climb",
      date: "2025-01-15",
    },
    {
      id: 2,
      reviewer: "Mike Johnson",
      reviewerImage:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      rating: 5,
      comment: "Excellent cyclist, kept great pace throughout the ride.",
      activity: "Richmond Park Social",
      date: "2025-01-20",
    },
    {
      id: 3,
      reviewer: "Emma Wilson",
      reviewerImage:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      rating: 4,
      comment: "Fun running companion, very motivating!",
      activity: "Hyde Park Morning Run",
      date: "2025-01-28",
    },
  ];

  const climbingData = {
    activities: {
      created: [
        {
          id: "peak-district-climb",
          title: "Peak District Sport Climbing",
          date: "2025-02-05",
          participants: 8,
          location: "Peak District",
        },
      ],
      participated: [
        {
          id: "westway-womens-climb",
          title: "Westway Women's+ Climb",
          date: "2025-01-26",
          organizer: "Coach Holly",
          rating: 5,
        },
      ],
    },
    gear: [
      { name: "Bouldering pad", owned: true, icon: "🧗" },
      { name: "Quickdraws", owned: false, icon: "🔗" },
      { name: "Rope", owned: false, icon: "🪢" },
      { name: "Helmet", owned: false, icon: "⛑️" },
    ],
    stats: {
      totalClimbs: 18,
      favoriteGrades: ["5.8", "5.9", "5.10a"],
      preferredTerrain: ["Indoor", "Sport"],
    },
  };

  const cyclingData = {
    activities: {
      created: [
        {
          id: 1,
          title: "Weekend Gravel Ride",
          date: "2025-02-08",
          participants: 12,
          location: "Surrey Hills",
        },
        {
          id: 2,
          title: "Morning Commuter Ride",
          date: "2025-01-30",
          participants: 15,
          location: "Hyde Park",
        },
      ],
      participated: [
        {
          id: 1,
          title: "Sunday Morning Social",
          date: "2025-02-02",
          organizer: "Richmond Cycling",
          rating: 5,
        },
        {
          id: 2,
          title: "Intermediate Chaingang",
          date: "2025-01-28",
          organizer: "Surrey Road Cycling",
          rating: 4,
        },
        {
          id: 3,
          title: "London to Brighton",
          date: "2025-01-20",
          organizer: "British Heart Foundation",
          rating: 5,
        },
      ],
    },
    gear: [
      { name: "Helmet", owned: true, icon: "⛑️" },
      { name: "Repair kit", owned: false, icon: "🔧" },
    ],
    stats: {
      totalRides: 24,
      totalDistance: "1,250 km",
      averageSpeed: "25 kph",
      preferredTypes: ["Road cycling", "Sportives", "Social rides"],
    },
  };

  const runningData = {
    activities: {
      created: [
        {
          id: 1,
          title: "Beginner's Running Group",
          date: "2025-02-10",
          participants: 10,
          location: "Regent's Park",
        },
      ],
      participated: [
        {
          id: 1,
          title: "Hyde Park Morning Run",
          date: "2025-01-28",
          organizer: "London Runners",
          rating: 4,
        },
        {
          id: 2,
          title: "Parkrun Richmond",
          date: "2025-01-25",
          organizer: "Parkrun",
          rating: 5,
        },
        {
          id: 3,
          title: "Half Marathon Training",
          date: "2025-01-18",
          organizer: "Running Club",
          rating: 4,
        },
      ],
    },
    gear: [
      { name: "Helmet", owned: false, icon: "⛑️" },
    ],
    stats: {
      totalRuns: 12,
      totalDistance: "185 km",
      personalBests: {
        "5K": "22:15",
        "10K": "46:30",
        "Half Marathon": "1:42:00",
      },
      preferredTypes: ["Park runs", "Trail running", "Social runs"],
    },
  };

  const clubs = [
    {
      name: "Westway",
      logo: "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F1e4beaadbd444b8497b8d2ef2ac43e70?format=webp&width=800",
      path: "/club/westway",
    },
    {
      name: "CULMC",
      logo: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=50&h=50&fit=crop",
      path: "/club/oxford-cycling",
    },
  ];

  const getCurrentSportData = () => {
    switch (selectedTab) {
      case "Climb":
        return climbingData;
      case "Ride":
        return cyclingData;
      case "Run":
        return runningData;
      default:
        return climbingData;
    }
  };

  const handleFollowersClick = () => {
    navigate("/followers");
  };

  const handleFollowingClick = () => {
    navigate("/following");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  const currentSportData = getCurrentSportData();

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

      {/* Scrollable Content */}
      <div className="overflow-y-auto pb-20">
        <div className="px-6">
          {/* Profile Header */}
          <div className="flex items-start justify-between mt-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full border border-black overflow-hidden">
                <img
                  src={userProfile.profileImage}
                  alt={userProfile.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h1 className="text-xl font-bold text-black font-cabin mb-2">
                  {userProfile.name}
                </h1>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={handleFollowersClick}
                    className="text-sm text-explore-green font-cabin underline"
                  >
                    {userProfile.followers} Followers
                  </button>
                  <span className="text-sm text-gray-400">•</span>
                  <button
                    onClick={handleFollowingClick}
                    className="text-sm text-explore-green font-cabin underline"
                  >
                    {userProfile.following} Following
                  </button>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderStars(Math.floor(userProfile.overallRating))}
                  </div>
                  <span className="text-sm text-gray-600 font-cabin">
                    {userProfile.overallRating} ({userProfile.totalReviews}{" "}
                    reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="px-4 py-2 border-2 border-explore-green rounded-lg text-explore-green text-sm font-cabin">
                Share
              </button>
              <button
                onClick={handleSettingsClick}
                className="p-2 border-2 border-explore-green rounded-lg text-explore-green hover:bg-explore-green hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Activity Tags with Skill Levels */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <div className="bg-explore-green text-white px-4 py-2 rounded-lg text-sm font-bold font-cabin">
              Sport climber • {userProfile.skillLevels.climbing}
            </div>
            <div className="border-2 border-explore-green text-explore-green px-4 py-2 rounded-lg text-sm font-cabin">
              Road cyclist • {userProfile.skillLevels.cycling}
            </div>
            <div className="border-2 border-explore-green text-explore-green px-4 py-2 rounded-lg text-sm font-cabin">
              Runner • {userProfile.skillLevels.running}
            </div>
          </div>



          {/* User Details Box */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-bold text-black font-cabin mb-3">
              Personal Details
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-sm text-gray-600 font-cabin">
                  Gender:
                </span>
                <div className="font-medium text-black font-cabin">
                  {userProfile.personalDetails.gender}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600 font-cabin">Age:</span>
                <div className="font-medium text-black font-cabin">
                  {userProfile.personalDetails.age} years old
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600 font-cabin">
                  Nationality:
                </span>
                <div className="font-medium text-black font-cabin">
                  {userProfile.personalDetails.nationality}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600 font-cabin">
                  Profession:
                </span>
                <div className="font-medium text-black font-cabin">
                  {userProfile.personalDetails.profession}
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-gray-600 font-cabin">
                  Institution:
                </span>
                <div className="font-medium text-black font-cabin">
                  {userProfile.personalDetails.institution}
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-gray-600 font-cabin">
                  Languages:
                </span>
                <div className="font-medium text-black font-cabin">
                  {userProfile.personalDetails.languages.join(", ")}
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-gray-600 font-cabin">
                  Member since:
                </span>
                <div className="font-medium text-black font-cabin">
                  {userProfile.personalDetails.joinedDate}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {["Climb", "Ride", "Run"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-6 py-2 rounded-lg border border-black text-sm font-bold font-cabin ${
                  selectedTab === tab
                    ? "bg-explore-green text-white"
                    : "bg-gray-100 text-explore-green"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Sport-Specific Content */}
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-black font-cabin mb-3">
                {selectedTab} Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {selectedTab === "Climb" && (
                  <>
                    <div>
                      <div className="text-2xl font-bold text-explore-green">
                        {currentSportData.stats.totalClimbs}
                      </div>
                      <div className="text-sm text-gray-600">Total Climbs</div>
                    </div>
                    <div>
                      <div className="text-lg font-medium text-explore-green">
                        {currentSportData.stats.favoriteGrades.join(", ")}
                      </div>
                      <div className="text-sm text-gray-600">
                        Favorite Grades
                      </div>
                    </div>
                  </>
                )}
                {selectedTab === "Ride" && (
                  <>
                    <div>
                      <div className="text-2xl font-bold text-explore-green">
                        {currentSportData.stats.totalRides}
                      </div>
                      <div className="text-sm text-gray-600">Total Rides</div>
                    </div>
                    <div>
                      <div className="text-lg font-medium text-explore-green">
                        {currentSportData.stats.totalDistance}
                      </div>
                      <div className="text-sm text-gray-600">Distance</div>
                    </div>
                  </>
                )}
                {selectedTab === "Run" && (
                  <>
                    <div>
                      <div className="text-2xl font-bold text-explore-green">
                        {currentSportData.stats.totalRuns}
                      </div>
                      <div className="text-sm text-gray-600">Total Runs</div>
                    </div>
                    <div>
                      <div className="text-lg font-medium text-explore-green">
                        {currentSportData.stats.totalDistance}
                      </div>
                      <div className="text-sm text-gray-600">Distance</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Activities Created */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-explore-green" />
                Activities Created
              </h3>
              <div className="space-y-3">
                {currentSportData.activities.created.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => navigate(`/activity/${activity.id}`)}
                    className="w-full border-2 border-gray-200 rounded-lg p-4 hover:border-explore-green transition-colors text-left"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-black font-cabin">
                        {activity.title}
                      </h4>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {activity.participants} joined
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 font-cabin">
                      {activity.date} • {activity.location}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Activities Participated */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-explore-green" />
                Activities Participated
              </h3>
              <div className="space-y-3">
                {currentSportData.activities.participated.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => navigate(`/activity/${activity.id}`)}
                    className="w-full border-2 border-gray-200 rounded-lg p-4 hover:border-explore-green transition-colors text-left"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-black font-cabin">
                        {activity.title}
                      </h4>
                      <div className="flex">{renderStars(activity.rating)}</div>
                    </div>
                    <div className="text-sm text-gray-600 font-cabin">
                      {activity.date} • By {activity.organizer}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Gear & Equipment */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-4">
                Gear & Equipment
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {currentSportData.gear.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm text-black font-cabin flex-1">
                      {item.name}
                    </span>
                    {item.owned ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-8">
            <h3 className="text-xl font-medium text-black font-cabin mb-4">
              Recent Reviews
            </h3>
            <div className="space-y-4">
              {reviews.slice(0, 3).map((review) => (
                <div
                  key={review.id}
                  className="border-2 border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={review.reviewerImage}
                      alt={review.reviewer}
                      className="w-10 h-10 rounded-full border border-black"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-black font-cabin text-sm">
                          {review.reviewer}
                        </span>
                        <div className="flex">{renderStars(review.rating)}</div>
                      </div>
                      <div className="text-xs text-gray-500 font-cabin">
                        {review.activity} • {review.date}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 font-cabin">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Clubs Section */}
          <div className="mt-8">
            <h3 className="text-xl font-medium text-black font-cabin mb-4">
              Clubs
            </h3>
            <div className="flex gap-4">
              {clubs.map((club, index) => (
                <Link
                  key={index}
                  to={club.path}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    <img
                      src={club.logo}
                      alt={club.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-cabin text-black hover:text-explore-green transition-colors">
                    {club.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Location Section */}
          <div className="mt-8">
            <h3 className="text-xl font-medium text-black font-cabin mb-2">
              Location
            </h3>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-black font-cabin">
                {userProfile.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
