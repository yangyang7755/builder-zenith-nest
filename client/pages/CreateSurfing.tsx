import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronDown, MapPin, X } from "lucide-react";
import { useActivities } from "../contexts/ActivitiesContext";
import DateTimePicker from "../components/DateTimePicker";

export default function CreateSurfing() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("Beginner Session");
  const [formData, setFormData] = useState({
    maxSurfers: "6",
    duration: "",
    durationUnit: "hours" as "hours" | "days",
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
    // Surfing-specific fields
    surfLevel: "Intermediate",
    beachLocation: "",
    waveHeight: "",
    waveDirection: "",
    tideTime: "",
    windConditions: "",
    waterTemp: "",
    wetsuitRequired: true,
    boardRental: "Available",
    surfLesson: false,
    instructor: "",
    safetyBriefing: true,
    emergencyPlan: "",
    meetBeforeAfter: "30 mins before",
    equipment: "Bring own",
    localKnowledge: "",
    surfSpot: "",
    currentForecast: "",
    backup_location: "",
    transport: "",
    refreshments: "",
  });

  const [showLocationMap, setShowLocationMap] = useState(false);
  const { addActivity } = useActivities();

  const surfingTypes = {
    "Beginner Session": {
      icon: "🏄‍♀️",
      description: "Learn to surf with foam boards in safe conditions"
    },
    "Intermediate": {
      icon: "🏄", 
      description: "Improve technique and catch unbroken waves"
    },
    "Advanced": {
      icon: "🏄‍♂️",
      description: "Challenge yourself on bigger waves and reef breaks"
    },
    "Dawn Patrol": {
      icon: "🌅",
      description: "Early morning surf session at sunrise"
    },
    "Longboard": {
      icon: "🏇",
      description: "Classic longboard surfing and nose riding"
    },
    "Surf & SUP": {
      icon: "🚤",
      description: "Combined surfing and stand-up paddleboarding"
    }
  };

  const surfLevels = ["Complete Beginner", "Beginner", "Intermediate", "Advanced", "Expert"];
  const difficultyLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];
  const boardRentalOptions = ["Available", "Included", "Own board required", "Specific boards provided"];
  const equipmentOptions = ["Bring own", "Rental available", "All provided", "Wetsuit only"];
  const waveHeightOptions = ["0.5-1m", "1-1.5m", "1.5-2m", "2-3m", "3m+", "Variable"];

  const handleSubmit = () => {
    if (
      !formData.maxSurfers ||
      !formData.meetupLocation ||
      !formData.date ||
      !formData.time
    ) {
      alert("Please fill in all required fields");
      return;
    }

    let activityTitle = `${selectedType}`;
    if (formData.surfSpot) {
      activityTitle = `${selectedType} at ${formData.surfSpot}`;
    }

    addActivity({
      type: "surfing",
      title: activityTitle,
      date: formData.date,
      time: formData.time,
      location: formData.meetupLocation,
      meetupLocation: formData.meetupLocation,
      organizer: "You",
      duration: formData.duration,
      durationUnit: formData.durationUnit,
      maxParticipants: formData.maxSurfers,
      specialComments: formData.specialComments,
      subtype: selectedType,
      gender: formData.femaleOnly ? "Female only" : "All genders",
      ageMin: formData.ageMin,
      ageMax: formData.ageMax,
      visibility: formData.visibility,
      // Surfing-specific data
      difficulty: formData.difficulty,
      surfLevel: formData.surfLevel,
      beachLocation: formData.beachLocation,
      waveHeight: formData.waveHeight,
      waveDirection: formData.waveDirection,
      tideTime: formData.tideTime,
      windConditions: formData.windConditions,
      waterTemp: formData.waterTemp,
      wetsuitRequired: formData.wetsuitRequired,
      boardRental: formData.boardRental,
      surfLesson: formData.surfLesson,
      instructor: formData.instructor,
      safetyBriefing: formData.safetyBriefing,
      emergencyPlan: formData.emergencyPlan,
      meetBeforeAfter: formData.meetBeforeAfter,
      equipment: formData.equipment,
      localKnowledge: formData.localKnowledge,
      surfSpot: formData.surfSpot,
      currentForecast: formData.currentForecast,
      backup_location: formData.backup_location,
      transport: formData.transport,
      refreshments: formData.refreshments,
      imageSrc: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=40&h=40&fit=crop&crop=face",
    });

    alert("Surfing activity created successfully!");
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
              New surf session!
            </h1>
          </div>

          <div className="space-y-6">
            {/* Surfing Type */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Surf Session Type
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(surfingTypes).map(([type, details]) => (
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

            {/* Max number of surfers */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Max number of surfers
              </h3>
              <div className="relative">
                <select
                  value={formData.maxSurfers}
                  onChange={(e) =>
                    setFormData({ ...formData, maxSurfers: e.target.value })
                  }
                  className="appearance-none w-full border-2 border-gray-300 rounded-lg py-3 px-4 pr-10 font-cabin bg-white"
                >
                  {[2, 4, 6, 8, 10, 12, 15].map((num) => (
                    <option key={num} value={num.toString()}>
                      {num} surfers
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Surf Spot */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Surf Spot/Beach
              </h3>
              <input
                type="text"
                value={formData.surfSpot}
                onChange={(e) =>
                  setFormData({ ...formData, surfSpot: e.target.value })
                }
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                placeholder="e.g., Fistral Beach, Croyde Bay, Woolacombe"
              />
            </div>

            {/* Duration */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Session Duration
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

            {/* Surf Level */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Required Surf Level
              </h3>
              <div className="relative">
                <select
                  value={formData.surfLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, surfLevel: e.target.value })
                  }
                  className="appearance-none w-full border-2 border-gray-300 rounded-lg py-3 px-4 pr-10 font-cabin bg-white"
                >
                  {surfLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Wave Conditions */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Expected Wave Height
              </h3>
              <div className="relative">
                <select
                  value={formData.waveHeight}
                  onChange={(e) =>
                    setFormData({ ...formData, waveHeight: e.target.value })
                  }
                  className="appearance-none w-full border-2 border-gray-300 rounded-lg py-3 px-4 pr-10 font-cabin bg-white"
                >
                  <option value="">Select wave height</option>
                  {waveHeightOptions.map((height) => (
                    <option key={height} value={height}>
                      {height}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Tide Information */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Tide Information
              </h3>
              <input
                type="text"
                value={formData.tideTime}
                onChange={(e) =>
                  setFormData({ ...formData, tideTime: e.target.value })
                }
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                placeholder="e.g., High tide 10:30, Low tide 16:45"
              />
            </div>

            {/* Board Rental */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Surfboard
              </h3>
              <div className="relative">
                <select
                  value={formData.boardRental}
                  onChange={(e) =>
                    setFormData({ ...formData, boardRental: e.target.value })
                  }
                  className="appearance-none w-full border-2 border-gray-300 rounded-lg py-3 px-4 pr-10 font-cabin bg-white"
                >
                  {boardRentalOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Equipment */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Wetsuit & Equipment
              </h3>
              <div className="relative">
                <select
                  value={formData.equipment}
                  onChange={(e) =>
                    setFormData({ ...formData, equipment: e.target.value })
                  }
                  className="appearance-none w-full border-2 border-gray-300 rounded-lg py-3 px-4 pr-10 font-cabin bg-white"
                >
                  {equipmentOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
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
                  placeholder="Enter specific meeting point on beach"
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

            {/* Safety & Features */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Safety & Features
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.surfLesson}
                    onChange={(e) =>
                      setFormData({ ...formData, surfLesson: e.target.checked })
                    }
                    className="w-5 h-5 border-2 border-gray-300 rounded"
                  />
                  <span className="text-lg font-medium text-black font-cabin">
                    Surf lesson included
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.safetyBriefing}
                    onChange={(e) =>
                      setFormData({ ...formData, safetyBriefing: e.target.checked })
                    }
                    className="w-5 h-5 border-2 border-gray-300 rounded"
                  />
                  <span className="text-lg font-medium text-black font-cabin">
                    Safety briefing included
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.wetsuitRequired}
                    onChange={(e) =>
                      setFormData({ ...formData, wetsuitRequired: e.target.checked })
                    }
                    className="w-5 h-5 border-2 border-gray-300 rounded"
                  />
                  <span className="text-lg font-medium text-black font-cabin">
                    Wetsuit required
                  </span>
                </label>
              </div>
            </div>

            {/* Water Temperature */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Water Temperature
              </h3>
              <input
                type="text"
                value={formData.waterTemp}
                onChange={(e) =>
                  setFormData({ ...formData, waterTemp: e.target.value })
                }
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                placeholder="e.g., 15°C, 3/2mm wetsuit recommended"
              />
            </div>

            {/* Current Forecast */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Current Surf Forecast
              </h3>
              <textarea
                value={formData.currentForecast}
                onChange={(e) =>
                  setFormData({ ...formData, currentForecast: e.target.value })
                }
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin h-24 resize-none"
                placeholder="Wave height, wind direction, tide times, water temp..."
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
                  placeholder="Backup location, what to bring, parking info, changing facilities..."
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-explore-green text-white py-3 px-6 rounded-lg text-base font-cabin font-medium"
              >
                Create surfing activity
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Location Map Modal */}
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
                <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-blue-100"></div>
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
                  Coastal Area
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
