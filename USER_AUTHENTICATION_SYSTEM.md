# Complete User Authentication & Profile System

This document outlines the comprehensive user authentication and profile management system that ensures every user who creates an account has their details saved in the backend database and can access their personal profile after logging in.

## 🎯 System Overview

The authentication system provides:
- **Backend Registration**: User accounts are created and stored in the database
- **Profile Auto-Creation**: Every registered user automatically gets a profile
- **Persistent Sessions**: User data persists across app reloads
- **Personal Profiles**: Users can view and edit their own profile data
- **Graceful Fallbacks**: Works in demo mode when backend is unavailable

## 🏗 Architecture Components

### 1. Backend Infrastructure

#### Database Schema (`database/profile_creation_trigger.sql`)
- **Profiles Table**: Extended with comprehensive user fields
- **Auto-Creation Trigger**: Automatically creates profile when user registers
- **RLS Policies**: Secure access control for user data
- **Helper Functions**: Safe profile management functions

```sql
-- Key features:
- Automatic profile creation on user registration
- Row-level security for data protection
- Comprehensive user fields (name, bio, university, etc.)
- Safe update and retrieval functions
```

#### Backend Routes (`server/routes/users.ts`)
- **POST /api/users/register**: Complete user registration with profile creation
- **POST /api/users/login**: Authentication with profile data return
- **GET /api/users/:userId/profile**: Fetch user profile
- **PUT /api/users/:userId/profile**: Update user profile

### 2. Frontend Implementation

#### Enhanced API Service (`client/services/apiService.ts`)
```typescript
// New authentication methods:
- registerUser(userData): Register new user with profile
- loginUser(credentials): Authenticate and get profile
- getUserProfile(userId): Fetch profile data
- updateUserProfile(userId, updates): Update profile
```

#### Enhanced Authentication Context (`client/contexts/AuthContext.tsx`)
- **Persistent Storage**: User data saved to localStorage
- **Session Management**: Automatic session validation
- **Profile Synchronization**: Real-time profile updates

#### New Pages & Components
- **SignUp** (Enhanced): Uses backend registration API
- **LoginEnhanced**: Complete authentication with backend
- **ProfileEnhanced**: Personalized profile with user data

## 🚀 User Registration Flow

### 1. User Creates Account
```typescript
// User fills out registration form
const userData = {
  email: "user@example.com",
  password: "securePassword",
  full_name: "John Doe",
  university: "Example University" // optional
};

// Backend automatically:
1. Creates user in auth.users table
2. Triggers profile creation in profiles table
3. Returns user and profile data
```

### 2. Database Trigger Execution
```sql
-- Automatic execution when user is created:
INSERT INTO profiles (id, email, full_name, ...)
VALUES (NEW.id, NEW.email, metadata.full_name, ...);
```

### 3. Response to Frontend
```json
{
  "success": true,
  "user": { "id": "uuid", "email": "user@example.com" },
  "profile": { 
    "id": "uuid", 
    "full_name": "John Doe",
    "email": "user@example.com",
    "university": "Example University"
  }
}
```

## 🔐 User Login Flow

### 1. Authentication
```typescript
// User provides credentials
const credentials = {
  email: "user@example.com",
  password: "securePassword"
};

// Backend:
1. Validates credentials
2. Fetches complete profile data
3. Returns session + profile
```

### 2. Profile Loading
```typescript
// Frontend automatically:
1. Stores user data in localStorage
2. Updates AuthContext state
3. Provides profile data to components
```

### 3. Persistent Sessions
```typescript
// On app reload:
1. Checks localStorage for saved profile
2. Validates session age (24 hours)
3. Restores user state if valid
```

## 👤 Personal Profile Features

### Enhanced Profile Page (`/profile-enhanced`)
- **User Information**: Name, email, university, bio
- **Activity Counts**: Created activities, saved activities, clubs
- **Personal Data**: Shows only the logged-in user's data
- **Edit Functionality**: Direct link to profile editing
- **Authentication Required**: Prompts login if not authenticated

### Profile Data Structure
```typescript
interface EnhancedProfile {
  id: string;
  email: string;
  full_name: string;
  university?: string;
  institution?: string;
  bio?: string;
  profile_image?: string;
  phone?: string;
  gender?: string;
  age?: number;
  date_of_birth?: Date;
  nationality?: string;
  occupation?: string;
  location?: string;
  visibility_settings: object;
  sports: array;
  achievements: array;
  created_at: string;
  updated_at: string;
}
```

## 🔄 Data Persistence Strategy

### LocalStorage Management
```typescript
// Stored data:
- userProfile: Complete profile information
- userSession: Session metadata with timestamp

// Auto-cleanup:
- Expired sessions (>24 hours) are removed
- Invalid data is cleared on error
```

### Backend Synchronization
- **Real-time Updates**: Profile changes sync immediately
- **Fallback Handling**: Works offline with cached data
- **Conflict Resolution**: Backend data takes precedence

## 🛡 Security Features

### Row Level Security (RLS)
```sql
-- Users can only access their own data:
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT USING (auth.uid() = id);
```

### Authentication Validation
- **Token Verification**: All API calls validate JWT tokens
- **Session Management**: Automatic token refresh
- **Secure Updates**: Only authenticated users can modify their data

### Data Protection
- **Input Validation**: All user inputs are sanitized
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Safe data rendering

## 📱 Demo Mode Support

When backend is unavailable:
- **Registration**: Creates demo user accounts
- **Login**: Simulates authentication
- **Profiles**: Uses mock data
- **Persistence**: Falls back to localStorage only

## 🧪 Testing the System

### 1. Test Registration
```bash
# Navigate to signup page
/signup

# Fill form and submit
- Full Name: "Test User"
- Email: "test@example.com"  
- Password: "password123"

# Verify:
✅ Account created successfully
✅ Redirected to login or profile
✅ Profile exists in database
```

### 2. Test Login
```bash
# Navigate to enhanced login
/login-enhanced

# Enter credentials and submit
- Email: "test@example.com"
- Password: "password123"

# Verify:
✅ Login successful
✅ Profile data loaded
✅ User state persisted
```

### 3. Test Profile Access
```bash
# Navigate to enhanced profile
/profile-enhanced

# Verify:
✅ Personal profile displayed
✅ User's own data shown
✅ Activities/clubs counted correctly
✅ Edit profile available
```

## 🔗 Integration Points

### Existing Components
The new system integrates with:
- **ActivitiesContext**: Shows user's own activities
- **SavedActivitiesContext**: Displays saved activities
- **ClubContext**: Lists user's club memberships
- **BottomNavigation**: Profile link leads to personal profile

### API Endpoints
All existing endpoints continue to work:
- `/api/profile`: Legacy profile endpoint
- `/api/activities`: Activity management
- `/api/clubs`: Club management
- `/api/saved-activities`: Saved activities

## 🚦 Route Configuration

### Authentication Routes
```typescript
// Available routes:
/signup              -> User registration
/login-enhanced      -> Enhanced login page
/profile-enhanced    -> Personal profile page
/profile/edit        -> Profile editing
```

### Redirects & Navigation
```typescript
// After registration: /login (with success message)
// After login: /explore (main app)
// Profile access: /profile-enhanced
// Edit profile: /profile/edit-comprehensive
```

## 📝 Usage Examples

### Checking User Authentication
```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, profile, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <SignInPrompt />;
  
  return <UserProfile profile={profile} />;
}
```

### Updating User Profile
```typescript
import { apiService } from '@/services/apiService';

const updateProfile = async (updates) => {
  const { data, error } = await apiService.updateUserProfile(
    user.id, 
    updates
  );
  
  if (data?.success) {
    // Profile updated successfully
    toast.success('Profile updated!');
  }
};
```

### Accessing User Data
```typescript
// Get user's activities
const { data: activities } = await apiService.getUserActivities(user.id);

// Get saved activities  
const { data: saved } = await apiService.getSavedActivities();

// Get user's clubs
const { data: clubs } = await apiService.getUserClubs();
```

## 🎉 Benefits

### For Users
- **Persistent Accounts**: Data never lost on reload
- **Personal Profiles**: Own data and activity history
- **Seamless Experience**: Automatic login persistence
- **Data Ownership**: Complete control over profile

### For Developers
- **Robust Authentication**: Complete user management
- **Scalable Architecture**: Backend-first approach
- **Fallback Support**: Works in all environments
- **Security Built-in**: RLS and validation included

## 🔧 Configuration

### Environment Variables
```bash
# Required for production:
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Database Setup
```bash
# Run the following SQL files in order:
1. database/complete_setup.sql
2. database/profile_creation_trigger.sql
```

This system ensures that every user who creates an account has their details properly saved in the backend database and can access their personalized profile with their own data after logging in.
