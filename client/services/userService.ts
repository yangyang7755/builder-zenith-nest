import { getAuthHeader } from "../lib/supabase";

export interface UserRegistrationData {
  email: string;
  password: string;
  full_name: string;
  university?: string;
  bio?: string;
  phone?: string;
  gender?: string;
  age?: number;
  nationality?: string;
  institution?: string;
  occupation?: string;
  location?: string;
}

export interface ClubCreationData {
  name: string;
  description?: string;
  type: 'cycling' | 'climbing' | 'running' | 'hiking' | 'skiing' | 'surfing' | 'tennis' | 'general';
  location: string;
  website?: string;
  contact_email?: string;
  profile_image?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: any;
}

class UserService {
  private baseUrl = "/api";

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    try {
      const authHeader = await getAuthHeader();
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...(authHeader && { Authorization: authHeader }),
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
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

  // User Registration
  async registerUser(userData: UserRegistrationData): Promise<ApiResponse<any>> {
    return this.request("/users/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  // Get all users (admin function)
  async getUsers(): Promise<ApiResponse<{ users: any[], count: number }>> {
    return this.request("/users");
  }

  // Create Club
  async createClub(clubData: ClubCreationData): Promise<ApiResponse<any>> {
    return this.request("/clubs/create", {
      method: "POST",
      body: JSON.stringify(clubData),
    });
  }

  // Get user's clubs
  async getUserClubs(userId: string): Promise<ApiResponse<{ clubs: any[] }>> {
    return this.request(`/users/${userId}/clubs`);
  }

  // Enhanced user profile management
  async getUserProfile(userId: string): Promise<ApiResponse<any>> {
    return this.request(`/users/${userId}/profile`);
  }

  // User verification and management utilities
  async verifyUserEmail(token: string): Promise<ApiResponse<any>> {
    return this.request("/users/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  async requestPasswordReset(email: string): Promise<ApiResponse<any>> {
    return this.request("/users/password-reset", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<any>> {
    return this.request("/users/password-reset/confirm", {
      method: "POST",
      body: JSON.stringify({ token, password: newPassword }),
    });
  }

  // Club member management
  async inviteUserToClub(clubId: string, email: string, role: 'member' | 'manager' = 'member'): Promise<ApiResponse<any>> {
    return this.request(`/clubs/${clubId}/invite`, {
      method: "POST",
      body: JSON.stringify({ email, role }),
    });
  }

  async updateClubMemberRole(clubId: string, userId: string, role: 'member' | 'manager'): Promise<ApiResponse<any>> {
    return this.request(`/clubs/${clubId}/members/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    });
  }

  async removeClubMember(clubId: string, userId: string): Promise<ApiResponse<any>> {
    return this.request(`/clubs/${clubId}/members/${userId}`, {
      method: "DELETE",
    });
  }

  // User search and discovery
  async searchUsers(query: string, filters?: {
    location?: string;
    university?: string;
    sport?: string;
  }): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    params.append("q", query);
    if (filters?.location) params.append("location", filters.location);
    if (filters?.university) params.append("university", filters.university);
    if (filters?.sport) params.append("sport", filters.sport);

    return this.request(`/users/search?${params.toString()}`);
  }

  // Analytics and reporting
  async getUserStats(userId: string): Promise<ApiResponse<{
    activitiesCount: number;
    clubsCount: number;
    followersCount: number;
    followingCount: number;
    reviewsCount: number;
  }>> {
    return this.request(`/users/${userId}/stats`);
  }

  async getClubStats(clubId: string): Promise<ApiResponse<{
    membersCount: number;
    activitiesCount: number;
    activeMembers: number;
    monthlyGrowth: number;
  }>> {
    return this.request(`/clubs/${clubId}/stats`);
  }

  // Data validation helpers
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateClubName(name: string): boolean {
    return name.length >= 3 && name.length <= 50;
  }

  // Bulk operations
  async bulkInviteUsers(clubId: string, emails: string[], role: 'member' | 'manager' = 'member'): Promise<ApiResponse<any>> {
    return this.request(`/clubs/${clubId}/bulk-invite`, {
      method: "POST",
      body: JSON.stringify({ emails, role }),
    });
  }

  async exportUserData(userId: string): Promise<ApiResponse<any>> {
    return this.request(`/users/${userId}/export`);
  }

  async deleteUserAccount(userId: string, confirmation: string): Promise<ApiResponse<any>> {
    return this.request(`/users/${userId}`, {
      method: "DELETE",
      body: JSON.stringify({ confirmation }),
    });
  }
}

export const userService = new UserService();
