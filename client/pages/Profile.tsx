import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Edit, Settings, Calendar } from "lucide-react";
import { maddieWeiProfile } from "@/data/demoProfiles";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Use demo profile when not signed in
  const displayProfile = user ? user : maddieWeiProfile;
  const isDemo = !user;

  const handleEditProfile = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="min-h-screen bg-white font-cabin max-w-md mx-auto relative">
      {/* Header */}
      <div className="h-11 bg-white flex items-center justify-between px-6 text-black font-medium">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-1 h-3 bg-black rounded-sm" />
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-6 pb-4">
        <Link to="/explore">
          <ArrowLeft className="w-6 h-6 text-black" />
        </Link>
        <h1 className="text-xl font-bold text-black font-cabin">Profile</h1>
        <button onClick={handleEditProfile}>
          <Edit className="w-6 h-6 text-black" />
        </button>
      </div>

      {/* Demo Mode Banner */}
      {isDemo && (
        <div className="mx-6 mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-cabin">
            <strong>Demo Mode:</strong> This is Maddie Wei's profile. Sign in to see your own profile.
          </p>
        </div>
      )}

      {/* Profile Content */}
      <div className="px-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
            <img
              src={displayProfile.profile_image || "https://via.placeholder.com/80"}
              alt={displayProfile.full_name || "Profile"}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-black font-cabin">
              {displayProfile.full_name || "User Name"}
            </h2>
            <p className="text-gray-600 font-cabin">{displayProfile.email}</p>
            {displayProfile.university && (
              <p className="text-gray-600 font-cabin text-sm">{displayProfile.university}</p>
            )}
          </div>
        </div>

        {/* Bio */}
        {displayProfile.bio && (
          <div className="mb-6">
            <p className="text-gray-700 font-cabin leading-relaxed">
              {displayProfile.bio}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-explore-green font-cabin">
              {maddieWeiProfile.clubs?.length || 0}
            </div>
            <div className="text-sm text-gray-600 font-cabin">Clubs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-explore-green font-cabin">
              {maddieWeiProfile.activities?.length || 0}
            </div>
            <div className="text-sm text-gray-600 font-cabin">Activities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-explore-green font-cabin">24</div>
            <div className="text-sm text-gray-600 font-cabin">Events</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {isDemo ? (
            <Link
              to="/signin"
              className="bg-explore-green text-white py-3 px-6 rounded-lg text-center font-cabin font-medium"
            >
              Sign In to Edit
            </Link>
          ) : (
            <Link
              to="/profile/edit"
              className="bg-explore-green text-white py-3 px-6 rounded-lg text-center font-cabin font-medium"
            >
              Edit Profile
            </Link>
          )}
          <Link
            to="/settings"
            className="border-2 border-gray-300 text-black py-3 px-6 rounded-lg text-center font-cabin font-medium"
          >
            Settings
          </Link>
        </div>

        {/* Recent Activities */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-black font-cabin mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {maddieWeiProfile.activities?.slice(0, 3).map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-explore-green rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-black font-cabin">{activity.title}</div>
                  <div className="text-sm text-gray-600 font-cabin">
                    {new Date(activity.date).toLocaleDateString()} • {activity.location}
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500 font-cabin">
                No recent activities
              </div>
            )}
          </div>
        </div>

        {/* Clubs */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-black font-cabin mb-4">My Clubs</h3>
          <div className="space-y-3">
            {maddieWeiProfile.clubs?.map((club, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-cabin font-bold text-sm">
                    {club.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-black font-cabin">{club.name}</div>
                  <div className="text-sm text-gray-600 font-cabin">
                    {club.userRole} • {club.location}
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500 font-cabin">
                No clubs joined yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
