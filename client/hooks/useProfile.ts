import { useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';

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
        
        const [profileResult, followStatsResult] = await Promise.all([
          userId === 'me' ? apiService.getProfile() : null,
          apiService.getFollowStats(userId).catch(() => ({ data: { followers: 0, following: 0 } }))
        ]);

        if (profileResult && profileResult.data) {
          setProfile(profileResult.data);
        }

        setFollowStats(followStatsResult.data || { followers: 0, following: 0 });

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
      const response = await fetch(`/api/users/${userId}/followers`);
      const data = await response.json();
      setFollowers(data);
    } catch (err) {
      console.error('Failed to fetch followers:', err);
    }
  };

  const fetchFollowing = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/users/${userId}/following`);
      const data = await response.json();
      setFollowing(data);
    } catch (err) {
      console.error('Failed to fetch following:', err);
    }
  };

  const followUser = async (targetUserId: string) => {
    try {
      await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ following_id: targetUserId })
      });
      setFollowStats(prev => ({ ...prev, following: prev.following + 1 }));
      return true;
    } catch (err) {
      console.error('Failed to follow user:', err);
      return false;
    }
  };

  const unfollowUser = async (targetUserId: string) => {
    try {
      await fetch(`/api/follow/${targetUserId}`, { method: 'DELETE' });
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
