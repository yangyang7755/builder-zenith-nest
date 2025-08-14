import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";
import { useActivities } from "../contexts/ActivitiesContext";
import { useToast } from "../contexts/ToastContext";
import DateTimePicker from "../components/DateTimePicker";
import MapView from "../components/MapView";

// Helper function to generate skiing requirements based on type and skill level
function getSkiingRequirements(skiingType: string, skillLevel: string, terrain: string) {
  const baseRequirements = {
    title: "intermediate skiing ability",
    description: "This skiing session requires mountain safety awareness and appropriate equipment.",
    details: [] as string[],
    warning: "Mountain skiing involves inherent risks including changing weather, avalanche danger, and terrain hazards. Always ski within your ability level.",
  };

  if (skiingType === "Alpine") {
    baseRequirements.title = "alpine skiing proficiency";
    baseRequirements.details = [
      "Comfortable skiing parallel turns on groomed runs",
      "Ability to control speed and stop confidently",
      "Experience with chairlifts and mountain procedures",
      "Own skis, boots, and poles or rental available",
      "Valid ski pass or day ticket for the resort",
    ];
  } else if (skiingType === "Cross Country") {
    baseRequirements.title = "cross-country skiing experience";
    baseRequirements.details = [
      "Experience with Nordic skiing technique",
      "Comfortable with diagonal stride and double poling",
      "Own cross-country skis and boots or rental available",
      "Basic understanding of trail marking systems",
      "Appropriate clothing for extended outdoor activity",
    ];
  } else if (skiingType === "Touring") {
    baseRequirements.title = "ski touring experience";
    baseRequirements.details = [
      "Advanced alpine skiing skills",
      "Experience with touring bindings and skins",
      "Basic avalanche safety knowledge",
      "Own touring equipment (skis, boots, bindings, skins)",
      "Avalanche transceiver, probe, and shovel",
    ];
    baseRequirements.warning = "Ski touring involves serious avalanche and mountain risks. Only join if you have proper training and experience in backcountry skiing.";
  } else if (skiingType === "Freestyle") {
    baseRequirements.title = "freestyle skiing skills";
    baseRequirements.details = [
      "Advanced skiing ability on all terrain",
      "Experience with jumps, rails, or terrain park features",
      "Comfortable skiing switch (backwards)",
      "Helmet mandatory for terrain park activity",
      "Understanding of terrain park safety rules",
    ];
  } else {
    // General skiing
    baseRequirements.details = [
      "Basic parallel skiing ability",
      "Comfortable on blue (intermediate) runs",
      "Experience with chairlifts and ski area procedures",
      "Own equipment or rental available at resort",
      "Valid lift pass or day ticket",
    ];
  }

  // Add skill level specific requirements
  if (skillLevel === "Advanced") {
    baseRequirements.details.push("Confident skiing all marked runs including black runs");
    baseRequirements.details.push("Experience with various snow conditions and weather");
  } else if (skillLevel === "Intermediate") {
    baseRequirements.details.push("Comfortable on blue runs with some red run experience");
    baseRequirements.details.push("Solid parallel turn technique");
  } else {
    baseRequirements.title = "basic skiing ability";
    baseRequirements.details = baseRequirements.details.filter(d => 
      !d.includes("Advanced") && !d.includes("black runs")
    );
    baseRequirements.details.push("Completed beginner lessons or equivalent experience");
  }

  // Add terrain-specific requirements
  if (terrain === "Off-piste") {
    baseRequirements.details.push("Off-piste skiing experience and avalanche awareness");
    baseRequirements.details.push("Recommended: avalanche transceiver and basic rescue knowledge");
  } else if (terrain === "Black runs") {
    baseRequirements.details.push("Confident on steep terrain and challenging conditions");
  }

  return baseRequirements;
}

// Helper function to map skiing details to difficulty
function getDifficultyFromSkiing(skillLevel: string, terrain: string, skiingType: string): string {
  if (skillLevel === "Advanced" || terrain === "Off-piste" || skiingType === "Touring" || terrain === "Black runs") return "Advanced";
  if (skillLevel === "Intermediate" || terrain === "Red runs" || skiingType === "Freestyle") return "Intermediate";
  return "Beginner";
}

export default function CreateSkiingSimple() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [selectedType, setSelectedType] = useState("Alpine");
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [formData, setFormData] = useState({
    maxPeople: "",
    location: "",
    meetupLocation: "",
    coordinates: { lat: 46.0207, lng: 7.7491 }, // Default to Swiss Alps
    date: "",
    time: "",
    skillLevel: "Beginner" as "Beginner" | "Intermediate" | "Advanced",
    terrain: "Blue runs" as "Blue runs" | "Red runs" | "Black runs" | "Off-piste" | "Terrain park",
    snowConditions: "Groomed" as "Groomed" | "Powder" | "Packed" | "Icy" | "Spring snow",
    liftPass: "Day pass" as "Day pass" | "Season pass" | "Multi-day" | "Not included",
    equipmentProvided: false,
    instructionIncluded: false,
    aprèsSkiIncluded: false,
    transport: false,
    duration: "Full day",
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
    const terrainText = formData.terrain !== "Blue runs" ? ` - ${formData.terrain}` : "";
    const activityTitle = `${selectedType} Skiing${terrainText}`;
    const requirements = getSkiingRequirements(selectedType, formData.skillLevel, formData.terrain);
    const difficulty = getDifficultyFromSkiing(formData.skillLevel, formData.terrain, selectedType);

    addActivity({
      type: "skiing",
      title: activityTitle,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      meetupLocation: formData.meetupLocation,
      organizer: "You",
      maxParticipants: formData.maxPeople,
      specialComments: formData.specialComments,
      description: formData.specialComments || `Join us for ${selectedType.toLowerCase()} skiing at ${formData.location}. ${requirements.description}`,
      skillLevel: formData.skillLevel,
      terrain: formData.terrain,
      snowConditions: formData.snowConditions,
      liftPass: formData.liftPass,
      equipmentProvided: formData.equipmentProvided,
      instructionIncluded: formData.instructionIncluded,
      aprèsSkiIncluded: formData.aprèsSkiIncluded,
      transport: formData.transport,
      duration: formData.duration,
      subtype: selectedType,
      gender: formData.femaleOnly ? "Female only" : "All genders",
      ageMin: formData.ageMin,
      ageMax: formData.ageMax,
      visibility: formData.visibility,
      difficulty: difficulty,
      club: formData.visibility === "Club members" ? "ski-club" : undefined,
      coordinates: formData.coordinates,
      requirements: requirements,
      imageSrc: "https://images.unsplash.com/photo-1551524164-6cf2ac426081?w=40&h=40&fit=crop&crop=face",
    });

    showToast("Skiing activity created successfully!", "success");
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
              New ski day! ⛷️
            </h1>
          </div>

          <div className="space-y-6">
            {/* Skiing Type */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Skiing Type
              </h3>
              <div className="flex gap-2 flex-wrap">
                {["Alpine", "Cross Country", "Touring", "Freestyle"].map((type) => (
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

            {/* Terrain */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Terrain/Runs
              </h3>
              <select
                value={formData.terrain}
                onChange={(e) =>
                  setFormData({ ...formData, terrain: e.target.value as any })
                }
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
              >
                <option value="Blue runs">Blue runs (Beginner)</option>
                <option value="Red runs">Red runs (Intermediate)</option>
                <option value="Black runs">Black runs (Advanced)</option>
                <option value="Off-piste">Off-piste</option>
                <option value="Terrain park">Terrain park</option>
              </select>
            </div>

            {/* Snow Conditions */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Snow Conditions
              </h3>
              <select
                value={formData.snowConditions}
                onChange={(e) =>
                  setFormData({ ...formData, snowConditions: e.target.value as any })
                }
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
              >
                <option value="Groomed">Groomed runs</option>
                <option value="Powder">Fresh powder</option>
                <option value="Packed">Packed powder</option>
                <option value="Icy">Icy conditions</option>
                <option value="Spring snow">Spring snow</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Duration
              </h3>
              <div className="flex gap-2 flex-wrap">
                {["Half day", "Full day", "Weekend", "Week"].map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setFormData({ ...formData, duration })}
                    className={`px-4 py-2 rounded-lg border border-black font-bold text-sm font-cabin ${
                      formData.duration === duration
                        ? "bg-explore-green text-white"
                        : "bg-explore-gray text-explore-green"
                    }`}
                  >
                    {duration}
                  </button>
                ))}
              </div>
            </div>

            {/* Max number of people */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Max number of skiers
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

            {/* Lift Pass */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Lift Pass
              </h3>
              <select
                value={formData.liftPass}
                onChange={(e) =>
                  setFormData({ ...formData, liftPass: e.target.value as any })
                }
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
              >
                <option value="Day pass">Day pass included</option>
                <option value="Season pass">Season pass holders</option>
                <option value="Multi-day">Multi-day pass included</option>
                <option value="Not included">Not included - buy your own</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Ski Resort/Area
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                  placeholder="Enter ski resort name"
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
                placeholder="Where should skiers meet? (e.g., Base lodge, Lift 1, Car park)"
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
                    Ski equipment rental available
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.instructionIncluded}
                    onChange={(e) =>
                      setFormData({ ...formData, instructionIncluded: e.target.checked })
                    }
                    className="w-5 h-5 text-explore-green border-2 border-gray-300 rounded focus:ring-explore-green"
                  />
                  <span className="text-lg font-medium text-black font-cabin">
                    Ski instruction/lessons included
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.aprèsSkiIncluded}
                    onChange={(e) =>
                      setFormData({ ...formData, aprèsSkiIncluded: e.target.checked })
                    }
                    className="w-5 h-5 text-explore-green border-2 border-gray-300 rounded focus:ring-explore-green"
                  />
                  <span className="text-lg font-medium text-black font-cabin">
                    Après-ski activities included
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.transport}
                    onChange={(e) =>
                      setFormData({ ...formData, transport: e.target.checked })
                    }
                    className="w-5 h-5 text-explore-green border-2 border-gray-300 rounded focus:ring-explore-green"
                  />
                  <span className="text-lg font-medium text-black font-cabin">
                    Transport to resort included
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
                  placeholder="Describe snow conditions, terrain details, equipment needs, or meeting arrangements..."
                />
              </div>

              {/* Create activity button */}
              <button
                onClick={handleSubmit}
                className="w-full bg-explore-green text-white py-3 px-6 rounded-lg text-base font-cabin font-medium"
              >
                Create skiing activity
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
              <h3 className="text-lg font-bold">Choose Ski Resort</h3>
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
