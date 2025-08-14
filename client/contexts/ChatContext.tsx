import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { apiService } from "../services/apiService";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "./AuthContext";

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
  user_id: string;
  club_id?: string;
  message: string;
  created_at: string;
  profiles?: {
    id: string;
    full_name: string;
    profile_image?: string;
  };
  // Legacy fields for backward compatibility
  type?: "join_request" | "general";
  sender?: string;
  content?: string;
  timestamp?: Date;
  activityTitle?: string;
  activityOrganizer?: string;
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  read_at?: string;
  sender?: {
    id: string;
    full_name: string;
    profile_image?: string;
  };
}

export interface ClubChat {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  memberCount: number;
  avatar?: string;
}

interface ChatContextType {
  // Legacy join requests (keep for compatibility)
  joinRequests: JoinRequest[];
  chatMessages: ChatMessage[];
  requestedActivities: Set<string>;

  // Real chat functionality
  clubChats: ClubChat[];
  clubMessages: Map<string, ChatMessage[]>;
  directMessages: Map<string, DirectMessage[]>;
  loading: boolean;
  connected: boolean;

  // Methods
  loadClubChats: () => Promise<void>;
  loadClubMessages: (clubId: string) => Promise<void>;
  loadDirectMessages: (otherUserId: string) => Promise<void>;
  sendClubMessage: (clubId: string, message: string) => Promise<void>;
  sendDirectMessage: (receiverId: string, message: string) => Promise<void>;
  joinClub: (clubId: string) => void;
  leaveClub: (clubId: string) => void;
  markMessagesAsRead: (senderId: string) => Promise<void>;

  // Legacy methods (keep for compatibility)
  addJoinRequest: (
    request: Omit<JoinRequest, "id" | "timestamp" | "status"> & {
      activityId: string;
    },
  ) => void;
  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  hasRequestedActivity: (activityId: string) => boolean;
  respondToRequest: (
    requestId: string,
    response: "accepted" | "declined",
    message?: string,
  ) => void;
  getConversationWith: (organizerName: string) => ChatMessage[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const socket = useSocket();

  // Legacy state (keep for compatibility)
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);

  // Real chat state
  const [clubChats, setClubChats] = useState<ClubChat[]>([]);
  const [clubMessages, setClubMessages] = useState<Map<string, ChatMessage[]>>(new Map());
  const [directMessages, setDirectMessages] = useState<Map<string, DirectMessage[]>>(new Map());
  const [loading, setLoading] = useState(false);

  // Set up Socket.IO event listeners
  useEffect(() => {
    if (socket.connected) {
      // Listen for new club messages
      socket.onClubMessage((message: any) => {
        setClubMessages((prev) => {
          const newMap = new Map(prev);
          const clubId = message.club_id;
          const existing = newMap.get(clubId) || [];
          newMap.set(clubId, [...existing, message]);
          return newMap;
        });
      });

      // Listen for new direct messages
      socket.onDirectMessage((message: any) => {
        setDirectMessages((prev) => {
          const newMap = new Map(prev);
          const otherUserId = message.sender_id === user?.id ? message.receiver_id : message.sender_id;
          const existing = newMap.get(otherUserId) || [];
          newMap.set(otherUserId, [...existing, message]);
          return newMap;
        });
      });
    }
  }, [socket.connected, user?.id]);

  // Load user's club chats
  const loadClubChats = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserClubs();

      if (response.error === "BACKEND_UNAVAILABLE") {
        // Use demo club chats when backend is unavailable
        const demoClubs = [
          {
            id: "oxford-cycling",
            name: "Oxford University Cycling Club",
            lastMessage: "Training ride tomorrow! Meet at Radcliffe Camera 7am",
            lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            unreadCount: 0,
            memberCount: 45,
            avatar: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=60&h=60&fit=crop"
          },
          {
            id: "westway-climbing",
            name: "Westway Climbing Centre",
            lastMessage: "New routes set this week! Come check them out 🧗‍♀️",
            lastMessageTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            unreadCount: 2,
            memberCount: 120,
            avatar: "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2Fcce50dcf455a49d6aa9a7694c8a58f26?format=webp&width=800"
          }
        ];
        setClubChats(demoClubs);
        return;
      }

      if (response.data) {
        // Transform user clubs to chat format
        const clubs = response.data.map((club: any) => ({
          id: club.id,
          name: club.name,
          lastMessage: "",
          lastMessageTime: "",
          unreadCount: 0,
          memberCount: club.member_count || 0,
          avatar: club.profile_image
        }));
        setClubChats(clubs);
      }
    } catch (error) {
      console.error("Failed to load club chats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for a specific club
  const loadClubMessages = async (clubId: string) => {
    try {
      setLoading(true);
      const response = await apiService.getClubMessages(clubId);

      if (response.error === "BACKEND_UNAVAILABLE") {
        // Demo messages when backend unavailable
        const demoMessages = [
          {
            id: "msg1",
            user_id: "demo-user-1",
            club_id: clubId,
            message: "Looking forward to tomorrow's ride!",
            created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            profiles: { id: "demo-user-1", full_name: "Sarah Johnson" }
          }
        ];
        setClubMessages(prev => new Map(prev.set(clubId, demoMessages)));
        return;
      }

      if (response.data) {
        setClubMessages(prev => new Map(prev.set(clubId, response.data)));
      }
    } catch (error) {
      console.error("Failed to load club messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load direct messages with another user
  const loadDirectMessages = async (otherUserId: string) => {
    try {
      setLoading(true);
      const response = await apiService.getDirectMessages(otherUserId);

      if (response.error === "BACKEND_UNAVAILABLE") {
        // Demo direct messages
        const demoMessages = [
          {
            id: "dm1",
            sender_id: user?.id || "demo-user",
            receiver_id: otherUserId,
            message: "Hey! Are you joining the ride tomorrow?",
            created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            sender: { id: user?.id || "demo-user", full_name: "You" }
          }
        ];
        setDirectMessages(prev => new Map(prev.set(otherUserId, demoMessages)));
        return;
      }

      if (response.data) {
        setDirectMessages(prev => new Map(prev.set(otherUserId, response.data)));
      }
    } catch (error) {
      console.error("Failed to load direct messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Send a club message
  const sendClubMessageAPI = async (clubId: string, message: string) => {
    try {
      // Send via API first
      const response = await apiService.sendClubMessage(clubId, message);

      if (response.error === "BACKEND_UNAVAILABLE") {
        // Add to local state as demo
        const demoMessage = {
          id: `msg-${Date.now()}`,
          user_id: user?.id || "demo-user",
          club_id: clubId,
          message,
          created_at: new Date().toISOString(),
          profiles: { id: user?.id || "demo-user", full_name: user?.user_metadata?.full_name || "You" }
        };
        setClubMessages(prev => {
          const newMap = new Map(prev);
          const existing = newMap.get(clubId) || [];
          newMap.set(clubId, [...existing, demoMessage]);
          return newMap;
        });
        return;
      }

      // Send via Socket.IO for real-time delivery
      if (socket.connected) {
        socket.sendClubMessage(clubId, message);
      }
    } catch (error) {
      console.error("Failed to send club message:", error);
      throw error;
    }
  };

  // Send a direct message
  const sendDirectMessageAPI = async (receiverId: string, message: string) => {
    try {
      // Send via API first
      const response = await apiService.sendDirectMessage(receiverId, message);

      if (response.error === "BACKEND_UNAVAILABLE") {
        // Add to local state as demo
        const demoMessage = {
          id: `dm-${Date.now()}`,
          sender_id: user?.id || "demo-user",
          receiver_id: receiverId,
          message,
          created_at: new Date().toISOString(),
          sender: { id: user?.id || "demo-user", full_name: user?.user_metadata?.full_name || "You" }
        };
        setDirectMessages(prev => {
          const newMap = new Map(prev);
          const existing = newMap.get(receiverId) || [];
          newMap.set(receiverId, [...existing, demoMessage]);
          return newMap;
        });
        return;
      }

      // Send via Socket.IO for real-time delivery
      if (socket.connected) {
        socket.sendDirectMessage(receiverId, message);
      }
    } catch (error) {
      console.error("Failed to send direct message:", error);
      throw error;
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (senderId: string) => {
    try {
      const response = await apiService.markMessagesAsRead(senderId);
      if (response.error && response.error !== "BACKEND_UNAVAILABLE") {
        console.error("Failed to mark messages as read:", response.error);
      }
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };
  const [requestedActivities, setRequestedActivities] = useState<Set<string>>(
    new Set(),
  );
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

  // Listen for profile updates and sync chat messages
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      const { userId, profile } = event.detail;

      // Update chat messages from this user
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.sender === userId ||
          (msg.sender !== "You" && msg.sender === profile.full_name)
            ? { ...msg, sender: profile.full_name }
            : msg,
        ),
      );
    };

    const handleCreateActivityChat = (event: CustomEvent) => {
      const {
        activityId,
        activityTitle,
        organizerId,
        participantName,
        message,
      } = event.detail;

      // Create automatic chat message when someone joins an activity
      const chatMessage: ChatMessage = {
        id: `chat_${Date.now()}`,
        type: "general",
        sender: participantName,
        content: message,
        timestamp: new Date(),
        activityTitle,
        activityOrganizer: organizerId,
      };

      setChatMessages((prev) => [chatMessage, ...prev]);

      // Show notification
      const notificationEvent = new CustomEvent("showNotification", {
        detail: {
          message: `${participantName} joined ${activityTitle}`,
          type: "info",
        },
      });
      window.dispatchEvent(notificationEvent);
    };

    const handleUpdateActivityChat = (event: CustomEvent) => {
      const { activityId, activityTitle, participantName, message, action } =
        event.detail;

      // Create chat message for activity updates (like leaving)
      const chatMessage: ChatMessage = {
        id: `chat_${Date.now()}`,
        type: "general",
        sender: participantName,
        content: message,
        timestamp: new Date(),
        activityTitle,
      };

      setChatMessages((prev) => [chatMessage, ...prev]);
    };

    window.addEventListener(
      "profileUpdated",
      handleProfileUpdate as EventListener,
    );
    window.addEventListener(
      "createActivityChat",
      handleCreateActivityChat as EventListener,
    );
    window.addEventListener(
      "updateActivityChat",
      handleUpdateActivityChat as EventListener,
    );

    return () => {
      window.removeEventListener(
        "profileUpdated",
        handleProfileUpdate as EventListener,
      );
      window.removeEventListener(
        "createActivityChat",
        handleCreateActivityChat as EventListener,
      );
      window.removeEventListener(
        "updateActivityChat",
        handleUpdateActivityChat as EventListener,
      );
    };
  }, []);

  const addJoinRequest = (
    requestData: Omit<JoinRequest, "id" | "timestamp" | "status"> & {
      activityId: string;
    },
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
    setRequestedActivities(
      (prev) => new Set([...prev, requestData.activityId]),
    );

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
    showChatNotification(
      `Your request has been sent to ${requestData.activityOrganizer} in your direct messages.`,
    );
  };

  const hasRequestedActivity = (activityId: string) => {
    return requestedActivities.has(activityId);
  };

  const respondToRequest = (
    requestId: string,
    response: "accepted" | "declined",
    message?: string,
  ) => {
    // Update the request status
    setJoinRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: response } : req,
      ),
    );

    // Find the request to get details
    const request = joinRequests.find((req) => req.id === requestId);
    if (!request) return;

    // Add organizer's response to chat
    const responseMessage: ChatMessage = {
      id: Date.now().toString() + "_response",
      type: "general",
      sender: request.activityOrganizer,
      content:
        response === "accepted"
          ? `Great news! Your request to join "${request.activityTitle}" has been accepted! 🎉 ${message || "See you there!"}`
          : `Sorry, your request to join "${request.activityTitle}" has been declined. ${message || "Better luck next time!"}`,
      timestamp: new Date(),
      activityTitle: request.activityTitle,
      activityOrganizer: request.activityOrganizer,
    };

    setChatMessages((prev) => [responseMessage, ...prev]);

    // If accepted, trigger actual activity participation
    if (response === "accepted") {
      const participationEvent = new CustomEvent("chatRequestAccepted", {
        detail: {
          activityTitle: request.activityTitle,
          requesterId: request.requesterName, // This would be the user ID in a real system
          organizerId: request.activityOrganizer,
        },
      });
      window.dispatchEvent(participationEvent);
    }

    // Show notification
    showChatNotification(
      response === "accepted"
        ? `Your request to join "${request.activityTitle}" was accepted!`
        : `Your request to join "${request.activityTitle}" was declined.`,
    );
  };

  const getConversationWith = (organizerName: string): ChatMessage[] => {
    return chatMessages
      .filter(
        (msg) =>
          msg.sender === organizerName ||
          (msg.sender === "You" && msg.activityOrganizer === organizerName),
      )
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
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
        getConversationWith,
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

// Helper function for chat notifications
function showChatNotification(message: string) {
  const toast = document.createElement("div");
  toast.className =
    "fixed top-16 left-1/2 transform -translate-x-1/2 z-[1001] bg-blue-600 text-white px-4 py-2 rounded-lg font-medium max-w-sm mx-4 text-center";
  toast.textContent = message;

  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.style.opacity = "0.9";
  }, 100);

  // Remove after 4 seconds
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 4000);
}
