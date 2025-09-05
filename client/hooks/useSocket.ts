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

export const useSocket = (): any => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) {
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const testApiConnectivity = async () => {
      try {
        const response = await fetch('/api/health', {
          method: 'GET',
          signal: AbortSignal.timeout(8000)
        });
        return response.ok;
      } catch {
        return false;
      }
    };

    let retryTimer: number | null = null;

    const initiateSocketConnection = async () => {
      const apiReachable = await testApiConnectivity();
      if (!apiReachable) {
        retryTimer = window.setTimeout(initiateSocketConnection, 10000);
        return;
      }

      if (globalSocket) {
        socketRef.current = globalSocket;
        return;
      }

      const isHostedEnv = window.location.hostname.includes('.fly.dev') ||
                         window.location.hostname.includes('.vercel.app') ||
                         window.location.hostname.includes('.netlify.app') ||
                         window.location.hostname.includes('.herokuapp.com');

      const socketUrl = `${window.location.protocol}//${window.location.host}`;

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

      globalSocket.on('connect', () => {
        setIsConnected(true);
        if (user?.id) {
          globalSocket?.emit('join-user-room', user.id);
        }
      });

      globalSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      globalSocket.on('connect_error', () => {
        setIsConnected(false);
        if (!globalSocket?.connected && retryTimer == null) {
          retryTimer = window.setTimeout(initiateSocketConnection, 10000);
        }
      });

      socketRef.current = globalSocket;
    };

    initiateSocketConnection();

    return () => {
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
    };
  }, [user]);

  const joinUserRoom = (userId: string) => socketRef.current?.emit('join-user-room', userId);
  const leaveUserRoom = (userId: string) => socketRef.current?.emit('leave-user-room', userId);

  // Club helpers expected by consumers
  const joinClub = (clubId: string) => socketRef.current?.emit('join_club', clubId);
  const leaveClub = (clubId: string) => socketRef.current?.emit('leave_club', clubId);
  const sendClubMessage = (clubId: string, message: string) => socketRef.current?.emit('club_message', { clubId, userId: user?.id, message });
  const onClubMessage = (cb: (msg: any) => void) => socketRef.current?.on('new_club_message', cb);

  // Direct message helpers
  const sendDirectMessage = (receiverId: string, message: string) => socketRef.current?.emit('direct_message', { senderId: user?.id, receiverId, message });
  const onDirectMessage = (cb: (msg: any) => void) => socketRef.current?.on('new_direct_message', cb);

  return {
    socket: socketRef.current,
    connected: isConnected,
    isConnected,
    joinUserRoom,
    leaveUserRoom,
    joinClub,
    leaveClub,
    sendClubMessage,
    onClubMessage,
    sendDirectMessage,
    onDirectMessage,
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
