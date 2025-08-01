import { UserProfile } from "../contexts/OnboardingContext";

export interface ExtendedUserProfile extends UserProfile {
  location?: string;
  profileImage?: string;
  followers?: number;
  following?: number;
  overallRating?: number;
  totalReviews?: number;
  joinedDate?: string;
  bio?: string;
  certifications?: string[];
  yearsExperience?: number;
}

// Helper function to calculate age from birthday
export const calculateAge = (birthday: string): number | null => {
  if (!birthday) return null;
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Helper function to convert country to nationality
export const countryToNationality = (country: string): string => {
  const countryNationalityMap: { [key: string]: string } = {
    "United Kingdom": "British",
    "United States": "American",
    "Spain": "Spanish",
    "France": "French",
    "Germany": "German",
    "Italy": "Italian",
    "Portugal": "Portuguese",
    "Netherlands": "Dutch",
    "Belgium": "Belgian",
    "Switzerland": "Swiss",
    "Austria": "Austrian",
    "Sweden": "Swedish",
    "Norway": "Norwegian",
    "Denmark": "Danish",
    "Finland": "Finnish",
    "Poland": "Polish",
    "Czech Republic": "Czech",
    "Slovakia": "Slovak",
    "Hungary": "Hungarian",
    "Romania": "Romanian",
    "Bulgaria": "Bulgarian",
    "Greece": "Greek",
    "Croatia": "Croatian",
    "Slovenia": "Slovenian",
    "Estonia": "Estonian",
    "Latvia": "Latvian",
    "Lithuania": "Lithuanian",
    "Ireland": "Irish",
    "Malta": "Maltese",
    "Luxembourg": "Luxembourgish",
    "Cyprus": "Cypriot",
    "Canada": "Canadian",
    "Australia": "Australian",
    "New Zealand": "New Zealander",
    "Japan": "Japanese",
    "South Korea": "South Korean",
    "China": "Chinese",
    "India": "Indian",
    "Brazil": "Brazilian",
    "Mexico": "Mexican",
    "Argentina": "Argentinian",
    "Chile": "Chilean",
    "Colombia": "Colombian",
    "Peru": "Peruvian",
    "Uruguay": "Uruguayan",
    "Venezuela": "Venezuelan",
    "Ecuador": "Ecuadorian",
    "Bolivia": "Bolivian",
    "Paraguay": "Paraguayan",
    "South Africa": "South African",
    "Egypt": "Egyptian",
    "Morocco": "Moroccan",
    "Tunisia": "Tunisian",
    "Algeria": "Algerian",
    "Kenya": "Kenyan",
    "Tanzania": "Tanzanian",
    "Uganda": "Ugandan",
    "Rwanda": "Rwandan",
    "Ethiopia": "Ethiopian",
    "Ghana": "Ghanaian",
    "Nigeria": "Nigerian",
    "Russia": "Russian",
    "Ukraine": "Ukrainian",
    "Belarus": "Belarusian",
    "Turkey": "Turkish",
    "Israel": "Israeli",
    "Lebanon": "Lebanese",
    "Jordan": "Jordanian",
    "Saudi Arabia": "Saudi Arabian",
    "UAE": "Emirati",
    "Qatar": "Qatari",
    "Kuwait": "Kuwaiti",
    "Bahrain": "Bahraini",
    "Oman": "Omani",
    "Iran": "Iranian",
    "Iraq": "Iraqi",
    "Afghanistan": "Afghan",
    "Pakistan": "Pakistani",
    "Bangladesh": "Bangladeshi",
    "Sri Lanka": "Sri Lankan",
    "Nepal": "Nepalese",
    "Bhutan": "Bhutanese",
    "Maldives": "Maldivian",
    "Thailand": "Thai",
    "Vietnam": "Vietnamese",
    "Cambodia": "Cambodian",
    "Laos": "Laotian",
    "Myanmar": "Burmese",
    "Malaysia": "Malaysian",
    "Singapore": "Singaporean",
    "Indonesia": "Indonesian",
    "Philippines": "Filipino",
    "Brunei": "Bruneian",
  };
  
  return countryNationalityMap[country] || country;
};

// Helper function to get skill levels object
export const getSkillLevels = (profile: UserProfile) => {
  const skillLevels: { [key: string]: string } = {};
  
  if (profile.climbingLevel) skillLevels.climbing = profile.climbingLevel;
  if (profile.cyclingLevel) skillLevels.cycling = profile.cyclingLevel;
  if (profile.runningLevel) skillLevels.running = profile.runningLevel;
  if (profile.hikingLevel) skillLevels.hiking = profile.hikingLevel;
  if (profile.skiiingLevel) skillLevels.skiing = profile.skiiingLevel;
  if (profile.surfingLevel) skillLevels.surfing = profile.surfingLevel;
  if (profile.tennisLevel) skillLevels.tennis = profile.tennisLevel;
  
  return skillLevels;
};

// Get current user profile from onboarding data
export const getCurrentUserProfile = (): ExtendedUserProfile | null => {
  try {
    const onboardingData = localStorage.getItem("explore_app_onboarding");
    if (!onboardingData) return null;
    
    const { userProfile } = JSON.parse(onboardingData);
    if (!userProfile) return null;
    
    return {
      ...userProfile,
      location: "London, UK", // Default location for now
      profileImage: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=200&h=200&fit=crop&crop=face",
      followers: 100,
      following: 105,
      overallRating: 4.8,
      totalReviews: 24,
      joinedDate: "January 2024",
    };
  } catch (error) {
    console.error("Error loading user profile:", error);
    return null;
  }
};

// Sample user profiles for other users in the app
export const getSampleUserProfiles = (): { [key: string]: ExtendedUserProfile } => {
  return {
    "coach-holly": {
      name: "Coach Holly Peristiani",
      birthday: "1992-05-15",
      gender: "Female",
      sports: ["Climbing"],
      languages: ["English", "French", "Spanish"],
      country: "United Kingdom",
      profession: "Climbing Coach",
      university: "Westway Climbing Centre",
      climbingLevel: "Expert",
      gear: ["Rope", "Quickdraws", "Helmet", "Harness"],
      location: "London, UK",
      profileImage: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=200&h=200&fit=crop&crop=face",
      followers: 245,
      following: 89,
      overallRating: 4.9,
      totalReviews: 67,
      joinedDate: "March 2019",
      bio: "Professional climbing coach with 10+ years experience. Love helping people reach new heights! Always looking to share knowledge and create a safe, fun climbing environment.",
      certifications: ["Mountain Leader", "Rock Climbing Instructor", "First Aid"],
      yearsExperience: 15,
      hideUniversity: false,
    },
    "dan-smith": {
      name: "Dan Smith",
      birthday: "1988-09-22",
      gender: "Male",
      sports: ["Cycling", "Running"],
      languages: ["English"],
      country: "United Kingdom",
      profession: "Software Engineer",
      university: "Imperial College London",
      cyclingLevel: "Advanced",
      runningLevel: "Intermediate",
      gear: ["Road Bike", "Helmet", "Running Shoes"],
      location: "Richmond, London",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      followers: 178,
      following: 142,
      overallRating: 4.6,
      totalReviews: 31,
      joinedDate: "July 2020",
      bio: "Cycling enthusiast and weekend warrior. Love exploring new routes around London and beyond!",
      hideUniversity: false,
    },
  };
};

// Get user profile by ID
export const getUserProfile = (userId: string): ExtendedUserProfile | null => {
  if (userId === "current" || userId === "you") {
    return getCurrentUserProfile();
  }
  
  const sampleProfiles = getSampleUserProfiles();
  return sampleProfiles[userId] || null;
};

// Format personal details for display
export const formatPersonalDetails = (profile: ExtendedUserProfile) => {
  const age = calculateAge(profile.birthday);
  const nationality = countryToNationality(profile.country);
  
  return {
    gender: profile.gender,
    age: age,
    nationality: nationality,
    profession: profile.profession,
    institution: profile.hideUniversity ? "Hidden" : profile.university,
    languages: profile.languages,
    joinedDate: profile.joinedDate,
    certifications: profile.certifications,
  };
};

// Check if user profile has completed onboarding
export const hasCompletedOnboarding = (): boolean => {
  try {
    const onboardingData = localStorage.getItem("explore_app_onboarding");
    if (!onboardingData) return false;
    
    const { isComplete } = JSON.parse(onboardingData);
    return Boolean(isComplete);
  } catch (error) {
    return false;
  }
};
