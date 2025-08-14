import { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin, getUserFromToken } from "../lib/supabase";

const MarkReadSchema = z.object({
  notification_id: z.string().uuid(),
});

const CreateNotificationSchema = z.object({
  user_id: z.string().uuid(),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  data: z.any().optional(),
});

export const handleGetNotifications = async (req: Request, res: Response) => {
  try {
    // Check if Supabase is configured
    if (!supabaseAdmin) {
      // Return demo notifications for development
      const demoNotifications = [
        {
          id: "demo-1",
          type: "activity_joined",
          title: "New participant joined your activity",
          message: "Someone joined your climbing session",
          read_at: null,
          created_at: new Date().toISOString(),
          data: { activity_id: "demo-activity-1" }
        },
        {
          id: "demo-2", 
          type: "follower",
          title: "New follower",
          message: "You have a new follower",
          read_at: new Date().toISOString(),
          created_at: new Date(Date.now() - 86400000).toISOString(),
          data: { follower_id: "demo-user-2" }
        }
      ];
      return res.json({ success: true, data: demoNotifications });
    }

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
    if (!supabaseAdmin) {
      return res.json({ success: true, message: "Demo mode - notification marked as read" });
    }

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
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

export const handleMarkAllNotificationsRead = async (req: Request, res: Response) => {
  try {
    if (!supabaseAdmin) {
      return res.json({ success: true, message: "Demo mode - all notifications marked as read" });
    }

    const user = await getUserFromToken(req.headers.authorization || "");
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { error } = await supabaseAdmin
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);

    if (error) {
      console.error("Error marking all notifications read:", error);
      return res.status(500).json({ error: "Failed to mark all notifications as read" });
    }

    res.json({ success: true });

  } catch (error) {
    console.error("Error in handleMarkAllNotificationsRead:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
};

export const handleGetUnreadCount = async (req: Request, res: Response) => {
  try {
    if (!supabaseAdmin) {
      return res.json({ success: true, data: { count: 1 } });
    }

    const user = await getUserFromToken(req.headers.authorization || "");
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { count, error } = await supabaseAdmin
      .from("notifications")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .is("read_at", null);

    if (error) {
      console.error("Error fetching unread count:", error);
      return res.status(500).json({ error: "Failed to fetch unread count" });
    }

    res.json({ success: true, data: { count: count || 0 } });

  } catch (error) {
    console.error("Error in handleGetUnreadCount:", error);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
};

export const handleDeleteNotification = async (req: Request, res: Response) => {
  try {
    if (!supabaseAdmin) {
      return res.json({ success: true, message: "Demo mode - notification deleted" });
    }

    const user = await getUserFromToken(req.headers.authorization || "");
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { notification_id } = req.params;

    const { error } = await supabaseAdmin
      .from("notifications")
      .delete()
      .eq("id", notification_id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting notification:", error);
      return res.status(500).json({ error: "Failed to delete notification" });
    }

    res.json({ success: true });

  } catch (error) {
    console.error("Error in handleDeleteNotification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
};

export const handleCreateNotification = async (req: Request, res: Response) => {
  try {
    if (!supabaseAdmin) {
      return res.json({ success: true, message: "Demo mode - notification created" });
    }

    const { user_id, type, title, message, data } = CreateNotificationSchema.parse(req.body);

    const { error } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id,
        type,
        title,
        message,
        data
      });

    if (error) {
      console.error("Error creating notification:", error);
      return res.status(500).json({ error: "Failed to create notification" });
    }

    res.json({ success: true });

  } catch (error) {
    console.error("Error in handleCreateNotification:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create notification" });
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
    if (!supabaseAdmin) {
      console.log("Demo mode - notification would be created:", { userId, type, title, message });
      return;
    }

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
