// API base URL - using your current Fly.io deployment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://66e3ab0a84c340e9b445761a73e42448-dbbf80750d9f4e01981434bf2.fly.dev/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
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
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Activity methods
  async getActivities(filters?: { club?: string; type?: string; location?: string }) {
    const params = new URLSearchParams();
    if (filters?.club) params.append('club', filters.club);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.location) params.append('location', filters.location);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<any[]>(`/activities${query}`);
  }

  async createActivity(activity: any) {
    return this.request<any>('/activities', {
      method: 'POST',
      body: JSON.stringify(activity),
    });
  }

  async updateActivity(id: string, updates: any) {
    return this.request<any>(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteActivity(id: string) {
    return this.request<void>(`/activities/${id}`, {
      method: 'DELETE',
    });
  }

  // Club methods
  async getClubs(userId?: string) {
    const query = userId ? `?userId=${userId}` : '';
    return this.request<any[]>(`/clubs${query}`);
  }

  async getClub(id: string) {
    return this.request<any>(`/clubs/${id}`);
  }

  async updateClub(id: string, updates: any, userId: string) {
    return this.request<any>(`/clubs/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...updates, userId }),
    });
  }

  async requestToJoinClub(clubId: string, requestData: any) {
    return this.request<any>(`/clubs/${clubId}/join`, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async approveClubRequest(clubId: string, requestId: string, managerId: string) {
    return this.request<void>(`/clubs/${clubId}/requests/${requestId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ managerId }),
    });
  }

  async denyClubRequest(clubId: string, requestId: string, managerId: string) {
    return this.request<void>(`/clubs/${clubId}/requests/${requestId}`, {
      method: 'DELETE',
      body: JSON.stringify({ managerId }),
    });
  }

  // Health check
  async ping() {
    return this.request<{ message: string }>('/ping');
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
