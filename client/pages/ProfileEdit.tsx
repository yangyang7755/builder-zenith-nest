import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, User, MapPin, Calendar } from "lucide-react";
import BottomNavigation from "../components/BottomNavigation";

export default function ProfileEdit() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "Maddie Wei",
    bio: "",
    location: "Notting Hill, London",
    age: "25",
    nationality: "Spanish",
    profession: "Student",
    institution: "Oxford University",
    languages: ["🇬🇧", "🇪🇸", "🇫🇷"],
    skillLevels: {
      climbing: "Intermediate",
      cycling: "Advanced", 
      running: "Beginner",
    },
  });

  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const availableLanguages = ["🇬🇧", "🇺🇸", "🇪🇸", "🇫🇷", "🇩🇪", "🇮🇹", "🇵🇹", "🇳🇱"];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSkillLevelChange = (activity: string, level: string) => {
    setFormData(prev => ({
      ...prev,
      skillLevels: {
        ...prev.skillLevels,
        [activity]: level
      }
    }));
  };

  const handleLanguageToggle = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handleSave = () => {
    // Here you would normally save to backend/context
    console.log("Saving profile data:", formData);
    navigate("/profile");
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

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <button
          onClick={() => navigate("/profile")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
        <h1 className="text-lg font-bold text-black font-cabin">Edit Profile</h1>
        <button
          onClick={handleSave}
          className="p-2 bg-explore-green rounded-full hover:bg-green-600 transition-colors"
        >
          <Save className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto pb-20">
        <div className="px-6 py-6 space-y-6">
          
          {/* Profile Picture */}
          <div className="text-center">
            <div className="w-24 h-24 rounded-full border border-black overflow-hidden mx-auto mb-4">
              <img
                src="https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=200&h=200&fit=crop&crop=face"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <button className="text-explore-green font-cabin text-sm underline">
              Change Photo
            </button>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-black font-cabin">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-cabin focus:outline-none focus:border-explore-green"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell others about yourself..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-cabin focus:outline-none focus:border-explore-green resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 font-cabin focus:outline-none focus:border-explore-green"
                />
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-black font-cabin">Personal Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-cabin focus:outline-none focus:border-explore-green"
                min="16"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => handleInputChange("nationality", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-cabin focus:outline-none focus:border-explore-green"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
              <input
                type="text"
                value={formData.profession}
                onChange={(e) => handleInputChange("profession", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-cabin focus:outline-none focus:border-explore-green"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institution/Company</label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => handleInputChange("institution", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-cabin focus:outline-none focus:border-explore-green"
              />
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-black font-cabin">Languages</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.languages.map((language) => (
                <button
                  key={language}
                  onClick={() => handleLanguageToggle(language)}
                  className="text-2xl p-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-red-100 transition-colors"
                >
                  {language}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowLanguagePicker(!showLanguagePicker)}
              className="text-sm text-explore-green font-cabin underline"
            >
              Add Language
            </button>
            
            {showLanguagePicker && (
              <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg">
                {availableLanguages.map((language) => (
                  <button
                    key={language}
                    onClick={() => handleLanguageToggle(language)}
                    className={`text-2xl p-2 rounded-lg transition-colors ${
                      formData.languages.includes(language)
                        ? "bg-explore-green text-white"
                        : "bg-white border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {language}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Skill Levels */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-black font-cabin">Skill Levels</h3>
            
            {Object.entries(formData.skillLevels).map(([activity, level]) => (
              <div key={activity}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {activity}
                </label>
                <div className="flex gap-2">
                  {["Beginner", "Intermediate", "Advanced", "Expert"].map((skillLevel) => (
                    <button
                      key={skillLevel}
                      onClick={() => handleSkillLevelChange(activity, skillLevel)}
                      className={`px-3 py-1 rounded-lg text-sm font-cabin border transition-colors ${
                        level === skillLevel
                          ? "bg-explore-green text-white border-explore-green"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {skillLevel}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="pt-6">
            <button
              onClick={handleSave}
              className="w-full bg-explore-green text-white py-3 rounded-lg font-cabin font-medium hover:bg-green-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
