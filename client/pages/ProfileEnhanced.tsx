import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Share,
  Edit,
  CheckCircle,
  Star,
  MessageSquare,
  MapPin,
  Settings,
  User,
  Mail,
  Calendar,
  Award,
  Activity,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";
import BottomNavigation from "../components/BottomNavigation";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";

export default function ProfileEnhanced() {
  const { user, profile: authProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [savedActivities, setSavedActivities] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"activities" | "saved" | "clubs">(
    "activities",
  );

  // Load user profile and related data
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Use auth profile if available, otherwise fetch from backend
        if (authProfile) {
          setProfile(authProfile);
        } else {
          const { data: profileResult } = await apiService.getUserProfile(
            user.id,
          );
          if (profileResult?.success) {
            setProfile(profileResult.profile);
          }
        }

        // Load user activities
        const { data: activitiesResult } = await apiService.getUserActivities(
          user.id,
        );
        if (activitiesResult && !activitiesResult.error) {
          setActivities(activitiesResult || []);
        }

        // Load saved activities
        const { data: savedResult } = await apiService.getSavedActivities();
        if (savedResult?.success) {
          setSavedActivities(savedResult.data || []);
        }

        // Load user clubs
        const { data: clubsResult } = await apiService.getUserClubs();
        if (clubsResult && !clubsResult.error) {
          setClubs(clubsResult || []);
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user, authProfile, toast]);

  const handleEditProfile = () => {
    navigate("/profile/edit-comprehensive");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-md mx-auto">
          {/* Header Skeleton */}
          <div className="bg-white p-6 border-b">
            <div className="flex items-center gap-4">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="p-6 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-6">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Not Signed In
          </h2>
          <p className="text-gray-600 mb-4">
            Please sign in to view your profile
          </p>
          <Link
            to="/login"
            className="bg-explore-green text-white px-6 py-2 rounded-lg hover:bg-explore-green/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const displayProfile = profile || authProfile || {};
  const userName = displayProfile.full_name || user.email || "User";
  const userEmail = displayProfile.email || user.email || "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold">Profile</h1>
            <button
              onClick={handleEditProfile}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-white p-6 border-b">
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={displayProfile.profile_image} alt={userName} />
              <AvatarFallback className="bg-explore-green text-white text-lg">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {userName}
              </h2>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{userEmail}</span>
              </div>

              {displayProfile.university && (
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{displayProfile.university}</span>
                </div>
              )}

              <div className="flex gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">
                    {activities.length}
                  </div>
                  <div className="text-gray-600">Activities</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">
                    {clubs.length}
                  </div>
                  <div className="text-gray-600">Clubs</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">
                    {savedActivities.length}
                  </div>
                  <div className="text-gray-600">Saved</div>
                </div>
              </div>
            </div>
          </div>

          {displayProfile.bio && (
            <div className="mb-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                {displayProfile.bio}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleEditProfile}
              className="flex-1 bg-explore-green text-white py-2 px-4 rounded-lg hover:bg-explore-green/90 transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Share className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab("activities")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === "activities"
                  ? "text-explore-green border-b-2 border-explore-green"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Activity className="w-4 h-4" />
                Activities ({activities.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === "saved"
                  ? "text-explore-green border-b-2 border-explore-green"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Star className="w-4 h-4" />
                Saved ({savedActivities.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("clubs")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === "clubs"
                  ? "text-explore-green border-b-2 border-explore-green"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Award className="w-4 h-4" />
                Clubs ({clubs.length})
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 pb-20">
          {activeTab === "activities" && (
            <div>
              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {activity.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {activity.date} at {activity.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{activity.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Activities Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start by creating your first activity!
                  </p>
                  <Link
                    to="/create"
                    className="bg-explore-green text-white px-6 py-2 rounded-lg hover:bg-explore-green/90 transition-colors"
                  >
                    Create Activity
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "saved" && (
            <div>
              {savedActivities.length > 0 ? (
                <div className="space-y-3">
                  {savedActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {activity.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {activity.date} at {activity.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{activity.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Saved Activities
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Save activities you're interested in!
                  </p>
                  <Link
                    to="/explore"
                    className="bg-explore-green text-white px-6 py-2 rounded-lg hover:bg-explore-green/90 transition-colors"
                  >
                    Explore Activities
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "clubs" && (
            <div>
              {clubs.length > 0 ? (
                <div className="space-y-3">
                  {clubs.map((club) => (
                    <div
                      key={club.id}
                      className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage
                            src={club.profile_image}
                            alt={club.name}
                          />
                          <AvatarFallback className="bg-explore-green text-white">
                            {getInitials(club.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {club.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {club.location}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {club.userRole || "Member"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Clubs Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Join clubs to connect with like-minded people!
                  </p>
                  <Link
                    to="/explore"
                    className="bg-explore-green text-white px-6 py-2 rounded-lg hover:bg-explore-green/90 transition-colors"
                  >
                    Find Clubs
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <BottomNavigation />
      </div>
    </div>
  );
}
