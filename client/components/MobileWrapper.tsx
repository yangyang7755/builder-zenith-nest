import React, { ReactNode } from 'react';
import { useDeviceInfo, useSafeArea, useAppState, useNetworkStatus } from '../hooks/useMobile';

interface MobileWrapperProps {
  children: ReactNode;
  showStatusBar?: boolean;
  enablePullToRefresh?: boolean;
  onRefresh?: () => Promise<void>;
  backgroundColor?: string;
  statusBarStyle?: 'dark-content' | 'light-content';
}

export default function MobileWrapper({
  children,
  showStatusBar = true,
  enablePullToRefresh = false,
  onRefresh,
  backgroundColor = '#f8f9fa',
  statusBarStyle = 'dark-content'
}: MobileWrapperProps) {
  const deviceInfo = useDeviceInfo();
  const safeArea = useSafeArea();
  const appState = useAppState();
  const { isOnline, connectionType } = useNetworkStatus();

  return (
    <div 
      className="react-native-container native-scroll"
      style={{ 
        backgroundColor,
        paddingTop: showStatusBar ? safeArea.top : 0,
        paddingBottom: safeArea.bottom
      }}
    >
      {/* Status Bar */}
      {showStatusBar && (
        <div className={`h-11 flex items-center justify-between px-6 text-black font-medium ${
          statusBarStyle === 'light-content' ? 'text-white' : 'text-black'
        }`}>
          <span>9:41</span>
          <div className="flex items-center gap-1">
            {/* Signal bars */}
            <div className="flex gap-0.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1 h-3 rounded-sm ${
                    isOnline ? 'bg-black' : 'bg-gray-400'
                  }`}
                  style={{ height: `${(i + 1) * 3}px` }}
                />
              ))}
            </div>
            
            {/* WiFi icon */}
            <svg className="w-4 h-3" viewBox="0 0 16 12" fill="none">
              <path 
                d="M8 12C8.55 12 9 11.55 9 11C9 10.45 8.55 10 8 10C7.45 10 7 10.45 7 11C7 11.55 7.45 12 8 12Z" 
                fill={isOnline ? "currentColor" : "#9CA3AF"}
              />
              <path 
                d="M8 8C9.66 8 11 9.34 11 11H13C13 8.24 10.76 6 8 6C5.24 6 3 8.24 3 11H5C5 9.34 6.34 8 8 8Z" 
                fill={isOnline ? "currentColor" : "#9CA3AF"}
              />
              <path 
                d="M8 4C11.87 4 15 7.13 15 11H16C16 6.58 12.42 3 8 3C3.58 3 0 6.58 0 11H1C1 7.13 4.13 4 8 4Z" 
                fill={isOnline ? "currentColor" : "#9CA3AF"}
              />
            </svg>
            
            {/* Battery */}
            <svg className="w-6 h-4" viewBox="0 0 24 16" fill="none">
              <rect
                x="1"
                y="3"
                width="22"
                height="10"
                rx="2"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
              <rect x="23" y="6" width="2" height="4" rx="1" fill="currentColor" />
              <rect x="2" y="4" width="18" height="8" rx="1" fill="currentColor" />
            </svg>
          </div>
        </div>
      )}

      {/* Connection status indicator */}
      {!isOnline && (
        <div className="bg-red-500 text-white text-center py-1 text-xs">
          No Internet Connection
        </div>
      )}

      {/* Pull to refresh indicator */}
      {enablePullToRefresh && (
        <div className="pull-refresh">
          <div className="native-spinner"></div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1">
        {children}
      </div>

      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2 rounded-bl z-50">
          <div>Device: {deviceInfo.deviceType}</div>
          <div>Screen: {deviceInfo.screenWidth}x{deviceInfo.screenHeight}</div>
          <div>App State: {appState}</div>
          <div>Network: {connectionType}</div>
        </div>
      )}
    </div>
  );
}

// Pre-built mobile page layouts
export const MobilePageLayout = ({ 
  children, 
  title,
  headerActions,
  showBackButton = false,
  onBack
}: {
  children: ReactNode;
  title?: string;
  headerActions?: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
}) => (
  <MobileWrapper>
    {/* Header */}
    {(title || headerActions || showBackButton) && (
      <div className="native-header">
        {showBackButton && (
          <button 
            onClick={onBack} 
            className="touchable native-button-press"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        {title && (
          <h1 className="text-lg font-semibold text-center flex-1">{title}</h1>
        )}
        
        {headerActions && (
          <div className="flex items-center gap-2">
            {headerActions}
          </div>
        )}
      </div>
    )}
    
    {/* Content */}
    <div className="flex-1 native-scroll">
      {children}
    </div>
  </MobileWrapper>
);

// Mobile list layout
export const MobileListLayout = ({ 
  children,
  searchPlaceholder = "Search...",
  onSearch,
  showSearch = true
}: {
  children: ReactNode;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  showSearch?: boolean;
}) => (
  <MobileWrapper>
    {/* Search bar */}
    {showSearch && (
      <div className="native-search">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder={searchPlaceholder}
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
    )}
    
    {/* List content */}
    <div className="flex-1">
      {children}
    </div>
  </MobileWrapper>
);

// Mobile card layout
export const MobileCard = ({ 
  children, 
  onPress,
  showChevron = false,
  disabled = false
}: {
  children: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  disabled?: boolean;
}) => (
  <div 
    className={`native-card touchable ${disabled ? 'opacity-50' : 'native-button-press'}`}
    onClick={disabled ? undefined : onPress}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        {children}
      </div>
      
      {showChevron && (
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </div>
  </div>
);

// Mobile button component
export const MobileButton = ({
  children,
  onPress,
  style = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: 'primary' | 'secondary' | 'destructive';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
}) => {
  const baseClass = 'native-button';
  const styleClass = style === 'secondary' ? 'native-button-secondary' : 
                    style === 'destructive' ? 'native-button-destructive' : '';
  const sizeClass = size === 'small' ? 'text-sm py-2 px-3' :
                   size === 'large' ? 'text-lg py-4 px-6' : '';
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClass} ${styleClass} ${sizeClass} ${widthClass}`}
      onClick={onPress}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
