import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RequestJoinModal from "./RequestJoinModal";

interface ActivityCardProps {
  title: string;
  date: string;
  location: string;
  imageSrc: string;
  isFirstCard?: boolean;
  organizer?: string;
  type?: string;
  distance?: string;
  pace?: string;
  elevation?: string;
  difficulty?: string;
  activityId?: string;
}

export default function ActivityCard({
  title,
  date,
  location,
  imageSrc,
  isFirstCard = false,
  organizer = "Community",
  type = "climbing",
  distance,
  pace,
  elevation,
  difficulty,
  activityId,
}: ActivityCardProps) {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (activityId) {
      navigate(`/activity/${activityId}`);
    } else {
      // For default activities without specific IDs, navigate to westway-womens-climb as example
      navigate("/activity/westway-womens-climb");
    }
  };

  const handleRequestClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setShowRequestModal(true);
  };

  // Determine difficulty level and color
  const getDifficultyBadge = () => {
    if (!difficulty && type === "cycling") {
      if (pace && parseInt(pace) > 30)
        return { label: "Advanced", color: "bg-red-100 text-red-700" };
      if (pace && parseInt(pace) > 25)
        return {
          label: "Intermediate",
          color: "bg-yellow-100 text-yellow-700",
        };
      return { label: "Beginner", color: "bg-green-100 text-green-700" };
    }
    if (!difficulty)
      return { label: "All levels", color: "bg-gray-100 text-gray-700" };

    const level = difficulty.toLowerCase();
    if (level.includes("beginner") || level.includes("all"))
      return { label: difficulty, color: "bg-green-100 text-green-700" };
    if (level.includes("intermediate"))
      return { label: difficulty, color: "bg-yellow-100 text-yellow-700" };
    if (level.includes("advanced") || level.includes("expert"))
      return { label: difficulty, color: "bg-red-100 text-red-700" };
    return { label: difficulty, color: "bg-blue-100 text-blue-700" };
  };

  const difficultyBadge = getDifficultyBadge();

  return (
    <>
      <div
        className="min-w-72 w-72 border-2 border-explore-green rounded-lg p-4 flex-shrink-0 bg-white cursor-pointer hover:shadow-lg transition-shadow duration-200"
        onClick={handleCardClick}
      >
        {/* Header with title and difficulty badge */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-black font-cabin text-lg line-clamp-2 leading-tight flex-1 pr-2">
            {title}
          </h3>
          <span
            className={`text-xs px-3 py-1 rounded-full font-cabin font-medium flex-shrink-0 ${difficultyBadge.color}`}
          >
            {difficultyBadge.label}
          </span>
        </div>

        {/* Organizer info */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={imageSrc}
            alt="Organizer"
            className="w-12 h-12 rounded-full border border-black object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-600 font-cabin">
              By {organizer}
            </div>
          </div>
        </div>

        {/* Date and Location */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-black font-cabin">
              {date}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-black font-cabin">
              {location}
            </span>
          </div>
        </div>

        {/* Activity Metrics */}
        {type === "cycling" && (distance || pace || elevation) && (
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              {distance && (
                <div>
                  <div className="text-xs text-gray-500 font-cabin mb-1">
                    Distance
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-yellow-600">🚴</span>
                    <span className="text-sm font-medium text-black font-cabin">
                      {distance}
                    </span>
                  </div>
                </div>
              )}
              {pace && (
                <div>
                  <div className="text-xs text-gray-500 font-cabin mb-1">
                    Pace
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-yellow-500">⚡</span>
                    <span className="text-sm font-medium text-black font-cabin">
                      {pace}
                    </span>
                  </div>
                </div>
              )}
              {elevation && (
                <div>
                  <div className="text-xs text-gray-500 font-cabin mb-1">
                    Elevation
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-green-600">⛰️</span>
                    <span className="text-sm font-medium text-black font-cabin">
                      {elevation}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Request to join button */}
        <div className="w-full">
          <button
            onClick={handleRequestClick}
            className="w-full bg-explore-green text-white py-3 rounded-lg text-sm font-cabin font-medium hover:bg-explore-green-dark transition-colors"
          >
            Request to join
          </button>
        </div>
      </div>

      {/* Request Modal */}
      <RequestJoinModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        activityTitle={title}
        organizerName={organizer}
        organizerImage={imageSrc}
      />
    </>
  );
}
