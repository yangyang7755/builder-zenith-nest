import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Activity {
  id: string;
  title: string;
  description?: string;
  type: string;
  date: string;
  time: string;
  location: string;
  meetupLocation?: string;
  participants?: number;
  maxParticipants?: number;
  difficulty?: string;
  distance?: string;
  organizer: string | {
    id: string;
    full_name: string;
    profile_image?: string;
    email?: string;
  };
  organizerName?: string;
  image?: string;
  price_per_person?: number;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

interface ActivitiesContextType {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  
  // Core operations
  getActivities: () => Promise<void>;
  getActivity: (activityId: string) => Promise<Activity | null>;
  createActivity: (activity: Partial<Activity>) => Promise<void>;
  updateActivity: (activityId: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (activityId: string) => Promise<void>;
  
  // User-specific operations
  getUserParticipatedActivities: () => Activity[];
  getUserOrganizedActivities: () => Activity[];
  joinActivity: (activityId: string) => Promise<void>;
  leaveActivity: (activityId: string) => Promise<void>;
}

const ActivitiesContext = createContext<ActivitiesContextType | undefined>(undefined);

export function ActivitiesProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Demo activities for React Native
  const demoActivities: Activity[] = [
    {
      id: "rn-activity-1",
      title: "Morning Run in Hyde Park",
      description: "Join us for a refreshing morning run through Hyde Park. All fitness levels welcome!",
      type: "running",
      date: "2024-12-28",
      time: "07:00",
      location: "Hyde Park, London",
      meetupLocation: "Hyde Park Corner",
      participants: 8,
      maxParticipants: 15,
      difficulty: "Beginner",
      distance: "5km",
      organizer: "London Runners Club",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
      price_per_person: 0,
      status: "upcoming"
    },
    {
      id: "rn-activity-2",
      title: "Rock Climbing Workshop",
      description: "Learn the basics of indoor rock climbing with certified instructors.",
      type: "climbing",
      date: "2024-12-29",
      time: "14:00",
      location: "The Castle Climbing Centre",
      meetupLocation: "Reception Desk",
      participants: 5,
      maxParticipants: 10,
      difficulty: "Beginner",
      organizer: "Climbing Academy London",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop",
      price_per_person: 25,
      status: "upcoming"
    },
    {
      id: "rn-activity-3",
      title: "Thames Path Cycling Tour",
      description: "Scenic cycling tour along the Thames with stops at historic landmarks.",
      type: "cycling",
      date: "2024-12-30",
      time: "10:00",
      location: "Thames Path, London",
      meetupLocation: "London Bridge Station",
      participants: 12,
      maxParticipants: 20,
      difficulty: "Intermediate",
      distance: "25km",
      organizer: "London Cycling Tours",
      image: "https://images.unsplash.com/photo-1517654443271-11c621d19e60?w=400&h=300&fit=crop",
      price_per_person: 15,
      status: "upcoming"
    }
  ];

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from an API
      // For now, load demo data and any stored activities
      const storedActivities = await AsyncStorage.getItem('activities');
      const parsed = storedActivities ? JSON.parse(storedActivities) : [];
      setActivities([...demoActivities, ...parsed]);
    } catch (err) {
      setError('Failed to load activities');
      setActivities(demoActivities);
    } finally {
      setLoading(false);
    }
  };

  const saveActivities = async (newActivities: Activity[]) => {
    try {
      // Only save user-created activities, not demo ones
      const userActivities = newActivities.filter(a => !a.id.startsWith('rn-activity-'));
      await AsyncStorage.setItem('activities', JSON.stringify(userActivities));
    } catch (err) {
      console.error('Failed to save activities:', err);
    }
  };

  const getActivities = async () => {
    await loadActivities();
  };

  const getActivity = async (activityId: string): Promise<Activity | null> => {
    return activities.find(a => a.id === activityId) || null;
  };

  const createActivity = async (activity: Partial<Activity>) => {
    const newActivity: Activity = {
      id: `user-activity-${Date.now()}`,
      title: activity.title || '',
      description: activity.description,
      type: activity.type || 'general',
      date: activity.date || new Date().toISOString().split('T')[0],
      time: activity.time || '12:00',
      location: activity.location || '',
      meetupLocation: activity.meetupLocation,
      participants: 0,
      maxParticipants: activity.maxParticipants || 10,
      difficulty: activity.difficulty,
      distance: activity.distance,
      organizer: activity.organizer || 'Current User',
      image: activity.image,
      price_per_person: activity.price_per_person || 0,
      status: 'upcoming'
    };

    const updatedActivities = [...activities, newActivity];
    setActivities(updatedActivities);
    await saveActivities(updatedActivities);
  };

  const updateActivity = async (activityId: string, updates: Partial<Activity>) => {
    const updatedActivities = activities.map(a => 
      a.id === activityId ? { ...a, ...updates } : a
    );
    setActivities(updatedActivities);
    await saveActivities(updatedActivities);
  };

  const deleteActivity = async (activityId: string) => {
    const updatedActivities = activities.filter(a => a.id !== activityId);
    setActivities(updatedActivities);
    await saveActivities(updatedActivities);
  };

  const getUserParticipatedActivities = (): Activity[] => {
    // In a real app, this would filter based on actual user participation
    return activities.filter(a => a.participants && a.participants > 0);
  };

  const getUserOrganizedActivities = (): Activity[] => {
    // In a real app, this would filter based on actual user being the organizer
    return activities.filter(a => a.id.startsWith('user-activity-'));
  };

  const joinActivity = async (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    if (activity && activity.participants !== undefined && activity.maxParticipants !== undefined) {
      if (activity.participants < activity.maxParticipants) {
        await updateActivity(activityId, { 
          participants: activity.participants + 1 
        });
      }
    }
  };

  const leaveActivity = async (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    if (activity && activity.participants !== undefined && activity.participants > 0) {
      await updateActivity(activityId, { 
        participants: activity.participants - 1 
      });
    }
  };

  const value: ActivitiesContextType = {
    activities,
    loading,
    error,
    getActivities,
    getActivity,
    createActivity,
    updateActivity,
    deleteActivity,
    getUserParticipatedActivities,
    getUserOrganizedActivities,
    joinActivity,
    leaveActivity,
  };

  return (
    <ActivitiesContext.Provider value={value}>
      {children}
    </ActivitiesContext.Provider>
  );
}

export function useActivities() {
  const context = useContext(ActivitiesContext);
  if (context === undefined) {
    throw new Error('useActivities must be used within an ActivitiesProvider');
  }
  return context;
}
