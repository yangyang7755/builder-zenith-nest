const API_BASE_URL = "/api";

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status?: number;
}

// Utility function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Utility function to make fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout: number = 8000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
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

// Utility function to handle API responses
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  try {
    const contentType = response.headers.get('content-type');
    let data: any;

    // Check if response body has already been consumed
    if (response.bodyUsed) {
      console.warn('Response body already consumed, returning error');
      return {
        error: 'Response body already consumed',
        status: response.status
      };
    }

    // Clone the response to avoid body stream conflicts
    const responseClone = response.clone();

    try {
      if (contentType && contentType.includes('application/json')) {
        data = await responseClone.json();
      } else {
        data = await responseClone.text();
      }
    } catch (parseError) {
      // If parsing fails, try with original response as fallback
      console.warn('Failed to parse cloned response, trying original:', parseError);
      try {
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }
      } catch (fallbackError) {
        return {
          error: `Failed to parse response: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`,
          status: response.status
        };
      }
    }

    if (response.ok) {
      return { data, status: response.status };
    } else {
      return {
        error: data?.error || data?.message || `HTTP ${response.status}`,
        status: response.status
      };
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: response.status
    };
  }
};

// Activity API methods
export const apiService = {
  // Activity Reviews
  async getActivityReviews(activityId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews?activity_id=${activityId}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return { error: 'Failed to fetch reviews' };
    }
  },

  async createActivityReview(reviewData: {
    activity_id: string;
    reviewee_id: string;
    rating: number;
    comment?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(reviewData),
      });
      return await handleResponse(response);
    } catch (error) {
      return { error: 'Failed to create review' };
    }
  },

  async getUserReviews(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews?user_id=${userId}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return { error: 'Failed to fetch user reviews' };
    }
  },

  async getReviews(params: { user_id?: string; activity_id?: string } = {}): Promise<ApiResponse<any[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.user_id) queryParams.append('user_id', params.user_id);
      if (params.activity_id) queryParams.append('activity_id', params.activity_id);

      const response = await fetchWithTimeout(`${API_BASE_URL}/reviews?${queryParams}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { error: 'Request timeout' };
      }
      return { error: 'Failed to fetch reviews' };
    }
  },

  // Followers/Following API methods
  async getUserFollowers(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/followers/${userId}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return { error: 'Failed to fetch followers' };
    }
  },

  async getUserFollowing(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/following/${userId}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return { error: 'Failed to fetch following' };
    }
  },

  async followUser(userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ following_id: userId }),
      });
      return await handleResponse(response);
    } catch (error) {
      return { error: 'Failed to follow user' };
    }
  },

  async unfollowUser(userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/unfollow/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return { error: 'Failed to unfollow user' };
    }
  },

  async getFollowStats(userId: string): Promise<ApiResponse<{ followers: number; following: number }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/follow-stats/${userId}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return { error: 'Failed to fetch follow stats' };
    }
  },

  // Saved Activities methods
  async getSavedActivities(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-activities`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return { error: 'Failed to fetch saved activities' };
    }
  },

  async saveActivity(activityId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ activity_id: activityId }),
      });
      return await handleResponse(response);
    } catch (error) {
      return { error: 'Failed to save activity' };
    }
  },

  async unsaveActivity(activityId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-activities/${activityId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return { error: 'Failed to unsave activity' };
    }
  },

  // Activity participation methods
  async getUserActivityHistory(params: {
    user_id?: string;
    status?: 'completed' | 'upcoming';
    limit?: number;
    offset?: number;
    include_reviews?: boolean;
  } = {}): Promise<ApiResponse<any[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.user_id) queryParams.append('user_id', params.user_id);
      if (params.status) queryParams.append('status', params.status);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      if (params.include_reviews) queryParams.append('include_reviews', 'true');

      const response = await fetch(`${API_BASE_URL}/user/activities?${queryParams}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return { error: 'Failed to fetch activity history' };
    }
  },

  async getActivitiesNeedingReview(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/activities/pending-reviews`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return { error: 'Failed to fetch activities needing review' };
    }
  },

  // Activity creation and management
  async createActivity(activityData: any): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(activityData),
      });
      return await handleResponse(response);
    } catch (error) {
      return { error: 'Failed to create activity' };
    }
  },

  async joinActivity(activityId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/activities/${activityId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return { error: 'Failed to join activity' };
    }
  },

  async leaveActivity(activityId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/activities/${activityId}/leave`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return { error: 'Failed to leave activity' };
    }
  },

  // Club management
  async createClub(clubData: any): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/clubs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(clubData),
      });
      return await handleResponse(response);
    } catch (error) {
      return { error: 'Failed to create club' };
    }
  },

  async getClubs(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/clubs`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return { error: 'Failed to fetch clubs' };
    }
  },

  async getUserClubs(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/clubs?userId=${userId}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return { error: 'Failed to fetch user clubs' };
    }
  },

  // Profile and user data
  async getUserProfile(userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return { error: 'Failed to fetch user profile' };
    }
  },

  async updateUserProfile(profileData: any): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(profileData),
      });
      return await handleResponse(response);
    } catch (error) {
      return { error: 'Failed to update profile' };
    }
  },

  // Search functionality
  async searchUsers(query: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/search/users?q=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return { error: 'Failed to search users' };
    }
  },

  async searchActivities(query: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/search/activities?q=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return { error: 'Failed to search activities' };
    }
  },

  async searchClubs(query: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/search/clubs?q=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return { error: 'Failed to search clubs' };
    }
  },
};
