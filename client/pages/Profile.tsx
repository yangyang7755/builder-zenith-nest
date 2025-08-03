import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Share,
  Edit,
  CheckCircle,
  Star,
  MessageSquare,
  MapPin
} from "lucide-react";
import { maddieWeiProfile } from "@/data/demoProfiles";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import BottomNavigation from "../components/BottomNavigation";

export default function Profile() {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);

  // Use the profile hook to get real data when user is logged in
  const { profile, followStats, loading } = useProfile(user?.id);

  // Use demo profile when not signed in or loading
  const displayProfile = (user && profile) ? {
    ...profile,
    followers: followStats.followers,
    following: followStats.following,
    rating: profile.average_rating || 0,
    reviews: profile.total_reviews || 0
  } : {
    ...maddieWeiProfile,
    full_name: "Maddie Wei",
    profile_image: "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2Fb4460a1279a84ad1b10626393196b1cf?format=webp&width=800",
    followers: 152,
    following: 87,
    rating: 4.8,
    reviews: 23
  };
  const isDemo = !user;

  const handleFollow = () => {
    setFollowing(!following);
  };

  return (
    <div className="react-native-container bg-white font-cabin relative native-scroll">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <Link to="/explore">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <span className="text-gray-500 font-medium">Profile</span>
        <Link to="/chat">
          <MessageSquare className="w-6 h-6 text-explore-green" />
        </Link>
      </div>

      {/* Profile Content */}
      <div className="bg-white">
        {/* Profile Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border-2 border-gray-200">
              <img
                src={displayProfile.profile_image}
                alt={displayProfile.full_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-black mb-2">{displayProfile.full_name}</h1>
              
              {/* Stats */}
              <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                {loading ? (
                  <div className="flex gap-4">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <span>•</span>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    <span>{displayProfile.followers || 0} Followers</span>
                    <span>•</span>
                    <span>{displayProfile.following || 0} Following</span>
                  </>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                {loading ? (
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                ) : displayProfile.rating && displayProfile.rating > 0 ? (
                  <>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.floor(displayProfile.rating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-black">
                      {displayProfile.rating.toFixed(1)} ({displayProfile.reviews || 0} reviews)
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">No reviews yet</span>
                )}
              </div>
            </div>
          </div>

          {/* Activity Tags */}
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 bg-explore-green text-white rounded-full text-sm font-medium">
              Climbing • Expert
            </span>
            <span className="px-3 py-1 border border-orange-300 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">
              Coach • Certified
            </span>
          </div>

          {/* Bio */}
          <p className="text-gray-700 mb-6 leading-relaxed text-sm">
            Weekend warrior and outdoor enthusiast. Love helping people reach new heights! Always looking to share knowledge and create a safe, fun climbing environment.
          </p>
        </div>

        {/* Personal Details Section */}
        <div className="px-6 pb-6">
          <h3 className="text-lg font-bold text-black mb-4">Personal Details</h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Gender:</span>
              <div className="font-medium text-black">Female</div>
            </div>
            <div>
              <span className="text-gray-600">Age:</span>
              <div className="font-medium text-black">28 years old</div>
            </div>
            <div>
              <span className="text-gray-600">Nationality:</span>
              <div className="font-medium text-black">British</div>
            </div>
            <div>
              <span className="text-gray-600">Experience:</span>
              <div className="font-medium text-black">5 years</div>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Institution:</span>
              <div className="font-medium text-black">London School of Economics</div>
            </div>
          </div>
        </div>

        {/* Activities Joined Section */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-black">Activities Joined</h3>
            <span className="text-sm text-gray-500">12 total</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl">🧗</div>
              <div className="flex-1">
                <h4 className="font-medium text-black">Westway Women's+ Climbing Morning</h4>
                <p className="text-sm text-gray-600">Coach Holly Peristiani • Feb 5, 2025</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl">🚴</div>
              <div className="flex-1">
                <h4 className="font-medium text-black">Sunday Morning Social Ride</h4>
                <p className="text-sm text-gray-600">Richmond Cycling Club • Feb 2, 2025</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>

        {/* Gear & Skills Section */}
        <div className="px-6 pb-6">
          <h3 className="text-lg font-bold text-black mb-4">Gear & Skills</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <span>🪢</span>
              <span className="text-sm">Rope</span>
              <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <span>⛑️</span>
              <span className="text-sm">Helmet</span>
              <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <span>🦺</span>
              <span className="text-sm">Harness</span>
              <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <span>🚴</span>
              <span className="text-sm">Road Bike</span>
              <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
            </div>
          </div>
        </div>

        {/* Clubs Section */}
        <div className="px-6 pb-6">
          <h3 className="text-lg font-bold text-black mb-4">Clubs</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=40&h=40&fit=crop"
                alt="Westway Climbing"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <h4 className="font-medium text-black">Westway Climbing Centre</h4>
                <p className="text-sm text-gray-600">245 members</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=40&h=40&fit=crop"
                alt="Richmond Cyclists"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <h4 className="font-medium text-black">Richmond Cycling Club</h4>
                <p className="text-sm text-gray-600">182 members</p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="px-6 pb-8">
          <h3 className="text-lg font-bold text-black mb-4">Location</h3>
          
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-5 h-5" />
            <span className="text-sm">London, UK</span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
