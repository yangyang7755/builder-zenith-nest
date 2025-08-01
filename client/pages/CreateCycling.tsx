import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Calendar, ChevronDown, MapPin, X, ArrowLeft } from "lucide-react";
import { useActivities } from "../contexts/ActivitiesContext";
import { useActivityDraft } from "../contexts/ActivityDraftContext";
import { useToast } from "../contexts/ToastContext";
import DateTimePicker from "../components/DateTimePicker";
import BottomNavigation from "../components/BottomNavigation";

export default function CreateCycling() {
  const navigate = useNavigate();
  const { addActivity } = useActivities();
  const { getDraft, saveDraft, deleteDraft, hasDraft } = useActivityDraft();
  const [selectedType, setSelectedType] = useState("Road");
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);
  const [formData, setFormData] = useState({
    maxRiders: "10",
    distance: "",
    distanceUnit: "km" as "km" | "miles",
    elevation: "",
    elevationUnit: "m" as "m" | "feet",
    pace: "",
    paceUnit: "kph" as "kph" | "mph",
    meetupLocation: "",
    coordinates: { lat: 51.5074, lng: -0.1278 }, // Default to London
    date: "",
    time: "",
    cafeStop: "",
    routeLink: "",
    femaleOnly: false,
    ageMin: "",
    ageMax: "",
    visibility: "All",
    difficulty: "Beginner",
    specialComments: "",
  });

  // Load draft on component mount
  useEffect(() => {
    const draft = getDraft("cycling");
    if (draft) {
      setFormData({
        maxRiders: draft.maxParticipants || "10",
        distance: draft.distance || "",
        distanceUnit: (draft.distanceUnit as "km" | "miles") || "km",
        elevation: draft.elevation || "",
        elevationUnit: (draft.elevationUnit as "m" | "feet") || "m",
        pace: draft.pace || "",
        paceUnit: (draft.paceUnit as "kph" | "mph") || "kph",
        meetupLocation: draft.meetupLocation || "",
        coordinates: { lat: 51.5074, lng: -0.1278 },
        date: draft.date || "",
        time: draft.time || "",
        cafeStop: draft.cafeStop || "",
        routeLink: draft.routeLink || "",
        femaleOnly: draft.gender === "Female only",
        ageMin: draft.ageMin || "",
        ageMax: draft.ageMax || "",
        visibility: draft.visibility || "All",
        difficulty: draft.difficulty || "Beginner",
        specialComments: draft.specialComments || "",
      });
      if (draft.subtype) {
        setSelectedType(draft.subtype);
      }
    }
  }, [getDraft]);

  const hasFormData = () => {
    return (
      Object.values(formData).some((value) =>
        typeof value === "string"
          ? value.trim() !== ""
          : typeof value === "boolean"
            ? value
            : false,
      ) || selectedType !== "Road"
    );
  };

  const handleBack = () => {
    if (hasFormData()) {
      setShowBackModal(true);
    } else {
      navigate("/create");
    }
  };

  const handleSaveDraft = () => {
    const draftData = {
      activityType: "cycling",
      title: `${selectedType} ride`,
      maxParticipants: formData.maxRiders,
      distance: formData.distance,
      distanceUnit: formData.distanceUnit,
      elevation: formData.elevation,
      elevationUnit: formData.elevationUnit,
      pace: formData.pace,
      paceUnit: formData.paceUnit,
      meetupLocation: formData.meetupLocation,
      date: formData.date,
      time: formData.time,
      cafeStop: formData.cafeStop,
      routeLink: formData.routeLink,
      gender: formData.femaleOnly ? "Female only" : "All genders",
      ageMin: formData.ageMin,
      ageMax: formData.ageMax,
      visibility: formData.visibility,
      difficulty: formData.difficulty,
      specialComments: formData.specialComments,
      subtype: selectedType,
      organizer: "You",
      location: formData.meetupLocation,
    };

    saveDraft("cycling", draftData);
    setShowBackModal(false);
    navigate("/create");
  };

  const handleAbandon = () => {
    setShowBackModal(false);
    navigate("/create");
  };

  const handleSubmit = () => {
    if (
      !formData.maxRiders ||
      !formData.meetupLocation ||
      !formData.date ||
      !formData.time
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Create activity with proper title
    const activityTitle = `${selectedType} ride ${formData.distance ? `- ${formData.distance}${formData.distanceUnit}` : ""}`;

    addActivity({
      type: "cycling",
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
      pace: formData.pace,
      paceUnit: formData.paceUnit,
      maxParticipants: formData.maxRiders,
      specialComments: formData.specialComments,
      routeLink: formData.routeLink,
      cafeStop: formData.cafeStop,
      subtype: selectedType,
      gender: formData.femaleOnly ? "Female only" : "All genders",
      ageMin: formData.ageMin,
      ageMax: formData.ageMax,
      visibility: formData.visibility,
      difficulty: formData.difficulty,
      club:
        formData.visibility === "Club members" ? "oxford-cycling" : undefined, // Assume cycling is for Oxford club
      imageSrc:
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop&crop=face",
    });

    // Delete draft on successful creation
    deleteDraft("cycling");
    alert("Activity created successfully!");
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

      {/* Scrollable Content */}
      <div className="overflow-y-auto pb-20">
        <div className="px-6">
          {/* Back Button */}
          <div className="flex items-center py-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-explore-green font-cabin hover:underline"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>

          {/* Title */}
          <div className="text-center py-2">
            <h1 className="text-3xl font-bold text-explore-green font-cabin">
              New ride!
            </h1>
            {hasDraft("cycling") && (
              <p className="text-sm text-gray-600 font-cabin mt-1">
                Draft loaded - continue editing
              </p>
            )}
          </div>

          <div className="space-y-6">
            {/* Type */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Type
              </h3>
              <div className="flex gap-2 flex-wrap">
                {["Road", "Gravel", "Track", "MTB"].map((type) => (
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

            {/* Max number of riders */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Max number of riders
              </h3>
              <div className="relative">
                <select
                  value={formData.maxRiders}
                  onChange={(e) =>
                    setFormData({ ...formData, maxRiders: e.target.value })
                  }
                  className="appearance-none w-full border-2 border-gray-300 rounded-lg py-3 px-4 pr-10 font-cabin bg-white"
                >
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                    <option key={num} value={num.toString()}>
                      {num} riders
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

            {/* Elevation */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Elevation
              </h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.elevation}
                  onChange={(e) =>
                    setFormData({ ...formData, elevation: e.target.value })
                  }
                  className="flex-1 border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                  placeholder="Enter elevation"
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
                  placeholder="Enter meetup location"
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

            {/* Pace */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Pace
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.pace}
                  onChange={(e) =>
                    setFormData({ ...formData, pace: e.target.value })
                  }
                  className="flex-1 border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                  placeholder="Enter pace"
                />
                <div className="relative">
                  <select
                    value={formData.paceUnit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paceUnit: e.target.value as "kph" | "mph",
                      })
                    }
                    className="appearance-none border-2 border-gray-300 rounded-lg py-3 px-4 pr-10 font-cabin bg-white"
                  >
                    <option value="kph">kph</option>
                    <option value="mph">mph</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Cafe stop */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Cafe stop
              </h3>
              <input
                type="text"
                value={formData.cafeStop}
                onChange={(e) =>
                  setFormData({ ...formData, cafeStop: e.target.value })
                }
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                placeholder="Enter cafe stop location"
              />
            </div>

            {/* Route link */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">
                Route link
              </h3>
              <input
                type="url"
                value={formData.routeLink}
                onChange={(e) =>
                  setFormData({ ...formData, routeLink: e.target.value })
                }
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                placeholder="Enter route link (Strava, Komoot, etc.)"
              />
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
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
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
                  placeholder="Write down additional plans of the day here ..."
                />
              </div>

              {/* Create activity button */}
              <button
                onClick={handleSubmit}
                className="w-full bg-explore-green text-white py-3 px-6 rounded-lg text-base font-cabin font-medium"
              >
                Create activity
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
              {/* Simple map placeholder */}
              <div className="w-full h-full bg-gray-200 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-blue-200"></div>

                {/* Map grid lines */}
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

                {/* Pin */}
                <div
                  className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200"
                  style={{
                    left: `${((formData.coordinates.lng + 0.1278) / 0.2556) * 100}%`,
                    top: `${((51.5174 - formData.coordinates.lat) / 0.02) * 100}%`,
                  }}
                  onClick={(e) => {
                    const rect =
                      e.currentTarget.parentElement?.getBoundingClientRect();
                    if (rect) {
                      const x = (e.clientX - rect.left) / rect.width;
                      const y = (e.clientY - rect.top) / rect.height;
                      const newLng = x * 0.2556 - 0.1278;
                      const newLat = 51.5174 - y * 0.02;

                      setFormData({
                        ...formData,
                        coordinates: { lat: newLat, lng: newLng },
                        meetupLocation: `Location (${newLat.toFixed(4)}, ${newLng.toFixed(4)})`,
                      });
                    }
                  }}
                >
                  <MapPin className="w-6 h-6 text-red-500 drop-shadow-lg" />
                </div>

                {/* Location info */}
                <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs font-cabin">
                  London Area
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

      {/* Back Confirmation Modal */}
      {showBackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-black font-cabin mb-2">
                Save Your Progress?
              </h3>
              <p className="text-gray-600 font-cabin">
                You have unsaved changes. Would you like to save as draft or
                abandon your progress?
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSaveDraft}
                className="w-full py-3 bg-explore-green text-white rounded-lg font-cabin font-medium hover:bg-explore-green-dark transition-colors"
              >
                Save Draft
              </button>
              <button
                onClick={handleAbandon}
                className="w-full py-3 border-2 border-gray-300 rounded-lg text-gray-600 font-cabin font-medium hover:bg-gray-50 transition-colors"
              >
                Abandon Changes
              </button>
              <button
                onClick={() => setShowBackModal(false)}
                className="w-full py-2 text-gray-500 font-cabin hover:underline"
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
