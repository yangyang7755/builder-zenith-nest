// React Native Mobile Utilities
// Collection of utilities and hooks for mobile app implementation

export interface HapticFeedback {
  light: () => void;
  medium: () => void;
  heavy: () => void;
  selection: () => void;
  success: () => void;
  warning: () => void;
  error: () => void;
}

// Haptic feedback simulation for web (would use actual Haptics API in React Native)
export const hapticFeedback: HapticFeedback = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }
  },
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 25, 50]);
    }
  },
  selection: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  },
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]);
    }
  },
  warning: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([25, 25, 25]);
    }
  },
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 100]);
    }
  }
};

// Screen size detection
export const screenSizes = {
  isSmall: () => window.innerWidth < 375,
  isMedium: () => window.innerWidth >= 375 && window.innerWidth < 414,
  isLarge: () => window.innerWidth >= 414,
  getWidth: () => window.innerWidth,
  getHeight: () => window.innerHeight,
  getSafeAreaInsets: () => ({
    top: 44,
    bottom: 34,
    left: 0,
    right: 0
  })
};

// Touch gesture utilities
export interface TouchGesture {
  onTouchStart?: (e: TouchEvent) => void;
  onTouchMove?: (e: TouchEvent) => void;
  onTouchEnd?: (e: TouchEvent) => void;
}

export const createSwipeGesture = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold: number = 50
): TouchGesture => {
  let startX: number;
  let startY: number;
  let startTime: number;

  return {
    onTouchStart: (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    },
    onTouchEnd: (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;
      
      // Ignore if too slow or too short
      if (deltaTime > 500 || (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold)) {
        return;
      }
      
      // Determine swipe direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > threshold && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < -threshold && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > threshold && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < -threshold && onSwipeUp) {
          onSwipeUp();
        }
      }
    }
  };
};

// Pull to refresh utility
export const createPullToRefresh = (
  onRefresh: () => Promise<void>,
  threshold: number = 80
) => {
  let startY: number;
  let currentY: number;
  let isRefreshing = false;

  return {
    onTouchStart: (e: TouchEvent) => {
      if (window.scrollY === 0 && !isRefreshing) {
        startY = e.touches[0].clientY;
      }
    },
    onTouchMove: (e: TouchEvent) => {
      if (startY && window.scrollY === 0 && !isRefreshing) {
        currentY = e.touches[0].clientY;
        const pullDistance = currentY - startY;
        
        if (pullDistance > 0) {
          e.preventDefault();
          // Update pull indicator
          const element = document.querySelector('.pull-refresh');
          if (element) {
            (element as HTMLElement).style.transform = 
              `translateY(${Math.min(pullDistance, threshold)}px)`;
          }
        }
      }
    },
    onTouchEnd: async () => {
      if (startY && currentY && !isRefreshing) {
        const pullDistance = currentY - startY;
        
        if (pullDistance > threshold) {
          isRefreshing = true;
          const element = document.querySelector('.pull-refresh');
          if (element) {
            element.classList.add('active');
          }
          
          await onRefresh();
          
          if (element) {
            element.classList.remove('active');
            (element as HTMLElement).style.transform = 'translateY(-60px)';
          }
          isRefreshing = false;
        } else {
          const element = document.querySelector('.pull-refresh');
          if (element) {
            (element as HTMLElement).style.transform = 'translateY(-60px)';
          }
        }
        
        startY = 0;
        currentY = 0;
      }
    }
  };
};

// Native-style alert
export const showNativeAlert = (
  title: string,
  message?: string,
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>
) => {
  // In React Native, this would use Alert.alert()
  // For web, we'll create a custom modal
  const modal = document.createElement('div');
  modal.className = 'native-modal open';
  
  const content = document.createElement('div');
  content.className = 'native-modal-content';
  
  const titleEl = document.createElement('h3');
  titleEl.textContent = title;
  titleEl.className = 'text-lg font-semibold mb-2';
  content.appendChild(titleEl);
  
  if (message) {
    const messageEl = document.createElement('p');
    messageEl.textContent = message;
    messageEl.className = 'text-gray-600 mb-6';
    content.appendChild(messageEl);
  }
  
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'flex gap-2';
  
  const defaultButtons = buttons || [{ text: 'OK', style: 'default' as const }];
  
  defaultButtons.forEach((button, index) => {
    const btn = document.createElement('button');
    btn.textContent = button.text;
    btn.className = `flex-1 native-button ${
      button.style === 'destructive' ? 'native-button-destructive' : 
      button.style === 'cancel' ? 'native-button-secondary' : ''
    }`;
    
    btn.onclick = () => {
      document.body.removeChild(modal);
      if (button.onPress) {
        button.onPress();
      }
    };
    
    buttonContainer.appendChild(btn);
  });
  
  content.appendChild(buttonContainer);
  modal.appendChild(content);
  document.body.appendChild(modal);
};

// Native-style toast
export const showNativeToast = (
  message: string,
  duration: number = 3000,
  type: 'success' | 'error' | 'info' = 'info'
) => {
  const toast = document.createElement('div');
  toast.className = `fixed top-16 left-1/2 transform -translate-x-1/2 z-[1001] 
    bg-black text-white px-4 py-2 rounded-lg font-medium max-w-sm mx-4 
    ${type === 'success' ? 'bg-green-600' : 
      type === 'error' ? 'bg-red-600' : 'bg-gray-800'}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.opacity = '0.9';
  }, 100);
  
  // Remove after duration
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, duration);
};

// Keyboard aware scroll view utility
export const createKeyboardAwareView = (element: HTMLElement) => {
  const handleFocus = (e: FocusEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  };
  
  element.addEventListener('focusin', handleFocus);
  
  return () => {
    element.removeEventListener('focusin', handleFocus);
  };
};

// Device info utilities
export const deviceInfo = {
  isIOS: () => /iPad|iPhone|iPod/.test(navigator.userAgent),
  isAndroid: () => /Android/.test(navigator.userAgent),
  isMobile: () => /Mobi|Android/i.test(navigator.userAgent),
  getDeviceType: () => {
    if (deviceInfo.isIOS()) return 'ios';
    if (deviceInfo.isAndroid()) return 'android';
    return 'web';
  },
  hasNotch: () => {
    return 'CSS' in window && CSS.supports('padding-top', 'env(safe-area-inset-top)');
  }
};

// Status bar utilities (for React Native)
export const statusBar = {
  setBarStyle: (style: 'dark-content' | 'light-content') => {
    // In React Native, this would use StatusBar.setBarStyle()
    console.log(`Status bar style set to: ${style}`);
  },
  setBackgroundColor: (color: string) => {
    // In React Native, this would use StatusBar.setBackgroundColor()
    console.log(`Status bar background color set to: ${color}`);
  },
  hide: () => {
    // In React Native, this would use StatusBar.setHidden(true)
    console.log('Status bar hidden');
  },
  show: () => {
    // In React Native, this would use StatusBar.setHidden(false)
    console.log('Status bar shown');
  }
};

// Performance optimization utilities
export const performance = {
  // Debounce function for search and input
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },
  
  // Throttle function for scroll events
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void => {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  },
  
  // Lazy loading for images
  lazyLoadImage: (src: string, placeholder?: string) => {
    return new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => resolve(placeholder || '');
      img.src = src;
    });
  }
};
