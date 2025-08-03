import React from "react";
import { useParams } from "react-router-dom";
import DirectChat from "../components/DirectChat";
import BottomNavigation from "../components/BottomNavigation";

// Map of demo users for routing
const demoUsers: Record<string, { name: string; avatar: string; userId: string }> = {
  "coach-holly": {
    name: "Coach Holly Peristiani",
    avatar: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=60&h=60&fit=crop&crop=face",
    userId: "coach-holly-id",
  },
  "dan-smith": {
    name: "Dan Smith",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
    userId: "dan-smith-id",
  },
  "maddie-wei": {
    name: "Maddie Wei",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
    userId: "maddie-wei-id",
  },
};

export default function IndividualChat() {
  const { userId } = useParams<{ userId: string }>();
  
  if (!userId || !demoUsers[userId]) {
    return (
      <div className="min-h-screen bg-white font-cabin max-w-md mx-auto flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800 mb-2">User Not Found</h1>
          <p className="text-gray-600">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const user = demoUsers[userId];

  return (
    <div className="min-h-screen bg-white font-cabin max-w-md mx-auto relative flex flex-col">
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

      {/* Chat Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <DirectChat
          otherUserId={user.userId}
          otherUserName={user.name}
          otherUserAvatar={user.avatar}
          backTo="/chat"
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
