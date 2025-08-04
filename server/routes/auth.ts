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
      // Return comprehensive demo profile for development
      const demoProfile = {
        id: "demo-user-1",
        email: "demo@example.com",
        full_name: "Demo User",
        university: "Demo University",
        institution: "Demo University",
        bio: "This is a demo profile for testing purposes.",
        profile_image: null,
        phone: null,
        gender: null,
        age: null,
        date_of_birth: null,
        nationality: null,
        occupation: null,
        location: null,
        visibility_settings: {},
        sports: [],
        achievements: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return res.json(demoProfile);
    }

    const user = await getUserFromToken(req.headers.authorization || "");

    if (!user) {
      // In demo mode, return comprehensive sample profile instead of 401 error
      const demoProfile = {
        id: "demo-user-1",
        email: "demo@example.com",
        full_name: "Demo User",
        university: "Demo University",
        institution: "Demo University",
        bio: "Demo profile - authentication not configured",
        profile_image: null,
        phone: null,
        gender: null,
        age: null,
        date_of_birth: null,
        nationality: null,
        occupation: null,
        location: null,
        visibility_settings: {},
        sports: [],
        achievements: [],
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
    console.log('Profile update - checking Supabase configuration...');
    console.log('supabaseAdmin exists:', !!supabaseAdmin);

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.log('Running in demo mode - returning demo response');
      // Return demo success response for development
      const demoProfile = {
        id: "demo-user-id",
        email: req.body.email || "demo@example.com",
        full_name: req.body.full_name || "Demo User",
        bio: req.body.bio || "Demo user profile",
        profile_image: req.body.profile_image || null,
        university: req.body.institution || "Demo University",
        institution: req.body.institution || "Demo University",
        phone: req.body.phone || null,
        gender: req.body.gender || null,
        age: req.body.age || null,
        date_of_birth: req.body.date_of_birth || null,
        nationality: req.body.nationality || null,
        occupation: req.body.occupation || null,
        location: req.body.location || null,
        visibility_settings: req.body.visibility_settings || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return res.json(demoProfile);
    }

    const user = await getUserFromToken(req.headers.authorization || "");

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    console.log('Profile update request body:', req.body);

    const validatedData = ProfileUpdateSchema.parse(req.body);
    console.log('Validated data:', validatedData);

    // Extract sports and achievements data
    const { sports, achievements, ...profileData } = validatedData;
    console.log('Profile data to update:', profileData);

    // Start a transaction to update profile, sports, and achievements
    const { data: updatedProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        ...profileData,
        // Map university to institution for consistency
        institution: profileData.institution || profileData.university,
      })
      .eq("id", user.id)
      .select("*")
      .single();

    if (profileError) {
      console.error("Profile update error:", profileError);
      console.error("Profile update data that failed:", profileData);
      return res.status(500).json({
        error: "Failed to update profile",
        details: profileError.message,
        code: profileError.code
      });
    }

    // Update sports if provided
    if (sports && Array.isArray(sports)) {
      // Delete existing sports
      await supabaseAdmin
        .from("profile_sports")
        .delete()
        .eq("profile_id", user.id);

      // Insert new sports
      if (sports.length > 0) {
        const sportsData = sports.map(sport => ({
          profile_id: user.id,
          sport: sport.sport,
          level: sport.level,
          experience: sport.experience || '',
          max_grade: sport.maxGrade || '',
          certifications: sport.certifications || [],
          specialties: sport.specialties || [],
          preferences: sport.preferences || [],
        }));

        const { error: sportsError } = await supabaseAdmin
          .from("profile_sports")
          .insert(sportsData);

        if (sportsError) {
          console.error("Sports update error:", sportsError);
          // Don't fail the whole request, just log the error
        }
      }
    }

    // Update achievements if provided
    if (achievements && Array.isArray(achievements)) {
      // Delete existing achievements
      await supabaseAdmin
        .from("profile_achievements")
        .delete()
        .eq("profile_id", user.id);

      // Insert new achievements
      if (achievements.length > 0) {
        const achievementsData = achievements.map(achievement => ({
          profile_id: user.id,
          title: achievement.title,
          description: achievement.description || '',
          date: achievement.date || null,
          category: achievement.category || '',
          verified: achievement.verified || false,
        }));

        const { error: achievementsError } = await supabaseAdmin
          .from("profile_achievements")
          .insert(achievementsData);

        if (achievementsError) {
          console.error("Achievements update error:", achievementsError);
          // Don't fail the whole request, just log the error
        }
      }
    }

    // Return the updated profile with related data
    const response = {
      ...updatedProfile,
      sports: sports || [],
      achievements: achievements || [],
    };

    res.json(response);
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
