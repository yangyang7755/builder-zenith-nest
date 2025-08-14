import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";
import { useActivities } from "../contexts/ActivitiesContext";
import { useToast } from "../contexts/ToastContext";
import DateTimePicker from "../components/DateTimePicker";
import MapView from "../components/MapView";

// Helper function to generate surfing requirements based on type and conditions
function getSurfingRequirements(surfingType: string, skillLevel: string, waveHeight: string) {
  const baseRequirements = {
    title: "intermediate surfing skills",
    description: "This surfing session requires ocean swimming ability and surfing experience.",
    details: [] as string[],
    warning: "Ocean surfing involves strong currents, changing conditions, and risk of injury. Always respect the ocean and surf within your ability level.",
  };

  const waveSize = parseFloat(waveHeight) || 0;

  if (surfingType === "Dawn Patrol") {
    baseRequirements.title = "dawn patrol surfing experience";
    baseRequirements.details = [
      "Comfortable surfing in low light conditions",
      "Experienced with paddle out in varying conditions",
      "Strong swimming ability in ocean currents",
      "Own surfboard and wetsuit appropriate for conditions",
      "Basic knowledge of tide patterns and surf forecasting",
    ];
  } else if (surfingType === "Longboard") {
    baseRequirements.title = "longboard surfing ability";
    baseRequirements.details = [
      "Experience with longboard surfing techniques",
      "Comfortable with nose riding and cross-stepping",
      "Understanding of longboard wave selection",
      "Own longboard (9+ feet) or rental available",
      "Basic surfing etiquette and lineup positioning",
    ];
  } else if (surfingType === "Shortboard") {
    baseRequirements.title = "shortboard surfing proficiency";
    baseRequirements.details = [
      "Advanced surfing skills with shortboard experience",
      "Comfortable with high-performance maneuvers",
      "Ability to paddle and catch waves in competitive conditions",
      "Own shortboard (under 7 feet) and appropriate fins",
      "Experience surfing in crowds and understanding priority rules",
    ];
  } else {
    // General surfing
    baseRequirements.details = [
      "Comfortable paddling and catching unbroken waves",
      "Able to stand up and ride waves consistently",
      "Strong ocean swimming ability (minimum 200m)",
      "Basic understanding of surf safety and etiquette",
      "Own surfboard and wetsuit or rental equipment available",
    ];
  }

  // Add wave size specific requirements
  if (waveSize > 6) {
    baseRequirements.details.push("Experience surfing large waves (6+ feet)");
    baseRequirements.details.push("Advanced paddle strength for heavy conditions");
    baseRequirements.warning = "Large wave surfing is extremely dangerous. Only join if you're an experienced surfer comfortable in powerful conditions.";
  } else if (waveSize > 3) {
    baseRequirements.details.push("Comfortable in medium-sized waves (3-6 feet)");
    baseRequirements.details.push("Intermediate surfing experience required");
  }

  // Add skill level specific requirements
  if (skillLevel === "Advanced") {
    baseRequirements.details.push("Advanced surfing skills and ocean knowledge");
    baseRequirements.details.push("Experience with various board types and conditions");
  } else if (skillLevel === "Intermediate") {
    baseRequirements.details.push("Solid basic surfing skills and wave judgment");
    baseRequirements.details.push("Some experience surfing different breaks");
  } else {
    baseRequirements.title = "basic surfing ability";
    baseRequirements.details = baseRequirements.details.filter(d => 
      !d.includes("Advanced") && !d.includes("high-performance")
    );
  }

  return baseRequirements;
}

// Helper function to map surfing details to difficulty
function getDifficultyFromSurfing(skillLevel: string, waveHeight: string, surfingType: string): string {
  const waveSize = parseFloat(waveHeight) || 0;
  
  if (skillLevel === "Advanced" || waveSize > 6 || surfingType === "Shortboard") return "Advanced";
  if (skillLevel === "Intermediate" || waveSize > 3 || surfingType === "Dawn Patrol") return "Intermediate";
  return "Beginner";
}

export default function CreateSurfingSimple() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [selectedType, setSelectedType] = useState("Beach Break");
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [formData, setFormData] = useState({
    maxPeople: "",
    location: "",
    meetupLocation: "",
    coordinates: { lat: 50.2166, lng: -5.2132 }, // Default to Cornwall
    date: "",
    time: "",
    skillLevel: "Beginner" as "Beginner" | "Intermediate" | "Advanced",
    surfingType: "General" as "General" | "Dawn Patrol" | "Longboard" | "Shortboard",
    waveHeight: "",
    waveConditions: "Clean" as "Clean" | "Choppy" | "Onshore" | "Offshore",
    tideInfo: "",
    waterTemp: "",
    equipmentProvided: false,
    coachingIncluded: false,
    duration: "120",
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
    const typeText = formData.surfingType !== "General" ? `${formData.surfingType} ` : "";
    const waveText = formData.waveHeight ? ` - ${formData.waveHeight}ft` : "";
    const activityTitle = `${typeText}Surf Session${waveText}`;
    const requirements = getSurfingRequirements(formData.surfingType, formData.skillLevel, formData.waveHeight);
    const difficulty = getDifficultyFromSurfing(formData.skillLevel, formData.waveHeight, formData.surfingType);

    addActivity({
      type: "surfing",
      title: activityTitle,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      meetupLocation: formData.meetupLocation,
      organizer: "You",
      maxParticipants: formData.maxPeople,
      specialComments: formData.specialComments,
      description: formData.specialComments || `Join us for ${typeText.toLowerCase()}surfing at ${formData.location}. ${requirements.description}`,
      skillLevel: formData.skillLevel,
      surfingType: formData.surfingType,
      waveHeight: formData.waveHeight,
      waveConditions: formData.waveConditions,
      tideInfo: formData.tideInfo,
      waterTemp: formData.waterTemp,
      equipmentProvided: formData.equipmentProvided,
      coachingIncluded: formData.coachingIncluded,
      duration: formData.duration,
      subtype: selectedType,
      gender: formData.femaleOnly ? "Female only" : "All genders",
      ageMin: formData.ageMin,
      ageMax: formData.ageMax,
      visibility: formData.visibility,
      difficulty: difficulty,
      club: formData.visibility === "Club members" ? "surf-club" : undefined,
      coordinates: formData.coordinates,
      requirements: requirements,
      imageSrc: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=40&h=40&fit=crop&crop=face",
    });

    showToast("Surfing activity created successfully!", "success");
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
              New surf session! 🏄‍♂️
            </h1>
          </div>

          <div className="space-y-6">
            {/* Break Type */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Break Type
              </h3>
              <div className="flex gap-2 flex-wrap">
                {["Beach Break", "Point Break", "Reef Break", "River Mouth"].map((type) => (
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

            {/* Surfing Type */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Session Type
              </h3>
              <div className="flex gap-2 flex-wrap">
                {["General", "Dawn Patrol", "Longboard", "Shortboard"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFormData({ ...formData, surfingType: type as any })}
                    className={`px-4 py-2 rounded-lg border border-black font-bold text-sm font-cabin ${
                      formData.surfingType === type
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
                Required Skill Level
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

            {/* Wave Conditions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium text-black font-cabin mb-3">
                  Wave Height (ft)
                </h3>
                <input
                  type="number"
                  value={formData.waveHeight}
                  onChange={(e) =>
                    setFormData({ ...formData, waveHeight: e.target.value })
                  }
                  className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                  placeholder="e.g. 3-4"
                />
              </div>
              <div>
                <h3 className="text-lg font-medium text-black font-cabin mb-3">
                  Conditions
                </h3>
                <select
                  value={formData.waveConditions}
                  onChange={(e) =>
                    setFormData({ ...formData, waveConditions: e.target.value as any })
                  }
                  className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                >
                  <option value="Clean">Clean</option>
                  <option value="Choppy">Choppy</option>
                  <option value="Onshore">Onshore</option>
                  <option value="Offshore">Offshore</option>
                </select>
              </div>
            </div>

            {/* Tide and Water Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium text-black font-cabin mb-3">
                  Tide Info
                </h3>
                <input
                  type="text"
                  value={formData.tideInfo}
                  onChange={(e) =>
                    setFormData({ ...formData, tideInfo: e.target.value })
                  }
                  className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                  placeholder="e.g. High 7:30 AM"
                />
              </div>
              <div>
                <h3 className="text-lg font-medium text-black font-cabin mb-3">
                  Water Temp (°C)
                </h3>
                <input
                  type="number"
                  value={formData.waterTemp}
                  onChange={(e) =>
                    setFormData({ ...formData, waterTemp: e.target.value })
                  }
                  className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                  placeholder="e.g. 14"
                />
              </div>
            </div>

            {/* Max number of people */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Max number of surfers
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

            {/* Duration */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Session Duration
              </h3>
              <select
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
              >
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
                <option value="180">3 hours</option>
                <option value="240">Half day</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Surf Spot
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                  placeholder="Enter surf spot name"
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
                placeholder="Where should surfers meet? (e.g., Car park, Beach access)"
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
                    Surfboard/wetsuit rental available
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
                    Surf coaching/instruction included
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
                  placeholder="Describe wave conditions, local hazards, gear requirements, or meeting details..."
                />
              </div>

              {/* Create activity button */}
              <button
                onClick={handleSubmit}
                className="w-full bg-explore-green text-white py-3 px-6 rounded-lg text-base font-cabin font-medium"
              >
                Create surf session
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
              <h3 className="text-lg font-bold">Choose Surf Spot</h3>
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
