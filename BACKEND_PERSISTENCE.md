# Backend Persistence Implementation

This document outlines the backend implementation for persistent saved activities and activity participation.

## Database Schema

### Existing Tables (already implemented)

- `activities` - Core activities table with all activity data
- `activity_participants` - User participation in activities with join/leave tracking
- `profiles` - User profiles extending auth.users

### New Tables Added

- `saved_activities` - User bookmarks/saved activities

## Backend API Endpoints

### Saved Activities

- `GET /api/saved-activities` - Get user's saved activities with full activity details
- `POST /api/saved-activities` - Save an activity (body: `{ activity_id: string }`)
- `DELETE /api/saved-activities/:activityId` - Unsave an activity
- `GET /api/saved-activities/check/:activityId` - Check if activity is saved

### Activity Participation (existing)

- `POST /api/activities/:id/join` - Join an activity
- `DELETE /api/activities/:id/leave` - Leave an activity
- `GET /api/activities/:id/participants` - Get activity participants

## Frontend Context Updates

### SavedActivitiesContext

- Now uses backend API for persistence
- Implements optimistic updates for better UX
- Handles backend unavailable gracefully with fallback to local mode
- Added loading states and refresh functionality

### ActivityParticipationContext

- Updated join/leave methods to call backend APIs
- Maintains local state synchronization
- Preserves demo mode functionality when backend unavailable
- Triggers appropriate events for chat integration

### ApiService

- Added saved activities methods:
  - `getSavedActivities()`
  - `saveActivity(activityId)`
  - `unsaveActivity(activityId)`
  - `checkActivitySaved(activityId)`

## Database Migration

The `saved_activities` table has been added to:

- `database/saved_activities_schema.sql` - Standalone schema file
- `database/complete_setup.sql` - Integrated into complete setup

To apply the migration, run the SQL in your Supabase SQL Editor:

```sql
-- Run the saved_activities_schema.sql file
-- Or re-run complete_setup.sql for new installations
```

## Features Implemented

### Data Persistence

- ✅ Saved activities persist across app reloads
- ✅ Activity participation persists across app reloads
- ✅ Real-time UI updates with optimistic updating
- ✅ Graceful fallback to demo mode when backend unavailable

### API Integration

- ✅ Full CRUD operations for saved activities
- ✅ Join/leave activity API integration
- ✅ Proper error handling and user feedback
- ✅ Authentication-aware API calls

### User Experience

- ✅ Immediate UI feedback with optimistic updates
- ✅ Loading states for async operations
- ✅ Error handling with user notifications
- ✅ Seamless transition between online/offline modes

## Usage Examples

### Saving an Activity

```typescript
const { saveActivity } = useSavedActivities();
const success = await saveActivity(activity);
```

### Joining an Activity

```typescript
const { joinActivity } = useActivityParticipation();
const success = await joinActivity(activityId, activityTitle, organizerId);
```

### Checking Saved Status

```typescript
const { isActivitySaved } = useSavedActivities();
const isSaved = isActivitySaved(activityId);
```

## Security

All endpoints implement Row Level Security (RLS):

- Users can only see/modify their own saved activities
- Users can only see/modify their own participation records
- Proper authentication checks for all operations

## Error Handling

The implementation includes comprehensive error handling:

- Network failures gracefully handled
- Backend unavailable scenarios managed
- User-friendly error messages
- Automatic retry mechanisms where appropriate
