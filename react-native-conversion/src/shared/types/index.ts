// Shared types across web and React Native

export interface User {
  id: string;
  email: string;
  full_name: string;
  profile_image?: string;
  bio?: string;
  birthday?: string;
  gender?: string;
  country?: string;
  profession?: string;
  university?: string;
  location?: string;
  sports?: string[];
  languages?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Activity {
  id: string;
  title: string;
  type:
    | "cycling"
    | "climbing"
    | "running"
    | "hiking"
    | "skiing"
    | "surfing"
    | "tennis"
    | "general";
  date: string;
  time?: string;
  location: string;
  meetupLocation?: string;
  organizer: string;
  organizer_id?: string;
  maxParticipants?: string;
  max_participants?: number;
  specialComments?: string;
  imageSrc?: string;
  distance?: string;
  elevation?: string;
  pace?: string;
  difficulty?: string;
  difficulty_level?: string;
  climbingLevel?: string;
  gender?: string;
  visibility?: string;
  club_id?: string;
  club?: {
    id: string;
    name: string;
    profile_image?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  bio?: string;
  profile_image?: string;
  birthday?: string;
  gender?: string;
  nationality?: string;
  profession?: string;
  university?: string;
  location?: string;
  sports?: string[];
  languages?: string[];
  climbingLevel?: string;
  climbingExperience?: string;
  cyclingLevel?: string;
  cyclingExperience?: string;
  runningLevel?: string;
  runningExperience?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Club {
  id: string;
  name: string;
  description?: string;
  profile_image?: string;
  location?: string;
  sport_types?: string[];
  member_count?: number;
  created_at?: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower?: User;
  following?: User;
}

export interface Review {
  id: string;
  activity_id: string;
  reviewer_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer?: User;
  activity?: Activity;
}

export interface FilterOptions {
  activityType: string[];
  numberOfPeople: { min: number; max: number };
  location: string;
  locationRange?: number;
  date: { start: string; end: string };
  gender: string[];
  age: { min: number; max: number };
  gear: string[];
  pace: { min: number; max: number };
  distance: { min: number; max: number };
  elevation: { min: number; max: number };
  clubOnly: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status?: number;
}

// Form validation types
export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
}

export interface CreateActivityData {
  title: string;
  type: Activity["type"];
  date: string;
  time: string;
  location: string;
  meetup_location?: string;
  max_participants: number;
  special_comments?: string;
  difficulty?: string;
  gender?: string;
  visibility?: string;
}

// Navigation types
export interface RouteParams {
  activityId?: string;
  userId?: string;
  clubId?: string;
}

// Component prop types
export interface ActivityCardProps {
  activity: Activity;
  onPress?: () => void;
  showSaveButton?: boolean;
  showJoinButton?: boolean;
}

export interface UserCardProps {
  user: User;
  onPress?: () => void;
  showFollowButton?: boolean;
}

export interface FilterSystemProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onShowMap?: () => void;
}

// State management types
export interface AuthState {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface ActivitiesState {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  filters: FilterOptions;
}

export interface FollowState {
  followers: Follow[];
  following: Follow[];
  stats: {
    followers: number;
    following: number;
  };
  loading: boolean;
  error: string | null;
}

// Utility types
export type ActivityType = Activity["type"];
export type DifficultyLevel =
  | "Beginner"
  | "Intermediate"
  | "Advanced"
  | "Expert";
export type GenderPreference =
  | "All genders"
  | "Female only"
  | "Male only"
  | "Mixed";

export default {
  User,
  Activity,
  Profile,
  Club,
  Follow,
  Review,
  FilterOptions,
  ApiResponse,
  ValidationResult,
  LoginCredentials,
  SignUpData,
  CreateActivityData,
  RouteParams,
  ActivityCardProps,
  UserCardProps,
  FilterSystemProps,
  AuthState,
  ActivitiesState,
  FollowState,
  ActivityType,
  DifficultyLevel,
  GenderPreference,
};
