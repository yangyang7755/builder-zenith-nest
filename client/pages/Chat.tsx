import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useChat } from "../contexts/ChatContext";
import BottomNavigation from "../components/BottomNavigation";

export default function Chat() {
  const {
    chatMessages,
    clubChats,
    loading,
    connected,
    loadClubChats
  } = useChat();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");

  // Load club chats on component mount
  useEffect(() => {
    loadClubChats();
  }, []);

  // Use real club chats from context, with fallback to demo data
  const staticClubChats = [
    {
      id: "oxford-cycling",
      name: "Oxford University Cycling Club",
      lastMessage: "Training ride tomorrow! Meet at Radcliffe Camera 7am",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      avatar:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=60&h=60&fit=crop",
      unread: false,
      type: "club",
    },
    {
      id: "westway-climbing",
      name: "Westway Climbing Centre",
      lastMessage: "New routes set this week! Come check them out 🧗‍♀️",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      avatar:
        "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2Fcce50dcf455a49d6aa9a7694c8a58f26?format=webp&width=800",
      unread: true,
      type: "club",
    },
    {
      id: "uclmc",
      name: "UCLMC",
      lastMessage: "lewis_tay: Let's do it",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      avatar:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=60&h=60&fit=crop",
      unread: true,
      type: "club",
    },
    {
      id: "richmond-runners",
      name: "Richmond Runners",
      lastMessage: "Park Run this Saturday - who's joining? 🏃‍♂️",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      avatar:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=60&h=60&fit=crop",
      unread: false,
      type: "club",
    },
  ];

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));

    if (diffWeeks > 0) return `${diffWeeks}w`;
    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h`;
    return "Just now";
  };

  const getAvatarImage = (sender: string) => {
    const avatars = {
      "Coach Holly Peristiani":
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=60&h=60&fit=crop&crop=face",
      "Maddie Wei":
        "https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=60&h=60&fit=crop&crop=face",
      "Dan Smith":
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
      UCLMC:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=60&h=60&fit=crop",
      "Maggie Chang":
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face",
    };
    return (
      avatars[sender as keyof typeof avatars] ||
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face"
    );
  };

  const getUserId = (sender: string) => {
    const userIds = {
      "Coach Holly Peristiani": "coach-holly",
      "Maddie Wei": "maddie-wei",
      "Dan Smith": "dan-smith",
      UCLMC: "uclmc",
      "Maggie Chang": "maggie-chang",
    };
    return userIds[sender as keyof typeof userIds] || "unknown";
  };

  const getFilteredClubChats = () => {
    if (activeFilter === "All" || activeFilter === "Clubs") {
      return clubChats.sort((a, b) => {
        // Prioritize unread messages
        if (a.unread && !b.unread) return -1;
        if (!a.unread && b.unread) return 1;
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
    }
    return [];
  };

  const getFilteredMessages = () => {
    let filtered = chatMessages.filter((msg) => msg.sender !== "UCLMC"); // Remove UCLMC from direct messages

    if (activeFilter === "Clubs") {
      return []; // Only show club chats
    }

    if (activeFilter === "Requests") {
      filtered = filtered.filter((msg) => msg.type === "join_request");
    }

    // Sort by timestamp
    return filtered.sort((a, b) => {
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  };

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
      <div className="px-6 pb-20">
        {/* Title */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-explore-green font-cabin">
            Chat!
          </h1>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-1">
          <FilterChip
            label="All"
            active={activeFilter === "All"}
            onClick={() => setActiveFilter("All")}
          />
          <FilterChip
            label="Unread"
            active={activeFilter === "Unread"}
            onClick={() => setActiveFilter("Unread")}
          />
          <FilterChip
            label="Clubs"
            active={activeFilter === "Clubs"}
            onClick={() => setActiveFilter("Clubs")}
          />
          <FilterChip
            label="Requests"
            active={activeFilter === "Requests"}
            onClick={() => setActiveFilter("Requests")}
          />
          <FilterChip
            label="Following"
            active={activeFilter === "Following"}
            onClick={() => setActiveFilter("Following")}
          />
        </div>

        {/* Chat Messages */}
        <div className="space-y-4">
          {/* Club Chats Section */}
          {getFilteredClubChats().length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 font-cabin px-2">
                Club Chats
                {activeFilter === "Clubs" && (
                  <span className="text-sm text-gray-500 ml-2">
                    (Clubs only)
                  </span>
                )}
              </h2>
              {getFilteredClubChats().map((club) => (
                <ClubChatItem
                  key={club.id}
                  club={club}
                  getTimeAgo={getTimeAgo}
                  onClick={() => {
                    // Navigate to group chat pages
                    if (club.id === "oxford-cycling") {
                      navigate("/club-chat/oxford");
                    } else if (club.id === "westway-climbing") {
                      navigate("/club-chat/westway");
                    } else if (club.id === "uclmc") {
                      navigate("/club-chat/uclmc");
                    } else if (club.id === "richmond-runners") {
                      navigate("/club-chat/richmond");
                    }
                  }}
                />
              ))}
            </div>
          )}

          {/* Individual Chats Section */}
          {getFilteredMessages().length > 0 && activeFilter !== "Clubs" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 font-cabin px-2">
                Direct Messages
                {activeFilter === "Requests" && (
                  <span className="text-sm text-gray-500 ml-2">
                    (Requests only)
                  </span>
                )}
                {activeFilter === "Unread" && (
                  <span className="text-sm text-gray-500 ml-2">
                    (Unread only)
                  </span>
                )}
              </h2>
              {getFilteredMessages().map((message) => (
                <ChatItem
                  key={message.id}
                  message={message}
                  getTimeAgo={getTimeAgo}
                  getAvatarImage={getAvatarImage}
                  onClick={() => {
                    const userId = getUserId(message.sender);
                    navigate(`/chat/${userId}`);
                  }}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {getFilteredClubChats().length === 0 &&
            getFilteredMessages().length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No {activeFilter.toLowerCase()} messages
                </h3>
                <p className="text-gray-500">
                  {activeFilter === "Unread" &&
                    "All caught up! No unread messages."}
                  {activeFilter === "Clubs" &&
                    "Join some clubs to see group chats here."}
                  {activeFilter === "Requests" &&
                    "No pending requests at the moment."}
                  {activeFilter === "Following" &&
                    "No messages from people you follow."}
                </p>
              </div>
            )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

function FilterChip({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-lg border border-black font-bold text-sm font-cabin whitespace-nowrap transition-colors ${
        active
          ? "bg-explore-green text-white"
          : "bg-explore-gray text-explore-green hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}

function ClubChatItem({
  club,
  getTimeAgo,
  onClick,
}: {
  club: any;
  getTimeAgo: (timestamp: Date) => string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3 relative hover:bg-gray-50 rounded-lg px-2 transition-colors text-left"
    >
      {/* Club Avatar */}
      <div className="relative flex-shrink-0">
        <img
          src={club.avatar}
          alt={club.name}
          className="w-12 h-12 rounded-full border border-black object-cover"
        />
        {/* Club indicator */}
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-explore-green rounded-full border border-white flex items-center justify-center">
          <span className="text-xs text-white">��️</span>
        </div>
      </div>

      {/* Club Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-cabin text-base font-medium text-black truncate">
              {club.name}
            </h3>
            <p className="text-gray-500 text-sm font-cabin truncate">
              {club.lastMessage} • {getTimeAgo(club.timestamp)}
            </p>
          </div>

          {/* Unread indicator */}
          {club.unread && (
            <div className="w-2.5 h-2.5 bg-explore-green rounded-full ml-2 flex-shrink-0"></div>
          )}
        </div>
      </div>
    </button>
  );
}

function ChatItem({
  message,
  getTimeAgo,
  getAvatarImage,
  onClick,
}: {
  message: any;
  getTimeAgo: (timestamp: Date) => string;
  getAvatarImage: (sender: string) => string;
  onClick: () => void;
}) {
  const hasNotification = message.sender === "UCLMC";

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3 relative hover:bg-gray-50 rounded-lg px-2 transition-colors text-left"
    >
      {/* Avatar */}
      <img
        src={getAvatarImage(message.sender)}
        alt={message.sender}
        className="w-12 h-12 rounded-full border border-black object-cover flex-shrink-0"
      />

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3
              className={`font-cabin text-base ${message.type === "join_request" ? "font-bold text-explore-green" : "font-medium text-black"} truncate`}
            >
              {message.sender}
            </h3>
            <p className="text-gray-500 text-sm font-cabin truncate">
              {message.type === "join_request" && message.activityTitle
                ? `You: ${message.content}`
                : message.content}{" "}
              · {getTimeAgo(message.timestamp)}
            </p>
          </div>

          {/* Notification dot */}
          {hasNotification && (
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
          )}
        </div>
      </div>
    </button>
  );
}
