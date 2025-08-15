import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface UserProfile {
  name: string;
  birthday: string;
  gender: string;
  sports: string[];
  languages: string[];
  country: string;
  profession: string;
  university: string;
  bio?: string;
  location?: string;

  // Enhanced sports information
  climbingLevel?: string;
  climbingExperience?: string;
  climbingMaxGrade?: string;
  climbingCertifications?: string[];
  climbingSpecialties?: string[];
  climbingSkills?: string[];

  cyclingLevel?: string;
  cyclingExperience?: string;
  cyclingDistance?: string;
  cyclingPace?: string;
  cyclingPreferences?: string[];

  runningLevel?: string;
  runningExperience?: string;
  runningDistance?: string;
  runningPace?: string;
  runningGoals?: string;
  runningPreferences?: string[];

  hikingLevel?: string;
  skiiingLevel?: string;
  surfingLevel?: string;
  tennisLevel?: string;

  gear?: string[];
  hideUniversity?: boolean;
}

interface OnboardingContextType {
  isOnboardingComplete: boolean;
  userProfile: UserProfile;
  currentStep: number;
  totalSteps: number;
  updateProfile: (data: Partial<UserProfile>) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  showWelcomeMessage: boolean;
  dismissWelcomeMessage: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_STORAGE_KEY = "explore_app_onboarding";
const WELCOME_STORAGE_KEY = "explore_app_welcome_shown";

const defaultProfile: UserProfile = {
  name: "",
  birthday: "",
  gender: "",
  sports: [],
  languages: [],
  country: "",
  profession: "",
  university: "",
  bio: "",
  location: "",

  climbingLevel: "",
  climbingExperience: "",
  climbingMaxGrade: "",
  climbingCertifications: [],
  climbingSpecialties: [],
  climbingSkills: [],

  cyclingLevel: "",
  cyclingExperience: "",
  cyclingDistance: "",
  cyclingPace: "",
  cyclingPreferences: [],

  runningLevel: "",
  runningExperience: "",
  runningDistance: "",
  runningPace: "",
  runningGoals: "",
  runningPreferences: [],

  hikingLevel: "",
  skiiingLevel: "",
  surfingLevel: "",
  tennisLevel: "",

  gear: [],
  hideUniversity: false,
};

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [currentStep, setCurrentStep] = useState(1);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const totalSteps = 9; // name, birthday, gender, sports, languages, country, profession, university, skill levels

  // Load onboarding state from localStorage on mount
  useEffect(() => {
    const savedOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    const welcomeShown = localStorage.getItem(WELCOME_STORAGE_KEY);
    
    if (savedOnboarding) {
      const data = JSON.parse(savedOnboarding);
      setIsOnboardingComplete(data.isComplete || false);
      setUserProfile(data.profile || defaultProfile);
      
      // Show welcome message if onboarding just completed and haven't shown welcome yet
      if (data.isComplete && !welcomeShown) {
        setShowWelcomeMessage(true);
      }
    }
  }, []);

  const updateProfile = (data: Partial<UserProfile>) => {
    const newProfile = { ...userProfile, ...data };
    setUserProfile(newProfile);
    
    // Save to localStorage
    const onboardingData = {
      isComplete: isOnboardingComplete,
      profile: newProfile,
    };
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(onboardingData));
  };

  const completeOnboarding = async () => {
    setIsOnboardingComplete(true);
    setShowWelcomeMessage(true);

    const onboardingData = {
      isComplete: true,
      profile: userProfile,
    };
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(onboardingData));

    // Try to create backend profile if we have meaningful onboarding data
    try {
      // Import here to avoid circular dependency
      const { createProfileFromOnboarding, hasOnboardingData } = await import("../services/onboardingService");

      if (hasOnboardingData(userProfile)) {
        console.log("Onboarding completed with meaningful data, attempting to create backend profile");

        // Get current auth token if available
        const { supabase } = await import("../lib/supabase");
        let authToken = "";

        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          authToken = session?.access_token || "";
        }

        // Get user email from auth or use a placeholder
        let userEmail = "user@example.com";
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          userEmail = user?.email || userEmail;
        }

        await createProfileFromOnboarding(userProfile, userEmail, authToken);
        console.log("Backend profile created successfully from onboarding data");
      } else {
        console.log("Onboarding completed but insufficient data for backend profile creation");
      }
    } catch (error) {
      console.error("Failed to create backend profile from onboarding:", error);
      // Don't fail the onboarding completion if backend profile creation fails
    }
  };

  const resetOnboarding = () => {
    setIsOnboardingComplete(false);
    setUserProfile(defaultProfile);
    setCurrentStep(1);
    setShowWelcomeMessage(false);
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    localStorage.removeItem(WELCOME_STORAGE_KEY);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const dismissWelcomeMessage = () => {
    setShowWelcomeMessage(false);
    localStorage.setItem(WELCOME_STORAGE_KEY, "true");
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOnboardingComplete,
        userProfile,
        currentStep,
        totalSteps,
        updateProfile,
        completeOnboarding,
        resetOnboarding,
        setCurrentStep,
        nextStep,
        previousStep,
        showWelcomeMessage,
        dismissWelcomeMessage,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
