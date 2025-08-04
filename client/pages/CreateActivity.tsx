import { Link } from "react-router-dom";
import {
  Bike,
  Activity,
  Mountain,
  TreePine,
  Snowflake,
  Waves,
  Zap,
  Users,
} from "lucide-react";
import BottomNavigation from "../components/BottomNavigation";

export default function CreateActivity() {
  const activities = [
    {
      id: "cycling",
      name: "Cycling",
      icon: Bike,
      available: true,
      route: "/create/cycling",
    },
    {
      id: "running",
      name: "Running",
      icon: Activity,
      available: true,
      route: "/create/running-simple",
    },
    {
      id: "climbing",
      name: "Climbing",
      icon: Mountain,
      available: true,
      route: "/create/climbing",
    },
    {
      id: "hiking",
      name: "Hiking",
      icon: TreePine,
      available: true,
      route: "/create/hiking-simple",
    },
    {
      id: "skiing",
      name: "Skiing",
      icon: Snowflake,
      available: true,
      route: "/create/skiing-simple",
    },
    {
      id: "surfing",
      name: "Surfing",
      icon: Waves,
      available: true,
      route: "/create/surfing-simple",
    },
    {
      id: "tennis",
      name: "Tennis",
      icon: Zap,
      available: true,
      route: "/create/tennis-simple",
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

      {/* Main Content */}
      <div className="px-6 pb-20">
        {/* Title */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-explore-green font-cabin">
            Create an activity
          </h1>
        </div>

        {/* Activity Grid */}
        <div className="grid grid-cols-3 gap-6 mt-12">
          {activities.map((activity) => {
            const IconComponent = activity.icon;

            if (activity.available) {
              return (
                <Link
                  key={activity.id}
                  to={activity.route}
                  className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-16 h-16 bg-explore-green rounded-full flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-base font-medium text-black font-cabin">
                    {activity.name}
                  </span>
                </Link>
              );
            } else {
              return (
                <div
                  key={activity.id}
                  className="flex flex-col items-center gap-3 p-4 rounded-lg opacity-30 cursor-not-allowed"
                >
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-gray-500" />
                  </div>
                  <span className="text-base font-medium text-gray-500 font-cabin">
                    {activity.name}
                  </span>
                </div>
              );
            }
          })}
        </div>

        {/* Create Club Section */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-black font-cabin mb-2">
              Or start your own community
            </h2>
            <p className="text-gray-600 font-cabin text-sm">
              Create and manage your own club
            </p>
          </div>

          <Link
            to="/create/club"
            className="flex items-center justify-center gap-3 w-full p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium text-black font-cabin">Create Club</div>
              <div className="text-sm text-gray-600 font-cabin">Start your own sports community</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
