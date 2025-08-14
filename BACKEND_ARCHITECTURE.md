# Backend Architecture Analysis & Implementation

## 🔍 **Current State Analysis**

### ✅ **What's Working**
- **Comprehensive Database Schema**: You have a well-designed schema with proper relationships
- **Socket.IO Integration**: Real-time chat system is set up
- **Authentication**: Supabase auth with profile system
- **Activity System**: Complete activity creation and participation
- **Chat System**: Both club chat and direct messages
- **Review System**: Activity reviews and ratings

### ❌ **Missing Critical Connections**

1. **Followers/Following Table Missing**: Routes exist but `user_followers` table not in schema
2. **Notification System**: Table exists but no backend implementation
3. **Activity Participants**: Need better integration with user contexts
4. **Cross-System Data Flow**: Systems are isolated, not interconnected

## 🎯 **Priority Fixes Needed**

### **1. Add Missing Database Tables**

```sql
-- User followers table (MISSING from current schema)
CREATE TABLE IF NOT EXISTS user_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Indexes for followers
CREATE INDEX IF NOT EXISTS idx_user_followers_follower_id ON user_followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_followers_following_id ON user_followers(following_id);

-- RLS policies for followers
ALTER TABLE user_followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all follow relationships" ON user_followers
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON user_followers
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" ON user_followers
  FOR DELETE USING (auth.uid() = follower_id);
```

### **2. Implement Missing Backend Routes**

#### **A. Notification System** (Table exists, routes missing)

```typescript
// server/routes/notifications.ts
export const handleGetNotifications = async (req: Request, res: Response) => {
  // Get user notifications with pagination
};

export const handleMarkNotificationRead = async (req: Request, res: Response) => {
  // Mark notification as read
};

export const handleCreateNotification = async (req: Request, res: Response) => {
  // Create new notification (internal use)
};
```

#### **B. Activity Participation Integration** (Needs enhancement)

```typescript
// server/routes/activities.ts - Enhanced
export const handleJoinActivity = async (req: Request, res: Response) => {
  // 1. Add user to activity_participants
  // 2. Create notification for organizer
  // 3. Update activity participant count
  // 4. Emit real-time update via Socket.IO
};

export const handleLeaveActivity = async (req: Request, res: Response) => {
  // 1. Remove from activity_participants
  // 2. Create notification for organizer
  // 3. Update activity participant count
  // 4. Emit real-time update via Socket.IO
};
```

## 🔗 **Interconnected System Design**

### **User Actions → System-Wide Effects**

#### **When User Follows Someone:**
1. **Database**: Insert into `user_followers`
2. **Notifications**: Create "New follower" notification
3. **Feed**: Update activity recommendations
4. **Real-time**: Notify followed user via Socket.IO

#### **When User Joins Activity:**
1. **Database**: Insert into `activity_participants`
2. **Notifications**: Notify organizer and participants
3. **Chat**: Auto-create activity chat room
4. **Real-time**: Update activity participant count
5. **Recommendations**: Update user's activity preferences

#### **When User Creates Activity:**
1. **Database**: Insert activity with organizer relationship
2. **Notifications**: Notify followers of new activity
3. **Club Integration**: If club activity, notify club members
4. **Real-time**: Broadcast to relevant users

#### **When User Reviews Activity:**
1. **Database**: Insert into `activity_reviews`
2. **Notifications**: Notify reviewed user
3. **Statistics**: Update user and activity ratings
4. **Recommendations**: Improve matching algorithm

## 🚀 **Implementation Priority**

### **Phase 1: Critical Database Fixes (15 min)**
1. Add `user_followers` table
2. Add notification route handlers
3. Test follower system

### **Phase 2: System Integration (30 min)**
1. Connect activity joining to notifications
2. Link chat system to activity participation
3. Implement cross-system real-time updates

### **Phase 3: Advanced Features (45 min)**
1. Activity recommendation engine
2. Advanced notification system
3. Real-time activity updates

## 🔧 **Implementation Code**

### **1. Fix Missing Followers Table**

```sql
-- Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS user_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_followers_follower_id ON user_followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_followers_following_id ON user_followers(following_id);

ALTER TABLE user_followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all follow relationships" ON user_followers
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON user_followers
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" ON user_followers
  FOR DELETE USING (auth.uid() = follower_id);
```

### **2. Enhanced Activity Joining System**

```typescript
// server/routes/activities.ts - Add these functions

export const handleJoinActivity = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromToken(req.headers.authorization || "");
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { activity_id } = req.params;

    // Start transaction
    const { data: activity, error: activityError } = await supabaseAdmin
      .from("activities")
      .select(`
        id, title, organizer_id, max_participants,
        organizer:profiles!organizer_id(id, full_name)
      `)
      .eq("id", activity_id)
      .single();

    if (activityError || !activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    // Check if already joined
    const { data: existingParticipant } = await supabaseAdmin
      .from("activity_participants")
      .select("id")
      .eq("activity_id", activity_id)
      .eq("user_id", user.id)
      .single();

    if (existingParticipant) {
      return res.status(400).json({ error: "Already joined this activity" });
    }

    // Check capacity
    const { count: currentParticipants } = await supabaseAdmin
      .from("activity_participants")
      .select("id", { count: "exact" })
      .eq("activity_id", activity_id);

    if (activity.max_participants && currentParticipants >= activity.max_participants) {
      return res.status(400).json({ error: "Activity is full" });
    }

    // Join activity
    const { error: joinError } = await supabaseAdmin
      .from("activity_participants")
      .insert({
        activity_id,
        user_id: user.id
      });

    if (joinError) {
      return res.status(500).json({ error: "Failed to join activity" });
    }

    // Create notification for organizer
    if (activity.organizer_id !== user.id) {
      await supabaseAdmin
        .from("notifications")
        .insert({
          user_id: activity.organizer_id,
          type: "activity_invitation",
          title: "New participant joined your activity",
          message: `Someone joined "${activity.title}"`,
          data: { activity_id, participant_id: user.id }
        });
    }

    // TODO: Emit Socket.IO event for real-time updates

    res.json({ 
      success: true, 
      message: "Successfully joined activity",
      participant_count: currentParticipants + 1
    });

  } catch (error) {
    console.error("Error joining activity:", error);
    res.status(500).json({ error: "Failed to join activity" });
  }
};
```

### **3. Notification System Implementation**

```typescript
// server/routes/notifications.ts (CREATE THIS FILE)

import { Request, Response } from "express";
import { supabaseAdmin, getUserFromToken } from "../lib/supabase";
import { z } from "zod";

const MarkReadSchema = z.object({
  notification_id: z.string().uuid(),
});

export const handleGetNotifications = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromToken(req.headers.authorization || "");
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { data: notifications, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching notifications:", error);
      return res.status(500).json({ error: "Failed to fetch notifications" });
    }

    res.json({ success: true, data: notifications || [] });

  } catch (error) {
    console.error("Error in handleGetNotifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

export const handleMarkNotificationRead = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromToken(req.headers.authorization || "");
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { notification_id } = MarkReadSchema.parse(req.body);

    const { error } = await supabaseAdmin
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notification_id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error marking notification read:", error);
      return res.status(500).json({ error: "Failed to mark notification as read" });
    }

    res.json({ success: true });

  } catch (error) {
    console.error("Error in handleMarkNotificationRead:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

// Helper function to create notifications (used by other routes)
export const createNotification = async (
  userId: string, 
  type: string, 
  title: string, 
  message: string, 
  data?: any
) => {
  try {
    await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data
      });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};
```

## 📋 **Next Steps**

1. **Run the missing table SQL in Supabase**
2. **Create notifications.ts route file**
3. **Update server/index.ts to include notification routes**
4. **Test follower system end-to-end**
5. **Implement activity joining notifications**

This will create a fully interconnected backend where:
- User actions trigger notifications
- Real-time updates flow through Socket.IO
- All systems share data properly
- Frontend contexts get live updates

**Ready to implement the fixes?**
