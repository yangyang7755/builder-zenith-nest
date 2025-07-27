import {
  Search,
  SlidersHorizontal,
  Calendar,
  MapPin,
  Bike,
  Mountain,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useActivities } from "../contexts/ActivitiesContext";

const activitiesData = [
  {
    id: 1,
    title: "Westway women's+ climbing ses...",
    date: "Wednesday",
    location: "",
    isWestway: true,
  },
  {
    id: 2,
    title: "Sport climbing taster session",
    date: "17.06",
    location: "Malham",
  },
  {
    id: 3,
    title: "Lead climbing at Parthian",
    date: "Friday",
    location: "Manchester",
  },
  {
    id: 4,
    title: "Westway women's+ climbing ses...",
    date: "19.06",
    location: "London, UK",
  },
  {
    id: 5,
    title: "Sports climbing taster session",
    date: "Monday",
    location: "Gower",
  },
  {
    id: 6,
    title: "Climbing at Parthian, Matchworks",
    date: "Thursday",
    location: "Parthian Matchworks",
  },
  {
    id: 7,
    title: "Sports climbing with new friends",
    date: "Sunday",
    location: "Llanberis",
  },
];

export default function Activities() {
  const { activities } = useActivities();

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

      {/* Main Content */}
      <div className="px-6 pb-20">
        {/* Title */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-explore-green font-cabin">
            Activities
          </h1>
        </div>

        {/* Search and Filter Row */}
        <div className="flex gap-3 mb-6">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <div className="bg-white border-2 border-black rounded-full h-12 flex items-center px-4">
              <Search className="w-5 h-5 text-black mr-3" />
              <span className="text-black text-base font-cabin">Search</span>
            </div>
          </div>

          {/* Filter Button */}
          <button className="bg-gray-200 rounded-full px-4 h-12 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-black" />
            <span className="text-black text-base font-cabin">Filter</span>
          </button>
        </div>

        {/* Activities List */}
        <div className="space-y-2">
          {/* User Created Activities */}
          {activities.map((activity) => (
            <CreatedActivityItem key={activity.id} activity={activity} />
          ))}

          {/* Default Activities */}
          {activitiesData.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

function CreatedActivityItem({ activity }: { activity: any }) {
  return (
    <div className="bg-explore-gray border-2 border-explore-green rounded-lg p-4 mb-3">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-explore-green rounded-full flex items-center justify-center flex-shrink-0">
            {activity.type === "cycling" ? (
              <Bike className="w-6 h-6 text-white" />
            ) : (
              <Mountain className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-explore-green font-cabin text-base">
              {activity.title}
            </h3>
            <p className="text-xs text-gray-600 font-cabin">
              By {activity.organizer}
            </p>
          </div>
        </div>
        <button className="bg-explore-green text-white px-4 py-2 rounded-lg text-sm font-cabin font-medium">
          Request to join
        </button>
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-explore-green" />
          <span className="text-sm text-black font-cabin">{activity.date}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center">
            <span className="text-explore-green text-xs">🕒</span>
          </div>
          <span className="text-sm text-black font-cabin">{activity.time}</span>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-explore-green" />
        <span className="text-sm text-black font-cabin">
          {activity.location}
        </span>
      </div>

      {/* Activity specific metrics */}
      {activity.type === "cycling" && (
        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
          {activity.distance && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <span className="text-explore-green text-xs">📍</span>
              </div>
              <span className="text-black font-cabin">
                {activity.distance} {activity.distanceUnit}
              </span>
            </div>
          )}
          {activity.elevation && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <span className="text-explore-green text-xs">⛰️</span>
              </div>
              <span className="text-black font-cabin">
                {activity.elevation} {activity.elevationUnit}
              </span>
            </div>
          )}
          {activity.pace && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <span className="text-explore-green text-xs">🚴</span>
              </div>
              <span className="text-black font-cabin">
                {activity.pace} {activity.paceUnit}
              </span>
            </div>
          )}
          {activity.maxParticipants && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <span className="text-explore-green text-xs">👥</span>
              </div>
              <span className="text-black font-cabin">
                Max {activity.maxParticipants} riders
              </span>
            </div>
          )}
        </div>
      )}

      {activity.type === "climbing" && (
        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
          {activity.climbingLevel && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <span className="text-explore-green text-xs">📊</span>
              </div>
              <span className="text-black font-cabin">
                Level: {activity.climbingLevel}
              </span>
            </div>
          )}
          {activity.maxParticipants && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <span className="text-explore-green text-xs">👥</span>
              </div>
              <span className="text-black font-cabin">
                Max {activity.maxParticipants} people
              </span>
            </div>
          )}
          {activity.languages && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <span className="text-explore-green text-xs">🗣️</span>
              </div>
              <span className="text-black font-cabin">
                {activity.languages}
              </span>
            </div>
          )}
          {activity.gearRequired && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <span className="text-explore-green text-xs">⚙️</span>
              </div>
              <span className="text-black font-cabin">
                {activity.gearRequired}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Special comments */}
      {activity.specialComments && (
        <div className="mt-3 p-3 bg-white rounded-lg">
          <p className="text-sm text-black font-cabin">
            <span className="font-bold text-explore-green">
              Special comments:
            </span>
            <br />
            {activity.specialComments}
          </p>
        </div>
      )}
    </div>
  );
}

function ActivityItem({ activity }: { activity: (typeof activitiesData)[0] }) {
  return (
    <div className="flex items-center gap-3 py-4">
      {/* Activity Icon */}
      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
        <svg
          className="w-6 h-6 text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm1 14v6h-2v-6H8.5l2-8h3l2 8H13z" />
        </svg>
      </div>

      {/* Activity Details */}
      <div className="flex-1">
        <h3 className="font-bold text-black font-cabin text-base mb-2">
          {activity.title}
        </h3>
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-black" />
            <span className="text-sm text-black font-cabin">
              {activity.date}
            </span>
          </div>
          {activity.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-black" />
              <span className="text-sm text-black font-cabin">
                {activity.location}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Join Button */}
      {activity.isWestway ? (
        <Link
          to="/activity/westway-womens-climb"
          className="bg-explore-green text-white px-4 py-2 rounded-lg text-sm font-cabin font-medium"
        >
          Request to join
        </Link>
      ) : (
        <button className="bg-explore-green text-white px-4 py-2 rounded-lg text-sm font-cabin font-medium">
          Request to join
        </button>
      )}
    </div>
  );
}

function BottomNavigation() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white h-14 flex items-center justify-around border-t border-gray-200 max-w-md mx-auto">
      {/* Home Icon */}
      <Link to="/explore" className="p-2">
        <svg className="w-8 h-7" viewBox="0 0 35 31" fill="none">
          <path
            d="M31.4958 7.46836L21.4451 1.22114C18.7055 -0.484058 14.5003 -0.391047 11.8655 1.42266L3.12341 7.48386C1.37849 8.693 0 11.1733 0 13.1264V23.8227C0 27.7756 3.61199 31 8.06155 31H26.8718C31.3213 31 34.9333 27.7911 34.9333 23.8382V13.328C34.9333 11.2353 33.4152 8.662 31.4958 7.46836ZM18.7753 24.7993C18.7753 25.4349 18.1821 25.9619 17.4666 25.9619C16.7512 25.9619 16.1579 25.4349 16.1579 24.7993V20.1487C16.1579 19.5132 16.7512 18.9861 17.4666 18.9861C18.1821 18.9861 18.7753 19.5132 18.7753 20.1487V24.7993Z"
            fill="#2F2F2F"
          />
        </svg>
      </Link>

      {/* Clock Icon */}
      <div className="p-2">
        <svg
          className="w-7 h-7"
          viewBox="0 0 30 30"
          fill="none"
          stroke="#1E1E1E"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="15" cy="15" r="12.5" />
          <path d="M15 7.5V15L20 17.5" />
        </svg>
      </div>

      {/* Plus Icon */}
      <Link to="/create" className="p-2">
        <svg
          className="w-7 h-7"
          viewBox="0 0 30 30"
          fill="none"
          stroke="#1E1E1E"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 6.25V23.75" />
        </svg>
      </Link>

      {/* Chat Icon */}
      <Link to="/chat" className="p-2">
        <svg className="w-7 h-7" viewBox="0 0 30 30" fill="none">
          <path
            d="M2.5 27.5V5C2.5 4.3125 2.74479 3.72396 3.23438 3.23438C3.72396 2.74479 4.3125 2.5 5 2.5H25C25.6875 2.5 26.276 2.74479 26.7656 3.23438C27.2552 3.72396 27.5 4.3125 27.5 5V20C27.5 20.6875 27.2552 21.276 26.7656 21.7656C26.276 22.2552 25.6875 22.5 25 22.5H7.5L2.5 27.5Z"
            fill="#1D1B20"
          />
        </svg>
      </Link>

      {/* Profile Icon */}
      <div className="p-2">
        <svg className="w-8 h-8" viewBox="0 0 35 35" fill="none">
          <path
            d="M17.5 17.4999C15.8958 17.4999 14.5225 16.9287 13.3802 15.7864C12.2378 14.644 11.6666 13.2708 11.6666 11.6666C11.6666 10.0624 12.2378 8.68915 13.3802 7.54679C14.5225 6.40443 15.8958 5.83325 17.5 5.83325C19.1041 5.83325 20.4774 6.40443 21.6198 7.54679C22.7621 8.68915 23.3333 10.0624 23.3333 11.6666C23.3333 13.2708 22.7621 14.644 21.6198 15.7864C20.4774 16.9287 19.1041 17.4999 17.5 17.4999ZM5.83331 29.1666V25.0833C5.83331 24.2569 6.04599 23.4973 6.47133 22.8046C6.89668 22.1119 7.46179 21.5833 8.16665 21.2187C9.67359 20.4652 11.2048 19.9001 12.7604 19.5234C14.316 19.1466 15.8958 18.9583 17.5 18.9583C19.1041 18.9583 20.684 19.1466 22.2396 19.5234C23.7951 19.9001 25.3264 20.4652 26.8333 21.2187C27.5382 21.5833 28.1033 22.1119 28.5286 22.8046C28.954 23.4973 29.1666 24.2569 29.1666 25.0833V29.1666H5.83331Z"
            fill="#1D1B20"
          />
        </svg>
      </div>

      {/* Navigation Indicator */}
      <div className="absolute bottom-2 left-12 w-2 h-2 bg-white border border-explore-green rounded-full"></div>
    </div>
  );
}
