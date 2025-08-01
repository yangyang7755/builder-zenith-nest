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
  climbingLevel?: string;
  cyclingLevel?: string;
  runningLevel?: string;
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
  completeOnboarding: () => void;
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
  climbingLevel: "",
  cyclingLevel: "",
  runningLevel: "",
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
  const totalSteps = 10; // name, birthday, gender, sports, languages, country, profession, university, skill levels, gear

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

  const completeOnboarding = () => {
    setIsOnboardingComplete(true);
    setShowWelcomeMessage(true);
    
    const onboardingData = {
      isComplete: true,
      profile: userProfile,
    };
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(onboardingData));
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
