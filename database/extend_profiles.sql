-- Extend profiles table to support comprehensive profile data
-- This migration adds all the fields needed for the comprehensive profile editing

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS institution TEXT,
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS visibility_settings JSONB DEFAULT '{}';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_nationality ON profiles(nationality);
CREATE INDEX IF NOT EXISTS idx_profiles_institution ON profiles(institution);

-- Create sports profiles table
CREATE TABLE IF NOT EXISTS profile_sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  experience TEXT,
  max_grade TEXT,
  certifications TEXT[] DEFAULT ARRAY[]::TEXT[],
  specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferences TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, sport)
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS profile_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE,
  category TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for sports and achievements
CREATE INDEX IF NOT EXISTS idx_profile_sports_profile_id ON profile_sports(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_sports_sport ON profile_sports(sport);
CREATE INDEX IF NOT EXISTS idx_profile_achievements_profile_id ON profile_achievements(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_achievements_category ON profile_achievements(category);

-- Update the updated_at trigger for profiles table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add triggers for sports and achievements tables
DROP TRIGGER IF EXISTS update_profile_sports_updated_at ON profile_sports;
CREATE TRIGGER update_profile_sports_updated_at
  BEFORE UPDATE ON profile_sports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profile_achievements_updated_at ON profile_achievements;
CREATE TRIGGER update_profile_achievements_updated_at
  BEFORE UPDATE ON profile_achievements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Rename university to institution for consistency (university is still supported)
-- Note: We're adding institution as a new column, keeping university for backward compatibility
