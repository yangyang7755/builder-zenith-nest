import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useOnboarding } from "../contexts/OnboardingContext";
import { hasOnboardingData, getOnboardingCompletionSummary } from "../services/onboardingService";

interface OnboardingProfileSyncProps {
  children: React.ReactNode;
}

export const OnboardingProfileSync: React.FC<OnboardingProfileSyncProps> = ({ children }) => {
  const { user, profile, createProfileFromOnboardingData, hasOnboardingBasedProfile } = useAuth();
  const { userProfile, isOnboardingComplete } = useOnboarding();
  const [syncAttempted, setSyncAttempted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const attemptProfileSync = async () => {
      // Only attempt sync once per session
      if (syncAttempted) return;
      
      // Only sync if user is authenticated
      if (!user) return;
      
      // Only sync if onboarding is complete and has meaningful data
      if (!isOnboardingComplete || !hasOnboardingData(userProfile)) return;
      
      // Only sync if current profile doesn't seem to be from onboarding
      if (hasOnboardingBasedProfile()) return;

      console.log("Attempting to sync onboarding data with backend profile");
      setIsLoading(true);
      setSyncAttempted(true);

      try {
        await createProfileFromOnboardingData(userProfile);
        console.log("Successfully synced onboarding data with backend profile");
      } catch (error) {
        console.error("Failed to sync onboarding data with backend profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    attemptProfileSync();
  }, [
    user,
    profile,
    userProfile,
    isOnboardingComplete,
    syncAttempted,
    createProfileFromOnboardingData,
    hasOnboardingBasedProfile
  ]);

  // Show loading indicator if syncing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-explore-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-cabin">Updating your profile...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Hook to get onboarding-based profile info
export const useOnboardingProfileInfo = () => {
  const { userProfile, isOnboardingComplete } = useOnboarding();
  const { profile, hasOnboardingBasedProfile } = useAuth();
  
  const onboardingDataExists = hasOnboardingData(userProfile);
  const completionSummary = getOnboardingCompletionSummary(userProfile);
  const profileIsFromOnboarding = hasOnboardingBasedProfile();
  
  return {
    onboardingProfile: userProfile,
    isOnboardingComplete,
    onboardingDataExists,
    completionSummary,
    profileIsFromOnboarding,
    currentProfile: profile,
    shouldUseOnboardingData: onboardingDataExists && !profileIsFromOnboarding,
  };
};

// Component to show onboarding completion status
export const OnboardingCompletionBadge: React.FC = () => {
  const { completionSummary, isOnboardingComplete } = useOnboardingProfileInfo();
  
  if (!isOnboardingComplete) return null;
  
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm font-medium text-green-800">
          Onboarding Complete ({completionSummary.completionPercentage}%)
        </span>
      </div>
      <p className="text-xs text-green-600 mt-1">
        {completionSummary.completedSteps} of {completionSummary.totalSteps} steps completed
      </p>
    </div>
  );
};

export default OnboardingProfileSync;
