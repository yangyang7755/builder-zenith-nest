import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";
import { useActivities } from "../contexts/ActivitiesContext";
import { useToast } from "../contexts/ToastContext";
import DateTimePicker from "../components/DateTimePicker";
import MapView from "../components/MapView";

// Helper function to generate hiking requirements based on type, distance and difficulty
function getHikingRequirements(hikingType: string, distance: string, terrain: string, elevation: string) {
  const baseRequirements = {
    title: "basic hiking fitness",
    description: "This hiking session requires outdoor experience and appropriate gear.",
    details: [] as string[],
    warning: "Hiking involves outdoor risks including weather changes, terrain hazards, and navigation challenges. Always hike within your ability level.",
  };

  const distanceNum = parseFloat(distance) || 0;
  const elevationNum = parseFloat(elevation) || 0;

  if (hikingType === "Mountain") {
    baseRequirements.title = "mountain hiking experience";
    baseRequirements.details = [
      "Experience with steep terrain and elevation gain",
      "Proper hiking boots with ankle support",
      "Navigation skills and map reading ability",
      "Understanding of mountain weather patterns",
      "Emergency equipment (first aid, emergency shelter)",
    ];
    baseRequirements.warning = "Mountain hiking involves serious risks including exposure, navigation challenges, and rapidly changing weather. Ensure you're properly prepared and experienced.";
  } else if (hikingType === "Trail") {
    baseRequirements.title = "trail hiking experience";
    baseRequirements.details = [
      "Comfortable hiking on marked trails",
      "Sturdy hiking shoes or boots",
      "Basic navigation and trail-following skills",
      "Experience with varied terrain and surfaces",
      "Understanding of Leave No Trace principles",
    ];
  } else if (hikingType === "Backpacking") {
    baseRequirements.title = "backpacking experience";
    baseRequirements.details = [
      "Multi-day hiking experience",
      "Own backpacking gear (tent, sleeping bag, stove)",
      "Experience with overnight wilderness camping",
      "Advanced navigation and wilderness skills",
      "Knowledge of wilderness safety and first aid",
    ];
    baseRequirements.warning = "Backpacking involves extended wilderness exposure and self-sufficiency. Only join if you have proper experience and equipment.";
  } else {
    // Day hike
    baseRequirements.details = [
      "Comfortable walking for extended periods",
      "Proper footwear suitable for outdoor terrain",
      "Basic outdoor safety awareness",
      "Ability to carry day pack with water and supplies",
      "Understanding of weather and clothing requirements",
    ];
  }

  // Add distance-specific requirements
  if (distanceNum > 20) {
    baseRequirements.details.push("Experience with long-distance hiking (20km+)");
    baseRequirements.details.push("Advanced fitness and endurance");
  } else if (distanceNum > 10) {
    baseRequirements.details.push("Good hiking fitness for medium distances (10-20km)");
    baseRequirements.details.push("Experience with half-day hikes");
  } else if (distanceNum > 5) {
    baseRequirements.details.push("Basic hiking fitness for short-medium hikes (5-10km)");
  }

  // Add elevation-specific requirements
  if (elevationNum > 1000) {
    baseRequirements.details.push("Experience with significant elevation gain (1000m+)");
    baseRequirements.details.push("Understanding of altitude effects and acclimatization");
  } else if (elevationNum > 500) {
    baseRequirements.details.push("Comfortable with moderate elevation gain (500-1000m)");
  }

  // Add terrain-specific requirements
  if (terrain === "Rocky") {
    baseRequirements.details.push("Experience with rocky terrain and scrambling");
  } else if (terrain === "Steep") {
    baseRequirements.details.push("Comfortable with steep gradients and challenging terrain");
  } else if (terrain === "Cross-country") {
    baseRequirements.details.push("Off-trail navigation skills and wilderness experience");
  }

  return baseRequirements;
}

// Helper function to map hiking details to difficulty
function getDifficultyFromHiking(distance: string, elevation: string, terrain: string, hikingType: string): string {
  const distanceNum = parseFloat(distance) || 0;
  const elevationNum = parseFloat(elevation) || 0;
  
  if (
    distanceNum > 20 || 
    elevationNum > 1000 || 
    terrain === "Cross-country" || 
    terrain === "Rocky" ||
    hikingType === "Backpacking" ||
    hikingType === "Mountain"
  ) return "Advanced";
  
  if (
    distanceNum > 10 || 
    elevationNum > 500 || 
    terrain === "Steep" ||
    hikingType === "Trail"
  ) return "Intermediate";
  
  return "Beginner";
}

export default function CreateHikingSimple() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [selectedType, setSelectedType] = useState("Day hike");
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [formData, setFormData] = useState({
    maxPeople: "",
    location: "",
    meetupLocation: "",
    coordinates: { lat: 51.4545, lng: -0.2727 }, // Default to Richmond Park area
    date: "",
    time: "",
    distance: "",
    distanceUnit: "km" as "km" | "miles",
    elevation: "",
    elevationUnit: "m" as "m" | "feet",
    terrain: "Easy" as "Easy" | "Moderate" | "Steep" | "Rocky" | "Cross-country",
    duration: "Half day" as "Half day" | "Full day" | "Multi-day",
    hikingType: "Trail" as "Trail" | "Mountain" | "Backpacking",
    navigationRequired: false,
    waterSources: false,
    shelterAvailable: false,
    wildlifeWarning: false,
    permitRequired: false,
    transportIncluded: false,
    guidedTour: false,
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
    const distanceText = formData.distance ? ` - ${formData.distance}${formData.distanceUnit}` : "";
    const elevationText = formData.elevation ? ` (+${formData.elevation}${formData.elevationUnit})` : "";
    const activityTitle = `${selectedType}${distanceText}${elevationText}`;
    const requirements = getHikingRequirements(formData.hikingType, formData.distance, formData.terrain, formData.elevation);
    const difficulty = getDifficultyFromHiking(formData.distance, formData.elevation, formData.terrain, formData.hikingType);

    addActivity({
      type: "hiking",
      title: activityTitle,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      meetupLocation: formData.meetupLocation,
      organizer: "You",
      maxParticipants: formData.maxPeople,
      specialComments: formData.specialComments,
      description: formData.specialComments || `Join us for a ${selectedType.toLowerCase()} in ${formData.location}. ${requirements.description}`,
      distance: formData.distance,
      distanceUnit: formData.distanceUnit,
      elevation: formData.elevation,
      elevationUnit: formData.elevationUnit,
      terrain: formData.terrain,
      duration: formData.duration,
      hikingType: formData.hikingType,
      navigationRequired: formData.navigationRequired,
      waterSources: formData.waterSources,
      shelterAvailable: formData.shelterAvailable,
      wildlifeWarning: formData.wildlifeWarning,
      permitRequired: formData.permitRequired,
      transportIncluded: formData.transportIncluded,
      guidedTour: formData.guidedTour,
      subtype: selectedType,
      gender: formData.femaleOnly ? "Female only" : "All genders",
      ageMin: formData.ageMin,
      ageMax: formData.ageMax,
      visibility: formData.visibility,
      difficulty: difficulty,
      club: formData.visibility === "Club members" ? "hiking-club" : undefined,
      coordinates: formData.coordinates,
      requirements: requirements,
      imageSrc: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=40&h=40&fit=crop&crop=face",
    });

    showToast("Hiking activity created successfully!", "success");
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
              New hike! 🥾
            </h1>
          </div>

          <div className="space-y-6">
            {/* Hiking Type */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Hike Type
              </h3>
              <div className="flex gap-2 flex-wrap">
                {["Day hike", "Nature walk", "Summit hike", "Multi-day trek"].map((type) => (
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

            {/* Hiking Style */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Hiking Style
              </h3>
              <div className="flex gap-2 flex-wrap">
                {["Trail", "Mountain", "Backpacking"].map((style) => (
                  <button
                    key={style}
                    onClick={() => setFormData({ ...formData, hikingType: style as any })}
                    className={`px-4 py-2 rounded-lg border border-black font-bold text-sm font-cabin ${
                      formData.hikingType === style
                        ? "bg-explore-green text-white"
                        : "bg-explore-gray text-explore-green"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance and Elevation */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium text-black font-cabin mb-3">
                  Distance
                </h3>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={formData.distance}
                    onChange={(e) =>
                      setFormData({ ...formData, distance: e.target.value })
                    }
                    className="flex-1 border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                    placeholder="12"
                  />
                  <select
                    value={formData.distanceUnit}
                    onChange={(e) =>
                      setFormData({ ...formData, distanceUnit: e.target.value as any })
                    }
                    className="border-2 border-gray-300 rounded-lg py-3 px-2 font-cabin text-sm"
                  >
                    <option value="km">km</option>
                    <option value="miles">mi</option>
                  </select>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-black font-cabin mb-3">
                  Elevation Gain
                </h3>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={formData.elevation}
                    onChange={(e) =>
                      setFormData({ ...formData, elevation: e.target.value })
                    }
                    className="flex-1 border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                    placeholder="500"
                  />
                  <select
                    value={formData.elevationUnit}
                    onChange={(e) =>
                      setFormData({ ...formData, elevationUnit: e.target.value as any })
                    }
                    className="border-2 border-gray-300 rounded-lg py-3 px-2 font-cabin text-sm"
                  >
                    <option value="m">m</option>
                    <option value="feet">ft</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Terrain and Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium text-black font-cabin mb-3">
                  Terrain
                </h3>
                <select
                  value={formData.terrain}
                  onChange={(e) =>
                    setFormData({ ...formData, terrain: e.target.value as any })
                  }
                  className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                >
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Steep">Steep</option>
                  <option value="Rocky">Rocky</option>
                  <option value="Cross-country">Cross-country</option>
                </select>
              </div>
              <div>
                <h3 className="text-lg font-medium text-black font-cabin mb-3">
                  Duration
                </h3>
                <select
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value as any })
                  }
                  className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                >
                  <option value="Half day">Half day</option>
                  <option value="Full day">Full day</option>
                  <option value="Multi-day">Multi-day</option>
                </select>
              </div>
            </div>

            {/* Max number of people */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Max number of hikers
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

            {/* Location */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Hiking Location
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                  placeholder="Enter hiking area or trail name"
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
                placeholder="Where should hikers meet? (e.g., Car park, Trail head, Station)"
              />
            </div>

            {/* Date and Time */}
            <DateTimePicker
              date={formData.date}
              time={formData.time}
              onDateChange={(date) => setFormData({ ...formData, date })}
              onTimeChange={(time) => setFormData({ ...formData, time })}
            />

            {/* Trail Information */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Trail Information
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.navigationRequired}
                    onChange={(e) =>
                      setFormData({ ...formData, navigationRequired: e.target.checked })
                    }
                    className="w-5 h-5 text-explore-green border-2 border-gray-300 rounded focus:ring-explore-green"
                  />
                  <span className="text-lg font-medium text-black font-cabin">
                    Navigation skills required
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.waterSources}
                    onChange={(e) =>
                      setFormData({ ...formData, waterSources: e.target.checked })
                    }
                    className="w-5 h-5 text-explore-green border-2 border-gray-300 rounded focus:ring-explore-green"
                  />
                  <span className="text-lg font-medium text-black font-cabin">
                    Water sources available on trail
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.shelterAvailable}
                    onChange={(e) =>
                      setFormData({ ...formData, shelterAvailable: e.target.checked })
                    }
                    className="w-5 h-5 text-explore-green border-2 border-gray-300 rounded focus:ring-explore-green"
                  />
                  <span className="text-lg font-medium text-black font-cabin">
                    Shelter/huts available
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.wildlifeWarning}
                    onChange={(e) =>
                      setFormData({ ...formData, wildlifeWarning: e.target.checked })
                    }
                    className="w-5 h-5 text-explore-green border-2 border-gray-300 rounded focus:ring-explore-green"
                  />
                  <span className="text-lg font-medium text-black font-cabin">
                    Wildlife awareness required
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permitRequired}
                    onChange={(e) =>
                      setFormData({ ...formData, permitRequired: e.target.checked })
                    }
                    className="w-5 h-5 text-explore-green border-2 border-gray-300 rounded focus:ring-explore-green"
                  />
                  <span className="text-lg font-medium text-black font-cabin">
                    Permit/booking required
                  </span>
                </label>
              </div>
            </div>

            {/* Additional Features */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Additional Features
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.transportIncluded}
                    onChange={(e) =>
                      setFormData({ ...formData, transportIncluded: e.target.checked })
                    }
                    className="w-5 h-5 text-explore-green border-2 border-gray-300 rounded focus:ring-explore-green"
                  />
                  <span className="text-lg font-medium text-black font-cabin">
                    Transport to trailhead included
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.guidedTour}
                    onChange={(e) =>
                      setFormData({ ...formData, guidedTour: e.target.checked })
                    }
                    className="w-5 h-5 text-explore-green border-2 border-gray-300 rounded focus:ring-explore-green"
                  />
                  <span className="text-lg font-medium text-black font-cabin">
                    Guided tour with local knowledge
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
                  placeholder="Describe the route, trail conditions, gear requirements, or meeting details..."
                />
              </div>

              {/* Create activity button */}
              <button
                onClick={handleSubmit}
                className="w-full bg-explore-green text-white py-3 px-6 rounded-lg text-base font-cabin font-medium"
              >
                Create hiking activity
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
              <h3 className="text-lg font-bold">Choose Hiking Location</h3>
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
