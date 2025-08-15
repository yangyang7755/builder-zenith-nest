import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Activity {
  id: string;
  title: string;
  description: string;
  activity_type: string;
  date: string;
  time: string;
  location: string;
  max_participants: number;
  current_participants: number;
  organizer_id: string;
  organizer_name: string;
  organizer_image?: string;
  skill_level: string;
  price?: number;
  meeting_point?: string;
  what_to_bring?: string[];
  images?: string[];
  is_recurring?: boolean;
  recurring_pattern?: string;
  created_at: string;
  updated_at: string;
  participants?: Participant[];
  reviews?: Review[];
  average_rating?: number;
  total_reviews?: number;
}

interface Participant {
  id: string;
  user_id: string;
  user_name: string;
  user_image?: string;
  joined_at: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface Review {
  id: string;
  activity_id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_image?: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ActivitiesContextType {
  activities: Activity[];
  userActivities: Activity[];
  isLoading: boolean;
  error: string | null;
  fetchActivities: () => Promise<void>;
  fetchUserActivities: () => Promise<void>;
  createActivity: (activityData: Partial<Activity>) => Promise<Activity>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  joinActivity: (activityId: string) => Promise<void>;
  leaveActivity: (activityId: string) => Promise<void>;
  addReview: (activityId: string, rating: number, comment: string) => Promise<void>;
  getActivityById: (id: string) => Activity | undefined;
  getActivitiesByType: (type: string) => Activity[];
  searchActivities: (query: string) => Activity[];
}

const ActivitiesContext = createContext<ActivitiesContextType | undefined>(undefined);

interface ActivitiesProviderProps {
  children: ReactNode;
}

export const ActivitiesProvider: React.FC<ActivitiesProviderProps> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userActivities, setUserActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check cache first
      const cachedActivities = await AsyncStorage.getItem('activities');
      if (cachedActivities) {
        setActivities(JSON.parse(cachedActivities));
      }
      
      // Fetch fresh data
      const freshActivities = await mockFetchActivities();
      setActivities(freshActivities);
      
      // Update cache
      await AsyncStorage.setItem('activities', JSON.stringify(freshActivities));
      
    } catch (err) {
      setError('Failed to fetch activities');
      console.error('Fetch activities error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock API call - replace with actual user activities fetch
      const userActivitiesData = await mockFetchUserActivities();
      setUserActivities(userActivitiesData);
      
    } catch (err) {
      setError('Failed to fetch user activities');
      console.error('Fetch user activities error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createActivity = async (activityData: Partial<Activity>): Promise<Activity> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock API call - replace with actual activity creation
      const newActivity = await mockCreateActivity(activityData);
      
      setActivities(prev => [newActivity, ...prev]);
      setUserActivities(prev => [newActivity, ...prev]);
      
      // Update cache
      const updatedActivities = [newActivity, ...activities];
      await AsyncStorage.setItem('activities', JSON.stringify(updatedActivities));
      
      return newActivity;
      
    } catch (err) {
      setError('Failed to create activity');
      console.error('Create activity error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock API call - replace with actual activity update
      const updatedActivity = await mockUpdateActivity(id, updates);
      
      setActivities(prev => 
        prev.map(activity => 
          activity.id === id ? { ...activity, ...updatedActivity } : activity
        )
      );
      
      setUserActivities(prev => 
        prev.map(activity => 
          activity.id === id ? { ...activity, ...updatedActivity } : activity
        )
      );
      
    } catch (err) {
      setError('Failed to update activity');
      console.error('Update activity error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock API call - replace with actual activity deletion
      await mockDeleteActivity(id);
      
      setActivities(prev => prev.filter(activity => activity.id !== id));
      setUserActivities(prev => prev.filter(activity => activity.id !== id));
      
    } catch (err) {
      setError('Failed to delete activity');
      console.error('Delete activity error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const joinActivity = async (activityId: string) => {
    try {
      setError(null);
      
      // Mock API call - replace with actual join activity
      await mockJoinActivity(activityId);
      
      // Update local state
      setActivities(prev => 
        prev.map(activity => 
          activity.id === activityId 
            ? { ...activity, current_participants: activity.current_participants + 1 }
            : activity
        )
      );
      
    } catch (err) {
      setError('Failed to join activity');
      console.error('Join activity error:', err);
      throw err;
    }
  };

  const leaveActivity = async (activityId: string) => {
    try {
      setError(null);
      
      // Mock API call - replace with actual leave activity
      await mockLeaveActivity(activityId);
      
      // Update local state
      setActivities(prev => 
        prev.map(activity => 
          activity.id === activityId 
            ? { ...activity, current_participants: Math.max(0, activity.current_participants - 1) }
            : activity
        )
      );
      
    } catch (err) {
      setError('Failed to leave activity');
      console.error('Leave activity error:', err);
      throw err;
    }
  };

  const addReview = async (activityId: string, rating: number, comment: string) => {
    try {
      setError(null);
      
      // Mock API call - replace with actual review submission
      const review = await mockAddReview(activityId, rating, comment);
      
      // Update local state
      setActivities(prev => 
        prev.map(activity => {
          if (activity.id === activityId) {
            const reviews = [...(activity.reviews || []), review];
            const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            return {
              ...activity,
              reviews,
              average_rating: averageRating,
              total_reviews: reviews.length,
            };
          }
          return activity;
        })
      );
      
    } catch (err) {
      setError('Failed to add review');
      console.error('Add review error:', err);
      throw err;
    }
  };

  const getActivityById = (id: string): Activity | undefined => {
    return activities.find(activity => activity.id === id);
  };

  const getActivitiesByType = (type: string): Activity[] => {
    return activities.filter(activity => 
      activity.activity_type.toLowerCase() === type.toLowerCase()
    );
  };

  const searchActivities = (query: string): Activity[] => {
    const lowercaseQuery = query.toLowerCase();
    return activities.filter(activity =>
      activity.title.toLowerCase().includes(lowercaseQuery) ||
      activity.description.toLowerCase().includes(lowercaseQuery) ||
      activity.location.toLowerCase().includes(lowercaseQuery) ||
      activity.activity_type.toLowerCase().includes(lowercaseQuery)
    );
  };

  const value: ActivitiesContextType = {
    activities,
    userActivities,
    isLoading,
    error,
    fetchActivities,
    fetchUserActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    joinActivity,
    leaveActivity,
    addReview,
    getActivityById,
    getActivitiesByType,
    searchActivities,
  };

  return (
    <ActivitiesContext.Provider value={value}>
      {children}
    </ActivitiesContext.Provider>
  );
};

// Mock API functions - replace with actual API calls
const mockFetchActivities = async (): Promise<Activity[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    {
      id: '1',
      title: 'Westway Climbing Session',
      description: 'Join us for an indoor climbing session at Westway Climbing Centre. Perfect for all skill levels!',
      activity_type: 'climbing',
      date: '2024-02-15',
      time: '18:00',
      location: 'Westway Climbing Centre, London',
      max_participants: 8,
      current_participants: 5,
      organizer_id: 'org_1',
      organizer_name: 'Holly Smith',
      organizer_image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop',
      skill_level: 'Beginner to Advanced',
      price: 15,
      meeting_point: 'Main entrance',
      what_to_bring: ['Climbing shoes', 'Water bottle', 'Chalk (optional)'],
      images: ['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400'],
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      average_rating: 4.5,
      total_reviews: 12,
    },
    {
      id: '2',
      title: 'Richmond Park Cycling',
      description: 'Scenic cycling route through Richmond Park. Great for intermediate cyclists.',
      activity_type: 'cycling',
      date: '2024-02-16',
      time: '09:00',
      location: 'Richmond Park, London',
      max_participants: 12,
      current_participants: 8,
      organizer_id: 'org_2',
      organizer_name: 'Marcus Rodriguez',
      organizer_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop',
      skill_level: 'Intermediate',
      meeting_point: 'Richmond Gate car park',
      what_to_bring: ['Bike', 'Helmet', 'Water bottle'],
      created_at: '2024-01-16T10:00:00Z',
      updated_at: '2024-01-16T10:00:00Z',
      average_rating: 4.2,
      total_reviews: 8,
    },
  ];
};

const mockFetchUserActivities = async (): Promise<Activity[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [];
};

const mockCreateActivity = async (activityData: Partial<Activity>): Promise<Activity> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    id: Date.now().toString(),
    title: activityData.title || '',
    description: activityData.description || '',
    activity_type: activityData.activity_type || '',
    date: activityData.date || '',
    time: activityData.time || '',
    location: activityData.location || '',
    max_participants: activityData.max_participants || 10,
    current_participants: 1,
    organizer_id: 'current_user',
    organizer_name: 'You',
    skill_level: activityData.skill_level || 'All levels',
    price: activityData.price,
    meeting_point: activityData.meeting_point,
    what_to_bring: activityData.what_to_bring || [],
    images: activityData.images || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    average_rating: 0,
    total_reviews: 0,
  };
};

const mockUpdateActivity = async (id: string, updates: Partial<Activity>) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { ...updates, updated_at: new Date().toISOString() };
};

const mockDeleteActivity = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
};

const mockJoinActivity = async (activityId: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
};

const mockLeaveActivity = async (activityId: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
};

const mockAddReview = async (activityId: string, rating: number, comment: string): Promise<Review> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    id: Date.now().toString(),
    activity_id: activityId,
    reviewer_id: 'current_user',
    reviewer_name: 'You',
    rating,
    comment,
    created_at: new Date().toISOString(),
  };
};

export const useActivities = (): ActivitiesContextType => {
  const context = useContext(ActivitiesContext);
  if (context === undefined) {
    throw new Error('useActivities must be used within an ActivitiesProvider');
  }
  return context;
};
