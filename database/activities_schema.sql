-- Activities System Database Schema
-- Run this after the basic profiles and clubs setup

-- Activities table
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  CONSTRAINT valid_difficulty CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'all')),
  CONSTRAINT future_date_time CHECK (date_time > created_at)
);

-- Activity participants table
CREATE TABLE IF NOT EXISTS activity_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'joined', -- 'joined', 'left', 'completed', 'cancelled'
  
  -- Unique constraint to prevent duplicate participation
  UNIQUE(activity_id, user_id),
  
  CONSTRAINT valid_participant_status CHECK (status IN ('joined', 'left', 'completed', 'cancelled'))
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

-- RLS (Row Level Security) policies
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_participants ENABLE ROW LEVEL SECURITY;

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

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_activities_updated_at();
