import { useState, useEffect } from 'react';
import { ApiService } from '@/services/apiService';

export interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  university?: string;
  bio?: string;
  profile_image?: string;
  average_rating?: number;
  total_reviews?: number;
  followers_count?: number;
  following_count?: number;
}

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        // If it's the current user, get their own profile
        const profileEndpoint = userId === 'me' ? '/api/profile' : `/api/users/${userId}/profile`;
        
        const [profileRes, followStatsRes] = await Promise.all([
          ApiService.get(profileEndpoint).catch(() => null),
          ApiService.get(`/api/users/${userId}/follow-stats`).catch(() => ({ followers: 0, following: 0 }))
        ]);

        if (profileRes) {
          setProfile(profileRes);
        }
        
        setFollowStats(followStatsRes);

      } catch (err) {
        console.error('Failed to fetch profile data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  const fetchFollowers = async () => {
    if (!userId) return;
    try {
      const data = await ApiService.get(`/api/users/${userId}/followers`);
      setFollowers(data);
    } catch (err) {
      console.error('Failed to fetch followers:', err);
    }
  };

  const fetchFollowing = async () => {
    if (!userId) return;
    try {
      const data = await ApiService.get(`/api/users/${userId}/following`);
      setFollowing(data);
    } catch (err) {
      console.error('Failed to fetch following:', err);
    }
  };

  const followUser = async (targetUserId: string) => {
    try {
      await ApiService.post('/api/follow', { following_id: targetUserId });
      setFollowStats(prev => ({ ...prev, following: prev.following + 1 }));
      return true;
    } catch (err) {
      console.error('Failed to follow user:', err);
      return false;
    }
  };

  const unfollowUser = async (targetUserId: string) => {
    try {
      await ApiService.delete(`/api/follow/${targetUserId}`);
      setFollowStats(prev => ({ ...prev, following: prev.following - 1 }));
      return true;
    } catch (err) {
      console.error('Failed to unfollow user:', err);
      return false;
    }
  };

  return {
    profile,
    followers,
    following,
    followStats,
    loading,
    error,
    fetchFollowers,
    fetchFollowing,
    followUser,
    unfollowUser,
    refresh: () => {
      if (userId) {
        // Re-fetch profile data
        setLoading(true);
        setError(null);
      }
    }
  };
}
