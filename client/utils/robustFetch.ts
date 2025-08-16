// Robust fetch implementation that bypasses third-party interference (like FullStory)

// Store the original fetch before any third-party libraries can wrap it
const originalFetch = (() => {
  // Try to get the original fetch from multiple sources
  if (typeof globalThis !== 'undefined' && globalThis.fetch) {
    return globalThis.fetch.bind(globalThis);
  }
  if (typeof window !== 'undefined' && window.fetch) {
    return window.fetch.bind(window);
  }
  if (typeof self !== 'undefined' && self.fetch) {
    return self.fetch.bind(self);
  }
  return fetch; // Fallback
})();

// Create XMLHttpRequest-based fetch fallback for when native fetch fails
const xmlHttpRequestFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const method = options.method || 'GET';
    
    xhr.open(method, url, true);
    
    // Set headers
    if (options.headers) {
      const headers = options.headers instanceof Headers 
        ? Object.fromEntries(headers.entries())
        : options.headers as Record<string, string>;
        
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }
    
    // Handle timeout
    xhr.timeout = 10000; // 10 second timeout
    
    xhr.onload = () => {
      const response = new Response(xhr.responseText, {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: new Headers(xhr.getAllResponseHeaders().split('\r\n').reduce((headers, line) => {
          const [key, value] = line.split(': ');
          if (key && value) {
            headers[key] = value;
          }
          return headers;
        }, {} as Record<string, string>))
      });
      resolve(response);
    };
    
    xhr.onerror = () => reject(new Error('XHR request failed'));
    xhr.ontimeout = () => reject(new Error('XHR request timeout'));
    
    // Send request
    if (options.body) {
      xhr.send(options.body as string);
    } else {
      xhr.send();
    }
  });
};

// Main robust fetch function
export const robustFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const fetchOptions = {
    ...options,
    // Add timeout signal if not provided
    signal: options.signal || AbortSignal.timeout(10000),
  };

  // Try different fetch methods in order of preference
  const fetchMethods = [
    // 1. Try original fetch (before FullStory wrapping)
    () => originalFetch(url, fetchOptions),
    // 2. Try current window.fetch (might be wrapped)
    () => window.fetch(url, fetchOptions),
    // 3. Try XMLHttpRequest fallback
    () => xmlHttpRequestFetch(url, options),
  ];

  let lastError: Error | null = null;

  for (const fetchMethod of fetchMethods) {
    try {
      const response = await fetchMethod();
      console.log(`Fetch successful using method: ${fetchMethod.name || 'anonymous'}`);
      return response;
    } catch (error) {
      lastError = error as Error;
      console.log(`Fetch method failed: ${error.message}, trying next method...`);
    }
  }

  // If all methods failed, throw the last error
  throw lastError || new Error('All fetch methods failed');
};

// Create a fetch with timeout wrapper
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = 8000
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await robustFetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export default robustFetch;
