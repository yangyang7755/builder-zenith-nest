import React from 'react';
import BottomNavigation from './BottomNavigation';

interface MobileLayoutProps {
  children: React.ReactNode;
  showStatusBar?: boolean;
  showTabBar?: boolean;
  className?: string;
  statusBarContent?: React.ReactNode;
}

const MobileStatusBar = ({ content }: { content?: React.ReactNode }) => (
  <div className="mobile-status-bar">
    {content || (
      <>
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
      </>
    )}
  </div>
);

export default function MobileLayout({
  children,
  showStatusBar = true,
  showTabBar = true,
  className = "",
  statusBarContent,
}: MobileLayoutProps) {
  return (
    <div className={`page-container-mobile ${className}`}>
      {showStatusBar && <MobileStatusBar content={statusBarContent} />}
      
      <main className="flex-1 relative">
        {children}
      </main>
      
      {showTabBar && <BottomNavigation />}
    </div>
  );
}

// Header component for consistent mobile headers
interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightActions?: React.ReactNode;
  children?: React.ReactNode;
}

export function MobileHeader({
  title,
  subtitle,
  onBack,
  rightActions,
  children,
}: MobileHeaderProps) {
  return (
    <div className="mobile-header">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {onBack && (
            <button onClick={onBack} className="mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-mobile-h3 text-black">{title}</h1>
            {subtitle && (
              <p className="text-mobile-caption text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
        {rightActions && (
          <div className="flex items-center gap-2">{rightActions}</div>
        )}
      </div>
      {children}
    </div>
  );
}

// Content wrapper for consistent padding
interface MobileContentProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function MobileContent({ 
  children, 
  className = "", 
  padding = 'md' 
}: MobileContentProps) {
  const paddingClass = {
    none: '',
    sm: 'px-4 pb-4',
    md: 'px-6 pb-4',
    lg: 'px-8 pb-6',
  };

  return (
    <div className={`content-wrapper-mobile ${paddingClass[padding]} ${className}`}>
      {children}
    </div>
  );
}

// Activity card component for consistent styling
interface MobileActivityCardProps {
  activity: {
    id: string;
    title: string;
    organizer: string | { full_name: string };
    date: string;
    time: string;
    location: string;
    participants?: number;
    maxParticipants?: number;
    difficulty?: string;
    distance?: string;
    image?: string;
    description?: string;
  };
  onClick?: () => void;
  viewMode?: 'list' | 'grid';
}

export function MobileActivityCard({ 
  activity, 
  onClick, 
  viewMode = 'list' 
}: MobileActivityCardProps) {
  const organizerName = typeof activity.organizer === 'string' 
    ? activity.organizer 
    : activity.organizer?.full_name || 'Unknown Organizer';

  return (
    <div 
      className="activity-card-mobile cursor-pointer"
      onClick={onClick}
    >
      <div className={viewMode === 'grid' ? '' : 'flex gap-4'}>
        {activity.image && (
          <div className={viewMode === 'grid' 
            ? 'w-full h-32 bg-gray-200 rounded-lg mb-3 overflow-hidden'
            : 'w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden'
          }>
            <img
              src={activity.image}
              alt={activity.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <h3 className={`font-bold text-black line-clamp-2 ${
              viewMode === 'grid' ? 'text-sm' : 'text-lg'
            }`}>
              {activity.title}
            </h3>
            {activity.difficulty && (
              <span className={`difficulty-badge difficulty-${activity.difficulty.toLowerCase()}`}>
                {activity.difficulty}
              </span>
            )}
          </div>

          {/* Organizer */}
          <p className={`text-explore-green font-medium mb-2 ${
            viewMode === 'grid' ? 'text-xs' : 'text-sm'
          }`}>
            {organizerName}
          </p>

          {/* Description (list view only) */}
          {viewMode === 'list' && activity.description && (
            <p className="text-mobile-caption text-gray-600 mb-2 line-clamp-2">
              {activity.description}
            </p>
          )}

          {/* Meta Info */}
          <div className={`space-y-1 ${viewMode === 'grid' ? 'text-xs' : 'text-sm'}`}>
            <div className="flex items-center gap-1 text-gray-600">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>
                {new Date(activity.date).toLocaleDateString()} at {activity.time}
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span className="line-clamp-1">{activity.location}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>
                {activity.participants || 0}/{activity.maxParticipants || 20} joined
              </span>
            </div>
            {activity.distance && (
              <div className="flex items-center gap-1 text-gray-600">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                <span>{activity.distance}</span>
              </div>
            )}
          </div>

          {/* Action Button (list view only) */}
          {viewMode === 'list' && (
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activity.participants && activity.maxParticipants && (
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-explore-green h-2 rounded-full"
                      style={{
                        width: `${Math.min((activity.participants / activity.maxParticipants) * 100, 100)}%`,
                      }}
                    />
                  </div>
                )}
                <span className="text-xs text-gray-500">
                  {activity.maxParticipants && activity.participants
                    ? Math.max(0, activity.maxParticipants - activity.participants)
                    : '~'
                  } spots left
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Join logic here
                }}
                className="btn-primary-mobile px-3 py-1 text-xs"
              >
                Join
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
