import React from "react";
import { useOnboardingProfileInfo } from "./OnboardingProfileSync";
import { useAuth } from "../contexts/AuthContext";

interface ProfileInfoDisplayProps {
  showOnboardingStatus?: boolean;
  className?: string;
}

export const ProfileInfoDisplay: React.FC<ProfileInfoDisplayProps> = ({
  showOnboardingStatus = false,
  className = "",
}) => {
  const { profile } = useAuth();
  const {
    onboardingProfile,
    isOnboardingComplete,
    onboardingDataExists,
    profileIsFromOnboarding,
    shouldUseOnboardingData,
    completionSummary,
  } = useOnboardingProfileInfo();

  // Determine which profile data to show
  const displayProfile = shouldUseOnboardingData ? {
    full_name: onboardingProfile.name,
    bio: onboardingProfile.bio || `${onboardingProfile.profession || "Outdoor enthusiast"} from ${onboardingProfile.country || "Unknown"}`,
    age: onboardingProfile.birthday ? calculateAge(onboardingProfile.birthday) : null,
    gender: onboardingProfile.gender,
    nationality: onboardingProfile.country,
    occupation: onboardingProfile.profession,
    institution: !onboardingProfile.hideUniversity ? onboardingProfile.university : null,
    location: onboardingProfile.location || onboardingProfile.country,
    sports: onboardingProfile.sports,
    languages: onboardingProfile.languages,
    isFromOnboarding: true,
  } : {
    ...profile,
    isFromOnboarding: profileIsFromOnboarding,
  };

  if (!displayProfile) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {showOnboardingStatus && (
        <div className="mb-4">
          {onboardingDataExists ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">
                  {shouldUseOnboardingData ? "Using Onboarding Data" : "Using Backend Profile"}
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                {completionSummary.completedSteps} of {completionSummary.totalSteps} onboarding steps completed
                {shouldUseOnboardingData && " (Backend profile pending)"}
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  Using Demo Profile
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Complete onboarding to create your personalized profile
              </p>
            </div>
          )}
        </div>
      )}

      {/* Basic Info */}
      <div>
        <h3 className="text-lg font-semibold text-black mb-2">
          {displayProfile.full_name || "User"}
        </h3>
        {displayProfile.bio && (
          <p className="text-gray-600 text-sm mb-2">{displayProfile.bio}</p>
        )}
      </div>

      {/* Demographics */}
      {(displayProfile.age || displayProfile.gender || displayProfile.nationality) && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          {displayProfile.age && (
            <div>
              <span className="text-gray-500">Age:</span>
              <span className="ml-2 text-gray-800">{displayProfile.age}</span>
            </div>
          )}
          {displayProfile.gender && (
            <div>
              <span className="text-gray-500">Gender:</span>
              <span className="ml-2 text-gray-800">{displayProfile.gender}</span>
            </div>
          )}
          {displayProfile.nationality && (
            <div>
              <span className="text-gray-500">Country:</span>
              <span className="ml-2 text-gray-800">{displayProfile.nationality}</span>
            </div>
          )}
          {displayProfile.location && displayProfile.location !== displayProfile.nationality && (
            <div>
              <span className="text-gray-500">Location:</span>
              <span className="ml-2 text-gray-800">{displayProfile.location}</span>
            </div>
          )}
        </div>
      )}

      {/* Professional Info */}
      {(displayProfile.occupation || displayProfile.institution) && (
        <div className="space-y-2 text-sm">
          {displayProfile.occupation && (
            <div>
              <span className="text-gray-500">Profession:</span>
              <span className="ml-2 text-gray-800">{displayProfile.occupation}</span>
            </div>
          )}
          {displayProfile.institution && (
            <div>
              <span className="text-gray-500">Institution:</span>
              <span className="ml-2 text-gray-800">{displayProfile.institution}</span>
            </div>
          )}
        </div>
      )}

      {/* Sports */}
      {displayProfile.sports && Array.isArray(displayProfile.sports) && displayProfile.sports.length > 0 && (
        <div>
          <span className="text-gray-500 text-sm">Sports:</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {displayProfile.sports.map((sport, index) => (
              <span
                key={index}
                className="bg-explore-green text-white px-2 py-1 rounded-full text-xs"
              >
                {typeof sport === 'string' ? sport : sport.sport || sport}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {displayProfile.languages && Array.isArray(displayProfile.languages) && displayProfile.languages.length > 0 && (
        <div>
          <span className="text-gray-500 text-sm">Languages:</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {displayProfile.languages.map((language, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs"
              >
                {language}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to calculate age
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

export default ProfileInfoDisplay;
