import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Share,
  Edit,
  CheckCircle,
  Star,
  MessageSquare,
  MapPin,
  Trophy,
  Award,
  Calendar,
  Target,
  TrendingUp
} from "lucide-react";
import BottomNavigation from "../components/BottomNavigation";

export default function ProfileDanSmith() {
  const [following, setFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'completed' | 'organized'>('completed');
  const [activeSportTab, setActiveSportTab] = useState<'climbing' | 'cycling' | 'running'>('climbing');
  const activitiesRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleFollow = () => {
    setFollowing(!following);
  };

  const userProfile = {
    name: "Dan Smith",
    bio: "Passionate climber and outdoor enthusiast. Love exploring new crags and pushing my limits. Always up for a climbing adventure!",
    location: "Brighton, UK",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    followers: 127,
    following: 156,
    overallRating: 4.7,
    totalReviews: 34,
    personalDetails: {
      gender: "Male",
      age: 28,
      nationality: "British",
      profession: "Software Developer",
      institution: "Tech Company",
      languages: ["🇬🇧", "🇩🇪"],
      joinedDate: "June 2020",
      experience: "5 years"
    },
  };

  const sportsData = {
    climbing: {
      level: "Advanced",
      experience: "5 years",
      certification: "Sport Climbing Certified",
      grades: {
        sport: "5.11a",
        trad: "5.10c",
        boulder: "V6"
      },
      achievements: ["First 5.11a", "100 Routes Completed", "Outdoor Leader"],
      gear: [
        { name: "Quickdraws", owned: true, icon: "🔗" },
        { name: "Rope", owned: true, icon: "🪢" },
        { name: "Helmet", owned: true, icon: "⛑️" },
        { name: "Bouldering pad", owned: false, icon: "🧗" }
      ]
    },
    cycling: {
      level: "Intermediate",
      experience: "3 years",
      certification: "None",
      achievements: ["Century Ride", "Hill Climb Champion"],
      gear: [
        { name: "Road Bike", owned: true, icon: "🚴" },
        { name: "Helmet", owned: true, icon: "⛑️" },
        { name: "Repair Kit", owned: true, icon: "🔧" }
      ]
    },
    running: {
      level: "Beginner",
      experience: "1 year",
      certification: "None",
      achievements: ["First 5K", "Local Park Run"],
      gear: [
        { name: "Running Shoes", owned: true, icon: "👟" },
        { name: "GPS Watch", owned: false, icon: "⌚" }
      ]
    }
  };

  const activitiesData = {
    completed: [
      {
        id: "westway-womens-climb",
        title: "Westway Climbing Session",
        date: "2025-01-20",
        organizer: "Coach Holly",
        rating: 5,
        type: "Participated"
      },
      {
        id: "outdoor-sport-climb",
        title: "Outdoor Sport Climbing",
        date: "2025-01-12",
        organizer: "Climbing Club",
        rating: 4,
        type: "Participated"
      }
    ],
    organized: [
      {
        id: "peak-district-climb",
        title: "Peak District Adventure",
        date: "2025-02-12",
        participants: 6,
        location: "Peak District",
        type: "Organized"
      }
    ]
  };

  const reviews = [
    {
      id: 1,
      reviewer: "Emma Wilson",
      reviewerImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      rating: 5,
      comment: "Great climbing partner! Very safe and encouraging.",
      activity: "Sport Climbing Day",
      date: "2025-01-15",
    },
    {
      id: 2,
      reviewer: "Mike Johnson",
      reviewerImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
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
    <div className="react-native-container bg-white font-cabin relative native-scroll">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <button
          onClick={() => navigate(-1)}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <span className="text-gray-500 font-medium">Profile</span>
        <button
          onClick={() => navigate("/chat/dan-smith")}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <MessageSquare className="w-6 h-6 text-explore-green" />
        </button>
      </div>

      {/* Profile Content */}
      <div className="bg-white">
        {/* Profile Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border-2 border-gray-200">
              <img
                src={userProfile.profileImage}
                alt={userProfile.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-black mb-2">{userProfile.name}</h1>
              
              {/* Stats */}
              <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                <button 
                  onClick={() => setShowFollowers(true)}
                  className="hover:text-explore-green transition-colors"
                >
                  {userProfile.followers} Followers
                </button>
                <span>•</span>
                <button 
                  onClick={() => setShowFollowing(true)}
                  className="hover:text-explore-green transition-colors"
                >
                  {userProfile.following} Following
                </button>
              </div>

              {/* Rating */}
              <button 
                onClick={() => activitiesRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 mb-3 hover:opacity-75 transition-opacity"
              >
                <div className="flex items-center gap-1">
                  {renderStars(Math.floor(userProfile.overallRating))}
                </div>
                <span className="text-sm font-medium text-black">
                  {userProfile.overallRating} ({userProfile.totalReviews} reviews)
                </span>
              </button>
            </div>
          </div>

          {/* Activity Tags */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <span className="px-3 py-1 bg-explore-green text-white rounded-full text-sm font-medium">
              Climbing • {sportsData.climbing.level}
            </span>
            <span className="px-3 py-1 border border-blue-300 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              Cycling • {sportsData.cycling.level}
            </span>
            <span className="px-3 py-1 border border-purple-300 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
              Running • {sportsData.running.level}
            </span>
          </div>

          {/* Bio */}
          <p className="text-gray-700 mb-6 leading-relaxed text-sm">
            {userProfile.bio}
          </p>

          {/* Follow Button */}
          <button
            onClick={handleFollow}
            className={`w-full py-3 rounded-lg text-lg font-cabin font-medium transition-colors ${
              following
                ? "bg-gray-200 text-gray-700"
                : "bg-explore-green text-white hover:bg-explore-green-light"
            }`}
          >
            {following ? "Following" : "Follow"}
          </button>
        </div>

        {/* Personal Details Section */}
        <div className="px-6 pb-6">
          <h3 className="text-lg font-bold text-black mb-4">Personal Details</h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Gender:</span>
              <div className="font-medium text-black">{userProfile.personalDetails.gender}</div>
            </div>
            <div>
              <span className="text-gray-600">Age:</span>
              <div className="font-medium text-black">{userProfile.personalDetails.age} years old</div>
            </div>
            <div>
              <span className="text-gray-600">Nationality:</span>
              <div className="font-medium text-black">{userProfile.personalDetails.nationality}</div>
            </div>
            <div>
              <span className="text-gray-600">Experience:</span>
              <div className="font-medium text-black">{userProfile.personalDetails.experience}</div>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Profession:</span>
              <div className="font-medium text-black">{userProfile.personalDetails.profession}</div>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Languages:</span>
              <div className="font-medium text-black">{userProfile.personalDetails.languages.join(" ")}</div>
            </div>
          </div>
        </div>

        {/* Sports & Licensing Section */}
        <div className="px-6 pb-6">
          <h3 className="text-lg font-bold text-black mb-4">Sports & Licensing</h3>
          
          {/* Sports Navigation */}
          <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg">
            {(['climbing', 'cycling', 'running'] as const).map((sport) => (
              <button
                key={sport}
                onClick={() => setActiveSportTab(sport)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeSportTab === sport
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {sport.charAt(0).toUpperCase() + sport.slice(1)}
              </button>
            ))}
          </div>

          {/* Sport Details */}
          <div className="space-y-4">
            {/* Level & Experience */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600 text-sm">Level:</span>
                <div className="font-medium text-black">{sportsData[activeSportTab].level}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Experience:</span>
                <div className="font-medium text-black">{sportsData[activeSportTab].experience}</div>
              </div>
            </div>

            {/* Certification */}
            <div>
              <span className="text-gray-600 text-sm">Certification:</span>
              <div className="font-medium text-black">{sportsData[activeSportTab].certification}</div>
            </div>

            {/* Grades (for climbing only) */}
            {activeSportTab === 'climbing' && (
              <div>
                <span className="text-gray-600 text-sm">Current Grades:</span>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-600">Sport</div>
                    <div className="font-medium text-black">{sportsData.climbing.grades.sport}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-600">Trad</div>
                    <div className="font-medium text-black">{sportsData.climbing.grades.trad}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-600">Boulder</div>
                    <div className="font-medium text-black">{sportsData.climbing.grades.boulder}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Achievements */}
            <div>
              <span className="text-gray-600 text-sm">Achievements:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {sportsData[activeSportTab].achievements.map((achievement, index) => (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                    {achievement}
                  </span>
                ))}
              </div>
            </div>

            {/* Gear */}
            <div>
              <span className="text-gray-600 text-sm">Gear & Equipment:</span>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {sportsData[activeSportTab].gear.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm text-black flex-1">{item.name}</span>
                    {item.owned ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 border border-gray-300 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Activities & Reviews Section */}
        <div ref={activitiesRef} className="px-6 pb-6">
          <h3 className="text-lg font-bold text-black mb-4">Activities & Reviews</h3>
          
          {/* Activities Navigation */}
          <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'completed'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Completed ({activitiesData.completed.length})
            </button>
            <button
              onClick={() => setActiveTab('organized')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'organized'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Organized ({activitiesData.organized.length})
            </button>
          </div>

          {/* Activities List */}
          <div className="space-y-3 mb-6">
            {activitiesData[activeTab].map((activity) => (
              <button
                key={activity.id}
                onClick={() => navigate(`/activity/${activity.id}`)}
                className="w-full border border-gray-200 rounded-lg p-4 hover:border-explore-green transition-colors text-left"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-black">{activity.title}</h4>
                  {activity.type === "Participated" && activity.rating && (
                    <div className="flex">{renderStars(activity.rating)}</div>
                  )}
                  {activity.type === "Organized" && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {activity.participants} joined
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {activity.date}
                  {activity.organizer && ` • By ${activity.organizer}`}
                  {activity.location && ` • ${activity.location}`}
                </div>
              </button>
            ))}
          </div>

          {/* Reviews */}
          <div>
            <h4 className="text-md font-semibold text-black mb-3">Recent Reviews</h4>
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start gap-3 mb-2">
                    <img
                      src={review.reviewerImage}
                      alt={review.reviewer}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-black text-sm">{review.reviewer}</span>
                        <div className="flex">{renderStars(review.rating)}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {review.activity} • {review.date}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="px-6 pb-6">
          <h3 className="text-lg font-bold text-black mb-2">Location</h3>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-black">{userProfile.location}</span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
