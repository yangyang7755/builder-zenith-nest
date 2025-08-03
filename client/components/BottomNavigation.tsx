import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Search,
  Plus,
  MessageCircle,
  User
} from "lucide-react";

// React Native-style tab configuration with authentic mobile patterns
const tabs = [
  {
    id: 'home',
    name: 'Home',
    path: '/explore',
    icon: Home,
    activeColor: '#007AFF', // iOS blue
    inactiveColor: '#8E8E93' // iOS gray
  },
  {
    id: 'activities',
    name: 'Activities', 
    path: '/activities',
    icon: Search,
    activeColor: '#007AFF',
    inactiveColor: '#8E8E93'
  },
  {
    id: 'create',
    name: 'Create',
    path: '/create',
    icon: Plus,
    activeColor: '#FFFFFF',
    inactiveColor: '#FFFFFF',
    isSpecial: true // Floating action button style
  },
  {
    id: 'chat',
    name: 'Chat',
    path: '/chat',
    icon: MessageCircle,
    activeColor: '#007AFF',
    inactiveColor: '#8E8E93'
  },
  {
    id: 'profile',
    name: 'Profile',
    path: '/profile',
    icon: User,
    activeColor: '#007AFF',
    inactiveColor: '#8E8E93'
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
      {/* React Native-style Tab Bar */}
      <div className="bg-white/95 backdrop-blur-lg border-t border-gray-200/50 max-w-md mx-auto shadow-[0_-2px_20px_rgba(0,0,0,0.08)]">
        {/* Tab Container with React Native spacing */}
        <div className="flex items-end justify-around h-20 px-1 pb-2 pt-2 relative">
          {tabs.map((tab, index) => {
            const isActive = isTabActive(tab.path);
            const IconComponent = tab.icon;

            // Special styling for the center Create button (React Native FAB pattern)
            if (tab.isSpecial) {
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className="flex flex-col items-center justify-center absolute left-1/2 transform -translate-x-1/2 -top-3"
                >
                  {/* Floating Action Button */}
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg flex items-center justify-center mb-1 transition-all duration-200 active:scale-95">
                    <IconComponent
                      size={24}
                      color="#FFFFFF"
                      strokeWidth={2.5}
                    />
                  </div>
                  
                  {/* Label */}
                  <span className="text-[10px] font-medium text-gray-600 mt-1">
                    {tab.name}
                  </span>
                </Link>
              );
            }

            // Regular tab styling (React Native pattern)
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className="flex-1 flex flex-col items-center justify-center py-1 px-1 min-h-[60px] max-w-[60px] transition-all duration-200 active:scale-95"
              >
                {/* Icon with React Native-style active state */}
                <div className="relative">
                  <IconComponent
                    size={24}
                    color={isActive ? tab.activeColor : tab.inactiveColor}
                    strokeWidth={isActive ? 2.5 : 2}
                    className="transition-all duration-200"
                  />
                  
                  {/* Active indicator (React Native style) */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-blue-500 rounded-full" />
                  )}
                </div>

                {/* Tab Label with React Native typography */}
                <span
                  className={`
                    text-[10px] font-medium mt-1.5 transition-colors duration-200 leading-tight
                    ${isActive ? 'text-blue-500' : 'text-gray-500'}
                  `}
                >
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* iOS-style safe area for devices with home indicator */}
        <div className="h-[env(safe-area-inset-bottom)] bg-white/95 backdrop-blur-lg min-h-[8px]" />
      </div>
    </div>
  );
}
