# Backend Database Options for Your Activity App

## Recommended Database Solutions

### 1. **Supabase** (Recommended for your use case)

- **Why**: Built-in auth, real-time subscriptions, easy React integration
- **Setup**: Available as MCP integration in Builder.io
- **Perfect for**: User management, activities, club memberships, real-time chat

```bash
# Install Supabase client
npm install @supabase/supabase-js

# Environment variables needed:
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

### 2. **Neon (Serverless Postgres)**

- **Why**: Serverless PostgreSQL with excellent free tier
- **Setup**: Available as MCP integration in Builder.io
- **Perfect for**: Traditional relational data with modern scaling

### 3. **PlanetScale (MySQL)**

- **Why**: Serverless MySQL with branching (like Git for databases)
- **Setup**: Via Prisma ORM integration

## Database Schema for Your App

### Core Tables Needed:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  profile_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Clubs table
CREATE TABLE clubs (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  location VARCHAR(255),
  profile_image VARCHAR(500),
  cover_image VARCHAR(500),
  website VARCHAR(500),
  contact_email VARCHAR(255),
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Club memberships
CREATE TABLE club_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  club_id VARCHAR(50) REFERENCES clubs(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- 'member' | 'manager'
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, club_id)
);

-- Activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  meetup_location VARCHAR(255),
  organizer_id UUID REFERENCES users(id),
  club_id VARCHAR(50) REFERENCES clubs(id),
  max_participants INTEGER,
  special_comments TEXT,
  difficulty VARCHAR(50),
  activity_data JSONB, -- For sport-specific data
  created_at TIMESTAMP DEFAULT NOW()
);

-- Club join requests
CREATE TABLE club_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  club_id VARCHAR(50) REFERENCES clubs(id) ON DELETE CASCADE,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  processed_by UUID REFERENCES users(id)
);
```

## Environment Variables Setup

Create a `.env` file:

```bash
# Database
DATABASE_URL="postgresql://username:password@hostname:port/database"

# Authentication (if using Supabase)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# App configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"

# Optional: Email service for notifications
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

## Integration Steps

1. **Connect MCP Integration**

   - Click [MCP Servers button](#open-mcp-popover) in Builder.io
   - Connect Supabase or Neon integration

2. **Update Frontend to Use Backend**

   - Replace localStorage with API calls
   - Add authentication layer
   - Implement real-time updates

3. **Deploy Backend**
   - Fly.io: `fly deploy`
   - Railway: Connect GitHub repo
   - Vercel: Deploy as serverless functions

## Authentication Options

### Option A: Supabase Auth (Recommended)

```javascript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY,
);

// Simple login
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password",
});
```

### Option B: Custom JWT Auth

```javascript
// Backend route for login
app.post("/api/auth/login", async (req, res) => {
  // Validate credentials
  // Generate JWT token
  // Return user data + token
});
```

## Next Steps

1. Choose your database provider
2. Set up authentication
3. Migrate your context data to API calls
4. Add real-time features for chat/notifications
5. Deploy to production

Would you like me to help you set up any of these options?
