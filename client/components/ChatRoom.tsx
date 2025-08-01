import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Send, Users, Clock, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Simulate real-time connection (in production, this would use Supabase Realtime)
  useEffect(() => {
    // Load initial messages
    loadInitialMessages();
    
    // Simulate connection
    setConnected(true);
    
    // Add current user to online users
    if (user && profile) {
      const currentUser: ChatUser = {
        id: user.id,
        name: profile.full_name || user.email?.split('@')[0] || 'Anonymous',
        avatar: profile.profile_image,
        is_online: true,
      };
      setOnlineUsers(prev => [...prev.filter(u => u.id !== user.id), currentUser]);
    }

    // Simulate receiving messages (in production, this would be real-time subscription)
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 3 seconds
        simulateIncomingMessage();
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      setConnected(false);
    };
  }, [clubId, user, profile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadInitialMessages = () => {
    // Simulate loading messages from database
    const sampleMessages: ChatMessage[] = [
      {
        id: '1',
        user_id: 'system',
        user_name: 'System',
        message: `Welcome to ${clubName} chat! 🎉`,
        created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        is_system: true,
      },
      {
        id: '2',
        user_id: 'user-1',
        user_name: 'Alex Johnson',
        message: 'Hey everyone! Looking forward to tomorrow\'s ride 🚴‍♂️',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: '3',
        user_id: 'user-2',
        user_name: 'Sarah Chen',
        message: 'Same here! What time are we meeting?',
        created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      },
      {
        id: '4',
        user_id: 'user-1',
        user_name: 'Alex Johnson',
        message: '8 AM at the university gates. Don\'t be late! ⏰',
        created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      },
    ];
    setMessages(sampleMessages);

    // Set sample online users
    setOnlineUsers([
      { id: 'user-1', name: 'Alex Johnson', is_online: true },
      { id: 'user-2', name: 'Sarah Chen', is_online: true },
      { id: 'user-3', name: 'Mike Wilson', is_online: false, last_seen: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    ]);
  };

  const simulateIncomingMessage = () => {
    const sampleMessages = [
      'Has anyone tried the new climbing route?',
      'Great session today everyone! 💪',
      'Anyone up for a coffee after training?',
      'Don\'t forget to bring your water bottles tomorrow',
      'The weather looks perfect for outdoor activities this weekend',
    ];

    const sampleUsers = [
      { id: 'user-3', name: 'Mike Wilson' },
      { id: 'user-4', name: 'Emma Davis' },
      { id: 'user-5', name: 'Tom Brown' },
    ];

    const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
    const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      user_id: randomUser.id,
      user_name: randomUser.name,
      message: randomMessage,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMsg]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !profile) {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to send messages.",
          variant: "destructive",
        });
      }
      return;
    }

    setLoading(true);
    try {
      // In production, this would send to Supabase
      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        user_id: user.id,
        user_name: profile.full_name || user.email?.split('@')[0] || 'Anonymous',
        user_avatar: profile.profile_image,
        message: newMessage.trim(),
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');

      toast({
        title: "Message sent",
        description: "Your message has been sent to the club chat.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b p-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold">{clubName} Chat</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>{connected ? 'Connected' : 'Disconnected'}</span>
                </div>
              </div>
            </div>
            <Badge variant="secondary">
              <Users className="h-3 w-3 mr-1" />
              {onlineUsers.filter(u => u.is_online).length} online
            </Badge>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[70%] ${message.user_id === user?.id ? 'flex-row-reverse' : ''}`}>
                  {!message.is_system && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src={message.user_avatar} alt={message.user_name} />
                      <AvatarFallback className="text-xs">
                        {getInitials(message.user_name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`space-y-1 ${message.user_id === user?.id ? 'text-right' : ''}`}>
                    {!message.is_system && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {message.user_id === user?.id ? (
                          <>
                            <Clock className="h-3 w-3" />
                            <span>{formatMessageTime(message.created_at)}</span>
                            <span className="font-medium">You</span>
                          </>
                        ) : (
                          <>
                            <span className="font-medium">{message.user_name}</span>
                            <Clock className="h-3 w-3" />
                            <span>{formatMessageTime(message.created_at)}</span>
                          </>
                        )}
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-lg ${
                        message.is_system
                          ? 'bg-blue-50 text-blue-800 text-center border border-blue-200'
                          : message.user_id === user?.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.message}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t p-4 bg-white">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={user ? "Type a message..." : "Sign in to send messages"}
              disabled={loading || !user}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={loading || !newMessage.trim() || !user}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Online Users Sidebar */}
      <div className="w-64 border-l bg-gray-50">
        <div className="p-4 border-b bg-white">
          <h4 className="font-semibold text-sm">Club Members</h4>
        </div>
        <ScrollArea className="h-full p-4">
          <div className="space-y-3">
            {onlineUsers.map((chatUser) => (
              <div key={chatUser.id} className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={chatUser.avatar} alt={chatUser.name} />
                    <AvatarFallback className="text-xs">
                      {getInitials(chatUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${chatUser.is_online ? 'bg-green-500' : 'bg-gray-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{chatUser.name}</p>
                  <p className="text-xs text-gray-500">
                    {chatUser.is_online ? 'Online' : `Last seen ${chatUser.last_seen ? formatMessageTime(chatUser.last_seen) : 'unknown'}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
