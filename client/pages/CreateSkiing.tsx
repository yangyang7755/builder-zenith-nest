import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronDown, MapPin, X } from "lucide-react";
import { useActivities } from "../contexts/ActivitiesContext";
import DateTimePicker from "../components/DateTimePicker";

export default function CreateSkiing() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("Alpine Skiing");
  const [formData, setFormData] = useState({
    maxSkiers: "6",
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
    // Skiing-specific fields
    skiLevel: "Intermediate",
    resort: "",
    liftPass: "Required",
    equipment: "Own gear",
    lessons: false,
    apresSkiPlan: "",
    weatherConditions: "",
    snowReport: "",
    meetingPoint: "Base station",
    transport: "",
    accommodation: "",
    skiArea: "",
    verticalDrop: "",
    numberOfRuns: "",
    offPiste: false,
    avalancheRisk: "None",
    insurance: false,
  });

  const [showLocationMap, setShowLocationMap] = useState(false);
  const { addActivity } = useActivities();

  const skiingTypes = {
    "Alpine Skiing": {
      icon: "⛷️",
      description: "Downhill skiing on groomed slopes and pistes"
    },
    "Cross Country": {
      icon: "🎿", 
      description: "Nordic skiing across flat or rolling terrain"
    },
    "Backcountry": {
      icon: "🏔️",
      description: "Off-piste skiing in unmarked natural terrain"
    },
    "Freestyle": {
      icon: "🤸",
      description: "Tricks, jumps and terrain park skiing"
    },
    "Ski Touring": {
      icon: "🗻",
      description: "Uphill skiing with touring equipment"
    },
    "Snowboarding": {
      icon: "🏂",
      description: "Snowboarding on slopes and terrain parks"
    }
  };

  const skiLevels = ["Beginner", "Intermediate", "Advanced", "Expert", "Professional"];
  const difficultyLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];
  const liftPassOptions = ["Required", "Included", "Optional", "Not needed"];
  const equipmentOptions = ["Own gear", "Rental available", "Included", "Bring specific items"];
  const meetingPoints = ["Base station", "Resort entrance", "Specific lift", "Car park", "Other"];

  const handleSubmit = () => {
    if (
      !formData.maxSkiers ||
      !formData.meetupLocation ||
      !formData.date ||
      !formData.time
    ) {
      alert("Please fill in all required fields");
      return;
    }

    let activityTitle = `${selectedType} session`;
    if (formData.resort) {
      activityTitle = `${selectedType} at ${formData.resort}`;
    }

    addActivity({
      type: "skiing",
      title: activityTitle,
      date: formData.date,
      time: formData.time,
      location: formData.meetupLocation,
      meetupLocation: formData.meetupLocation,
      organizer: "You",
      duration: formData.duration,
      durationUnit: formData.durationUnit,
      maxParticipants: formData.maxSkiers,
      specialComments: formData.specialComments,
      subtype: selectedType,
      gender: formData.femaleOnly ? "Female only" : "All genders",
      ageMin: formData.ageMin,
      ageMax: formData.ageMax,
      visibility: formData.visibility,
      // Skiing-specific data
      difficulty: formData.difficulty,
      skiLevel: formData.skiLevel,
      resort: formData.resort,
      liftPass: formData.liftPass,
      equipment: formData.equipment,
      lessons: formData.lessons,
      apresSkiPlan: formData.apresSkiPlan,
      weatherConditions: formData.weatherConditions,
      snowReport: formData.snowReport,
      meetingPoint: formData.meetingPoint,
      transport: formData.transport,
      accommodation: formData.accommodation,
      skiArea: formData.skiArea,
      verticalDrop: formData.verticalDrop,
      numberOfRuns: formData.numberOfRuns,
      offPiste: formData.offPiste,
      avalancheRisk: formData.avalancheRisk,
      insurance: formData.insurance,
      imageSrc: "https://images.unsplash.com/photo-1551524164-687a55dd1126?w=40&h=40&fit=crop&crop=face",
    });

    alert("Skiing activity created successfully!");
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
              New ski session!
            </h1>
          </div>

          <div className="space-y-6">
            {/* Skiing Type */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Skiing Type
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(skiingTypes).map(([type, details]) => (
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

            {/* Max number of skiers */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Max number of skiers
              </h3>
              <div className="relative">
                <select
                  value={formData.maxSkiers}
                  onChange={(e) =>
                    setFormData({ ...formData, maxSkiers: e.target.value })
                  }
                  className="appearance-none w-full border-2 border-gray-300 rounded-lg py-3 px-4 pr-10 font-cabin bg-white"
                >
                  {[2, 4, 6, 8, 10, 12, 15, 20].map((num) => (
                    <option key={num} value={num.toString()}>
                      {num} skiers
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Resort/Location */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Ski Resort/Area
              </h3>
              <input
                type="text"
                value={formData.resort}
                onChange={(e) =>
                  setFormData({ ...formData, resort: e.target.value })
                }
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                placeholder="e.g., Val d'Isère, Chamonix, The Alps"
              />
            </div>

            {/* Duration */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Duration
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

            {/* Ski Level */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Required Ski Level
              </h3>
              <div className="relative">
                <select
                  value={formData.skiLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, skiLevel: e.target.value })
                  }
                  className="appearance-none w-full border-2 border-gray-300 rounded-lg py-3 px-4 pr-10 font-cabin bg-white"
                >
                  {skiLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Equipment */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Equipment
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

            {/* Lift Pass */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Lift Pass
              </h3>
              <div className="relative">
                <select
                  value={formData.liftPass}
                  onChange={(e) =>
                    setFormData({ ...formData, liftPass: e.target.value })
                  }
                  className="appearance-none w-full border-2 border-gray-300 rounded-lg py-3 px-4 pr-10 font-cabin bg-white"
                >
                  {liftPassOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Meeting Point */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Meeting Point
              </h3>
              <div className="relative">
                <select
                  value={formData.meetingPoint}
                  onChange={(e) =>
                    setFormData({ ...formData, meetingPoint: e.target.value })
                  }
                  className="appearance-none w-full border-2 border-gray-300 rounded-lg py-3 px-4 pr-10 font-cabin bg-white"
                >
                  {meetingPoints.map((point) => (
                    <option key={point} value={point}>
                      {point}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Meetup location */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Specific meetup location
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.meetupLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, meetupLocation: e.target.value })
                  }
                  className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                  placeholder="Enter specific meeting point"
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

            {/* Special Features */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Additional Features
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.lessons}
                    onChange={(e) =>
                      setFormData({ ...formData, lessons: e.target.checked })
                    }
                    className="w-5 h-5 border-2 border-gray-300 rounded"
                  />
                  <span className="text-lg font-medium text-black font-cabin">
                    Ski lessons included
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.offPiste}
                    onChange={(e) =>
                      setFormData({ ...formData, offPiste: e.target.checked })
                    }
                    className="w-5 h-5 border-2 border-gray-300 rounded"
                  />
                  <span className="text-lg font-medium text-black font-cabin">
                    Off-piste skiing
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.insurance}
                    onChange={(e) =>
                      setFormData({ ...formData, insurance: e.target.checked })
                    }
                    className="w-5 h-5 border-2 border-gray-300 rounded"
                  />
                  <span className="text-lg font-medium text-black font-cabin">
                    Insurance recommended
                  </span>
                </label>
              </div>
            </div>

            {/* Après-ski Plan */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Après-ski Plan
              </h3>
              <input
                type="text"
                value={formData.apresSkiPlan}
                onChange={(e) =>
                  setFormData({ ...formData, apresSkiPlan: e.target.value })
                }
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                placeholder="e.g., Drinks at mountain hut, No après-ski planned"
              />
            </div>

            {/* Transport */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Transport
              </h3>
              <input
                type="text"
                value={formData.transport}
                onChange={(e) =>
                  setFormData({ ...formData, transport: e.target.value })
                }
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                placeholder="e.g., Car sharing available, Meet at resort"
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
                  placeholder="Snow conditions, weather updates, equipment tips, meeting instructions..."
                />
              </div>

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
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-white"></div>
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
                  Alps Region
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
