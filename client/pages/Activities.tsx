import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark, Clock, MapPin, Users, CheckCircle } from "lucide-react";
import { useSavedActivities } from "../contexts/SavedActivitiesContext";
import { Activity } from "../contexts/ActivitiesContext";
import BackendTest from "../components/BackendTest";
import DemoAuth from "../components/DemoAuth";
import UserNav from "../components/UserNav";
import BottomNavigation from "../components/BottomNavigation";

export default function Activities() {
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
      date: "2025-01-26",
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
      date: "2025-02-02",
      time: "08:00",
      location: "Richmond Park",
      organizer: "Richmond Cycling Club",
      type: "cycling",
      status: "confirmed",
      maxParticipants: "15",
      specialComments: "",
      meetupLocation: "Richmond Park Main Gate",
      gender: "All genders",
      visibility: "All",
      createdAt: new Date(),
    },
  ];

  const navigate = useNavigate();

  const handleActivityClick = (activity: Activity) => {
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "cycling":
        return "🚴";
      case "climbing":
        return "🧗";
      case "running":
        return "🏃";
      case "hiking":
        return "🥾";
      case "skiing":
        return "🎿";
      case "surfing":
        return "🏄";
      case "tennis":
        return "🎾";
      default:
        return "⚡";
    }
  };

  const ActivityCard = ({ activity }: { activity: any }) => (
    <div
      onClick={() => handleActivityClick(activity)}
      className="bg-white rounded-lg border border-gray-200 p-4 mb-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-black font-cabin mb-1">
            {activity.title}
          </h3>
          <p className="text-sm text-gray-600 font-cabin">
            By {activity.organizer}
          </p>
        </div>
        <div className="text-2xl ml-2">{getActivityIcon(activity.type)}</div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="font-cabin">
            {new Date(activity.date).toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}{" "}
            at {activity.time}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="font-cabin">{activity.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span className="font-cabin">Max {activity.maxParticipants} people</span>
        </div>
      </div>

      {activity.status && (
        <div className="flex items-center gap-2 mt-3">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-green-600 font-cabin capitalize">
            {activity.status}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="react-native-container bg-white font-cabin relative native-scroll">
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

      {/* Main Content */}
      <div className="px-6 pb-24">
        {/* Title */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-explore-green font-cabin">
            All Activities
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setSelectedTab("Saved")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedTab === "Saved"
                ? "bg-white text-explore-green shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Saved Activities
          </button>
          <button
            onClick={() => setSelectedTab("Joined")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedTab === "Joined"
                ? "bg-white text-explore-green shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Joined Activities
          </button>
        </div>

        {/* Content */}
        {selectedTab === "Saved" && (
          <div>
            <h2 className="text-xl font-bold text-black font-cabin mb-4">
              Upcoming Activities ({upcomingSavedActivities.length})
            </h2>
            {upcomingSavedActivities.length > 0 ? (
              upcomingSavedActivities.map((activity, index) => (
                <ActivityCard key={index} activity={activity} />
              ))
            ) : (
              <div className="text-center py-8">
                <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-cabin">
                  No upcoming saved activities
                </p>
                <Link
                  to="/explore"
                  className="text-explore-green font-medium font-cabin hover:underline"
                >
                  Explore activities to save
                </Link>
              </div>
            )}

            {pastSavedActivities.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-black font-cabin mb-4">
                  Past Activities ({pastSavedActivities.length})
                </h2>
                {pastSavedActivities.map((activity, index) => (
                  <ActivityCard key={index} activity={activity} />
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === "Joined" && (
          <div>
            <h2 className="text-xl font-bold text-black font-cabin mb-4">
              Joined Activities ({joinedActivities.length})
            </h2>
            {joinedActivities.length > 0 ? (
              joinedActivities.map((activity, index) => (
                <ActivityCard key={index} activity={activity} />
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-cabin">
                  No joined activities yet
                </p>
                <Link
                  to="/explore"
                  className="text-explore-green font-medium font-cabin hover:underline"
                >
                  Find activities to join
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Development Tools */}
      <div className="px-6 pb-6">
        <BackendTest />
        <DemoAuth />
        <UserNav />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
