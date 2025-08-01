-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Clubs policies
CREATE POLICY "Anyone can view clubs" ON clubs FOR SELECT USING (true);
CREATE POLICY "Club managers can update their clubs" ON clubs FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM club_memberships 
    WHERE club_id = clubs.id 
    AND user_id = auth.uid() 
    AND role = 'manager' 
    AND status = 'approved'
  )
);
CREATE POLICY "Authenticated users can create clubs" ON clubs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Club memberships policies
CREATE POLICY "Users can view club memberships" ON club_memberships FOR SELECT USING (true);
CREATE POLICY "Users can request to join clubs" ON club_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own membership requests" ON club_memberships FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Club managers can manage memberships" ON club_memberships FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM club_memberships cm
    WHERE cm.club_id = club_memberships.club_id 
    AND cm.user_id = auth.uid() 
    AND cm.role = 'manager' 
    AND cm.status = 'approved'
  )
);
CREATE POLICY "Club managers can delete membership requests" ON club_memberships FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM club_memberships cm
    WHERE cm.club_id = club_memberships.club_id 
    AND cm.user_id = auth.uid() 
    AND cm.role = 'manager' 
    AND cm.status = 'approved'
  )
);

-- Activities policies
CREATE POLICY "Anyone can view activities" ON activities FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create activities" ON activities FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Activity organizers can update their activities" ON activities FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Activity organizers can delete their activities" ON activities FOR DELETE USING (auth.uid() = organizer_id);
CREATE POLICY "Club managers can manage club activities" ON activities FOR UPDATE USING (
  club_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM club_memberships 
    WHERE club_id = activities.club_id 
    AND user_id = auth.uid() 
    AND role = 'manager' 
    AND status = 'approved'
  )
);

-- Activity participants policies
CREATE POLICY "Users can view activity participants" ON activity_participants FOR SELECT USING (true);
CREATE POLICY "Users can join activities" ON activity_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave activities" ON activity_participants FOR DELETE USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Club members can view club messages" ON chat_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM club_memberships 
    WHERE club_id = chat_messages.club_id 
    AND user_id = auth.uid() 
    AND status = 'approved'
  )
);
CREATE POLICY "Club members can send messages" ON chat_messages FOR INSERT WITH CHECK (
  auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM club_memberships 
    WHERE club_id = chat_messages.club_id 
    AND user_id = auth.uid() 
    AND status = 'approved'
  )
);
