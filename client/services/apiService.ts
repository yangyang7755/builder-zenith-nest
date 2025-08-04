import { getAuthHeader } from "../lib/supabase";

// API base URL - backend is served from same port as client via Vite middleware
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Check if backend is available
let backendAvailable: boolean | null = null;

const checkBackendAvailability = async (): Promise<boolean> => {
  // Return cached result if already checked
  if (backendAvailable !== null) {
    return backendAvailable;
  }

  try {
    // Try a simple ping to check if backend is available
    const response = await fetch(`${API_BASE_URL}/ping`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });
    backendAvailable = response.ok;
    console.log(`Backend availability check: ${backendAvailable ? 'Available' : 'Unavailable'}`);
    return backendAvailable;
  } catch (error) {
    console.log('Backend not available, using demo mode');
    backendAvailable = false;
    return false;
  }
};

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private pendingRequests = new Map<string, Promise<any>>();

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    const maxRetries = 2;

    // Check if backend is available first (except for ping endpoint)
    if (endpoint !== '/ping') {
      const isBackendAvailable = await checkBackendAvailability();
      if (!isBackendAvailable) {
        console.log('Backend unavailable, returning demo mode indicator');
        return { error: 'BACKEND_UNAVAILABLE' };
      }
    }

    // Create a unique key for this request
    const requestKey = `${options.method || 'GET'}-${endpoint}-${JSON.stringify(options.body || {})}`;

    // Check if we already have a pending request for this
    if (this.pendingRequests.has(requestKey)) {
      console.log('Reusing pending request for:', requestKey);
      return this.pendingRequests.get(requestKey);
    }

    // Create the request promise
    const requestPromise = this.executeRequest<T>(endpoint, options, retryCount);

    // Store the promise
    this.pendingRequests.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up the pending request
      this.pendingRequests.delete(requestKey);
    }
  }

  private async executeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    const maxRetries = 2;

    try {
      const authHeader = await getAuthHeader();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...(authHeader && { Authorization: authHeader }),
          ...options.headers,
        },
        ...options,
      });

      // Read response body once, whether success or error
      let responseData;
      try {
        // Check if the response body has already been consumed
        if (response.bodyUsed) {
          console.warn('Response body already consumed, creating fallback response');
          responseData = { error: 'Response body already consumed' };
        } else {
          // Clone the response to prevent body stream consumption issues
          const responseClone = response.clone();

          try {
            const responseText = await response.text();
            if (responseText.trim()) {
              try {
                responseData = JSON.parse(responseText);
              } catch (jsonError) {
                console.warn('Failed to parse JSON, trying with clone:', responseText.substring(0, 100));
                try {
                  const cloneText = await responseClone.text();
                  responseData = JSON.parse(cloneText);
                } catch (cloneError) {
                  console.warn('Clone also failed, using text as fallback');
                  responseData = { message: responseText };
                }
              }
            } else {
              responseData = {};
            }
          } catch (textError) {
            console.warn('Failed to read text, trying clone:', textError);
            try {
              const cloneText = await responseClone.text();
              responseData = cloneText ? JSON.parse(cloneText) : {};
            } catch (cloneError) {
              console.error('Both original and clone failed:', cloneError);
              responseData = { error: 'Failed to read response body' };
            }
          }
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);

        // Retry on parse errors if we haven't exceeded max retries
        if (retryCount < maxRetries && parseError instanceof Error && parseError.message.includes('body stream already read')) {
          console.log(`Retrying request (attempt ${retryCount + 1}/${maxRetries + 1})...`);
          await new Promise(resolve => setTimeout(resolve, 100 * (retryCount + 1))); // exponential backoff
          return this.executeRequest(endpoint, options, retryCount + 1);
        }

        return {
          error: `Failed to parse response: ${parseError instanceof Error ? parseError.message : parseError}`,
          status: response.status
        };
      }

      if (!response.ok) {
        console.error('Server error response:', responseData);
        const errorMessage = responseData.error || `HTTP error! status: ${response.status}`;
        const errorDetails = responseData.details || responseData;

        return {
          error: errorMessage,
          details: errorDetails,
          status: response.status
        };
      }

      return { data: responseData };
    } catch (error) {
      console.error(`API request failed:`, error);

      // Retry on network errors if we haven't exceeded max retries
      if (retryCount < maxRetries && error instanceof Error && (
        error.message.includes('body stream already read') ||
        error.message.includes('Failed to fetch')
      )) {
        console.log(`Retrying request (attempt ${retryCount + 1}/${maxRetries + 1})...`);
        await new Promise(resolve => setTimeout(resolve, 100 * (retryCount + 1))); // exponential backoff
        return this.executeRequest(endpoint, options, retryCount + 1);
      }

      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Activity methods
  async getActivities(filters?: {
    club?: string;
    type?: string;
    location?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.club) params.append("club", filters.club);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.location) params.append("location", filters.location);

    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request<any[]>(`/activities${query}`);
  }

  async createActivity(activity: any) {
    return this.request<any>("/activities", {
      method: "POST",
      body: JSON.stringify(activity),
    });
  }

  async updateActivity(id: string, updates: any) {
    return this.request<any>(`/activities/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteActivity(id: string) {
    return this.request<void>(`/activities/${id}`, {
      method: "DELETE",
    });
  }

  // Club methods
  async getClubs(userId?: string) {
    const query = userId ? `?userId=${userId}` : "";
    return this.request<any[]>(`/clubs${query}`);
  }

  async getClub(id: string) {
    return this.request<any>(`/clubs/${id}`);
  }

  async updateClub(id: string, updates: any, userId: string) {
    return this.request<any>(`/clubs/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...updates, userId }),
    });
  }

  async requestToJoinClub(clubId: string, requestData: any) {
    return this.request<any>(`/clubs/${clubId}/join`, {
      method: "POST",
      body: JSON.stringify(requestData),
    });
  }

  async approveClubRequest(
    clubId: string,
    requestId: string,
    managerId: string,
  ) {
    return this.request<void>(
      `/clubs/${clubId}/requests/${requestId}/approve`,
      {
        method: "POST",
        body: JSON.stringify({ managerId }),
      },
    );
  }

  async denyClubRequest(clubId: string, requestId: string, managerId: string) {
    return this.request<void>(`/clubs/${clubId}/requests/${requestId}`, {
      method: "DELETE",
      body: JSON.stringify({ managerId }),
    });
  }

  // User/Profile methods
  async getProfile() {
    return this.request<any>("/profile");
  }

  async updateProfile(updates: any) {
    return this.request<any>("/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async getUserClubs() {
    return this.request<any[]>("/user/clubs");
  }



  async createClub(clubData: any) {
    return this.request<any>("/clubs", {
      method: "POST",
      body: JSON.stringify(clubData),
    });
  }

  // Reviews methods
  async getReviews(filters?: { activity_id?: string; user_id?: string }) {
    const params = new URLSearchParams();
    if (filters?.activity_id) params.append("activity_id", filters.activity_id);
    if (filters?.user_id) params.append("user_id", filters.user_id);

    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request<any[]>(`/reviews${query}`);
  }

  async createReview(review: any) {
    return this.request<any>("/reviews", {
      method: "POST",
      body: JSON.stringify(review),
    });
  }

  async updateReview(id: string, updates: any) {
    return this.request<any>(`/reviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteReview(id: string) {
    return this.request<void>(`/reviews/${id}`, {
      method: "DELETE",
    });
  }

  // Followers methods
  async getFollowers(userId: string) {
    return this.request<any[]>(`/users/${userId}/followers`);
  }

  async getFollowing(userId: string) {
    return this.request<any[]>(`/users/${userId}/following`);
  }

  async getFollowStats(userId: string) {
    return this.request<{ followers: number; following: number }>(`/users/${userId}/follow-stats`);
  }

  async followUser(userId: string) {
    return this.request<any>("/follow", {
      method: "POST",
      body: JSON.stringify({ following_id: userId }),
    });
  }

  async unfollowUser(userId: string) {
    return this.request<void>(`/follow/${userId}`, {
      method: "DELETE",
    });
  }

  // Chat methods
  async getClubMessages(clubId: string, limit: number = 50, offset: number = 0) {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());

    return this.request<any[]>(`/clubs/${clubId}/messages?${params.toString()}`);
  }

  async sendClubMessage(clubId: string, message: string) {
    return this.request<any>(`/clubs/${clubId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  }

  async getClubOnlineUsers(clubId: string) {
    return this.request<any[]>(`/clubs/${clubId}/online-users`);
  }

  async getDirectMessages(otherUserId: string, limit: number = 50, offset: number = 0) {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());

    return this.request<any[]>(`/messages/${otherUserId}?${params.toString()}`);
  }

  async sendDirectMessage(receiverId: string, message: string) {
    return this.request<any>("/messages", {
      method: "POST",
      body: JSON.stringify({ receiver_id: receiverId, message }),
    });
  }

  async markMessagesAsRead(senderId: string) {
    return this.request<void>("/messages/mark-read", {
      method: "POST",
      body: JSON.stringify({ sender_id: senderId }),
    });
  }



  // Activity participation methods
  async joinActivity(activityId: string) {
    return this.request<any>(`/activities/${activityId}/join`, {
      method: "POST",
    });
  }

  async leaveActivity(activityId: string) {
    return this.request<any>(`/activities/${activityId}/leave`, {
      method: "DELETE",
    });
  }

  async getActivityParticipants(activityId: string) {
    return this.request<any[]>(`/activities/${activityId}/participants`);
  }

  // Get user's activity history (past activities)
  async getUserActivityHistory(filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    return this.request<any>(`/activities/user/history${queryString ? `?${queryString}` : ""}`);
  }

  // Convenience methods for common use cases
  async getUserActivities(userId?: string, status?: string) {
    const filters: any = {};
    if (status) filters.status = status;

    // If userId is provided, this would need a separate endpoint
    // For now, we'll get all activities and filter client-side if needed
    return this.getActivities(filters);
  }

  async getClubActivities(clubId: string, status?: string) {
    const filters: any = { club_id: clubId };
    if (status) filters.status = status;

    return this.getActivities(filters);
  }

  async searchActivities(searchTerm: string, filters?: {
    activity_type?: string;
    difficulty_level?: string;
    date_from?: string;
    date_to?: string;
  }) {
    const searchFilters = {
      location: searchTerm, // Search by location for now
      ...filters
    };

    return this.getActivities(searchFilters);
  }

  // Health check
  async ping() {
    return this.request<{ message: string }>("/ping");
  }
}

export const apiService = new ApiService();

// Example usage in your contexts:
/*
// Replace localStorage operations with API calls
const { data: activities, error } = await apiService.getActivities();
if (error) {
  console.error('Failed to load activities:', error);
  return;
}
setActivities(activities || []);
*/
