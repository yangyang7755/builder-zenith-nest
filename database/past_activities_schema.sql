-- Past Activities Management System
-- Handles completed activities and integrates with review system

-- Add status update trigger to automatically handle past activities
CREATE OR REPLACE FUNCTION update_activity_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically update status based on date_time
  IF NEW.date_time <= NOW() AND NEW.status = 'upcoming' THEN
    NEW.status = 'completed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update activity status
DROP TRIGGER IF EXISTS trigger_update_activity_status ON activities;
CREATE TRIGGER trigger_update_activity_status
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_activity_status();

-- Function to batch update past activities
CREATE OR REPLACE FUNCTION update_past_activities()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Update all activities that have passed their date/time to 'completed'
  UPDATE activities 
  SET status = 'completed', updated_at = NOW()
  WHERE date_time <= NOW() 
    AND status = 'upcoming';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Create activity reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS activity_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- who is being reviewed
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  review_type VARCHAR(20) DEFAULT 'participant', -- 'participant', 'organizer'
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate reviews
  UNIQUE(activity_id, reviewer_id, reviewee_id, review_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_reviews_activity ON activity_reviews(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_reviews_reviewer ON activity_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_activity_reviews_reviewee ON activity_reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_activity_reviews_rating ON activity_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_activity_reviews_type ON activity_reviews(review_type);

-- RLS policies for activity reviews
ALTER TABLE activity_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activity reviews are viewable by everyone" ON activity_reviews FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create reviews for completed activities they participated in" ON activity_reviews FOR INSERT 
WITH CHECK (
  auth.uid() = reviewer_id AND
  EXISTS (
    SELECT 1 FROM activities a 
    WHERE a.id = activity_id 
    AND a.status = 'completed'
  ) AND
  EXISTS (
    SELECT 1 FROM activity_participants ap 
    WHERE ap.activity_id = activity_reviews.activity_id 
    AND ap.user_id = auth.uid() 
    AND ap.status = 'completed'
  )
);

CREATE POLICY "Users can update their own reviews" ON activity_reviews FOR UPDATE 
USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews" ON activity_reviews FOR DELETE 
USING (auth.uid() = reviewer_id);

-- Function to get user's activity history
CREATE OR REPLACE FUNCTION get_user_activity_history(user_uuid UUID, activity_status VARCHAR DEFAULT 'completed')
RETURNS TABLE (
  activity_id UUID,
  title VARCHAR,
  description TEXT,
  activity_type VARCHAR,
  date_time TIMESTAMP WITH TIME ZONE,
  location VARCHAR,
  organizer_name VARCHAR,
  participation_status VARCHAR,
  user_rating DECIMAL,
  review_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id as activity_id,
    a.title,
    a.description,
    a.activity_type,
    a.date_time,
    a.location,
    p.full_name as organizer_name,
    ap.status as participation_status,
    COALESCE(AVG(ar.rating), 0) as user_rating,
    COUNT(ar.id)::INTEGER as review_count
  FROM activities a
  INNER JOIN activity_participants ap ON a.id = ap.activity_id
  LEFT JOIN profiles p ON a.organizer_id = p.id
  LEFT JOIN activity_reviews ar ON a.id = ar.activity_id AND ar.reviewee_id = user_uuid
  WHERE ap.user_id = user_uuid 
    AND a.status = activity_status
    AND ap.status IN ('completed', 'joined')
  GROUP BY a.id, a.title, a.description, a.activity_type, a.date_time, a.location, p.full_name, ap.status
  ORDER BY a.date_time DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to update activity participants status when activity completes
CREATE OR REPLACE FUNCTION complete_activity_participants()
RETURNS TRIGGER AS $$
BEGIN
  -- When activity status changes to completed, update all joined participants to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE activity_participants
    SET status = 'completed'
    WHERE activity_id = NEW.id AND status = 'joined';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-complete participants
DROP TRIGGER IF EXISTS trigger_complete_participants ON activities;
CREATE TRIGGER trigger_complete_participants
  AFTER UPDATE ON activities
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION complete_activity_participants();

-- Function to calculate user statistics from completed activities
CREATE OR REPLACE FUNCTION get_user_activity_stats(user_uuid UUID)
RETURNS TABLE (
  total_activities INTEGER,
  total_organized INTEGER,
  total_participated INTEGER,
  average_rating DECIMAL,
  activity_types JSON,
  recent_activity_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (
      SELECT COUNT(*)::INTEGER 
      FROM activity_participants ap 
      INNER JOIN activities a ON ap.activity_id = a.id 
      WHERE ap.user_id = user_uuid AND a.status = 'completed'
    ) as total_activities,
    (
      SELECT COUNT(*)::INTEGER 
      FROM activities a 
      WHERE a.organizer_id = user_uuid AND a.status = 'completed'
    ) as total_organized,
    (
      SELECT COUNT(*)::INTEGER 
      FROM activity_participants ap 
      INNER JOIN activities a ON ap.activity_id = a.id 
      WHERE ap.user_id = user_uuid AND a.organizer_id != user_uuid AND a.status = 'completed'
    ) as total_participated,
    (
      SELECT COALESCE(AVG(rating), 0) 
      FROM activity_reviews 
      WHERE reviewee_id = user_uuid
    ) as average_rating,
    (
      SELECT json_agg(
        json_build_object(
          'activity_type', activity_type,
          'count', count
        )
      )
      FROM (
        SELECT a.activity_type, COUNT(*)::INTEGER as count
        FROM activity_participants ap 
        INNER JOIN activities a ON ap.activity_id = a.id 
        WHERE ap.user_id = user_uuid AND a.status = 'completed'
        GROUP BY a.activity_type
        ORDER BY count DESC
      ) activity_counts
    ) as activity_types,
    (
      SELECT MAX(a.date_time)
      FROM activity_participants ap 
      INNER JOIN activities a ON ap.activity_id = a.id 
      WHERE ap.user_id = user_uuid AND a.status = 'completed'
    ) as recent_activity_date;
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job function (to be run via cron or application scheduler)
CREATE OR REPLACE FUNCTION daily_activity_status_update()
RETURNS TEXT AS $$
DECLARE
  updated_count INTEGER;
  result_message TEXT;
BEGIN
  -- Update past activities
  SELECT update_past_activities() INTO updated_count;
  
  -- Log the update
  result_message := 'Updated ' || updated_count || ' activities to completed status at ' || NOW();
  
  -- You could insert this into a log table if needed
  -- INSERT INTO activity_status_logs (message, created_at) VALUES (result_message, NOW());
  
  RETURN result_message;
END;
$$ LANGUAGE plpgsql;

-- Update activities.updated_at trigger function for reviews
CREATE OR REPLACE FUNCTION update_activity_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_activity_reviews_updated_at
  BEFORE UPDATE ON activity_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_activity_reviews_updated_at();

COMMENT ON TABLE activity_reviews IS 'Reviews for completed activities linking participants and organizers';
COMMENT ON FUNCTION update_past_activities() IS 'Batch update activities that have passed their date/time to completed status';
COMMENT ON FUNCTION get_user_activity_history(UUID, VARCHAR) IS 'Get paginated activity history for a user with ratings';
COMMENT ON FUNCTION get_user_activity_stats(UUID) IS 'Get comprehensive activity statistics for a user profile';
COMMENT ON FUNCTION daily_activity_status_update() IS 'Daily job to update activity statuses and clean up past activities';
