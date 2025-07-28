import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, CheckCircle, Circle } from "lucide-react";

export default function Profile() {
  const [selectedTab, setSelectedTab] = useState("Climb");
  const navigate = useNavigate();

  const gearSkills = [
    { name: "Lead belay", completed: true, icon: "🧗" },
    { name: "Multipitch", completed: true, icon: "⛰️" },
    { name: "Trad rack", completed: false, icon: "🔧" },
    { name: "Rope", completed: false, icon: "🪢" },
    { name: "Quickdraws", completed: false, icon: "🔗" },
    { name: "Helmet", completed: false, icon: "⛑️" },
  ];

  const pastActivities = [
    {
      id: "1",
      title: "Portland sport trip",
      date: "17.06",
      image:
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=100&h=100&fit=crop",
    },
  ];

  const clubs = [
    {
      name: "Westway",
      logo: "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F1e4beaadbd444b8497b8d2ef2ac43e70?format=webp&width=800",
      path: "/club/westway",
    },
    {
      name: "CULMC",
      logo: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=50&h=50&fit=crop",
      path: "/club/oxford-cycling",
    },
  ];

  const handleFollowersClick = () => {
    // Navigate to followers list
    navigate("/followers");
  };

  const handleFollowingClick = () => {
    // Navigate to following list
    navigate("/following");
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

      {/* Scrollable Content */}
      <div className="overflow-y-auto pb-20">
        <div className="px-6">
          {/* Profile Header */}
          <div className="flex items-start justify-between mt-6 mb-6">
            <div className="flex items-center gap-4">
              {/* Profile Image */}
              <div className="w-24 h-24 rounded-full border border-black overflow-hidden">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F23fa8ee56cbe4c7e834fbdf7cdf6cfd3?format=webp&width=800"
                  alt="Ben Stuart"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h1 className="text-xl font-bold text-black font-cabin mb-2">
                  Ben Stuart
                </h1>
                <div className="flex gap-2">
                  <button
                    onClick={handleFollowersClick}
                    className="text-sm text-explore-green font-cabin underline"
                  >
                    100 Followers
                  </button>
                  <span className="text-sm text-gray-400">•</span>
                  <button
                    onClick={handleFollowingClick}
                    className="text-sm text-explore-green font-cabin underline"
                  >
                    105 Following
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="px-4 py-2 border-2 border-explore-green rounded-lg text-explore-green text-sm font-cabin">
                Share
              </button>
              <button className="px-4 py-2 border-2 border-explore-green rounded-lg text-explore-green text-sm font-cabin">
                Edit
              </button>
            </div>
          </div>

          {/* Activity Tags */}
          <div className="flex gap-3 mb-6">
            <div className="bg-explore-green text-white px-4 py-2 rounded-lg text-sm font-bold font-cabin">
              Sport climber
            </div>
            <div className="border-2 border-explore-green text-explore-green px-4 py-2 rounded-lg text-sm font-cabin">
              Road cyclist
            </div>
          </div>

          {/* Bio */}
          <p className="text-lg text-explore-green font-cabin mb-6">
            Weekend warrior. Always up for some mountain adventures
          </p>

          {/* Activity Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {["Climb", "Ride", "Run"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-6 py-2 rounded-lg border border-black text-sm font-bold font-cabin ${
                  selectedTab === tab
                    ? "bg-explore-green text-white"
                    : "bg-gray-100 text-explore-green"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-4">
                Activities joined
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-lg font-medium text-explore-green font-cabin">
                    18 climbs
                  </div>
                  <div className="text-sm text-explore-green font-cabin">
                    Preferred terrain:
                  </div>
                  <ul className="text-sm text-explore-green font-cabin ml-4">
                    <li>• Indoor</li>
                    <li>• Sport</li>
                  </ul>
                </div>

                {/* Past Activity */}
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-explore-green rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">🧗</span>
                    </div>
                    <span className="text-sm font-medium text-black font-cabin">
                      Portland sport trip
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 font-cabin">17.06</div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-4">
                Gear & skills
              </h3>
              <div className="space-y-3">
                {gearSkills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-lg">{skill.icon}</span>
                    <span className="text-sm text-black font-cabin flex-1">
                      {skill.name}
                    </span>
                    {skill.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Clubs Section */}
          <div className="mt-8">
            <h3 className="text-xl font-medium text-black font-cabin mb-4">
              Clubs
            </h3>
            <div className="flex gap-4">
              {clubs.map((club, index) => (
                <Link
                  key={index}
                  to={club.path}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    <img
                      src={club.logo}
                      alt={club.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-cabin text-black hover:text-explore-green transition-colors">{club.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Location Section */}
          <div className="mt-8">
            <h3 className="text-xl font-medium text-black font-cabin mb-2">
              Location
            </h3>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-black font-cabin">
                Notting Hill, London
              </span>
            </div>
          </div>
        </div>
      </div>

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
            d="M31.4958 7.46836L21.4451 1.22114C18.7055 -0.484058 14.5003 -0.391047 11.8655 1.42266L3.12341 7.48386C1.37849 8.693 0 11.1733 0 13.1264V23.8227C0 27.7756 3.61199 31 8.06155 31H26.8718C31.3213 31 34.9333 27.7911 34.9333 23.8382V13.328C34.9333 11.2353 33.4152 8.662 31.4958 7.46836ZM18.7753 24.7993C18.7753 25.4349 18.1821 25.9619 17.4666 25.9619C16.7512 25.9619 16.1579 25.4349 16.1579 24.7993V20.1487C16.1579 19.5132 16.7512 18.9861 17.4666 18.9861C18.1821 18.9861 18.7753 19.5132 18.7753 20.1487V24.7993Z"
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

      {/* Profile Icon - Active */}
      <Link to="/profile" className="p-2 bg-explore-green rounded-full">
        <svg className="w-8 h-8" viewBox="0 0 35 35" fill="none">
          <path
            d="M17.5 17.4999C15.8958 17.4999 14.5225 16.9287 13.3802 15.7864C12.2378 14.644 11.6666 13.2708 11.6666 11.6666C11.6666 10.0624 12.2378 8.68915 13.3802 7.54679C14.5225 6.40443 15.8958 5.83325 17.5 5.83325C19.1041 5.83325 20.4774 6.40443 21.6198 7.54679C22.7621 8.68915 23.3333 10.0624 23.3333 11.6666C23.3333 13.2708 22.7621 14.644 21.6198 15.7864C20.4774 16.9287 19.1041 17.4999 17.5 17.4999ZM5.83331 29.1666V25.0833C5.83331 24.2569 6.04599 23.4973 6.47133 22.8046C6.89668 22.1119 7.46179 21.5833 8.16665 21.2187C9.67359 20.4652 11.2048 19.9001 12.7604 19.5234C14.316 19.1466 15.8958 18.9583 17.5 18.9583C19.1041 18.9583 20.684 19.1466 22.2396 19.5234C23.7951 19.9001 25.3264 20.4652 26.8333 21.2187C27.5382 21.5833 28.1033 22.1119 28.5286 22.8046C28.954 23.4973 29.1666 24.2569 29.1666 25.0833V29.1666H5.83331Z"
            fill="#FFFFFF"
          />
        </svg>
      </Link>

      {/* Navigation Indicator */}
      <div className="absolute bottom-2 right-12 w-2 h-2 bg-white border border-explore-green rounded-full"></div>
    </div>
  );
}
