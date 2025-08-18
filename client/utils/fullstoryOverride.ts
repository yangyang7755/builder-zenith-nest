// FullStory Override - Disable fetch wrapping and restore original functionality

// Store the original fetch before FullStory can wrap it
const originalFetch = window.fetch;
const originalXMLHttpRequest = window.XMLHttpRequest;

// Disable FullStory's fetch wrapping
export const disableFullStoryFetchWrapping = () => {
  try {
    // Method 1: Prevent FullStory from wrapping fetch
    if ((window as any).FS) {
      console.log('FullStory detected, attempting to disable fetch wrapping');
      
      // Try to restore original fetch
      if (originalFetch) {
        Object.defineProperty(window, 'fetch', {
          value: originalFetch,
          writable: false,
          configurable: false,
        });
        console.log('Original fetch restored');
      }
    }

    // Method 2: Override FullStory's initialization
    Object.defineProperty(window, '_fs_initialized', {
      value: false,
      writable: false,
      configurable: false,
    });

    // Method 3: Prevent FullStory from overriding fetch in the future
    const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
    if (descriptor && descriptor.configurable) {
      Object.defineProperty(window, 'fetch', {
        ...descriptor,
        configurable: false,
        writable: false,
      });
    }

  } catch (error) {
    console.log('Could not disable FullStory fetch wrapping:', error);
  }
};

// Initialize fetch protection
export const initializeFetchProtection = () => {
  // Run immediately
  disableFullStoryFetchWrapping();
  
  // Also run after DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', disableFullStoryFetchWrapping);
  }
  
  // And run after page is fully loaded
  if (document.readyState !== 'complete') {
    window.addEventListener('load', disableFullStoryFetchWrapping);
  }
  
  // Monitor for FullStory initialization and counter it
  const observer = new MutationObserver(() => {
    if ((window as any).FS && typeof (window as any).FS.identify === 'function') {
      console.log('FullStory initialized, re-applying fetch protection');
      disableFullStoryFetchWrapping();
    }
  });
  
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
  });
  
  // Clean up observer after 10 seconds (FullStory should be loaded by then)
  setTimeout(() => {
    observer.disconnect();
  }, 10000);
};

// Export for manual usage
export { originalFetch, originalXMLHttpRequest };
