-- Add User Followers Table (Missing from complete_setup.sql)
-- This table is referenced in server/routes/followers.ts but doesn't exist in the schema

-- User followers table for social features
CREATE TABLE IF NOT EXISTS user_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_followers_follower_id ON user_followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_followers_following_id ON user_followers(following_id);
CREATE INDEX IF NOT EXISTS idx_user_followers_created_at ON user_followers(created_at);

-- Enable Row Level Security
ALTER TABLE user_followers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_followers
CREATE POLICY "Users can view all follow relationships" ON user_followers
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON user_followers
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" ON user_followers
  FOR DELETE USING (auth.uid() = follower_id);

-- Function to prevent users from following themselves
CREATE OR REPLACE FUNCTION check_self_follow()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.follower_id = NEW.following_id THEN
    RAISE EXCEPTION 'Users cannot follow themselves';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent self-following
DROP TRIGGER IF EXISTS trigger_check_self_follow ON user_followers;
CREATE TRIGGER trigger_check_self_follow
  BEFORE INSERT ON user_followers
  FOR EACH ROW EXECUTE FUNCTION check_self_follow();

-- Function to update follower counts (if you want to add counters to profiles table later)
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be enhanced later to update follower/following counts
  -- on the profiles table if needed for performance
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Optional: Add follower/following counts to profiles table for performance
-- Uncomment if you want to denormalize for better performance
/*
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Function to update follower counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update following count for follower
    UPDATE profiles 
    SET following_count = following_count + 1 
    WHERE id = NEW.follower_id;
    
    -- Update followers count for following
    UPDATE profiles 
    SET followers_count = followers_count + 1 
    WHERE id = NEW.following_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update following count for follower
    UPDATE profiles 
    SET following_count = following_count - 1 
    WHERE id = OLD.follower_id;
    
    -- Update followers count for following
    UPDATE profiles 
    SET followers_count = followers_count - 1 
    WHERE id = OLD.following_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for count updates
DROP TRIGGER IF EXISTS trigger_update_follow_counts_insert ON user_followers;
CREATE TRIGGER trigger_update_follow_counts_insert
  AFTER INSERT ON user_followers
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

DROP TRIGGER IF EXISTS trigger_update_follow_counts_delete ON user_followers;
CREATE TRIGGER trigger_update_follow_counts_delete
  AFTER DELETE ON user_followers
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();
*/

-- Insert some demo data (optional)
-- Uncomment to add demo follow relationships
/*
INSERT INTO user_followers (follower_id, following_id) VALUES
  -- These would need actual user IDs from your profiles table
  -- ('user-id-1', 'user-id-2'),
  -- ('user-id-2', 'user-id-1'),
  -- ('user-id-1', 'user-id-3')
ON CONFLICT (follower_id, following_id) DO NOTHING;
*/
