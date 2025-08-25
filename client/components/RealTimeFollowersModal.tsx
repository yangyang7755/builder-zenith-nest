import React, { useState, useEffect } from "react";
import { ArrowLeft, UserPlus, Users, MessageCircle } from "lucide-react";
import { useFollow } from "@/contexts/FollowContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface Follower {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower: {
    id: string;
    full_name: string;
    profile_image?: string;
    university?: string;
  };
}

interface RealTimeFollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RealTimeFollowersModal: React.FC<RealTimeFollowersModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { followers, followUser, isFollowing, isLoading, followStats } = useFollow();
  const [localFollowers, setLocalFollowers] = useState<Follower[]>([]);

  // Update local followers list when context changes
  useEffect(() => {
    setLocalFollowers(followers);
  }, [followers]);

  const handleFollowBack = async (userId: string, userName: string) => {
    if (!user || isFollowing(userId)) return;

    try {
      await followUser(userId);
      // Success feedback is handled by the context
    } catch (error) {
      console.error("Failed to follow user:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <span className="text-gray-900 font-semibold text-lg">Followers</span>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Stats Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
          <div className="flex items-center justify-center gap-2">
            <Users className="w-5 h-5" />
            <span className="font-semibold text-lg">
              {followStats.followers} Followers
            </span>
          </div>
          <p className="text-center text-blue-100 text-sm mt-1">
            Live updates • Real-time notifications
          </p>
        </div>

        {/* Followers List */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading followers...</span>
            </div>
          ) : localFollowers.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No followers yet
              </h3>
              <p className="text-gray-500 mb-6">
                Share your profile to get followers
              </p>
              <Button 
                onClick={onClose}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Build Your Profile
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {localFollowers.map((followerItem) => (
                <div
                  key={followerItem.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Profile Image */}
                    <div className="relative">
                      {followerItem.follower.profile_image ? (
                        <img
                          src={followerItem.follower.profile_image}
                          alt={followerItem.follower.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-lg">
                          {followerItem.follower.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {/* New follower indicator (for recent followers) */}
                      {(() => {
                        const followerDate = new Date(followerItem.created_at);
                        const now = new Date();
                        const diffHours = Math.abs(now.getTime() - followerDate.getTime()) / (1000 * 60 * 60);
                        return diffHours < 24 ? (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                        ) : null;
                      })()}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {followerItem.follower.full_name}
                      </h4>
                      {followerItem.follower.university && (
                        <p className="text-sm text-gray-600">
                          {followerItem.follower.university}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Followed you {formatDate(followerItem.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {!isFollowing(followerItem.follower_id) ? (
                      <Button
                        onClick={() => handleFollowBack(
                          followerItem.follower_id,
                          followerItem.follower.full_name
                        )}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        Follow Back
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-700"
                        disabled
                      >
                        Following
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real-time indicator */}
        {localFollowers.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live Updates Active</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeFollowersModal;
