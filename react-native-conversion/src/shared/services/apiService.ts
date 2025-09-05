// Cross-platform API service
// Uses different fetch implementations for web vs React Native

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status?: number;
}

// Platform-specific fetch function will be injected
let platformFetch: (
  url: string,
  options?: RequestInit,
  timeout?: number,
) => Promise<Response>;

// Set the platform-specific fetch implementation
export const setPlatformFetch = (fetchFn: typeof platformFetch) => {
  platformFetch = fetchFn;
};

export const API_BASE_URL = "https://Wildpals.fly.dev/api";

// Utility function to get auth headers (platform-specific storage will be injected)
let getAuthToken: () => Promise<string | null>;

export const setAuthTokenGetter = (getter: typeof getAuthToken) => {
  getAuthToken = getter;
};

// Default auth headers function
const getAuthHeaders = async () => {
  if (!getAuthToken) return {};
  const token = await getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Enhanced fetch with timeout and error handling
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = 8000,
): Promise<Response> => {
  if (!platformFetch) {
    throw new Error(
      "Platform fetch not configured. Call setPlatformFetch() first.",
    );
  }

  return await platformFetch(url, options, timeout);
};

// Handle API responses
const handleResponse = async <T>(
  response: Response,
): Promise<ApiResponse<T>> => {
  try {
    if (!response.ok) {
      const errorText = await response.text();
      return {
        error: `HTTP ${response.status}: ${errorText || response.statusText}`,
        status: response.status,
      };
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return { data, status: response.status };
    } else {
      const text = await response.text();
      return { data: text as T, status: response.status };
    }
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to parse response",
      status: response.status,
    };
  }
};

// User Authentication
export const authApi = {
  register: async (userData: {
    email: string;
    password: string;
    full_name: string;
  }): Promise<ApiResponse<any>> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      return await handleResponse(response);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Registration failed",
      };
    }
  },

  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<any>> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      return await handleResponse(response);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  },

  logout: async (): Promise<ApiResponse<any>> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Logout failed",
      };
    }
  },
};

// Activities API
export const activitiesApi = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_BASE_URL}/activities`, {
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to fetch activities",
      };
    }
  },

  getById: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/activities/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
        },
      );
      return await handleResponse(response);
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to fetch activity",
      };
    }
  },

  create: async (activityData: any): Promise<ApiResponse<any>> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_BASE_URL}/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(activityData),
      });
      return await handleResponse(response);
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to create activity",
      };
    }
  },

  join: async (activityId: string): Promise<ApiResponse<any>> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/activities/${activityId}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
        },
      );
      return await handleResponse(response);
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to join activity",
      };
    }
  },

  leave: async (activityId: string): Promise<ApiResponse<any>> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/activities/${activityId}/leave`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
        },
      );
      return await handleResponse(response);
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to leave activity",
      };
    }
  },
};

// Profile API
export const profileApi = {
  get: async (userId?: string): Promise<ApiResponse<any>> => {
    try {
      const headers = await getAuthHeaders();
      const endpoint = userId
        ? `${API_BASE_URL}/profiles/${userId}`
        : `${API_BASE_URL}/profile`;
      const response = await fetchWithTimeout(endpoint, {
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to fetch profile",
      };
    }
  },

  update: async (profileData: any): Promise<ApiResponse<any>> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_BASE_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(profileData),
      });
      return await handleResponse(response);
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to update profile",
      };
    }
  },
};

// Follow API
export const followApi = {
  follow: async (userId: string): Promise<ApiResponse<any>> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_BASE_URL}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({ following_id: userId }),
      });
      return await handleResponse(response);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to follow user",
      };
    }
  },

  unfollow: async (userId: string): Promise<ApiResponse<any>> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/follow/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
        },
      );
      return await handleResponse(response);
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to unfollow user",
      };
    }
  },

  getFollowers: async (): Promise<ApiResponse<any[]>> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_BASE_URL}/followers`, {
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to fetch followers",
      };
    }
  },

  getFollowing: async (): Promise<ApiResponse<any[]>> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_BASE_URL}/following`, {
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to fetch following",
      };
    }
  },
};

// Reviews API
export const reviewsApi = {
  create: async (reviewData: {
    activity_id: string;
    rating: number;
    comment?: string;
  }): Promise<ApiResponse<any>> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(reviewData),
      });
      return await handleResponse(response);
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to create review",
      };
    }
  },

  getByActivity: async (activityId: string): Promise<ApiResponse<any[]>> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/activities/${activityId}/reviews`,
        {
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
        },
      );
      return await handleResponse(response);
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to fetch reviews",
      };
    }
  },
};

// Combined API object
export const api = {
  auth: authApi,
  activities: activitiesApi,
  profile: profileApi,
  follow: followApi,
  reviews: reviewsApi,
};

export default api;
