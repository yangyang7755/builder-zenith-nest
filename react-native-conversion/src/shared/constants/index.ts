// Shared constants across web and React Native

// App configuration
export const APP_CONFIG = {
  name: "Wildpals",
  version: "1.0.0",
  description: "Connect with outdoor enthusiasts",
  website: "https://wildpals.app",
  supportEmail: "support@wildpals.app",
} as const;

// API configuration
export const API_CONFIG = {
  baseUrl: "/api",
  timeout: 8000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

// Colors (matching your design system)
export const COLORS = {
  // Primary colors
  primary: "#1F381F", // explore-green
  primaryLight: "#2D5F2D",
  primaryDark: "#0F2B0F",

  // Secondary colors
  secondary: "#6B7280", // gray-500
  secondaryLight: "#9CA3AF", // gray-400
  secondaryDark: "#374151", // gray-700

  // Status colors
  success: "#10B981", // green-500
  warning: "#F59E0B", // yellow-500
  error: "#EF4444", // red-500
  info: "#3B82F6", // blue-500

  // Background colors
  background: "#FFFFFF",
  backgroundSecondary: "#F9FAFB", // gray-50
  backgroundDark: "#111827", // gray-900

  // Text colors
  text: "#000000",
  textSecondary: "#6B7280", // gray-500
  textLight: "#9CA3AF", // gray-400
  textInverse: "#FFFFFF",

  // Border colors
  border: "#E5E7EB", // gray-200
  borderLight: "#F3F4F6", // gray-100
  borderDark: "#D1D5DB", // gray-300

  // Transparent colors
  transparent: "transparent",
  overlay: "rgba(0, 0, 0, 0.5)",
} as const;

// Typography
export const TYPOGRAPHY = {
  // Font families (will be platform-specific)
  fontFamily: {
    regular: "System", // Will be overridden per platform
    medium: "System-Medium",
    bold: "System-Bold",
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 28,
    "4xl": 32,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Font weights
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,
} as const;

// Border radius
export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Activity types
export const ACTIVITY_TYPES = [
  { id: "cycling", name: "Cycling", emoji: "🚴" },
  { id: "climbing", name: "Climbing", emoji: "🧗" },
  { id: "running", name: "Running", emoji: "🏃" },
  { id: "hiking", name: "Hiking", emoji: "🥾" },
  { id: "skiing", name: "Skiing", emoji: "⛷️" },
  { id: "surfing", name: "Surfing", emoji: "🏄" },
  { id: "tennis", name: "Tennis", emoji: "🎾" },
  { id: "general", name: "General", emoji: "⚡" },
] as const;

// Difficulty levels
export const DIFFICULTY_LEVELS = [
  { id: "beginner", name: "Beginner", color: COLORS.success },
  { id: "intermediate", name: "Intermediate", color: COLORS.warning },
  { id: "advanced", name: "Advanced", color: COLORS.error },
  { id: "expert", name: "Expert", color: "#8B5CF6" }, // purple-500
] as const;

// Gender options
export const GENDER_OPTIONS = [
  { id: "all", name: "All genders" },
  { id: "female", name: "Female only" },
  { id: "male", name: "Male only" },
  { id: "mixed", name: "Mixed" },
] as const;

// Navigation tabs (matching your bottom navigation)
export const NAVIGATION_TABS = [
  { id: "explore", name: "Explore", icon: "🏠" },
  { id: "activities", name: "Activities", icon: "⏰" },
  { id: "create", name: "Create", icon: "➕" },
  { id: "chat", name: "Chat", icon: "💬" },
  { id: "profile", name: "Profile", icon: "👤" },
] as const;

// Default filter values
export const DEFAULT_FILTERS = {
  activityType: ACTIVITY_TYPES.map((type) => type.name),
  numberOfPeople: { min: 1, max: 50 },
  location: "",
  locationRange: 10,
  date: { start: "", end: "" },
  gender: [],
  age: { min: 16, max: 80 },
  gear: [],
  pace: { min: 0, max: 100 },
  distance: { min: 0, max: 200 },
  elevation: { min: 0, max: 5000 },
  clubOnly: false,
} as const;

// Form validation constants
export const VALIDATION_RULES = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address",
  },
  password: {
    minLength: 6,
    required: true,
    message: "Password must be at least 6 characters long",
  },
  name: {
    minLength: 2,
    maxLength: 50,
    required: true,
    message: "Name must be between 2 and 50 characters",
  },
  bio: {
    maxLength: 500,
    message: "Bio cannot exceed 500 characters",
  },
} as const;

// Time zones and date formats
export const DATE_FORMATS = {
  display: "DD MMM YYYY",
  displayWithTime: "DD MMM YYYY, HH:mm",
  api: "YYYY-MM-DD",
  apiWithTime: "YYYY-MM-DDTHH:mm:ss.SSSZ",
} as const;

// Image upload constants
export const IMAGE_UPLOAD = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  quality: 0.8,
  maxWidth: 1024,
  maxHeight: 1024,
} as const;

// Search and pagination
export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
  minSearchLength: 2,
  searchDebounceMs: 300,
} as const;

// Location constants
export const LOCATION_CONFIG = {
  defaultLocation: "London, UK",
  defaultCoordinates: { lat: 51.5074, lng: -0.1278 },
  searchRadius: [5, 10, 20, 50, 100], // km
  defaultRadius: 10,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  network: "No internet connection. Please check your network.",
  serverError: "Something went wrong. Please try again later.",
  unauthorized: "Please log in to continue.",
  forbidden: "You don't have permission to perform this action.",
  notFound: "The requested resource was not found.",
  validationError: "Please check your input and try again.",
  timeout: "Request timed out. Please try again.",
  unknown: "An unexpected error occurred.",
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  loginSuccess: "Welcome back!",
  signupSuccess: "Account created successfully!",
  profileUpdated: "Profile updated successfully!",
  activityCreated: "Activity created successfully!",
  activityJoined: "You've joined the activity!",
  activityLeft: "You've left the activity.",
  followSuccess: "You're now following this user!",
  unfollowSuccess: "You've unfollowed this user.",
  reviewSubmitted: "Thank you for your review!",
} as const;

// Storage keys (for platform-specific storage)
export const STORAGE_KEYS = {
  authToken: "@wildpals:auth_token",
  userProfile: "@wildpals:user_profile",
  savedActivities: "@wildpals:saved_activities",
  recentSearches: "@wildpals:recent_searches",
  appSettings: "@wildpals:app_settings",
  onboardingComplete: "@wildpals:onboarding_complete",
} as const;

// Feature flags
export const FEATURES = {
  enablePushNotifications: true,
  enableLocationServices: true,
  enableSocialLogin: true,
  enableOfflineMode: false,
  enableAnalytics: true,
  enableCrashReporting: true,
} as const;

export default {
  APP_CONFIG,
  API_CONFIG,
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  ACTIVITY_TYPES,
  DIFFICULTY_LEVELS,
  GENDER_OPTIONS,
  NAVIGATION_TABS,
  DEFAULT_FILTERS,
  VALIDATION_RULES,
  DATE_FORMATS,
  IMAGE_UPLOAD,
  PAGINATION,
  LOCATION_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  FEATURES,
};
