import React, { useEffect, useState } from "react";
import { Bell, UserPlus, X } from "lucide-react";
import { useFollowSocket } from "@/hooks/useSocket";
import { useAuth } from "@/contexts/AuthContext";

interface FollowNotification {
  id: string;
  type: 'new_follower' | 'follower_removed';
  followerName: string;
  followerImage?: string;
  timestamp: Date;
  isRead: boolean;
}

const RealTimeFollowNotification: React.FC = () => {
  const { user } = useAuth();
  const { subscribeToFollowEvents } = useFollowSocket();
  const [notifications, setNotifications] = useState<FollowNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToFollowEvents({
      onNewFollower: (data) => {
        if (data.followedUserId === user.id) {
          const notification: FollowNotification = {
            id: `notif-${Date.now()}`,
            type: 'new_follower',
            followerName: data.followerData?.full_name || 'Someone',
            followerImage: data.followerData?.profile_image,
            timestamp: new Date(data.timestamp),
            isRead: false,
          };

          setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
          
          // Auto-show notification briefly
          setShowNotifications(true);
          setTimeout(() => setShowNotifications(false), 5000);
        }
      },

      onFollowerRemoved: (data) => {
        if (data.unfollowedUserId === user.id) {
          const notification: FollowNotification = {
            id: `notif-${Date.now()}`,
            type: 'follower_removed',
            followerName: 'Someone',
            timestamp: new Date(data.timestamp),
            isRead: false,
          };

          setNotifications(prev => [notification, ...prev.slice(0, 9)]);
        }
      }
    });

    return unsubscribe;
  }, [user, subscribeToFollowEvents]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
  };

  const clearNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Follow Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>No notifications yet</p>
                <p className="text-sm mt-1">You'll see real-time follow updates here</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon/Avatar */}
                    <div className="flex-shrink-0">
                      {notification.followerImage ? (
                        <img
                          src={notification.followerImage}
                          alt={notification.followerName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <UserPlus className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {notification.type === 'new_follower' ? (
                          <>
                            <span className="font-medium">{notification.followerName}</span>
                            {' '}started following you
                          </>
                        ) : (
                          <>
                            <span className="font-medium">{notification.followerName}</span>
                            {' '}unfollowed you
                          </>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearNotification(notification.id);
                      }}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 bg-gray-50 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live notifications active
              </div>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};

export default RealTimeFollowNotification;
