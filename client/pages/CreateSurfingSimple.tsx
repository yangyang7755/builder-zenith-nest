import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import { useActivities } from "../contexts/ActivitiesContext";
import { useToast } from "../hooks/use-toast";
import MapView from "../components/MapView";

export default function CreateSurfingSimple() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createActivity } = useActivities();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);
  
  const [formData, setFormData] = useState({
    maxSurfers: "6",
    location: "",
    coordinates: { lat: 50.8429, lng: -0.1313 }, // Default to Brighton
    date: "",
    time: "",
    difficulty: "Beginner",
    specialComments: "",
    waveHeight: "1-2",
    boardType: "Any",
  });

  const handleLocationSelect = (location: { lat: number; lng: number }, address: string) => {
    setFormData(prev => ({
      ...prev,
      location: address,
      coordinates: location
    }));
    setShowLocationMap(false);
  };

  const handleSubmit = async () => {
    if (!formData.location || !formData.date || !formData.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const activityData = {
        title: `Surfing at ${formData.location}`,
        description: formData.specialComments || `Join us for a ${formData.difficulty.toLowerCase()} surfing session at ${formData.location}. Expected wave height: ${formData.waveHeight}ft.`,
        activity_type: "surfing",
        date_time: `${formData.date}T${formData.time}:00Z`,
        location: formData.location,
        coordinates: formData.coordinates,
        max_participants: parseInt(formData.maxSurfers),
        difficulty_level: formData.difficulty.toLowerCase(),
        special_requirements: formData.specialComments,
        activity_data: {
          wave_height: formData.waveHeight,
          board_type: formData.boardType,
          surfing_type: "group_session"
        }
      };

      const result = await createActivity(activityData);
      
      if (result.success) {
        toast({
          title: "Activity Created! 🏄‍♂️",
          description: "Your surfing activity has been created successfully",
        });
        navigate("/explore");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Failed to create surfing activity:", error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create activity",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showLocationMap) {
    return (
      <MapView
        activities={[]}
        onClose={() => setShowLocationMap(false)}
        onLocationSelect={handleLocationSelect}
        mode="select"
      />
    );
  }

  return (
    <div className="min-h-screen bg-white font-cabin max-w-md mx-auto relative">
      {/* Header */}
      <div className="h-11 bg-white flex items-center justify-between px-6 text-black font-medium">
        <span>9:41</span>
        <div className="flex gap-0.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-1 h-3 bg-black rounded-sm" />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-6 pb-4">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
        <h1 className="text-xl font-bold text-black font-cabin">Create Surfing</h1>
        <div className="w-6" />
      </div>

      {/* Content */}
      <div className="px-6 space-y-6">
        {/* Max Surfers */}
        <div>
          <label className="block text-lg font-medium text-black font-cabin mb-3">
            Max surfers
          </label>
          <div className="grid grid-cols-4 gap-3">
            {["4", "6", "8", "10"].map((num) => (
              <button
                key={num}
                onClick={() => setFormData({ ...formData, maxSurfers: num })}
                className={`p-3 rounded-lg border-2 font-cabin text-center ${
                  formData.maxSurfers === num
                    ? "border-explore-green bg-explore-green text-white"
                    : "border-gray-300 text-black"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Wave Height */}
        <div>
          <label className="block text-lg font-medium text-black font-cabin mb-3">
            Expected Wave Height (ft)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {["1-2", "2-4", "4-6"].map((height) => (
              <button
                key={height}
                onClick={() => setFormData({ ...formData, waveHeight: height })}
                className={`p-3 rounded-lg border-2 font-cabin text-center ${
                  formData.waveHeight === height
                    ? "border-explore-green bg-explore-green text-white"
                    : "border-gray-300 text-black"
                }`}
              >
                {height}
              </button>
            ))}
          </div>
        </div>

        {/* Board Type */}
        <div>
          <label className="block text-lg font-medium text-black font-cabin mb-3">
            Board Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {["Longboard", "Shortboard", "Any"].map((board) => (
              <button
                key={board}
                onClick={() => setFormData({ ...formData, boardType: board })}
                className={`p-3 rounded-lg border-2 font-cabin text-center ${
                  formData.boardType === board
                    ? "border-explore-green bg-explore-green text-white"
                    : "border-gray-300 text-black"
                }`}
              >
                {board}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-lg font-medium text-black font-cabin mb-3">
            Surf Spot *
          </label>
          <button
            onClick={() => setShowLocationMap(true)}
            className="w-full p-4 border-2 border-gray-300 rounded-lg flex items-center gap-3 text-left"
          >
            <MapPin className="w-5 h-5 text-gray-400" />
            <span className={`flex-1 font-cabin ${formData.location ? "text-black" : "text-gray-500"}`}>
              {formData.location || "Select surf spot"}
            </span>
          </button>
        </div>

        {/* Date & Time */}
        <div>
          <label className="block text-lg font-medium text-black font-cabin mb-3">
            Date & Time *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full p-3 border-2 border-gray-300 rounded-lg font-cabin"
              min={new Date().toISOString().split('T')[0]}
            />
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full p-3 border-2 border-gray-300 rounded-lg font-cabin"
            />
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-lg font-medium text-black font-cabin mb-3">
            Skill Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {["Beginner", "Intermediate", "Advanced"].map((level) => (
              <button
                key={level}
                onClick={() => setFormData({ ...formData, difficulty: level })}
                className={`p-3 rounded-lg border-2 font-cabin text-center ${
                  formData.difficulty === level
                    ? "border-explore-green bg-explore-green text-white"
                    : "border-gray-300 text-black"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Special Comments */}
        <div>
          <label className="block text-lg font-medium text-black font-cabin mb-3">
            Special Comments
          </label>
          <textarea
            value={formData.specialComments}
            onChange={(e) => setFormData({ ...formData, specialComments: e.target.value })}
            placeholder="Any additional details about the surf session..."
            className="w-full p-4 border-2 border-gray-300 rounded-lg font-cabin resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-md mx-auto">
        <div className="p-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full p-4 bg-explore-green text-white rounded-lg font-cabin font-medium hover:bg-green-600 disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Surfing Activity"}
          </button>
        </div>
      </div>
    </div>
  );
}
