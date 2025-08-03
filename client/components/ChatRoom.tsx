import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/hooks/useSocket";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";
import { Send, Users, Clock, MessageCircle, Wifi, WifiOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  message: string;
  created_at: string;
  is_system?: boolean;
}

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  is_online: boolean;
  last_seen?: string;
}

interface ChatRoomProps {
  clubId: string;
  clubName: string;
}

export default function ChatRoom({ clubId, clubName }: ChatRoomProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const socket = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load initial messages from API
  const loadInitialMessages = async () => {
    try {
      setLoading(true);
      const response = await apiService.getClubMessages(clubId);
      
      if (response.error) {
        console.error("Failed to load messages:", response.error);
        toast({
          title: "Error",
          description: "Failed to load chat messages",
          variant: "destructive",
        });
        return;
      }

      if (response.data && response.data.data) {
        setMessages(response.data.data);
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load online users
  const loadOnlineUsers = async () => {
    try {
      const response = await apiService.getClubOnlineUsers(clubId);
      
      if (response.data && response.data.data) {
        setOnlineUsers(response.data.data);
      }
    } catch (error) {
      console.error("Error loading online users:", error);
    }
  };

  // Initialize chat
  useEffect(() => {
    loadInitialMessages();
    loadOnlineUsers();

    // Join club room for real-time messages
    if (socket.connected) {
      socket.joinClub(clubId);
    }

    return () => {
      if (socket.connected) {
        socket.leaveClub(clubId);
      }
    };
  }, [clubId, socket.connected]);

  // Listen for real-time messages
  useEffect(() => {
    socket.onClubMessage((newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
      scrollToBottom();
    });

    // Cleanup listeners when component unmounts
    return () => {
      if (socket.socket) {
        socket.socket.off('new_club_message');
      }
    };
  }, [socket]);

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
        socket.sendClubMessage(clubId, newMessage.trim());
      } else {
        // Fallback to HTTP API if Socket.IO not connected
        const response = await apiService.sendClubMessage(clubId, newMessage.trim());
        
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

  const isOwnMessage = (message: ChatMessage) => {
    return user?.id === message.user_id;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-explore-green" />
            <div>
              <CardTitle className="text-lg">{clubName} Chat</CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {socket.connected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <span>Disconnected</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <Badge variant="secondary">{onlineUsers.length} online</Badge>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 flex flex-col min-h-0 p-0">
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Loading messages...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <MessageCircle className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400">Be the first to start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((message, index) => {
                const isOwn = isOwnMessage(message);
                const showAvatar = index === 0 || messages[index - 1].user_id !== message.user_id;
                const showTimestamp = index === messages.length - 1 || 
                  messages[index + 1].user_id !== message.user_id ||
                  new Date(messages[index + 1].created_at).getTime() - new Date(message.created_at).getTime() > 300000; // 5 minutes

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`flex-shrink-0 ${showAvatar ? "" : "invisible"}`}>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.user_avatar} />
                        <AvatarFallback className="text-xs">
                          {getUserInitials(message.user_name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className={`flex-1 max-w-[70%] ${isOwn ? "text-right" : ""}`}>
                      {showAvatar && !isOwn && (
                        <div className="text-sm font-medium text-gray-700 mb-1">
                          {message.user_name}
                        </div>
                      )}
                      <div
                        className={`inline-block px-3 py-2 rounded-lg text-sm ${
                          isOwn
                            ? "bg-explore-green text-white"
                            : message.is_system
                            ? "bg-gray-100 text-gray-600 italic"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {message.message}
                      </div>
                      {showTimestamp && (
                        <div className={`text-xs text-gray-400 mt-1 ${isOwn ? "text-right" : ""}`}>
                          <Clock className="w-3 h-3 inline mr-1" />
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
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

        {/* Online Users */}
        {onlineUsers.length > 0 && (
          <div className="px-4 py-2 border-t bg-gray-50">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Users className="w-4 h-4" />
              Online ({onlineUsers.length})
            </div>
            <div className="flex gap-2 flex-wrap">
              {onlineUsers.slice(0, 8).map((user) => (
                <div key={user.id} className="flex items-center gap-1">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-xs">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600">{user.name}</span>
                  {user.is_online && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              ))}
              {onlineUsers.length > 8 && (
                <div className="text-xs text-gray-500">
                  +{onlineUsers.length - 8} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${clubName}...`}
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
      </CardContent>
    </div>
  );
}
