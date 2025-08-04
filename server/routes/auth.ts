import { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin, getUserFromToken } from "../lib/supabase";

const ProfileUpdateSchema = z.object({
  // Basic Info
  full_name: z.string().optional(),
  bio: z.string().optional(),
  profile_image: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),

  // Personal Details
  gender: z.string().optional(),
  age: z.number().min(13).max(120).optional(),
  date_of_birth: z.string().optional(),
  nationality: z.string().optional(),
  institution: z.string().optional(),
  university: z.string().optional(), // Keep for backward compatibility
  occupation: z.string().optional(),
  location: z.string().optional(),

  // Visibility Settings
  visibility_settings: z.object({
    profile_image: z.boolean().optional(),
    full_name: z.boolean().optional(),
    bio: z.boolean().optional(),
    email: z.boolean().optional(),
    phone: z.boolean().optional(),
    gender: z.boolean().optional(),
    age: z.boolean().optional(),
    date_of_birth: z.boolean().optional(),
    nationality: z.boolean().optional(),
    institution: z.boolean().optional(),
    occupation: z.boolean().optional(),
    location: z.boolean().optional(),
    sports: z.boolean().optional(),
    achievements: z.boolean().optional(),
    activities: z.boolean().optional(),
    reviews: z.boolean().optional(),
    followers: z.boolean().optional(),
    following: z.boolean().optional(),
  }).optional(),

  // Sports and Achievements (will be handled separately)
  sports: z.array(z.object({
    id: z.string(),
    sport: z.string(),
    level: z.string(),
    experience: z.string().optional(),
    maxGrade: z.string().optional(),
    certifications: z.array(z.string()).optional(),
    specialties: z.array(z.string()).optional(),
    preferences: z.array(z.string()).optional(),
  })).optional(),

  achievements: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    date: z.string().optional(),
    category: z.string().optional(),
    verified: z.boolean().optional(),
  })).optional(),
});

export const handleGetProfile = async (req: Request, res: Response) => {
  try {
    // Check if Supabase is configured
    if (!supabaseAdmin) {
      // Return demo profile for development
      const demoProfile = {
        id: "demo-user-1",
        email: "demo@example.com",
        full_name: "Demo User",
        university: "Demo University",
        bio: "This is a demo profile for testing purposes.",
        profile_image: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return res.json(demoProfile);
    }

    const user = await getUserFromToken(req.headers.authorization || "");

    if (!user) {
      // In demo mode, return sample profile instead of 401 error
      const demoProfile = {
        id: "demo-user-1",
        email: "demo@example.com",
        full_name: "Demo User",
        university: "Demo University",
        bio: "Demo profile - authentication not configured",
        profile_image: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return res.json(demoProfile);
    }

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }

    res.json(profile);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

export const handleUpdateProfile = async (req: Request, res: Response) => {
  try {
    // Check if Supabase is configured
    if (!supabaseAdmin) {
      // Return demo success response for development
      const demoProfile = {
        id: "demo-user-id",
        email: req.body.email || "demo@example.com",
        full_name: req.body.full_name || "Demo User",
        bio: req.body.bio || "Demo user profile",
        profile_image: req.body.profile_image || null,
        university: req.body.institution || "Demo University",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return res.json(demoProfile);
    }

    const user = await getUserFromToken(req.headers.authorization || "");

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const validatedData = ProfileUpdateSchema.parse(req.body);

    const { data: updatedProfile, error } = await supabaseAdmin
      .from("profiles")
      .update(validatedData)
      .eq("id", user.id)
      .select("*")
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to update profile" });
    }

    res.json(updatedProfile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ error: "Invalid profile data", details: error.errors });
    } else {
      console.error("Server error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
};

export const handleGetUserClubs = async (req: Request, res: Response) => {
  try {
    // Check if Supabase is configured
    if (!supabaseAdmin) {
      // Return demo data for development
      const demoClubs = [
        {
          id: "oucc",
          name: "Oxford University Cycling Club",
          type: "cycling",
          location: "Oxford, UK",
          userRole: "member",
        },
        {
          id: "westway",
          name: "Westway Climbing Centre",
          type: "climbing",
          location: "London, UK",
          userRole: "manager",
        },
      ];
      return res.json(demoClubs);
    }

    const user = await getUserFromToken(req.headers.authorization || "");

    if (!user) {
      // In demo mode, return sample data instead of 401 error
      const demoClubs = [
        {
          id: "oucc",
          name: "Oxford University Cycling Club",
          type: "cycling",
          location: "Oxford, UK",
          userRole: "member",
        },
      ];
      return res.json(demoClubs);
    }

    const { data: memberships, error } = await supabaseAdmin
      .from("club_memberships")
      .select(
        `
        role,
        status,
        club:clubs(*)
      `,
      )
      .eq("user_id", user.id)
      .eq("status", "approved");

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to fetch user clubs" });
    }

    const clubs =
      memberships?.map((membership) => ({
        ...membership.club,
        userRole: membership.role,
      })) || [];

    res.json(clubs);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch user clubs" });
  }
};

export const handleGetUserActivities = async (req: Request, res: Response) => {
  try {
    // Check if Supabase is configured
    if (!supabaseAdmin) {
      // Return demo data for development
      const demoActivities = [
        {
          id: "demo-1",
          title: "Morning Cycling Session",
          type: "cycling",
          date: "2024-02-15",
          time: "08:00",
          location: "Oxford Countryside",
          club: { name: "Oxford University Cycling Club" },
        },
        {
          id: "demo-2",
          title: "Beginner Climbing",
          type: "climbing",
          date: "2024-02-20",
          time: "19:00",
          location: "Westway Climbing Centre",
          club: { name: "Westway Climbing Centre" },
        },
      ];
      return res.json(demoActivities);
    }

    const user = await getUserFromToken(req.headers.authorization || "");

    if (!user) {
      // In demo mode, return sample data instead of 401 error
      const demoActivities = [
        {
          id: "demo-1",
          title: "Demo Activity",
          type: "cycling",
          date: "2024-02-15",
          time: "08:00",
          location: "Demo Location",
          club: { name: "Demo Club" },
        },
      ];
      return res.json(demoActivities);
    }

    const { data: activities, error } = await supabaseAdmin
      .from("activities")
      .select(
        `
        *,
        organizer:profiles!organizer_id(id, full_name, email),
        club:clubs(id, name)
      `,
      )
      .eq("organizer_id", user.id)
      .order("date", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to fetch user activities" });
    }

    res.json(activities || []);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch user activities" });
  }
};
