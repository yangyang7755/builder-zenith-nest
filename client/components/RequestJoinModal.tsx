import { useState } from "react";
import { X } from "lucide-react";
import { useChat } from "../contexts/ChatContext";

interface RequestJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityTitle: string;
  organizerName: string;
  organizerImage: string;
  activityId: string;
  onRequestSent: () => void;
}

export default function RequestJoinModal({
  isOpen,
  onClose,
  activityTitle,
  organizerName,
  organizerImage,
  activityId,
  onRequestSent,
}: RequestJoinModalProps) {
  const [requestMessage, setRequestMessage] = useState("");
  const { addJoinRequest, hasRequestedActivity } = useChat();

  if (!isOpen) return null;

  const handleSendRequest = () => {
    // Check if already requested this activity
    if (hasRequestedActivity(activityId)) {
      alert("You have already requested to join this activity.");
      onClose();
      return;
    }

    addJoinRequest({
      activityTitle: activityTitle,
      activityOrganizer: organizerName,
      requesterName: "You",
      message: requestMessage || "Hi! I'd like to join this activity.",
      activityId: activityId,
    });

    setRequestMessage("");
    onRequestSent(); // This will update the button state
    alert("Request sent! You can check your message in the Chat page.");
  };

  return (
    <div className={`native-modal ${isOpen ? 'open' : ''}`}>
      <div className="native-modal-content">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-explore-green font-cabin">
            Quick Request
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Activity info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <img
              src={organizerImage}
              alt={organizerName}
              className="w-10 h-10 rounded-full border border-black object-cover"
            />
            <div>
              <div className="font-bold text-sm text-explore-green font-cabin line-clamp-1">
                {activityTitle}
              </div>
              <div className="text-xs text-gray-600 font-cabin">
                By {organizerName}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 font-cabin mb-3">
            Send a message to {organizerName} (optional):
          </p>
          <textarea
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            placeholder="Hi! I'd like to join this activity..."
            className="w-full native-input h-20 resize-none font-cabin"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 native-button-secondary font-cabin"
          >
            Cancel
          </button>
          <button
            onClick={handleSendRequest}
            className="flex-1 native-button font-cabin"
          >
            Send Request
          </button>
        </div>

        <div className="mt-3 text-center">
          <button
            onClick={onClose}
            className="text-sm text-explore-green underline font-cabin"
          >
            View full details instead
          </button>
        </div>
      </div>
    </div>
  );
}
