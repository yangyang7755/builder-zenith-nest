import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import {
  MapPin,
  Clock,
  AlertTriangle,
  Info,
  X,
  Calendar,
  Users,
  Target,
  Trophy,
  Bookmark,
  Star,
  Award,
} from "lucide-react";
import { useChat } from "../contexts/ChatContext";

// Partner data structure
const partnersData = {
  "partner-1": {
    id: "partner-1",
    name: "Sarah K.",
    age: 28,
    title: "Looking for a belay partner...",
    organizer: {
      name: "Sarah K.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=80&h=80&fit=crop&crop=face",
    },
    description:
      "Looking for a regular climbing partner for Friday evening sessions. I'm working on lead climbing and could use someone experienced with belaying and safety checks. Love trying new routes and pushing my limits safely!",
    location: "Westway Climbing Centre",
    schedule: "Friday evenings, 6:00-9:00 PM",
    difficulty: "Intermediate",
    climbingLevel: "5.9-5.11",
    experience: "2 years indoor, 6 months outdoor",
    availability: "Fridays 6-9pm, occasional weekends",
    climbingStyle: "Sport climbing & Top rope",
    goals: "Working towards 5.12, outdoor lead climbing",
    personalInfo: {
      location: "West London",
      languages: ["English", "Spanish"],
      interests: ["Photography", "Yoga", "Travel"],
      climbingGoals: "Multi-pitch outdoor routes",
    },
    requirements: {
      title: "reliable climbing partner",
      details: [
        "Solid belaying skills with GriGri and ATC devices",
        "Good communication during climbs",
        "Safety-focused mindset and proper checks",
        "Willingness to work routes together and share beta",
        "Punctual and committed to regular sessions",
      ],
      warning:
        "Looking for someone who takes safety seriously and is committed to improving together. New climbers welcome if you're dedicated to learning proper techniques.",
    },
    tags: ["Lead climbing", "Sport routes", "Technique focused", "Regular partner"],
    preferences: {
      ageRange: "25-35",
      experience: "1+ years climbing",
      commitment: "Weekly sessions",
      style: "Encouraging and patient",
    },
    achievements: [
      "Completed first outdoor 5.10 route",
      "Lead climber certified",
      "First aid trained",
    ],
  },
  "partner-2": {
    id: "partner-2",
    name: "Alex M.",
    age: 35,
    title: "Climbing buddy needed!",
    organizer: {
      name: "Alex M.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
    },
    description:
      "Experienced boulderer looking for motivation and someone to work projects with. Happy to share beta and spot! I love the problem-solving aspect of bouldering and enjoy working on technical sequences.",
    location: "The Castle Climbing Centre",
    schedule: "Monday & Wednesday evenings, 7:00-10:00 PM",
    difficulty: "Advanced",
    climbingLevel: "V4-V6 Bouldering",
    experience: "5 years climbing, love outdoor bouldering",
    availability: "Monday & Wednesday 7-10pm",
    climbingStyle: "Bouldering specialist",
    goals: "V7-V8 projects, Font 7a+ outdoor",
    personalInfo: {
      location: "North London",
      languages: ["English", "French"],
      interests: ["Rock music", "Craft beer", "Hiking"],
      climbingGoals: "European bouldering trips",
    },
    requirements: {
      title: "dedicated bouldering partner",
      details: [
        "Experience with V3+ boulder problems",
        "Good spotting technique and safety awareness",
        "Patience for working long-term projects",
        "Enthusiasm for technical movement and beta sharing",
        "Interest in outdoor bouldering adventures",
      ],
      warning:
        "Looking for someone who enjoys the mental challenge of bouldering and doesn't mind failing repeatedly while working projects. Outdoor experience preferred but not required.",
    },
    tags: ["Bouldering", "Project climbing", "Technical", "Outdoor trips"],
    preferences: {
      ageRange: "28-45",
      experience: "3+ years bouldering",
      commitment: "Bi-weekly sessions",
      style: "Analytical and encouraging",
    },
    achievements: [
      "Sent first V6 outdoor",
      "Completed Font 6c+ circuit",
      "Bouldering coach qualification",
    ],
  },
  "partner-3": {
    id: "partner-3",
    name: "Emma R.",
    age: 26,
    title: "Lead climbing partner wanted",
    organizer: {
      name: "Emma R.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=80&h=80&fit=crop&crop=face",
    },
    description:
      "Keen sport climber seeking a reliable partner for weekend sessions. Planning outdoor trips to Portland and Peak District. Love the flow and endurance aspects of sport climbing!",
    location: "VauxWall East",
    schedule: "Saturday mornings, 9:00 AM - 1:00 PM",
    difficulty: "Intermediate+",
    climbingLevel: "6a-6c Sport",
    experience: "3 years indoor, outdoor certified",
    availability: "Saturdays 9am-1pm",
    climbingStyle: "Sport climbing focus",
    goals: "7a redpoint, multi-pitch routes",
    personalInfo: {
      location: "South London",
      languages: ["English", "German"],
      interests: ["Running", "Cooking", "Environmental causes"],
      climbingGoals: "Alpine multi-pitch routes",
    },
    requirements: {
      title: "committed sport climbing partner",
      details: [
        "Lead climbing experience (6a+ comfortable)",
        "Outdoor climbing experience or strong interest",
        "Reliable belaying with experience catching leads",
        "Available for weekend trips and outdoor adventures",
        "Positive attitude and good communication skills",
      ],
      warning:
        "Planning regular outdoor trips so looking for someone who can commit to weekends away. Must be comfortable with lead falls and outdoor climbing environments.",
    },
    tags: ["Sport climbing", "Outdoor trips", "Lead climbing", "Weekend warrior"],
    preferences: {
      ageRange: "22-35",
      experience: "2+ years sport climbing",
      commitment: "Weekly sessions + trips",
      style: "Adventurous and reliable",
    },
    achievements: [
      "First 6b+ redpoint outdoors",
      "Multi-pitch certified",
      "Mountain leader trained",
    ],
  },
};

export default function PartnerDetails() {
  const navigate = useNavigate();
  const { partnerId } = useParams();
  const { addJoinRequest } = useChat();
  const [agreedToRequirements, setAgreedToRequirements] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  // Get partner data based on ID
  const partner = partnerId
    ? partnersData[partnerId as keyof typeof partnersData]
    : null;

  useEffect(() => {
    if (!partner) {
      navigate("/explore");
    }
  }, [partner, navigate]);

  if (!partner) {
    return null;
  }

  const handleSendPartnerRequest = () => {
    if (agreedToRequirements) {
      setShowRequestModal(true);
    }
  };

  const handleSendRequest = () => {
    addJoinRequest({
      activityTitle: `Partner request to ${partner.name}`,
      activityOrganizer: partner.name,
      requesterName: "You",
      message: requestMessage || `Hi ${partner.name}! I'd like to be your climbing partner.`,
    });

    setShowRequestModal(false);
    setRequestMessage("");
    alert("Partner request sent! They will receive your message soon.");
    navigate("/chat");
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-700";
      case "intermediate":
      case "intermediate+":
        return "bg-yellow-100 text-yellow-700";
      case "advanced":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
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

      {/* Main Content */}
      <div className="px-6 pb-24">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mt-4 mb-4 text-explore-green font-cabin"
        >
          ← Back to explore
        </button>

        {/* Title and Difficulty */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-3">
            <h1 className="text-2xl font-bold text-explore-green font-cabin leading-tight flex-1 pr-4">
              {partner.title}
            </h1>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm px-3 py-1 rounded-full font-cabin font-medium ${getDifficultyColor(partner.difficulty)}`}
              >
                {partner.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Partner Profile Section */}
        <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
          <img
            src={partner.organizer.image}
            alt={partner.organizer.name}
            className="w-16 h-16 rounded-full border border-black object-cover"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-black font-cabin">
              {partner.name}, {partner.age}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm bg-explore-green bg-opacity-10 text-explore-green px-2 py-1 rounded font-cabin">
                🧗 {partner.climbingLevel}
              </span>
              <span className="text-sm text-gray-600 font-cabin">
                {partner.experience}
              </span>
            </div>
            <div className="text-sm text-gray-600 font-cabin mt-1">
              📍 {partner.personalInfo.location}
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-black font-cabin mb-3">
            About {partner.name}
          </h3>
          <p className="text-sm text-black font-cabin leading-relaxed">
            {partner.description}
          </p>
        </div>

        {/* Climbing Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Location */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-1">
              <MapPin className="w-5 h-5 text-red-500" />
              <h3 className="text-xl font-bold text-black font-cabin">
                Preferred Location
              </h3>
            </div>
            <p className="text-sm text-gray-600 font-cabin ml-8">
              {partner.location}
            </p>
          </div>

          {/* Availability */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-1">
              <Clock className="w-5 h-5 text-gray-400" />
              <h3 className="text-xl font-bold text-black font-cabin">Availability</h3>
            </div>
            <p className="text-sm text-black font-cabin ml-8">
              {partner.schedule}
            </p>
          </div>

          {/* Climbing Style */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-purple-500" />
              <h4 className="text-lg font-bold text-black font-cabin">
                Style
              </h4>
            </div>
            <p className="text-sm text-black font-cabin ml-6">
              {partner.climbingStyle}
            </p>
          </div>

          {/* Goals */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-green-500" />
              <h4 className="text-lg font-bold text-black font-cabin">
                Goals
              </h4>
            </div>
            <p className="text-sm text-black font-cabin ml-6">
              {partner.goals}
            </p>
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-black font-cabin mb-3">Achievements</h3>
          <div className="space-y-2">
            {partner.achievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-cabin text-black">{achievement}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Info */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-black font-cabin mb-3">Personal Info</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 font-cabin">Languages:</span>
              <span className="font-medium text-black font-cabin">
                {partner.personalInfo.languages.join(", ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-cabin">Interests:</span>
              <span className="font-medium text-black font-cabin">
                {partner.personalInfo.interests.join(", ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-cabin">Climbing Goals:</span>
              <span className="font-medium text-black font-cabin">
                {partner.personalInfo.climbingGoals}
              </span>
            </div>
          </div>
        </div>

        {/* Partner Preferences */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-black font-cabin mb-3">Looking For</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-sm text-gray-600 font-cabin">Age Range:</span>
              <div className="font-medium text-black font-cabin">{partner.preferences.ageRange}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600 font-cabin">Experience:</span>
              <div className="font-medium text-black font-cabin">{partner.preferences.experience}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600 font-cabin">Commitment:</span>
              <div className="font-medium text-black font-cabin">{partner.preferences.commitment}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600 font-cabin">Style:</span>
              <div className="font-medium text-black font-cabin">{partner.preferences.style}</div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-black font-cabin mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {partner.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-explore-green bg-opacity-10 text-explore-green px-3 py-1 rounded-full font-cabin"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Requirements Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h3 className="text-xl font-bold text-black font-cabin">
              Partner Requirements
            </h3>
          </div>
          <div className="ml-8 relative">
            <p className="text-sm text-black font-cabin mb-6">
              {partner.name} is looking for a{" "}
              <span
                className="underline cursor-pointer"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                {partner.requirements.title}
              </span>{" "}
              <Info className="inline w-4 h-4 text-gray-400" />.
            </p>

            {/* Tooltip positioned outside the paragraph */}
            {showTooltip && (
              <div className="absolute left-0 top-16 bg-explore-green text-white p-4 rounded-lg shadow-lg z-50 w-80 text-sm font-cabin">
                <div className="font-bold text-base mb-2">
                  Partner Requirements
                </div>
                <div className="mb-2">
                  To be a good match, you should have:
                </div>
                <ul className="space-y-1 mb-3">
                  {partner.requirements.details.map((detail, index) => (
                    <li key={index}>• {detail}</li>
                  ))}
                </ul>
                <div className="flex items-start gap-2 bg-yellow-500 bg-opacity-20 p-2 rounded">
                  <span className="text-yellow-300 font-bold">⚠</span>
                  <div className="text-sm">{partner.requirements.warning}</div>
                </div>
              </div>
            )}

            {/* Checkbox */}
            <div className="flex items-start gap-3 mb-8">
              <input
                type="checkbox"
                id="partner-agreement"
                checked={agreedToRequirements}
                onChange={(e) => setAgreedToRequirements(e.target.checked)}
                className="w-4 h-4 mt-0.5 border-2 border-gray-300 rounded"
              />
              <label
                htmlFor="partner-agreement"
                className="text-sm text-black font-cabin cursor-pointer"
              >
                I agree that I meet the partner requirements and am committed to being a reliable climbing partner{" "}
                <Info className="inline w-4 h-4 text-gray-400" />
              </label>
            </div>
          </div>
        </div>

        {/* Send Partner Request Button */}
        <button
          onClick={handleSendPartnerRequest}
          disabled={!agreedToRequirements}
          className={`w-full py-3 rounded-lg text-lg font-cabin font-medium transition-colors ${
            agreedToRequirements
              ? "bg-explore-green text-white hover:bg-explore-green-light"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Send Partner Request
        </button>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-explore-green font-cabin">
                Send Partner Request
              </h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 font-cabin mb-3">
                Send a message to {partner.name} (optional):
              </p>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder={`Hi ${partner.name}! I'd like to be your climbing partner. I think we'd be a great match based on...`}
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin h-32 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 py-3 border-2 border-gray-300 rounded-lg text-gray-600 font-cabin font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSendRequest}
                className="flex-1 py-3 bg-explore-green text-white rounded-lg font-cabin font-medium"
              >
                Send Request
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

function BottomNavigation() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white h-14 flex items-center justify-around border-t border-gray-200 max-w-md mx-auto">
      {/* Home Icon */}
      <Link to="/explore" className="p-2">
        <svg className="w-8 h-7" viewBox="0 0 35 31" fill="none">
          <path
            d="M31.4958 7.46836L21.4451 1.22114C18.7055 -0.484058 14.5003 -0.391047 11.8655 1.42266L3.12341 7.48386C1.37849 8.693 0 11.1733 0 13.1264V23.8227C0 27.7756 3.61199 31 8.06155 31H26.8718C31.3213 31 34.9333 27.7911 34.9333 23.8382V13.328C34.9333 11.2353 33.4152 8.662 31.4958 7.46836ZM18.7753 24.7993C18.7753 25.4349 18.1821 25.9619 17.4666 25.9619C16.7512 25.9619 16.1579 25.4349 16.1579 24.7993V20.1487C16.1579 19.5132 16.7512 18.9861 17.4666 18.9861C18.1821 18.9861 18.7753 19.5132 18.7753 20.1487V24.7993Z"
            fill="#2F2F2F"
          />
        </svg>
      </Link>

      {/* Clock Icon */}
      <Link to="/saved" className="p-2">
        <svg
          className="w-7 h-7"
          viewBox="0 0 30 30"
          fill="none"
          stroke="#1E1E1E"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="15" cy="15" r="12.5" />
          <path d="M15 7.5V15L20 17.5" />
        </svg>
      </Link>

      {/* Plus Icon */}
      <Link to="/create" className="p-2">
        <svg
          className="w-7 h-7"
          viewBox="0 0 30 30"
          fill="none"
          stroke="#1E1E1E"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 6.25V23.75M6.25 15H23.75" />
        </svg>
      </Link>

      {/* Chat Icon */}
      <Link to="/chat" className="p-2">
        <svg className="w-7 h-7" viewBox="0 0 30 30" fill="none">
          <path
            d="M2.5 27.5V5C2.5 4.3125 2.74479 3.72396 3.23438 3.23438C3.72396 2.74479 4.3125 2.5 5 2.5H25C25.6875 2.5 26.276 2.74479 26.7656 3.23438C27.2552 3.72396 27.5 4.3125 27.5 5V20C27.5 20.6875 27.2552 21.276 26.7656 21.7656C26.276 22.2552 25.6875 22.5 25 22.5H7.5L2.5 27.5Z"
            fill="#1D1B20"
          />
        </svg>
      </Link>

      {/* Profile Icon */}
      <Link to="/profile" className="p-2">
        <svg className="w-8 h-8" viewBox="0 0 35 35" fill="none">
          <path
            d="M17.5 17.4999C15.8958 17.4999 14.5225 16.9287 13.3802 15.7864C12.2378 14.644 11.6666 13.2708 11.6666 11.6666C11.6666 10.0624 12.2378 8.68915 13.3802 7.54679C14.5225 6.40443 15.8958 5.83325 17.5 5.83325C19.1041 5.83325 20.4774 6.40443 21.6198 7.54679C22.7621 8.68915 23.3333 10.0624 23.3333 11.6666C23.3333 13.2708 22.7621 14.644 21.6198 15.7864C20.4774 16.9287 19.1041 17.4999 17.5 17.4999ZM5.83331 29.1666V25.0833C5.83331 24.2569 6.04599 23.4973 6.47133 22.8046C6.89668 22.1119 7.46179 21.5833 8.16665 21.2187C9.67359 20.4652 11.2048 19.9001 12.7604 19.5234C14.316 19.1466 15.8958 18.9583 17.5 18.9583C19.1041 18.9583 20.684 19.1466 22.2396 19.5234C23.7951 19.9001 25.3264 20.4652 26.8333 21.2187C27.5382 21.5833 28.1033 22.1119 28.5286 22.8046C28.954 23.4973 29.1666 24.2569 29.1666 25.0833V29.1666H5.83331Z"
            fill="#1D1B20"
          />
        </svg>
      </Link>

      {/* Navigation Indicator */}
      <div className="absolute bottom-2 left-12 w-2 h-2 bg-white border border-explore-green rounded-full"></div>
    </div>
  );
}
