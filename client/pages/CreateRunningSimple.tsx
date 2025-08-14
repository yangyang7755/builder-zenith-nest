import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";
import { useActivities } from "../contexts/ActivitiesContext";
import { useToast } from "../contexts/ToastContext";
import DateTimePicker from "../components/DateTimePicker";
import MapView from "../components/MapView";

// Helper function to generate running requirements based on type and distance
function getRunningRequirements(runningType: string, distance: string, terrain: string) {
  const baseRequirements = {
    title: "basic running fitness",
    description: "This running session requires basic cardiovascular fitness and appropriate gear.",
    details: [] as string[],
    warning: "Running involves physical exertion and risk of injury. Please run within your ability level.",
  };

  const distanceNum = parseFloat(distance) || 0;

  if (runningType === "Trail") {
    baseRequirements.title = "trail running experience";
    baseRequirements.details = [
      "Comfortable running on uneven terrain",
      "Trail running shoes with good grip",
      "Experience with hills and varied surfaces",
      "Basic navigation skills for outdoor trails",
      "Ability to maintain steady effort on mixed terrain",
    ];
    baseRequirements.warning = "Trail running involves uneven surfaces, elevation changes, and potential hazards. Weather conditions may affect trail safety.";
  } else if (runningType === "Track") {
    baseRequirements.title = "track running etiquette";
    baseRequirements.details = [
      "Understanding of track lane usage and direction",
      "Comfortable with interval training",
      "Appropriate track spikes or running shoes",
      "Basic knowledge of track workout structure",
      "Ability to maintain pace in group settings",
    ];
  } else if (runningType === "Race") {
    baseRequirements.title = "race preparation";
    baseRequirements.details = [
      "Completed training plan for race distance",
      "Experience with race day nutrition and hydration",
      "Comfortable maintaining goal race pace",
      "Understanding of race tactics and positioning",
      "Proper racing kit and timing device",
    ];
  } else {
    // Road running
    baseRequirements.details = [
      "Comfortable running continuously for the session duration",
      "Proper running shoes in good condition",
      "Basic understanding of road safety and running etiquette",
      "Ability to maintain conversational pace with the group",
      "Appropriate clothing for weather conditions",
    ];
  }

  // Add distance-specific requirements
  if (distanceNum > 15) {
    baseRequirements.details.push("Experience with long distance running (15km+)");
    baseRequirements.details.push("Understanding of hydration and fueling strategies");
  } else if (distanceNum > 8) {
    baseRequirements.details.push("Comfortable running medium distances (8-15km)");
  } else if (distanceNum > 0) {
    baseRequirements.details.push(`Able to run ${distance} continuously`);
  }

  // Add terrain-specific requirements
  if (terrain === "Hilly" || terrain === "Mountain") {
    baseRequirements.details.push("Experience with hill running and elevation changes");
  }

  return baseRequirements;
}

// Helper function to map running details to difficulty
function getDifficultyFromRunning(distance: string, pace: string, terrain: string): string {
  const distanceNum = parseFloat(distance) || 0;
  const paceNum = parseFloat(pace) || 0;
  
  // Consider distance
  if (distanceNum > 20 || terrain === "Mountain") return "Advanced";
  if (distanceNum > 10 || paceNum < 4.5 || terrain === "Hilly") return "Intermediate";
  return "Beginner";
}

export default function CreateRunningSimple() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [selectedType, setSelectedType] = useState("Road");
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [formData, setFormData] = useState({
    maxPeople: "",
    location: "",
    meetupLocation: "",
    coordinates: { lat: 51.5074, lng: -0.1278 },
    date: "",
    time: "",
    distance: "",
    distanceUnit: "km" as "km" | "miles",
    pace: "",
    paceUnit: "min/km" as "min/km" | "min/mile",
    terrain: "Flat" as "Flat" | "Hilly" | "Mountain" | "Mixed" | "Urban" | "Beach" | "Forest",
    elevationGain: "",
    targetPace: "",
    waterStations: false,
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
    const activityTitle = `${selectedType} run${distanceText}`;
    const requirements = getRunningRequirements(selectedType, formData.distance, formData.terrain);
    const difficulty = getDifficultyFromRunning(formData.distance, formData.pace, formData.terrain);

    addActivity({
      type: "running",
      title: activityTitle,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      meetupLocation: formData.meetupLocation,
      organizer: "You",
      maxParticipants: formData.maxPeople,
      specialComments: formData.specialComments,
      description: formData.specialComments || `Join us for a ${selectedType.toLowerCase()} run in ${formData.location}. ${requirements.description}`,
      distance: formData.distance,
      distanceUnit: formData.distanceUnit,
      pace: formData.pace,
      paceUnit: formData.paceUnit,
      terrain: formData.terrain,
      elevationGain: formData.elevationGain,
      targetPace: formData.targetPace,
      waterStations: formData.waterStations,
      subtype: selectedType,
      gender: formData.femaleOnly ? "Female only" : "All genders",
      ageMin: formData.ageMin,
      ageMax: formData.ageMax,
      visibility: formData.visibility,
      difficulty: difficulty,
      club: formData.visibility === "Club members" ? "running-club" : undefined,
      coordinates: formData.coordinates,
      requirements: requirements,
      imageSrc: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=40&h=40&fit=crop&crop=face",
    });

    showToast("Running activity created successfully!", "success");
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
              New run!
            </h1>
          </div>

          <div className="space-y-6">
            {/* Running Type */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Running Type
              </h3>
              <div className="flex gap-2 flex-wrap">
                {["Road", "Trail", "Track", "Race"].map((type) => (
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

            {/* Max number of people */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Max number of people
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

            {/* Distance */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Distance
              </h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.distance}
                  onChange={(e) =>
                    setFormData({ ...formData, distance: e.target.value })
                  }
                  className="flex-1 border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                  placeholder="Distance"
                />
                <select
                  value={formData.distanceUnit}
                  onChange={(e) =>
                    setFormData({ ...formData, distanceUnit: e.target.value as "km" | "miles" })
                  }
                  className="border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                >
                  <option value="km">km</option>
                  <option value="miles">miles</option>
                </select>
              </div>
            </div>

            {/* Pace */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Target Pace
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.pace}
                  onChange={(e) =>
                    setFormData({ ...formData, pace: e.target.value })
                  }
                  className="flex-1 border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                  placeholder="e.g., 5:30"
                />
                <select
                  value={formData.paceUnit}
                  onChange={(e) =>
                    setFormData({ ...formData, paceUnit: e.target.value as "min/km" | "min/mile" })
                  }
                  className="border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                >
                  <option value="min/km">min/km</option>
                  <option value="min/mile">min/mile</option>
                </select>
              </div>
            </div>

            {/* Terrain */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Terrain Type
              </h3>
              <select
                value={formData.terrain}
                onChange={(e) =>
                  setFormData({ ...formData, terrain: e.target.value as any })
                }
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
              >
                <option value="Flat">Flat</option>
                <option value="Hilly">Hilly</option>
                <option value="Mountain">Mountain</option>
                <option value="Mixed">Mixed</option>
                <option value="Urban">Urban</option>
                <option value="Beach">Beach</option>
                <option value="Forest">Forest</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Running Location
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                  placeholder="Enter running location"
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
                placeholder="Where should people meet?"
              />
            </div>

            {/* Date and Time */}
            <DateTimePicker
              date={formData.date}
              time={formData.time}
              onDateChange={(date) => setFormData({ ...formData, date })}
              onTimeChange={(time) => setFormData({ ...formData, time })}
            />

            {/* Optional Features */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Features
              </h3>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.waterStations}
                  onChange={(e) =>
                    setFormData({ ...formData, waterStations: e.target.checked })
                  }
                  className="w-5 h-5 text-explore-green border-2 border-gray-300 rounded focus:ring-explore-green"
                />
                <span className="text-lg font-medium text-black font-cabin">
                  Water stations available
                </span>
              </label>
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
                  placeholder="Describe the route, training focus, or any special instructions..."
                />
              </div>

              {/* Create activity button */}
              <button
                onClick={handleSubmit}
                className="w-full bg-explore-green text-white py-3 px-6 rounded-lg text-base font-cabin font-medium"
              >
                Create running activity
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
