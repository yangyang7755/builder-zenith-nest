import { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin, getUserFromToken } from "../lib/supabase";
import { createNotification } from "./notifications";

// Follow schema for validation
const FollowSchema = z.object({
  following_id: z.string().uuid(),
});

export const handleGetFollowers = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    const { data: followers, error } = await supabaseAdmin
      .from("user_followers")
      .select(`
        *,
        follower:profiles!follower_id(id, full_name, profile_image, university)
      `)
      .eq("following_id", user_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      if (error.code === '42P01') {
        return res.json([]);
      }
      return res.status(500).json({ error: "Failed to fetch followers" });
    }

    res.json(followers || []);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch followers" });
  }
};

export const handleGetFollowing = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    const { data: following, error } = await supabaseAdmin
      .from("user_followers")
      .select(`
        *,
        following:profiles!following_id(id, full_name, profile_image, university)
      `)
      .eq("follower_id", user_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      if (error.code === '42P01') {
        return res.json([]);
      }
      return res.status(500).json({ error: "Failed to fetch following" });
    }

    res.json(following || []);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch following" });
  }
};

export const handleFollowUser = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromToken(req.headers.authorization || "");
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const validatedData = FollowSchema.parse(req.body);

    // Check if user is trying to follow themselves
    if (user.id === validatedData.following_id) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    // Check if already following
    const { data: existingFollow } = await supabaseAdmin
      .from("user_followers")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", validatedData.following_id)
      .single();

    if (existingFollow) {
      return res.status(400).json({ error: "Already following this user" });
    }

    const { data: newFollow, error } = await supabaseAdmin
      .from("user_followers")
      .insert({
        follower_id: user.id,
        following_id: validatedData.following_id,
      })
      .select(`
        *,
        following:profiles!following_id(id, full_name, profile_image, university)
      `)
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to follow user" });
    }

    res.status(201).json(newFollow);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid follow data", details: error.errors });
    } else {
      console.error("Server error:", error);
      res.status(500).json({ error: "Failed to follow user" });
    }
  }
};

export const handleUnfollowUser = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params; // user to unfollow
    const user = await getUserFromToken(req.headers.authorization || "");

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { error } = await supabaseAdmin
      .from("user_followers")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", user_id);

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to unfollow user" });
    }

    res.json({ message: "Successfully unfollowed user" });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to unfollow user" });
  }
};

export const handleGetFollowStats = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    const [followersResult, followingResult] = await Promise.all([
      supabaseAdmin
        .from("user_followers")
        .select("id", { count: "exact" })
        .eq("following_id", user_id),
      supabaseAdmin
        .from("user_followers")
        .select("id", { count: "exact" })
        .eq("follower_id", user_id)
    ]);

    const followersCount = followersResult.count || 0;
    const followingCount = followingResult.count || 0;

    res.json({
      followers: followersCount,
      following: followingCount
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch follow stats" });
  }
};
