import { Request, Response } from "express";
import { supabaseAdmin, getUserFromToken } from "../lib/supabase";
import { z } from "zod";

// Validation schemas
const MarkReadSchema = z.object({
  notification_id: z.string().uuid(),
});

const CreateNotificationSchema = z.object({
  user_id: z.string().uuid(),
  type: z.enum(['activity_invitation', 'activity_update', 'message', 'review_request', 'club_invitation', 'new_follower', 'activity_joined', 'activity_cancelled']),
  title: z.string().min(1).max(200),
  message: z.string().optional(),
  data: z.record(z.any()).optional(),
});

// Helper function to get authenticated user (with demo fallback)
async function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // In development without Supabase, return a demo user
    if (process.env.NODE_ENV !== "production") {
      return {
        id: "demo-user-id",
        email: "demo@example.com"
      };
    }
    return null;
  }

  const user = await getUserFromToken(authHeader);
  if (!user && process.env.NODE_ENV !== "production") {
    // Fallback to demo user in development
    return {
      id: "demo-user-id",
      email: "demo@example.com"
    };
  }

  return user;
}

// Get user notifications
export const handleGetNotifications = async (req: Request, res: Response) => {
  try {
    if (!supabaseAdmin) {
      // In development, return demo notifications
      if (process.env.NODE_ENV !== "production") {
        return res.json({
          success: true,
          data: [
            {
              id: "demo-notif-1",
              type: "activity_joined",
              title: "Someone joined your activity",
              message: "A new participant joined your climbing session",
              data: { activity_id: "demo-activity-1" },
              read_at: null,
              created_at: new Date(Date.now() - 3600000).toISOString(),
            },
            {
              id: "demo-notif-2", 
              type: "new_follower",
              title: "New follower",
              message: "Demo User started following you",
              data: { follower_id: "demo-user-2" },
              read_at: new Date().toISOString(),
              created_at: new Date(Date.now() - 7200000).toISOString(),
            },
            {
              id: "demo-notif-3",
              type: "message",
              title: "New message",
              message: "You have a new direct message",
              data: { sender_id: "demo-user-3" },
              read_at: null,
              created_at: new Date(Date.now() - 1800000).toISOString(),
            }
          ]
        });
      }
      return res.status(500).json({ error: "Database not configured" });
    }

    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Parse query parameters
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const unread_only = req.query.unread_only === 'true';

    let query = supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (unread_only) {
      query = query.is("read_at", null);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error("Error fetching notifications:", error);
      // Fallback to demo data on error in development
      if (process.env.NODE_ENV !== "production") {
        return res.json({
          success: true,
          data: [
            {
              id: "demo-notif-1",
              type: "activity_joined",
              title: "Database error - showing demo notification",
              message: "This is a demo notification due to database error",
              data: {},
              read_at: null,
              created_at: new Date().toISOString(),
            }
          ]
        });
      }
      return res.status(500).json({ error: "Failed to fetch notifications" });
    }

    res.json({
      success: true,
      data: notifications || [],
      meta: {
        total: notifications?.length || 0,
        limit,
        offset,
        unread_only
      }
    });

  } catch (error) {
    console.error("Error in handleGetNotifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Mark notification as read
export const handleMarkNotificationRead = async (req: Request, res: Response) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { notification_id } = MarkReadSchema.parse(req.body);

    const { error } = await supabaseAdmin
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notification_id)
      .eq("user_id", user.id); // Ensure user can only mark their own notifications

    if (error) {
      console.error("Error marking notification read:", error);
      return res.status(500).json({ error: "Failed to mark notification as read" });
    }

    res.json({ success: true, message: "Notification marked as read" });

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request data", details: error.errors });
    } else {
      console.error("Error in handleMarkNotificationRead:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  }
};

// Mark all notifications as read
export const handleMarkAllNotificationsRead = async (req: Request, res: Response) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const user = await getAuthenticatedUser(req);
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

    res.json({ success: true, message: "All notifications marked as read" });

  } catch (error) {
    console.error("Error in handleMarkAllNotificationsRead:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
};

// Get unread notification count
export const handleGetUnreadCount = async (req: Request, res: Response) => {
  try {
    if (!supabaseAdmin) {
      // Return demo count in development
      if (process.env.NODE_ENV !== "production") {
        return res.json({ success: true, count: 2 });
      }
      return res.status(500).json({ error: "Database not configured" });
    }

    const user = await getAuthenticatedUser(req);
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

    res.json({ success: true, count: count || 0 });

  } catch (error) {
    console.error("Error in handleGetUnreadCount:", error);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
};

// Delete notification
export const handleDeleteNotification = async (req: Request, res: Response) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { notification_id } = req.params;

    const { error } = await supabaseAdmin
      .from("notifications")
      .delete()
      .eq("id", notification_id)
      .eq("user_id", user.id); // Ensure user can only delete their own notifications

    if (error) {
      console.error("Error deleting notification:", error);
      return res.status(500).json({ error: "Failed to delete notification" });
    }

    res.json({ success: true, message: "Notification deleted" });

  } catch (error) {
    console.error("Error in handleDeleteNotification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
};

// Helper function to create notifications (used by other route files)
export const createNotification = async (
  userId: string,
  type: 'activity_invitation' | 'activity_update' | 'message' | 'review_request' | 'club_invitation' | 'new_follower' | 'activity_joined' | 'activity_cancelled',
  title: string,
  message?: string,
  data?: Record<string, any>
): Promise<boolean> => {
  try {
    if (!supabaseAdmin) {
      console.log("Demo mode: Would create notification:", { userId, type, title, message, data });
      return true;
    }

    const { error } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data
      });

    if (error) {
      console.error("Error creating notification:", error);
      return false;
    }

    // TODO: Emit Socket.IO event for real-time notification
    // io.to(`user-${userId}`).emit('new_notification', { type, title, message, data });

    return true;
  } catch (error) {
    console.error("Error in createNotification:", error);
    return false;
  }
};

// Bulk create notifications (for sending to multiple users)
export const createNotifications = async (
  notifications: Array<{
    userId: string;
    type: string;
    title: string;
    message?: string;
    data?: Record<string, any>;
  }>
): Promise<boolean> => {
  try {
    if (!supabaseAdmin) {
      console.log("Demo mode: Would create bulk notifications:", notifications);
      return true;
    }

    const notificationInserts = notifications.map(notif => ({
      user_id: notif.userId,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      data: notif.data
    }));

    const { error } = await supabaseAdmin
      .from("notifications")
      .insert(notificationInserts);

    if (error) {
      console.error("Error creating bulk notifications:", error);
      return false;
    }

    // TODO: Emit Socket.IO events for real-time notifications
    // notifications.forEach(notif => {
    //   io.to(`user-${notif.userId}`).emit('new_notification', notif);
    // });

    return true;
  } catch (error) {
    console.error("Error in createNotifications:", error);
    return false;
  }
};

// Create notification via API endpoint (for testing or internal use)
export const handleCreateNotification = async (req: Request, res: Response) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Database not configured" });
    }

    // This endpoint should be protected and only used internally or by admins
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const validatedData = CreateNotificationSchema.parse(req.body);

    const success = await createNotification(
      validatedData.user_id,
      validatedData.type,
      validatedData.title,
      validatedData.message,
      validatedData.data
    );

    if (!success) {
      return res.status(500).json({ error: "Failed to create notification" });
    }

    res.json({ success: true, message: "Notification created" });

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid notification data", details: error.errors });
    } else {
      console.error("Error in handleCreateNotification:", error);
      res.status(500).json({ error: "Failed to create notification" });
    }
  }
};
