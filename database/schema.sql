-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  university TEXT,
  bio TEXT,
  profile_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clubs table
CREATE TABLE IF NOT EXISTS clubs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('cycling', 'climbing', 'running', 'hiking', 'skiing', 'surfing', 'tennis', 'general')),
  location TEXT NOT NULL,
  profile_image TEXT,
  website TEXT,
  contact_email TEXT,
  member_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Club memberships table
CREATE TABLE IF NOT EXISTS club_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id TEXT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'manager')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  message TEXT,
  UNIQUE(club_id, user_id)
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cycling', 'climbing', 'running', 'hiking', 'skiing', 'surfing', 'tennis')),
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT NOT NULL,
  meetup_location TEXT NOT NULL,
  max_participants INTEGER,
  special_comments TEXT,
  difficulty TEXT,
  club_id TEXT REFERENCES clubs(id),
  organizer_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity participants table
CREATE TABLE IF NOT EXISTS activity_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

-- Chat messages table (for future real-time chat)
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id TEXT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_club_memberships_club_id ON club_memberships(club_id);
CREATE INDEX IF NOT EXISTS idx_club_memberships_user_id ON club_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_club_id ON activities(club_id);
CREATE INDEX IF NOT EXISTS idx_activities_organizer_id ON activities(organizer_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);
CREATE INDEX IF NOT EXISTS idx_activity_participants_activity_id ON activity_participants(activity_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_club_id ON chat_messages(club_id);

-- Functions to automatically update member count
CREATE OR REPLACE FUNCTION update_club_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clubs 
  SET member_count = (
    SELECT COUNT(*) 
    FROM club_memberships 
    WHERE club_id = COALESCE(NEW.club_id, OLD.club_id) 
    AND status = 'approved'
  )
  WHERE id = COALESCE(NEW.club_id, OLD.club_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for member count updates
DROP TRIGGER IF EXISTS trigger_update_member_count_insert ON club_memberships;
CREATE TRIGGER trigger_update_member_count_insert
  AFTER INSERT ON club_memberships
  FOR EACH ROW EXECUTE FUNCTION update_club_member_count();

DROP TRIGGER IF EXISTS trigger_update_member_count_update ON club_memberships;
CREATE TRIGGER trigger_update_member_count_update
  AFTER UPDATE ON club_memberships
  FOR EACH ROW EXECUTE FUNCTION update_club_member_count();

DROP TRIGGER IF EXISTS trigger_update_member_count_delete ON club_memberships;
CREATE TRIGGER trigger_update_member_count_delete
  AFTER DELETE ON club_memberships
  FOR EACH ROW EXECUTE FUNCTION update_club_member_count();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clubs_updated_at ON clubs;
CREATE TRIGGER update_clubs_updated_at
  BEFORE UPDATE ON clubs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_activities_updated_at ON activities;
CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
