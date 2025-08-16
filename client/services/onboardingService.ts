import { UserProfile } from "../contexts/OnboardingContext";
import { robustFetch } from "../utils/robustFetch";

// Use the robust fetch implementation to handle third-party interference
const safeFetch = robustFetch;

// Transform onboarding data to backend format
export const transformOnboardingToProfileData = (
  onboardingProfile: UserProfile,
  userEmail: string
) => {
  return {
    // Map onboarding name to full_name
    full_name: onboardingProfile.name,
    email: userEmail,
    
    // Direct mapping of onboarding fields
    birthday: onboardingProfile.birthday,
    gender: onboardingProfile.gender,
    sports: onboardingProfile.sports,
    languages: onboardingProfile.languages,
    country: onboardingProfile.country,
    profession: onboardingProfile.profession,
    university: onboardingProfile.university,
    bio: onboardingProfile.bio,
    location: onboardingProfile.location,
    hideUniversity: onboardingProfile.hideUniversity,

    // Sport-specific skill levels
    climbingLevel: onboardingProfile.climbingLevel,
    climbingExperience: onboardingProfile.climbingExperience,
    climbingMaxGrade: onboardingProfile.climbingMaxGrade,
    climbingCertifications: onboardingProfile.climbingCertifications,
    climbingSpecialties: onboardingProfile.climbingSpecialties,
    climbingSkills: onboardingProfile.climbingSkills,

    cyclingLevel: onboardingProfile.cyclingLevel,
    cyclingExperience: onboardingProfile.cyclingExperience,
    cyclingDistance: onboardingProfile.cyclingDistance,
    cyclingPace: onboardingProfile.cyclingPace,
    cyclingPreferences: onboardingProfile.cyclingPreferences,

    runningLevel: onboardingProfile.runningLevel,
    runningExperience: onboardingProfile.runningExperience,
    runningDistance: onboardingProfile.runningDistance,
    runningPace: onboardingProfile.runningPace,
    runningGoals: onboardingProfile.runningGoals,
    runningPreferences: onboardingProfile.runningPreferences,

    hikingLevel: onboardingProfile.hikingLevel,
    skiiingLevel: onboardingProfile.skiiingLevel,
    surfingLevel: onboardingProfile.surfingLevel,
    tennisLevel: onboardingProfile.tennisLevel,

    gear: onboardingProfile.gear,
  };
};

// Create profile from onboarding data
export const createProfileFromOnboarding = async (
  onboardingProfile: UserProfile,
  userEmail: string,
  authToken?: string
): Promise<any> => {
  try {
    console.log("Creating profile from onboarding data:", onboardingProfile);
    
    const profileData = transformOnboardingToProfileData(onboardingProfile, userEmail);
    console.log("Transformed profile data:", profileData);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await safeFetch("/api/profile/onboarding", {
      method: "POST",
      headers,
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        console.error("Profile creation failed:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
          profileData,
          headers
        });
        errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status} - ${response.statusText}`;
      } catch (parseError) {
        console.error("Failed to parse error response:", parseError);
        errorMessage = `HTTP error! status: ${response.status} - ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("Profile created from onboarding:", result);
    return result;
  } catch (error) {
    console.error("Error creating profile from onboarding:", error);
    throw error;
  }
};

// Update profile from onboarding data
export const updateProfileFromOnboarding = async (
  onboardingProfile: UserProfile,
  userEmail: string,
  authToken?: string
): Promise<any> => {
  try {
    console.log("Updating profile from onboarding data:", onboardingProfile);
    
    const profileData = transformOnboardingToProfileData(onboardingProfile, userEmail);
    console.log("Transformed profile data for update:", profileData);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await safeFetch("/api/profile/onboarding", {
      method: "PUT",
      headers,
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Profile update failed:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
        profileData,
        headers
      });
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Profile updated from onboarding:", result);
    return result;
  } catch (error) {
    console.error("Error updating profile from onboarding:", error);
    throw error;
  }
};

// Check if onboarding data has meaningful content
export const hasOnboardingData = (onboardingProfile: UserProfile): boolean => {
  // Check if user has completed basic onboarding steps
  return !!(
    onboardingProfile.name &&
    onboardingProfile.name.trim().length > 0 &&
    (onboardingProfile.birthday ||
     onboardingProfile.gender ||
     (onboardingProfile.sports && onboardingProfile.sports.length > 0) ||
     onboardingProfile.country ||
     onboardingProfile.profession)
  );
};

// Get a summary of completed onboarding steps
export const getOnboardingCompletionSummary = (onboardingProfile: UserProfile) => {
  const steps = {
    name: !!onboardingProfile.name?.trim(),
    birthday: !!onboardingProfile.birthday,
    gender: !!onboardingProfile.gender,
    sports: !!(onboardingProfile.sports && onboardingProfile.sports.length > 0),
    languages: !!(onboardingProfile.languages && onboardingProfile.languages.length > 0),
    country: !!onboardingProfile.country,
    profession: !!onboardingProfile.profession?.trim(),
    university: !!onboardingProfile.university?.trim(),
  };
  
  const completedSteps = Object.values(steps).filter(Boolean).length;
  const totalSteps = Object.keys(steps).length;
  
  return {
    steps,
    completedSteps,
    totalSteps,
    completionPercentage: Math.round((completedSteps / totalSteps) * 100),
  };
};
