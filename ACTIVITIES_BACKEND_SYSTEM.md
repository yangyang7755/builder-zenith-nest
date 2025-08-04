# Activities Backend System

A comprehensive backend system for managing activities with full CRUD operations, participation tracking, and robust frontend integration.

## 🏗️ Architecture Overview

The Activities Backend System consists of:

- **Database Schema**: PostgreSQL tables with RLS policies
- **Server Routes**: RESTful API endpoints
- **Frontend Integration**: React context with API service layer
- **Demo Mode Support**: Fallback data for development

## 📊 Database Schema

### Activities Table
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  activity_type VARCHAR(50) NOT NULL, -- 'cycling', 'climbing', 'running', etc.
  organizer_id UUID REFERENCES profiles(id),
  club_id UUID REFERENCES clubs(id) NULL,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255) NOT NULL,
  coordinates JSONB, -- Store lat/lng as JSON
  max_participants INTEGER DEFAULT 10,
  current_participants INTEGER DEFAULT 0,
  difficulty_level VARCHAR(20) DEFAULT 'beginner',
  activity_image TEXT,
  route_link TEXT,
  special_requirements TEXT,
  price_per_person DECIMAL(10,2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'upcoming',
  activity_data JSONB DEFAULT '{}', -- Flexible storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Activity Participants Table
```sql
CREATE TABLE activity_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities(id),
  user_id UUID REFERENCES profiles(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'joined',
  UNIQUE(activity_id, user_id)
);
```

### Key Features
- **Row Level Security (RLS)** policies for data protection
- **Automatic participant counting** via database triggers
- **Flexible activity data** storage with JSONB fields
- **Comprehensive indexing** for performance optimization

## 🔌 API Endpoints

### Core Activities API

#### `GET /api/activities`
List activities with filtering and pagination.

**Query Parameters:**
- `club_id` - Filter by club
- `activity_type` - Filter by activity type
- `location` - Search by location
- `difficulty_level` - Filter by difficulty
- `date_from` / `date_to` - Date range filtering
- `status` - Filter by status (upcoming, completed, etc.)
- `limit` / `offset` - Pagination

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Morning Richmond Park Cycle",
      "description": "Join us for a scenic morning ride...",
      "activity_type": "cycling",
      "date_time": "2024-08-15T09:00:00Z",
      "location": "Richmond Park, London",
      "coordinates": { "lat": 51.4513, "lng": -0.2719 },
      "max_participants": 15,
      "current_participants": 8,
      "difficulty_level": "intermediate",
      "organizer": {
        "id": "uuid",
        "full_name": "Sarah Johnson",
        "profile_image": "url"
      }
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 20,
    "offset": 0
  }
}
```

#### `POST /api/activities`
Create a new activity.

**Request Body:**
```json
{
  "title": "Evening Tennis Session",
  "description": "Friendly tennis for all skill levels",
  "activity_type": "tennis",
  "date_time": "2024-08-20T18:00:00Z",
  "location": "Local Tennis Club",
  "coordinates": { "lat": 51.5074, "lng": -0.1278 },
  "max_participants": 8,
  "difficulty_level": "beginner",
  "price_per_person": 15.00,
  "club_id": "optional-club-uuid"
}
```

#### `GET /api/activities/:id`
Get detailed activity information including participants.

#### `PUT /api/activities/:id`
Update activity (organizers and club managers only).

#### `DELETE /api/activities/:id`
Cancel activity (marks as cancelled, preserves history).

### Activity Participation API

#### `POST /api/activities/:id/join`
Join an activity.

**Response:**
```json
{
  "success": true,
  "message": "Successfully joined activity"
}
```

#### `DELETE /api/activities/:id/leave`
Leave an activity.

#### `GET /api/activities/:id/participants`
Get list of activity participants.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "participation-uuid",
      "user_id": "user-uuid",
      "joined_at": "2024-08-10T14:30:00Z",
      "status": "joined",
      "user": {
        "id": "user-uuid",
        "full_name": "Mike Chen",
        "profile_image": "url"
      }
    }
  ]
}
```

## ⚛️ Frontend Integration

### Activities Context

The `ActivitiesContext` provides comprehensive activity management:

```typescript
import { useActivities } from '@/contexts/ActivitiesContext';

function MyComponent() {
  const {
    activities,
    loading,
    error,
    pagination,
    
    // Core operations
    getActivities,
    getActivity,
    createActivity,
    updateActivity,
    deleteActivity,
    
    // Participation
    joinActivity,
    leaveActivity,
    getActivityParticipants,
    
    // Utilities
    searchActivities,
    refreshActivities
  } = useActivities();
  
  // Load activities with filters
  useEffect(() => {
    getActivities({
      activity_type: 'cycling',
      difficulty_level: 'beginner',
      limit: 10
    });
  }, []);
  
  return (
    <div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        activities.map(activity => (
          <ActivityCard 
            key={activity.id} 
            activity={activity}
            onJoin={() => joinActivity(activity.id)}
          />
        ))
      )}
    </div>
  );
}
```

### API Service Layer

Direct API access through `apiService`:

```typescript
import { apiService } from '@/services/apiService';

// Get activities with filters
const response = await apiService.getActivities({
  club_id: 'club-uuid',
  activity_type: 'running',
  date_from: '2024-08-15T00:00:00Z'
});

// Create new activity
const newActivity = await apiService.createActivity({
  title: 'Weekend Hike',
  activity_type: 'hiking',
  date_time: '2024-08-25T10:00:00Z',
  location: 'Hampstead Heath',
  max_participants: 12
});

// Join activity
await apiService.joinActivity('activity-uuid');
```

## 🔧 Key Features

### 1. **Comprehensive Filtering**
- Filter by club, activity type, difficulty, location
- Date range filtering for planning
- Status-based filtering (upcoming, completed, cancelled)

### 2. **Robust Participation Management**
- Join/leave activities with validation
- Participant limit enforcement
- Historical participation tracking

### 3. **Permission System**
- Only organizers can update/delete their activities
- Club managers can manage club activities
- Public activities visible to all users

### 4. **Demo Mode Support**
- Automatic fallback to demo data when database unavailable
- Seamless development experience
- Production-ready with proper database connection

### 5. **Real-time Updates**
- Automatic participant count updates
- Optimistic UI updates with error handling
- Consistent state management

## 🛡️ Security Features

### Row Level Security (RLS)
- **Activities**: Public read, owner/club manager write
- **Participants**: Public read, user-specific write
- Automatic user verification via JWT tokens

### Data Validation
- **Zod schemas** for request validation
- **Type safety** throughout the stack
- **SQL injection protection** via parameterized queries

### Authentication
- JWT token-based authentication
- Automatic demo mode for development
- Proper error handling for unauthorized access

## 🚀 Usage Examples

### Creating an Activity
```typescript
const result = await createActivity({
  title: "Sunday Morning Cycle",
  description: "Join us for a leisurely ride through the park",
  activity_type: "cycling",
  date_time: "2024-08-18T09:00:00Z",
  location: "Hyde Park",
  coordinates: { lat: 51.5074, lng: -0.1278 },
  max_participants: 15,
  difficulty_level: "beginner",
  price_per_person: 0
});

if (result.success) {
  console.log("Activity created:", result.data);
} else {
  console.error("Error:", result.error);
}
```

### Joining an Activity
```typescript
const joinResult = await joinActivity("activity-uuid");

if (joinResult.success) {
  toast.success("Successfully joined activity!");
} else {
  toast.error(joinResult.error);
}
```

### Searching Activities
```typescript
// Search by location and filter by type
await searchActivities("London", {
  activity_type: "cycling",
  difficulty_level: "intermediate"
});
```

## 📈 Performance Considerations

### Database Optimization
- **Indexed fields**: organizer_id, club_id, date_time, activity_type, status
- **Efficient queries**: JOINs with proper projections
- **Pagination**: Limit result sets to prevent memory issues

### Frontend Optimization
- **Request deduplication**: Prevents duplicate API calls
- **Optimistic updates**: Immediate UI feedback
- **Error recovery**: Automatic retry with exponential backoff

### Caching Strategy
- **Local state management**: Activities cached in React context
- **Conditional loading**: Skip unnecessary API calls
- **Background refresh**: Update data without blocking UI

## 🔄 Migration and Setup

### 1. Database Setup
```bash
# Run the activities schema
psql -d your_database -f database/activities_schema.sql
```

### 2. Environment Variables
```env
# Required for production
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Development works without these (demo mode)
```

### 3. Frontend Integration
```typescript
// Wrap your app with ActivitiesProvider
import { ActivitiesProvider } from '@/contexts/ActivitiesContext';

function App() {
  return (
    <ActivitiesProvider>
      {/* Your app components */}
    </ActivitiesProvider>
  );
}
```

## 🎯 Next Steps

### Potential Enhancements
1. **Real-time Updates**: WebSocket integration for live activity updates
2. **Advanced Search**: Full-text search with Elasticsearch integration
3. **Notifications**: Email/push notifications for activity updates
4. **Recurring Activities**: Template system for repeated activities
5. **Activity Feed**: Social timeline of activity participation
6. **Rating System**: Post-activity reviews and ratings
7. **Weather Integration**: Real-time weather data for outdoor activities
8. **Calendar Integration**: Export to Google Calendar, iCal

### Performance Optimizations
1. **GraphQL Integration**: More efficient data fetching
2. **Redis Caching**: Cache frequently accessed data
3. **Image CDN**: Optimize activity image delivery
4. **Background Jobs**: Process heavy operations asynchronously

## 📋 Testing

The system includes comprehensive error handling and fallback mechanisms:

- **Demo Mode**: Automatic fallback when database unavailable
- **Error Boundaries**: Graceful error handling in React components  
- **Retry Logic**: Automatic retry for transient failures
- **Validation**: Client and server-side data validation

## 🎉 Conclusion

The Activities Backend System provides a robust, scalable foundation for activity management with:

✅ **Complete CRUD Operations** for activities  
✅ **Participation Management** with join/leave functionality  
✅ **Advanced Filtering & Search** capabilities  
✅ **Security & Permission** controls  
✅ **Demo Mode Support** for development  
✅ **Production Ready** with proper error handling  

The system is now ready for production use and can easily be extended with additional features as needed.
