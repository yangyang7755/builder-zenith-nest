-- Add missing direct_messages table for private chat
CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_id ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver_id ON direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON direct_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Add function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(sender_user_id UUID, receiver_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE direct_messages 
  SET read_at = NOW() 
  WHERE sender_id = sender_user_id 
    AND receiver_id = receiver_user_id 
    AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies for chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages from clubs they are members of
CREATE POLICY "Users can read club messages they have access to" ON chat_messages
  FOR SELECT USING (
    club_id IN (
      SELECT club_id FROM club_memberships 
      WHERE user_id = auth.uid() AND status = 'approved'
    )
  );

-- Users can insert messages to clubs they are members of
CREATE POLICY "Users can send messages to their clubs" ON chat_messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    club_id IN (
      SELECT club_id FROM club_memberships 
      WHERE user_id = auth.uid() AND status = 'approved'
    )
  );

-- Add RLS policies for direct_messages
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages where they are sender or receiver
CREATE POLICY "Users can read their direct messages" ON direct_messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Users can send direct messages
CREATE POLICY "Users can send direct messages" ON direct_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Users can update read status of messages sent to them
CREATE POLICY "Users can mark received messages as read" ON direct_messages
  FOR UPDATE USING (receiver_id = auth.uid());
