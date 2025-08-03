-- Simple Activity App Database Setup Script
-- Run this in your Supabase SQL Editor

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
  type TEXT NOT NULL,
  location TEXT NOT NULL,
  profile_image TEXT,
  website TEXT,
  contact_email TEXT,
  member_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

-- Basic policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Activities are viewable by everyone" ON activities FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert activities" ON activities FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Activity participants are viewable by everyone" ON activity_participants FOR SELECT USING (true);
CREATE POLICY "Users can join activities" ON activity_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clubs are viewable by everyone" ON clubs FOR SELECT USING (true);

-- Insert initial clubs
INSERT INTO clubs (id, name, description, type, location, profile_image, created_at) VALUES
  ('westway', 'Westway Climbing Centre', 'Premier climbing facility in West London', 'climbing', 'London, UK', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', NOW()),
  ('oucc', 'Oxford University Cycling Club', 'Official cycling club for Oxford University', 'cycling', 'Oxford, UK', 'https://images.unsplash.com/photo-1517654443271-10d70151c4f1?w=300&h=300&fit=crop', NOW()),
  ('richmond-runners', 'Richmond Runners', 'Social running group in Richmond Park', 'running', 'Richmond, UK', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop', NOW())
ON CONFLICT (id) DO NOTHING;
