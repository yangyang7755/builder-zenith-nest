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
    console.log('=== USER REGISTRATION REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.log('Supabase not configured, returning demo response');
      
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
        profile: demoUser
      });
    }

    // Validate request data
    const validatedData = UserRegistrationSchema.parse(req.body);
    console.log('Validated data:', validatedData);

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true, // Auto-confirm email in development
      user_metadata: {
        full_name: validatedData.full_name,
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return res.status(400).json({
        success: false,
        error: authError.message,
        details: authError
      });
    }

    if (!authData.user) {
      return res.status(400).json({
        success: false,
        error: "Failed to create user account"
      });
    }

    console.log('User created successfully:', authData.user.id);

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
      .from('profiles')
      .insert(profileData)
      .select('*')
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      
      // Try to clean up the auth user if profile creation failed
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.error('Failed to cleanup auth user after profile error:', cleanupError);
      }

      return res.status(500).json({
        success: false,
        error: "Failed to create user profile",
        details: profileError
      });
    }

    console.log('Profile created successfully:', profile);

    // Return success response
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: authData.user.id,
        email: authData.user.email,
        created_at: authData.user.created_at,
      },
      profile: profile
    });

  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid registration data",
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error during registration",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const handleUserLogin = async (req: Request, res: Response) => {
  try {
    console.log('=== USER LOGIN REQUEST ===');
    console.log('Request body email:', req.body.email);

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.log('Supabase not configured, returning demo response');
      
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
          user: demoUser
        }
      });
    }

    // Validate request data
    const validatedData = UserLoginSchema.parse(req.body);
    console.log('Login attempt for:', validatedData.email);

    // Authenticate user
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (authError) {
      console.error('Login error:', authError);
      return res.status(401).json({
        success: false,
        error: authError.message
      });
    }

    if (!authData.user) {
      return res.status(401).json({
        success: false,
        error: "Invalid login credentials"
      });
    }

    console.log('Login successful for user:', authData.user.id);

    // Fetch user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch user profile"
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
      session: authData.session
    });

  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid login data",
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error during login",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const handleGetUserProfile = async (req: Request, res: Response) => {
  try {
    console.log('=== GET USER PROFILE REQUEST ===');
    
    // Extract user ID from auth token or params
    const userId = req.params.userId || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required"
      });
    }

    console.log('Fetching profile for user:', userId);

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
        profile: demoProfile
      });
    }

    // Fetch user profile from database
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(404).json({
        success: false,
        error: "Profile not found"
      });
    }

    res.json({
      success: true,
      profile: profile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch profile",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const handleUpdateUserProfile = async (req: Request, res: Response) => {
  try {
    console.log('=== UPDATE USER PROFILE REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const userId = req.params.userId || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required"
      });
    }

    console.log('Updating profile for user:', userId);

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
        profile: updatedProfile
      });
    }

    // Filter valid profile fields
    const allowedFields = ['full_name', 'university', 'bio', 'profile_image'];
    const updateData = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );

    // Add updated timestamp
    updateData.updated_at = new Date().toISOString();

    console.log('Update data:', updateData);

    // Update profile in database
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return res.status(500).json({
        success: false,
        error: "Failed to update profile",
        details: updateError
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to update profile",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
