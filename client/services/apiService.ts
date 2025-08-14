import { getAuthHeader } from "../lib/supabase";

// API base URL - backend is served from same port as client via Vite middleware
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Check if backend is available
let backendAvailable: boolean | null = null;
let backendCheckPromise: Promise<boolean> | null = null;

const checkBackendAvailability = async (): Promise<boolean> => {
  // Return cached result if already checked
  if (backendAvailable !== null) {
    return backendAvailable;
  }

  // If there's already a check in progress, wait for it
  if (backendCheckPromise) {
    return backendCheckPromise;
  }

  // Start the check
  backendCheckPromise = (async () => {
    try {
      // Create a cross-browser compatible timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

      try {
        // Try a simple ping to check if backend is available
        const response = await fetch(`${API_BASE_URL}/ping`, {
          method: "GET",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Treat 503 (Service Unavailable) and other server errors as backend unavailable
        backendAvailable = response.ok && response.status !== 503;
        console.log(
          `Backend availability check: ${backendAvailable ? "Available" : "Unavailable"} (Status: ${response.status})`,
        );
        return backendAvailable;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.log(
        "Backend not available (network error), using demo mode:",
        error instanceof Error ? error.message : String(error),
      );
      backendAvailable = false;
      return false;
    } finally {
      backendCheckPromise = null;
    }
  })();

  return backendCheckPromise;
};

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0,
  ): Promise<ApiResponse<T>> {
    // Check if backend is available first (except for ping endpoint)
    if (endpoint !== "/ping") {
      const isBackendAvailable = await checkBackendAvailability();
      if (!isBackendAvailable) {
        console.log("Backend unavailable, returning demo mode indicator");
        return { error: "BACKEND_UNAVAILABLE" };
      }
    }

    // Execute request directly without caching to avoid body stream issues
    return this.executeRequest<T>(endpoint, options, retryCount);
  }

  private async executeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0,
  ): Promise<ApiResponse<T>> {
    const maxRetries = 2;

    try {
      const authHeader = await getAuthHeader();

      // Create a completely fresh fetch request each time to avoid any shared state
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 10000); // 10 second timeout

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...(authHeader && { Authorization: authHeader }),
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      // Immediately check if response is ok and handle errors before trying to read body
      const status = response.status;
      const statusOk = response.ok;

      let responseData;

      try {
        // Check if response body is readable before attempting any operations
        const bodyUsed = response.bodyUsed;

        if (bodyUsed || response.body === null) {
          // If body is already used or null, create a response based on status
          if (statusOk) {
            responseData = { success: true };
          } else {
            responseData = {
              success: false,
              error: `HTTP ${status}`,
              message: `Request failed with status ${status}`,
            };
          }
        } else {
          // Try to read the response body using a simple approach
          try {
            const responseText = await response.text();

            if (responseText.trim()) {
              try {
                responseData = JSON.parse(responseText);
              } catch (jsonError) {
                responseData = { message: responseText };
              }
            } else {
              responseData = statusOk
                ? { success: true }
                : { success: false, error: `HTTP ${status}` };
            }
          } catch (textError) {
            // If we can't read the text, fall back to status-based response
            console.warn(
              "Could not read response text, using status-based response:",
              textError.message,
            );
            responseData = statusOk
              ? { success: true }
              : { success: false, error: `HTTP ${status}` };
          }
        }
      } catch (readError) {
        console.error("Failed to read response:", readError);

        // If we can't read at all, check if we should retry
        if (
          retryCount < maxRetries &&
          (readError.message.includes("body stream already read") ||
            readError.message.includes("Response body is already used") ||
            readError.message.includes("clone"))
        ) {
          console.log(
            `Retrying request due to read error (attempt ${retryCount + 1}/${maxRetries + 1})...`,
          );
          await new Promise((resolve) =>
            setTimeout(resolve, 300 * (retryCount + 1)),
          );
          return this.executeRequest(endpoint, options, retryCount + 1);
        }

        // Final fallback: return a response based on HTTP status
        responseData = statusOk
          ? { success: true }
          : {
              success: false,
              error: `Failed to read response: ${readError instanceof Error ? readError.message : String(readError)}`,
            };
      }

      if (!statusOk) {
        // Handle 503 Service Unavailable immediately without logging as error
        if (status === 503) {
          console.log(
            "Backend service unavailable (503), switching to demo mode",
          );
          return {
            error: "BACKEND_UNAVAILABLE",
          };
        }

        // Log other server errors
        console.error(
          "Server error response:",
          JSON.stringify(responseData, null, 2),
        );
        const errorMessage =
          responseData?.error ||
          responseData?.message ||
          `HTTP error! status: ${status}`;

        return {
          error: errorMessage,
          data: responseData,
        };
      }

      return { data: responseData };
    } catch (error) {
      console.error(`API request failed:`, error);

      // Retry on network errors if we haven't exceeded max retries
      if (
        retryCount < maxRetries &&
        error instanceof Error &&
        (error.message.includes("body stream already read") ||
          error.message.includes("Failed to fetch"))
      ) {
        console.log(
          `Retrying request (attempt ${retryCount + 1}/${maxRetries + 1})...`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, 100 * (retryCount + 1)),
        ); // exponential backoff
        return this.executeRequest(endpoint, options, retryCount + 1);
      }

      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Activity methods
  async getActivities(filters?: {
    club_id?: string;
    activity_type?: string;
    location?: string;
    difficulty_level?: string;
    date_from?: string;
    date_to?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.club_id) params.append("club_id", filters.club_id);
    if (filters?.activity_type) params.append("activity_type", filters.activity_type);
    if (filters?.location) params.append("location", filters.location);
    if (filters?.difficulty_level) params.append("difficulty_level", filters.difficulty_level);
    if (filters?.date_from) params.append("date_from", filters.date_from);
    if (filters?.date_to) params.append("date_to", filters.date_to);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.offset) params.append("offset", filters.offset.toString());

    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request<any[]>(`/activities${query}`);
  }

  async getActivity(id: string) {
    return this.request<any>(`/activities/${id}`);
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
    return this.request<{ followers: number; following: number }>(
      `/users/${userId}/follow-stats`,
    );
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
  async getClubMessages(
    clubId: string,
    limit: number = 50,
    offset: number = 0,
  ) {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());

    return this.request<any[]>(
      `/clubs/${clubId}/messages?${params.toString()}`,
    );
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

  async getDirectMessages(
    otherUserId: string,
    limit: number = 50,
    offset: number = 0,
  ) {
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
    return this.request<any>(
      `/activities/user/history${queryString ? `?${queryString}` : ""}`,
    );
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

  async searchActivities(
    searchTerm: string,
    filters?: {
      activity_type?: string;
      difficulty_level?: string;
      date_from?: string;
      date_to?: string;
    },
  ) {
    const searchFilters = {
      location: searchTerm, // Search by location for now
      ...filters,
    };

    return this.getActivities(searchFilters);
  }

  // Saved Activities methods
  async getSavedActivities() {
    return this.request<any>("/saved-activities");
  }

  async saveActivity(activityId: string) {
    return this.request<any>("/saved-activities", {
      method: "POST",
      body: JSON.stringify({ activity_id: activityId }),
    });
  }

  async unsaveActivity(activityId: string) {
    return this.request<void>(`/saved-activities/${activityId}`, {
      method: "DELETE",
    });
  }

  async checkActivitySaved(activityId: string) {
    return this.request<{ is_saved: boolean }>(
      `/saved-activities/check/${activityId}`,
    );
  }

  // User Authentication methods
  async registerUser(userData: {
    email: string;
    password: string;
    full_name: string;
    university?: string;
    bio?: string;
  }) {
    return this.request<any>("/users/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async loginUser(credentials: { email: string; password: string }) {
    return this.request<any>("/users/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async getUserProfile(userId: string) {
    return this.request<any>(`/users/${userId}/profile`);
  }

  async updateUserProfile(userId: string, updates: any) {
    return this.request<any>(`/users/${userId}/profile`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
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
