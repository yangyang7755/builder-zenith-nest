import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronDown } from "lucide-react";
import { useActivities } from "../contexts/ActivitiesContext";

export default function CreateCycling() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("Road");
  const [formData, setFormData] = useState({
    maxRiders: "",
    distance: "",
    distanceUnit: "km" as "km" | "miles",
    elevation: "",
    elevationUnit: "m" as "m" | "feet",
    pace: "",
    paceUnit: "kph" as "kph" | "mph",
    meetupLocation: "",
    date: "",
    time: "",
    cafeStop: "",
    routeLink: "",
    gender: "Female only",
    ageMin: "",
    ageMax: "",
    visibility: "All",
    specialComments: "",
  });

  const { addActivity } = useActivities();

  const handleSubmit = () => {
    if (!formData.maxRiders || !formData.meetupLocation || !formData.date || !formData.time) {
      alert("Please fill in all required fields");
      return;
    }

    // Create activity with proper title
    const activityTitle = `${selectedType} ride ${formData.distance ? `- ${formData.distance}${formData.distanceUnit}` : ''}`;

    addActivity({
      type: 'cycling',
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
      gender: formData.gender,
      ageMin: formData.ageMin,
      ageMax: formData.ageMax,
      visibility: formData.visibility,
      imageSrc: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop&crop=face"
    });

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
            <rect x="1" y="3" width="22" height="10" rx="2" stroke="black" strokeWidth="1" fill="none"/>
            <rect x="23" y="6" width="2" height="4" rx="1" fill="black"/>
          </svg>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto pb-20">
        <div className="px-6">
          {/* Title */}
          <div className="text-center py-4">
            <h1 className="text-3xl font-bold text-explore-green font-cabin">New ride!</h1>
          </div>

          <div className="space-y-6">
            {/* Type */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">Type</h3>
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
              <h3 className="text-xl font-medium text-black font-cabin mb-3">Max number of riders</h3>
              <input
                type="number"
                value={formData.maxRiders}
                onChange={(e) => setFormData({...formData, maxRiders: e.target.value})}
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                placeholder="Enter max number"
              />
            </div>

            {/* Distance */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">Distance</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.distance}
                  onChange={(e) => setFormData({...formData, distance: e.target.value})}
                  className="flex-1 border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                  placeholder="Enter distance"
                />
                <div className="relative">
                  <select
                    value={formData.distanceUnit}
                    onChange={(e) => setFormData({...formData, distanceUnit: e.target.value as "km" | "miles"})}
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
              <h3 className="text-xl font-medium text-black font-cabin mb-3">Elevation</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.elevation}
                  onChange={(e) => setFormData({...formData, elevation: e.target.value})}
                  className="flex-1 border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                  placeholder="Enter elevation"
                />
                <div className="relative">
                  <select
                    value={formData.elevationUnit}
                    onChange={(e) => setFormData({...formData, elevationUnit: e.target.value as "m" | "feet"})}
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
              <h3 className="text-xl font-medium text-black font-cabin mb-3">Meetup location</h3>
              <input
                type="text"
                value={formData.meetupLocation}
                onChange={(e) => setFormData({...formData, meetupLocation: e.target.value})}
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                placeholder="Enter meetup location"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-xl font-medium text-black font-cabin mb-3">Date</h3>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin pr-10"
                    placeholder="dd/mm/yyyy"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-medium text-black font-cabin mb-3">Time</h3>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                />
              </div>
            </div>

            {/* Pace */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">Pace</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.pace}
                  onChange={(e) => setFormData({...formData, pace: e.target.value})}
                  className="flex-1 border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                  placeholder="Enter pace"
                />
                <div className="relative">
                  <select
                    value={formData.paceUnit}
                    onChange={(e) => setFormData({...formData, paceUnit: e.target.value as "kph" | "mph"})}
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
              <h3 className="text-xl font-medium text-black font-cabin mb-3">Cafe stop</h3>
              <input
                type="text"
                value={formData.cafeStop}
                onChange={(e) => setFormData({...formData, cafeStop: e.target.value})}
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                placeholder="Enter cafe stop location"
              />
            </div>

            {/* Route link */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-3">Route link</h3>
              <input
                type="url"
                value={formData.routeLink}
                onChange={(e) => setFormData({...formData, routeLink: e.target.value})}
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin"
                placeholder="Enter route link"
              />
            </div>

            {/* Optional (special filters) */}
            <div>
              <h2 className="text-2xl font-bold text-explore-green font-cabin mb-6">
                Optional (special filters)
              </h2>

              {/* Gender */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-black font-cabin mb-3">Gender</h3>
                <button className="bg-explore-green text-white px-6 py-2 rounded-lg font-bold text-sm font-cabin">
                  Female only
                </button>
              </div>

              {/* Age range */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-black font-cabin mb-3">Age range</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={formData.ageMin}
                    onChange={(e) => setFormData({...formData, ageMin: e.target.value})}
                    className="border-2 border-gray-300 rounded-lg py-2 px-3 font-cabin"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={formData.ageMax}
                    onChange={(e) => setFormData({...formData, ageMax: e.target.value})}
                    className="border-2 border-gray-300 rounded-lg py-2 px-3 font-cabin"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Activity visibility */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-black font-cabin mb-3">Activity visibility</h3>
                <div className="flex gap-2">
                  {["All", "Followers", "Club members"].map((option) => (
                    <button
                      key={option}
                      onClick={() => setFormData({...formData, visibility: option})}
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
                <h3 className="text-lg font-medium text-black font-cabin mb-3">Special comments</h3>
                <textarea
                  value={formData.specialComments}
                  onChange={(e) => setFormData({...formData, specialComments: e.target.value})}
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

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

function BottomNavigation() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white h-14 flex items-center justify-around border-t border-gray-200 max-w-md mx-auto">
      {/* Navigation indicator */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border border-explore-green rounded-full"></div>
    </div>
  );
}
