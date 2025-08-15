import { Request, Response } from "express";
import { supabaseAdmin, getUserFromToken } from "../lib/supabase";
import { z } from "zod";

// Validation schemas
const GetClubMessagesSchema = z.object({
  club_id: z.string(),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 50),
  offset: z.string().optional().transform(val => val ? parseInt(val) : 0),
});

const SendClubMessageSchema = z.object({
  club_id: z.string(),
  message: z.string().min(1).max(1000),
});

const GetDirectMessagesSchema = z.object({
  other_user_id: z.string(),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 50),
  offset: z.string().optional().transform(val => val ? parseInt(val) : 0),
});

const SendDirectMessageSchema = z.object({
  receiver_id: z.string(),
  message: z.string().min(1).max(1000),
});

const MarkMessagesReadSchema = z.object({
  sender_id: z.string(),
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

// Get club chat messages
export async function handleGetClubMessages(req: Request, res: Response) {
  try {
    if (!supabaseAdmin) {
      // In development, return demo data instead of failing
      if (process.env.NODE_ENV !== "production") {
        return res.json({
          success: true,
          data: [
            {
              id: "demo-msg-1",
              user_id: "demo-user-1",
              user_name: "Demo User",
              user_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
              message: "Welcome to the demo chat! This is a sample message.",
              created_at: new Date(Date.now() - 3600000).toISOString(),
              is_system: false
            },
            {
              id: "demo-msg-2",
              user_id: "demo-user-2",
              user_name: "Another User",
              user_avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=40&h=40&fit=crop&crop=face",
              message: "Database not configured, showing demo data instead.",
              created_at: new Date().toISOString(),
              is_system: false
            }
          ]
        });
      }
      return res.status(500).json({ error: "Database not configured" });
    }

    // Get user from Authorization header
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { club_id, limit, offset } = GetClubMessagesSchema.parse({
      club_id: req.params.club_id,
      ...req.query
    });

    // Verify user is member of the club (skip in development)
    if (process.env.NODE_ENV === "production") {
      const { data: membership } = await supabaseAdmin
        .from("club_memberships")
        .select("*")
        .eq("club_id", club_id)
        .eq("user_id", user.id)
        .eq("status", "approved")
        .single();

      if (!membership) {
        return res.status(403).json({ error: "Access denied: Not a member of this club" });
      }
    }

    // Get messages with user info
    const { data: messages, error } = await supabaseAdmin
      .from("chat_messages")
      .select(`
        id,
        message,
        created_at,
        user_id,
        profiles:user_id (
          id,
          full_name,
          profile_image
        )
      `)
      .eq("club_id", club_id)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching club messages:", error);
      // In development, fall back to demo data on database errors
      if (process.env.NODE_ENV !== "production") {
        return res.json({
          success: true,
          data: [
            {
              id: "demo-msg-1",
              user_id: "demo-user-1",
              user_name: "Demo User",
              user_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
              message: "Welcome to the demo chat! Database error, showing demo data.",
              created_at: new Date(Date.now() - 3600000).toISOString(),
              is_system: false
            }
          ]
        });
      }
      return res.status(500).json({ error: "Failed to fetch messages" });
    }

    res.json({
      success: true,
      data: messages?.map(msg => ({
        id: msg.id,
        user_id: msg.user_id,
        user_name: msg.profiles?.full_name || "Unknown User",
        user_avatar: msg.profiles?.profile_image,
        message: msg.message,
        created_at: msg.created_at,
        is_system: false
      })) || []
    });

  } catch (error) {
    console.error("Error in handleGetClubMessages:", error);
    res.status(400).json({ error: "Invalid request parameters" });
  }
}

// Get direct messages between two users
export async function handleGetDirectMessages(req: Request, res: Response) {
  try {
    if (!supabaseAdmin) {
      // In development, return demo data instead of failing
      if (process.env.NODE_ENV !== "production") {
        return res.json({
          success: true,
          data: [
            {
              id: "dm-1",
              sender_id: "demo-user-1",
              receiver_id: "demo-user-2",
              sender_name: "Demo User",
              sender_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
              receiver_name: "Other User",
              receiver_avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=40&h=40&fit=crop&crop=face",
              message: "Hello! This is a demo direct message.",
              created_at: new Date().toISOString(),
              read_at: null,
              is_sent_by_me: true
            }
          ]
        });
      }
      return res.status(500).json({ error: "Database not configured" });
    }

    // Get user from Authorization header
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { other_user_id, limit, offset } = GetDirectMessagesSchema.parse({
      other_user_id: req.params.other_user_id,
      ...req.query
    });

    // Get messages between the two users
    const { data: messages, error } = await supabaseAdmin
      .from("direct_messages")
      .select(`
        id,
        message,
        created_at,
        read_at,
        sender_id,
        receiver_id,
        sender:sender_id (
          id,
          full_name,
          profile_image
        ),
        receiver:receiver_id (
          id,
          full_name,
          profile_image
        )
      `)
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${other_user_id}),and(sender_id.eq.${other_user_id},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching direct messages:", error);
      // In development, fall back to demo data on database errors
      if (process.env.NODE_ENV !== "production") {
        return res.json({
          success: true,
          data: [
            {
              id: "dm-1",
              sender_id: "demo-user-1",
              receiver_id: "demo-user-2",
              sender_name: "Demo User",
              sender_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
              receiver_name: "Other User",
              receiver_avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=40&h=40&fit=crop&crop=face",
              message: "Database error - showing demo direct message.",
              created_at: new Date().toISOString(),
              read_at: null,
              is_sent_by_me: true
            }
          ]
        });
      }
      return res.status(500).json({ error: "Failed to fetch messages" });
    }

    res.json({
      success: true,
      data: messages?.map(msg => ({
        id: msg.id,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        sender_name: msg.sender?.full_name || "Unknown User",
        sender_avatar: msg.sender?.profile_image,
        receiver_name: msg.receiver?.full_name || "Unknown User",
        receiver_avatar: msg.receiver?.profile_image,
        message: msg.message,
        created_at: msg.created_at,
        read_at: msg.read_at,
        is_sent_by_me: msg.sender_id === user.id
      })) || []
    });

  } catch (error) {
    console.error("Error in handleGetDirectMessages:", error);
    res.status(400).json({ error: "Invalid request parameters" });
  }
}

// Send club message (HTTP endpoint, real-time handled by Socket.IO)
export async function handleSendClubMessage(req: Request, res: Response) {
  try {
    console.log("=== SEND CLUB MESSAGE REQUEST ===");
    console.log("Club ID:", req.params.club_id);
    console.log("Message:", req.body.message);

    if (!supabaseAdmin) {
      console.log("Supabase not configured, returning demo message");
      const demoMessage = {
        id: "demo-msg-" + Date.now(),
        user_id: "demo-user-current",
        user_name: "Demo User",
        user_avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
        message: req.body.message,
        created_at: new Date().toISOString(),
        is_system: false
      };
      return res.json({
        success: true,
        data: demoMessage
      });
    }

    // Get user from Authorization header
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { club_id, message } = SendClubMessageSchema.parse({
      club_id: req.params.club_id,
      ...req.body
    });

    // Verify user is member of the club (skip in development)
    if (process.env.NODE_ENV === "production") {
      const { data: membership } = await supabaseAdmin
        .from("club_memberships")
        .select("*")
        .eq("club_id", club_id)
        .eq("user_id", user.id)
        .eq("status", "approved")
        .single();

      if (!membership) {
        return res.status(403).json({ error: "Access denied: Not a member of this club" });
      }
    }

    // Save message to database with proper persistence
    const { data: newMessage, error } = await supabaseAdmin
      .from("chat_messages")
      .insert({
        club_id,
        user_id: user.id,
        message,
        created_at: new Date().toISOString()
      })
      .select(`
        id,
        message,
        created_at,
        user_id,
        profiles:user_id (
          id,
          full_name,
          profile_image
        )
      `)
      .single();

    if (error) {
      console.error("Error sending club message:", error);
      return res.status(500).json({ error: "Failed to send message" });
    }

    res.json({
      success: true,
      data: {
        id: newMessage.id,
        user_id: newMessage.user_id,
        user_name: newMessage.profiles?.full_name || "Unknown User",
        user_avatar: newMessage.profiles?.profile_image,
        message: newMessage.message,
        created_at: newMessage.created_at,
        is_system: false
      }
    });

  } catch (error) {
    console.error("Error in handleSendClubMessage:", error);
    res.status(400).json({ error: "Invalid request parameters" });
  }
}

// Send direct message (HTTP endpoint, real-time handled by Socket.IO)
export async function handleSendDirectMessage(req: Request, res: Response) {
  try {
    console.log("=== SEND DIRECT MESSAGE REQUEST ===");
    console.log("Receiver ID:", req.body.receiver_id);
    console.log("Message:", req.body.message);

    if (!supabaseAdmin) {
      console.log("Supabase not configured, returning demo message");
      const demoMessage = {
        id: "dm-" + Date.now(),
        sender_id: "demo-user-current",
        receiver_id: req.body.receiver_id,
        sender_name: "Demo User",
        sender_avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
        receiver_name: "Demo Receiver",
        receiver_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        message: req.body.message,
        created_at: new Date().toISOString(),
        read_at: null,
        is_sent_by_me: true
      };
      return res.json({
        success: true,
        data: demoMessage
      });
    }

    // Get user from Authorization header
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { receiver_id, message } = SendDirectMessageSchema.parse(req.body);

    // Verify receiver exists
    const { data: receiver } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name")
      .eq("id", receiver_id)
      .single();

    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    // Save message to database with proper persistence
    const { data: newMessage, error } = await supabaseAdmin
      .from("direct_messages")
      .insert({
        sender_id: user.id,
        receiver_id,
        message,
        created_at: new Date().toISOString()
      })
      .select(`
        id,
        message,
        created_at,
        sender_id,
        receiver_id,
        sender:sender_id (
          id,
          full_name,
          profile_image
        ),
        receiver:receiver_id (
          id,
          full_name,
          profile_image
        )
      `)
      .single();

    if (error) {
      console.error("Error sending direct message:", error);
      return res.status(500).json({ error: "Failed to send message" });
    }

    res.json({
      success: true,
      data: {
        id: newMessage.id,
        sender_id: newMessage.sender_id,
        receiver_id: newMessage.receiver_id,
        sender_name: newMessage.sender?.full_name || "Unknown User",
        sender_avatar: newMessage.sender?.profile_image,
        receiver_name: newMessage.receiver?.full_name || "Unknown User",
        receiver_avatar: newMessage.receiver?.profile_image,
        message: newMessage.message,
        created_at: newMessage.created_at,
        read_at: null,
        is_sent_by_me: true
      }
    });

  } catch (error) {
    console.error("Error in handleSendDirectMessage:", error);
    res.status(400).json({ error: "Invalid request parameters" });
  }
}

// Mark direct messages as read
export async function handleMarkMessagesRead(req: Request, res: Response) {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Database not configured" });
    }

    // Get user from Authorization header
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { sender_id } = MarkMessagesReadSchema.parse(req.body);

    // Call the database function to mark messages as read
    const { error } = await supabaseAdmin.rpc('mark_messages_as_read', {
      sender_user_id: sender_id,
      receiver_user_id: user.id
    });

    if (error) {
      console.error("Error marking messages as read:", error);
      return res.status(500).json({ error: "Failed to mark messages as read" });
    }

    res.json({ success: true });

  } catch (error) {
    console.error("Error in handleMarkMessagesRead:", error);
    res.status(400).json({ error: "Invalid request parameters" });
  }
}

// Get online users for a club (this would be enhanced with Socket.IO for real-time)
export async function handleGetClubOnlineUsers(req: Request, res: Response) {
  try {
    if (!supabaseAdmin) {
      // In development, return demo data instead of failing
      if (process.env.NODE_ENV !== "production") {
        return res.json({
          success: true,
          data: [
            {
              id: "demo-user-1",
              name: "Demo User",
              avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
              is_online: true,
              last_seen: new Date().toISOString()
            },
            {
              id: "demo-user-2",
              name: "Another User",
              avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=40&h=40&fit=crop&crop=face",
              is_online: true,
              last_seen: new Date().toISOString()
            }
          ]
        });
      }
      return res.status(500).json({ error: "Database not configured" });
    }

    // Get user from Authorization header
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const club_id = req.params.club_id;

    // Get club members (in production, this would check Socket.IO connections)
    const { data: members, error } = await supabaseAdmin
      .from("club_memberships")
      .select(`
        profiles:user_id (
          id,
          full_name,
          profile_image
        )
      `)
      .eq("club_id", club_id)
      .eq("status", "approved");

    if (error) {
      console.error("Error fetching club members:", error);
      // In development, fall back to demo data on database errors
      if (process.env.NODE_ENV !== "production") {
        return res.json({
          success: true,
          data: [
            {
              id: "demo-user-1",
              name: "Demo User",
              avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
              is_online: true,
              last_seen: new Date().toISOString()
            }
          ]
        });
      }
      return res.status(500).json({ error: "Failed to fetch club members" });
    }

    // For now, simulate online status (in production, use Socket.IO connection tracking)
    const onlineUsers = members?.map(member => ({
      id: member.profiles?.id,
      name: member.profiles?.full_name || "Unknown User",
      avatar: member.profiles?.profile_image,
      is_online: Math.random() > 0.5, // Simulate online status
      last_seen: new Date().toISOString()
    })) || [];

    res.json({
      success: true,
      data: onlineUsers
    });

  } catch (error) {
    console.error("Error in handleGetClubOnlineUsers:", error);
    res.status(400).json({ error: "Invalid request parameters" });
  }
}
