import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Search,
  Plus,
  MessageCircle,
  User
} from "lucide-react";

// React Native-style tab configuration
const tabs = [
  {
    id: 'home',
    name: 'Home',
    path: '/explore',
    icon: Home,
    activeColor: '#4ADE80', // green-400
    inactiveColor: '#9CA3AF' // gray-400
  },
  {
    id: 'activities',
    name: 'Activities',
    path: '/activities',
    icon: Search,
    activeColor: '#4ADE80',
    inactiveColor: '#9CA3AF'
  },
  {
    id: 'create',
    name: 'Create',
    path: '/create',
    icon: Plus,
    activeColor: '#FFFFFF',
    inactiveColor: '#1F2937', // gray-800
    isSpecial: true // Center tab with different styling
  },
  {
    id: 'chat',
    name: 'Chat',
    path: '/chat',
    icon: MessageCircle,
    activeColor: '#4ADE80',
    inactiveColor: '#9CA3AF'
  },
  {
    id: 'profile',
    name: 'Profile',
    path: '/profile',
    icon: User,
    activeColor: '#4ADE80',
    inactiveColor: '#9CA3AF'
  }
];

export default function BottomNavigation() {
  const location = useLocation();

  const isTabActive = (tabPath: string) => {
    if (tabPath === '/explore') {
      return location.pathname === '/' || location.pathname === '/explore';
    }
    if (tabPath === '/create') {
      return location.pathname.startsWith('/create');
    }
    if (tabPath === '/activities') {
      return location.pathname === '/activities' || location.pathname === '/saved';
    }
    return location.pathname.startsWith(tabPath);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-white border-t border-gray-200 max-w-md mx-auto">
        {/* Tab Bar Container */}
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.map((tab) => {
            const isActive = isTabActive(tab.path);
            const IconComponent = tab.icon;

            return (
              <Link
                key={tab.id}
                to={tab.path}
                className="flex-1 flex flex-col items-center justify-center py-1 px-1"
              >
                {/* Icon Container */}
                <div
                  className={`
                    p-2 rounded-full transition-all duration-200 ease-in-out
                    ${tab.isSpecial && isActive
                      ? 'bg-explore-green shadow-lg transform scale-110'
                      : tab.isSpecial
                        ? 'bg-gray-100 hover:bg-gray-200'
                        : isActive
                          ? 'bg-green-50'
                          : 'hover:bg-gray-50'
                    }
                  `}
                >
                  <IconComponent
                    size={tab.isSpecial ? 24 : 20}
                    color={
                      isActive
                        ? tab.activeColor
                        : tab.inactiveColor
                    }
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>

                {/* Tab Label */}
                <span
                  className={`
                    text-xs font-medium mt-1 transition-colors duration-200
                    ${isActive
                      ? 'text-explore-green'
                      : 'text-gray-500'
                    }
                  `}
                >
                  {tab.name}
                </span>

                {/* Active Indicator Dot */}
                {isActive && !tab.isSpecial && (
                  <div className="w-1 h-1 bg-explore-green rounded-full mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Safe Area for iOS devices */}
        <div className="h-safe-area-inset-bottom bg-white" />
      </div>
    </div>
  );
}
