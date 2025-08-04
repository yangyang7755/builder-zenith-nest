import { useState, useEffect } from 'react';

interface VisibilitySettings {
  profile_image: boolean;
  full_name: boolean;
  bio: boolean;
  email: boolean;
  phone: boolean;
  gender: boolean;
  age: boolean;
  date_of_birth: boolean;
  nationality: boolean;
  institution: boolean;
  occupation: boolean;
  location: boolean;
  sports: boolean;
  achievements: boolean;
  activities: boolean;
  reviews: boolean;
  followers: boolean;
  following: boolean;
}

const defaultVisibility: VisibilitySettings = {
  profile_image: true,
  full_name: true,
  bio: true,
  email: false,
  phone: false,
  gender: true,
  age: true,
  date_of_birth: false,
  nationality: true,
  institution: true,
  occupation: true,
  location: true,
  sports: true,
  achievements: true,
  activities: true,
  reviews: true,
  followers: true,
  following: true,
};

export function useProfileVisibility(userId?: string) {
  const [visibility, setVisibility] = useState<VisibilitySettings>(defaultVisibility);
  const [loading, setLoading] = useState(false);

  // Load visibility settings for user
  useEffect(() => {
    if (userId) {
      loadVisibilitySettings(userId);
    }
  }, [userId]);

  const loadVisibilitySettings = async (userId: string) => {
    setLoading(true);
    try {
      // In a real app, this would fetch from API
      // For now, use localStorage or default settings
      const saved = localStorage.getItem(`profile_visibility_${userId}`);
      if (saved) {
        setVisibility(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load visibility settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateVisibility = async (field: keyof VisibilitySettings, visible: boolean) => {
    const newVisibility = { ...visibility, [field]: visible };
    setVisibility(newVisibility);
    
    // Save to localStorage (in real app, would save to API)
    if (userId) {
      localStorage.setItem(`profile_visibility_${userId}`, JSON.stringify(newVisibility));
    }
  };

  const isVisible = (field: keyof VisibilitySettings): boolean => {
    return visibility[field];
  };

  const getVisibleCount = (): number => {
    return Object.values(visibility).filter(Boolean).length;
  };

  const getHiddenCount = (): number => {
    return Object.values(visibility).filter(v => !v).length;
  };

  const refresh = () => {
    if (userId) {
      loadVisibilitySettings(userId);
    }
  };

  return {
    visibility,
    loading,
    isVisible,
    updateVisibility,
    getVisibleCount,
    getHiddenCount,
    setVisibility,
    refresh,
  };
}

export type { VisibilitySettings };
