import { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin, getUserFromToken, Database } from "../lib/supabase";
import { createNotification } from "./notifications";

// Helper function to get authenticated user (with demo fallback)
async function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // In development without Supabase, return a demo user
    if (process.env.NODE_ENV !== "production") {
      return {
        id: "demo-user-id",
        email: "demo@example.com",
      };
    }
    return null;
  }

  const user = await getUserFromToken(authHeader);
  if (!user && process.env.NODE_ENV !== "production") {
    // Fallback to demo user in development
    return {
      id: "demo-user-id",
      email: "demo@example.com",
    };
  }

  return user;
}

// Join request schema
const JoinActivityRequestSchema = z.object({
  message: z.string().max(500).optional(),
});

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
    "general",
  ]),
  date_time: z.string().datetime(), // ISO 8601 format
  location: z.string().min(1).max(255),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  max_participants: z.number().positive().default(10),
  difficulty_level: z
    .enum(["beginner", "intermediate", "advanced", "all"])
    .default("beginner"),
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
  limit: z
    .string()
    .transform((val) => parseInt(val) || 20)
    .optional(),
  offset: z
    .string()
    .transform((val) => parseInt(val) || 0)
    .optional(),
});

// GET /api/activities - List activities with filtering/search
// GET /api/activities/:id/participants - Get activity participants
export const handleGetActivityParticipants = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id: activityId } = req.params;

    // Demo mode - return mock participants if no database
    if (!supabaseAdmin) {
      const demoParticipants = [
        {
          id: "demo-participant-1",
          activity_id: activityId,
          user_id: "demo-user-1",
          status: "joined",
          joined_at: new Date().toISOString(),
          user: {
            id: "demo-user-1",
            full_name: "Sarah Johnson",
            profile_image:
              "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
          },
        },
        {
          id: "demo-participant-2",
          activity_id: activityId,
          user_id: "demo-user-2",
          status: "joined",
          joined_at: new Date(Date.now() - 86400000).toISOString(),
          user: {
            id: "demo-user-2",
            full_name: "Mike Chen",
            profile_image:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
          },
        },
      ];

      return res.json({
        success: true,
        data: demoParticipants,
      });
    }

    const { data: participants, error } = await supabaseAdmin
      .from("activity_participants")
      .select(
        `
        *,
        user:profiles!user_id (
          id,
          full_name,
          profile_image
        )
      `,
      )
      .eq("activity_id", activityId)
      .eq("status", "joined")
      .order("joined_at", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      if (error.code === "42P01") {
        // Table doesn't exist - return demo data
        return res.json({
          success: true,
          data: [],
        });
      }
      return res.status(500).json({
        success: false,
        error: "Failed to fetch activity participants",
      });
    }

    res.json({
      success: true,
      data: participants || [],
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch activity participants",
    });
  }
};

export const handleGetActivities = async (req: Request, res: Response) => {
  try {
    const filters = ListActivitiesSchema.parse(req.query);

    // Demo mode - return mock data if no database
    if (!supabaseAdmin) {
      const demoActivities = [
        {
          id: "demo-activity-1",
          title: "Morning Richmond Park Cycle",
          description:
            "Join us for a scenic morning ride through Richmond Park!",
          activity_type: "cycling",
          organizer_id: "demo-user-1",
          club_id: null,
          date_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          location: "Richmond Park, London",
          coordinates: { lat: 51.4513, lng: -0.2719 },
          max_participants: 15,
          current_participants: 8,
          difficulty_level: "intermediate",
          activity_image:
            "https://images.unsplash.com/photo-1558618047-3c8c76ca7f09?w=600&h=400&fit=crop",
          status: "upcoming",
          price_per_person: 0,
          created_at: new Date().toISOString(),
          organizer: {
            id: "demo-user-1",
            full_name: "Sarah Johnson",
            profile_image:
              "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=40&h=40&fit=crop&crop=face",
          },
        },
        {
          id: "demo-activity-2",
          title: "Beginner Rock Climbing",
          description:
            "Perfect for newcomers to climbing. All equipment provided!",
          activity_type: "climbing",
          organizer_id: "demo-user-2",
          club_id: "westway",
          date_time: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
          location: "Westway Climbing Centre, London",
          coordinates: { lat: 51.52, lng: -0.2367 },
          max_participants: 8,
          current_participants: 5,
          difficulty_level: "beginner",
          activity_image:
            "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&h=400&fit=crop",
          status: "upcoming",
          price_per_person: 15.0,
          created_at: new Date().toISOString(),
          organizer: {
            id: "demo-user-2",
            full_name: "Mike Chen",
            profile_image:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
          },
        },
      ];

      return res.json({
        success: true,
        data: demoActivities,
        pagination: {
          total: demoActivities.length,
          limit: filters.limit || 20,
          offset: filters.offset || 0,
        },
      });
    }

    // Build query with enhanced filtering
    let query = supabaseAdmin
      .from("activities")
      .select(
        `
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
        )
      `,
      )
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
      if (error.code === "42P01") {
        console.log("Database tables not set up yet, returning demo data");
        return res.json({
          success: true,
          data: [],
          pagination: { total: 0, limit, offset },
        });
      }
      return res.status(500).json({
        success: false,
        error: "Failed to fetch activities",
      });
    }

    // Add participant counts to activities
    const activitiesWithCounts = await Promise.all(
      (activities || []).map(async (activity) => {
        const { count: participantCount } = await supabaseAdmin
          .from("activity_participants")
          .select("*", { count: "exact" })
          .eq("activity_id", activity.id)
          .eq("status", "joined");

        return {
          ...activity,
          current_participants: participantCount || 0,
        };
      }),
    );

    res.json({
      success: true,
      data: activitiesWithCounts,
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid query parameters",
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to fetch activities",
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
          profile_image:
            "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=40&h=40&fit=crop&crop=face",
        },
        participants: [],
      };

      return res.json({
        success: true,
        data: demoActivity,
      });
    }

    const { data: activity, error } = await supabaseAdmin
      .from("activities")
      .select(
        `
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
      `,
      )
      .eq("id", id)
      .single();

    // Add current participants count
    if (activity) {
      const { count: participantCount } = await supabaseAdmin
        .from("activity_participants")
        .select("*", { count: "exact" })
        .eq("activity_id", activity.id)
        .eq("status", "joined");

      activity.current_participants = participantCount || 0;
    }

    if (error) {
      console.error("Database error:", error);
      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          error: "Activity not found",
        });
      }
      return res.status(500).json({
        success: false,
        error: "Failed to fetch activity",
      });
    }

    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch activity",
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
        error: "Authentication required",
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
        updated_at: new Date().toISOString(),
      };

      return res.status(201).json({
        success: true,
        data: demoActivity,
        message: "Activity created successfully (demo mode)",
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
          error:
            "You must be a member of this club to create activities for it",
        });
      }
    }

    // Ensure date_time is in the future
    const activityDateTime = new Date(validatedData.date_time);
    if (activityDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        error: "Activity date must be in the future",
      });
    }

    // Ensure profile exists before creating activity
    const { data: existingProfile, error: profileCheckError } =
      await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

    if (profileCheckError && profileCheckError.code === "PGRST116") {
      // Profile doesn't exist, create one
      console.log("Profile doesn't exist for user, creating one...");
      const { data: newProfile, error: profileCreateError } =
        await supabaseAdmin
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.email?.split("@")[0] || "User", // Use email prefix as name
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

      if (profileCreateError) {
        console.error("Profile creation error:", profileCreateError);
        return res.status(500).json({
          success: false,
          error: "Failed to create user profile",
          details: profileCreateError,
        });
      }
      console.log("Profile created successfully:", newProfile);
    } else if (profileCheckError) {
      console.error("Profile check error:", profileCheckError);
      return res.status(500).json({
        success: false,
        error: "Failed to verify user profile",
      });
    }

    const { data: newActivity, error } = await supabaseAdmin
      .from("activities")
      .insert({
        ...validatedData,
        organizer_id: user.id,
        status: "upcoming",
      })
      .select(
        `
        *,
        organizer:profiles!organizer_id (
          id,
          full_name,
          profile_image
        )
      `,
      )
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create activity",
        details: error,
      });
    }

    res.status(201).json({
      success: true,
      data: newActivity,
      message: "Activity created successfully",
    });
  } catch (error) {
    console.error("Create activity error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid activity data",
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to create activity",
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
        error: "Authentication required",
      });
    }

    if (!supabaseAdmin) {
      return res.json({
        success: true,
        data: { id, ...req.body },
        message: "Activity updated successfully (demo mode)",
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
        error: "Activity not found",
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
        error: "You don't have permission to update this activity",
      });
    }

    const updates = UpdateActivitySchema.parse(req.body);

    // Validate date_time if provided
    if (updates.date_time) {
      const activityDateTime = new Date(updates.date_time);
      if (activityDateTime <= new Date()) {
        return res.status(400).json({
          success: false,
          error: "Activity date must be in the future",
        });
      }
    }

    const { data: updatedActivity, error } = await supabaseAdmin
      .from("activities")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(
        `
        *,
        organizer:profiles!organizer_id (
          id,
          full_name,
          profile_image
        )
      `,
      )
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update activity",
      });
    }

    res.json({
      success: true,
      data: updatedActivity,
      message: "Activity updated successfully",
    });
  } catch (error) {
    console.error("Update activity error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid update data",
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to update activity",
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
        error: "Authentication required",
      });
    }

    if (!supabaseAdmin) {
      return res.json({
        success: true,
        message: "Activity cancelled successfully (demo mode)",
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
        error: "Activity not found",
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
        error: "You don't have permission to delete this activity",
      });
    }

    // Instead of deleting, mark as cancelled to preserve history
    const { error } = await supabaseAdmin
      .from("activities")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to cancel activity",
      });
    }

    res.json({
      success: true,
      message: "Activity cancelled successfully",
    });
  } catch (error) {
    console.error("Delete activity error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to cancel activity",
    });
  }
};

// POST /api/activities/:id/request-join - Request to join an activity (with waitlist)
export const handleRequestJoinActivity = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params; // activity id
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Authentication required" });
    }

    const { message } = JoinActivityRequestSchema.parse(req.body || {});

    if (!supabaseAdmin) {
      return res
        .status(201)
        .json({
          success: true,
          data: {
            id: `demo-${Date.now()}`,
            activity_id: id,
            user_id: user.id,
            status: "pending",
            message,
          },
        });
    }

    // Fetch activity and counts
    const { data: activity } = await supabaseAdmin
      .from("activities")
      .select("*")
      .eq("id", id)
      .eq("status", "upcoming")
      .single();

    if (!activity) {
      return res
        .status(404)
        .json({ success: false, error: "Activity not found or not open" });
    }

    // Prevent duplicate requests
    const { data: existing } = await supabaseAdmin
      .from("activity_participants")
      .select("*")
      .eq("activity_id", id)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      if (existing.status === "joined") {
        return res
          .status(400)
          .json({ success: false, error: "Already joined" });
      }
      if (existing.status === "pending") {
        return res
          .status(400)
          .json({ success: false, error: "Request already pending" });
      }
      if (existing.status === "waitlisted") {
        return res
          .status(400)
          .json({ success: false, error: "Already on waitlist" });
      }
    }

    // Count joined
    const { count: joinedCount } = await supabaseAdmin
      .from("activity_participants")
      .select("*", { count: "exact" })
      .eq("activity_id", id)
      .eq("status", "joined");

    const isFull =
      activity.max_participants &&
      joinedCount !== null &&
      joinedCount >= activity.max_participants;
    const status = isFull ? "waitlisted" : "pending";

    const { data: request, error: insertError } = await supabaseAdmin
      .from("activity_participants")
      .insert({ activity_id: id, user_id: user.id, status, message })
      .select("*")
      .single();

    if (insertError) {
      console.error("Join request error:", insertError);
      return res
        .status(500)
        .json({ success: false, error: "Failed to create join request" });
    }

    // Notify organizer
    try {
      await createNotification(
        activity.organizer_id,
        "activity_join_request",
        "New join request",
        "A user requested to join your activity",
        { activity_id: id, requester_id: user.id, status },
      );
    } catch (e) {
      console.warn("Notification error (join request):", e);
    }

    return res.status(201).json({ success: true, data: request });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Invalid request data",
          details: error.errors,
        });
    }
    console.error("Request-join error:", error);
    res.status(500).json({ success: false, error: "Failed to request join" });
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
        error: "Authentication required",
      });
    }

    if (!supabaseAdmin) {
      return res.json({
        success: true,
        message: "Successfully joined activity (demo mode)",
      });
    }

    // Check if activity exists and get current participants
    const { data: activity, error: activityError } = await supabaseAdmin
      .from("activities")
      .select(`*`)
      .eq("id", id)
      .eq("status", "upcoming")
      .single();

    // If activity is club-only, ensure requester is an approved member
    if (activity?.club_id) {
      const { data: membership } = await supabaseAdmin
        .from("club_memberships")
        .select("*")
        .eq("club_id", activity.club_id)
        .eq("user_id", user.id)
        .eq("status", "approved")
        .single();
      if (!membership) {
        return res.status(403).json({
          success: false,
          error: "You must be a member of this club to join its activities",
        });
      }
    }

    // Get current participant count separately
    if (activity && !activityError) {
      const { count: participantCount } = await supabaseAdmin
        .from("activity_participants")
        .select("*", { count: "exact" })
        .eq("activity_id", activity.id)
        .eq("status", "joined");

      activity.current_participants = participantCount || 0;
    }

    if (activityError || !activity) {
      return res.status(404).json({
        success: false,
        error: "Activity not found or not available for joining",
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
          error: "You are already a participant in this activity",
        });
      } else if (existingParticipation.status === "left") {
        // User previously left, allow them to rejoin
        const { error: rejoinError } = await supabaseAdmin
          .from("activity_participants")
          .update({
            status: "joined",
            joined_at: new Date().toISOString(),
          })
          .eq("activity_id", id)
          .eq("user_id", user.id);

        if (rejoinError) {
          console.error("Database error:", rejoinError);
          return res.status(500).json({
            success: false,
            error: "Failed to rejoin activity",
          });
        }

        return res.json({
          success: true,
          message: "Successfully rejoined activity",
        });
      }
    }

    // Check if activity is full
    const currentCount = activity.current_participants || 0;
    if (
      activity.max_participants &&
      currentCount >= activity.max_participants
    ) {
      return res.status(400).json({
        success: false,
        error: "Activity is full",
      });
    }

    // Check if activity date has passed
    const activityDateTime = new Date(activity.date_time);
    if (activityDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        error: "Cannot join past activities",
      });
    }

    // Add user to activity
    const { error: joinError } = await supabaseAdmin
      .from("activity_participants")
      .insert({
        activity_id: id,
        user_id: user.id,
        status: "joined",
      });

    if (joinError) {
      console.error("Database error:", joinError);
      return res.status(500).json({
        success: false,
        error: "Failed to join activity",
      });
    }

    // Create notification for organizer (if different from user)
    if (activity.organizer_id !== user.id) {
      await createNotification(
        activity.organizer_id,
        "activity_joined",
        "New participant joined your activity",
        `Someone joined "${activity.title}"`,
        {
          activity_id: id,
          participant_id: user.id,
          activity_title: activity.title,
        },
      );
    }

    res.json({
      success: true,
      message: "Successfully joined activity",
    });
  } catch (error) {
    console.error("Join activity error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to join activity",
    });
  }
};

// DELETE /api/activities/:id/leave - Leave an activity
export const handleApproveActivityRequest = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id, requestId } = req.params;
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Authentication required" });
    }

    if (!supabaseAdmin) {
      return res.json({
        success: true,
        message: "Request approved (demo mode)",
      });
    }

    // Verify organizer owns activity
    const { data: activity } = await supabaseAdmin
      .from("activities")
      .select("*")
      .eq("id", id)
      .single();

    if (!activity || activity.organizer_id !== user.id) {
      return res
        .status(403)
        .json({ success: false, error: "Only the organizer can approve" });
    }

    // Check capacity
    const { count: joinedCount } = await supabaseAdmin
      .from("activity_participants")
      .select("*", { count: "exact" })
      .eq("activity_id", id)
      .eq("status", "joined");

    const isFull =
      activity.max_participants &&
      joinedCount !== null &&
      joinedCount >= activity.max_participants;
    if (isFull) {
      return res
        .status(400)
        .json({ success: false, error: "Activity is full" });
    }

    const { data: updated, error } = await supabaseAdmin
      .from("activity_participants")
      .update({ status: "joined", joined_at: new Date().toISOString() })
      .eq("id", requestId)
      .eq("activity_id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Approve request error:", error);
      return res
        .status(500)
        .json({ success: false, error: "Failed to approve request" });
    }

    try {
      await createNotification(
        updated.user_id,
        "activity_request_approved",
        "Request approved",
        "Your request was approved",
        { activity_id: id },
      );
    } catch {}

    return res.json({
      success: true,
      data: updated,
      message: "Request approved",
    });
  } catch (error) {
    console.error("Approve request error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to approve request" });
  }
};

export const handleDenyActivityRequest = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id, requestId } = req.params;
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Authentication required" });
    }

    if (!supabaseAdmin) {
      return res.json({ success: true, message: "Request denied (demo mode)" });
    }

    // Verify organizer
    const { data: activity } = await supabaseAdmin
      .from("activities")
      .select("*")
      .eq("id", id)
      .single();

    if (!activity || activity.organizer_id !== user.id) {
      return res
        .status(403)
        .json({ success: false, error: "Only the organizer can deny" });
    }

    const { error } = await supabaseAdmin
      .from("activity_participants")
      .update({ status: "denied" })
      .eq("id", requestId)
      .eq("activity_id", id);

    if (error) {
      console.error("Deny request error:", error);
      return res
        .status(500)
        .json({ success: false, error: "Failed to deny request" });
    }

    return res.json({ success: true, message: "Request denied" });
  } catch (error) {
    console.error("Deny request error:", error);
    res.status(500).json({ success: false, error: "Failed to deny request" });
  }
};

export const handleLeaveActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // activity id
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (!supabaseAdmin) {
      return res.json({
        success: true,
        message: "Successfully left activity (demo mode)",
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
        error: "You are not a participant in this activity",
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
        error: "Failed to leave activity",
      });
    }

    res.json({
      success: true,
      message: "Successfully left activity",
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to leave activity",
    });
  }
};

// GET /api/activities/:id/participants - Get participant list
// GET /api/activities/user/history - Get user's past activities
export const handleGetUserActivityHistory = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const { status = "completed", limit = 20, offset = 0 } = req.query;

    if (!supabaseAdmin) {
      // Demo mode - return mock past activities
      const demoHistory = [
        {
          id: "demo-past-1",
          title: "Morning Cycle at Richmond Park",
          description: "Great morning ride with the cycling group",
          activity_type: "cycling",
          date_time: new Date(Date.now() - 86400000 * 7).toISOString(), // 1 week ago
          location: "Richmond Park",
          organizer_name: "Sarah Johnson",
          participation_status: "completed",
          user_rating: 4.5,
          review_count: 3,
        },
        {
          id: "demo-past-2",
          title: "Climbing Session at Westway",
          description: "Indoor climbing session for beginners",
          activity_type: "climbing",
          date_time: new Date(Date.now() - 86400000 * 14).toISOString(), // 2 weeks ago
          location: "Westway Climbing Centre",
          organizer_name: "Mike Chen",
          participation_status: "completed",
          user_rating: 5.0,
          review_count: 2,
        },
      ];

      return res.json({
        success: true,
        data: demoHistory,
        pagination: { total: demoHistory.length, limit: 20, offset: 0 },
      });
    }

    // Get user's activity history from database
    const { data: historyData, error } = await supabaseAdmin.rpc(
      "get_user_activity_history",
      {
        user_uuid: user.id,
        activity_status: status,
      },
    );

    if (error) {
      console.error("Error fetching user activity history:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch activity history",
      });
    }

    // Apply pagination
    const startIndex = parseInt(offset as string) || 0;
    const pageSize = parseInt(limit as string) || 20;
    const paginatedData =
      historyData?.slice(startIndex, startIndex + pageSize) || [];

    res.json({
      success: true,
      data: paginatedData,
      pagination: {
        total: historyData?.length || 0,
        limit: pageSize,
        offset: startIndex,
      },
    });
  } catch (error) {
    console.error("Get user activity history error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch activity history",
    });
  }
};

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
            profile_image:
              "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=40&h=40&fit=crop&crop=face",
          },
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
            profile_image:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
          },
        },
      ];

      return res.json({
        success: true,
        data: demoParticipants,
      });
    }

    // Get all active participants for the activity
    const { data: participants, error } = await supabaseAdmin
      .from("activity_participants")
      .select(
        `
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
      `,
      )
      .eq("activity_id", id)
      .eq("status", "joined")
      .order("joined_at", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch participants",
      });
    }

    res.json({
      success: true,
      data: participants || [],
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch participants",
    });
  }
};
