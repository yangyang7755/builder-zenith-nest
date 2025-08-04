import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Share,
  Edit,
  CheckCircle,
  Star,
  MessageSquare,
  MapPin,
  Settings
} from "lucide-react";
import { maddieWeiProfile } from "@/data/demoProfiles";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useProfileVisibility } from "@/hooks/useProfileVisibility";
import BottomNavigation from "../components/BottomNavigation";
import { ProfileEdit } from "../components/ProfileEdit";
import { ComprehensiveProfileEdit } from "../components/ComprehensiveProfileEdit";
import { SettingsOverview } from "../components/SettingsOverview";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

export default function Profile() {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'completed' | 'organized'>('completed');
  const [activeSportTab, setActiveSportTab] = useState<'climbing' | 'cycling' | 'running'>('climbing');
  const [localProfileData, setLocalProfileData] = useState<any>(null);
  const activitiesRef = useRef<HTMLDivElement>(null);

  // Use the profile hook to get real data when user is logged in
  const { profile, followStats, loading, refetch } = useProfile(user?.id);

  // Load demo profile data from localStorage on mount
  useEffect(() => {
    if (!user) {
      const savedProfileData = localStorage.getItem('demoProfileData');
      if (savedProfileData) {
        try {
          const parsedData = JSON.parse(savedProfileData);
          setLocalProfileData(parsedData);
        } catch (error) {
          console.error('Failed to parse saved profile data:', error);
        }
      }
    }
  }, [user]);

  // Refresh profile when returning to this page
  useEffect(() => {
    const handleFocus = () => {
      if (user?.id && refetch) {
        refetch();
      } else if (!user) {
        // In demo mode, check for updated localStorage data
        const savedProfileData = localStorage.getItem('demoProfileData');
        if (savedProfileData) {
          try {
            const parsedData = JSON.parse(savedProfileData);
            setLocalProfileData(parsedData);
          } catch (error) {
            console.error('Failed to parse saved profile data:', error);
          }
        }
      }
      // Always refresh visibility settings
      refreshVisibility();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user?.id, refetch]);

  // Use visibility hook to control what's shown - use 'demo' as userId in demo mode
  const { isVisible, refresh: refreshVisibility } = useProfileVisibility(user?.id || 'demo');

  // Use demo profile when not signed in or loading
  const baseDemoProfile = {
    ...maddieWeiProfile,
    full_name: "Maddie Wei",
    profile_image: "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2Fb4460a1279a84ad1b10626393196b1cf?format=webp&width=800",
    followers: 152,
    following: 87,
    rating: 4.8,
    reviews: 23
  };

  const displayProfile = (user && profile) ? {
    ...profile,
    followers: followStats.followers,
    following: followStats.following,
    rating: profile.average_rating || 0,
    reviews: profile.total_reviews || 0
  } : {
    ...baseDemoProfile,
    ...(localProfileData || {}) // Override with any local updates
  };
  const isDemo = !user;

  const handleProfileUpdate = (updatedProfile: any) => {
    if (user && refetch) {
      // Authenticated mode - refresh from server
      refetch();
    } else {
      // Demo mode - update local state
      setLocalProfileData(updatedProfile);
    }
    // Always refresh visibility settings
    refreshVisibility();
  };

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
        <Link to="/settings" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Settings className="w-6 h-6 text-gray-600" />
        </Link>
      </div>

      {/* Profile Content */}
      <div className="bg-white">
        {/* Profile Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-4 mb-4">
            {isVisible('profile_image') && (
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border-2 border-gray-200">
                <img
                  src={displayProfile.profile_image}
                  alt={displayProfile.full_name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-black mb-2">{displayProfile.full_name}</h1>
              
              {/* Stats */}
              {(isVisible('followers') || isVisible('following')) && (
                <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                  {loading ? (
                    <div className="flex gap-4">
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                      <span>•</span>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ) : (
                    <>
                      {isVisible('followers') && (
                        <button
                          onClick={() => setShowFollowers(true)}
                          className="hover:text-explore-green transition-colors"
                        >
                          {displayProfile.followers || 0} Followers
                        </button>
                      )}
                      {isVisible('followers') && isVisible('following') && <span>•</span>}
                      {isVisible('following') && (
                        <button
                          onClick={() => setShowFollowing(true)}
                          className="hover:text-explore-green transition-colors"
                        >
                          {displayProfile.following || 0} Following
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Rating */}
              {isVisible('reviews') && (
                <button
                  onClick={() => activitiesRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 mb-3 hover:opacity-75 transition-opacity"
                >
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
                </button>
              )}
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

        {/* Comprehensive Profile Edit Section - Only show for authenticated users */}
        {user && profile && (
          <div className="px-6 pb-6">
            <ComprehensiveProfileEdit
              profile={profile}
              onProfileUpdate={handleProfileUpdate}
            />
          </div>
        )}

        {/* Settings Overview - Only show for authenticated users */}
        {user && (
          <div className="px-6 pb-6">
            <SettingsOverview />
          </div>
        )}

        {/* Personal Details Section */}
        {(isVisible('gender') || isVisible('age') || isVisible('nationality') || isVisible('institution')) && (
          <div className="px-6 pb-6">
            <h3 className="text-lg font-bold text-black mb-4">Personal Details</h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {isVisible('gender') && (
                <div>
                  <span className="text-gray-600">Gender:</span>
                  <div className="font-medium text-black">Female</div>
                </div>
              )}
              {isVisible('age') && (
                <div>
                  <span className="text-gray-600">Age:</span>
                  <div className="font-medium text-black">28 years old</div>
                </div>
              )}
              {isVisible('nationality') && (
                <div>
                  <span className="text-gray-600">Nationality:</span>
                  <div className="font-medium text-black">British</div>
                </div>
              )}
              <div>
                <span className="text-gray-600">Experience:</span>
                <div className="font-medium text-black">5 years</div>
              </div>
              {isVisible('institution') && (
                <div className="col-span-2">
                  <span className="text-gray-600">Institution:</span>
                  <div className="font-medium text-black">London School of Economics</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sports & Licensing Section */}
        {isVisible('sports') && (
          <div className="px-6 pb-6">
          <h3 className="text-lg font-bold text-black mb-4">Sports & Licensing</h3>

          {/* Sports Tab Navigation */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
            <button
              onClick={() => setActiveSportTab('climbing')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeSportTab === 'climbing'
                  ? 'bg-white text-explore-green shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🧗 Climbing
            </button>
            <button
              onClick={() => setActiveSportTab('cycling')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeSportTab === 'cycling'
                  ? 'bg-white text-explore-green shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🚴 Cycling
            </button>
            <button
              onClick={() => setActiveSportTab('running')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeSportTab === 'running'
                  ? 'bg-white text-explore-green shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🏃 Running
            </button>
          </div>

          {/* Sports Content */}
          <div className="space-y-4">
            {activeSportTab === 'climbing' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-black">Rock Climbing</h4>
                  <span className="px-3 py-1 bg-explore-green text-white rounded-full text-xs font-medium">
                    Expert
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Experience:</span>
                    <div className="font-medium text-black">5 years</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Max Grade:</span>
                    <div className="font-medium text-black">V6 / 6c+</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Certifications:</span>
                    <div className="font-medium text-black">Lead Climbing</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Specialties:</span>
                    <div className="font-medium text-black">Coaching</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Indoor</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Outdoor</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Top Rope</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Lead</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Bouldering</span>
                  </div>
                </div>
              </div>
            )}

            {activeSportTab === 'cycling' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-black">Road Cycling</h4>
                  <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-medium">
                    Intermediate
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Experience:</span>
                    <div className="font-medium text-black">3 years</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Avg Distance:</span>
                    <div className="font-medium text-black">40-60km</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Preferred Pace:</span>
                    <div className="font-medium text-black">25-30 kph</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Group Rides:</span>
                    <div className="font-medium text-black">Weekly</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Road</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Social Rides</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Commuting</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Group Leader</span>
                  </div>
                </div>
              </div>
            )}

            {activeSportTab === 'running' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-black">Distance Running</h4>
                  <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-medium">
                    Beginner
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Experience:</span>
                    <div className="font-medium text-black">1 year</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Avg Distance:</span>
                    <div className="font-medium text-black">5-8km</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Best Pace:</span>
                    <div className="font-medium text-black">6:30/km</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Goals:</span>
                    <div className="font-medium text-black">10K race</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Trail</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Road</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Morning Runs</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Activities & Reviews Section */}
        {isVisible('activities') && (
          <div ref={activitiesRef} className="px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-black">Activities & Reviews</h3>
            <span className="text-sm text-gray-500">15 total</span>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'completed'
                  ? 'bg-white text-explore-green shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Completed Activities
            </button>
            <button
              onClick={() => setActiveTab('organized')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'organized'
                  ? 'bg-white text-explore-green shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Organized Activities
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-3">
            {activeTab === 'completed' ? (
              <>
                {/* Completed Activities with Reviews */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-2xl">🧗</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-black">Westway Women's+ Climbing Morning</h4>
                      <p className="text-sm text-gray-600">Coach Holly Peristiani • Feb 5, 2025</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-3 h-3 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">Your review: "Amazing session!"</span>
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-2xl">🚴</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-black">Sunday Morning Social Ride</h4>
                      <p className="text-sm text-gray-600">Richmond Cycling Club • Feb 2, 2025</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4].map((star) => (
                          <Star
                            key={star}
                            className="w-3 h-3 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                        <Star className="w-3 h-3 text-gray-300" />
                        <span className="text-xs text-gray-500 ml-1">Your review: "Great route, friendly group"</span>
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-2xl">🏃</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-black">Richmond Park Morning Run</h4>
                      <p className="text-sm text-gray-600">Run Club London • Jan 28, 2025</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-3 h-3 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">Your review: "Perfect pace for beginners"</span>
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Organized Activities */}
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-explore-green">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-2xl">🧗</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-black">Beginner Climbing Workshop</h4>
                      <p className="text-sm text-gray-600">You organized • Jan 20, 2025</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="w-3 h-3 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">4.9 avg rating (8 reviews)</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">"Great instruction, very patient!" - Sarah</p>
                    </div>
                    <div className="text-xs text-gray-500">8 joined</div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-explore-green">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-2xl">🚴</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-black">Women's Cycling Safety Workshop</h4>
                      <p className="text-sm text-gray-600">You organized • Jan 15, 2025</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="w-3 h-3 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">4.8 avg rating (12 reviews)</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">"Learned so much about road safety!" - Emma</p>
                    </div>
                    <div className="text-xs text-gray-500">12 joined</div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-explore-green">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-2xl">🧗</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-black">Advanced Lead Climbing Session</h4>
                      <p className="text-sm text-gray-600">You organized • Jan 10, 2025</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4].map((star) => (
                            <Star
                              key={star}
                              className="w-3 h-3 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                          <Star className="w-3 h-3 text-gray-300" />
                        </div>
                        <span className="text-xs text-gray-600">4.7 avg rating (5 reviews)</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">"Challenging but excellent guidance" - Marcus</p>
                    </div>
                    <div className="text-xs text-gray-500">5 joined</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        )}

        {/* Clubs Section */}
        <div className="px-6 pb-6">
          <h3 className="text-lg font-bold text-black mb-4">Clubs</h3>
          
          <div className="space-y-3">
            <Link to="/club/westway" className="block">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
            </Link>

            <Link to="/club/richmond-runners" className="block">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F7c405a1be5e04dc69eb62c5c70ba6efc?format=webp&width=800"
                  alt="Richmond Cycling Club"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-black">Richmond Cycling Club</h4>
                  <p className="text-sm text-gray-600">182 members</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Location Section */}
        {isVisible('location') && (
          <div className="px-6 pb-8">
            <h3 className="text-lg font-bold text-black mb-4">Location</h3>

            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-5 h-5" />
              <span className="text-sm">London, UK</span>
            </div>
          </div>
        )}
      </div>

      {/* Followers Modal */}
      {showFollowers && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
            <button onClick={() => setShowFollowers(false)}>
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <span className="text-gray-500 font-medium">Followers</span>
            <div className="w-6"></div>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {/* Demo followers */}
              {[
                { name: "Alice Johnson", university: "Oxford University", image: "https://images.unsplash.com/photo-1494790108755-2616b612b647?w=40&h=40&fit=crop" },
                { name: "Sarah Chen", university: "LSE", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop" },
                { name: "Emma Wilson", university: "UCL", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop" }
              ].map((follower, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <img src={follower.image} alt={follower.name} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1">
                    <h4 className="font-medium text-black">{follower.name}</h4>
                    <p className="text-sm text-gray-600">{follower.university}</p>
                  </div>
                  <button className="px-4 py-2 bg-explore-green text-white rounded-lg text-sm">Follow</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowing && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
            <button onClick={() => setShowFollowing(false)}>
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <span className="text-gray-500 font-medium">Following</span>
            <div className="w-6"></div>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {/* Demo following */}
              {[
                { name: "Coach Holly", university: "Westway Climbing", image: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop" },
                { name: "Marcus Rodriguez", university: "Richmond RC", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop" },
                { name: "Katie Miller", university: "Oxford UUCC", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop" }
              ].map((followed, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <img src={followed.image} alt={followed.name} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1">
                    <h4 className="font-medium text-black">{followed.name}</h4>
                    <p className="text-sm text-gray-600">{followed.university}</p>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Following</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}



      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
