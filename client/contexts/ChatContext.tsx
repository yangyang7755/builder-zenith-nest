import { createContext, useContext, useState, ReactNode } from "react";

export interface JoinRequest {
  id: string;
  activityTitle: string;
  activityOrganizer: string;
  requesterName: string;
  message: string;
  timestamp: Date;
  status: "pending" | "accepted" | "declined";
}

export interface ChatMessage {
  id: string;
  type: "join_request" | "general";
  sender: string;
  content: string;
  timestamp: Date;
  activityTitle?: string;
  activityOrganizer?: string;
}

interface ChatContextType {
  joinRequests: JoinRequest[];
  chatMessages: ChatMessage[];
  requestedActivities: Set<string>;
  addJoinRequest: (
    request: Omit<JoinRequest, "id" | "timestamp" | "status"> & { activityId: string },
  ) => void;
  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  hasRequestedActivity: (activityId: string) => boolean;
  respondToRequest: (requestId: string, response: "accepted" | "declined", message?: string) => void;
  getConversationWith: (organizerName: string) => ChatMessage[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [requestedActivities, setRequestedActivities] = useState<Set<string>>(new Set());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    // Default messages for demonstration
    {
      id: "1",
      type: "general",
      sender: "Coach Holly Peristiani",
      content: "Sent 2h ago",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "2",
      type: "general",
      sender: "Maddie Wei",
      content: "Liked a message . 2h",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "3",
      type: "general",
      sender: "Dan Smith",
      content: "Reacted 😢 to your message . 3h",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
      id: "4",
      type: "general",
      sender: "UCLMC",
      content: "lewis_tay: Let's do it",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: "5",
      type: "general",
      sender: "Maggie Chang",
      content: "Can you send me the address ... 12w",
      timestamp: new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000),
    },
  ]);

  const addJoinRequest = (
    requestData: Omit<JoinRequest, "id" | "timestamp" | "status"> & { activityId: string },
  ) => {
    // Check if already requested this activity
    if (requestedActivities.has(requestData.activityId)) {
      return; // Don't add duplicate request
    }

    const newRequest: JoinRequest = {
      ...requestData,
      id: Date.now().toString(),
      timestamp: new Date(),
      status: "pending",
    };
    setJoinRequests((prev) => [newRequest, ...prev]);

    // Mark this activity as requested
    setRequestedActivities((prev) => new Set([...prev, requestData.activityId]));

    // Create live chat message between user and organizer
    const liveChatMessage: ChatMessage = {
      id: Date.now().toString() + "_live_chat",
      type: "join_request",
      sender: "You", // Current user
      content: `Hi! I'd like to join "${requestData.activityTitle}". ${requestData.message || "Looking forward to it!"}`,
      timestamp: new Date(),
      activityTitle: requestData.activityTitle,
      activityOrganizer: requestData.activityOrganizer,
    };

    // Add to chat messages (this represents the live chat between user and organizer)
    setChatMessages((prev) => [liveChatMessage, ...prev]);

    // Simulate organizer's auto-response after a short delay
    setTimeout(() => {
      const organizerResponse: ChatMessage = {
        id: Date.now().toString() + "_organizer_response",
        type: "general",
        sender: requestData.activityOrganizer,
        content: `Thanks for your interest in "${requestData.activityTitle}"! I'll review your request and get back to you soon. 👍`,
        timestamp: new Date(),
        activityTitle: requestData.activityTitle,
        activityOrganizer: requestData.activityOrganizer,
      };
      setChatMessages((prev) => [organizerResponse, ...prev]);
    }, 2000); // 2 second delay for realistic feel

    // Show confirmation that message was sent to live chat
    showChatNotification(`Your request has been sent to ${requestData.activityOrganizer} in your direct messages.`);
  };

  const hasRequestedActivity = (activityId: string) => {
    return requestedActivities.has(activityId);
  };

  const respondToRequest = (requestId: string, response: "accepted" | "declined", message?: string) => {
    // Update the request status
    setJoinRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? { ...req, status: response }
          : req
      )
    );

    // Find the request to get details
    const request = joinRequests.find(req => req.id === requestId);
    if (!request) return;

    // Add organizer's response to chat
    const responseMessage: ChatMessage = {
      id: Date.now().toString() + "_response",
      type: "general",
      sender: request.activityOrganizer,
      content: response === "accepted"
        ? `Great news! Your request to join "${request.activityTitle}" has been accepted! 🎉 ${message || "See you there!"}`
        : `Sorry, your request to join "${request.activityTitle}" has been declined. ${message || "Better luck next time!"}`,
      timestamp: new Date(),
      activityTitle: request.activityTitle,
      activityOrganizer: request.activityOrganizer,
    };

    setChatMessages(prev => [responseMessage, ...prev]);

    // Show notification
    showChatNotification(
      response === "accepted"
        ? `Your request to join "${request.activityTitle}" was accepted!`
        : `Your request to join "${request.activityTitle}" was declined.`
    );
  };

  const getConversationWith = (organizerName: string): ChatMessage[] => {
    return chatMessages.filter(msg =>
      msg.sender === organizerName ||
      (msg.sender === "You" && msg.activityOrganizer === organizerName)
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const addChatMessage = (
    messageData: Omit<ChatMessage, "id" | "timestamp">,
  ) => {
    const newMessage: ChatMessage = {
      ...messageData,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setChatMessages((prev) => [newMessage, ...prev]);
  };

  return (
    <ChatContext.Provider
      value={{
        joinRequests,
        chatMessages,
        requestedActivities,
        addJoinRequest,
        addChatMessage,
        hasRequestedActivity,
        respondToRequest,
        getConversationWith
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
