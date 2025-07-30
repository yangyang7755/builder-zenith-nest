import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Calendar, Globe, User, GraduationCap, Briefcase, Languages, Trophy, UserCheck, Target, Package } from "lucide-react";
import { useOnboarding } from "../contexts/OnboardingContext";

export default function Onboarding() {
  const navigate = useNavigate();
  const {
    currentStep,
    totalSteps,
    userProfile,
    updateProfile,
    completeOnboarding,
    nextStep,
    previousStep,
    setCurrentStep,
  } = useOnboarding();

  const [tempData, setTempData] = useState({
    name: userProfile.name,
    birthday: userProfile.birthday,
    gender: userProfile.gender,
    sports: [...userProfile.sports],
    languages: [...userProfile.languages],
    country: userProfile.country,
    profession: userProfile.profession,
    university: userProfile.university,
    climbingLevel: userProfile.climbingLevel || "",
    cyclingLevel: userProfile.cyclingLevel || "",
    runningLevel: userProfile.runningLevel || "",
    hikingLevel: userProfile.hikingLevel || "",
    skiiingLevel: userProfile.skiiingLevel || "",
    surfingLevel: userProfile.surfingLevel || "",
    tennisLevel: userProfile.tennisLevel || "",
    gear: [...(userProfile.gear || [])],
    hideUniversity: userProfile.hideUniversity || false,
  });

  const availableSports = [
    "Climbing", "Cycling", "Running", "Hiking", "Skiing", "Surfing", "Tennis"
  ];

  const genderOptions = ["Female", "Male", "Non-binary", "Prefer not to say"];

  const skillLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

  const availableGear = [
    "Bouldering pad", "Quickdraws", "Rope", "Helmet", "Harness", "Climbing shoes",
    "Road bike", "Mountain bike", "Cycling helmet", "Cycling shoes", "Repair kit",
    "Running shoes", "GPS watch", "Hydration pack", "Trail running gear",
    "Hiking boots", "Backpack", "Navigation equipment", "First aid kit",
    "Skis", "Ski boots", "Ski helmet", "Ski poles", "Ski goggles",
    "Surfboard", "Wetsuit", "Surf wax", "Leash",
    "Tennis racket", "Tennis shoes", "Tennis balls"
  ];

  const availableLanguages = [
    { code: "🇬🇧", name: "English" },
    { code: "🇪🇸", name: "Spanish" },
    { code: "🇫🇷", name: "French" },
    { code: "🇩🇪", name: "German" },
    { code: "🇮🇹", name: "Italian" },
    { code: "🇵🇹", name: "Portuguese" },
    { code: "🇳🇱", name: "Dutch" },
    { code: "🇷🇺", name: "Russian" },
    { code: "🇨🇳", name: "Chinese" },
    { code: "🇯🇵", name: "Japanese" },
  ];

  const countries = [
    "United Kingdom", "Spain", "France", "Germany", "Italy", "Netherlands",
    "United States", "Canada", "Australia", "Portugal", "Belgium", "Switzerland"
  ];

  const handleNext = () => {
    // Update profile with current step data
    if (currentStep === 1 && tempData.name.trim()) {
      updateProfile({ name: tempData.name });
    } else if (currentStep === 2 && tempData.birthday) {
      updateProfile({ birthday: tempData.birthday });
    } else if (currentStep === 3 && tempData.gender) {
      updateProfile({ gender: tempData.gender });
    } else if (currentStep === 4) {
      updateProfile({ sports: tempData.sports });
    } else if (currentStep === 5) {
      updateProfile({ languages: tempData.languages });
    } else if (currentStep === 6 && tempData.country) {
      updateProfile({ country: tempData.country });
    } else if (currentStep === 7 && tempData.profession.trim()) {
      updateProfile({ profession: tempData.profession });
    } else if (currentStep === 8) {
      updateProfile({
        university: tempData.university,
        hideUniversity: tempData.hideUniversity
      });
    } else if (currentStep === 9) {
      // Update skill levels for selected sports
      const skillUpdates = {};
      tempData.sports.forEach(sport => {
        const levelKey = `${sport.toLowerCase()}Level`;
        if (tempData[levelKey]) {
          skillUpdates[levelKey] = tempData[levelKey];
        }
      });
      updateProfile(skillUpdates);
    } else if (currentStep === 10) {
      updateProfile({ gear: tempData.gear });
    }

    if (currentStep === totalSteps) {
      completeOnboarding();
      navigate("/explore");
    } else {
      nextStep();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return tempData.name.trim().length > 0;
      case 2: return tempData.birthday.length > 0;
      case 3: return tempData.gender.length > 0;
      case 4: return tempData.sports.length > 0;
      case 5: return tempData.languages.length > 0;
      case 6: return tempData.country.length > 0;
      case 7: return tempData.profession.trim().length > 0;
      case 8: return true; // University is optional
      case 9: return true; // Skill levels are optional
      case 10: return true; // Gear is optional
      default: return false;
    }
  };

  const toggleSport = (sport: string) => {
    if (tempData.sports.includes(sport)) {
      setTempData(prev => ({
        ...prev,
        sports: prev.sports.filter(s => s !== sport)
      }));
    } else if (tempData.sports.length < 3) {
      setTempData(prev => ({
        ...prev,
        sports: [...prev.sports, sport]
      }));
    }
  };

  const toggleLanguage = (languageCode: string) => {
    if (tempData.languages.includes(languageCode)) {
      setTempData(prev => ({
        ...prev,
        languages: prev.languages.filter(l => l !== languageCode)
      }));
    } else {
      setTempData(prev => ({
        ...prev,
        languages: [...prev.languages, languageCode]
      }));
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-16 h-16 text-explore-green mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-black font-cabin mb-2">
                What's your name?
              </h2>
              <p className="text-gray-600 font-cabin">
                This is how other members will know you
              </p>
            </div>
            <div>
              <input
                type="text"
                value={tempData.name}
                onChange={(e) => setTempData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                className="w-full text-center text-xl border-b-2 border-gray-300 focus:border-explore-green pb-3 bg-transparent font-cabin focus:outline-none"
                autoFocus
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-explore-green mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-black font-cabin mb-2">
                When's your birthday?
              </h2>
              <p className="text-gray-600 font-cabin">
                We use this to match you with age-appropriate activities
              </p>
            </div>
            <div>
              <input
                type="date"
                value={tempData.birthday}
                onChange={(e) => setTempData(prev => ({ ...prev, birthday: e.target.value }))}
                className="w-full text-center text-xl border-b-2 border-gray-300 focus:border-explore-green pb-3 bg-transparent font-cabin focus:outline-none"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Trophy className="w-16 h-16 text-explore-green mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-black font-cabin mb-2">
                What sports do you enjoy?
              </h2>
              <p className="text-gray-600 font-cabin">
                Select up to 3 sports ({tempData.sports.length}/3)
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {availableSports.map((sport) => (
                <button
                  key={sport}
                  onClick={() => toggleSport(sport)}
                  className={`p-4 rounded-lg border-2 font-cabin font-medium transition-all ${
                    tempData.sports.includes(sport)
                      ? "bg-explore-green text-white border-explore-green"
                      : "bg-white text-gray-700 border-gray-300 hover:border-explore-green"
                  } ${tempData.sports.length >= 3 && !tempData.sports.includes(sport) ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={tempData.sports.length >= 3 && !tempData.sports.includes(sport)}
                >
                  {sport}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Languages className="w-16 h-16 text-explore-green mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-black font-cabin mb-2">
                What languages do you speak?
              </h2>
              <p className="text-gray-600 font-cabin">
                Connect with members who speak your language
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {availableLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => toggleLanguage(language.code)}
                  className={`p-4 rounded-lg border-2 font-cabin font-medium transition-all flex items-center gap-2 ${
                    tempData.languages.includes(language.code)
                      ? "bg-explore-green text-white border-explore-green"
                      : "bg-white text-gray-700 border-gray-300 hover:border-explore-green"
                  }`}
                >
                  <span className="text-2xl">{language.code}</span>
                  <span>{language.name}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Globe className="w-16 h-16 text-explore-green mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-black font-cabin mb-2">
                Which country are you from?
              </h2>
              <p className="text-gray-600 font-cabin">
                Find local activities and events
              </p>
            </div>
            <div>
              <select
                value={tempData.country}
                onChange={(e) => setTempData(prev => ({ ...prev, country: e.target.value }))}
                className="w-full text-center text-xl border-b-2 border-gray-300 focus:border-explore-green pb-3 bg-transparent font-cabin focus:outline-none"
              >
                <option value="">Select your country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Briefcase className="w-16 h-16 text-explore-green mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-black font-cabin mb-2">
                What's your profession?
              </h2>
              <p className="text-gray-600 font-cabin">
                Connect with professionals in your field
              </p>
            </div>
            <div>
              <input
                type="text"
                value={tempData.profession}
                onChange={(e) => setTempData(prev => ({ ...prev, profession: e.target.value }))}
                placeholder="e.g., Software Engineer, Teacher, Student"
                className="w-full text-center text-xl border-b-2 border-gray-300 focus:border-explore-green pb-3 bg-transparent font-cabin focus:outline-none"
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <GraduationCap className="w-16 h-16 text-explore-green mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-black font-cabin mb-2">
                University or Institution
              </h2>
              <p className="text-gray-600 font-cabin">
                Find members from your university (optional)
              </p>
            </div>
            <div>
              <input
                type="text"
                value={tempData.university}
                onChange={(e) => setTempData(prev => ({ ...prev, university: e.target.value }))}
                placeholder="e.g., Oxford University, Cambridge University"
                className="w-full text-center text-xl border-b-2 border-gray-300 focus:border-explore-green pb-3 bg-transparent font-cabin focus:outline-none"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white font-cabin max-w-md mx-auto relative">
      {/* Status Bar */}
      <div className="h-11 bg-white flex items-center justify-between px-6 text-black font-medium">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-1 h-3 bg-black rounded-sm"></div>
            ))}
          </div>
          <svg className="w-6 h-4" viewBox="0 0 24 16" fill="none">
            <rect
              x="1"
              y="3"
              width="22"
              height="10"
              rx="2"
              stroke="black"
              strokeWidth="1"
              fill="none"
            />
            <rect x="23" y="6" width="2" height="4" rx="1" fill="black" />
          </svg>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-cabin text-gray-600">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm font-cabin text-gray-600">
            {Math.round((currentStep / totalSteps) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-explore-green h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 px-6 py-8">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="px-6 py-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <button
            onClick={previousStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-cabin font-medium transition-colors ${
              currentStep === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-explore-green border border-explore-green hover:bg-explore-green hover:text-white"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-cabin font-medium transition-colors ${
              canProceed()
                ? "bg-explore-green text-white hover:bg-green-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {currentStep === totalSteps ? (
              <>
                <Check className="w-4 h-4" />
                Complete
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
