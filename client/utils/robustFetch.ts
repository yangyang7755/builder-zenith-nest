// Robust fetch implementation that completely bypasses third-party interference (like FullStory)

// Try to capture the original fetch before FullStory wraps it
const originalFetch = (() => {
  // FullStory typically wraps fetch after the page loads, so let's try to get the original
  // Check if we can access the native fetch through iframe or other means
  try {
    // Method 1: Try to get fetch from a clean iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    const iframeFetch = iframe.contentWindow?.fetch;
    document.body.removeChild(iframe);

    if (iframeFetch) {
      return iframeFetch.bind(iframe.contentWindow);
    }
  } catch (error) {
    console.log('Could not get iframe fetch:', error);
  }

  // Method 2: Try to access the original fetch descriptor
  try {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch') ||
                     Object.getOwnPropertyDescriptor(Window.prototype, 'fetch') ||
                     Object.getOwnPropertyDescriptor(globalThis, 'fetch');

    if (descriptor && descriptor.value && typeof descriptor.value === 'function') {
      return descriptor.value.bind(window);
    }
  } catch (error) {
    console.log('Could not get original fetch descriptor:', error);
  }

  // Method 3: Fallback to current fetch (might be wrapped)
  if (typeof window !== 'undefined' && window.fetch) {
    return window.fetch.bind(window);
  }

  return fetch; // Last resort
})();

// Create XMLHttpRequest-based fetch fallback for when native fetch fails
const xmlHttpRequestFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  return new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      const method = (options.method || 'GET').toUpperCase();

      // Handle AbortSignal
      if (options.signal) {
        options.signal.addEventListener('abort', () => {
          xhr.abort();
          reject(new Error('Request aborted'));
        });
      }

      xhr.open(method, url, true);

      // Set default headers
      xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');

      // Set custom headers
      if (options.headers) {
        const headers = options.headers instanceof Headers
          ? Object.fromEntries(headers.entries())
          : options.headers as Record<string, string>;

        Object.entries(headers).forEach(([key, value]) => {
          if (value && typeof value === 'string') {
            xhr.setRequestHeader(key, value);
          }
        });
      }

      // Set timeout to 15 seconds to avoid conflicts with other timeouts
      xhr.timeout = 15000;

      xhr.onload = () => {
        try {
          // Parse response headers
          const responseHeaders: Record<string, string> = {};
          const headerLines = xhr.getAllResponseHeaders().split('\r\n');

          headerLines.forEach(line => {
            const colonIndex = line.indexOf(': ');
            if (colonIndex > 0) {
              const key = line.substring(0, colonIndex).toLowerCase();
              const value = line.substring(colonIndex + 2);
              responseHeaders[key] = value;
            }
          });

          // Create response object
          const response = new Response(xhr.responseText, {
            status: xhr.status,
            statusText: xhr.statusText,
            headers: new Headers(responseHeaders)
          });

          console.log(`XHR fetch successful: ${method} ${url} -> ${xhr.status}`);
          resolve(response);
        } catch (error) {
          console.error('Error creating XHR response:', error);
          reject(new Error('Failed to create response from XHR'));
        }
      };

      xhr.onerror = () => {
        console.error(`XHR request failed: ${method} ${url}`);
        reject(new Error(`XHR request failed: ${xhr.status} ${xhr.statusText}`));
      };

      xhr.ontimeout = () => {
        console.error(`XHR request timeout: ${method} ${url}`);
        reject(new Error('XHR request timeout'));
      };

      xhr.onabort = () => {
        reject(new Error('XHR request aborted'));
      };

      // Send request
      try {
        if (options.body) {
          if (typeof options.body === 'string') {
            xhr.send(options.body);
          } else {
            xhr.send(JSON.stringify(options.body));
          }
        } else {
          xhr.send();
        }
      } catch (error) {
        reject(new Error(`Failed to send XHR request: ${error}`));
      }

    } catch (error) {
      reject(new Error(`XMLHttpRequest setup failed: ${error}`));
    }
  });
};

// FullStory detection and bypass
const isFullStoryActive = () => {
  try {
    return !!(window as any).FS || !!(window as any)._fs_initialized;
  } catch {
    return false;
  }
};

// Detect if fetch has been wrapped by checking its string representation
const isFetchWrapped = (fetchFn: any) => {
  try {
    const fnString = fetchFn.toString();
    return fnString.includes('FullStory') ||
           fnString.includes('_fs') ||
           fnString.includes('eval') ||
           fnString.length > 100; // Native fetch has a short string representation
  } catch {
    return true; // Assume wrapped if we can't check
  }
};

// Main robust fetch function
export const robustFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // Don't add timeout here if signal is already provided to avoid conflicts
  const fetchOptions = {
    ...options,
    // Only add default timeout if no signal is provided
    signal: options.signal,
  };

  let lastError: Error | null = null;

  // Method 1: Try original fetch first (most reliable)
  try {
    console.log(`Attempting fetch with original method`);
    const response = await originalFetch(url, fetchOptions);
    console.log(`✅ Fetch successful using original: ${response.status} ${response.statusText}`);
    return response;
  } catch (error) {
    lastError = error as Error;
    console.log(`❌ Original fetch failed: ${error.message}`);
  }

  // Method 2: If FullStory is detected or fetch looks wrapped, use XMLHttpRequest directly
  if (isFullStoryActive() || isFetchWrapped(window.fetch)) {
    try {
      console.log(`Using XMLHttpRequest due to FullStory detection`);
      const response = await xmlHttpRequestFetch(url, options);
      console.log(`✅ XMLHttpRequest successful: ${response.status}`);
      return response;
    } catch (error) {
      lastError = error as Error;
      console.log(`❌ XMLHttpRequest failed: ${error.message}`);
    }
  } else {
    // Method 3: Try window.fetch if no interference detected
    try {
      console.log(`Attempting fetch with window.fetch`);
      const response = await window.fetch(url, fetchOptions);
      console.log(`✅ Window fetch successful: ${response.status} ${response.statusText}`);
      return response;
    } catch (error) {
      lastError = error as Error;
      console.log(`❌ Window fetch failed: ${error.message}`);

      // Fallback to XMLHttpRequest
      try {
        console.log(`Falling back to XMLHttpRequest`);
        const response = await xmlHttpRequestFetch(url, options);
        console.log(`✅ XMLHttpRequest fallback successful: ${response.status}`);
        return response;
      } catch (xhrError) {
        lastError = xhrError as Error;
        console.log(`❌ XMLHttpRequest fallback failed: ${xhrError.message}`);
      }
    }
  }

  // If all methods failed, throw the last error
  const finalError = lastError || new Error('All fetch methods failed');
  console.error('🚨 All fetch methods exhausted:', finalError.message);
  throw finalError;
};

// Create a fetch with timeout wrapper
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = 10000
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log(`⏰ Request timeout after ${timeout}ms for ${url}`);
    controller.abort();
  }, timeout);

  try {
    const response = await robustFetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    // Add more context to timeout errors
    if (error.name === 'AbortError') {
      const timeoutError = new Error(`Request timeout after ${timeout}ms for ${url}`);
      timeoutError.name = 'TimeoutError';
      throw timeoutError;
    }

    console.error(`Fetch error for ${url}:`, error.message);
    throw error;
  }
};

export default robustFetch;
