import { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin, getUserFromToken, Database } from "../lib/supabase";

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

// Enhanced Activity schema for validation
const ActivitySchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  activity_type: z.enum([
    "cycling",
    "climbing",
    "running",
    "hiking",
    "skiing",
    "surfing",
    "tennis",
    "general"
  ]),
  date_time: z.string().datetime(), // ISO 8601 format
  location: z.string().min(1).max(255),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  max_participants: z.number().positive().default(10),
  difficulty_level: z.enum(["beginner", "intermediate", "advanced", "all"]).default("beginner"),
  activity_image: z.string().url().optional(),
  route_link: z.string().url().optional(),
  special_requirements: z.string().optional(),
  price_per_person: z.number().min(0).default(0),
  club_id: z.string().uuid().optional(),
  activity_data: z.record(z.any()).optional(), // Flexible JSONB data
});

// Schema for updating activities (all fields optional except organizer validation)
const UpdateActivitySchema = ActivitySchema.partial();

// Schema for listing activities with filters
const ListActivitiesSchema = z.object({
  club_id: z.string().uuid().optional(),
  activity_type: z.string().optional(),
  location: z.string().optional(),
  difficulty_level: z.string().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  status: z.enum(["upcoming", "ongoing", "completed", "cancelled"]).optional(),
  limit: z.string().transform(val => parseInt(val) || 20).optional(),
  offset: z.string().transform(val => parseInt(val) || 0).optional(),
});

// GET /api/activities - List activities with filtering/search
export const handleGetActivities = async (req: Request, res: Response) => {
  try {
    const filters = ListActivitiesSchema.parse(req.query);

    // Demo mode - return mock data if no database
    if (!supabaseAdmin) {
      const demoActivities = [
        {
          id: "demo-activity-1",
          title: "Morning Richmond Park Cycle",
          description: "Join us for a scenic morning ride through Richmond Park!",
          activity_type: "cycling",
          organizer_id: "demo-user-1",
          club_id: null,
          date_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          location: "Richmond Park, London",
          coordinates: { lat: 51.4513, lng: -0.2719 },
          max_participants: 15,
          current_participants: 8,
          difficulty_level: "intermediate",
          activity_image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7f09?w=600&h=400&fit=crop",
          status: "upcoming",
          price_per_person: 0,
          created_at: new Date().toISOString(),
          organizer: {
            id: "demo-user-1",
            full_name: "Sarah Johnson",
            profile_image: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=40&h=40&fit=crop&crop=face"
          }
        },
        {
          id: "demo-activity-2",
          title: "Beginner Rock Climbing",
          description: "Perfect for newcomers to climbing. All equipment provided!",
          activity_type: "climbing",
          organizer_id: "demo-user-2",
          club_id: "westway",
          date_time: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
          location: "Westway Climbing Centre, London",
          coordinates: { lat: 51.5200, lng: -0.2367 },
          max_participants: 8,
          current_participants: 5,
          difficulty_level: "beginner",
          activity_image: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&h=400&fit=crop",
          status: "upcoming",
          price_per_person: 15.00,
          created_at: new Date().toISOString(),
          organizer: {
            id: "demo-user-2",
            full_name: "Mike Chen",
            profile_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
          }
        }
      ];

      return res.json({
        success: true,
        data: demoActivities,
        pagination: {
          total: demoActivities.length,
          limit: filters.limit || 20,
          offset: filters.offset || 0
        }
      });
    }

    // Build query with enhanced filtering
    let query = supabaseAdmin
      .from("activities")
      .select(`
        *,
        organizer:profiles!organizer_id (
          id,
          full_name,
          profile_image
        ),
        club:clubs (
          id,
          name,
          profile_image
        ),
        current_participants:activity_participants(count)
      `)
      .order("date_time", { ascending: true });

    // Apply filters
    if (filters.club_id) {
      query = query.eq("club_id", filters.club_id);
    }

    if (filters.activity_type) {
      query = query.eq("activity_type", filters.activity_type);
    }

    if (filters.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }

    if (filters.difficulty_level) {
      query = query.eq("difficulty_level", filters.difficulty_level);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    } else {
      // Default to showing only upcoming activities
      query = query.eq("status", "upcoming");
    }

    if (filters.date_from) {
      query = query.gte("date_time", filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte("date_time", filters.date_to);
    }

    // Apply pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data: activities, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      // If table doesn't exist, return demo data
      if (error.code === '42P01') {
        console.log("Database tables not set up yet, returning demo data");
        return res.json({
          success: true,
          data: [],
          pagination: { total: 0, limit, offset }
        });
      }
      return res.status(500).json({
        success: false,
        error: "Failed to fetch activities"
      });
    }

    res.json({
      success: true,
      data: activities || [],
      pagination: {
        total: count || 0,
        limit,
        offset
      }
    });

  } catch (error) {
    console.error("Server error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid query parameters",
        details: error.errors
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to fetch activities"
    });
  }
};

export const handleCreateActivity = async (req: Request, res: Response) => {
  try {
    // Get user from auth token
    const user = await getUserFromToken(req.headers.authorization || "");
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const validatedData = ActivitySchema.parse(req.body);

    // If club_id is provided, verify user is a member of that club
    if (validatedData.club_id) {
      const { data: membership } = await supabaseAdmin
        .from("club_memberships")
        .select("*")
        .eq("club_id", validatedData.club_id)
        .eq("user_id", user.id)
        .eq("status", "approved")
        .single();

      if (!membership) {
        return res
          .status(403)
          .json({
            error:
              "You must be a member of this club to create activities for it",
          });
      }
    }

    const { data: newActivity, error } = await supabaseAdmin
      .from("activities")
      .insert({
        ...validatedData,
        organizer_id: user.id,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to create activity" });
    }

    res.status(201).json(newActivity);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ error: "Invalid activity data", details: error.errors });
    } else {
      console.error("Server error:", error);
      res.status(500).json({ error: "Failed to create activity" });
    }
  }
};

export const handleUpdateActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getUserFromToken(req.headers.authorization || "");

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // First check if activity exists and user has permission
    const { data: activity } = await supabaseAdmin
      .from("activities")
      .select("*, club:clubs(id)")
      .eq("id", id)
      .single();

    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    // Check if user is the organizer or a club manager
    let hasPermission = activity.organizer_id === user.id;

    if (!hasPermission && activity.club_id) {
      const { data: membership } = await supabaseAdmin
        .from("club_memberships")
        .select("*")
        .eq("club_id", activity.club_id)
        .eq("user_id", user.id)
        .eq("role", "manager")
        .eq("status", "approved")
        .single();

      hasPermission = !!membership;
    }

    if (!hasPermission) {
      return res
        .status(403)
        .json({ error: "You don't have permission to update this activity" });
    }

    const updates = ActivitySchema.partial().parse(req.body);

    const { data: updatedActivity, error } = await supabaseAdmin
      .from("activities")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to update activity" });
    }

    res.json(updatedActivity);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ error: "Invalid update data", details: error.errors });
    } else {
      console.error("Server error:", error);
      res.status(500).json({ error: "Failed to update activity" });
    }
  }
};

export const handleDeleteActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getUserFromToken(req.headers.authorization || "");

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check if activity exists and user has permission
    const { data: activity } = await supabaseAdmin
      .from("activities")
      .select("*")
      .eq("id", id)
      .single();

    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    // Check if user is the organizer or a club manager
    let hasPermission = activity.organizer_id === user.id;

    if (!hasPermission && activity.club_id) {
      const { data: membership } = await supabaseAdmin
        .from("club_memberships")
        .select("*")
        .eq("club_id", activity.club_id)
        .eq("user_id", user.id)
        .eq("role", "manager")
        .eq("status", "approved")
        .single();

      hasPermission = !!membership;
    }

    if (!hasPermission) {
      return res
        .status(403)
        .json({ error: "You don't have permission to delete this activity" });
    }

    const { error } = await supabaseAdmin
      .from("activities")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to delete activity" });
    }

    res.json({ message: "Activity deleted successfully" });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to delete activity" });
  }
};

export const handleJoinActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // activity id
    const user = await getUserFromToken(req.headers.authorization || "");

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Database not configured" });
    }

    // Check if activity exists
    const { data: activity, error: activityError } = await supabaseAdmin
      .from("activities")
      .select("*, activity_participants(user_id)")
      .eq("id", id)
      .single();

    if (activityError || !activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    // Check if user already joined
    const alreadyJoined = activity.activity_participants.some(
      (p: any) => p.user_id === user.id
    );

    if (alreadyJoined) {
      return res.status(400).json({ error: "Already joined this activity" });
    }

    // Check if activity is full
    if (activity.max_participants &&
        activity.activity_participants.length >= activity.max_participants) {
      return res.status(400).json({ error: "Activity is full" });
    }

    // Add user to activity
    const { error: joinError } = await supabaseAdmin
      .from("activity_participants")
      .insert({
        activity_id: id,
        user_id: user.id,
      });

    if (joinError) {
      console.error("Database error:", joinError);
      return res.status(500).json({ error: "Failed to join activity" });
    }

    res.status(200).json({ message: "Successfully joined activity" });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to join activity" });
  }
};

export const handleLeaveActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // activity id
    const user = await getUserFromToken(req.headers.authorization || "");

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Database not configured" });
    }

    // Remove user from activity
    const { error } = await supabaseAdmin
      .from("activity_participants")
      .delete()
      .eq("activity_id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to leave activity" });
    }

    res.status(200).json({ message: "Successfully left activity" });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to leave activity" });
  }
};
