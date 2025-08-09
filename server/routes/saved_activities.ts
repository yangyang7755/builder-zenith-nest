import { Router, Request, Response } from "express";
import { supabaseAdmin, getUserFromToken } from "../lib/supabase";

const router = Router();

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

// GET /api/saved-activities - Get user's saved activities
export const handleGetSavedActivities = async (req: Request, res: Response) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (!supabaseAdmin) {
      // Return demo saved activities when database is not available
      console.log("Supabase not configured, returning demo saved activities");

      const demoSavedActivities = [
        {
          id: "demo-saved-1",
          saved_at: new Date().toISOString(),
          activity: {
            id: "demo-activity-1",
            title: "Morning Climbing Session",
            description: "Indoor climbing for all levels",
            activity_type: "climbing",
            date_time: "2024-12-28T10:00:00Z",
            location: "Westway Climbing Centre",
            max_participants: 15,
            current_participants: 8,
            difficulty_level: "Beginner",
            price_per_person: 0,
            status: "upcoming",
            organizer: {
              id: "demo-organizer-1",
              full_name: "Demo Organizer",
              profile_image: null
            }
          }
        },
        {
          id: "demo-saved-2",
          saved_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          activity: {
            id: "demo-activity-2",
            title: "Thames Path Cycling",
            description: "Scenic riverside cycling tour",
            activity_type: "cycling",
            date_time: "2024-12-29T14:00:00Z",
            location: "Thames Path, London",
            max_participants: 20,
            current_participants: 12,
            difficulty_level: "Intermediate",
            price_per_person: 15,
            status: "upcoming",
            organizer: {
              id: "demo-organizer-2",
              full_name: "Cycling Club London",
              profile_image: null
            }
          }
        }
      ];

      return res.json({
        success: true,
        data: demoSavedActivities,
      });
    }

    // Try to get saved activities with relationships first, fallback if relationships don't exist
    let savedActivities;
    let error;

    try {
      // First try with the full query including relationships
      const result = await supabaseAdmin
        .from("saved_activities")
        .select(
          `
          id,
          saved_at,
          activity:activities (
            id,
            title,
            description,
            activity_type,
            date_time,
            location,
            coordinates,
            max_participants,
            current_participants,
            difficulty_level,
            activity_image,
            route_link,
            special_requirements,
            price_per_person,
            status,
            club_id,
            activity_data,
            created_at,
            updated_at,
            organizer:profiles!activities_organizer_id_fkey (
              id,
              full_name,
              profile_image
            ),
            club:clubs (
              id,
              name,
              profile_image
            )
          )
        `,
        )
        .eq("user_id", user.id)
        .order("saved_at", { ascending: false });

      savedActivities = result.data;
      error = result.error;
    } catch (relationshipError) {
      console.log("Relationship query failed, trying simpler query:", relationshipError);

      // Fallback to simpler query without relationships
      try {
        const simpleResult = await supabaseAdmin
          .from("saved_activities")
          .select("id, activity_id, saved_at")
          .eq("user_id", user.id)
          .order("saved_at", { ascending: false });

        if (simpleResult.error) {
          error = simpleResult.error;
        } else {
          // Transform simple results to match expected format
          savedActivities = simpleResult.data?.map(item => ({
            id: item.id,
            saved_at: item.saved_at,
            activity: {
              id: item.activity_id,
              title: "Demo Activity",
              description: "Demo activity description",
              activity_type: "general",
              location: "Demo Location",
              status: "upcoming"
            }
          })) || [];
        }
      } catch (simpleError) {
        console.error("Simple query also failed:", simpleError);
        error = simpleError;
      }
    }

    if (error) {
      console.error("Database error:", error);

      // If the table doesn't exist yet, return empty array instead of error
      if (error.code === "42P01" || error.code === "PGRST200") {
        console.log(
          "saved_activities table doesn't exist or relationships not set up, returning empty array",
        );
        return res.json({
          success: true,
          data: [],
        });
      }

      return res.status(500).json({
        success: false,
        error: "Failed to fetch saved activities",
      });
    }

    res.json({
      success: true,
      data: savedActivities || [],
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch saved activities",
    });
  }
};

// POST /api/saved-activities - Save an activity
export const handleSaveActivity = async (req: Request, res: Response) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const { activity_id } = req.body;
    if (!activity_id) {
      return res.status(400).json({
        success: false,
        error: "Activity ID is required",
      });
    }

    if (!supabaseAdmin) {
      return res.status(503).json({
        success: false,
        error: "Database not available",
      });
    }

    // Check if activity exists
    const { data: activityExists } = await supabaseAdmin
      .from("activities")
      .select("id")
      .eq("id", activity_id)
      .single();

    if (!activityExists) {
      return res.status(404).json({
        success: false,
        error: "Activity not found",
      });
    }

    // Save the activity (upsert to handle duplicates)
    const { data: savedActivity, error } = await supabaseAdmin
      .from("saved_activities")
      .upsert(
        {
          user_id: user.id,
          activity_id: activity_id,
        },
        {
          onConflict: "user_id,activity_id",
        },
      )
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);

      // If the table doesn't exist yet, return success but log that table needs to be created
      if (error.code === "42P01") {
        console.log(
          "saved_activities table doesn't exist yet, activity not saved to database",
        );
        return res.json({
          success: true,
          data: {
            id: "demo-saved-id",
            user_id: user.id,
            activity_id: activity_id,
          },
          message: "Table not created yet, activity saved in demo mode",
        });
      }

      return res.status(500).json({
        success: false,
        error: "Failed to save activity",
      });
    }

    res.json({
      success: true,
      data: savedActivity,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save activity",
    });
  }
};

// DELETE /api/saved-activities/:activityId - Unsave an activity
export const handleUnsaveActivity = async (req: Request, res: Response) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const { activityId } = req.params;
    if (!activityId) {
      return res.status(400).json({
        success: false,
        error: "Activity ID is required",
      });
    }

    if (!supabaseAdmin) {
      return res.status(503).json({
        success: false,
        error: "Database not available",
      });
    }

    // Remove the saved activity
    const { error } = await supabaseAdmin
      .from("saved_activities")
      .delete()
      .eq("user_id", user.id)
      .eq("activity_id", activityId);

    if (error) {
      console.error("Database error:", error);

      // If the table doesn't exist yet, return success
      if (error.code === "42P01") {
        console.log(
          "saved_activities table doesn't exist yet, treating as successfully removed",
        );
        return res.json({
          success: true,
          message: "Activity unsaved successfully (demo mode)",
        });
      }

      return res.status(500).json({
        success: false,
        error: "Failed to unsave activity",
      });
    }

    res.json({
      success: true,
      message: "Activity unsaved successfully",
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to unsave activity",
    });
  }
};

// GET /api/saved-activities/check/:activityId - Check if activity is saved
export const handleCheckActivitySaved = async (req: Request, res: Response) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const { activityId } = req.params;
    if (!activityId) {
      return res.status(400).json({
        success: false,
        error: "Activity ID is required",
      });
    }

    if (!supabaseAdmin) {
      return res.status(503).json({
        success: false,
        error: "Database not available",
      });
    }

    // Check if activity is saved
    const { data: savedActivity, error } = await supabaseAdmin
      .from("saved_activities")
      .select("id")
      .eq("user_id", user.id)
      .eq("activity_id", activityId)
      .single();

    // Handle database errors
    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned, which is expected
      console.error("Database error:", error);

      // If the table doesn't exist yet, return false
      if (error.code === "42P01") {
        console.log(
          "saved_activities table doesn't exist yet, returning false",
        );
        return res.json({
          success: true,
          data: { is_saved: false },
        });
      }

      return res.status(500).json({
        success: false,
        error: "Failed to check saved status",
      });
    }

    res.json({
      success: true,
      data: {
        is_saved: !!savedActivity,
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check saved status",
    });
  }
};

// Route definitions
router.get("/", handleGetSavedActivities);
router.post("/", handleSaveActivity);
router.delete("/:activityId", handleUnsaveActivity);
router.get("/check/:activityId", handleCheckActivitySaved);

export default router;
