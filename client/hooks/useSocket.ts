import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinUserRoom: (userId: string) => void;
  leaveUserRoom: (userId: string) => void;
}

let globalSocket: Socket | null = null;

export const useSocket = (): SocketContextType => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) {
      // Disconnect when user logs out
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection if it doesn't exist
    if (!globalSocket) {
      // Always use the current origin for Socket.IO in this environment
      // The Vite proxy will handle routing to the correct backend port
      const socketUrl = window.location.origin;

      console.log(`🔌 Attempting to connect to Socket.IO server at: ${socketUrl}`);

      globalSocket = io(socketUrl, {
        path: '/socket.io/', // Explicit path for proxy
        transports: ['polling', 'websocket'], // Try polling first for stability
        reconnection: true,
        reconnectionAttempts: 10, // More attempts
        reconnectionDelay: 2000, // Longer delay between attempts
        reconnectionDelayMax: 10000,
        maxReconnectionAttempts: 10,
        timeout: 20000, // Longer timeout
        autoConnect: true,
        forceNew: false,
        upgrade: true,
        rememberUpgrade: false, // Don't remember transport upgrades
      });

      // Connection event handlers
      globalSocket.on('connect', () => {
        console.log('✅ Socket connected:', globalSocket?.id);
        setIsConnected(true);
        
        // Join user-specific room for notifications
        if (user?.id) {
          globalSocket?.emit('join-user-room', user.id);
        }
      });

      globalSocket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        setIsConnected(false);
      });

      globalSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        console.error('Error details:', {
          message: error.message,
          description: error.description,
          type: error.type,
          data: error.data
        });
        setIsConnected(false);
      });

      globalSocket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
        setIsConnected(true);

        // Rejoin user room after reconnection
        if (user?.id) {
          globalSocket?.emit('join-user-room', user.id);
        }
      });

      globalSocket.on('reconnect_error', (error) => {
        console.error('❌ Socket reconnection error:', error);
      });

      globalSocket.on('reconnect_failed', () => {
        console.error('❌ Socket failed to reconnect after all attempts');
        setIsConnected(false);
      });
    }

    socketRef.current = globalSocket;

    // Cleanup function
    return () => {
      // Don't disconnect here - keep connection alive for other components
    };
  }, [user]);

  const joinUserRoom = (userId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join-user-room', userId);
    }
  };

  const leaveUserRoom = (userId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave-user-room', userId);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    joinUserRoom,
    leaveUserRoom,
  };
};

// Hook for following-specific events
export const useFollowSocket = () => {
  const { socket } = useSocket();
  const { user } = useAuth();

  const emitFollowUser = (followedUserId: string, followerData: any) => {
    if (socket && user) {
      socket.emit('user-followed', {
        followedUserId,
        followerId: user.id,
        followerData,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const emitUnfollowUser = (unfollowedUserId: string) => {
    if (socket && user) {
      socket.emit('user-unfollowed', {
        unfollowedUserId,
        unfollowerId: user.id,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const subscribeToFollowEvents = (callbacks: {
    onNewFollower?: (data: any) => void;
    onFollowerRemoved?: (data: any) => void;
    onFollowingUpdate?: (data: any) => void;
  }) => {
    if (!socket) return () => {};

    const handleNewFollower = (data: any) => {
      console.log('📝 New follower received:', data);
      callbacks.onNewFollower?.(data);
    };

    const handleFollowerRemoved = (data: any) => {
      console.log('📝 Follower removed:', data);
      callbacks.onFollowerRemoved?.(data);
    };

    const handleFollowingUpdate = (data: any) => {
      console.log('📝 Following update:', data);
      callbacks.onFollowingUpdate?.(data);
    };

    // Subscribe to events
    socket.on('new-follower', handleNewFollower);
    socket.on('follower-removed', handleFollowerRemoved);
    socket.on('following-updated', handleFollowingUpdate);

    // Return cleanup function
    return () => {
      socket.off('new-follower', handleNewFollower);
      socket.off('follower-removed', handleFollowerRemoved);
      socket.off('following-updated', handleFollowingUpdate);
    };
  };

  return {
    socket,
    emitFollowUser,
    emitUnfollowUser,
    subscribeToFollowEvents,
  };
};

export default useSocket;
