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
  Settings,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useProfileVisibility } from "@/hooks/useProfileVisibility";
import { useFollow } from "@/contexts/FollowContext";
import { useOnboardingProfileInfo } from "@/components/OnboardingProfileSync";
import { maddieWeiProfile } from "../data/demoProfiles";
import BottomNavigation from "../components/BottomNavigation";
import { ProfileEdit } from "../components/ProfileEdit";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  getClubProfileImage,
  getClubDisplayName,
  getClubMemberCount,
} from "../utils/clubUtils";
import { useHaptic } from "../hooks/useMobile";
import { apiService } from "../services/apiService";
import { useUserActivitiesAndReviews } from "../hooks/useUserActivitiesAndReviews";

export default function Profile() {
  const { user, profile } = useAuth();
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"completed" | "organized">(
    "completed",
  );
  const [activeSportTab, setActiveSportTab] = useState<
    "climbing" | "cycling" | "running"
  >("climbing");
  const [localProfileData, setLocalProfileData] = useState<any>(null);
  const [activityHistory, setActivityHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const activitiesRef = useRef<HTMLDivElement>(null);

  // Follow system hooks
  const {
    followUser,
    unfollowUser,
    isFollowing,
    getFollowerCount,
    getFollowingCount,
    isLoading: followLoading,
  } = useFollow();
  const haptic = useHaptic();

  // For demo purposes, use Maddie Wei's user ID
  const currentUserId = "user_maddie_wei";
  const isFollowingUser = isFollowing(currentUserId);

  // Helper function to calculate age from birthday
  const calculateAge = (birthday: string): number => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  // Helper function to get sport-specific data from onboarding
  const getSportData = (sport: string) => {
    if (!shouldUseOnboardingData) return null;

    const sportLower = sport.toLowerCase();
    const levelKey = `${sportLower}Level`;
    const experienceKey = `${sportLower}Experience`;

    return {
      level: onboardingProfile[levelKey] || "Beginner",
      experience: onboardingProfile[experienceKey] || "",
      // Sport-specific fields
      ...(sportLower === "climbing" && {
        maxGrade: onboardingProfile.climbingMaxGrade || "",
        certifications: onboardingProfile.climbingCertifications || [],
        specialties: onboardingProfile.climbingSpecialties || [],
        skills: onboardingProfile.climbingSkills || [],
      }),
      ...(sportLower === "cycling" && {
        distance: onboardingProfile.cyclingDistance || "",
        pace: onboardingProfile.cyclingPace || "",
        preferences: onboardingProfile.cyclingPreferences || [],
      }),
      ...(sportLower === "running" && {
        distance: onboardingProfile.runningDistance || "",
        pace: onboardingProfile.runningPace || "",
        goals: onboardingProfile.runningGoals || "",
        preferences: onboardingProfile.runningPreferences || [],
      }),
    };
  };

  // Use the profile hook to get real data when user is logged in
  const { profile: userProfileData, followStats, loading, refetch } = useProfile(user?.id);

  // Get onboarding profile information
  const {
    onboardingProfile,
    isOnboardingComplete,
    onboardingDataExists,
    profileIsFromOnboarding,
    shouldUseOnboardingData,
    currentProfile,
  } = useOnboardingProfileInfo();

  // Use activities and reviews hook
  const {
    completedActivities,
    organizedActivities,
    totalActivities,
    averageRating,
    totalReviews,
    loading: activitiesLoading,
    refetch: refetchActivities
  } = useUserActivitiesAndReviews(user?.id);

  // Load demo profile data from localStorage on mount
  useEffect(() => {
    if (!user) {
      const savedProfileData = localStorage.getItem("demoProfileData");
      if (savedProfileData) {
        try {
          const parsedData = JSON.parse(savedProfileData);
          setLocalProfileData(parsedData);
        } catch (error) {
          console.error("Failed to parse saved profile data:", error);
        }
      }
    }
  }, [user]);

  // Force check localStorage on each profile page visit
  useEffect(() => {
    if (!user) {
      const savedProfileData = localStorage.getItem("demoProfileData");
      if (savedProfileData) {
        try {
          const parsedData = JSON.parse(savedProfileData);

          setLocalProfileData(parsedData);
        } catch (error) {
          console.error("Failed to parse saved profile data:", error);
        }
      }
    }
  }, []); // Run on every mount

  // Refresh profile when returning to this page
  useEffect(() => {
    const handleFocus = () => {
      if (user?.id && refetch) {
        refetch();
      } else if (!user) {
        // In demo mode, check for updated localStorage data
        const savedProfileData = localStorage.getItem("demoProfileData");
        if (savedProfileData) {
          try {
            const parsedData = JSON.parse(savedProfileData);

            setLocalProfileData(parsedData);
          } catch (error) {
            console.error("Failed to parse saved profile data:", error);
          }
        }
      }
      // Always refresh visibility settings
      refreshVisibility();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user?.id, refetch]);

  // Use visibility hook to control what's shown - use 'demo' as userId in demo mode
  const { isVisible, refresh: refreshVisibility } = useProfileVisibility(
    user?.id || "demo",
  );

  // Use demo profile when not signed in or loading
  const baseDemoProfile = {
    ...maddieWeiProfile,
    full_name: "Maddie Wei",
    profile_image:
      "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2Fb4460a1279a84ad1b10626393196b1cf?format=webp&width=800",
    followers: 152,
    following: 87,
    rating: 4.8,
    reviews: 23,
  };

  // Use real authenticated user profile data with onboarding enhancements, or fall back to demo profile
  const displayProfile = profile || shouldUseOnboardingData
    ? {
        // Start with backend profile or empty object
        ...(profile || {}),
        // Override with onboarding data if it should be used
        ...(shouldUseOnboardingData ? {
          full_name: onboardingProfile.name,
          bio: onboardingProfile.bio || `${onboardingProfile.profession || "Outdoor enthusiast"} from ${onboardingProfile.country || "Unknown"}`,
          age: onboardingProfile.birthday ? calculateAge(onboardingProfile.birthday) : null,
          gender: onboardingProfile.gender,
          nationality: onboardingProfile.country,
          institution: !onboardingProfile.hideUniversity ? onboardingProfile.university : null,
          occupation: onboardingProfile.profession,
          location: onboardingProfile.location || onboardingProfile.country,
          sports: onboardingProfile.sports || [],
          languages: onboardingProfile.languages || [],
        } : {}),
        // Add stats
        followers: followStats?.followers || 0,
        following: followStats?.following || 0,
        rating: averageRating || userProfileData?.average_rating || 0,
        reviews: totalReviews || userProfileData?.total_reviews || 0,
      }
    : {
        ...baseDemoProfile,
        rating: averageRating || baseDemoProfile.rating,
        reviews: totalReviews || baseDemoProfile.reviews,
      }; // Show Maddie Wei profile for non-authenticated users with real review data

  const handleProfileUpdate = (updatedProfile: any) => {
    if (user && refetch) {
      // Refresh profile data from server after update
      refetch();
    }
    // Refresh visibility settings
    refreshVisibility();
  };

  const handleReviewSubmitted = () => {
    // Refresh activities and reviews when a new review is submitted
    refetchActivities();
    if (user && refetch) {
      refetch();
    }
  };

  // Load user's activity history
  useEffect(() => {
    const loadActivityHistory = async () => {
      if (!user) return; // Skip if not authenticated

      setLoadingHistory(true);
      try {
        const response = await apiService.getUserActivityHistory({
          status: "completed",
          limit: 10,
        });

        if (response.data?.success) {
          setActivityHistory(response.data.data || []);
        } else if (response.data && Array.isArray(response.data)) {
          setActivityHistory(response.data);
        }
      } catch (error) {
        console.error("Failed to load activity history:", error);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadActivityHistory();
  }, [user]);

  const handleFollow = async () => {
    haptic.medium();
    if (isFollowingUser) {
      await unfollowUser(currentUserId);
    } else {
      await followUser(currentUserId);
    }
  };

  // Helper function to get activity type emoji
  const getActivityEmoji = (type: string) => {
    const emojis: { [key: string]: string } = {
      cycling: "🚴",
      climbing: "🧗",
      running: "🏃",
      hiking: "🥾",
      skiing: "⛷️",
      surfing: "🏄",
      tennis: "🎾",
      general: "⚡",
    };
    return emojis[type] || "⚡";
  };

  // Helper function to format date
  const formatActivityDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="react-native-container bg-white font-cabin relative native-scroll">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <Link to="/explore">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <span className="text-gray-500 font-medium">Profile</span>
        <Link
          to="/settings"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Settings className="w-6 h-6 text-gray-600" />
        </Link>
      </div>

      {/* Profile Content */}
      <div className="bg-white">
        {/* Profile Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-4 mb-4">
            {isVisible("profile_image") && (
              <Avatar className="w-24 h-24 border-2 border-gray-200">
                <AvatarImage
                  src={displayProfile.profile_image}
                  alt={displayProfile.full_name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                  {displayProfile.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-black mb-2">
                {displayProfile.full_name}
              </h1>

              {/* Stats */}
              {(isVisible("followers") || isVisible("following")) && (
                <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                  {loading ? (
                    <div className="flex gap-4">
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                      <span>•</span>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ) : (
                    <>
                      {isVisible("followers") && (
                        <button
                          onClick={() => setShowFollowers(true)}
                          className="hover:text-explore-green transition-colors"
                        >
                          {getFollowerCount(currentUserId)} Followers
                        </button>
                      )}
                      {isVisible("followers") && isVisible("following") && (
                        <span>•</span>
                      )}
                      {isVisible("following") && (
                        <button
                          onClick={() => setShowFollowing(true)}
                          className="hover:text-explore-green transition-colors"
                        >
                          {getFollowingCount(currentUserId)} Following
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Rating */}
              {isVisible("reviews") && (
                <button
                  onClick={() =>
                    activitiesRef.current?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
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
                        {displayProfile.rating.toFixed(1)} (
                        {displayProfile.reviews || 0} reviews)
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">
                      No reviews yet
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Activity Tags */}
          {displayProfile.sports && Array.isArray(displayProfile.sports) && displayProfile.sports.length > 0 && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {displayProfile.sports.slice(0, 3).map((sport, index) => {
                const sportName = typeof sport === 'string' ? sport : sport.sport;
                return (
                  <span key={index} className="px-3 py-1 bg-explore-green text-white rounded-full text-sm font-medium">
                    {sportName}
                  </span>
                );
              })}
              {displayProfile.occupation && (
                <span className="px-3 py-1 border border-orange-300 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">
                  {displayProfile.occupation}
                </span>
              )}
            </div>
          )}

          {/* Bio */}
          <p className="text-gray-700 mb-6 leading-relaxed text-sm">
            Weekend warrior and outdoor enthusiast. Love helping people reach
            new heights! Always looking to share knowledge and create a safe,
            fun climbing environment.
          </p>
        </div>



        {/* Personal Details Section */}
        {(isVisible("gender") ||
          isVisible("age") ||
          isVisible("nationality") ||
          isVisible("institution")) && (
          <div className="px-6 pb-6">
            <h3 className="text-lg font-bold text-black mb-4">
              Personal Details
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {isVisible("gender") && displayProfile.gender && (
                <div>
                  <span className="text-gray-600">Gender:</span>
                  <div className="font-medium text-black">{displayProfile.gender}</div>
                </div>
              )}
              {isVisible("age") && displayProfile.age && (
                <div>
                  <span className="text-gray-600">Age:</span>
                  <div className="font-medium text-black">{displayProfile.age} years old</div>
                </div>
              )}
              {isVisible("nationality") && displayProfile.nationality && (
                <div>
                  <span className="text-gray-600">Nationality:</span>
                  <div className="font-medium text-black">{displayProfile.nationality}</div>
                </div>
              )}
              {displayProfile.occupation && (
                <div>
                  <span className="text-gray-600">Profession:</span>
                  <div className="font-medium text-black">{displayProfile.occupation}</div>
                </div>
              )}
              {isVisible("institution") && displayProfile.institution && (
                <div className="col-span-2">
                  <span className="text-gray-600">Institution:</span>
                  <div className="font-medium text-black">
                    {displayProfile.institution}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sports & Licensing Section */}
        {isVisible("sports") && (
          <div className="px-6 pb-6">
            <h3 className="text-lg font-bold text-black mb-4">
              Sports & Licensing
            </h3>

            {/* Sports Tab Navigation */}
            {displayProfile.sports && Array.isArray(displayProfile.sports) && displayProfile.sports.length > 0 && (
              <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                {displayProfile.sports.map((sport, index) => {
                  const sportName = typeof sport === 'string' ? sport : sport.sport;
                  const sportKey = sportName.toLowerCase();
                  const sportEmojis = {
                    climbing: "🧗",
                    cycling: "🚴",
                    running: "🏃",
                    hiking: "🥾",
                    skiing: "⛷️",
                    surfing: "🏄",
                    tennis: "🎾"
                  };
                  return (
                    <button
                      key={index}
                      onClick={() => setActiveSportTab(sportKey as any)}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        activeSportTab === sportKey
                          ? "bg-white text-explore-green shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {sportEmojis[sportKey] || "⚡"} {sportName}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Sports Content */}
            <div className="space-y-4">
              {displayProfile.sports && Array.isArray(displayProfile.sports) && displayProfile.sports.map((sport, index) => {
                const sportName = typeof sport === 'string' ? sport : sport.sport;
                const sportKey = sportName.toLowerCase();
                const sportData = getSportData(sportName);

                if (activeSportTab !== sportKey) return null;

                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-black">{sportName}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        sportData?.level === 'Expert' || sportData?.level === 'Professional' ? 'bg-explore-green text-white' :
                        sportData?.level === 'Advanced' ? 'bg-orange-500 text-white' :
                        sportData?.level === 'Intermediate' ? 'bg-yellow-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {sportData?.level || 'Beginner'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {sportData?.experience && (
                        <div>
                          <span className="text-gray-600">Experience:</span>
                          <div className="font-medium text-black">{sportData.experience}</div>
                        </div>
                      )}

                      {/* Climbing specific fields */}
                      {sportKey === 'climbing' && (
                        <>
                          {sportData?.maxGrade && (
                            <div>
                              <span className="text-gray-600">Max Grade:</span>
                              <div className="font-medium text-black">{sportData.maxGrade}</div>
                            </div>
                          )}
                          {sportData?.certifications && sportData.certifications.length > 0 && (
                            <div>
                              <span className="text-gray-600">Certifications:</span>
                              <div className="font-medium text-black">
                                {sportData.certifications.join(", ")}
                              </div>
                            </div>
                          )}
                          {sportData?.specialties && sportData.specialties.length > 0 && (
                            <div>
                              <span className="text-gray-600">Specialties:</span>
                              <div className="font-medium text-black">
                                {sportData.specialties.join(", ")}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Cycling specific fields */}
                      {sportKey === 'cycling' && (
                        <>
                          {sportData?.distance && (
                            <div>
                              <span className="text-gray-600">Avg Distance:</span>
                              <div className="font-medium text-black">{sportData.distance}</div>
                            </div>
                          )}
                          {sportData?.pace && (
                            <div>
                              <span className="text-gray-600">Preferred Pace:</span>
                              <div className="font-medium text-black">{sportData.pace}</div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Running specific fields */}
                      {sportKey === 'running' && (
                        <>
                          {sportData?.distance && (
                            <div>
                              <span className="text-gray-600">Avg Distance:</span>
                              <div className="font-medium text-black">{sportData.distance}</div>
                            </div>
                          )}
                          {sportData?.pace && (
                            <div>
                              <span className="text-gray-600">Best Pace:</span>
                              <div className="font-medium text-black">{sportData.pace}</div>
                            </div>
                          )}
                          {sportData?.goals && (
                            <div>
                              <span className="text-gray-600">Goals:</span>
                              <div className="font-medium text-black">{sportData.goals}</div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Skills/Preferences tags */}
                    {((sportKey === 'climbing' && sportData?.skills) ||
                      (sportKey === 'cycling' && sportData?.preferences) ||
                      (sportKey === 'running' && sportData?.preferences)) && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex flex-wrap gap-2">
                          {(sportData?.skills || sportData?.preferences || []).map((skill, skillIndex) => (
                            <span key={skillIndex} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {activeSportTab === "cycling" && (
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
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        Road
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        Social Rides
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        Commuting
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        Group Leader
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeSportTab === "running" && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-black">
                      Distance Running
                    </h4>
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
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        Trail
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        Road
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        Morning Runs
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activities & Reviews Section */}
        {isVisible("activities") && (
          <div ref={activitiesRef} className="px-6 pb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-black">
                Activities & Reviews
              </h3>
              <span className="text-sm text-gray-500">
                {totalActivities} total
              </span>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
              <button
                onClick={() => setActiveTab("completed")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "completed"
                    ? "bg-white text-explore-green shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Completed Activities
              </button>
              <button
                onClick={() => setActiveTab("organized")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "organized"
                    ? "bg-white text-explore-green shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Organized Activities
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-3">
              {activeTab === "completed" ? (
                <>
                  {/* Completed Activities with Reviews */}
                  {completedActivities.length > 0 ? (
                    completedActivities.map((activity) => (
                      <div key={activity.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="text-2xl">
                            {activity.activity_type === 'climbing' && '🧗'}
                            {activity.activity_type === 'cycling' && '🚴'}
                            {activity.activity_type === 'running' && '🏃'}
                            {activity.activity_type === 'hiking' && '🥾'}
                            {!['climbing', 'cycling', 'running', 'hiking'].includes(activity.activity_type) && '🏃'}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-black">
                              {activity.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {activity.organizer_name} • {new Date(activity.date).toLocaleDateString()}
                            </p>
                            {activity.recent_review && (
                              <div className="flex items-center gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-3 h-3 ${
                                      star <= activity.recent_review!.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                                <span className="text-xs text-gray-500 ml-1">
                                  Your review: "{activity.recent_review.comment}"
                                </span>
                              </div>
                            )}
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No completed activities yet</p>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-2xl">🚴</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-black">
                          Sunday Morning Social Ride
                        </h4>
                        <p className="text-sm text-gray-600">
                          Richmond Running Club • Feb 2, 2025
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4].map((star) => (
                            <Star
                              key={star}
                              className="w-3 h-3 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                          <Star className="w-3 h-3 text-gray-300" />
                          <span className="text-xs text-gray-500 ml-1">
                            Your review: "Great route, friendly group"
                          </span>
                        </div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-2xl">🏃</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-black">
                          Richmond Park Morning Run
                        </h4>
                        <p className="text-sm text-gray-600">
                          Run Club London • Jan 28, 2025
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="w-3 h-3 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-1">
                            Your review: "Perfect pace for beginners"
                          </span>
                        </div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Organized Activities */}
                  {organizedActivities.length > 0 ? (
                    organizedActivities.map((activity) => (
                      <div key={activity.id} className="bg-blue-50 rounded-lg p-4 border-l-4 border-explore-green">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="text-2xl">
                            {activity.activity_type === 'climbing' && '🧗'}
                            {activity.activity_type === 'cycling' && '🚴'}
                            {activity.activity_type === 'running' && '🏃'}
                            {activity.activity_type === 'hiking' && '🥾'}
                            {!['climbing', 'cycling', 'running', 'hiking'].includes(activity.activity_type) && '🏃'}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-black">
                              {activity.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              You organized • {new Date(activity.date).toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-3 h-3 ${
                                      star <= Math.round(activity.average_rating || 0)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-600">
                                {activity.average_rating ? activity.average_rating.toFixed(1) : '0.0'} avg rating ({activity.total_reviews || 0} reviews)
                              </span>
                            </div>
                            {activity.recent_review && (
                              <p className="text-xs text-gray-500 mt-1">
                                "{activity.recent_review.comment}" - {activity.recent_review.reviewer_name}
                              </p>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{activity.participant_count} joined</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No organized activities yet</p>
                    </div>
                  )}
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
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors touchable native-button-press">
                <img
                  src={getClubProfileImage("Westway Climbing Centre")}
                  alt="Westway Climbing"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-black">
                    {getClubDisplayName("Westway Climbing Centre")}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {getClubMemberCount("Westway Climbing Centre")} members
                  </p>
                </div>
              </div>
            </Link>

            <Link to="/club/richmond-runners" className="block">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors touchable native-button-press">
                <img
                  src={getClubProfileImage("Richmond Running Club")}
                  alt="Richmond Running Club"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-black">
                    {getClubDisplayName("Richmond Running Club")}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {getClubMemberCount("Richmond Running Club")} members
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Location Section */}
        {isVisible("location") && (
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
                {
                  name: "Alice Johnson",
                  university: "Oxford University",
                  image:
                    "https://images.unsplash.com/photo-1494790108755-2616b612b647?w=40&h=40&fit=crop",
                },
                {
                  name: "Sarah Chen",
                  university: "LSE",
                  image:
                    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop",
                },
                {
                  name: "Emma Wilson",
                  university: "UCL",
                  image:
                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop",
                },
              ].map((follower, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <img
                    src={follower.image}
                    alt={follower.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-black">{follower.name}</h4>
                    <p className="text-sm text-gray-600">
                      {follower.university}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-explore-green text-white rounded-lg text-sm">
                    Follow
                  </button>
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
                {
                  name: "Coach Holly",
                  university: "Westway Climbing",
                  image:
                    "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop",
                },
                {
                  name: "Marcus Rodriguez",
                  university: "Richmond RC",
                  image:
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop",
                },
                {
                  name: "Katie Miller",
                  university: "Oxford UUCC",
                  image:
                    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop",
                },
              ].map((followed, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <img
                    src={followed.image}
                    alt={followed.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-black">{followed.name}</h4>
                    <p className="text-sm text-gray-600">
                      {followed.university}
                    </p>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                    Following
                  </button>
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
