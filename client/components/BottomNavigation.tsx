import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Search,
  Plus,
  MessageCircle,
  User
} from "lucide-react";

// Clean tab configuration matching app's design
const tabs = [
  {
    id: 'home',
    name: 'Home',
    path: '/explore',
    icon: Home,
    activeColor: '#22C55E', // explore-green
    inactiveColor: '#6B7280'
  },
  {
    id: 'activities',
    name: 'Activities', 
    path: '/activities',
    icon: Search,
    activeColor: '#22C55E',
    inactiveColor: '#6B7280'
  },
  {
    id: 'create',
    name: 'Create',
    path: '/create',
    icon: Plus,
    activeColor: '#FFFFFF',
    inactiveColor: '#6B7280',
    isSpecial: true
  },
  {
    id: 'chat',
    name: 'Chat',
    path: '/chat',
    icon: MessageCircle,
    activeColor: '#22C55E',
    inactiveColor: '#6B7280'
  },
  {
    id: 'profile',
    name: 'Profile',
    path: '/profile',
    icon: User,
    activeColor: '#22C55E',
    inactiveColor: '#6B7280'
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
    <div className="native-tab-bar">
      <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = isTabActive(tab.path);
            const IconComponent = tab.icon;

            return (
              <Link
                key={tab.id}
                to={tab.path}
                className="native-tab-item"
              >
                {/* Icon Container */}
                <div
                  className={`
                    p-2 rounded-full transition-all duration-200 ease-in-out
                    ${tab.isSpecial && isActive
                      ? 'bg-explore-green shadow-lg shadow-green-900/60'
                      : tab.isSpecial
                        ? 'bg-gray-100 hover:bg-gray-200'
                        : isActive
                          ? 'bg-green-100 shadow-lg shadow-green-900/40'
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

                {/* Active Indicator */}
                {isActive && !tab.isSpecial && (
                  <div className="w-1 h-1 bg-explore-green rounded-full mt-0.5" />
                )}
              </Link>
            );
          })}
      </div>
    </div>
  );
}
