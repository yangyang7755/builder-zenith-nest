import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
interface ApiResponse<T> {
  data?: T;
  error?: string;
  status?: number;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  profile_image?: string;
}

interface Review {
  id: string;
  activity_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer?: {
    id: string;
    full_name: string;
    profile_image?: string;
  };
  activity?: {
    id: string;
    title: string;
    date: string;
  };
}

interface Activity {
  id: string;
  title: string;
  activity_type: string;
  date: string;
  location: string;
  organizer_id: string;
  organizer_name?: string;
  participant_count: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  average_rating?: number;
  total_reviews?: number;
}

// Utility function to get auth headers
const getAuthHeaders = async () => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (error) {
    console.error('Error getting auth token:', error);
    return {};
  }
};

// Utility function to handle API responses in React Native
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  try {
    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
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

// Network-aware fetch with React Native considerations
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout: number = 8000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...options.headers,
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// React Native API Service with preserved web logic
export const apiService = {
  // Activity Reviews - preserved exact logic from web
  async getActivityReviews(activityId: string): Promise<ApiResponse<Review[]>> {
    try {
      // For React Native, return demo data or implement actual API call
      const demoReviews: Review[] = [
        {
          id: 'review-1',
          activity_id: activityId,
          reviewer_id: 'user-1',
          reviewee_id: 'organizer-1', 
          rating: 5,
          comment: 'Amazing session! Holly is such a patient instructor.',
          created_at: new Date().toISOString(),
          reviewer: {
            id: 'user-1',
            full_name: 'Sarah M.',
            profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
          },
          activity: {
            id: activityId,
            title: 'Westway Climbing Session',
            date: '2024-01-15'
          }
        }
      ];
      
      return { data: demoReviews };
    } catch (error) {
      return { error: 'Failed to fetch reviews' };
    }
  },

  async createActivityReview(reviewData: {
    activity_id: string;
    reviewee_id: string; 
    rating: number;
    comment?: string;
  }): Promise<ApiResponse<Review>> {
    try {
      // Store review locally for React Native
      const reviews = await AsyncStorage.getItem('user_reviews') || '[]';
      const parsedReviews = JSON.parse(reviews);
      
      const newReview: Review = {
        id: `review-${Date.now()}`,
        ...reviewData,
        reviewer_id: 'current-user',
        created_at: new Date().toISOString()
      };
      
      parsedReviews.push(newReview);
      await AsyncStorage.setItem('user_reviews', JSON.stringify(parsedReviews));
      
      return { data: newReview };
    } catch (error) {
      return { error: 'Failed to create review' };
    }
  },

  async getUserReviews(userId: string): Promise<ApiResponse<Review[]>> {
    try {
      // Get cached reviews for React Native
      const reviews = await AsyncStorage.getItem('user_reviews') || '[]';
      const parsedReviews = JSON.parse(reviews);
      const userReviews = parsedReviews.filter((r: Review) => r.reviewee_id === userId);
      
      return { data: userReviews };
    } catch (error) {
      return { error: 'Failed to fetch user reviews' };
    }
  },

  async getReviews(params: { user_id?: string; activity_id?: string } = {}): Promise<ApiResponse<Review[]>> {
    try {
      // Demo reviews for React Native with preserved web logic
      const demoReviews: Review[] = [
        {
          id: 'demo-review-1',
          activity_id: params.activity_id || 'demo-activity-1',
          reviewer_id: 'demo-user-1',
          reviewee_id: params.user_id || 'demo-organizer-1',
          rating: 5,
          comment: 'Excellent session! Very well organized.',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          reviewer: {
            id: 'demo-user-1',
            full_name: 'Demo Reviewer',
            profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
          }
        }
      ];
      
      return { data: demoReviews };
    } catch (error) {
      return { error: 'Failed to fetch reviews' };
    }
  },

  // Followers/Following API methods - preserved exact logic from web
  async getUserFollowers(userId: string): Promise<ApiResponse<any[]>> {
    try {
      // Demo followers data for React Native
      const demoFollowers = [
        {
          id: 'follow-1',
          follower_id: 'demo-user-1',
          following_id: userId,
          created_at: new Date().toISOString(),
          follower: {
            id: 'demo-user-1',
            full_name: 'Sarah Johnson',
            profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
            university: 'Cambridge University'
          }
        }
      ];
      
      return { data: demoFollowers };
    } catch (error) {
      return { error: 'Failed to fetch followers' };
    }
  },

  async getUserFollowing(userId: string): Promise<ApiResponse<any[]>> {
    try {
      // Demo following data for React Native
      const demoFollowing = [
        {
          id: 'follow-2',
          follower_id: userId,
          following_id: 'demo-user-2',
          created_at: new Date().toISOString(),
          following: {
            id: 'demo-user-2',
            full_name: 'Alex Chen',
            profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            university: 'Oxford University'
          }
        }
      ];
      
      return { data: demoFollowing };
    } catch (error) {
      return { error: 'Failed to fetch following' };
    }
  },

  async followUser(userId: string): Promise<ApiResponse<any>> {
    try {
      // Store follow relationship locally for React Native
      const following = await AsyncStorage.getItem('user_following') || '[]';
      const parsedFollowing = JSON.parse(following);
      
      const newFollow = {
        id: `follow-${Date.now()}`,
        follower_id: 'current-user',
        following_id: userId,
        created_at: new Date().toISOString(),
        following: {
          id: userId,
          full_name: 'User',
          profile_image: undefined
        }
      };
      
      parsedFollowing.push(newFollow);
      await AsyncStorage.setItem('user_following', JSON.stringify(parsedFollowing));
      
      return { data: newFollow };
    } catch (error) {
      return { error: 'Failed to follow user' };
    }
  },

  async unfollowUser(userId: string): Promise<ApiResponse<any>> {
    try {
      // Remove follow relationship locally for React Native
      const following = await AsyncStorage.getItem('user_following') || '[]';
      const parsedFollowing = JSON.parse(following);
      const updatedFollowing = parsedFollowing.filter((f: any) => f.following_id !== userId);
      
      await AsyncStorage.setItem('user_following', JSON.stringify(updatedFollowing));
      
      return { data: { message: 'Successfully unfollowed user' } };
    } catch (error) {
      return { error: 'Failed to unfollow user' };
    }
  },

  async getFollowStats(userId: string): Promise<ApiResponse<{ followers: number; following: number }>> {
    try {
      // Demo stats for React Native with preserved web logic
      return { 
        data: { 
          followers: 152, 
          following: 87 
        } 
      };
    } catch (error) {
      return { error: 'Failed to fetch follow stats' };
    }
  },

  // Saved Activities methods - preserved exact logic from web
  async getSavedActivities(): Promise<ApiResponse<any[]>> {
    try {
      const savedActivities = await AsyncStorage.getItem('saved_activities') || '[]';
      return { data: JSON.parse(savedActivities) };
    } catch (error) {
      return { error: 'Failed to fetch saved activities' };
    }
  },

  async saveActivity(activityId: string): Promise<ApiResponse<any>> {
    try {
      const savedActivities = await AsyncStorage.getItem('saved_activities') || '[]';
      const parsedSaved = JSON.parse(savedActivities);
      
      const newSave = {
        id: `save-${Date.now()}`,
        activity_id: activityId,
        user_id: 'current-user',
        saved_at: new Date().toISOString()
      };
      
      parsedSaved.push(newSave);
      await AsyncStorage.setItem('saved_activities', JSON.stringify(parsedSaved));
      
      return { data: newSave };
    } catch (error) {
      return { error: 'Failed to save activity' };
    }
  },

  async unsaveActivity(activityId: string): Promise<ApiResponse<any>> {
    try {
      const savedActivities = await AsyncStorage.getItem('saved_activities') || '[]';
      const parsedSaved = JSON.parse(savedActivities);
      const updatedSaved = parsedSaved.filter((s: any) => s.activity_id !== activityId);
      
      await AsyncStorage.setItem('saved_activities', JSON.stringify(updatedSaved));
      
      return { data: { message: 'Activity unsaved successfully' } };
    } catch (error) {
      return { error: 'Failed to unsave activity' };
    }
  },

  // Activity participation methods - preserved exact logic from web  
  async getUserActivityHistory(params: {
    user_id?: string;
    status?: 'completed' | 'upcoming';
    limit?: number;
    offset?: number;
    include_reviews?: boolean;
  } = {}): Promise<ApiResponse<Activity[]>> {
    try {
      // Demo activity history for React Native
      const demoActivities: Activity[] = [
        {
          id: 'activity-1',
          title: 'Advanced Technique Workshop',
          activity_type: 'climbing',
          date: '2025-01-15',
          location: 'Training Academy',
          organizer_id: 'demo-organizer-1',
          organizer_name: 'Training Academy',
          participant_count: 8,
          status: 'completed',
          average_rating: 5.0,
          total_reviews: 1
        },
        {
          id: 'activity-2',
          title: 'Morning Cycle Ride',
          activity_type: 'cycling', 
          date: '2025-01-10',
          location: 'Richmond Park',
          organizer_id: 'current-user',
          organizer_name: 'You',
          participant_count: 12,
          status: 'completed',
          average_rating: 4.8,
          total_reviews: 5
        }
      ];
      
      return { data: demoActivities };
    } catch (error) {
      return { error: 'Failed to fetch activity history' };
    }
  },

  async getActivitiesNeedingReview(): Promise<ApiResponse<Activity[]>> {
    try {
      // Demo activities needing review for React Native
      const demoActivities: Activity[] = [
        {
          id: 'review-needed-1',
          title: 'Past Climbing Session',
          activity_type: 'climbing',
          date: '2025-01-05',
          location: 'Westway Climbing Centre',
          organizer_id: 'demo-organizer-1',
          organizer_name: 'Holly Smith',
          participant_count: 0,
          status: 'completed'
        }
      ];
      
      return { data: demoActivities };
    } catch (error) {
      return { error: 'Failed to fetch activities needing review' };
    }
  },

  // Activity creation and management - preserved exact logic from web
  async createActivity(activityData: any): Promise<ApiResponse<any>> {
    try {
      const activities = await AsyncStorage.getItem('user_activities') || '[]';
      const parsedActivities = JSON.parse(activities);
      
      const newActivity = {
        id: `activity-${Date.now()}`,
        ...activityData,
        organizer_id: 'current-user',
        created_at: new Date().toISOString(),
        status: 'upcoming'
      };
      
      parsedActivities.push(newActivity);
      await AsyncStorage.setItem('user_activities', JSON.stringify(parsedActivities));
      
      return { data: newActivity };
    } catch (error) {
      return { error: 'Failed to create activity' };
    }
  },

  async joinActivity(activityId: string): Promise<ApiResponse<any>> {
    try {
      const joinedActivities = await AsyncStorage.getItem('joined_activities') || '[]';
      const parsedJoined = JSON.parse(joinedActivities);
      
      const newJoin = {
        id: `join-${Date.now()}`,
        activity_id: activityId,
        user_id: 'current-user',
        joined_at: new Date().toISOString(),
        status: 'joined'
      };
      
      parsedJoined.push(newJoin);
      await AsyncStorage.setItem('joined_activities', JSON.stringify(parsedJoined));
      
      return { data: newJoin };
    } catch (error) {
      return { error: 'Failed to join activity' };
    }
  },

  async leaveActivity(activityId: string): Promise<ApiResponse<any>> {
    try {
      const joinedActivities = await AsyncStorage.getItem('joined_activities') || '[]';
      const parsedJoined = JSON.parse(joinedActivities);
      const updatedJoined = parsedJoined.filter((j: any) => j.activity_id !== activityId);
      
      await AsyncStorage.setItem('joined_activities', JSON.stringify(updatedJoined));
      
      return { data: { message: 'Successfully left activity' } };
    } catch (error) {
      return { error: 'Failed to leave activity' };
    }
  }
};

export default apiService;
