-- Storage Persistence Setup for User Interactions
-- Ensures all user data (reviews, followers, chat messages) is properly stored and persisted
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER FOLLOWERS STORAGE
-- Create user_followers table for persistent follower relationships
CREATE TABLE IF NOT EXISTS user_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate follows
  UNIQUE(follower_id, following_id),
  
  -- Prevent self-following
  CHECK (follower_id != following_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_followers_follower ON user_followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_followers_following ON user_followers(following_id);
CREATE INDEX IF NOT EXISTS idx_user_followers_created_at ON user_followers(created_at);

-- 2. ACTIVITY REVIEWS STORAGE (Enhanced)
-- Ensure activity_reviews table exists with all necessary fields
CREATE TABLE IF NOT EXISTS activity_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One review per person per activity
  UNIQUE(activity_id, reviewer_id)
);

-- Create indexes for activity reviews
CREATE INDEX IF NOT EXISTS idx_activity_reviews_activity ON activity_reviews(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_reviews_reviewer ON activity_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_activity_reviews_reviewee ON activity_reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_activity_reviews_created_at ON activity_reviews(created_at);

-- 3. CHAT MESSAGES STORAGE
-- Club chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id TEXT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Direct messages table (1-on-1 chat)
CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for chat performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_club_id ON chat_messages(club_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver ON direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON direct_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation ON direct_messages(sender_id, receiver_id);

-- 4. USER ACTIVITY HISTORY STORAGE
-- Enhanced activity participants table to track participation history
ALTER TABLE activity_participants ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'joined';
ALTER TABLE activity_participants ADD COLUMN IF NOT EXISTS left_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE activity_participants ADD COLUMN IF NOT EXISTS completion_status VARCHAR(20) DEFAULT 'pending';

-- Add constraint for status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'valid_participant_status_extended'
  ) THEN
    ALTER TABLE activity_participants ADD CONSTRAINT valid_participant_status_extended 
    CHECK (status IN ('joined', 'left', 'completed', 'cancelled'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'valid_completion_status'
  ) THEN
    ALTER TABLE activity_participants ADD CONSTRAINT valid_completion_status 
    CHECK (completion_status IN ('pending', 'completed', 'no_show'));
  END IF;
END $$;

-- 5. SAVED ACTIVITIES STORAGE
-- Ensure saved_activities table exists for user bookmarks
CREATE TABLE IF NOT EXISTS saved_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate saves
  UNIQUE(user_id, activity_id)
);

-- Create indexes for saved activities
CREATE INDEX IF NOT EXISTS idx_saved_activities_user ON saved_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_activities_activity ON saved_activities(activity_id);
CREATE INDEX IF NOT EXISTS idx_saved_activities_saved_at ON saved_activities(saved_at);

-- 6. USER PREFERENCES STORAGE
-- Store user preferences and settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_settings JSONB DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{}',
  activity_preferences JSONB DEFAULT '{}',
  theme_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One preferences record per user
  UNIQUE(user_id)
);

-- Create index for user preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

-- 7. USER ACTIVITY SESSIONS STORAGE
-- Track user activity sessions for analytics and persistence
CREATE TABLE IF NOT EXISTS user_activity_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  device_info JSONB DEFAULT '{}',
  location_data JSONB DEFAULT '{}'
);

-- Create indexes for activity sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_activity_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start ON user_activity_sessions(session_start);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_activity_sessions(last_activity);

-- 8. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE user_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_sessions ENABLE ROW LEVEL SECURITY;

-- 9. CREATE RLS POLICIES

-- User followers policies
DROP POLICY IF EXISTS "User followers are viewable by everyone" ON user_followers;
CREATE POLICY "User followers are viewable by everyone" ON user_followers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can follow others" ON user_followers;
CREATE POLICY "Users can follow others" ON user_followers
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow others" ON user_followers;
CREATE POLICY "Users can unfollow others" ON user_followers
  FOR DELETE USING (auth.uid() = follower_id);

-- Activity reviews policies
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON activity_reviews;
CREATE POLICY "Reviews are viewable by everyone" ON activity_reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON activity_reviews;
CREATE POLICY "Users can create reviews" ON activity_reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "Users can update their own reviews" ON activity_reviews;
CREATE POLICY "Users can update their own reviews" ON activity_reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "Users can delete their own reviews" ON activity_reviews;
CREATE POLICY "Users can delete their own reviews" ON activity_reviews
  FOR DELETE USING (auth.uid() = reviewer_id);

-- Chat messages policies
DROP POLICY IF EXISTS "Club members can view club messages" ON chat_messages;
CREATE POLICY "Club members can view club messages" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM club_memberships 
      WHERE club_id = chat_messages.club_id 
      AND user_id = auth.uid() 
      AND status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Club members can send messages" ON chat_messages;
CREATE POLICY "Club members can send messages" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM club_memberships 
      WHERE club_id = chat_messages.club_id 
      AND user_id = auth.uid() 
      AND status = 'approved'
    )
  );

-- Direct messages policies
DROP POLICY IF EXISTS "Users can view their direct messages" ON direct_messages;
CREATE POLICY "Users can view their direct messages" ON direct_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send direct messages" ON direct_messages;
CREATE POLICY "Users can send direct messages" ON direct_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update their sent messages" ON direct_messages;
CREATE POLICY "Users can update their sent messages" ON direct_messages
  FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Saved activities policies
DROP POLICY IF EXISTS "Users can view their saved activities" ON saved_activities;
CREATE POLICY "Users can view their saved activities" ON saved_activities
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can save activities" ON saved_activities;
CREATE POLICY "Users can save activities" ON saved_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unsave activities" ON saved_activities;
CREATE POLICY "Users can unsave activities" ON saved_activities
  FOR DELETE USING (auth.uid() = user_id);

-- User preferences policies
DROP POLICY IF EXISTS "Users can view their preferences" ON user_preferences;
CREATE POLICY "Users can view their preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their preferences" ON user_preferences;
CREATE POLICY "Users can update their preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can modify their preferences" ON user_preferences;
CREATE POLICY "Users can modify their preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- User activity sessions policies
DROP POLICY IF EXISTS "Users can view their sessions" ON user_activity_sessions;
CREATE POLICY "Users can view their sessions" ON user_activity_sessions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create sessions" ON user_activity_sessions;
CREATE POLICY "Users can create sessions" ON user_activity_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their sessions" ON user_activity_sessions;
CREATE POLICY "Users can update their sessions" ON user_activity_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- 10. UTILITY FUNCTIONS FOR DATA PERSISTENCE

-- Function to mark direct messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(sender_user_id UUID, receiver_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE direct_messages 
  SET read_at = NOW() 
  WHERE sender_id = sender_user_id 
    AND receiver_id = receiver_user_id 
    AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count(user_id UUID)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM direct_messages 
    WHERE receiver_id = user_id 
      AND read_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user follow stats
CREATE OR REPLACE FUNCTION get_user_follow_stats(user_id UUID)
RETURNS TABLE(followers_count BIGINT, following_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM user_followers WHERE following_id = user_id) as followers_count,
    (SELECT COUNT(*) FROM user_followers WHERE follower_id = user_id) as following_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(user_id UUID)
RETURNS TABLE(
  activities_joined BIGINT, 
  activities_organized BIGINT, 
  reviews_given BIGINT, 
  reviews_received BIGINT,
  average_rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM activity_participants WHERE user_id = get_user_activity_summary.user_id) as activities_joined,
    (SELECT COUNT(*) FROM activities WHERE organizer_id = get_user_activity_summary.user_id) as activities_organized,
    (SELECT COUNT(*) FROM activity_reviews WHERE reviewer_id = get_user_activity_summary.user_id) as reviews_given,
    (SELECT COUNT(*) FROM activity_reviews WHERE reviewee_id = get_user_activity_summary.user_id) as reviews_received,
    (SELECT AVG(rating)::NUMERIC(3,2) FROM activity_reviews WHERE reviewee_id = get_user_activity_summary.user_id) as average_rating;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. TRIGGERS FOR AUTOMATIC UPDATES

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
DROP TRIGGER IF EXISTS trigger_update_activity_reviews_updated_at ON activity_reviews;
CREATE TRIGGER trigger_update_activity_reviews_updated_at
  BEFORE UPDATE ON activity_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER trigger_update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update last_activity in user sessions
CREATE OR REPLACE FUNCTION update_user_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the most recent session for this user
  UPDATE user_activity_sessions 
  SET last_activity = NOW() 
  WHERE user_id = NEW.user_id 
    AND session_end IS NULL
    AND id = (
      SELECT id FROM user_activity_sessions 
      WHERE user_id = NEW.user_id 
        AND session_end IS NULL 
      ORDER BY session_start DESC 
      LIMIT 1
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to track user activity
DROP TRIGGER IF EXISTS trigger_update_last_activity_chat ON chat_messages;
CREATE TRIGGER trigger_update_last_activity_chat
  AFTER INSERT ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION update_user_last_activity();

DROP TRIGGER IF EXISTS trigger_update_last_activity_dm ON direct_messages;
CREATE TRIGGER trigger_update_last_activity_dm
  AFTER INSERT ON direct_messages
  FOR EACH ROW EXECUTE FUNCTION update_user_last_activity();

-- 12. DATA MIGRATION AND CLEANUP PROCEDURES

-- Function to cleanup old sessions (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $$
BEGIN
  -- Mark sessions older than 24 hours without activity as ended
  UPDATE user_activity_sessions 
  SET session_end = last_activity 
  WHERE session_end IS NULL 
    AND last_activity < NOW() - INTERVAL '24 hours';
  
  -- Delete sessions older than 30 days
  DELETE FROM user_activity_sessions 
  WHERE session_start < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Function to ensure data consistency
CREATE OR REPLACE FUNCTION ensure_data_consistency()
RETURNS void AS $$
BEGIN
  -- Remove any orphaned records that shouldn't exist
  DELETE FROM user_followers 
  WHERE follower_id NOT IN (SELECT id FROM profiles) 
     OR following_id NOT IN (SELECT id FROM profiles);
  
  DELETE FROM activity_reviews 
  WHERE reviewer_id NOT IN (SELECT id FROM profiles) 
     OR reviewee_id NOT IN (SELECT id FROM profiles)
     OR activity_id NOT IN (SELECT id FROM activities);
  
  DELETE FROM saved_activities 
  WHERE user_id NOT IN (SELECT id FROM profiles) 
     OR activity_id NOT IN (SELECT id FROM activities);
     
  -- Update any missing data
  INSERT INTO user_preferences (user_id)
  SELECT id FROM profiles 
  WHERE id NOT IN (SELECT user_id FROM user_preferences)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Run data consistency check
SELECT ensure_data_consistency();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Final notification
DO $$
BEGIN
  RAISE NOTICE 'Storage persistence setup completed successfully!';
  RAISE NOTICE 'All user interactions (reviews, followers, chat messages) are now properly stored and will persist across app reloads.';
  RAISE NOTICE 'Data consistency checks have been run and cleanup procedures are in place.';
END $$;
