import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ChatRoom from "../components/ChatRoom";
import BottomNavigation from "../components/BottomNavigation";

export default function ClubChatOxford() {
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

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <Link
          to="/club/oxford"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-black" />
        </Link>
        <h1 className="text-lg font-bold text-black font-cabin">Oxford University MC</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <ChatRoom clubId="oxford-university-mc" clubName="Oxford University MC" />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
