import React, { useState, useEffect } from "react";
import { ArrowLeft, UserPlus, Users } from "lucide-react";
import { useFollow } from "@/contexts/FollowContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface Following {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  following: {
    id: string;
    full_name: string;
    profile_image?: string;
    university?: string;
  };
}

interface RealTimeFollowingListProps {
  isOpen: boolean;
  onClose: () => void;
}

const RealTimeFollowingList: React.FC<RealTimeFollowingListProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { following, unfollowUser, isLoading, followStats } = useFollow();
  const [localFollowing, setLocalFollowing] = useState<Following[]>([]);

  // Update local following list when context changes
  useEffect(() => {
    setLocalFollowing(following);
  }, [following]);

  const handleUnfollow = async (userId: string, userName: string) => {
    if (!user) return;

    try {
      // Optimistic update
      setLocalFollowing(prev => prev.filter(f => f.following_id !== userId));
      
      await unfollowUser(userId);
      
      // Success feedback is handled by the context
    } catch (error) {
      // Revert optimistic update
      setLocalFollowing(following);
      console.error("Failed to unfollow user:", error);
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
        <span className="text-gray-900 font-semibold text-lg">Following</span>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Stats Header */}
        <div className="bg-gradient-to-r from-explore-green to-green-600 text-white p-4">
          <div className="flex items-center justify-center gap-2">
            <Users className="w-5 h-5" />
            <span className="font-semibold text-lg">
              {followStats.following} Following
            </span>
          </div>
          <p className="text-center text-green-100 text-sm mt-1">
            Live updates • Real-time changes
          </p>
        </div>

        {/* Following List */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-explore-green"></div>
              <span className="ml-3 text-gray-600">Loading following...</span>
            </div>
          ) : localFollowing.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No one followed yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start following people to see them here
              </p>
              <Button 
                onClick={onClose}
                className="bg-explore-green hover:bg-green-600 text-white"
              >
                Discover People
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {localFollowing.map((followItem) => (
                <div
                  key={followItem.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Profile Image */}
                    <div className="relative">
                      {followItem.following.profile_image ? (
                        <img
                          src={followItem.following.profile_image}
                          alt={followItem.following.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-explore-green text-white flex items-center justify-center font-semibold text-lg">
                          {followItem.following.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {/* Online indicator (placeholder for future real-time presence) */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {followItem.following.full_name}
                      </h4>
                      {followItem.following.university && (
                        <p className="text-sm text-gray-600">
                          {followItem.following.university}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Following since {formatDate(followItem.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Unfollow Button */}
                  <Button
                    onClick={() => handleUnfollow(
                      followItem.following_id,
                      followItem.following.full_name
                    )}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-600 hover:bg-red-50"
                  >
                    Unfollow
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real-time indicator */}
        {localFollowing.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live Updates Active</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeFollowingList;
