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
    const { activity_id, user_id } = req.query;

    let query = supabaseAdmin
      .from("activity_reviews")
      .select(`
        *,
        reviewer:profiles!reviewer_id(id, full_name, profile_image),
        reviewee:profiles!reviewee_id(id, full_name, profile_image),
        activity:activities(id, title, date)
      `)
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
      if (error.code === '42P01') {
        return res.json([]);
      }
      return res.status(500).json({ error: "Failed to fetch reviews" });
    }

    res.json(reviews || []);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

export const handleCreateReview = async (req: Request, res: Response) => {
  try {
    // Check if Supabase is configured
    if (!supabaseAdmin) {
      // Return demo success response for development
      const demoReview = {
        id: "demo-review-" + Date.now(),
        activity_id: req.body.activity_id,
        reviewer_id: "demo-user-id",
        reviewee_id: req.body.reviewee_id,
        rating: req.body.rating,
        comment: req.body.comment,
        created_at: new Date().toISOString(),
        reviewer: {
          id: "demo-user-id",
          full_name: "Demo User",
          profile_image: null
        }
      };
      return res.status(201).json(demoReview);
    }

    const user = await getUserFromToken(req.headers.authorization || "");
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const validatedData = ReviewSchema.parse(req.body);

    // Check if activity exists and has passed
    const { data: activity } = await supabaseAdmin
      .from("activities")
      .select("id, date, organizer_id")
      .eq("id", validatedData.activity_id)
      .single();

    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    const activityDate = new Date(activity.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activityDate >= today) {
      return res.status(400).json({ error: "Cannot review activity before it has passed" });
    }

    // Check if user participated in the activity
    const { data: participation } = await supabaseAdmin
      .from("activity_participants")
      .select("id")
      .eq("activity_id", validatedData.activity_id)
      .eq("user_id", user.id)
      .single();

    if (!participation) {
      return res.status(403).json({ error: "You must have participated in this activity to leave a review" });
    }

    // Check if user already reviewed this activity
    const { data: existingReview } = await supabaseAdmin
      .from("activity_reviews")
      .select("id")
      .eq("activity_id", validatedData.activity_id)
      .eq("reviewer_id", user.id)
      .single();

    if (existingReview) {
      return res.status(400).json({ error: "You have already reviewed this activity" });
    }

    const { data: newReview, error } = await supabaseAdmin
      .from("activity_reviews")
      .insert({
        ...validatedData,
        reviewer_id: user.id,
      })
      .select(`
        *,
        reviewer:profiles!reviewer_id(id, full_name, profile_image),
        reviewee:profiles!reviewee_id(id, full_name, profile_image)
      `)
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to create review" });
    }

    res.status(201).json(newReview);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid review data", details: error.errors });
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
      .select(`
        *,
        reviewer:profiles!reviewer_id(id, full_name, profile_image),
        reviewee:profiles!reviewee_id(id, full_name, profile_image)
      `)
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to update review" });
    }

    if (!updatedReview) {
      return res.status(404).json({ error: "Review not found or permission denied" });
    }

    res.json(updatedReview);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid update data", details: error.errors });
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
