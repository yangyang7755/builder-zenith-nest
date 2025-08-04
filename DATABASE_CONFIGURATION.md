# Database Configuration & Management

## 🎯 Overview

This application uses **Supabase** as its primary database and backend service, providing:
- PostgreSQL database with Row Level Security (RLS)
- Built-in authentication and user management
- Real-time subscriptions for chat features
- File storage for images and media
- Auto-generated APIs with type safety

## 🔧 Configuration Management System

### New Components Added:

1. **DatabaseManager** (`server/lib/database.ts`)
   - Singleton pattern for database connection management
   - Automatic connection testing and validation
   - Health checks and status monitoring
   - Table existence verification

2. **Health Check API** (`server/routes/health.ts`)
   - `GET /api/health` - Basic server health
   - `GET /api/health/database` - Detailed database status
   - `POST /api/health/database/test` - Test connection
   - `POST /api/health/database/init` - Initialize database

3. **Database Config UI** (`client/components/DatabaseConfig.tsx`)
   - Real-time connection status monitoring
   - Environment variable validation
   - Connection testing and initialization
   - Visual status indicators and error reporting

4. **Environment Setup Tool** (`client/components/EnvSetup.tsx`)
   - Guided environment variable configuration
   - Step-by-step Supabase setup instructions
   - Validation and testing tools
   - Secure handling of sensitive keys

5. **Database Management Page** (`client/pages/DatabaseManagement.tsx`)
   - Complete database administration interface
   - Schema overview and documentation
   - Security configuration monitoring
   - Documentation and setup guides

## 🚀 Quick Setup Process

### 1. Environment Variables Required:

```env
# Required for server-side operations
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Required for client-side operations  
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Database Schema Setup:

Run these SQL files in your Supabase SQL Editor:
1. `database/schema.sql` - Core tables and functions
2. `database/rls_policies.sql` - Security policies
3. `database/add_chat_system.sql` - Chat functionality
4. `database/add_storage.sql` - File storage buckets
5. `database/add_activity_images.sql` - Image gallery
6. `database/seed.sql` - Demo data (optional)

### 3. Automatic Validation:

The system now automatically:
- ✅ Validates environment variables on startup
- ✅ Tests database connectivity
- ✅ Verifies required tables exist
- ✅ Monitors connection health
- ✅ Provides detailed error messages

## 🔍 Monitoring & Debugging

### Connection Status Monitoring:
- **CONNECTED**: Database is accessible and tables exist
- **DISCONNECTED**: Connection configured but failing
- **NOT_CONFIGURED**: Missing environment variables

### Health Check Endpoints:
```bash
# Basic health check
curl http://localhost:3001/api/health

# Detailed database status
curl http://localhost:3001/api/health/database

# Test database connection
curl -X POST http://localhost:3001/api/health/database/test
```

### Frontend Monitoring:
- Visit `/database-management` for full admin interface
- Real-time status updates and alerts
- Visual configuration validation
- Guided setup instructions

## 🛠 Troubleshooting

### Common Issues:

1. **"Missing environment variables"**
   - Use the EnvSetup component to configure variables
   - Ensure both server and client variables are set
   - Restart the dev server after setting variables

2. **"Database connection failed"**
   - Verify Supabase project is active
   - Check API keys are correct and not expired
   - Ensure RLS policies allow access

3. **"Tables not found"**
   - Run database setup scripts in correct order
   - Check SQL editor for error messages
   - Verify user permissions in Supabase

4. **"Authentication errors"**
   - Confirm service role key is set correctly
   - Check JWT token validation
   - Verify RLS policies are not blocking access

### Debugging Tools:

- **Database Status Dashboard**: Real-time monitoring
- **Connection Tester**: Manual connection validation
- **Environment Validator**: Configuration verification
- **Health Check API**: Programmatic status checks

## 🔒 Security Features

### Row Level Security (RLS):
- Users can only access their own profiles
- Club managers can manage their clubs
- Activity organizers control their events
- File uploads are permission-based

### Authentication:
- JWT-based authentication with Supabase
- Automatic token refresh and session management
- Role-based permissions (member/manager)
- Secure API endpoint protection

### File Storage:
- Size limits (10MB) and type validation
- User-specific folder structure
- Automatic image compression
- Access control policies

## 📊 Database Schema Overview

### Core Tables:
- **profiles**: User information extending Supabase auth
- **clubs**: Sports clubs and organizations
- **activities**: Events and activities
- **club_memberships**: User roles in clubs
- **activity_participants**: Event participation

### Chat System:
- **chat_messages**: Club group chat
- **direct_messages**: Private messaging

### File Storage:
- **activity_images**: Multiple images per activity
- **Storage buckets**: profile-images, club-images, activity-images

### Additional Features:
- **reviews**: User reviews and ratings
- **followers**: Social following system

## 🚀 Production Deployment

### Environment Configuration:
```bash
# Production environment variables
NODE_ENV=production
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_prod_service_key
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_prod_anon_key
```

### Deployment Checklist:
- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Database scripts executed
- [ ] RLS policies enabled
- [ ] Storage buckets created
- [ ] Health checks passing
- [ ] SSL/TLS configured
- [ ] CORS settings updated

## 📈 Monitoring & Maintenance

### Health Monitoring:
- Database connection status
- Query performance metrics
- Storage usage tracking
- Error rate monitoring

### Maintenance Tasks:
- Regular database backups
- Index optimization
- RLS policy reviews
- Performance monitoring
- Security audits

---

The database configuration system is now fully automated and provides comprehensive monitoring, validation, and management tools for maintaining a robust and secure database connection.
