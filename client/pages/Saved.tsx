import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark, Clock, MapPin, Users, CheckCircle } from "lucide-react";
import { useSavedActivities } from "../contexts/SavedActivitiesContext";
import { Activity } from "../contexts/ActivitiesContext";
import BackendTest from "../components/BackendTest";
import DemoAuth from "../components/DemoAuth";
import UserNav from "../components/UserNav";
import BottomNavigation from "../components/BottomNavigation";

export default function Saved() {
  const { savedActivities, unsaveActivity } = useSavedActivities();
  const [selectedTab, setSelectedTab] = useState("Saved");

  // Sort activities by date (future vs past)
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const upcomingSavedActivities = savedActivities.filter((activity) => {
    const activityDate = new Date(activity.date);
    const activityDateString = activityDate.toISOString().split("T")[0];
    return activityDateString >= today;
  });

  const pastSavedActivities = savedActivities.filter((activity) => {
    const activityDate = new Date(activity.date);
    const activityDateString = activityDate.toISOString().split("T")[0];
    return activityDateString < today;
  });

  // Sample joined activities (activities the user has joined)
  const joinedActivities = [
    {
      id: "joined-1",
      title: "Westway Women's+ Climbing Morning",
      date: "2025-04-26",
      time: "10:00",
      location: "Westway Climbing Centre",
      organizer: "Coach Holly Peristiani",
      type: "climbing",
      status: "confirmed",
      maxParticipants: "12",
      specialComments: "",
      meetupLocation: "Westway Climbing Centre",
      gender: "Female only",
      visibility: "All",
      createdAt: new Date(),
    },
    {
      id: "joined-2",
      title: "Sunday Morning Social Ride",
      date: "2025-05-02",
      time: "08:00",
      location: "Richmond Park",
      organizer: "Richmond Cycling Club",
      type: "cycling",
      status: "pending",
      distance: "25",
      distanceUnit: "km",
      pace: "20",
      paceUnit: "kph",
      maxParticipants: "15",
      specialComments: "",
      meetupLocation: "Richmond Park Main Gate",
      gender: "All genders",
      visibility: "All",
      createdAt: new Date(),
    },
  ];

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

      {/* User Navigation */}
      <div className="p-4 border-b bg-gray-50">
        <UserNav />
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto pb-20">
        <div className="px-6">
          {/* Title */}
          <div className="text-center py-6">
            <h1 className="text-4xl font-bold text-explore-green font-cabin">
              My Activities
            </h1>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            {["Saved", "Joined"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-cabin font-medium transition-colors ${
                  selectedTab === tab
                    ? "bg-explore-green text-white border-explore-green"
                    : "bg-white text-explore-green border-explore-green hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Saved Activities Tab */}
          {selectedTab === "Saved" && (
            <div>
              {/* No saved activities message */}
              {savedActivities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <Bookmark className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No saved activities yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Save activities from the explore page to see them here
                  </p>

                  {/* Backend Test */}
                  <div className="mb-6 grid gap-4 md:grid-cols-2">
                    <BackendTest />
                    <DemoAuth />
                  </div>

                  <Link
                    to="/explore"
                    className="inline-block bg-explore-green text-white px-6 py-3 rounded-lg font-cabin font-medium hover:bg-explore-green-dark transition-colors"
                  >
                    Explore Activities
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Upcoming Saved Activities */}
                  {upcomingSavedActivities.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold text-black font-cabin mb-4">
                        Upcoming ({upcomingSavedActivities.length})
                      </h2>
                      <div className="space-y-4">
                        {upcomingSavedActivities.map((activity) => (
                          <ActivityCard
                            key={activity.id}
                            activity={activity}
                            onUnsave={unsaveActivity}
                            showSaveButton={true}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Past Saved Activities */}
                  {pastSavedActivities.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold text-black font-cabin mb-4">
                        Past ({pastSavedActivities.length})
                      </h2>
                      <div className="space-y-4">
                        {pastSavedActivities.map((activity) => (
                          <ActivityCard
                            key={activity.id}
                            activity={activity}
                            onUnsave={unsaveActivity}
                            showSaveButton={true}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Joined Activities Tab */}
          {selectedTab === "Joined" && (
            <div>
              {joinedActivities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <CheckCircle className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No joined activities yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Join activities from the explore page to see them here
                  </p>
                  <Link
                    to="/explore"
                    className="inline-block bg-explore-green text-white px-6 py-3 rounded-lg font-cabin font-medium hover:bg-explore-green-dark transition-colors"
                  >
                    Explore Activities
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {joinedActivities.map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      showJoinedStatus={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

function ActivityCard({
  activity,
  onUnsave,
  showSaveButton = false,
  showJoinedStatus = false,
}: {
  activity: Activity | any;
  onUnsave?: (id: string) => void;
  showSaveButton?: boolean;
  showJoinedStatus?: boolean;
}) {
  const navigate = useNavigate();

  const handleUnsave = () => {
    if (onUnsave) {
      onUnsave(activity.id);
    }
  };

  const handleCardClick = () => {
    // Navigate to activity details based on activity type
    if (activity.type === "cycling") {
      navigate("/activity/sunday-morning-ride");
    } else if (activity.type === "climbing") {
      navigate("/activity/westway-womens-climb");
    } else if (activity.type === "running") {
      navigate("/activity/westway-womens-climb"); // Default for now
    } else {
      navigate("/activity/westway-womens-climb"); // Default
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? "PM" : "AM";
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "cycling":
        return "🚴";
      case "climbing":
        return "🧗";
      case "running":
        return "👟";
      default:
        return "⚡";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div
      className="border-2 border-gray-200 rounded-lg p-4 bg-white cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xl">{getActivityIcon(activity.type)}</span>
          <h3 className="text-lg font-semibold text-black font-cabin flex-1">
            {activity.title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {showJoinedStatus && activity.status && (
            <span
              className={`text-xs px-2 py-1 rounded-full font-cabin font-medium ${getStatusColor(activity.status)}`}
            >
              {activity.status.charAt(0).toUpperCase() +
                activity.status.slice(1)}
            </span>
          )}
          {showSaveButton && (
            <button
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleUnsave();
              }}
            >
              <Bookmark className="w-5 h-5 fill-explore-green text-explore-green" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-cabin">
            {formatDate(activity.date)} • {formatTime(activity.time)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-cabin">{activity.location}</span>
        </div>

        {activity.organizer && (
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span className="text-sm font-cabin">By {activity.organizer}</span>
          </div>
        )}

        {/* Activity-specific metrics */}
        {activity.type === "cycling" &&
          (activity.distance || activity.pace) && (
            <div className="flex gap-4 text-sm text-gray-600 mt-2">
              {activity.distance && (
                <span>
                  🚴 {activity.distance}
                  {activity.distanceUnit}
                </span>
              )}
              {activity.pace && (
                <span>
                  ⚡ {activity.pace} {activity.paceUnit}
                </span>
              )}
            </div>
          )}

        {activity.type === "running" &&
          (activity.distance || activity.pace) && (
            <div className="flex gap-4 text-sm text-gray-600 mt-2">
              {activity.distance && (
                <span>
                  🏃 {activity.distance}
                  {activity.distanceUnit}
                </span>
              )}
              {activity.pace && (
                <span>
                  ⚡ {activity.pace} {activity.paceUnit}
                </span>
              )}
            </div>
          )}
      </div>

      {/* Status Button for Joined Activities */}
      {showJoinedStatus && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <button
            onClick={(e) => e.stopPropagation()}
            className={`w-full py-2 rounded-lg text-sm font-cabin font-medium transition-colors ${
              activity.status === "confirmed"
                ? "bg-green-100 text-green-700 cursor-default"
                : activity.status === "pending"
                  ? "bg-yellow-100 text-yellow-700 cursor-default"
                  : "bg-gray-100 text-gray-700 cursor-default"
            }`}
          >
            {activity.status === "confirmed"
              ? "✓ Joined"
              : activity.status === "pending"
                ? "⏳ Pending"
                : "Request Status"}
          </button>
        </div>
      )}
    </div>
  );
}
