-- Add activity images table for multiple images per activity
CREATE TABLE IF NOT EXISTS activity_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_activity_images_activity_id ON activity_images(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_images_display_order ON activity_images(activity_id, display_order);

-- Add image columns to existing tables for cover images
ALTER TABLE activities ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- Function to automatically update activity images count (optional)
CREATE OR REPLACE FUNCTION update_activity_image_count()
RETURNS TRIGGER AS $$
BEGIN
  -- You could add an image_count column to activities table if needed
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for activity image management
DROP TRIGGER IF EXISTS trigger_activity_image_insert ON activity_images;
CREATE TRIGGER trigger_activity_image_insert
  AFTER INSERT ON activity_images
  FOR EACH ROW EXECUTE FUNCTION update_activity_image_count();

DROP TRIGGER IF EXISTS trigger_activity_image_delete ON activity_images;
CREATE TRIGGER trigger_activity_image_delete
  AFTER DELETE ON activity_images
  FOR EACH ROW EXECUTE FUNCTION update_activity_image_count();
