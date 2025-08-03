-- Add reviews and followers tables
-- Run this in your Supabase SQL Editor after the main setup

-- Activity reviews table
CREATE TABLE IF NOT EXISTS activity_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- Activity organizer
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(activity_id, reviewer_id) -- One review per person per activity
);

-- User followers table
CREATE TABLE IF NOT EXISTS user_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id) -- Can't follow yourself
);

-- Enable RLS
ALTER TABLE activity_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_followers ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON activity_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON activity_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users can update their own reviews" ON activity_reviews FOR UPDATE USING (auth.uid() = reviewer_id);
CREATE POLICY "Users can delete their own reviews" ON activity_reviews FOR DELETE USING (auth.uid() = reviewer_id);

-- Followers policies  
CREATE POLICY "Followers are viewable by everyone" ON user_followers FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON user_followers FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow others" ON user_followers FOR DELETE USING (auth.uid() = follower_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_reviews_activity_id ON activity_reviews(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_reviews_reviewer_id ON activity_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_activity_reviews_reviewee_id ON activity_reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_user_followers_follower_id ON user_followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_followers_following_id ON user_followers(following_id);

-- Add participant_count to activities table
ALTER TABLE activities ADD COLUMN IF NOT EXISTS participant_count INTEGER DEFAULT 0;

-- Function to update participant count
CREATE OR REPLACE FUNCTION update_activity_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE activities 
  SET participant_count = (
    SELECT COUNT(*) 
    FROM activity_participants 
    WHERE activity_id = COALESCE(NEW.activity_id, OLD.activity_id)
  )
  WHERE id = COALESCE(NEW.activity_id, OLD.activity_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for participant count updates
DROP TRIGGER IF EXISTS trigger_update_participant_count_insert ON activity_participants;
CREATE TRIGGER trigger_update_participant_count_insert
  AFTER INSERT ON activity_participants
  FOR EACH ROW EXECUTE FUNCTION update_activity_participant_count();

DROP TRIGGER IF EXISTS trigger_update_participant_count_delete ON activity_participants;
CREATE TRIGGER trigger_update_participant_count_delete
  AFTER DELETE ON activity_participants
  FOR EACH ROW EXECUTE FUNCTION update_activity_participant_count();

-- Add average rating column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Function to update user's average rating
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET 
    average_rating = (
      SELECT ROUND(AVG(rating), 2)
      FROM activity_reviews 
      WHERE reviewee_id = COALESCE(NEW.reviewee_id, OLD.reviewee_id)
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM activity_reviews 
      WHERE reviewee_id = COALESCE(NEW.reviewee_id, OLD.reviewee_id)
    )
  WHERE id = COALESCE(NEW.reviewee_id, OLD.reviewee_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for rating updates
DROP TRIGGER IF EXISTS trigger_update_rating_insert ON activity_reviews;
CREATE TRIGGER trigger_update_rating_insert
  AFTER INSERT ON activity_reviews
  FOR EACH ROW EXECUTE FUNCTION update_user_rating();

DROP TRIGGER IF EXISTS trigger_update_rating_update ON activity_reviews;
CREATE TRIGGER trigger_update_rating_update
  AFTER UPDATE ON activity_reviews
  FOR EACH ROW EXECUTE FUNCTION update_user_rating();

DROP TRIGGER IF EXISTS trigger_update_rating_delete ON activity_reviews;
CREATE TRIGGER trigger_update_rating_delete
  AFTER DELETE ON activity_reviews
  FOR EACH ROW EXECUTE FUNCTION update_user_rating();
