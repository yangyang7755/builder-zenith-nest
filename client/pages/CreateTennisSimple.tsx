import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";
import { useActivities } from "../contexts/ActivitiesContext";
import { useToast } from "../contexts/ToastContext";
import DateTimePicker from "../components/DateTimePicker";
import MapView from "../components/MapView";

// Helper function to generate tennis requirements based on type and skill level
function getTennisRequirements(tennisType: string, skillLevel: string, isCompetitive: boolean) {
  const baseRequirements = {
    title: "basic tennis skills",
    description: "This tennis session requires basic tennis knowledge and appropriate equipment.",
    details: [] as string[],
    warning: "Tennis involves physical activity and potential for injury. Please play within your ability level.",
  };

  if (isCompetitive) {
    baseRequirements.title = "competitive tennis experience";
    baseRequirements.details = [
      "Consistent serve and groundstrokes",
      "Understanding of match play and scoring",
      "Own tennis racquet and appropriate tennis attire",
      "Ability to play competitive sets",
      "Experience with tournament-style play",
    ];
    baseRequirements.warning = "Competitive tennis is physically demanding. Ensure you're match-fit and warmed up properly.";
  } else if (tennisType === "Doubles") {
    baseRequirements.title = "doubles tennis knowledge";
    baseRequirements.details = [
      "Understanding of doubles court positioning",
      "Basic knowledge of doubles strategy and communication",
      "Comfortable playing at the net and baseline",
      "Own tennis racquet in good condition",
      "Appropriate tennis footwear and clothing",
    ];
  } else if (tennisType === "Singles") {
    baseRequirements.title = "singles tennis ability";
    baseRequirements.details = [
      "Consistent baseline groundstrokes (forehand and backhand)",
      "Basic serving technique and ability",
      "Understanding of tennis scoring system",
      "Own tennis racquet and tennis balls",
      "Appropriate non-marking tennis shoes",
    ];
  } else {
    // Casual/Social tennis
    baseRequirements.title = "basic tennis knowledge";
    baseRequirements.details = [
      "Basic ability to hit and return tennis balls",
      "Understanding of basic tennis rules",
      "Own tennis racquet (or equipment available for rental)",
      "Comfortable with light physical activity",
      "Appropriate sports clothing and footwear",
    ];
  }

  // Add skill-level specific requirements
  if (skillLevel === "Advanced") {
    baseRequirements.details.push("Advanced stroke technique and match experience");
    baseRequirements.details.push("Understanding of advanced tennis tactics");
  } else if (skillLevel === "Intermediate") {
    baseRequirements.details.push("Solid basic strokes and rally ability");
    baseRequirements.details.push("Some match or lesson experience");
  }

  return baseRequirements;
}

// Helper function to map tennis details to difficulty
function getDifficultyFromTennis(skillLevel: string, isCompetitive: boolean): string {
  if (isCompetitive || skillLevel === "Advanced") return "Advanced";
  if (skillLevel === "Intermediate") return "Intermediate";
  return "Beginner";
}

export default function CreateTennisSimple() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [selectedType, setSelectedType] = useState("Singles");
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [formData, setFormData] = useState({
    maxPeople: "",
    location: "",
    meetupLocation: "",
    coordinates: { lat: 51.5074, lng: -0.1278 },
    date: "",
    time: "",
    skillLevel: "Beginner" as "Beginner" | "Intermediate" | "Advanced",
    courtSurface: "Hard" as "Hard" | "Clay" | "Grass" | "Indoor",
    isCompetitive: false,
    duration: "60",
    equipmentProvided: false,
    coachingIncluded: false,
    refreshments: false,
    femaleOnly: false,
    ageMin: "",
    ageMax: "",
    visibility: "All",
    specialComments: "",
  });

  const { addActivity } = useActivities();

  const handleLocationSelect = (location: { lat: number; lng: number }, address: string) => {
    setFormData(prev => ({
      ...prev,
      location: address,
      coordinates: location
    }));
    setShowLocationMap(false);
  };

  const handleSubmit = () => {
    if (
      !formData.maxPeople ||
      !formData.location ||
      !formData.meetupLocation ||
      !formData.date ||
      !formData.time
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Create activity with proper title and requirements
    const competitiveText = formData.isCompetitive ? "Competitive " : "";
    const activityTitle = `${competitiveText}${selectedType} Tennis`;
    const requirements = getTennisRequirements(selectedType, formData.skillLevel, formData.isCompetitive);
    const difficulty = getDifficultyFromTennis(formData.skillLevel, formData.isCompetitive);

    addActivity({
      type: "tennis",
      title: activityTitle,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      meetupLocation: formData.meetupLocation,
      organizer: "You",
      maxParticipants: formData.maxPeople,
      specialComments: formData.specialComments,
      description: formData.specialComments || `Join us for ${competitiveText.toLowerCase()}${selectedType.toLowerCase()} tennis at ${formData.location}. ${requirements.description}`,
      skillLevel: formData.skillLevel,
      courtSurface: formData.courtSurface,
      isCompetitive: formData.isCompetitive,
      duration: formData.duration,
      equipmentProvided: formData.equipmentProvided,
      coachingIncluded: formData.coachingIncluded,
      refreshments: formData.refreshments,
      subtype: selectedType,
      gender: formData.femaleOnly ? "Female only" : "All genders",
      ageMin: formData.ageMin,
      ageMax: formData.ageMax,
      visibility: formData.visibility,
      difficulty: difficulty,
      club: formData.visibility === "Club members" ? "tennis-club" : undefined,
      coordinates: formData.coordinates,
      requirements: requirements,
      imageSrc: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=40&h=40&fit=crop&crop=face",
    });

    showToast("Tennis activity created successfully!", "success");
    navigate("/explore");
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
            <rect x="1" y="3" width="22" height="10" rx="2" stroke="black" strokeWidth="1" fill="none" />
            <rect x="23" y="6" width="2" height="4" rx="1" fill="black" />
          </svg>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto pb-20 h-[calc(100vh-96px)]">
        <div className="px-6">
          {/* Header */}
          <div className="flex items-center gap-4 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-explore-green font-cabin"
            >
              ← Back
            </button>
          </div>

          {/* Title */}
          <div className="text-center py-4">
            <h1 className="text-3xl font-bold text-explore-green font-cabin">
              New tennis match!
            </h1>
          </div>

          <div className="space-y-6">
            {/* Tennis Type */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Match Type
              </h3>
              <div className="flex gap-2 flex-wrap">
                {["Singles", "Doubles", "Mixed Doubles", "Social"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-lg border border-black font-bold text-sm font-cabin ${
                      selectedType === type
                        ? "bg-explore-green text-white"
                        : "bg-explore-gray text-explore-green"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Skill Level */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Skill Level
              </h3>
              <div className="flex gap-2">
                {["Beginner", "Intermediate", "Advanced"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setFormData({ ...formData, skillLevel: level as any })}
                    className={`px-4 py-2 rounded-lg border border-black font-bold text-sm font-cabin ${
                      formData.skillLevel === level
                        ? "bg-explore-green text-white"
                        : "bg-explore-gray text-explore-green"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Competitive Toggle */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isCompetitive}
                  onChange={(e) =>
                    setFormData({ ...formData, isCompetitive: e.target.checked })
                  }
                  className="w-5 h-5 text-explore-green border-2 border-gray-300 rounded focus:ring-explore-green"
                />
                <span className="text-lg font-medium text-black font-cabin">
                  Competitive match
                </span>
              </label>
            </div>

            {/* Max number of people */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Max number of players
              </h3>
              <input
                type="number"
                value={formData.maxPeople}
                onChange={(e) =>
                  setFormData({ ...formData, maxPeople: e.target.value })
                }
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                placeholder="Enter max number"
              />
            </div>

            {/* Court Surface */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Court Surface
              </h3>
              <select
                value={formData.courtSurface}
                onChange={(e) =>
                  setFormData({ ...formData, courtSurface: e.target.value as any })
                }
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
              >
                <option value="Hard">Hard Court</option>
                <option value="Clay">Clay Court</option>
                <option value="Grass">Grass Court</option>
                <option value="Indoor">Indoor Court</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Session Duration (minutes)
              </h3>
              <select
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
              >
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Tennis Club/Court
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                  placeholder="Enter tennis club or court location"
                />
                <button
                  type="button"
                  onClick={() => setShowLocationMap(true)}
                  className="flex items-center gap-2 text-explore-green font-cabin"
                >
                  <MapPin className="w-4 h-4" />
                  Choose location on map
                </button>
              </div>
            </div>

            {/* Meetup location */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Meetup location
              </h3>
              <input
                type="text"
                value={formData.meetupLocation}
                onChange={(e) =>
                  setFormData({ ...formData, meetupLocation: e.target.value })
                }
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                placeholder="Where should players meet? (e.g., Reception, Court 1)"
              />
            </div>

            {/* Date and Time */}
            <DateTimePicker
              date={formData.date}
              time={formData.time}
              onDateChange={(date) => setFormData({ ...formData, date })}
              onTimeChange={(time) => setFormData({ ...formData, time })}
            />

            {/* Additional Features */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Additional Features
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.equipmentProvided}
                    onChange={(e) =>
                      setFormData({ ...formData, equipmentProvided: e.target.checked })
                    }
                    className="w-5 h-5 text-explore-green border-2 border-gray-300 rounded focus:ring-explore-green"
                  />
                  <span className="text-lg font-medium text-black font-cabin">
                    Equipment provided/rental available
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.coachingIncluded}
                    onChange={(e) =>
                      setFormData({ ...formData, coachingIncluded: e.target.checked })
                    }
                    className="w-5 h-5 text-explore-green border-2 border-gray-300 rounded focus:ring-explore-green"
                  />
                  <span className="text-lg font-medium text-black font-cabin">
                    Coaching/instruction included
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.refreshments}
                    onChange={(e) =>
                      setFormData({ ...formData, refreshments: e.target.checked })
                    }
                    className="w-5 h-5 text-explore-green border-2 border-gray-300 rounded focus:ring-explore-green"
                  />
                  <span className="text-lg font-medium text-black font-cabin">
                    Refreshments provided
                  </span>
                </label>
              </div>
            </div>

            {/* Optional (special filters) */}
            <div>
              <h2 className="text-2xl font-bold text-explore-green font-cabin mb-6">
                Optional (special filters)
              </h2>

              {/* Female Only Checkbox */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.femaleOnly}
                    onChange={(e) =>
                      setFormData({ ...formData, femaleOnly: e.target.checked })
                    }
                    className="w-5 h-5 text-explore-green border-2 border-gray-300 rounded focus:ring-explore-green"
                  />
                  <span className="text-lg font-medium text-black font-cabin">
                    Female only
                  </span>
                </label>
              </div>

              {/* Age range */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-black font-cabin mb-3">
                  Age range
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={formData.ageMin}
                    onChange={(e) =>
                      setFormData({ ...formData, ageMin: e.target.value })
                    }
                    className="border-2 border-gray-300 rounded-lg py-2 px-3 font-cabin"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={formData.ageMax}
                    onChange={(e) =>
                      setFormData({ ...formData, ageMax: e.target.value })
                    }
                    className="border-2 border-gray-300 rounded-lg py-2 px-3 font-cabin"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Activity visibility */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-black font-cabin mb-3">
                  Activity visibility
                </h3>
                <div className="flex gap-2">
                  {["All", "Followers", "Club members"].map((option) => (
                    <button
                      key={option}
                      onClick={() =>
                        setFormData({ ...formData, visibility: option })
                      }
                      className={`px-4 py-2 rounded-lg border border-black font-bold text-sm font-cabin ${
                        formData.visibility === option
                          ? "bg-explore-green text-white"
                          : "bg-explore-gray text-explore-green"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special comments */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-black font-cabin mb-3">
                  Special comments
                </h3>
                <textarea
                  value={formData.specialComments}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specialComments: e.target.value,
                    })
                  }
                  className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin h-32 resize-none"
                  placeholder="Describe skill requirements, match format, or any special instructions..."
                />
              </div>

              {/* Create activity button */}
              <button
                onClick={handleSubmit}
                className="w-full bg-explore-green text-white py-3 px-6 rounded-lg text-base font-cabin font-medium"
              >
                Create tennis activity
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      {showLocationMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full h-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold">Choose Location</h3>
              <button
                onClick={() => setShowLocationMap(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1">
              <MapView
                onLocationSelect={handleLocationSelect}
                initialLocation={formData.coordinates}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
