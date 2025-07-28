import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronDown, MapPin, X } from "lucide-react";
import { useActivities } from "../contexts/ActivitiesContext";
import DateTimePicker from "../components/DateTimePicker";

export default function CreateHiking() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("Day Hike");
  const [formData, setFormData] = useState({
    maxHikers: "8",
    distance: "",
    distanceUnit: "km" as "km" | "miles",
    duration: "",
    durationUnit: "hours" as "hours" | "days",
    elevation: "",
    elevationUnit: "m" as "m" | "feet",
    meetupLocation: "",
    coordinates: { lat: 51.5074, lng: -0.1278 },
    date: "",
    time: "",
    difficulty: "Intermediate",
    femaleOnly: false,
    ageMin: "",
    ageMax: "",
    visibility: "All",
    specialComments: "",
    // Hiking-specific fields
    terrain: "Mountain",
    waterSources: "",
    shelter: false,
    guidedTour: false,
    packingList: "",
    weatherDependency: true,
    trailType: "Circular",
    wildlifeSighting: "",
    photoSpots: "",
    permits: false,
    emergencyContact: "",
  });

  const [showLocationMap, setShowLocationMap] = useState(false);
  const { addActivity } = useActivities();

  const hikingTypes = {
    "Day Hike": {
      icon: "🥾",
      description: "Single-day hiking adventure with return the same day"
    },
    "Multi-day": {
      icon: "🏕️", 
      description: "Multi-day hiking expedition with overnight camping"
    },
    "Nature Walk": {
      icon: "🌿",
      description: "Easy-paced walk through nature reserves and parks"
    },
    "Peak Bagging": {
      icon: "⛰️",
      description: "Challenging hikes to summit mountain peaks"
    },
    "Coastal Walk": {
      icon: "🌊",
      description: "Scenic hiking along coastlines and clifftops"
    },
    "Forest Trail": {
      icon: "🌲",
      description: "Hiking through woodland and forest paths"
    }
  };

  const terrainOptions = ["Mountain", "Coastal", "Forest", "Moorland", "Desert", "Valley", "Ridge", "Canyon"];
  const difficultyLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];
  const trailTypes = ["Circular", "Linear", "Loop", "Out & Back", "Traverse"];

  const handleSubmit = () => {
    if (
      !formData.maxHikers ||
      !formData.meetupLocation ||
      !formData.date ||
      !formData.time
    ) {
      alert("Please fill in all required fields");
      return;
    }

    let activityTitle = `${selectedType}`;
    if (formData.distance) {
      activityTitle += ` - ${formData.distance}${formData.distanceUnit}`;
    }
    if (selectedType === "Peak Bagging" && formData.meetupLocation) {
      activityTitle = `${formData.meetupLocation} peak hike`;
    }

    addActivity({
      type: "hiking",
      title: activityTitle,
      date: formData.date,
      time: formData.time,
      location: formData.meetupLocation,
      meetupLocation: formData.meetupLocation,
      organizer: "You",
      distance: formData.distance,
      distanceUnit: formData.distanceUnit,
      elevation: formData.elevation,
      elevationUnit: formData.elevationUnit,
      duration: formData.duration,
      durationUnit: formData.durationUnit,
      maxParticipants: formData.maxHikers,
      specialComments: formData.specialComments,
      subtype: selectedType,
      gender: formData.femaleOnly ? "Female only" : "All genders",
      ageMin: formData.ageMin,
      ageMax: formData.ageMax,
      visibility: formData.visibility,
      // Hiking-specific data
      difficulty: formData.difficulty,
      terrain: formData.terrain,
      waterSources: formData.waterSources,
      shelter: formData.shelter,
      guidedTour: formData.guidedTour,
      packingList: formData.packingList,
      weatherDependency: formData.weatherDependency,
      trailType: formData.trailType,
      wildlifeSighting: formData.wildlifeSighting,
      photoSpots: formData.photoSpots,
      permits: formData.permits,
      emergencyContact: formData.emergencyContact,
      imageSrc: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=40&h=40&fit=crop&crop=face",
    });

    alert("Hiking activity created successfully!");
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

      <div className="overflow-y-auto pb-20">
        <div className="px-6">
          <div className="text-center py-4">
            <h1 className="text-3xl font-bold text-explore-green font-cabin">
              New hike!
            </h1>
          </div>

          <div className="space-y-6">
            {/* Hiking Type */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Hiking Type
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(hikingTypes).map(([type, details]) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      selectedType === type
                        ? "border-explore-green bg-explore-green text-white"
                        : "border-gray-300 bg-white hover:border-explore-green"
                    }`}
                  >
                    <div className="text-2xl mb-2">{details.icon}</div>
                    <div className="font-bold text-sm font-cabin mb-1">{type}</div>
                    <div className={`text-xs font-cabin leading-tight ${
                      selectedType === type ? "text-white" : "text-gray-600"
                    }`}>
                      {details.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Max number of hikers */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Max number of hikers
              </h3>
              <div className="relative">
                <select
                  value={formData.maxHikers}
                  onChange={(e) =>
                    setFormData({ ...formData, maxHikers: e.target.value })
                  }
                  className="appearance-none w-full border-2 border-gray-300 rounded-lg py-3 px-4 pr-10 font-cabin bg-white"
                >
                  {[2, 4, 6, 8, 10, 12, 15, 20, 25].map((num) => (
                    <option key={num} value={num.toString()}>
                      {num} hikers
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Distance */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Distance
              </h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={formData.distance}
                  onChange={(e) =>
                    setFormData({ ...formData, distance: e.target.value })
                  }
                  className="flex-1 border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                  placeholder="Enter distance"
                />
                <div className="relative">
                  <select
                    value={formData.distanceUnit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        distanceUnit: e.target.value as "km" | "miles",
                      })
                    }
                    className="appearance-none border-2 border-gray-300 rounded-lg py-3 px-4 pr-10 font-cabin bg-white"
                  >
                    <option value="km">km</option>
                    <option value="miles">miles</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Duration */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Expected Duration
              </h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.5"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  className="flex-1 border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                  placeholder="Enter duration"
                />
                <div className="relative">
                  <select
                    value={formData.durationUnit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationUnit: e.target.value as "hours" | "days",
                      })
                    }
                    className="appearance-none border-2 border-gray-300 rounded-lg py-3 px-4 pr-10 font-cabin bg-white"
                  >
                    <option value="hours">hours</option>
                    <option value="days">days</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Elevation Gain */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Elevation Gain
              </h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.elevation}
                  onChange={(e) =>
                    setFormData({ ...formData, elevation: e.target.value })
                  }
                  className="flex-1 border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                  placeholder="Enter elevation gain"
                />
                <div className="relative">
                  <select
                    value={formData.elevationUnit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        elevationUnit: e.target.value as "m" | "feet",
                      })
                    }
                    className="appearance-none border-2 border-gray-300 rounded-lg py-3 px-4 pr-10 font-cabin bg-white"
                  >
                    <option value="m">m</option>
                    <option value="feet">feet</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Difficulty Level */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Difficulty Level
              </h3>
              <div className="relative">
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({ ...formData, difficulty: e.target.value })
                  }
                  className="appearance-none w-full border-2 border-gray-300 rounded-lg py-3 px-4 pr-10 font-cabin bg-white"
                >
                  {difficultyLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Terrain */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Terrain Type
              </h3>
              <div className="relative">
                <select
                  value={formData.terrain}
                  onChange={(e) =>
                    setFormData({ ...formData, terrain: e.target.value })
                  }
                  className="appearance-none w-full border-2 border-gray-300 rounded-lg py-3 px-4 pr-10 font-cabin bg-white"
                >
                  {terrainOptions.map((terrain) => (
                    <option key={terrain} value={terrain}>
                      {terrain}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Trail Type */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Trail Type
              </h3>
              <div className="relative">
                <select
                  value={formData.trailType}
                  onChange={(e) =>
                    setFormData({ ...formData, trailType: e.target.value })
                  }
                  className="appearance-none w-full border-2 border-gray-300 rounded-lg py-3 px-4 pr-10 font-cabin bg-white"
                >
                  {trailTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Meetup location */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Meetup location
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.meetupLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, meetupLocation: e.target.value })
                  }
                  className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                  placeholder="Enter meetup location or trailhead"
                />
                <button
                  type="button"
                  onClick={() => setShowLocationMap(true)}
                  className="w-full flex items-center justify-center gap-2 border-2 border-explore-green text-explore-green rounded-lg py-3 px-4 font-cabin font-medium hover:bg-explore-green hover:text-white transition-colors"
                >
                  <MapPin className="w-5 h-5" />
                  Drop pin on map
                </button>
              </div>
            </div>

            {/* Date and Time */}
            <DateTimePicker
              date={formData.date}
              time={formData.time}
              onDateChange={(date) => setFormData({ ...formData, date })}
              onTimeChange={(time) => setFormData({ ...formData, time })}
            />

            {/* Water Sources */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Water Sources
              </h3>
              <input
                type="text"
                value={formData.waterSources}
                onChange={(e) =>
                  setFormData({ ...formData, waterSources: e.target.value })
                }
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                placeholder="e.g., Stream at 5km, Bring own water"
              />
            </div>

            {/* Special Features */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Special Features
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.shelter}
                    onChange={(e) =>
                      setFormData({ ...formData, shelter: e.target.checked })
                    }
                    className="w-5 h-5 border-2 border-gray-300 rounded"
                  />
                  <span className="text-lg font-medium text-black font-cabin">
                    Shelter available
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.guidedTour}
                    onChange={(e) =>
                      setFormData({ ...formData, guidedTour: e.target.checked })
                    }
                    className="w-5 h-5 border-2 border-gray-300 rounded"
                  />
                  <span className="text-lg font-medium text-black font-cabin">
                    Guided tour included
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.weatherDependency}
                    onChange={(e) =>
                      setFormData({ ...formData, weatherDependency: e.target.checked })
                    }
                    className="w-5 h-5 border-2 border-gray-300 rounded"
                  />
                  <span className="text-lg font-medium text-black font-cabin">
                    Weather dependent
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permits}
                    onChange={(e) =>
                      setFormData({ ...formData, permits: e.target.checked })
                    }
                    className="w-5 h-5 border-2 border-gray-300 rounded"
                  />
                  <span className="text-lg font-medium text-black font-cabin">
                    Permits required
                  </span>
                </label>
              </div>
            </div>

            {/* Packing List */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Recommended Packing List
              </h3>
              <textarea
                value={formData.packingList}
                onChange={(e) =>
                  setFormData({ ...formData, packingList: e.target.value })
                }
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin h-24 resize-none"
                placeholder="e.g., Waterproof jacket, hiking boots, first aid kit..."
              />
            </div>

            {/* Optional (special filters) */}
            <div>
              <h2 className="text-2xl font-bold text-explore-green font-cabin mb-6">
                Optional (special filters)
              </h2>

              {/* Gender */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-black font-cabin mb-3">
                  Gender
                </h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.femaleOnly}
                    onChange={(e) =>
                      setFormData({ ...formData, femaleOnly: e.target.checked })
                    }
                    className="w-5 h-5 border-2 border-gray-300 rounded"
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
                  placeholder="Additional information about the hike, trail conditions, meeting instructions, safety notes..."
                />
              </div>

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

      {/* Location Map Modal (same as in CreateRunning) */}
      {showLocationMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm h-96">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold text-explore-green font-cabin">
                Select Location
              </h3>
              <button
                onClick={() => setShowLocationMap(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 h-64">
              <div className="w-full h-full bg-gray-200 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-blue-200"></div>
                <div className="absolute inset-0">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={`h-${i}`}
                      className="absolute w-full border-t border-gray-300 opacity-30"
                      style={{ top: `${(i + 1) * 12.5}%` }}
                    />
                  ))}
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={`v-${i}`}
                      className="absolute h-full border-l border-gray-300 opacity-30"
                      style={{ left: `${(i + 1) * 16.66}%` }}
                    />
                  ))}
                </div>
                <div
                  className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200"
                  style={{
                    left: `${((formData.coordinates.lng + 0.1278) / 0.2556) * 100}%`,
                    top: `${((51.5174 - formData.coordinates.lat) / 0.02) * 100}%`,
                  }}
                >
                  <MapPin className="w-6 h-6 text-red-500 drop-shadow-lg" />
                </div>
                <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs font-cabin">
                  UK Area
                </div>
              </div>
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLocationMap(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-lg text-gray-600 font-cabin font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowLocationMap(false)}
                  className="flex-1 py-3 bg-explore-green text-white rounded-lg font-cabin font-medium"
                >
                  Confirm Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}

function BottomNavigation() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white h-14 flex items-center justify-around border-t border-gray-200 max-w-md mx-auto">
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border border-explore-green rounded-full"></div>
    </div>
  );
}
