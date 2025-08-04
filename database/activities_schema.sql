-- Activities System Database Schema
-- Run this after the basic profiles and clubs setup

-- First, handle migration from old schema if it exists
DO $$
BEGIN
  -- Check if activities table exists with old schema (separate date/time columns)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activities' AND column_name = 'date'
  ) THEN
    -- Add new date_time column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'activities' AND column_name = 'date_time'
    ) THEN
      ALTER TABLE activities ADD COLUMN date_time TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Migrate data from separate date/time columns to date_time
    UPDATE activities 
    SET date_time = (date + time)::TIMESTAMP WITH TIME ZONE
    WHERE date_time IS NULL;
    
    -- Make date_time NOT NULL
    ALTER TABLE activities ALTER COLUMN date_time SET NOT NULL;
    
    -- Drop old columns
    ALTER TABLE activities DROP COLUMN IF EXISTS date;
    ALTER TABLE activities DROP COLUMN IF EXISTS time;
    
    -- Update other columns to match new schema
    ALTER TABLE activities DROP COLUMN IF EXISTS type;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'activities' AND column_name = 'activity_type'
    ) THEN
      ALTER TABLE activities ADD COLUMN activity_type VARCHAR(50) NOT NULL DEFAULT 'general';
    END IF;
    
    -- Add missing columns if they don't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'activities' AND column_name = 'coordinates'
    ) THEN
      ALTER TABLE activities ADD COLUMN coordinates JSONB;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'activities' AND column_name = 'current_participants'
    ) THEN
      ALTER TABLE activities ADD COLUMN current_participants INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'activities' AND column_name = 'difficulty_level'
    ) THEN
      ALTER TABLE activities ADD COLUMN difficulty_level VARCHAR(20) DEFAULT 'beginner';
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'activities' AND column_name = 'activity_image'
    ) THEN
      ALTER TABLE activities ADD COLUMN activity_image TEXT;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'activities' AND column_name = 'route_link'
    ) THEN
      ALTER TABLE activities ADD COLUMN route_link TEXT;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'activities' AND column_name = 'special_requirements'
    ) THEN
      ALTER TABLE activities ADD COLUMN special_requirements TEXT;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'activities' AND column_name = 'price_per_person'
    ) THEN
      ALTER TABLE activities ADD COLUMN price_per_person DECIMAL(10,2) DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'activities' AND column_name = 'status'
    ) THEN
      ALTER TABLE activities ADD COLUMN status VARCHAR(20) DEFAULT 'upcoming';
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'activities' AND column_name = 'activity_data'
    ) THEN
      ALTER TABLE activities ADD COLUMN activity_data JSONB DEFAULT '{}';
    END IF;
    
    -- Rename columns if necessary
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'activities' AND column_name = 'meetup_location'
    ) THEN
      -- Copy meetup_location to location if location is empty
      UPDATE activities SET location = meetup_location WHERE location IS NULL OR location = '';
      ALTER TABLE activities DROP COLUMN meetup_location;
    END IF;
    
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'activities' AND column_name = 'special_comments'
    ) THEN
      -- Copy special_comments to special_requirements if special_requirements is empty
      UPDATE activities SET special_requirements = special_comments WHERE special_requirements IS NULL OR special_requirements = '';
      ALTER TABLE activities DROP COLUMN special_comments;
    END IF;
    
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'activities' AND column_name = 'difficulty'
    ) THEN
      -- Copy difficulty to difficulty_level if difficulty_level is default
      UPDATE activities SET difficulty_level = difficulty WHERE difficulty_level = 'beginner' AND difficulty IS NOT NULL;
      ALTER TABLE activities DROP COLUMN difficulty;
    END IF;
  END IF;
END $$;

-- Create activities table if it doesn't exist
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  activity_type VARCHAR(50) NOT NULL, -- 'cycling', 'climbing', 'running', 'hiking', 'skiing', 'surfing', 'tennis', 'general'
  organizer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  club_id UUID REFERENCES clubs(id) ON DELETE SET NULL, -- Optional club association
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

-- Add constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'valid_status'
  ) THEN
    ALTER TABLE activities ADD CONSTRAINT valid_status CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'valid_difficulty'
  ) THEN
    ALTER TABLE activities ADD CONSTRAINT valid_difficulty CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'all'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'future_date_time'
  ) THEN
    ALTER TABLE activities ADD CONSTRAINT future_date_time CHECK (date_time > created_at);
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

-- Add constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'valid_participant_status'
  ) THEN
    ALTER TABLE activity_participants ADD CONSTRAINT valid_participant_status CHECK (status IN ('joined', 'left', 'completed', 'cancelled'));
  END IF;
END $$;

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

-- RLS (Row Level Security) policies
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_participants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Activities are viewable by everyone" ON activities;
DROP POLICY IF EXISTS "Users can create activities" ON activities;
DROP POLICY IF EXISTS "Organizers can update their activities" ON activities;
DROP POLICY IF EXISTS "Organizers can delete their activities" ON activities;
DROP POLICY IF EXISTS "Activity participants are viewable by everyone" ON activity_participants;
DROP POLICY IF EXISTS "Users can join activities" ON activity_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON activity_participants;
DROP POLICY IF EXISTS "Users can leave activities" ON activity_participants;

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
