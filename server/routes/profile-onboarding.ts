import { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin, getUserFromToken } from "../lib/supabase";

// Onboarding profile schema that matches the frontend OnboardingContext
const OnboardingProfileSchema = z.object({
  // Basic profile data
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  
  // Onboarding data
  birthday: z.string().optional(),
  gender: z.string().optional(),
  sports: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  country: z.string().optional(),
  profession: z.string().optional(),
  university: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  hideUniversity: z.boolean().optional(),

  // Sport-specific skill levels
  climbingLevel: z.string().optional(),
  climbingExperience: z.string().optional(),
  climbingMaxGrade: z.string().optional(),
  climbingCertifications: z.array(z.string()).optional(),
  climbingSpecialties: z.array(z.string()).optional(),
  climbingSkills: z.array(z.string()).optional(),

  cyclingLevel: z.string().optional(),
  cyclingExperience: z.string().optional(),
  cyclingDistance: z.string().optional(),
  cyclingPace: z.string().optional(),
  cyclingPreferences: z.array(z.string()).optional(),

  runningLevel: z.string().optional(),
  runningExperience: z.string().optional(),
  runningDistance: z.string().optional(),
  runningPace: z.string().optional(),
  runningGoals: z.string().optional(),
  runningPreferences: z.array(z.string()).optional(),

  hikingLevel: z.string().optional(),
  skiiingLevel: z.string().optional(),
  surfingLevel: z.string().optional(),
  tennisLevel: z.string().optional(),

  gear: z.array(z.string()).optional(),
});

export const handleCreateProfileFromOnboarding = async (req: Request, res: Response) => {
  try {
    console.log("=== CREATE PROFILE FROM ONBOARDING ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log("Authorization header:", req.headers.authorization);

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.log("Supabase not configured, returning demo response");
      
      // Map onboarding data to profile format for demo
      const onboardingData = req.body;
      const age = onboardingData.birthday ? calculateAge(onboardingData.birthday) : null;
      const demoProfile = {
        id: "demo-user-onboarded",
        email: onboardingData.email || "demo@example.com",
        full_name: onboardingData.full_name || onboardingData.name || "Demo User",
        bio: onboardingData.bio || createBioFromOnboarding(onboardingData),
        profile_image: null,
        university: !onboardingData.hideUniversity ? onboardingData.university : null,
        // Extended fields (may not exist in all setups)
        phone: null,
        gender: onboardingData.gender || null,
        age: age,
        date_of_birth: onboardingData.birthday || null,
        nationality: onboardingData.country || null,
        institution: !onboardingData.hideUniversity ? onboardingData.university : null,
        occupation: onboardingData.profession || null,
        location: onboardingData.location || onboardingData.country || null,
        visibility_settings: {
          institution: !onboardingData.hideUniversity,
          profile_image: true,
          full_name: true,
          bio: true,
          email: false,
          phone: true,
          gender: true,
          age: true,
          date_of_birth: false,
          nationality: true,
          occupation: true,
          location: true,
          sports: true,
          achievements: true,
          activities: true,
          reviews: true,
          followers: true,
          following: true,
        },
        sports: mapOnboardingSportsToProfile(onboardingData),
        achievements: [],
        languages: onboardingData.languages || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return res.json({
        success: true,
        message: "Demo profile created from onboarding data",
        profile: demoProfile,
      });
    }

    // Get user from token
    const user = await getUserFromToken(req.headers.authorization || "");
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Validate onboarding data
    const onboardingData = OnboardingProfileSchema.parse(req.body);
    console.log("Validated onboarding data:", onboardingData);

    // Calculate age from birthday
    const age = onboardingData.birthday ? calculateAge(onboardingData.birthday) : null;
    
    // Map onboarding data to profile structure (using only core fields)
    const profileData = {
      id: user.id,
      email: onboardingData.email,
      full_name: onboardingData.full_name,
      bio: onboardingData.bio || createBioFromOnboarding(onboardingData),
      profile_image: null,
      university: !onboardingData.hideUniversity ? onboardingData.university : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Extended fields to try - these might not exist in all database setups
    const extendedData = {
      phone: null,
      gender: onboardingData.gender || null,
      age: age,
      date_of_birth: onboardingData.birthday || null,
      nationality: onboardingData.country || null,
      institution: !onboardingData.hideUniversity ? onboardingData.university : null,
      occupation: onboardingData.profession || null,
      location: onboardingData.location || onboardingData.country || null,
      visibility_settings: {
        profile_image: true,
        full_name: true,
        bio: true,
        email: false,
        phone: true,
        gender: true,
        age: true,
        date_of_birth: false,
        nationality: true,
        institution: !onboardingData.hideUniversity,
        occupation: true,
        location: true,
        sports: true,
        achievements: true,
        activities: true,
        reviews: true,
        followers: true,
        following: true,
      },
    };

    console.log("Profile data to create:", profileData);
    console.log("Extended data to attempt:", extendedData);

    // Try to create profile with extended fields first
    let profile;
    let finalProfileData = { ...profileData, ...extendedData };

    const { data: extendedProfile, error: extendedError } = await supabaseAdmin
      .from("profiles")
      .upsert(finalProfileData)
      .select("*")
      .single();

    if (extendedError) {
      console.log("Extended profile creation failed, trying core fields only:", extendedError.message);

      // Fall back to core fields only
      const { data: coreProfile, error: coreError } = await supabaseAdmin
        .from("profiles")
        .upsert(profileData)
        .select("*")
        .single();

      if (coreError) {
        console.error("Core profile creation also failed:", coreError);
        return res.status(500).json({
          success: false,
          error: "Failed to create profile from onboarding data",
          details: coreError.message,
        });
      }

      profile = coreProfile;
      console.log("Successfully created profile with core fields only");
    } else {
      profile = extendedProfile;
      console.log("Successfully created profile with extended fields");
    }

    console.log("Profile created successfully:", profile);

    // Create sports profiles if sports data exists
    if (onboardingData.sports && onboardingData.sports.length > 0) {
      await createSportsProfiles(user.id, onboardingData);
    }

    // Return the created profile with sports data
    const sportsData = mapOnboardingSportsToProfile(onboardingData);
    const response = {
      success: true,
      message: "Profile created successfully from onboarding data",
      profile: {
        ...profile,
        sports: sportsData,
        achievements: [],
        languages: onboardingData.languages || [],
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Onboarding profile creation error:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid onboarding data",
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create profile from onboarding",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Helper function to calculate age from birthday
function calculateAge(birthday: string): number {
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Helper function to create bio from onboarding data
function createBioFromOnboarding(data: any): string {
  const parts = [];
  
  if (data.profession) {
    parts.push(data.profession);
  }
  
  if (data.country) {
    parts.push(`from ${data.country}`);
  }
  
  if (data.sports && data.sports.length > 0) {
    const sportsList = data.sports.slice(0, 3).join(", ");
    parts.push(`enjoys ${sportsList}`);
  }
  
  return parts.join(", ") || "Outdoor enthusiast";
}

// Helper function to map onboarding sports data to profile format
function mapOnboardingSportsToProfile(data: any) {
  const sports = [];
  
  if (data.sports && Array.isArray(data.sports)) {
    for (const sport of data.sports) {
      const sportLower = sport.toLowerCase();
      const levelKey = `${sportLower}Level`;
      const experienceKey = `${sportLower}Experience`;
      
      const sportProfile = {
        id: `${sportLower}-${Date.now()}`,
        sport: sport,
        level: data[levelKey] || "Beginner",
        experience: data[experienceKey] || "",
      };

      // Add sport-specific fields
      if (sport.toLowerCase() === "climbing") {
        sportProfile.maxGrade = data.climbingMaxGrade || "";
        sportProfile.certifications = data.climbingCertifications || [];
        sportProfile.specialties = data.climbingSpecialties || [];
        sportProfile.preferences = data.climbingSkills || [];
      } else if (sport.toLowerCase() === "cycling") {
        sportProfile.distance = data.cyclingDistance || "";
        sportProfile.pace = data.cyclingPace || "";
        sportProfile.preferences = data.cyclingPreferences || [];
      } else if (sport.toLowerCase() === "running") {
        sportProfile.distance = data.runningDistance || "";
        sportProfile.pace = data.runningPace || "";
        sportProfile.goals = data.runningGoals || "";
        sportProfile.preferences = data.runningPreferences || [];
      }

      sports.push(sportProfile);
    }
  }
  
  return sports;
}

// Helper function to create sports profiles in database
async function createSportsProfiles(userId: string, data: any) {
  try {
    const sportsData = [];
    
    if (data.sports && Array.isArray(data.sports)) {
      for (const sport of data.sports) {
        const sportLower = sport.toLowerCase();
        const levelKey = `${sportLower}Level`;
        const experienceKey = `${sportLower}Experience`;
        
        const sportEntry = {
          profile_id: userId,
          sport: sport,
          level: data[levelKey] || "Beginner",
          experience: data[experienceKey] || "",
          max_grade: "",
          certifications: [],
          specialties: [],
          preferences: [],
        };

        // Add sport-specific fields
        if (sport.toLowerCase() === "climbing") {
          sportEntry.max_grade = data.climbingMaxGrade || "";
          sportEntry.certifications = data.climbingCertifications || [];
          sportEntry.specialties = data.climbingSpecialties || [];
          sportEntry.preferences = data.climbingSkills || [];
        } else if (sport.toLowerCase() === "cycling") {
          sportEntry.preferences = data.cyclingPreferences || [];
        } else if (sport.toLowerCase() === "running") {
          sportEntry.preferences = data.runningPreferences || [];
        }

        sportsData.push(sportEntry);
      }
    }

    if (sportsData.length > 0) {
      // First delete existing sports for this user
      await supabaseAdmin
        .from("profile_sports")
        .delete()
        .eq("profile_id", userId);

      // Insert new sports data
      const { error: sportsError } = await supabaseAdmin
        .from("profile_sports")
        .insert(sportsData);

      if (sportsError) {
        console.error("Sports data creation error:", sportsError);
        // Don't fail the whole operation, just log the error
      } else {
        console.log("Sports profiles created successfully");
      }
    }
  } catch (error) {
    console.error("Error creating sports profiles:", error);
    // Don't fail the whole operation
  }
}

export const handleUpdateProfileFromOnboarding = async (req: Request, res: Response) => {
  try {
    console.log("=== UPDATE PROFILE FROM ONBOARDING ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.log("Supabase not configured, returning demo response");
      
      const onboardingData = req.body;
      const updatedProfile = {
        id: "demo-user-updated",
        email: onboardingData.email || "demo@example.com",
        full_name: onboardingData.full_name || onboardingData.name || "Demo User",
        bio: onboardingData.bio || createBioFromOnboarding(onboardingData),
        profile_image: null,
        phone: null,
        gender: onboardingData.gender || null,
        age: onboardingData.birthday ? calculateAge(onboardingData.birthday) : null,
        date_of_birth: onboardingData.birthday || null,
        nationality: onboardingData.country || null,
        institution: !onboardingData.hideUniversity ? onboardingData.university : null,
        occupation: onboardingData.profession || null,
        location: onboardingData.location || onboardingData.country || null,
        visibility_settings: {
          institution: !onboardingData.hideUniversity
        },
        sports: mapOnboardingSportsToProfile(onboardingData),
        achievements: [],
        languages: onboardingData.languages || [],
        updated_at: new Date().toISOString(),
      };

      return res.json({
        success: true,
        message: "Demo profile updated from onboarding data",
        profile: updatedProfile,
      });
    }

    // Get user from token
    const user = await getUserFromToken(req.headers.authorization || "");
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Validate and update profile using the same logic as create
    const result = await handleCreateProfileFromOnboarding(req, res);
    return result;
  } catch (error) {
    console.error("Profile update from onboarding error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update profile from onboarding",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
