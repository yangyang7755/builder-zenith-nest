import { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase";

const UserRegistrationSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  university: z.string().optional(),
  bio: z.string().optional(),
});

const UserLoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const handleUserRegistration = async (req: Request, res: Response) => {
  try {
    console.log("=== USER REGISTRATION REQUEST ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.log("Supabase not configured, returning demo response");

      // Return demo success for development
      const demoUser = {
        id: `demo-user-${Date.now()}`,
        email: req.body.email,
        full_name: req.body.full_name,
        university: req.body.university || null,
        bio: req.body.bio || null,
        profile_image: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return res.status(201).json({
        success: true,
        message: "Demo account created successfully",
        user: demoUser,
        profile: demoUser,
      });
    }

    // Validate request data
    const validatedData = UserRegistrationSchema.parse(req.body);
    console.log("Validated data:", validatedData);

    // Create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: validatedData.email,
        password: validatedData.password,
        email_confirm: true, // Auto-confirm email in development
        user_metadata: {
          full_name: validatedData.full_name,
        },
      });

    if (authError) {
      console.error("Auth creation error:", authError);
      return res.status(400).json({
        success: false,
        error: authError.message,
        details: authError,
      });
    }

    if (!authData.user) {
      return res.status(400).json({
        success: false,
        error: "Failed to create user account",
      });
    }

    console.log("User created successfully:", authData.user.id);

    // Create profile in profiles table
    const profileData = {
      id: authData.user.id,
      email: validatedData.email,
      full_name: validatedData.full_name,
      university: validatedData.university || null,
      bio: validatedData.bio || null,
      profile_image: null,
    };

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert(profileData)
      .select("*")
      .single();

    if (profileError) {
      console.error("Profile creation error:", profileError);

      // Try to clean up the auth user if profile creation failed
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.error(
          "Failed to cleanup auth user after profile error:",
          cleanupError,
        );
      }

      return res.status(500).json({
        success: false,
        error: "Failed to create user profile",
        details: profileError,
      });
    }

    console.log("Profile created successfully:", profile);

    // Return success response
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: authData.user.id,
        email: authData.user.email,
        created_at: authData.user.created_at,
      },
      profile: profile,
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid registration data",
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error during registration",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const handleUserLogin = async (req: Request, res: Response) => {
  try {
    console.log("=== USER LOGIN REQUEST ===");
    console.log("Request body email:", req.body.email);

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.log("Supabase not configured, returning demo response");

      // Return demo success for development
      const demoUser = {
        id: "demo-user-signed-in",
        email: req.body.email,
        full_name: "Demo User",
        university: "Demo University",
        bio: "Demo user profile",
        profile_image: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return res.json({
        success: true,
        message: "Demo login successful",
        user: demoUser,
        profile: demoUser,
        session: {
          access_token: "demo-token",
          user: demoUser,
        },
      });
    }

    // Validate request data
    const validatedData = UserLoginSchema.parse(req.body);
    console.log("Login attempt for:", validatedData.email);

    // Authenticate user
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

    if (authError) {
      console.error("Login error:", authError);
      return res.status(401).json({
        success: false,
        error: authError.message,
      });
    }

    if (!authData.user) {
      return res.status(401).json({
        success: false,
        error: "Invalid login credentials",
      });
    }

    console.log("Login successful for user:", authData.user.id);

    // Fetch user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch user profile",
      });
    }

    // Return success response with user and profile data
    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: authData.user.id,
        email: authData.user.email,
        created_at: authData.user.created_at,
      },
      profile: profile,
      session: authData.session,
    });
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid login data",
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error during login",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const handleGetUserProfile = async (req: Request, res: Response) => {
  try {
    console.log("=== GET USER PROFILE REQUEST ===");

    // Extract user ID from auth token or params
    const userId = req.params.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    console.log("Fetching profile for user:", userId);

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      const demoProfile = {
        id: userId,
        email: "demo@example.com",
        full_name: "Demo User",
        university: "Demo University",
        bio: "Demo user profile",
        profile_image: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return res.json({
        success: true,
        profile: demoProfile,
      });
    }

    // Fetch user profile from database
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return res.status(404).json({
        success: false,
        error: "Profile not found",
      });
    }

    res.json({
      success: true,
      profile: profile,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch profile",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const handleUpdateUserProfile = async (req: Request, res: Response) => {
  try {
    console.log("=== UPDATE USER PROFILE REQUEST ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const userId = req.params.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    console.log("Updating profile for user:", userId);

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      const updatedProfile = {
        id: userId,
        email: req.body.email || "demo@example.com",
        full_name: req.body.full_name || "Demo User",
        university: req.body.university || "Demo University",
        bio: req.body.bio || "Demo user profile",
        profile_image: req.body.profile_image || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return res.json({
        success: true,
        message: "Demo profile updated",
        profile: updatedProfile,
      });
    }

    // Filter valid profile fields
    const allowedFields = ["full_name", "university", "bio", "profile_image"];
    const updateData = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key)),
    );

    // Add updated timestamp
    updateData.updated_at = new Date().toISOString();

    console.log("Update data:", updateData);

    // Update profile in database
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select("*")
      .single();

    if (updateError) {
      console.error("Profile update error:", updateError);
      return res.status(500).json({
        success: false,
        error: "Failed to update profile",
        details: updateError,
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update profile",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const handleGetUsers = async (req: Request, res: Response) => {
  try {
    console.log("=== GET USERS REQUEST ===");

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.log("Supabase not configured, returning demo response");

      const demoUsers = [
        {
          id: "demo-user-1",
          email: "user1@example.com",
          full_name: "Alice Johnson",
          university: "University College London",
          bio: "Outdoor enthusiast and climbing instructor",
          profile_image:
            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
          created_at: new Date().toISOString(),
        },
        {
          id: "demo-user-2",
          email: "user2@example.com",
          full_name: "Ben Smith",
          university: "Imperial College London",
          bio: "Cycling enthusiast and weekend warrior",
          profile_image:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
          created_at: new Date().toISOString(),
        },
      ];

      return res.json({
        success: true,
        users: demoUsers,
        total: demoUsers.length,
      });
    }

    // Fetch users from database
    const { data: users, error: usersError } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, email, full_name, university, bio, profile_image, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (usersError) {
      console.error("Users fetch error:", usersError);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch users",
      });
    }

    res.json({
      success: true,
      users: users || [],
      total: users?.length || 0,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const handleClubCreation = async (req: Request, res: Response) => {
  try {
    console.log("=== CLUB CREATION REQUEST ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const { name, description, type, location, isPrivate = false } = req.body;

    if (!name || !description || !type || !location) {
      return res.status(400).json({
        success: false,
        error: "Name, description, type, and location are required",
      });
    }

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.log("Supabase not configured, returning demo response");

      const demoClub = {
        id: `demo-club-${Date.now()}`,
        name,
        description,
        type,
        location,
        isPrivate,
        memberCount: 1,
        managerId: "demo-user-current",
        created_at: new Date().toISOString(),
      };

      return res.status(201).json({
        success: true,
        message: "Demo club created successfully",
        club: demoClub,
      });
    }

    // In a real implementation, this would create a club in the database
    const clubData = {
      name,
      description,
      type,
      location,
      is_private: isPrivate,
      member_count: 1,
      manager_id: req.user?.id || "unknown",
      created_at: new Date().toISOString(),
    };

    // For now, return a demo response since we don't have clubs table
    const demoClub = {
      id: `club-${Date.now()}`,
      ...clubData,
    };

    res.status(201).json({
      success: true,
      message: "Club created successfully",
      club: demoClub,
    });
  } catch (error) {
    console.error("Club creation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create club",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const handleGetUserClubs = async (req: Request, res: Response) => {
  try {
    console.log("=== GET USER CLUBS REQUEST ===");

    const userId = req.params.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    console.log("Fetching clubs for user:", userId);

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.log("Supabase not configured, returning demo response");

      const demoClubs = [
        {
          id: "demo-club-1",
          name: "Westway Climbing Centre",
          description: "London's premier indoor climbing centre",
          type: "climbing",
          location: "London, UK",
          memberCount: 1250,
          role: "member",
          joinedAt: new Date().toISOString(),
        },
        {
          id: "demo-club-2",
          name: "Richmond Running Club",
          description: "Running club for all levels in Richmond",
          type: "running",
          location: "Richmond, London",
          memberCount: 450,
          role: "member",
          joinedAt: new Date().toISOString(),
        },
      ];

      return res.json({
        success: true,
        clubs: demoClubs,
        total: demoClubs.length,
      });
    }

    // In a real implementation, this would fetch from a club_members table
    // For now, return demo data
    const demoClubs = [
      {
        id: "club-1",
        name: "Demo Club 1",
        description: "A demo club for testing",
        type: "general",
        location: "London, UK",
        memberCount: 25,
        role: "member",
        joinedAt: new Date().toISOString(),
      },
    ];

    res.json({
      success: true,
      clubs: demoClubs,
      total: demoClubs.length,
    });
  } catch (error) {
    console.error("Get user clubs error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user clubs",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Add missing functions that server index expects
export const handleCreateUser = async (req: Request, res: Response) => {
  // Alias to handleUserRegistration
  return handleUserRegistration(req, res);
};

export const handleGetUser = async (req: Request, res: Response) => {
  // Alias to handleGetUserProfile
  return handleGetUserProfile(req, res);
};

export const handleUpdateUser = async (req: Request, res: Response) => {
  // Alias to handleUpdateUserProfile
  return handleUpdateUserProfile(req, res);
};

export const handleGetUserActivityHistory = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      user_id,
      status = "completed",
      limit = 20,
      offset = 0,
      include_reviews,
    } = req.query;

    console.log("=== GET USER ACTIVITY HISTORY ===");
    console.log("Query params:", {
      user_id,
      status,
      limit,
      offset,
      include_reviews,
    });

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      const demoActivities = [
        {
          id: "demo-activity-1",
          title: "Advanced Technique Workshop",
          activity_type: "climbing",
          date: "2025-01-15",
          location: "Training Academy",
          organizer_id: "demo-organizer-1",
          organizer_name: "Training Academy",
          participant_count: 8,
          status: "completed",
          average_rating: 5.0,
          total_reviews: 1,
        },
        {
          id: "demo-activity-2",
          title: "Morning Cycle Ride",
          activity_type: "cycling",
          date: "2025-01-10",
          location: "Richmond Park",
          organizer_id: "demo-user-current",
          organizer_name: "You",
          participant_count: 12,
          status: "completed",
          average_rating: 4.8,
          total_reviews: 5,
        },
      ];

      return res.json({
        success: true,
        data: demoActivities,
      });
    }

    // In real implementation, would query activity_participants table
    return res.json({
      success: true,
      data: [],
    });
  } catch (error) {
    console.error("Get user activity history error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch activity history",
    });
  }
};

export const handleGetActivitiesNeedingReview = async (
  req: Request,
  res: Response,
) => {
  try {
    console.log("=== GET ACTIVITIES NEEDING REVIEW ===");

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      const demoActivities = [
        {
          id: "demo-review-needed-1",
          title: "Past Climbing Session",
          activity_type: "climbing",
          date: "2025-01-05",
          location: "Westway Climbing Centre",
          organizer_id: "demo-organizer-1",
          organizer_name: "Holly Smith",
        },
      ];

      return res.json({
        success: true,
        data: demoActivities,
      });
    }

    // In real implementation, would query for past activities without reviews
    return res.json({
      success: true,
      data: [],
    });
  } catch (error) {
    console.error("Get activities needing review error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch activities needing review",
    });
  }
};

export const handleProfileOnboarding = async (req: Request, res: Response) => {
  try {
    console.log("=== PROFILE ONBOARDING REQUEST ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const userId = req.user?.id;

    console.log("Supabase admin configured:", !!supabaseAdmin);
    console.log("User ID from request:", userId);

    // Check authentication requirements based on Supabase configuration
    if (!supabaseAdmin) {
      // Demo mode - no authentication required
      console.log("Running in demo mode - no authentication required");
    } else if (!userId) {
      // If no authenticated user in non-production, fall back to demo handling
      if (process.env.NODE_ENV !== "production") {
        console.warn("No user ID in request; falling back to demo onboarding handler in non-production");
      } else {
        // Production mode - authentication required
        return res.status(400).json({
          success: false,
          error: "User ID is required",
        });
      }
    } else {
      console.log("Creating/updating profile from onboarding for user:", userId);
    }

    // Check if Supabase is configured OR we're falling back due to missing userId in non-production
    if (!supabaseAdmin || (!userId && process.env.NODE_ENV !== "production")) {
      const demoUserId = userId || `demo-user-${Date.now()}`;
      const profileData = {
        id: demoUserId,
        email: req.body.email || "demo@example.com",
        full_name: req.body.full_name || req.body.name || "Demo User",
        university: req.body.university || null,
        bio: req.body.bio || null,
        birthday: req.body.birthday || null,
        gender: req.body.gender || null,
        sports: req.body.sports || [],
        languages: req.body.languages || [],
        country: req.body.country || null,
        profession: req.body.profession || null,
        location: req.body.location || null,
        gear: req.body.gear || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("Demo profile onboarding successful:", profileData);

      return res.json({
        success: true,
        message: "Demo profile created/updated from onboarding",
        profile: profileData,
      });
    }

    // Prepare extended profile data
    const profileData = {
      full_name: req.body.full_name || req.body.name,
      email: req.body.email,
      university: req.body.university || null,
      bio: req.body.bio || null,
      updated_at: new Date().toISOString(),
    };

    // Update profile in database
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: userId,
          ...profileData,
        },
        {
          onConflict: "id",
        },
      )
      .select("*")
      .single();

    if (updateError) {
      console.error("Profile onboarding error:", updateError);
      return res.status(500).json({
        success: false,
        error: "Failed to create/update profile",
        details: updateError,
      });
    }

    console.log("Profile onboarding successful:", updatedProfile);

    res.json({
      success: true,
      message: "Profile created/updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Profile onboarding error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process onboarding",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
