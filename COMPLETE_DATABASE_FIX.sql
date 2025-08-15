-- Complete Database Schema Fix
-- Run this in your Supabase SQL Editor to fix all database issues

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  university VARCHAR(255),
  institution VARCHAR(255),
  bio TEXT,
  profile_image TEXT,
  phone VARCHAR(20),
  gender VARCHAR(20),
  age INTEGER,
  date_of_birth DATE,
  nationality VARCHAR(100),
  occupation VARCHAR(255),
  location VARCHAR(255),
  visibility_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clubs table if it doesn't exist
CREATE TABLE IF NOT EXISTS clubs (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  location VARCHAR(255),
  profile_image TEXT,
  cover_image TEXT,
  website TEXT,
  contact_email VARCHAR(255),
  is_private BOOLEAN DEFAULT false,
  member_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table with complete schema
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  activity_type VARCHAR(50) NOT NULL, -- 'cycling', 'climbing', 'running', 'hiking', 'skiing', 'surfing', 'tennis', 'general'
  organizer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  club_id VARCHAR(50) REFERENCES clubs(id) ON DELETE SET NULL, -- Optional club association
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255) NOT NULL,
  coordinates JSONB, -- Store lat/lng as JSON: {"lat": 51.5074, "lng": -0.1278}
  max_participants INTEGER DEFAULT 10,
  current_participants INTEGER DEFAULT 0,
  difficulty_level VARCHAR(20) DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced', 'all'
  activity_image TEXT, -- URL to activity image
  route_link TEXT, -- External route/GPX link
  special_requirements TEXT, -- Equipment, experience, etc.
  price_per_person DECIMAL(10,2) DEFAULT 0.00, -- Cost to join
  status VARCHAR(20) DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'completed', 'cancelled'
  
  -- Activity type specific data stored as JSONB
  activity_data JSONB DEFAULT '{}', -- Flexible storage for type-specific fields
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Add description column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activities' AND column_name = 'description'
  ) THEN
    ALTER TABLE activities ADD COLUMN description TEXT;
  END IF;

  -- Add activity_type column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activities' AND column_name = 'activity_type'
  ) THEN
    ALTER TABLE activities ADD COLUMN activity_type VARCHAR(50) NOT NULL DEFAULT 'general';
  END IF;

  -- Add date_time column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activities' AND column_name = 'date_time'
  ) THEN
    ALTER TABLE activities ADD COLUMN date_time TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  -- Add other missing columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activities' AND column_name = 'difficulty_level'
  ) THEN
    ALTER TABLE activities ADD COLUMN difficulty_level VARCHAR(20) DEFAULT 'beginner';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activities' AND column_name = 'activity_data'
  ) THEN
    ALTER TABLE activities ADD COLUMN activity_data JSONB DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activities' AND column_name = 'status'
  ) THEN
    ALTER TABLE activities ADD COLUMN status VARCHAR(20) DEFAULT 'upcoming';
  END IF;
END $$;

-- Activity participants table
CREATE TABLE IF NOT EXISTS activity_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'joined', -- 'joined', 'left', 'completed', 'cancelled'
  
  -- Unique constraint to prevent duplicate participation
  UNIQUE(activity_id, user_id)
);

-- Saved activities table
CREATE TABLE IF NOT EXISTS saved_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicate saves
  UNIQUE(user_id, activity_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activities_organizer ON activities(organizer_id);
CREATE INDEX IF NOT EXISTS idx_activities_club ON activities(club_id);
CREATE INDEX IF NOT EXISTS idx_activities_date_time ON activities(date_time);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_location ON activities(location);

CREATE INDEX IF NOT EXISTS idx_activity_participants_activity ON activity_participants(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_participants_user ON activity_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_participants_status ON activity_participants(status);

CREATE INDEX IF NOT EXISTS idx_saved_activities_user ON saved_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_activities_activity ON saved_activities(activity_id);
CREATE INDEX IF NOT EXISTS idx_saved_activities_saved_at ON saved_activities(saved_at);

-- RLS (Row Level Security) policies
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Activities are viewable by everyone" ON activities;
DROP POLICY IF EXISTS "Users can create activities" ON activities;
DROP POLICY IF EXISTS "Organizers can update their activities" ON activities;
DROP POLICY IF EXISTS "Organizers can delete their activities" ON activities;

DROP POLICY IF EXISTS "Activity participants are viewable by everyone" ON activity_participants;
DROP POLICY IF EXISTS "Users can join activities" ON activity_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON activity_participants;
DROP POLICY IF EXISTS "Users can leave activities" ON activity_participants;

DROP POLICY IF EXISTS "Users can view their own saved activities" ON saved_activities;
DROP POLICY IF EXISTS "Users can save activities" ON saved_activities;
DROP POLICY IF EXISTS "Users can unsave activities" ON saved_activities;

-- Activities policies
CREATE POLICY "Activities are viewable by everyone" ON activities FOR SELECT USING (true);

CREATE POLICY "Users can create activities" ON activities FOR INSERT 
WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their activities" ON activities FOR UPDATE 
USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their activities" ON activities FOR DELETE 
USING (auth.uid() = organizer_id);

-- Activity participants policies
CREATE POLICY "Activity participants are viewable by everyone" ON activity_participants FOR SELECT USING (true);

CREATE POLICY "Users can join activities" ON activity_participants FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" ON activity_participants FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can leave activities" ON activity_participants FOR DELETE 
USING (auth.uid() = user_id);

-- Saved activities policies
CREATE POLICY "Users can view their own saved activities" ON saved_activities FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save activities" ON saved_activities FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave activities" ON saved_activities FOR DELETE 
USING (auth.uid() = user_id);

-- Function to update participant count
CREATE OR REPLACE FUNCTION update_activity_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'joined' THEN
    UPDATE activities 
    SET current_participants = current_participants + 1 
    WHERE id = NEW.activity_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'joined' AND NEW.status != 'joined' THEN
      UPDATE activities 
      SET current_participants = current_participants - 1 
      WHERE id = NEW.activity_id;
    ELSIF OLD.status != 'joined' AND NEW.status = 'joined' THEN
      UPDATE activities 
      SET current_participants = current_participants + 1 
      WHERE id = NEW.activity_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'joined' THEN
    UPDATE activities 
    SET current_participants = current_participants - 1 
    WHERE id = OLD.activity_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_participant_count ON activity_participants;

-- Trigger to automatically update participant count
CREATE TRIGGER trigger_update_participant_count
  AFTER INSERT OR UPDATE OR DELETE ON activity_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_activity_participant_count();

-- Function to update activities updated_at timestamp
CREATE OR REPLACE FUNCTION update_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_activities_updated_at ON activities;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_activities_updated_at();
