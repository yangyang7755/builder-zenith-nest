import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  ArrowLeft,
  Users,
  Calendar,
  LogOut,
  Send,
  Settings,
  UserPlus,
} from "lucide-react";
import { useClub } from "../contexts/ClubContext";
import { getActualMemberCount, formatMemberCount } from "../utils/clubUtils";

export default function ClubOxford() {
  const navigate = useNavigate();
  const { getClubById, isClubMember, isClubManager, requestToJoinClub } =
    useClub();
  const club = getClubById("oucc");
  const isMember = isClubMember("oucc");
  const isManager = isClubManager("oucc");

  const [selectedTab, setSelectedTab] = useState("events");
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      user: "Tom",
      message: "Training ride tomorrow! Meet at Radcliffe Camera 7am",
      time: "2 hours ago",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    {
      id: 2,
      user: "Emma",
      message: "I'll be there! What's the route?",
      time: "1 hour ago",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
    },
    {
      id: 3,
      user: "You",
      message: "Sounds great! Count me in 🚴‍♂️",
      time: "30 minutes ago",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
  ]);

  const upcomingEvents = [
    {
      id: 1,
      title: "Weekend Road Ride",
      date: "Jun 29",
      time: "8:00 AM",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      type: "cycling",
      location: "Radcliffe Camera, Oxford",
      distance: "45km",
      pace: "25 kph",
    },
    {
      id: 2,
      title: "Track Training Session",
      date: "Jul 3",
      time: "6:00 PM",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
      type: "cycling",
      location: "Iffley Road Track",
      distance: "20km",
      pace: "Intervals",
    },
    {
      id: 3,
      title: "Social Ride & Pub",
      date: "Jul 12",
      time: "4:00 PM",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      type: "cycling",
      location: "Port Meadow",
      distance: "25km",
      pace: "Leisurely",
    },
  ];

  const handleEventClick = (event: any) => {
    // Navigate to activity details page
    navigate("/activity/sunday-morning-ride");
  };

  const handleLeaveClub = () => {
    setShowLeaveConfirm(true);
  };

  const confirmLeaveClub = () => {
    setIsMember(false);
    setShowLeaveConfirm(false);
    alert("You have left Oxford University Cycling Club");
    navigate(-1);
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        user: "You",
        message: chatMessage,
        time: "Just now",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage("");
    }
  };

  const handleJoinRequest = () => {
    requestToJoinClub("oucc", joinMessage);
    setShowJoinModal(false);
    setJoinMessage("");
    alert("Join request sent! You'll be notified once it's reviewed.");
  };

  const members = [
    {
      name: "Tom",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    {
      name: "Emma",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
    },
    {
      name: "James",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    },
    {
      name: "Sophie",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
    },
    {
      name: "Alex",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    {
      name: "Lucy",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
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

      {/* Header */}
      <div className="flex items-center px-6 py-4">
        <button onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
        <h1 className="text-xl font-bold text-black font-cabin">Club</h1>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto pb-20">
        {/* Club Header */}
        <div className="px-6 pb-6">
          <div className="flex flex-col items-center text-center">
            {/* Club Logo */}
            <div className="w-32 h-32 rounded-full border-2 border-black overflow-hidden mb-4 bg-blue-900 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-2xl font-bold">OUCC</div>
                <div className="text-xs">EST. 1873</div>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center gap-1 text-sm text-black font-cabin mb-3">
              <MapPin className="w-4 h-4" />
              <span>Oxford University, Oxford, United Kingdom</span>
            </div>

            {/* Club Name */}
            <h2 className="text-2xl font-bold text-explore-green font-cabin mb-2">
              Oxford University Cycling Club
            </h2>

            {/* Description */}
            <p className="text-sm text-black font-cabin text-center mb-6 max-w-xs">
              One of the oldest cycling clubs in the world. Join us for training
              rides, races, and social events throughout the year.
            </p>

            {/* Member Status and Actions */}
            {isMember ? (
              <div className="flex flex-col gap-3">
                <div className="w-48 h-12 flex items-center justify-center bg-gray-100 rounded-lg">
                  <span className="text-explore-green font-cabin font-medium">
                    ✓ {isManager ? "Manager" : "Member"}
                  </span>
                </div>

                {isManager && (
                  <button
                    onClick={() => navigate("/club/oucc/manage")}
                    className="w-48 h-10 flex items-center justify-center gap-2 bg-explore-green text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="font-cabin font-medium text-sm">
                      Manage Club
                    </span>
                  </button>
                )}

                <button
                  onClick={handleLeaveClub}
                  className="w-48 h-10 flex items-center justify-center gap-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-cabin font-medium text-sm">
                    Leave Club
                  </span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowJoinModal(true)}
                className="w-48 h-14 bg-explore-green text-white rounded-lg font-cabin font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Request to Join
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setSelectedTab("events")}
              className={`flex-1 py-3 text-center font-cabin ${
                selectedTab === "events"
                  ? "text-explore-green border-b-2 border-explore-green font-medium"
                  : "text-gray-500"
              }`}
            >
              Upcoming Events
            </button>
            <button
              onClick={() => setSelectedTab("members")}
              className={`flex-1 py-3 text-center font-cabin ${
                selectedTab === "members"
                  ? "text-explore-green border-b-2 border-explore-green font-medium"
                  : "text-gray-500"
              }`}
            >
              Members
            </button>
            <button
              onClick={() => setSelectedTab("chat")}
              className={`flex-1 py-3 text-center font-cabin ${
                selectedTab === "chat"
                  ? "text-explore-green border-b-2 border-explore-green font-medium"
                  : "text-gray-500"
              }`}
            >
              Club Chat
            </button>
          </div>
        </div>

        {/* Content based on selected tab */}
        <div className="px-6">
          {selectedTab === "events" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-black font-cabin">
                  Upcoming Events
                </h3>
                <Link
                  to="/explore?clubOnly=true"
                  className="text-sm text-explore-green underline font-cabin"
                >
                  See all
                </Link>
              </div>
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  onClick={() => handleEventClick(event)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={event.avatar}
                        alt="Organizer"
                        className="w-10 h-10 rounded-full border border-black object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-black font-cabin">
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-cabin">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {event.date} {event.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      className="bg-explore-green text-white px-4 py-2 rounded-lg text-sm font-cabin hover:bg-explore-green-dark transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Joined ${event.title}!`);
                      }}
                    >
                      Join
                    </button>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-600 font-cabin pl-13">
                    <span>📍 {event.location}</span>
                    <span>��� {event.distance}</span>
                    <span>⚡ {event.pace}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTab === "members" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-black font-cabin">
                  Members
                </h3>
                <span className="text-sm text-gray-500 font-cabin">
                  {formatMemberCount(getActualMemberCount(club))}
                </span>
              </div>

              {/* Club Managers Section */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-black font-cabin mb-3">
                  Club Managers
                </h4>
                <div className="grid grid-cols-6 gap-4">
                  {club?.managers.map((managerId, index) => {
                    // Map manager IDs to display names
                    const managerName =
                      managerId === "current-user"
                        ? "You"
                        : managerId === "coach-holly"
                          ? "Coach Holly"
                          : `Manager ${managerId}`;
                    return (
                      <div key={managerId} className="text-center">
                        <img
                          src={
                            managerId === "current-user"
                              ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                              : managerId === "coach-holly"
                                ? "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop&crop=face"
                                : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                          }
                          alt={managerName}
                          className="w-12 h-12 rounded-full border-2 border-explore-green object-cover mx-auto mb-2"
                        />
                        <span className="text-xs text-black font-cabin font-medium">
                          {managerName}
                        </span>
                        <div className="text-xs text-explore-green font-cabin">
                          Manager
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Regular Members Section */}
              <div>
                <h4 className="text-md font-medium text-black font-cabin mb-3">
                  Members
                </h4>
                <div className="grid grid-cols-6 gap-4">
                  {members.map((member, index) => (
                    <div key={index} className="text-center">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-12 h-12 rounded-full border border-black object-cover mx-auto mb-2"
                      />
                      <span className="text-xs text-black font-cabin">
                        {member.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center mt-6">
                <button
                  onClick={() => navigate("/club/oucc/manage")}
                  className="text-explore-green font-cabin underline"
                >
                  {isManager ? "Manage Members" : "View All"}
                </button>
              </div>
            </div>
          )}

          {selectedTab === "chat" && (
            <div>
              <h3 className="text-lg font-medium text-black font-cabin mb-4">
                Club Chat
              </h3>

              {/* Recent Messages Preview */}
              <div className="border-2 border-gray-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Recent Messages
                </h4>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {chatMessages.slice(-3).map((msg) => (
                    <div key={msg.id} className="flex items-start gap-3">
                      <img
                        src={msg.avatar}
                        alt={msg.user}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-xs text-black font-cabin">
                            {msg.user}
                          </span>
                          <span className="text-xs text-gray-500 font-cabin">
                            {msg.time}
                          </span>
                        </div>
                        <div className="text-xs text-gray-700 font-cabin">
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Go to Full Chat Button */}
              <button
                onClick={() => navigate("/club-chat/oxford")}
                className="w-full bg-explore-green text-white py-3 rounded-lg font-cabin font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Join Club Chat
              </button>

              <p className="text-xs text-gray-500 text-center mt-2 font-cabin">
                Click to join the full club conversation
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Leave Club Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-black font-cabin mb-2">
                Leave Club
              </h3>
              <p className="text-gray-600 font-cabin">
                Are you sure you want to leave Oxford University Cycling Club?
                You'll lose access to club events and chat.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={confirmLeaveClub}
                className="w-full py-3 bg-red-500 text-white rounded-lg font-cabin font-medium hover:bg-red-600 transition-colors"
              >
                Yes, Leave Club
              </button>
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="w-full py-3 border-2 border-gray-300 rounded-lg text-gray-600 font-cabin font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Club Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
            <h3 className="text-xl font-bold text-explore-green font-cabin mb-4">
              Request to Join OUCC
            </h3>
            <p className="text-sm text-gray-600 font-cabin mb-4">
              Send a message to the club managers with your request.
            </p>
            <textarea
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              placeholder="Hi! I'd love to join the Oxford University Cycling Club. I'm passionate about cycling and..."
              className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin h-24 resize-none mb-4"
            />
            <div className="space-y-3">
              <button
                onClick={handleJoinRequest}
                className="w-full py-3 bg-explore-green text-white rounded-lg font-cabin font-medium hover:bg-green-600 transition-colors"
              >
                Send Request
              </button>
              <button
                onClick={() => setShowJoinModal(false)}
                className="w-full py-3 border-2 border-gray-300 rounded-lg text-gray-600 font-cabin font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
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
            d="M31.4958 7.46836L21.4451 1.22114C18.7055 -0.484058 14.5003 -0.391047 11.8655 1.42266L3.12341 7.48386C1.37849 8.693 0 11.1733 0 13.1264V23.8227C0 27.7756 3.61199 31 8.06155 31H26.8718C31.3213 31 34.9333 27.7911 34.9333 23.8382V13.328C34.9333 11.2353 33.4152 8.662 31.4958 7.46836ZM18.7753 24.7993C18.7753 25.4349 18.1821 25.9619 17.4666 25.9619C16.7512 25.9619 16.1579 25.4349 16.1579 24.7993V20.1487C16.1579 19.5132 16.7512 18.9861 17.4666 18.9861C18.1821 18.9861 18.7753 20.1487V24.7993Z"
            fill="#2F2F2F"
          />
        </svg>
      </Link>

      {/* Clock Icon */}
      <Link to="/saved" className="p-2">
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
      </Link>

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
          <path d="M15 6.25V23.75M6.25 15H23.75" />
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
      <Link to="/profile" className="p-2">
        <svg className="w-8 h-8" viewBox="0 0 35 35" fill="none">
          <path
            d="M17.5 17.4999C15.8958 17.4999 14.5225 16.9287 13.3802 15.7864C12.2378 14.644 11.6666 13.2708 11.6666 11.6666C11.6666 10.0624 12.2378 8.68915 13.3802 7.54679C14.5225 6.40443 15.8958 5.83325 17.5 5.83325C19.1041 5.83325 20.4774 6.40443 21.6198 7.54679C22.7621 8.68915 23.3333 10.0624 23.3333 11.6666C23.3333 13.2708 22.7621 14.644 21.6198 15.7864C20.4774 16.9287 19.1041 17.4999 17.5 17.4999ZM5.83331 29.1666V25.0833C5.83331 24.2569 6.04599 23.4973 6.47133 22.8046C6.89668 22.1119 7.46179 21.5833 8.16665 21.2187C9.67359 20.4652 11.2048 19.9001 12.7604 19.5234C14.316 19.1466 15.8958 18.9583 17.5 18.9583C19.1041 18.9583 20.684 19.1466 22.2396 19.5234C23.7951 19.9001 25.3264 20.4652 26.8333 21.2187C27.5382 21.5833 28.1033 22.1119 28.5286 22.8046C28.954 23.4973 29.1666 24.2569 29.1666 25.0833V29.1666H5.83331Z"
            fill="#1D1B20"
          />
        </svg>
      </Link>

      {/* Navigation Indicator */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border border-explore-green rounded-full"></div>
    </div>
  );
}
