-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('profile-images', 'profile-images', true),
  ('club-images', 'club-images', true),
  ('activity-images', 'activity-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile images
CREATE POLICY "Profile images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload their own profile image" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile image" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile image" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for club images
CREATE POLICY "Club images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'club-images');

CREATE POLICY "Club managers can upload club images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'club-images' 
  AND EXISTS (
    SELECT 1 FROM club_memberships 
    WHERE user_id = auth.uid() 
    AND club_id = (storage.foldername(name))[1]
    AND role = 'manager' 
    AND status = 'approved'
  )
);

CREATE POLICY "Club managers can update club images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'club-images' 
  AND EXISTS (
    SELECT 1 FROM club_memberships 
    WHERE user_id = auth.uid() 
    AND club_id = (storage.foldername(name))[1]
    AND role = 'manager' 
    AND status = 'approved'
  )
);

CREATE POLICY "Club managers can delete club images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'club-images' 
  AND EXISTS (
    SELECT 1 FROM club_memberships 
    WHERE user_id = auth.uid() 
    AND club_id = (storage.foldername(name))[1]
    AND role = 'manager' 
    AND status = 'approved'
  )
);

-- Storage policies for activity images
CREATE POLICY "Activity images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'activity-images');

CREATE POLICY "Activity organizers can upload activity images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'activity-images' 
  AND EXISTS (
    SELECT 1 FROM activities 
    WHERE id::text = (storage.foldername(name))[1]
    AND organizer_id = auth.uid()
  )
);

CREATE POLICY "Activity organizers can update activity images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'activity-images' 
  AND EXISTS (
    SELECT 1 FROM activities 
    WHERE id::text = (storage.foldername(name))[1]
    AND organizer_id = auth.uid()
  )
);

CREATE POLICY "Activity organizers can delete activity images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'activity-images' 
  AND EXISTS (
    SELECT 1 FROM activities 
    WHERE id::text = (storage.foldername(name))[1]
    AND organizer_id = auth.uid()
  )
);
