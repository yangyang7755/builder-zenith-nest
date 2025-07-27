import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, AlertTriangle, Info, X } from "lucide-react";
import { useChat } from "../contexts/ChatContext";

export default function ActivityDetails() {
  const navigate = useNavigate();
  const { addJoinRequest } = useChat();
  const [agreedToRequirements, setAgreedToRequirements] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");

  const handleRequestToJoin = () => {
    if (agreedToRequirements) {
      setShowRequestModal(true);
    }
  };

  const handleSendRequest = () => {
    addJoinRequest({
      activityTitle: "Westway women's+ climbing morning",
      activityOrganizer: "Coach Holly Peristiani",
      requesterName: "You",
      message: requestMessage || "Hi! I'd like to join this activity."
    });

    setShowRequestModal(false);
    setRequestMessage("");
    alert("Request sent! You can check your message in the Chat page.");
    navigate("/chat");
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
        {/* Title */}
        <div className="mb-6 mt-4">
          <h1 className="text-2xl font-bold text-explore-green font-cabin leading-tight">
            Westway women's+ climbing morning
          </h1>
        </div>

        {/* Coach Section */}
        <div className="flex items-center gap-3 mb-6">
          <img
            src="https://images.unsplash.com/photo-1522163182402-834f871fd851?w=80&h=80&fit=crop&crop=face"
            alt="Coach Holly Peristiani"
            className="w-12 h-12 rounded-full border border-black object-cover"
          />
          <div>
            <h2 className="text-lg font-bold text-black font-cabin">
              Coach Holly Peristiani
            </h2>
          </div>
        </div>

        {/* Description Section */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-black font-cabin mb-3">
            Description
          </h3>
          <p className="text-sm text-black font-cabin leading-relaxed">
            This session is perfect for meeting fellow climbers and boosting
            your confidence. Holly can provide expert tips on top-roping, lead
            climbing, abseiling, fall practice and more. Standard entry fees
            apply.
          </p>
        </div>

        {/* Location Section */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <h3 className="text-xl font-bold text-black font-cabin">
              Location
            </h3>
          </div>
          <p className="text-sm text-gray-400 font-cabin ml-6">
            Westway Climbing Centre
          </p>
        </div>

        {/* Time Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Clock className="w-5 h-5 text-gray-400" />
            <h3 className="text-xl font-bold text-black font-cabin">Time</h3>
          </div>
          <p className="text-sm text-black font-cabin ml-8">
            Every Wednesday, 10:00-12:00 AM
          </p>
        </div>

        {/* Requirements Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h3 className="text-xl font-bold text-black font-cabin">
              Requirements
            </h3>
          </div>
          <div className="ml-8">
            <p className="text-sm text-black font-cabin mb-6">
              Participants must be{" "}
              <span className="underline cursor-pointer">
                competent top-rope climbers
              </span>{" "}
              <Info className="inline w-4 h-4 text-gray-400" />.
            </p>

            {/* Checkbox */}
            <div className="flex items-start gap-3 mb-8">
              <input
                type="checkbox"
                id="requirements-agreement"
                checked={agreedToRequirements}
                onChange={(e) => setAgreedToRequirements(e.target.checked)}
                className="w-4 h-4 mt-0.5 border-2 border-gray-300 rounded"
              />
              <label
                htmlFor="requirements-agreement"
                className="text-sm text-black font-cabin cursor-pointer"
              >
                I agree I adhere to the requirements{" "}
                <Info className="inline w-4 h-4 text-gray-400" />
              </label>
            </div>
          </div>
        </div>

        {/* Request to Join Button */}
        <button
          onClick={handleRequestToJoin}
          disabled={!agreedToRequirements}
          className={`w-full py-3 rounded-lg text-lg font-cabin font-medium transition-colors ${
            agreedToRequirements
              ? "bg-explore-green text-white hover:bg-explore-green-light"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Request to join
        </button>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-explore-green font-cabin">
                Send Request
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
                Send a message to Coach Holly Peristiani (optional):
              </p>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Hi! I'd like to join this activity..."
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin h-24 resize-none"
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
      <div className="p-2">
        <svg className="w-8 h-7" viewBox="0 0 35 31" fill="none">
          <path
            d="M31.4958 7.46836L21.4451 1.22114C18.7055 -0.484058 14.5003 -0.391047 11.8655 1.42266L3.12341 7.48386C1.37849 8.693 0 11.1733 0 13.1264V23.8227C0 27.7756 3.61199 31 8.06155 31H26.8718C31.3213 31 34.9333 27.7911 34.9333 23.8382V13.328C34.9333 11.2353 33.4152 8.662 31.4958 7.46836ZM18.7753 24.7993C18.7753 25.4349 18.1821 25.9619 17.4666 25.9619C16.7512 25.9619 16.1579 25.4349 16.1579 24.7993V20.1487C16.1579 19.5132 16.7512 18.9861 17.4666 18.9861C18.1821 18.9861 18.7753 19.5132 18.7753 20.1487V24.7993Z"
            fill="#2F2F2F"
          />
        </svg>
      </div>

      {/* Clock Icon */}
      <div className="p-2">
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
      </div>

      {/* Plus Icon */}
      <div className="p-2">
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
      </div>

      {/* Chat Icon */}
      <div className="p-2">
        <svg className="w-7 h-7" viewBox="0 0 30 30" fill="none">
          <path
            d="M2.5 27.5V5C2.5 4.3125 2.74479 3.72396 3.23438 3.23438C3.72396 2.74479 4.3125 2.5 5 2.5H25C25.6875 2.5 26.276 2.74479 26.7656 3.23438C27.2552 3.72396 27.5 4.3125 27.5 5V20C27.5 20.6875 27.2552 21.276 26.7656 21.7656C26.276 22.2552 25.6875 22.5 25 22.5H7.5L2.5 27.5Z"
            fill="#1D1B20"
          />
        </svg>
      </div>

      {/* Profile Icon */}
      <div className="p-2">
        <svg className="w-8 h-8" viewBox="0 0 35 35" fill="none">
          <path
            d="M17.5 17.4999C15.8958 17.4999 14.5225 16.9287 13.3802 15.7864C12.2378 14.644 11.6666 13.2708 11.6666 11.6666C11.6666 10.0624 12.2378 8.68915 13.3802 7.54679C14.5225 6.40443 15.8958 5.83325 17.5 5.83325C19.1041 5.83325 20.4774 6.40443 21.6198 7.54679C22.7621 8.68915 23.3333 10.0624 23.3333 11.6666C23.3333 13.2708 22.7621 14.644 21.6198 15.7864C20.4774 16.9287 19.1041 17.4999 17.5 17.4999ZM5.83331 29.1666V25.0833C5.83331 24.2569 6.04599 23.4973 6.47133 22.8046C6.89668 22.1119 7.46179 21.5833 8.16665 21.2187C9.67359 20.4652 11.2048 19.9001 12.7604 19.5234C14.316 19.1466 15.8958 18.9583 17.5 18.9583C19.1041 18.9583 20.684 19.1466 22.2396 19.5234C23.7951 19.9001 25.3264 20.4652 26.8333 21.2187C27.5382 21.5833 28.1033 22.1119 28.5286 22.8046C28.954 23.4973 29.1666 24.2569 29.1666 25.0833V29.1666H5.83331Z"
            fill="#1D1B20"
          />
        </svg>
      </div>

      {/* Navigation Indicator */}
      <div className="absolute bottom-2 left-12 w-2 h-2 bg-white border border-explore-green rounded-full"></div>
    </div>
  );
}
