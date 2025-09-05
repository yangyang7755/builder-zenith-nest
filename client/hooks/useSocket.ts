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

    // Test API connectivity before establishing Socket.IO connection
    const testApiConnectivity = async () => {
      try {
        const response = await fetch('/api/health', {
          method: 'GET',
          signal: AbortSignal.timeout(8000)
        });
        console.log('✅ API health check successful:', response.status);
        return response.ok;
      } catch (error: any) {
        console.warn('⚠️ API health check failed:', error?.message || error);
        return false;
      }
    };

    let retryTimer: number | null = null;

    const initiateSocketConnection = async () => {
      // Only create socket when API is reachable
      const apiReachable = await testApiConnectivity();
      if (!apiReachable) {
        console.warn('⚠️ API not reachable, delaying Socket.IO connection');
        retryTimer = window.setTimeout(initiateSocketConnection, 10000);
        return;
      }

      if (globalSocket) {
        socketRef.current = globalSocket;
        return;
      }

      // Detect if we're in a hosted environment
      const isHostedEnv = window.location.hostname.includes('.fly.dev') ||
                         window.location.hostname.includes('.vercel.app') ||
                         window.location.hostname.includes('.netlify.app') ||
                         window.location.hostname.includes('.herokuapp.com');

      // Use appropriate URL based on environment
      const socketUrl = `${window.location.protocol}//${window.location.host}`;

      console.log(`🔌 Attempting to connect to Socket.IO server at: ${socketUrl} (hosted: ${isHostedEnv})`);

      globalSocket = io(socketUrl, {
        path: '/socket.io/',
        transports: isHostedEnv ? ['polling'] : ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        timeout: 30000,
        autoConnect: true,
        forceNew: false,
        upgrade: !isHostedEnv,
        rememberUpgrade: false,
      });

      // Connection event handlers
      globalSocket.on('connect', () => {
        console.log('✅ Socket connected:', globalSocket?.id);
        console.log('🔗 Using transport:', globalSocket?.io?.engine?.transport?.name);
        setIsConnected(true);

        // Join user-specific room for notifications
        if (user?.id) {
          globalSocket?.emit('join-user-room', user.id);
        }
      });

      globalSocket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        setIsConnected(false);
      });

      globalSocket.on('connect_error', (error: any) => {
        console.error('❌ Socket connection error:', error);
        console.error('Error details:', {
          message: error.message,
          description: error.description,
          type: error.type,
          data: error.data,
          url: socketUrl,
          transport: globalSocket?.io?.engine?.transport?.name,
          readyState: globalSocket?.io?.engine?.readyState,
        });
        setIsConnected(false);

        // In hosted environments, retry later instead of spamming errors
        if (!globalSocket?.connected && retryTimer == null) {
          retryTimer = window.setTimeout(initiateSocketConnection, 10000);
        }
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

      socketRef.current = globalSocket;
    };

    initiateSocketConnection();

    // Cleanup function
    return () => {
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
      // Keep socket alive for other components
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
