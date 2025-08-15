import { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin, getUserFromToken } from "../lib/supabase";

// Review schema for validation
const ReviewSchema = z.object({
  activity_id: z.string().uuid(),
  reviewee_id: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export const handleGetReviews = async (req: Request, res: Response) => {
  try {
    console.log("=== GET REVIEWS REQUEST ===");
    console.log("Query params:", req.query);

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.log("Supabase not configured, returning demo reviews");
      const demoReviews = [
        {
          id: "demo-review-1",
          activity_id: req.query.activity_id || "demo-activity-1",
          reviewer_id: "demo-user-1",
          reviewee_id: req.query.user_id || "demo-organizer-1",
          rating: 5,
          comment: "Excellent activity! Well organized and fun.",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          reviewer: {
            id: "demo-user-1",
            full_name: "Demo Reviewer",
            profile_image:
              "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
          },
          reviewee: {
            id: req.query.user_id || "demo-organizer-1",
            full_name: "Demo Organizer",
            profile_image:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
          },
          activity: {
            id: req.query.activity_id || "demo-activity-1",
            title: "Demo Activity",
            date: new Date(Date.now() - 86400000).toISOString(),
          },
        },
      ];
      return res.json(demoReviews);
    }

    const { activity_id, user_id } = req.query;

    let query = supabaseAdmin
      .from("activity_reviews")
      .select(
        `
        *,
        reviewer:profiles!reviewer_id(id, full_name, profile_image),
        reviewee:profiles!reviewee_id(id, full_name, profile_image),
        activity:activities(id, title, date_time)
      `,
      )
      .order("created_at", { ascending: false });

    if (activity_id) {
      query = query.eq("activity_id", activity_id);
    }

    if (user_id) {
      query = query.eq("reviewee_id", user_id);
    }

    const { data: reviews, error } = await query;

    if (error) {
      console.error("Database error:", error);
      if (error.code === "42P01") {
        console.log("Reviews table not found, returning empty array");
        return res.json([]);
      }
      return res.status(500).json({ error: "Failed to fetch reviews" });
    }

    console.log(`Found ${reviews?.length || 0} reviews`);
    res.json(reviews || []);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

export const handleCreateReview = async (req: Request, res: Response) => {
  try {
    console.log("=== CREATE REVIEW REQUEST ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.log("Supabase not configured, returning demo success");
      // Return demo success response for development
      const demoReview = {
        id: "demo-review-" + Date.now(),
        activity_id: req.body.activity_id,
        reviewer_id: "demo-user-id",
        reviewee_id: req.body.reviewee_id,
        rating: req.body.rating,
        comment: req.body.comment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        reviewer: {
          id: "demo-user-id",
          full_name: "Demo User",
          profile_image:
            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
        },
        reviewee: {
          id: req.body.reviewee_id,
          full_name: "Demo Organizer",
          profile_image:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        },
      };
      return res.status(201).json(demoReview);
    }

    const user = await getUserFromToken(req.headers.authorization || "");
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const validatedData = ReviewSchema.parse(req.body);
    console.log("Validated review data:", validatedData);

    // Check if activity exists and has passed
    const { data: activity } = await supabaseAdmin
      .from("activities")
      .select("id, date_time, organizer_id")
      .eq("id", validatedData.activity_id)
      .single();

    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    const activityDate = new Date(activity.date_time);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activityDate >= today) {
      return res
        .status(400)
        .json({ error: "Cannot review activity before it has passed" });
    }

    // Check if user participated in the activity
    const { data: participation } = await supabaseAdmin
      .from("activity_participants")
      .select("id")
      .eq("activity_id", validatedData.activity_id)
      .eq("user_id", user.id)
      .single();

    if (!participation) {
      return res
        .status(403)
        .json({
          error:
            "You must have participated in this activity to leave a review",
        });
    }

    // Check if user already reviewed this activity
    const { data: existingReview } = await supabaseAdmin
      .from("activity_reviews")
      .select("id")
      .eq("activity_id", validatedData.activity_id)
      .eq("reviewer_id", user.id)
      .single();

    if (existingReview) {
      return res
        .status(400)
        .json({ error: "You have already reviewed this activity" });
    }

    // Create the review with proper persistence
    const { data: newReview, error } = await supabaseAdmin
      .from("activity_reviews")
      .insert({
        ...validatedData,
        reviewer_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(
        `
        *,
        reviewer:profiles!reviewer_id(id, full_name, profile_image),
        reviewee:profiles!reviewee_id(id, full_name, profile_image)
      `,
      )
      .single();

    if (error) {
      console.error("Database error creating review:", error);
      return res.status(500).json({ error: "Failed to create review" });
    }

    console.log("Review created successfully:", newReview.id);
    res.status(201).json(newReview);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      res
        .status(400)
        .json({ error: "Invalid review data", details: error.errors });
    } else {
      console.error("Server error:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  }
};

export const handleUpdateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getUserFromToken(req.headers.authorization || "");

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const updates = ReviewSchema.partial().parse(req.body);

    const { data: updatedReview, error } = await supabaseAdmin
      .from("activity_reviews")
      .update(updates)
      .eq("id", id)
      .eq("reviewer_id", user.id) // Only allow updating own reviews
      .select(
        `
        *,
        reviewer:profiles!reviewer_id(id, full_name, profile_image),
        reviewee:profiles!reviewee_id(id, full_name, profile_image)
      `,
      )
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to update review" });
    }

    if (!updatedReview) {
      return res
        .status(404)
        .json({ error: "Review not found or permission denied" });
    }

    res.json(updatedReview);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ error: "Invalid update data", details: error.errors });
    } else {
      console.error("Server error:", error);
      res.status(500).json({ error: "Failed to update review" });
    }
  }
};

export const handleDeleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getUserFromToken(req.headers.authorization || "");

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { error } = await supabaseAdmin
      .from("activity_reviews")
      .delete()
      .eq("id", id)
      .eq("reviewer_id", user.id); // Only allow deleting own reviews

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to delete review" });
    }

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
};
