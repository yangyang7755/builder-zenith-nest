import { getAuthHeader } from "../lib/supabase";

// API base URL - backend is served from same port as client via Vite middleware
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error(`API request failed:`, error);
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

  async getUserActivities() {
    return this.request<any[]>("/user/activities");
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
