import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Share,
  Edit,
  CheckCircle
} from "lucide-react";
import { maddieWeiProfile } from "@/data/demoProfiles";
import { useAuth } from "@/contexts/AuthContext";
import BottomNavigation from "../components/BottomNavigation";

export default function Profile() {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);

  // Use demo profile when not signed in - but with Ben Stuart style data
  const displayProfile = user ? user : {
    ...maddieWeiProfile,
    full_name: "Maddie Wei",
    profile_image: "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2Fb4460a1279a84ad1b10626393196b1cf?format=webp&width=800"
  };
  const isDemo = !user;

  const handleFollow = () => {
    setFollowing(!following);
  };

  return (
    <div className="react-native-container bg-gray-100 font-sans relative native-scroll">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <Link to="/explore">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <span className="text-gray-500 font-medium">Profile</span>
        <div className="w-6"></div>
      </div>

      {/* Profile Content */}
      <div className="bg-white">
        {/* Profile Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              <img
                src={displayProfile.profile_image}
                alt={displayProfile.full_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-xl font-bold text-black">{displayProfile.full_name}</h1>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600">
                  Share
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              
              <button 
                onClick={handleFollow}
                className={`w-full py-2 px-4 rounded font-medium ${
                  following 
                    ? 'bg-gray-200 text-gray-700' 
                    : 'bg-green-700 text-white'
                }`}
              >
                {following ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>

          {/* Activity Tags */}
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 bg-green-700 text-white rounded-full text-sm font-medium">
              Sport climber
            </span>
            <span className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-600">
              Road cyclist
            </span>
          </div>

          {/* Bio */}
          <p className="text-gray-700 mb-4 leading-relaxed">
            Weekend warrior. Always up for some mountain adventures
          </p>

          {/* Activity Buttons */}
          <div className="flex gap-2 mb-6">
            <button className="px-4 py-2 bg-green-700 text-white rounded font-medium">
              Climb
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded text-gray-600">
              Ride
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded text-gray-600">
              Run
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-8">
            {/* Activities joined */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Activities joined</h3>
              <div className="mb-3">
                <span className="text-2xl font-bold">18</span>
                <span className="text-gray-600 ml-1">climbs</span>
              </div>
              <div>
                <div className="font-medium text-gray-700 mb-2">Preferred terrain:</div>
                <ul className="text-gray-600 space-y-1">
                  <li>• Indoor</li>
                  <li>• Sport</li>
                </ul>
              </div>
              
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm text-gray-600">Portland sport trip</span>
              </div>
              <div className="text-xs text-gray-400">1/06</div>
            </div>

            {/* Gear & skills */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Gear & skills</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">Lead belay</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">Multipitch</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-700">Trad rack</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-700">Rope</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-700">Quickdraws</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-700">Helmet</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clubs Section */}
        <div className="px-6 py-4 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3">Clubs</h3>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-gray-200 rounded text-xs font-medium">
              🏔️ Westway
            </span>
            <span className="px-2 py-1 bg-gray-200 rounded text-xs font-medium">
              🎯 CULMC
            </span>
          </div>
        </div>

        {/* Location Section */}
        <div className="px-6 py-4 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3">Location</h3>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
            <span className="text-gray-700">Notting Hill, London</span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Demo Mode Banner */}
      {isDemo && (
        <div className="fixed top-16 left-4 right-4 max-w-md mx-auto p-3 bg-blue-50 border border-blue-200 rounded-lg z-50">
          <p className="text-sm text-blue-800">
            <strong>Demo Mode:</strong> This is Maddie Wei's profile. Sign in to see your own profile.
          </p>
        </div>
      )}
    </div>
  );
}
