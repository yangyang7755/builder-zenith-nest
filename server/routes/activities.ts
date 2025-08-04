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
      // Default to showing only upcoming activities for explore page
      query = query.in("status", ["upcoming", "ongoing"]);
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

// GET /api/activities/:id - Get activity details
export const handleGetActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!supabaseAdmin) {
      // Demo mode - return mock activity
      const demoActivity = {
        id: id,
        title: "Demo Activity",
        description: "This is a demo activity for development",
        activity_type: "cycling",
        organizer_id: "demo-user-1",
        club_id: null,
        date_time: new Date(Date.now() + 86400000).toISOString(),
        location: "Demo Location",
        coordinates: { lat: 51.5074, lng: -0.1278 },
        max_participants: 10,
        current_participants: 3,
        difficulty_level: "beginner",
        status: "upcoming",
        price_per_person: 0,
        created_at: new Date().toISOString(),
        organizer: {
          id: "demo-user-1",
          full_name: "Demo User",
          profile_image: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=40&h=40&fit=crop&crop=face"
        },
        participants: []
      };

      return res.json({
        success: true,
        data: demoActivity
      });
    }

    const { data: activity, error } = await supabaseAdmin
      .from("activities")
      .select(`
        *,
        organizer:profiles!organizer_id (
          id,
          full_name,
          profile_image,
          email
        ),
        club:clubs (
          id,
          name,
          profile_image
        ),
        participants:activity_participants!inner (
          id,
          joined_at,
          status,
          user:profiles (
            id,
            full_name,
            profile_image
          )
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Database error:", error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: "Activity not found"
        });
      }
      return res.status(500).json({
        success: false,
        error: "Failed to fetch activity"
      });
    }

    res.json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch activity"
    });
  }
};

// POST /api/activities - Create new activities
export const handleCreateActivity = async (req: Request, res: Response) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const validatedData = ActivitySchema.parse(req.body);

    // Demo mode support
    if (!supabaseAdmin) {
      const demoActivity = {
        id: `demo-activity-${Date.now()}`,
        ...validatedData,
        organizer_id: user.id,
        current_participants: 0,
        status: "upcoming",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return res.status(201).json({
        success: true,
        data: demoActivity,
        message: "Activity created successfully (demo mode)"
      });
    }

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
        return res.status(403).json({
          success: false,
          error: "You must be a member of this club to create activities for it",
        });
      }
    }

    // Ensure date_time is in the future
    const activityDateTime = new Date(validatedData.date_time);
    if (activityDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        error: "Activity date must be in the future"
      });
    }

    const { data: newActivity, error } = await supabaseAdmin
      .from("activities")
      .insert({
        ...validatedData,
        organizer_id: user.id,
        status: "upcoming"
      })
      .select(`
        *,
        organizer:profiles!organizer_id (
          id,
          full_name,
          profile_image
        )
      `)
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create activity"
      });
    }

    res.status(201).json({
      success: true,
      data: newActivity,
      message: "Activity created successfully"
    });

  } catch (error) {
    console.error("Create activity error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid activity data",
        details: error.errors
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to create activity"
    });
  }
};

// PUT /api/activities/:id - Update activity (for organizers)
export const handleUpdateActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    if (!supabaseAdmin) {
      return res.json({
        success: true,
        data: { id, ...req.body },
        message: "Activity updated successfully (demo mode)"
      });
    }

    // First check if activity exists and user has permission
    const { data: activity } = await supabaseAdmin
      .from("activities")
      .select("*, club:clubs(id)")
      .eq("id", id)
      .single();

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: "Activity not found"
      });
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
      return res.status(403).json({
        success: false,
        error: "You don't have permission to update this activity"
      });
    }

    const updates = UpdateActivitySchema.parse(req.body);

    // Validate date_time if provided
    if (updates.date_time) {
      const activityDateTime = new Date(updates.date_time);
      if (activityDateTime <= new Date()) {
        return res.status(400).json({
          success: false,
          error: "Activity date must be in the future"
        });
      }
    }

    const { data: updatedActivity, error } = await supabaseAdmin
      .from("activities")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(`
        *,
        organizer:profiles!organizer_id (
          id,
          full_name,
          profile_image
        )
      `)
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update activity"
      });
    }

    res.json({
      success: true,
      data: updatedActivity,
      message: "Activity updated successfully"
    });

  } catch (error) {
    console.error("Update activity error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid update data",
        details: error.errors
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to update activity"
    });
  }
};

// DELETE /api/activities/:id - Cancel activity
export const handleDeleteActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    if (!supabaseAdmin) {
      return res.json({
        success: true,
        message: "Activity cancelled successfully (demo mode)"
      });
    }

    // Check if activity exists and user has permission
    const { data: activity } = await supabaseAdmin
      .from("activities")
      .select("*")
      .eq("id", id)
      .single();

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: "Activity not found"
      });
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
      return res.status(403).json({
        success: false,
        error: "You don't have permission to delete this activity"
      });
    }

    // Instead of deleting, mark as cancelled to preserve history
    const { error } = await supabaseAdmin
      .from("activities")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to cancel activity"
      });
    }

    res.json({
      success: true,
      message: "Activity cancelled successfully"
    });

  } catch (error) {
    console.error("Delete activity error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to cancel activity"
    });
  }
};

// POST /api/activities/:id/join - Join an activity
export const handleJoinActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // activity id
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    if (!supabaseAdmin) {
      return res.json({
        success: true,
        message: "Successfully joined activity (demo mode)"
      });
    }

    // Check if activity exists and get current participants
    const { data: activity, error: activityError } = await supabaseAdmin
      .from("activities")
      .select(`
        *,
        current_participants:activity_participants!inner(count)
      `)
      .eq("id", id)
      .eq("status", "upcoming")
      .single();

    if (activityError || !activity) {
      return res.status(404).json({
        success: false,
        error: "Activity not found or not available for joining"
      });
    }

    // Check if user already joined (including those who left)
    const { data: existingParticipation } = await supabaseAdmin
      .from("activity_participants")
      .select("*")
      .eq("activity_id", id)
      .eq("user_id", user.id)
      .single();

    if (existingParticipation) {
      if (existingParticipation.status === "joined") {
        return res.status(400).json({
          success: false,
          error: "You are already a participant in this activity"
        });
      } else if (existingParticipation.status === "left") {
        // User previously left, allow them to rejoin
        const { error: rejoinError } = await supabaseAdmin
          .from("activity_participants")
          .update({
            status: "joined",
            joined_at: new Date().toISOString()
          })
          .eq("activity_id", id)
          .eq("user_id", user.id);

        if (rejoinError) {
          console.error("Database error:", rejoinError);
          return res.status(500).json({
            success: false,
            error: "Failed to rejoin activity"
          });
        }

        return res.json({
          success: true,
          message: "Successfully rejoined activity"
        });
      }
    }

    // Check if activity is full
    if (activity.max_participants && activity.current_participants >= activity.max_participants) {
      return res.status(400).json({
        success: false,
        error: "Activity is full"
      });
    }

    // Check if activity date has passed
    const activityDateTime = new Date(activity.date_time);
    if (activityDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        error: "Cannot join past activities"
      });
    }

    // Add user to activity
    const { error: joinError } = await supabaseAdmin
      .from("activity_participants")
      .insert({
        activity_id: id,
        user_id: user.id,
        status: "joined"
      });

    if (joinError) {
      console.error("Database error:", joinError);
      return res.status(500).json({
        success: false,
        error: "Failed to join activity"
      });
    }

    res.json({
      success: true,
      message: "Successfully joined activity"
    });

  } catch (error) {
    console.error("Join activity error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to join activity"
    });
  }
};

// DELETE /api/activities/:id/leave - Leave an activity
export const handleLeaveActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // activity id
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    if (!supabaseAdmin) {
      return res.json({
        success: true,
        message: "Successfully left activity (demo mode)"
      });
    }

    // Check if user is actually a participant
    const { data: participation } = await supabaseAdmin
      .from("activity_participants")
      .select("*")
      .eq("activity_id", id)
      .eq("user_id", user.id)
      .eq("status", "joined")
      .single();

    if (!participation) {
      return res.status(400).json({
        success: false,
        error: "You are not a participant in this activity"
      });
    }

    // Update status to 'left' instead of deleting
    const { error } = await supabaseAdmin
      .from("activity_participants")
      .update({ status: "left" })
      .eq("activity_id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to leave activity"
      });
    }

    res.json({
      success: true,
      message: "Successfully left activity"
    });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to leave activity"
    });
  }
};

// GET /api/activities/:id/participants - Get participant list
export const handleGetParticipants = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // activity id

    if (!supabaseAdmin) {
      // Demo mode participants
      const demoParticipants = [
        {
          id: "demo-participant-1",
          user_id: "demo-user-1",
          activity_id: id,
          joined_at: new Date().toISOString(),
          status: "joined",
          user: {
            id: "demo-user-1",
            full_name: "Sarah Johnson",
            profile_image: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=40&h=40&fit=crop&crop=face"
          }
        },
        {
          id: "demo-participant-2",
          user_id: "demo-user-2",
          activity_id: id,
          joined_at: new Date().toISOString(),
          status: "joined",
          user: {
            id: "demo-user-2",
            full_name: "Mike Chen",
            profile_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
          }
        }
      ];

      return res.json({
        success: true,
        data: demoParticipants
      });
    }

    // Get all active participants for the activity
    const { data: participants, error } = await supabaseAdmin
      .from("activity_participants")
      .select(`
        id,
        user_id,
        activity_id,
        joined_at,
        status,
        user:profiles (
          id,
          full_name,
          profile_image,
          email
        )
      `)
      .eq("activity_id", id)
      .eq("status", "joined")
      .order("joined_at", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch participants"
      });
    }

    res.json({
      success: true,
      data: participants || []
    });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch participants"
    });
  }
};
