import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Search,
  Plus,
  MessageCircle,
  User
} from "lucide-react";

// Black and bold tab configuration
const tabs = [
  {
    id: 'home',
    name: 'Home',
    path: '/explore',
    icon: Home,
    activeColor: '#FFFFFF',
    inactiveColor: '#6B7280'
  },
  {
    id: 'activities',
    name: 'Activities', 
    path: '/activities',
    icon: Search,
    activeColor: '#FFFFFF',
    inactiveColor: '#6B7280'
  },
  {
    id: 'create',
    name: 'Create',
    path: '/create',
    icon: Plus,
    activeColor: '#FFFFFF',
    inactiveColor: '#FFFFFF',
    isSpecial: true // Bold geometric center button
  },
  {
    id: 'chat',
    name: 'Chat',
    path: '/chat',
    icon: MessageCircle,
    activeColor: '#FFFFFF',
    inactiveColor: '#6B7280'
  },
  {
    id: 'profile',
    name: 'Profile',
    path: '/profile',
    icon: User,
    activeColor: '#FFFFFF',
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
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Black and Bold Tab Bar */}
      <div className="bg-black max-w-md mx-auto shadow-[0_-8px_32px_rgba(0,0,0,0.3)]">
        {/* Tab Container with bold geometric design */}
        <div className="flex items-end justify-around h-20 px-2 pb-3 pt-3 relative">
          {tabs.map((tab, index) => {
            const isActive = isTabActive(tab.path);
            const IconComponent = tab.icon;

            // Special bold geometric design for the center Create button
            if (tab.isSpecial) {
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className="flex flex-col items-center justify-center absolute left-1/2 transform -translate-x-1/2 -top-4"
                >
                  {/* Bold hexagonal shape */}
                  <div className="w-16 h-16 bg-white flex items-center justify-center mb-1 transition-all duration-200 active:scale-95 relative">
                    {/* Hexagon shape using clip-path */}
                    <div 
                      className="absolute inset-0 bg-white"
                      style={{
                        clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
                      }}
                    />
                    <IconComponent
                      size={28}
                      color="#000000"
                      strokeWidth={3}
                      className="relative z-10"
                    />
                  </div>
                  
                  {/* Bold label */}
                  <span className="text-[10px] font-bold text-white tracking-wide">
                    {tab.name.toUpperCase()}
                  </span>
                </Link>
              );
            }

            // Regular tabs with bold geometric design
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className="flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[64px] max-w-[64px] transition-all duration-200 active:scale-95"
              >
                {/* Bold icon container */}
                <div className="relative mb-2">
                  {/* Bold geometric background for active state */}
                  {isActive && (
                    <div className="absolute inset-0 w-12 h-12 bg-white transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                      {/* Diamond shape */}
                      <div 
                        className="w-full h-full bg-white"
                        style={{
                          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                        }}
                      />
                    </div>
                  )}
                  
                  <IconComponent
                    size={24}
                    color={isActive ? '#000000' : tab.inactiveColor}
                    strokeWidth={isActive ? 3 : 2}
                    className="relative z-10 transition-all duration-200"
                  />
                </div>

                {/* Bold tab label */}
                <span
                  className={`
                    text-[9px] font-bold tracking-wide transition-colors duration-200 leading-tight
                    ${isActive ? 'text-white' : 'text-gray-500'}
                  `}
                >
                  {tab.name.toUpperCase()}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Bold bottom accent bar */}
        <div className="h-1 bg-gradient-to-r from-gray-800 via-white to-gray-800" />
        
        {/* Safe area for devices with home indicator */}
        <div className="h-[env(safe-area-inset-bottom)] bg-black min-h-[8px]" />
      </div>
    </div>
  );
}
