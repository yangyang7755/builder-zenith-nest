// React Native fetch adapter with enhanced error handling and timeout
import { storage } from './storage';
import { STORAGE_KEYS } from '../constants';

// Platform-specific fetch implementation for React Native
class ReactNativeFetch {
  private defaultTimeout: number = 8000;

  // Enhanced fetch with timeout and better error handling for React Native
  async fetch(url: string, options: RequestInit = {}, timeout?: number): Promise<Response> {
    const timeoutMs = timeout || this.defaultTimeout;
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Set default headers for React Native
      const defaultHeaders = {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      };

      // Get auth token if available
      const authToken = await storage.getItem(STORAGE_KEYS.authToken);
      if (authToken) {
        defaultHeaders['Authorization'] = `Bearer ${authToken}`;
      }

      const fetchOptions: RequestInit = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      };

      // Use React Native's built-in fetch
      const response = await fetch(url, fetchOptions);
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Enhanced error handling for React Native
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeoutMs}ms`);
      }
      
      if (error.message?.includes('Network request failed')) {
        throw new Error('No internet connection. Please check your network.');
      }
      
      if (error.message?.includes('Connection refused')) {
        throw new Error('Server is not reachable. Please try again later.');
      }
      
      throw error;
    }
  }

  // Retry fetch with exponential backoff
  async fetchWithRetry(
    url: string, 
    options: RequestInit = {}, 
    maxRetries: number = 3,
    timeout?: number
  ): Promise<Response> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.fetch(url, options, timeout);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (error.message?.includes('401') || error.message?.includes('403')) {
          throw error;
        }
        
        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const delayMs = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
      }
    }
    
    throw lastError;
  }

  // Network status check for React Native
  async checkNetworkStatus(): Promise<boolean> {
    try {
      // Simple connectivity test
      const response = await this.fetch('https://www.google.com', { 
        method: 'HEAD',
        cache: 'no-cache',
      }, 3000);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Upload with progress (for React Native file uploads)
  async uploadWithProgress(
    url: string,
    file: any,
    onProgress?: (progress: number) => void,
    options: RequestInit = {}
  ): Promise<Response> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Create a Response-like object
          const response = new Response(xhr.responseText, {
            status: xhr.status,
            statusText: xhr.statusText,
            headers: new Headers(),
          });
          resolve(response);
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed: Network error'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      const formData = new FormData();
      formData.append('file', file);

      xhr.open(options.method || 'POST', url);
      
      // Set headers
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          if (typeof value === 'string') {
            xhr.setRequestHeader(key, value);
          }
        });
      }

      xhr.send(formData);
    });
  }
}

// Singleton instance
const reactNativeFetch = new ReactNativeFetch();

// Export platform-specific fetch function
export const platformFetch = reactNativeFetch.fetch.bind(reactNativeFetch);
export const platformFetchWithRetry = reactNativeFetch.fetchWithRetry.bind(reactNativeFetch);
export const checkNetworkStatus = reactNativeFetch.checkNetworkStatus.bind(reactNativeFetch);
export const uploadWithProgress = reactNativeFetch.uploadWithProgress.bind(reactNativeFetch);

// Network utility functions
export const networkUtils = {
  // Test if we can reach a specific endpoint
  async testEndpoint(url: string): Promise<boolean> {
    try {
      const response = await platformFetch(url, { method: 'HEAD' }, 3000);
      return response.ok;
    } catch {
      return false;
    }
  },

  // Get network quality estimate
  async getNetworkQuality(): Promise<'fast' | 'slow' | 'offline'> {
    const startTime = Date.now();
    
    try {
      await platformFetch('https://www.google.com', { method: 'HEAD' }, 5000);
      const duration = Date.now() - startTime;
      
      if (duration < 1000) return 'fast';
      if (duration < 3000) return 'slow';
      return 'slow';
    } catch {
      return 'offline';
    }
  },

  // Adaptive timeout based on network quality
  async getAdaptiveTimeout(): Promise<number> {
    const quality = await networkUtils.getNetworkQuality();
    
    switch (quality) {
      case 'fast': return 5000;
      case 'slow': return 15000;
      case 'offline': return 30000;
      default: return 8000;
    }
  },
};

// HTTP method helpers
export const httpMethods = {
  async get(url: string, options: RequestInit = {}): Promise<Response> {
    return platformFetch(url, { ...options, method: 'GET' });
  },

  async post(url: string, data?: any, options: RequestInit = {}): Promise<Response> {
    return platformFetch(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : options.body,
    });
  },

  async put(url: string, data?: any, options: RequestInit = {}): Promise<Response> {
    return platformFetch(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : options.body,
    });
  },

  async patch(url: string, data?: any, options: RequestInit = {}): Promise<Response> {
    return platformFetch(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : options.body,
    });
  },

  async delete(url: string, options: RequestInit = {}): Promise<Response> {
    return platformFetch(url, { ...options, method: 'DELETE' });
  },
};

// Response helpers
export const responseHelpers = {
  async parseJSON<T>(response: Response): Promise<T> {
    const text = await response.text();
    try {
      return JSON.parse(text) as T;
    } catch (error) {
      throw new Error(`Failed to parse JSON response: ${error.message}`);
    }
  },

  async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return responseHelpers.parseJSON<T>(response);
    } else {
      return response.text() as unknown as T;
    }
  },
};

export default {
  platformFetch,
  platformFetchWithRetry,
  checkNetworkStatus,
  uploadWithProgress,
  networkUtils,
  httpMethods,
  responseHelpers,
};
