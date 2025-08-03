import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/hooks/useSocket";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";
import { 
  ArrowLeft, 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  Wifi, 
  WifiOff,
  Clock 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_name: string;
  sender_avatar?: string;
  receiver_name: string;
  receiver_avatar?: string;
  message: string;
  created_at: string;
  read_at?: string;
  is_sent_by_me: boolean;
}

interface DirectChatProps {
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  backTo?: string;
}

export default function DirectChat({ 
  otherUserId, 
  otherUserName, 
  otherUserAvatar,
  backTo = "/chat"
}: DirectChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const socket = useSocket();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial messages
  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDirectMessages(otherUserId);
      
      if (response.error) {
        console.error("Failed to load messages:", response.error);
        toast({
          title: "Error",
          description: "Failed to load chat messages",
          variant: "destructive",
        });
        return;
      }

      if (response.data) {
        setMessages(response.data);
        scrollToBottom();
        
        // Mark messages as read
        await apiService.markMessagesAsRead(otherUserId);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [otherUserId]);

  // Listen for real-time messages
  useEffect(() => {
    socket.onDirectMessage((newMessage) => {
      // Only add messages from/to this conversation
      if (newMessage.sender_id === otherUserId || newMessage.receiver_id === otherUserId) {
        setMessages((prev) => [...prev, newMessage]);
        scrollToBottom();
        
        // Mark as read if message is from the other user
        if (newMessage.sender_id === otherUserId) {
          apiService.markMessagesAsRead(otherUserId);
        }
      }
    });

    return () => {
      if (socket.socket) {
        socket.socket.off('new_direct_message');
      }
    };
  }, [socket, otherUserId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !user) return;

    try {
      setSending(true);
      
      // Send via Socket.IO for real-time delivery
      if (socket.connected) {
        socket.sendDirectMessage(otherUserId, newMessage.trim());
      } else {
        // Fallback to HTTP API if Socket.IO not connected
        const response = await apiService.sendDirectMessage(otherUserId, newMessage.trim());
        
        if (response.error) {
          toast({
            title: "Error",
            description: "Failed to send message",
            variant: "destructive",
          });
          return;
        }

        if (response.data) {
          setMessages((prev) => [...prev, response.data]);
          scrollToBottom();
        }
      }

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(backTo)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <Avatar className="w-10 h-10">
            <AvatarImage src={otherUserAvatar} />
            <AvatarFallback>
              {getUserInitials(otherUserName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-black">{otherUserName}</h1>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {socket.connected ? (
                <>
                  <Wifi className="w-3 h-3 text-green-500" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-red-500" />
                  <span>Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 px-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Loading messages...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Avatar className="w-16 h-16 mb-3">
                <AvatarImage src={otherUserAvatar} />
                <AvatarFallback>
                  {getUserInitials(otherUserName)}
                </AvatarFallback>
              </Avatar>
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400">Send a message to start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((message, index) => {
                const isOwn = message.is_sent_by_me;
                const showTimestamp = index === messages.length - 1 || 
                  new Date(messages[index + 1].created_at).getTime() - new Date(message.created_at).getTime() > 300000; // 5 minutes

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                  >
                    <div className="flex-1 max-w-[70%]">
                      <div
                        className={`inline-block px-4 py-2 rounded-2xl text-sm ${
                          isOwn
                            ? "bg-explore-green text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {message.message}
                      </div>
                      {showTimestamp && (
                        <div className={`text-xs text-gray-400 mt-1 ${isOwn ? "text-right" : ""}`}>
                          <Clock className="w-3 h-3 inline mr-1" />
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          {isOwn && message.read_at && (
                            <span className="ml-2 text-blue-500">Read</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${otherUserName}...`}
              className="flex-1"
              disabled={sending || !socket.connected}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending || !socket.connected}
              size="sm"
              className="bg-explore-green hover:bg-green-600"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          {!socket.connected && (
            <div className="text-xs text-red-500 mt-1">
              Connection lost. Messages may not send in real-time.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
