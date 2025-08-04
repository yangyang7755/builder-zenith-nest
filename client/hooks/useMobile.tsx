import { useState, useEffect, useCallback, useRef } from 'react';
import { hapticFeedback, screenSizes, deviceInfo, createSwipeGesture, createPullToRefresh } from '../utils/mobileUtils';

// Hook for detecting mobile device and screen size
export const useDeviceInfo = () => {
  const [deviceData, setDeviceData] = useState({
    isIOS: deviceInfo.isIOS(),
    isAndroid: deviceInfo.isAndroid(),
    isMobile: deviceInfo.isMobile(),
    deviceType: deviceInfo.getDeviceType(),
    hasNotch: deviceInfo.hasNotch(),
    screenWidth: screenSizes.getWidth(),
    screenHeight: screenSizes.getHeight(),
    isSmall: screenSizes.isSmall(),
    isMedium: screenSizes.isMedium(),
    isLarge: screenSizes.isLarge(),
  });

  useEffect(() => {
    const handleResize = () => {
      setDeviceData({
        isIOS: deviceInfo.isIOS(),
        isAndroid: deviceInfo.isAndroid(),
        isMobile: deviceInfo.isMobile(),
        deviceType: deviceInfo.getDeviceType(),
        hasNotch: deviceInfo.hasNotch(),
        screenWidth: screenSizes.getWidth(),
        screenHeight: screenSizes.getHeight(),
        isSmall: screenSizes.isSmall(),
        isMedium: screenSizes.isMedium(),
        isLarge: screenSizes.isLarge(),
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceData;
};

// Hook for haptic feedback
export const useHaptic = () => {
  return {
    light: useCallback(() => hapticFeedback.light(), []),
    medium: useCallback(() => hapticFeedback.medium(), []),
    heavy: useCallback(() => hapticFeedback.heavy(), []),
    selection: useCallback(() => hapticFeedback.selection(), []),
    success: useCallback(() => hapticFeedback.success(), []),
    warning: useCallback(() => hapticFeedback.warning(), []),
    error: useCallback(() => hapticFeedback.error(), []),
  };
};

// Hook for swipe gestures
export const useSwipeGesture = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold: number = 50
) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const gesture = createSwipeGesture(onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold);

    const handleTouchStart = (e: TouchEvent) => {
      if (gesture.onTouchStart) gesture.onTouchStart(e);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (gesture.onTouchMove) gesture.onTouchMove(e);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (gesture.onTouchEnd) gesture.onTouchEnd(e);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  return elementRef;
};

// Hook for pull to refresh
export const usePullToRefresh = (
  onRefresh: () => Promise<void>,
  threshold: number = 80
) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const refresh = createPullToRefresh(async () => {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }, threshold);

    const handleTouchStart = (e: TouchEvent) => {
      if (refresh.onTouchStart) refresh.onTouchStart(e);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (refresh.onTouchMove) refresh.onTouchMove(e);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (refresh.onTouchEnd) refresh.onTouchEnd(e);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, threshold]);

  return { elementRef, isRefreshing };
};

// Hook for safe area insets
export const useSafeArea = () => {
  const [safeArea, setSafeArea] = useState(screenSizes.getSafeAreaInsets());

  useEffect(() => {
    const updateSafeArea = () => {
      // In React Native, this would use useSafeAreaInsets()
      setSafeArea(screenSizes.getSafeAreaInsets());
    };

    window.addEventListener('resize', updateSafeArea);
    window.addEventListener('orientationchange', updateSafeArea);

    return () => {
      window.removeEventListener('resize', updateSafeArea);
      window.removeEventListener('orientationchange', updateSafeArea);
    };
  }, []);

  return safeArea;
};

// Hook for keyboard awareness
export const useKeyboardAware = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    // For iOS
    const handleViewportChange = () => {
      const viewport = window.visualViewport;
      if (viewport) {
        const keyboardHeight = window.innerHeight - viewport.height;
        setKeyboardHeight(keyboardHeight);
        setIsKeyboardVisible(keyboardHeight > 0);
      }
    };

    // For Android and fallback
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const initialHeight = window.screen.height;
      const heightDiff = initialHeight - currentHeight;
      
      if (heightDiff > 150) { // Threshold for keyboard
        setKeyboardHeight(heightDiff);
        setIsKeyboardVisible(true);
      } else {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    } else {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return { keyboardHeight, isKeyboardVisible };
};

// Hook for touch feedback
export const useTouchFeedback = () => {
  const haptic = useHaptic();

  const withFeedback = useCallback((
    callback: () => void,
    feedbackType: 'light' | 'medium' | 'heavy' | 'selection' = 'light'
  ) => {
    return () => {
      haptic[feedbackType]();
      callback();
    };
  }, [haptic]);

  const createTouchableProps = useCallback((
    onPress: () => void,
    feedbackType: 'light' | 'medium' | 'heavy' | 'selection' = 'light'
  ) => {
    return {
      onClick: withFeedback(onPress, feedbackType),
      className: 'touchable native-button-press',
      style: { WebkitTapHighlightColor: 'transparent' }
    };
  }, [withFeedback]);

  return { withFeedback, createTouchableProps };
};

// Hook for orientation
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() => {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  });

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return orientation;
};

// Hook for network status
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Try to get connection info if available
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      setConnectionType(connection.effectiveType || connection.type || 'unknown');
      
      const handleConnectionChange = () => {
        setConnectionType(connection.effectiveType || connection.type || 'unknown');
      };
      
      connection.addEventListener('change', handleConnectionChange);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', handleConnectionChange);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, connectionType };
};

// Hook for app state (foreground/background)
export const useAppState = () => {
  const [appState, setAppState] = useState<'active' | 'background' | 'inactive'>('active');

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setAppState('background');
      } else {
        setAppState('active');
      }
    };

    const handleFocus = () => setAppState('active');
    const handleBlur = () => setAppState('inactive');

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return appState;
};
