import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

export interface ActivityWithReviews {
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
  recent_review?: {
    reviewer_name: string;
    comment: string;
    rating: number;
  };
}

interface UserActivitiesAndReviews {
  completedActivities: ActivityWithReviews[];
  organizedActivities: ActivityWithReviews[];
  totalActivities: number;
  averageRating: number;
  totalReviews: number;
}

export function useUserActivitiesAndReviews(userId?: string) {
  const [data, setData] = useState<UserActivitiesAndReviews>({
    completedActivities: [],
    organizedActivities: [],
    totalActivities: 0,
    averageRating: 0,
    totalReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!userId) {
      // Return demo data for non-authenticated users
      setData(getDemoActivitiesAndReviews());
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if API service methods are available
      if (!apiService.getUserActivityHistory || !apiService.getReviews) {
        console.warn('API service methods not available, using demo data');
        setData(getDemoActivitiesAndReviews());
        setLoading(false);
        return;
      }

      // Use Promise.allSettled to handle individual failures gracefully
      const [activitiesResult, reviewsResult] = await Promise.allSettled([
        apiService.getUserActivityHistory({
          user_id: userId,
          include_reviews: true,
        }),
        apiService.getReviews({
          user_id: userId,
        })
      ]);

      // Handle activities response
      let activitiesResponse;
      if (activitiesResult.status === 'fulfilled') {
        activitiesResponse = activitiesResult.value;
      } else {
        console.error('Error fetching activities:', activitiesResult.reason);
        activitiesResponse = { error: 'Failed to fetch activities', data: [] };
      }

      // Handle reviews response
      let reviewsResponse;
      if (reviewsResult.status === 'fulfilled') {
        reviewsResponse = reviewsResult.value;
      } else {
        console.error('Error fetching reviews:', reviewsResult.reason);
        reviewsResponse = { error: 'Failed to fetch reviews', data: [] };
      }

      // Check for specific error conditions
      const isNetworkError = (error: string) =>
        error.includes('Failed to fetch') ||
        error.includes('timeout') ||
        error.includes('Network error');

      const hasNetworkErrors =
        (activitiesResponse.error && isNetworkError(activitiesResponse.error)) ||
        (reviewsResponse.error && isNetworkError(reviewsResponse.error));

      if (hasNetworkErrors ||
          activitiesResponse.error === 'BACKEND_UNAVAILABLE' ||
          reviewsResponse.error === 'BACKEND_UNAVAILABLE') {
        console.warn('Network issues detected, falling back to demo data');
        setData(getDemoActivitiesAndReviews());
        setLoading(false);
        return;
      }

      // Only throw if it's not a network error (could be permission/auth issues)
      if (activitiesResponse.error && !isNetworkError(activitiesResponse.error)) {
        console.warn('Activities fetch error (non-network):', activitiesResponse.error);
      }

      if (reviewsResponse.error && !isNetworkError(reviewsResponse.error)) {
        console.warn('Reviews fetch error (non-network):', reviewsResponse.error);
      }

      const activities = activitiesResponse.data || [];
      const reviews = reviewsResponse.data || [];

      // Separate completed and organized activities
      const completedActivities = activities.filter(
        (activity: any) => activity.status === 'completed' && activity.organizer_id !== userId
      );
      const organizedActivities = activities.filter(
        (activity: any) => activity.organizer_id === userId
      );

      // Calculate statistics
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0 
        ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews 
        : 0;

      setData({
        completedActivities: enhanceActivitiesWithReviews(completedActivities, reviews),
        organizedActivities: enhanceActivitiesWithReviews(organizedActivities, reviews),
        totalActivities: activities.length,
        averageRating,
        totalReviews,
      });

    } catch (err) {
      console.error('Error fetching activities and reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      // Fallback to demo data on error
      setData(getDemoActivitiesAndReviews());
    } finally {
      setLoading(false);
    }
  };

  const enhanceActivitiesWithReviews = (activities: any[], reviews: any[]): ActivityWithReviews[] => {
    return activities.map(activity => {
      const activityReviews = reviews.filter(review => review.activity_id === activity.id);
      const averageRating = activityReviews.length > 0
        ? activityReviews.reduce((sum, review) => sum + review.rating, 0) / activityReviews.length
        : 0;
      
      const recentReview = activityReviews.length > 0 
        ? activityReviews[activityReviews.length - 1]
        : null;

      return {
        ...activity,
        average_rating: averageRating,
        total_reviews: activityReviews.length,
        recent_review: recentReview ? {
          reviewer_name: recentReview.reviewer?.full_name || 'Anonymous',
          comment: recentReview.comment || '',
          rating: recentReview.rating,
        } : undefined,
      };
    });
  };

  const getDemoActivitiesAndReviews = (): UserActivitiesAndReviews => {
    return {
      completedActivities: [
        {
          id: 'demo-completed-1',
          title: 'Advanced Technique Workshop',
          activity_type: 'climbing',
          date: '2025-01-15',
          location: 'London Climbing Academy',
          organizer_id: 'demo-organizer-1',
          organizer_name: 'Training Academy',
          participant_count: 8,
          status: 'completed',
          average_rating: 5.0,
          total_reviews: 1,
          recent_review: {
            reviewer_name: 'You',
            comment: 'Excellent workshop!',
            rating: 5,
          },
        },
      ],
      organizedActivities: [
        {
          id: 'demo-organized-1',
          title: 'Westway Women\'s+ Climbing Morning',
          activity_type: 'climbing',
          date: '2025-04-05',
          location: 'Westway Climbing Centre',
          organizer_id: 'demo-user-id',
          organizer_name: 'Maddie Wei',
          participant_count: 12,
          status: 'completed',
          average_rating: 4.9,
          total_reviews: 12,
          recent_review: {
            reviewer_name: 'Sarah',
            comment: 'Holly is an amazing coach!',
            rating: 5,
          },
        },
        {
          id: 'demo-organized-2',
          title: 'Beginner Climbing Workshop',
          activity_type: 'climbing',
          date: '2025-01-28',
          location: 'Westway Climbing Centre',
          organizer_id: 'demo-user-id',
          organizer_name: 'Maddie Wei',
          participant_count: 15,
          status: 'completed',
          average_rating: 4.8,
          total_reviews: 15,
          recent_review: {
            reviewer_name: 'Alice',
            comment: 'Perfect for beginners, very patient',
            rating: 5,
          },
        },
      ],
      totalActivities: 42,
      averageRating: 4.8,
      totalReviews: 23,
    };
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const refetch = () => {
    fetchData();
  };

  return {
    ...data,
    loading,
    error,
    refetch,
  };
}
