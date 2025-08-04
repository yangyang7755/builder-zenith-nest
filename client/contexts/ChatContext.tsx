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

    // Check if there's already a chat with this organizer for this specific activity
    const existingChatIndex = chatMessages.findIndex(
      (msg) =>
        msg.sender === requestData.activityOrganizer &&
        msg.type === "join_request" &&
        msg.activityTitle === requestData.activityTitle,
    );

    if (existingChatIndex !== -1) {
      // Update existing chat message with the new request
      setChatMessages((prev) => {
        const updated = [...prev];
        updated[existingChatIndex] = {
          ...updated[existingChatIndex],
          content:
            requestData.message ||
            `You requested to join "${requestData.activityTitle}"`,
          timestamp: new Date(),
          activityTitle: requestData.activityTitle,
        };
        return updated;
      });
    } else {
      // Create new chat message for this organizer and activity
      const chatMessage: ChatMessage = {
        id: Date.now().toString() + "_chat",
        type: "join_request",
        sender: requestData.activityOrganizer,
        content:
          requestData.message ||
          `You requested to join "${requestData.activityTitle}"`,
        timestamp: new Date(),
        activityTitle: requestData.activityTitle,
        activityOrganizer: requestData.activityOrganizer,
      };
      setChatMessages((prev) => [chatMessage, ...prev]);
    }
  };

  const hasRequestedActivity = (activityId: string) => {
    return requestedActivities.has(activityId);
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
      value={{ joinRequests, chatMessages, addJoinRequest, addChatMessage }}
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
