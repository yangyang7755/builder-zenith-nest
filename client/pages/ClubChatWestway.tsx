import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Camera, DollarSign, MapPin, Calendar } from "lucide-react";

export default function ClubChatWestway() {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: "Arthur",
      message: "New routes set this week! The blue V4 on the overhang is incredible 🧗‍♀️",
      time: "3 hours ago",
      type: "text",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    {
      id: 2,
      user: "Maggie",
      message: "Just tried it! My arms are burning but so worth it 💪",
      time: "2 hours ago",
      type: "text",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=40&h=40&fit=crop&crop=face",
    },
    {
      id: 3,
      user: "Ben",
      message: "Last night's bouldering comp was epic! Check out these action shots 📸",
      time: "1 hour ago",
      type: "text",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    },
    {
      id: 4,
      user: "Ben",
      message: "",
      time: "1 hour ago",
      type: "image",
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    },
    {
      id: 5,
      user: "Sarah",
      message: "Amazing photos! I can't believe I missed it 😭",
      time: "45 minutes ago",
      type: "text",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=40&h=40&fit=crop&crop=face",
    },
    {
      id: 6,
      user: "Dan",
      message: "💰 Gear sharing cost: Rope rental for weekend outdoor trip - £45 split 3 ways = £15 each",
      time: "30 minutes ago",
      type: "bill",
      billAmount: "£15",
      billDescription: "Rope rental for outdoor trip",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    {
      id: 7,
      user: "Mike",
      message: "Don't worry Sarah! Next comp is in 2 weeks. Friday Women's+ night tomorrow if you're free!",
      time: "20 minutes ago",
      type: "text",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    },
    {
      id: 8,
      user: "You",
      message: "Count me in for the rope rental! And definitely joining Friday night 🧗‍♀️",
      time: "Just now",
      type: "text",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        user: "You",
        message: newMessage,
        time: "Just now",
        type: "text" as const,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const renderMessage = (message: any) => {
    const isOwnMessage = message.user === "You";

    return (
      <div key={message.id} className={`flex gap-3 mb-4 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
        {!isOwnMessage && (
          <img
            src={message.avatar}
            alt={message.user}
            className="w-8 h-8 rounded-full border border-gray-300 object-cover flex-shrink-0"
          />
        )}
        
        <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'items-end' : ''}`}>
          {!isOwnMessage && (
            <div className="text-xs text-gray-500 font-cabin mb-1">{message.user}</div>
          )}
          
          {message.type === "text" && (
            <div className={`rounded-lg p-3 ${
              isOwnMessage 
                ? 'bg-explore-green text-white' 
                : 'bg-gray-100 text-black'
            }`}>
              <p className="text-sm font-cabin">{message.message}</p>
            </div>
          )}
          
          {message.type === "image" && (
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <img
                src={message.imageUrl}
                alt="Shared photo"
                className="w-full h-auto max-w-xs"
              />
            </div>
          )}
          
          {message.type === "bill" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800 font-cabin">Bill Split</span>
              </div>
              <p className="text-sm text-black font-cabin mb-1">{message.billDescription}</p>
              <p className="text-lg font-bold text-yellow-800 font-cabin">{message.billAmount} per person</p>
            </div>
          )}
          
          <div className="text-xs text-gray-400 font-cabin mt-1">{message.time}</div>
        </div>
        
        {isOwnMessage && (
          <img
            src={message.avatar}
            alt={message.user}
            className="w-8 h-8 rounded-full border border-gray-300 object-cover flex-shrink-0"
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white font-cabin max-w-md mx-auto relative flex flex-col">
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
            <rect x="1" y="3" width="22" height="10" rx="2" stroke="black" strokeWidth="1" fill="none" />
            <rect x="23" y="6" width="2" height="4" rx="1" fill="black" />
          </svg>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <button onClick={() => navigate("/chat")} className="mr-4">
            <ArrowLeft className="w-6 h-6 text-black" />
          </button>
          <div className="flex items-center gap-3">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F1e4beaadbd444b8497b8d2ef2ac43e70?format=webp&width=800"
              alt="Westway Climbing Centre"
              className="w-10 h-10 rounded-full border border-black object-cover"
            />
            <div>
              <h1 className="text-lg font-bold text-black font-cabin">Westway Climbing Centre</h1>
              <p className="text-sm text-gray-500 font-cabin">156 members</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate("/club/westway")}
          className="text-sm text-explore-green font-cabin hover:underline"
        >
          Club Info
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <Camera className="w-5 h-5" />
          </button>
          
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-full py-2 px-4 font-cabin text-sm focus:outline-none focus:border-explore-green"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
            />
            <button
              onClick={handleSendMessage}
              className="bg-explore-green text-white p-2 rounded-full hover:bg-explore-green-dark transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
