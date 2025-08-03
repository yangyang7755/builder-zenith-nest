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
  Phone,
} from "lucide-react";
import BottomNavigation from "../components/BottomNavigation";
import { getUserProfile, formatPersonalDetails, getSkillLevels } from "../services/profilesService";

export default function ProfileCoachHolly() {
  const [activeSportTab, setActiveSportTab] = useState<'climbing' | 'cycling' | 'running'>('climbing');
  const [activeTab, setActiveTab] = useState<'completed' | 'organized'>('completed');
  const navigate = useNavigate();

  // Load coach profile from standardized profiles service
  const profileData = getUserProfile("coach-holly");
  if (!profileData) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Profile not found</div>;
  }

  const personalDetails = formatPersonalDetails(profileData);
  const skillLevels = getSkillLevels(profileData);

  const userProfile = {
    name: profileData.name,
    bio: profileData.bio,
    location: profileData.location,
    profileImage: profileData.profileImage,
    followers: profileData.followers,
    following: profileData.following,
    overallRating: profileData.overallRating,
    totalReviews: profileData.totalReviews,
    sports: profileData.sports,
    skillLevels: skillLevels,
    personalDetails: {
      ...personalDetails,
      languages: profileData.languages,
    },
  };

  const climbingData = {
    activities: {
      created: [
        {
          id: "westway-womens-climb",
          title: "Westway Women's+ Climbing Morning",
          date: "2025-02-05",
          participants: 12,
          location: "Westway",
        },
        {
          id: "peak-district-climb",
          title: "Peak District Sport Climbing",
          date: "2025-01-22",
          participants: 8,
          location: "Peak District",
        },
      ],
      participated: [
        {
          id: "advanced-technique-workshop",
          title: "Advanced Technique Workshop",
          date: "2025-01-15",
          organizer: "London Climbing Academy",
          rating: 5,
        },
      ],
    },
    gear: [
      { name: "Rope", owned: true, icon: "🪢" },
      { name: "Quickdraws", owned: true, icon: "🔗" },
      { name: "Helmet", owned: true, icon: "⛑️" },
      { name: "Harness", owned: true, icon: "🦺" },
    ],
    stats: {
      totalClimbs: 247,
      favoriteGrades: ["5.10a", "5.11a", "5.11b"],
      preferredTerrain: ["Indoor", "Sport", "Trad"],
      yearsExperience: 15,
    },
  };

  const reviews = [
    {
      id: 1,
      reviewer: "Sarah Chen",
      reviewerImage:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
      rating: 5,
      comment: "Holly is an amazing coach! Really helped me improve my technique and confidence on the wall.",
      activity: "Westway Women's Climb",
      date: "2025-01-15",
    },
    {
      id: 2,
      reviewer: "Mike Johnson",
      reviewerImage:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      rating: 5,
      comment: "Excellent instruction, very patient and knowledgeable. Highly recommend!",
      activity: "Lead Climbing Workshop",
      date: "2025-01-20",
    },
    {
      id: 3,
      reviewer: "Emma Wilson",
      reviewerImage:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      rating: 5,
      comment: "Holly creates such a supportive environment. Best coach I've worked with!",
      activity: "Beginner's Course",
      date: "2025-01-28",
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
            onClick={() => navigate("/chat/coach-holly")}
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
            {userProfile.sports.map((sport: string, index: number) => {
              const skillLevel = userProfile.skillLevels[sport] || "Expert";
              const sportLabel = sport === "climbing" ? "Sport climber" :
                                sport === "cycling" ? "Road cyclist" :
                                sport === "running" ? "Runner" :
                                sport === "hiking" ? "Hiker" :
                                sport === "skiing" ? "Skier" :
                                sport === "surfing" ? "Surfer" :
                                sport === "tennis" ? "Tennis player" :
                                sport.charAt(0).toUpperCase() + sport.slice(1);
              return (
                <div
                  key={sport}
                  className="bg-explore-green text-white px-4 py-2 rounded-lg text-sm font-bold font-cabin"
                >
                  {sportLabel} • {skillLevel}
                </div>
              );
            })}
            <div className="border-2 border-orange-500 text-orange-500 px-4 py-2 rounded-lg text-sm font-cabin">
              Coach • Certified
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
                <span className="text-sm text-gray-600 font-cabin">Experience:</span>
                <div className="font-medium text-black font-cabin">
                  {climbingData.stats.yearsExperience} years
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-gray-600 font-cabin">Institution:</span>
                <div className="font-medium text-black font-cabin">
                  {userProfile.personalDetails.institution}
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-gray-600 font-cabin">Languages:</span>
                <div className="font-medium text-black font-cabin">
                  {Array.isArray(userProfile.personalDetails.languages)
                    ? userProfile.personalDetails.languages.join(", ")
                    : userProfile.personalDetails.languages}
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-gray-600 font-cabin">Certifications:</span>
                <div className="font-medium text-black font-cabin">
                  {userProfile.personalDetails.certifications?.join(", ")}
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
                <div className="text-sm text-gray-600">Grades Coached</div>
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
