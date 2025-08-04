import { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase";
import bcrypt from "bcrypt";

// Validation schemas
const UserRegistrationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  full_name: z.string().min(1, "Full name is required"),
  university: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  age: z.number().min(13).max(120).optional(),
  nationality: z.string().optional(),
  institution: z.string().optional(),
  occupation: z.string().optional(),
  location: z.string().optional(),
});

const ClubCreationSchema = z.object({
  name: z.string().min(1, "Club name is required"),
  description: z.string().optional(),
  type: z.enum(['cycling', 'climbing', 'running', 'hiking', 'skiing', 'surfing', 'tennis', 'general']),
  location: z.string().min(1, "Location is required"),
  website: z.string().url().optional(),
  contact_email: z.string().email().optional(),
  profile_image: z.string().optional(),
});

// User Registration Handler
export const handleUserRegistration = async (req: Request, res: Response) => {
  try {
    // Check if Supabase is configured
    if (!supabaseAdmin) {
      // Demo mode - return success without actual registration
      const demoUser = {
        id: `demo-user-${Date.now()}`,
        email: req.body.email,
        full_name: req.body.full_name,
        created_at: new Date().toISOString(),
        message: "Demo registration successful"
      };
      return res.status(201).json({ user: demoUser, message: "Demo user registered successfully" });
    }

    const validatedData = UserRegistrationSchema.parse(req.body);
    
    // Create auth user using Supabase Admin API
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true, // Auto-confirm email in admin creation
      user_metadata: {
        full_name: validatedData.full_name,
      }
    });

    if (authError) {
      console.error("Auth user creation error:", authError);
      return res.status(400).json({ 
        error: "Failed to create user account", 
        details: authError.message 
      });
    }

    if (!authUser.user) {
      return res.status(400).json({ error: "Failed to create user account" });
    }

    // Create profile record
    const profileData = {
      id: authUser.user.id,
      email: validatedData.email,
      full_name: validatedData.full_name,
      university: validatedData.university,
      institution: validatedData.institution || validatedData.university,
      bio: validatedData.bio,
      phone: validatedData.phone,
      gender: validatedData.gender,
      age: validatedData.age,
      nationality: validatedData.nationality,
      occupation: validatedData.occupation,
      location: validatedData.location,
      visibility_settings: {
        profile_image: true,
        full_name: true,
        bio: true,
        email: false,
        phone: false,
        gender: true,
        age: true,
        date_of_birth: false,
        nationality: true,
        institution: true,
        occupation: true,
        location: true,
        sports: true,
        achievements: true,
        activities: true,
        reviews: true,
        followers: true,
        following: true,
      }
    };

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert(profileData)
      .select("*")
      .single();

    if (profileError) {
      console.error("Profile creation error:", profileError);
      
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      
      return res.status(500).json({ 
        error: "Failed to create user profile",
        details: profileError.message 
      });
    }

    // Return success response (exclude sensitive data)
    const { ...userResponse } = profile;
    res.status(201).json({
      user: userResponse,
      message: "User registered successfully"
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid registration data",
        details: error.errors
      });
    }
    
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error during registration" });
  }
};

// Get all users (admin function)
export const handleGetUsers = async (req: Request, res: Response) => {
  try {
    if (!supabaseAdmin) {
      // Demo mode - return sample users
      const demoUsers = [
        {
          id: "demo-user-1",
          email: "demo1@example.com",
          full_name: "Demo User 1",
          location: "London, UK",
          created_at: new Date().toISOString(),
        },
        {
          id: "demo-user-2", 
          email: "demo2@example.com",
          full_name: "Demo User 2",
          location: "Oxford, UK",
          created_at: new Date().toISOString(),
        }
      ];
      return res.json({ users: demoUsers, count: demoUsers.length });
    }

    const { data: users, error, count } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, university, institution, location, created_at", { count: 'exact' })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Users fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch users" });
    }

    res.json({ users: users || [], count: count || 0 });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Club Creation Handler
export const handleClubCreation = async (req: Request, res: Response) => {
  try {
    if (!supabaseAdmin) {
      // Demo mode - return success without actual creation
      const demoClub = {
        id: `demo-club-${Date.now()}`,
        name: req.body.name,
        type: req.body.type,
        location: req.body.location,
        created_by: "demo-user-id",
        created_at: new Date().toISOString(),
        message: "Demo club created successfully"
      };
      return res.status(201).json({ club: demoClub, message: "Demo club created successfully" });
    }

    // Validate request body
    const validatedData = ClubCreationSchema.parse(req.body);
    
    // Get user from authorization header (you'll need to implement getUserFromToken)
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization required" });
    }

    // For now, extract user ID from token (implement proper token validation)
    // This would typically use JWT verification
    const userId = req.body.created_by || "demo-user-id";

    // Generate club ID from name (you might want a different strategy)
    const clubId = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const clubData = {
      id: clubId,
      name: validatedData.name,
      description: validatedData.description,
      type: validatedData.type,
      location: validatedData.location,
      website: validatedData.website,
      contact_email: validatedData.contact_email,
      profile_image: validatedData.profile_image,
      created_by: userId,
      member_count: 1, // Creator is the first member
    };

    // Create club
    const { data: club, error: clubError } = await supabaseAdmin
      .from("clubs")
      .insert(clubData)
      .select("*")
      .single();

    if (clubError) {
      console.error("Club creation error:", clubError);
      return res.status(500).json({ 
        error: "Failed to create club",
        details: clubError.message 
      });
    }

    // Add creator as club manager
    const membershipData = {
      club_id: clubId,
      user_id: userId,
      role: "manager",
      status: "approved",
      approved_at: new Date().toISOString(),
    };

    const { error: membershipError } = await supabaseAdmin
      .from("club_memberships")
      .insert(membershipData);

    if (membershipError) {
      console.error("Club membership creation error:", membershipError);
      // Don't fail the whole request, just log the error
    }

    res.status(201).json({
      club,
      message: "Club created successfully"
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid club data",
        details: error.errors
      });
    }
    
    console.error("Club creation error:", error);
    res.status(500).json({ error: "Internal server error during club creation" });
  }
};

// Get user's clubs
export const handleGetUserClubs = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    
    if (!supabaseAdmin) {
      // Demo mode
      const demoClubs = [
        {
          id: "demo-club-1",
          name: "Demo Cycling Club",
          type: "cycling",
          location: "London",
          role: "manager"
        }
      ];
      return res.json({ clubs: demoClubs });
    }

    const { data: memberships, error } = await supabaseAdmin
      .from("club_memberships")
      .select(`
        role,
        status,
        club:clubs(*)
      `)
      .eq("user_id", userId)
      .eq("status", "approved");

    if (error) {
      console.error("User clubs fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch user clubs" });
    }

    const clubs = memberships?.map(membership => ({
      ...membership.club,
      userRole: membership.role
    })) || [];

    res.json({ clubs });
  } catch (error) {
    console.error("Get user clubs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
