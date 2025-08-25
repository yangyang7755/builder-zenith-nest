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
    console.log("=== GET FOLLOWERS REQUEST ===");
    console.log("User ID:", user_id);

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.log("Supabase not configured, returning demo followers");
      const demoFollowers = [
        {
          id: "demo-follow-1",
          follower_id: "demo-user-1",
          following_id: user_id,
          created_at: new Date().toISOString(),
          follower: {
            id: "demo-user-1",
            full_name: "Demo Follower",
            profile_image:
              "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
            university: "Demo University",
          },
        },
      ];
      return res.json(demoFollowers);
    }

    const { data: followers, error } = await supabaseAdmin
      .from("user_followers")
      .select(
        `
        *,
        follower:profiles!follower_id(id, full_name, profile_image, university)
      `,
      )
      .eq("following_id", user_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      if (error.code === "42P01") {
        console.log("User followers table not found, returning empty array");
        return res.json([]);
      }
      return res.status(500).json({ error: "Failed to fetch followers" });
    }

    console.log(
      `Found ${followers?.length || 0} followers for user ${user_id}`,
    );
    res.json(followers || []);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch followers" });
  }
};

export const handleGetFollowing = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.log("Supabase not configured, returning demo following");
      const demoFollowing = [
        {
          id: "demo-follow-2",
          follower_id: user_id,
          following_id: "demo-user-2",
          created_at: new Date().toISOString(),
          following: {
            id: "demo-user-2",
            full_name: "Demo Following",
            profile_image:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
            university: "Demo University",
          },
        },
      ];
      return res.json(demoFollowing);
    }

    const { data: following, error } = await supabaseAdmin
      .from("user_followers")
      .select(
        `
        *,
        following:profiles!following_id(id, full_name, profile_image, university)
      `,
      )
      .eq("follower_id", user_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      if (error.code === "42P01") {
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
    console.log("=== FOLLOW USER REQUEST ===");
    console.log("Request body:", req.body);

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.log("Supabase not configured, returning demo follow success");
      const demoFollow = {
        id: "demo-follow-" + Date.now(),
        follower_id: "demo-user-current",
        following_id: req.body.following_id,
        created_at: new Date().toISOString(),
        following: {
          id: req.body.following_id,
          full_name: "Demo User",
          profile_image:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
          university: "Demo University",
        },
      };
      return res.status(201).json(demoFollow);
    }

    const user = await getUserFromToken(req.headers.authorization || "");
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const validatedData = FollowSchema.parse(req.body);
    console.log("Following user:", validatedData.following_id);

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

    // Create the follow relationship with proper persistence
    const { data: newFollow, error } = await supabaseAdmin
      .from("user_followers")
      .insert({
        follower_id: user.id,
        following_id: validatedData.following_id,
        created_at: new Date().toISOString(),
      })
      .select(
        `
        *,
        following:profiles!following_id(id, full_name, profile_image, university)
      `,
      )
      .single();

    if (error) {
      console.error("Database error creating follow:", error);
      return res.status(500).json({ error: "Failed to follow user" });
    }

    // Create notification for the followed user (if notifications system exists)
    try {
      await createNotification(
        validatedData.following_id,
        "new_follower",
        "You have a new follower",
        `${newFollow.following?.full_name || "Someone"} started following you`,
        {
          follower_id: user.id,
          follower_name: newFollow.following?.full_name,
        },
      );
    } catch (notifError) {
      console.warn("Failed to create notification:", notifError);
      // Continue anyway, the follow was successful
    }

    console.log("Follow relationship created successfully:", newFollow.id);
    res.status(201).json(newFollow);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      res
        .status(400)
        .json({ error: "Invalid follow data", details: error.errors });
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
    console.log("=== GET FOLLOW STATS REQUEST ===");
    console.log("User ID:", user_id);

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.log("Supabase not configured, returning demo stats");
      return res.json({
        followers: 125,
        following: 87,
      });
    }

    const [followersResult, followingResult] = await Promise.all([
      supabaseAdmin
        .from("user_followers")
        .select("id", { count: "exact" })
        .eq("following_id", user_id),
      supabaseAdmin
        .from("user_followers")
        .select("id", { count: "exact" })
        .eq("follower_id", user_id),
    ]);

    const followersCount = followersResult.count || 0;
    const followingCount = followingResult.count || 0;

    console.log(
      `Follow stats for user ${user_id}: ${followersCount} followers, ${followingCount} following`,
    );

    res.json({
      followers: followersCount,
      following: followingCount,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch follow stats" });
  }
};
