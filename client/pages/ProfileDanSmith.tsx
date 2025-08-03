import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  CheckCircle,
  Circle,
  Star,
  Trophy,
  Award,
  MessageSquare,
} from "lucide-react";
import BottomNavigation from "../components/BottomNavigation";

export default function ProfileDanSmith() {
  const [following, setFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'completed' | 'organized'>('completed');
  const [activeSportTab, setActiveSportTab] = useState<'climbing' | 'cycling' | 'running'>('climbing');
  const navigate = useNavigate();

  const userProfile = {
    name: "Dan Smith",
    bio: "Passionate climber and outdoor enthusiast. Love exploring new crags and pushing my limits. Always up for a climbing adventure!",
    location: "Brighton, UK",
    profileImage:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    followers: 127,
    following: 156,
    overallRating: 4.7,
    totalReviews: 34,
    sports: ["climbing", "hiking"],
    skillLevels: {
      climbing: "Advanced",
      hiking: "Intermediate",
    },
    personalDetails: {
      gender: "Male",
      age: 28,
      nationality: "British",
      profession: "Software Developer",
      institution: "Tech Company",
      languages: ["🇬🇧", "🇩🇪"],
      joinedDate: "June 2020",
    },
  };

  const climbingData = {
    activities: {
      created: [
        {
          id: "peak-district-climb",
          title: "Peak District Adventure",
          date: "2025-02-12",
          participants: 6,
          location: "Peak District",
        },
      ],
      participated: [
        {
          id: "westway-womens-climb",
          title: "Westway Climbing Session",
          date: "2025-01-20",
          organizer: "Coach Holly",
          rating: 5,
        },
        {
          id: "outdoor-sport-climb",
          title: "Outdoor Sport Climbing",
          date: "2025-01-12",
          organizer: "Climbing Club",
          rating: 4,
        },
      ],
    },
    gear: [
      { name: "Bouldering pad", owned: false, icon: "🧗" },
      { name: "Quickdraws", owned: true, icon: "🔗" },
      { name: "Rope", owned: true, icon: "🪢" },
      { name: "Helmet", owned: true, icon: "⛑️" },
    ],
    stats: {
      totalClimbs: 89,
      favoriteGrades: ["5.9", "5.10a", "5.10b"],
      preferredTerrain: ["Sport", "Outdoor"],
    },
  };

  const reviews = [
    {
      id: 1,
      reviewer: "Emma Wilson",
      reviewerImage:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      rating: 5,
      comment: "Great climbing partner! Very safe and encouraging.",
      activity: "Sport Climbing Day",
      date: "2025-01-15",
    },
    {
      id: 2,
      reviewer: "Mike Johnson",
      reviewerImage:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      rating: 4,
      comment: "Solid climber with good technique. Enjoyed our session!",
      activity: "Indoor Climbing",
      date: "2025-01-08",
    },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
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

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
        <h1 className="text-lg font-bold text-black font-cabin">Profile</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/chat/dan-smith")}
            className="p-2 bg-explore-green rounded-full hover:bg-green-600 transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-white" />
          </button>
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
                  <button className="text-sm text-explore-green font-cabin underline">
                    {userProfile.followers} Followers
                  </button>
                  <span className="text-sm text-gray-400">•</span>
                  <button className="text-sm text-explore-green font-cabin underline">
                    {userProfile.following} Following
                  </button>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderStars(Math.floor(userProfile.overallRating))}
                  </div>
                  <span className="text-sm text-gray-600 font-cabin">
                    {userProfile.overallRating} ({userProfile.totalReviews} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Tags */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <div className="bg-explore-green text-white px-4 py-2 rounded-lg text-sm font-bold font-cabin">
              Sport climber • {userProfile.skillLevels.climbing}
            </div>
            <div className="border-2 border-explore-green text-explore-green px-4 py-2 rounded-lg text-sm font-cabin">
              Hiker • {userProfile.skillLevels.hiking}
            </div>
          </div>

          {/* Bio */}
          <p className="text-lg text-explore-green font-cabin mb-6">
            {userProfile.bio}
          </p>

          {/* Personal Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-bold text-black font-cabin mb-3">
              Personal Details
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-sm text-gray-600 font-cabin">Gender:</span>
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
                <span className="text-sm text-gray-600 font-cabin">Nationality:</span>
                <div className="font-medium text-black font-cabin">
                  {userProfile.personalDetails.nationality}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600 font-cabin">Profession:</span>
                <div className="font-medium text-black font-cabin">
                  {userProfile.personalDetails.profession}
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-gray-600 font-cabin">Languages:</span>
                <div className="font-medium text-black font-cabin">
                  {userProfile.personalDetails.languages.join(" ")}
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-gray-600 font-cabin">Member since:</span>
                <div className="font-medium text-black font-cabin">
                  {userProfile.personalDetails.joinedDate}
                </div>
              </div>
            </div>
          </div>

          {/* Climbing Statistics */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-black font-cabin mb-3">
              Climbing Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-explore-green">
                  {climbingData.stats.totalClimbs}
                </div>
                <div className="text-sm text-gray-600">Total Climbs</div>
              </div>
              <div>
                <div className="text-lg font-medium text-explore-green">
                  {climbingData.stats.favoriteGrades.join(", ")}
                </div>
                <div className="text-sm text-gray-600">Favorite Grades</div>
              </div>
            </div>
          </div>

          {/* Activities Created */}
          <div className="mb-8">
            <h3 className="text-xl font-medium text-black font-cabin mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-explore-green" />
              Activities Created
            </h3>
            <div className="space-y-3">
              {climbingData.activities.created.map((activity) => (
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
          <div className="mb-8">
            <h3 className="text-xl font-medium text-black font-cabin mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-explore-green" />
              Activities Participated
            </h3>
            <div className="space-y-3">
              {climbingData.activities.participated.map((activity) => (
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
          <div className="mb-8">
            <h3 className="text-xl font-medium text-black font-cabin mb-4">
              Gear & Equipment
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {climbingData.gear.map((item, index) => (
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

          {/* Reviews Section */}
          <div className="mb-8">
            <h3 className="text-xl font-medium text-black font-cabin mb-4">
              Recent Reviews
            </h3>
            <div className="space-y-4">
              {reviews.map((review) => (
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

          {/* Location Section */}
          <div className="mb-8">
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
