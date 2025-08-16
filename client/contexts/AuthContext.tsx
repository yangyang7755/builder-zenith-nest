import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import {
  supabase,
  Profile,
  signIn,
  signUp,
  signOut,
  getCurrentUser,
} from "../lib/supabase";
import {
  createProfileFromOnboarding,
  hasOnboardingData,
  getOnboardingCompletionSummary
} from "../services/onboardingService";
import { UserProfile } from "./OnboardingContext";
import { robustFetch } from "../utils/robustFetch";

// Use the robust fetch implementation to handle third-party interference
const safeFetch = robustFetch;

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ user: User | null; error: any }>;
  signUp: (
    email: string,
    password: string,
    userData?: { full_name?: string },
  ) => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  createProfileFromOnboardingData: (onboardingProfile: UserProfile) => Promise<void>;
  hasOnboardingBasedProfile: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from our API
  const fetchProfile = async (userId: string, authToken: string) => {
    try {
      // Create timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await safeFetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);

        // Persist profile to localStorage
        localStorage.setItem("userProfile", JSON.stringify(profileData));
        localStorage.setItem(
          "userSession",
          JSON.stringify({
            userId,
            authToken,
            timestamp: Date.now(),
          }),
        );
      } else {
        console.log(`Profile fetch failed with status: ${response.status}`);
        // If profile fetch fails but we have a valid user, create a basic profile
        if (userId) {
          const basicProfile = {
            id: userId,
            email: "user@example.com",
            full_name: "User",
            university: null,
            bio: null,
            profile_image: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setProfile(basicProfile);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Create a fallback profile for development
      if (userId) {
        const fallbackProfile = {
          id: userId,
          email: "user@example.com",
          full_name: "User",
          university: null,
          bio: null,
          profile_image: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(fallbackProfile);
        console.log("Using fallback profile due to fetch error");
      }
    }
  };

  // Update profile via API
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!session?.access_token) return;

    try {
      const response = await safeFetch("/api/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);

        // Persist updated profile to localStorage
        localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (user && session?.access_token) {
      await fetchProfile(user.id, session.access_token);
    }
  };

  // Create profile from onboarding data
  const createProfileFromOnboardingData = async (onboardingProfile: UserProfile) => {
    if (!user || !session?.access_token) {
      throw new Error("User not authenticated");
    }

    try {
      console.log("Creating profile from onboarding data for user:", user.email);

      const result = await createProfileFromOnboarding(
        onboardingProfile,
        user.email || "",
        session.access_token
      );

      // Handle different response formats
      if (result && result.profile) {
        setProfile(result.profile);

        // Persist updated profile to localStorage
        localStorage.setItem("userProfile", JSON.stringify(result.profile));
        console.log("Profile created and updated from onboarding data");
      } else if (result && result.success === false) {
        const errorMessage = result.error || result.message || "Failed to create profile from onboarding";
        throw new Error(errorMessage);
      } else {
        // If result is the profile itself
        setProfile(result);
        localStorage.setItem("userProfile", JSON.stringify(result));
        console.log("Profile created and updated from onboarding data");
      }
    } catch (error) {
      console.error("Error creating profile from onboarding:", error);

      // Improve error message handling
      let errorMessage = "Failed to create profile";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        // Handle error objects properly to avoid "[object Object]"
        errorMessage = error.message || error.error || error.description || 'Unknown error occurred';
      }

      throw new Error(errorMessage);
    }
  };

  // Check if current profile was created from onboarding data
  const hasOnboardingBasedProfile = () => {
    if (!profile) return false;

    // Check if profile has fields that would come from onboarding
    return !!(
      profile.age ||
      profile.gender ||
      profile.nationality ||
      profile.occupation ||
      (profile.sports && Array.isArray(profile.sports) && profile.sports.length > 0)
    );
  };

  useEffect(() => {
    let mounted = true;

    // Load persisted user data from localStorage
    const loadPersistedData = () => {
      try {
        const savedProfile = localStorage.getItem("userProfile");
        const savedSession = localStorage.getItem("userSession");

        if (savedProfile && savedSession) {
          const profile = JSON.parse(savedProfile);
          const sessionData = JSON.parse(savedSession);

          // Check if session is not too old (e.g., less than 24 hours)
          const isSessionValid =
            Date.now() - sessionData.timestamp < 24 * 60 * 60 * 1000;

          if (isSessionValid && mounted) {
            setProfile(profile);
            console.log("Loaded persisted user profile:", profile.full_name);
          } else {
            // Clear expired session data
            localStorage.removeItem("userProfile");
            localStorage.removeItem("userSession");
          }
        }
      } catch (error) {
        console.error("Error loading persisted user data:", error);
        localStorage.removeItem("userProfile");
        localStorage.removeItem("userSession");
      }
    };

    // Load persisted data first
    loadPersistedData();

    // Get initial session
    const getInitialSession = async () => {
      if (!supabase) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();

      if (mounted) {
        setSession(initialSession);
        setUser(initialSession?.user || null);

        if (initialSession?.user && initialSession?.access_token) {
          await fetchProfile(
            initialSession.user.id,
            initialSession.access_token,
          );
        }

        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes (only if Supabase is available)
    let subscription: any = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          console.log(
            "Auth state changed:",
            event,
            currentSession?.user?.email,
          );

          if (mounted) {
            setSession(currentSession);
            setUser(currentSession?.user || null);

            if (currentSession?.user && currentSession?.access_token) {
              await fetchProfile(
                currentSession.user.id,
                currentSession.access_token,
              );
            } else {
              setProfile(null);
            }

            setLoading(false);
          }
        },
      );
      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn: async (email: string, password: string) => {
      const result = await signIn(email, password);

      // In demo mode, manually set user state since we don't have real auth state changes
      if (result.data.user && !supabase) {
        setUser(result.data.user);
        const demoProfile = {
          id: result.data.user.id,
          email: result.data.user.email,
          full_name: result.data.user.user_metadata?.full_name || "Demo User",
          university: "Demo University",
          bio: "Demo user profile",
          profile_image: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(demoProfile);
        setLoading(false);
      }

      return { user: result.data.user, error: result.error };
    },
    signUp: async (
      email: string,
      password: string,
      userData?: { full_name?: string },
    ) => {
      const result = await signUp(email, password, userData);

      // In demo mode, don't automatically sign in after signup
      // Just return success so user can proceed to signin page

      return { user: result.data.user, error: result.error };
    },
    signOut: async () => {
      const result = await signOut();
      if (!result.error) {
        setUser(null);
        setProfile(null);
        setSession(null);

        // Clear persisted data
        localStorage.removeItem("userProfile");
        localStorage.removeItem("userSession");
      }
      return { error: result.error };
    },
    updateProfile,
    refreshProfile,
    createProfileFromOnboardingData,
    hasOnboardingBasedProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
