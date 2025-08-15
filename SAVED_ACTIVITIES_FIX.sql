-- Saved Activities Database Schema Fix
-- Run this in your Supabase SQL Editor to fix the save activity functionality

-- Create saved_activities table
CREATE TABLE IF NOT EXISTS saved_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicate saves
  UNIQUE(user_id, activity_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_activities_user ON saved_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_activities_activity ON saved_activities(activity_id);
CREATE INDEX IF NOT EXISTS idx_saved_activities_saved_at ON saved_activities(saved_at);

-- RLS (Row Level Security) policies
ALTER TABLE saved_activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own saved activities" ON saved_activities;
DROP POLICY IF EXISTS "Users can save activities" ON saved_activities;
DROP POLICY IF EXISTS "Users can unsave activities" ON saved_activities;

-- Saved activities policies
CREATE POLICY "Users can view their own saved activities" ON saved_activities FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save activities" ON saved_activities FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave activities" ON saved_activities FOR DELETE 
USING (auth.uid() = user_id);
