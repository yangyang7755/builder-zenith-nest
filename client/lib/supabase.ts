import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate URL format
const isValidUrl = (url: string | undefined) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Basic JWT-like check for anon key format to avoid runtime AuthApiError loops
const isLikelyValidAnonKey = (key: string | undefined) => {
  if (!key || key === "temp-placeholder") return false;
  const parts = key.split(".");
  if (parts.length < 2) return false;
  try {
    const decoded = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof decoded === "object" && !!decoded;
  } catch {
    return false;
  }
};

const hasValidConfig = isValidUrl(supabaseUrl) && isLikelyValidAnonKey(supabaseAnonKey);

if (!hasValidConfig) {
  console.warn(
    "Supabase not fully configured or API key invalid. Running in demo mode (no auth).",
  );
}

export const supabase = hasValidConfig
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Helper to get auth header for API calls
export const getAuthHeader = async () => {
  if (!supabase) return "";
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ? `Bearer ${session.access_token}` : "";
};

// Auth helpers
export const signUp = async (
  email: string,
  password: string,
  userData?: { full_name?: string },
) => {
  if (!supabase) {
    // Simulate successful signup in demo mode
    const demoUser = {
      id: "demo-user-" + Date.now(),
      email: email,
      user_metadata: userData || {},
      created_at: new Date().toISOString(),
    };
    return {
      data: { user: demoUser },
      error: null,
    };
  }
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });
};

export const signIn = async (email: string, password: string) => {
  if (!supabase) {
    // Simulate successful signin in demo mode
    const demoUser = {
      id: "demo-user-signed-in",
      email: email,
      user_metadata: { full_name: "Demo User" },
      created_at: new Date().toISOString(),
    };
    return {
      data: { user: demoUser },
      error: null,
    };
  }
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const signOut = async () => {
  if (!supabase) {
    return { error: { message: "Authentication not configured" } };
  }
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

export const resendConfirmation = async (email: string) => {
  if (!supabase) {
    return { error: { message: "Authentication not configured" } };
  }
  return await supabase.auth.resend({
    type: 'signup',
    email: email,
  });
};

// Database types (should match server types)
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  university: string | null;
  bio: string | null;
  profile_image: string | null;
  created_at: string;
  updated_at: string;
}

export interface Club {
  id: string;
  name: string;
  description: string | null;
  type: string;
  location: string;
  profile_image: string | null;
  website: string | null;
  contact_email: string | null;
  member_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  meetup_location: string;
  max_participants: number | null;
  special_comments: string | null;
  difficulty: string | null;
  club_id: string | null;
  organizer_id: string;
  created_at: string;
  updated_at: string;
  organizer?: {
    id: string;
    full_name: string | null;
    email: string;
  };
  club?: {
    id: string;
    name: string;
  } | null;
}
