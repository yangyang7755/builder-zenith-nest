import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Settings,
  Edit,
  Check,
  X,
  Upload,
  Plus,
  UserPlus,
  UserMinus,
  Clock,
  Mail,
} from "lucide-react";
import { useClub } from "../contexts/ClubContext";
import { useToast } from "../contexts/ToastContext";
import {
  getActualMemberCount,
  getPendingRequestsCount,
  formatMemberCount,
} from "../utils/clubUtils";

export default function ClubManagement() {
  const navigate = useNavigate();
  const { clubId } = useParams<{ clubId: string }>();

  // Check if this is accessed via the settings route
  const isSettingsRoute = window.location.pathname.includes('/settings');
  const {
    getClubById,
    isClubManager,
    updateClub,
    approveClubRequest,
    denyClubRequest,
    removeMember,
  } = useClub();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    "overview" | "members" | "requests" | "settings"
  >(isSettingsRoute ? "settings" : "overview");
  const [isEditing, setIsEditing] = useState(false);

  const club = clubId ? getClubById(clubId) : null;
  const canManage = clubId ? isClubManager(clubId) : false;

  const [editForm, setEditForm] = useState({
    name: club?.name || "",
    description: club?.description || "",
    website: club?.website || "",
    contactEmail: club?.contactEmail || "",
  });

  if (!club) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-black mb-2">Club not found</h2>
          <button
            onClick={() => navigate("/explore")}
            className="text-explore-green underline"
          >
            Return to explore
          </button>
        </div>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-black mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to manage this club.
          </p>
          <button
            onClick={() => navigate(`/club/${clubId}`)}
            className="text-explore-green underline"
          >
            View club page
          </button>
        </div>
      </div>
    );
  }

  const handleSaveEdit = () => {
    updateClub(club.id, editForm);
    setIsEditing(false);
    showToast("Club information updated successfully!", "success");
  };

  const handleApproveRequest = (requestId: string) => {
    approveClubRequest(club.id, requestId);
    showToast("Membership request approved!", "success");
  };

  const handleDenyRequest = (requestId: string) => {
    denyClubRequest(club.id, requestId);
    showToast("Membership request denied.", "info");
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      removeMember(club.id, memberId);
      showToast("Member removed from club.", "info");
    }
  };

  return (
    <div className="min-h-screen bg-white font-cabin max-w-md mx-auto">
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
            <rect
              x="1"
              y="3"
              width="22"
              height="10"
              rx="2"
              stroke="black"
              strokeWidth="1"
              fill="none"
            />
            <rect x="23" y="6" width="2" height="4" rx="1" fill="black" />
          </svg>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-200">
        <button
          onClick={() => navigate(`/club/${clubId}`)}
          className="text-black"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-black">Manage Club</h1>
          <p className="text-sm text-gray-600">{club.name}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: "overview", label: "Overview", icon: Settings },
          { id: "members", label: "Members", icon: Users },
          { id: "requests", label: "Requests", icon: UserPlus },
          { id: "settings", label: "Settings", icon: Edit },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium ${
                activeTab === tab.id
                  ? "text-explore-green border-b-2 border-explore-green"
                  : "text-gray-500"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.id === "requests" && club.pendingRequests.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {club.pendingRequests.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-black mb-4">
                Club Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-explore-green">
                    {getActualMemberCount(club)}
                  </div>
                  <div className="text-sm text-gray-600">Total Members</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-explore-green">
                    {getPendingRequestsCount(club)}
                  </div>
                  <div className="text-sm text-gray-600">Pending Requests</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-black mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {club.pendingRequests.slice(0, 3).map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-explore-green rounded-full flex items-center justify-center">
                      <UserPlus className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {request.userName} requested to join
                      </p>
                      <p className="text-xs text-gray-500">
                        {request.requestedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {club.pendingRequests.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No recent activity
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-black">
                Club Members ({club.memberCount})
              </h3>
            </div>
            <div className="space-y-3">
              {club.members.map((memberId) => (
                <div
                  key={memberId}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <div>
                      <p className="font-medium">
                        {memberId === club.managerId
                          ? "You (Manager)"
                          : `Member ${memberId}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {club.managers.includes(memberId)
                          ? "Manager"
                          : "Member"}
                      </p>
                    </div>
                  </div>
                  {memberId !== club.managerId && (
                    <button
                      onClick={() => handleRemoveMember(memberId)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "requests" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-black">
                Membership Requests ({club.pendingRequests.length})
              </h3>
            </div>
            <div className="space-y-4">
              {club.pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-black">
                        {request.userName}
                      </h4>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {request.userEmail}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {request.requestedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {request.message && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded italic">
                        "{request.message}"
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveRequest(request.id)}
                      className="flex-1 bg-explore-green text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleDenyRequest(request.id)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Deny
                    </button>
                  </div>
                </div>
              ))}
              {club.pendingRequests.length === 0 && (
                <div className="text-center py-8">
                  <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    No pending membership requests
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-black">
                  Club Information
                </h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-explore-green hover:text-green-600 flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="text-explore-green hover:text-green-600"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({
                          name: club.name,
                          description: club.description,
                          website: club.website || "",
                          contactEmail: club.contactEmail || "",
                        });
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Club Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <p className="p-2 bg-gray-50 rounded-lg">{club.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg h-24 resize-none"
                    />
                  ) : (
                    <p className="p-2 bg-gray-50 rounded-lg">
                      {club.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={editForm.website}
                      onChange={(e) =>
                        setEditForm({ ...editForm, website: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="https://..."
                    />
                  ) : (
                    <p className="p-2 bg-gray-50 rounded-lg">
                      {club.website || "Not provided"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.contactEmail}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          contactEmail: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <p className="p-2 bg-gray-50 rounded-lg">
                      {club.contactEmail || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-black mb-4">Club Images</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Image
                  </label>
                  <div className="flex items-center gap-4">
                    <img
                      src={club.profileImage}
                      alt={club.name}
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                    />
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Upload className="w-4 h-4" />
                      Change Image
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
