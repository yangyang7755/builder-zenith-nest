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

export default function ClubUCLMC() {
  const navigate = useNavigate();
  const { getClubById, isClubMember, isClubManager, requestToJoinClub } =
    useClub();
  const club = getClubById("uclmc");
  const isMember = isClubMember("uclmc");
  const isManager = isClubManager("uclmc");

  const [selectedTab, setSelectedTab] = useState("events");
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      user: "Lewis",
      message: "New routes set for this week! 🧗‍♂️",
      time: "2 hours ago",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    {
      id: 2,
      user: "Sarah",
      message: "Indoor session tonight at the climbing wall?",
      time: "1 hour ago",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
    },
    {
      id: 3,
      user: "You",
      message: "Count me in! What time?",
      time: "30 minutes ago",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
  ]);

  const upcomingEvents = [
    {
      id: 1,
      title: "Indoor Climbing Session",
      date: "Jun 29",
      time: "7:00 PM",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      type: "climbing",
      location: "UCLMC Climbing Wall",
      difficulty: "Mixed grades",
      duration: "2 hours",
    },
    {
      id: 2,
      title: "Outdoor Climbing Trip",
      date: "Jul 3",
      time: "9:00 AM",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
      type: "climbing",
      location: "Peak District",
      difficulty: "Sport 5.8-5.11",
      duration: "Full day",
    },
    {
      id: 3,
      title: "Beginner's Workshop",
      date: "Jul 8",
      time: "6:30 PM",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      type: "climbing",
      location: "UCLMC Climbing Wall",
      difficulty: "Beginner friendly",
      duration: "90 minutes",
    },
  ];

  const handleEventClick = (event: any) => {
    // Navigate to activity details page
    navigate("/activity/indoor-climbing-session");
  };

  const handleLeaveClub = () => {
    setShowLeaveConfirm(false);
    // Handle leaving club logic
  };

  const handleJoinClub = async () => {
    if (joinMessage.trim()) {
      await requestToJoinClub("uclmc", joinMessage);
      setShowJoinModal(false);
      setJoinMessage("");
    }
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        user: "You",
        message: chatMessage,
        time: "now",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage("");
    }
  };

  // Default club data if not found in context
  const clubData = club || {
    id: "uclmc",
    name: "UCLMC",
    description: "University College London Mountaineering Club - Climbing adventures for all skill levels",
    type: "climbing",
    location: "University College London",
    profileImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
    memberCount: 156,
    members: [],
    pendingRequests: [],
  };

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
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <Link
          to="/explore"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-black" />
        </Link>
        <h1 className="text-lg font-bold text-black font-cabin">
          {clubData.name}
        </h1>
        <div className="flex gap-2">
          {isManager && (
            <Link
              to={`/club/uclmc/manage`}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </Link>
          )}
        </div>
      </div>

      {/* Club Header */}
      <div className="px-6 py-6 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white shadow-lg">
            <img
              src={clubData.profileImage}
              alt={clubData.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-black font-cabin mb-2">
              {clubData.name}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{formatMemberCount(getActualMemberCount(clubData))}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{clubData.location}</span>
              </div>
            </div>
            <p className="text-sm text-gray-700 font-cabin mb-4">
              {clubData.description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          {isMember ? (
            <>
              <button
                onClick={() => navigate("/club-chat/uclmc")}
                className="flex-1 bg-explore-green text-white py-3 rounded-lg font-cabin font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Chat
              </button>
              <button
                onClick={() => setShowLeaveConfirm(true)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-cabin font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Leave
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex-1 bg-explore-green text-white py-3 rounded-lg font-cabin font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Join Club
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex gap-1">
          <button
            onClick={() => setSelectedTab("events")}
            className={`flex-1 py-3 text-center rounded-lg font-cabin font-medium transition-colors ${
              selectedTab === "events"
                ? "bg-explore-green text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setSelectedTab("about")}
            className={`flex-1 py-3 text-center rounded-lg font-cabin font-medium transition-colors ${
              selectedTab === "about"
                ? "bg-explore-green text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            About
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4 pb-20">
        {selectedTab === "events" && (
          <div>
            <h3 className="text-lg font-bold text-black font-cabin mb-4">
              Upcoming Events
            </h3>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-explore-green transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={event.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-black font-cabin">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {event.date} at {event.time}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {event.difficulty} • {event.duration}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === "about" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-black font-cabin mb-3">
                About UCLMC
              </h3>
              <p className="text-gray-700 font-cabin mb-4">
                The University College London Mountaineering Club is one of the most active climbing communities in London. We welcome climbers of all skill levels, from complete beginners to experienced mountaineers.
              </p>
              <p className="text-gray-700 font-cabin mb-4">
                Our activities include indoor climbing sessions, outdoor sport climbing, traditional climbing, bouldering, and mountaineering expeditions. We organize regular trips to the Peak District, Lake District, and international climbing destinations.
              </p>
            </div>

            <div>
              <h4 className="text-md font-semibold text-black font-cabin mb-3">
                What We Offer
              </h4>
              <ul className="space-y-2 text-gray-700 font-cabin">
                <li>• Weekly indoor climbing sessions</li>
                <li>• Outdoor climbing trips every weekend</li>
                <li>• Beginner courses and workshops</li>
                <li>• Equipment rental and gear talks</li>
                <li>• Social events and club dinners</li>
                <li>• Annual climbing expeditions</li>
              </ul>
            </div>

            <div>
              <h4 className="text-md font-semibold text-black font-cabin mb-3">
                Location & Times
              </h4>
              <div className="space-y-2 text-gray-700 font-cabin">
                <p><strong>Indoor Sessions:</strong> Tuesdays & Thursdays 7:00 PM</p>
                <p><strong>Location:</strong> UCLMC Climbing Wall, Bloomsbury</p>
                <p><strong>Outdoor Trips:</strong> Weekends (weather permitting)</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Join Club Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-black font-cabin mb-4">
              Join {clubData.name}
            </h3>
            <p className="text-gray-600 text-sm font-cabin mb-4">
              Tell us why you'd like to join this club:
            </p>
            <textarea
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              placeholder="I'm interested in joining because..."
              className="w-full p-3 border border-gray-300 rounded-lg font-cabin text-sm resize-none"
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-cabin font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinClub}
                disabled={!joinMessage.trim()}
                className="flex-1 py-3 bg-explore-green text-white rounded-lg font-cabin font-medium hover:bg-green-600 transition-colors disabled:bg-gray-300"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-black font-cabin mb-4">
              Leave Club
            </h3>
            <p className="text-gray-600 text-sm font-cabin mb-4">
              Are you sure you want to leave {clubData.name}? You'll need to request to join again.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-cabin font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveClub}
                className="flex-1 py-3 bg-red-500 text-white rounded-lg font-cabin font-medium hover:bg-red-600 transition-colors"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 max-w-md mx-auto">
        <div className="flex justify-around">
          <Link
            to="/explore"
            className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-explore-green transition-colors"
          >
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <span className="text-xs font-cabin">Explore</span>
          </Link>
          <Link
            to="/activities"
            className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-explore-green transition-colors"
          >
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <span className="text-xs font-cabin">Activities</span>
          </Link>
          <Link
            to="/chat"
            className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-explore-green transition-colors"
          >
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <span className="text-xs font-cabin">Chat</span>
          </Link>
          <Link
            to="/profile"
            className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-explore-green transition-colors"
          >
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <span className="text-xs font-cabin">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
