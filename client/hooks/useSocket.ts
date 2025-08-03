import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";

interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  message: string;
  created_at: string;
  is_system?: boolean;
}

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

interface UseSocketReturn {
  socket: Socket | null;
  connected: boolean;
  joinClub: (clubId: string) => void;
  leaveClub: (clubId: string) => void;
  sendClubMessage: (clubId: string, message: string) => void;
  sendDirectMessage: (receiverId: string, message: string) => void;
  onClubMessage: (callback: (message: ChatMessage) => void) => void;
  onDirectMessage: (callback: (message: DirectMessage) => void) => void;
  onActivityUpdate: (callback: (data: any) => void) => void;
  disconnect: () => void;
}

export function useSocket(): UseSocketReturn {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    if (user && !socketRef.current) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
      
      socketRef.current = io(socketUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to Socket.IO server');
        setConnected(true);
        
        // Join user's personal room for notifications
        if (user.id) {
          socketRef.current?.emit('join_user', user.id);
        }
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
        setConnected(false);
      });

      socketRef.current.on('error', (error) => {
        console.error('Socket.IO error:', error);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
    };
  }, [user]);

  const joinClub = (clubId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_club', clubId);
    }
  };

  const leaveClub = (clubId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_club', clubId);
    }
  };

  const sendClubMessage = (clubId: string, message: string) => {
    if (socketRef.current?.connected && user) {
      socketRef.current.emit('club_message', {
        clubId,
        userId: user.id,
        message,
      });
    }
  };

  const sendDirectMessage = (receiverId: string, message: string) => {
    if (socketRef.current?.connected && user) {
      socketRef.current.emit('direct_message', {
        senderId: user.id,
        receiverId,
        message,
      });
    }
  };

  const onClubMessage = (callback: (message: ChatMessage) => void) => {
    if (socketRef.current) {
      socketRef.current.on('new_club_message', callback);
    }
  };

  const onDirectMessage = (callback: (message: DirectMessage) => void) => {
    if (socketRef.current) {
      socketRef.current.on('new_direct_message', callback);
    }
  };

  const onActivityUpdate = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('activity_updated', callback);
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  };

  return {
    socket: socketRef.current,
    connected,
    joinClub,
    leaveClub,
    sendClubMessage,
    sendDirectMessage,
    onClubMessage,
    onDirectMessage,
    onActivityUpdate,
    disconnect,
  };
}
