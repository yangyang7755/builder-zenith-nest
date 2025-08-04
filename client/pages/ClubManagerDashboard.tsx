import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Users,
  Calendar,
  Settings,
  Send,
  UserPlus,
  Mail,
  MessageSquare,
  BarChart3,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Star,
  Plus,
  Camera
} from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinedAt: string;
  role: "member" | "manager";
  status: "active" | "pending";
  activitiesJoined: number;
}

interface JoinRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  message: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
}

interface Activity {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  maxParticipants: number;
  status: "upcoming" | "ongoing" | "completed";
}

export default function ClubManagerDashboard() {
  const navigate = useNavigate();
  const { clubId } = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [inviteEmail, setInviteEmail] = useState("");
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [profileImage, setProfileImage] = useState(clubData.profileImage);

  // Mock data - in real app this would come from API
  const clubData = {
    id: clubId || "my-club",
    name: "London Cycling Club",
    description: "A community of passionate cyclists exploring London and beyond.",
    type: "cycling",
    location: "London, UK",
    memberCount: 47,
    profileImage: "https://images.unsplash.com/photo-1558618047-3c8c76ca7f09?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1558618047-3c8c76ca7f09?w=800&h=300&fit=crop",
    isPrivate: false,
    website: "https://londoncycling.club",
    contactEmail: "info@londoncycling.club",
    createdAt: "2024-01-15",
    managerId: "current-user"
  };

  const [members] = useState<Member[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=40&h=40&fit=crop&crop=face",
      joinedAt: "2024-01-20",
      role: "member",
      status: "active",
      activitiesJoined: 12
    },
    {
      id: "2", 
      name: "Mike Chen",
      email: "mike.chen@email.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      joinedAt: "2024-02-05",
      role: "member",
      status: "active",
      activitiesJoined: 8
    },
    {
      id: "3",
      name: "Emma Wilson", 
      email: "emma.w@email.com",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      joinedAt: "2024-02-15",
      role: "member",
      status: "active",
      activitiesJoined: 15
    }
  ]);

  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([
    {
      id: "req1",
      userId: "user4",
      userName: "Alex Turner",
      userEmail: "alex.turner@email.com",
      userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      message: "Hi! I'm an experienced cyclist and would love to join your group for weekend rides. I've been cycling for 5 years and am comfortable with long distances.",
      requestedAt: "2024-03-01",
      status: "pending"
    },
    {
      id: "req2", 
      userId: "user5",
      userName: "Sophie Martinez",
      userEmail: "sophie.m@email.com",
      userAvatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=40&h=40&fit=crop&crop=face",
      message: "Looking forward to meeting fellow cyclists and exploring new routes around London!",
      requestedAt: "2024-03-02",
      status: "pending"
    }
  ]);

  const [recentActivities] = useState<Activity[]>([
    {
      id: "act1",
      title: "Weekend Richmond Park Ride",
      date: "2024-03-16",
      time: "09:00",
      location: "Richmond Park",
      participants: 12,
      maxParticipants: 15,
      status: "upcoming"
    },
    {
      id: "act2",
      title: "Evening Thames Path Cycle",
      date: "2024-03-18",
      time: "18:30", 
      location: "Thames Path",
      participants: 8,
      maxParticipants: 12,
      status: "upcoming"
    },
    {
      id: "act3",
      title: "Hampstead Heath Morning Ride",
      date: "2024-03-10",
      time: "08:00",
      location: "Hampstead Heath",
      participants: 10,
      maxParticipants: 10,
      status: "completed"
    }
  ]);

  const handleApproveRequest = (requestId: string) => {
    setJoinRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: "approved" as const }
          : req
      )
    );
    toast({
      title: "Request Approved",
      description: "Member has been added to the club and notified via email.",
    });
  };

  const handleRejectRequest = (requestId: string) => {
    setJoinRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: "rejected" as const }
          : req
      )
    );
    toast({
      title: "Request Rejected",
      description: "The user has been notified.",
    });
  };

  const handleInviteMember = () => {
    if (!inviteEmail) return;
    
    toast({
      title: "Invitation Sent",
      description: `Invitation sent to ${inviteEmail}`,
    });
    setInviteEmail("");
  };

  const copyInviteLink = () => {
    const inviteLink = `https://wildpals.app/club/${clubData.id}/join`;
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Link Copied",
      description: "Invite link copied to clipboard",
    });
  };

  const handleImageUpdate = (newImageUrl: string | null) => {
    setProfileImage(newImageUrl || "");
    toast({
      title: "Image Updated",
      description: "Club image has been updated successfully",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800"; 
      case "upcoming": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-white font-cabin max-w-md mx-auto relative">
      {/* Header */}
      <div className="h-11 bg-white flex items-center justify-between px-6 text-black font-medium">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-1 h-3 bg-black rounded-sm" />
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-6 pb-4">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
        <h1 className="text-xl font-bold text-black font-cabin">Club Manager</h1>
        <button onClick={() => navigate(`/club/${clubData.id}/settings`)}>
          <Settings className="w-6 h-6 text-black" />
        </button>
      </div>

      {/* Club Header */}
      <div className="px-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profileImage} alt={clubData.name} />
              <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {clubData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => setIsEditingImage(!isEditingImage)}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-explore-green text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors"
            >
              <Camera className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-black font-cabin">{clubData.name}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600 font-cabin">
              <Users className="w-4 h-4" />
              <span>{clubData.memberCount} members</span>
              <MapPin className="w-4 h-4 ml-2" />
              <span>{clubData.location}</span>
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        {isEditingImage && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="mb-3">
              <h4 className="font-medium font-cabin text-sm mb-2">Update Club Image</h4>
              <ImageUpload
                currentImageUrl={profileImage}
                onImageChange={handleImageUpdate}
                uploadType="club"
                entityId={clubData.id}
                showPreview={true}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setIsEditingImage(false)}
                className="bg-explore-green text-white font-cabin hover:bg-green-600"
              >
                Done
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setProfileImage(clubData.profileImage);
                  setIsEditingImage(false);
                }}
                className="font-cabin"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-explore-green font-cabin">{members.length}</div>
              <div className="text-xs text-gray-600 font-cabin">Active Members</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-blue-600 font-cabin">{joinRequests.filter(r => r.status === 'pending').length}</div>
              <div className="text-xs text-gray-600 font-cabin">Pending Requests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-purple-600 font-cabin">{recentActivities.filter(a => a.status === 'upcoming').length}</div>
              <div className="text-xs text-gray-600 font-cabin">Upcoming Events</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="members" className="text-xs">Members</TabsTrigger>
            <TabsTrigger value="requests" className="text-xs">
              Requests
              {joinRequests.filter(r => r.status === 'pending').length > 0 && (
                <Badge className="ml-1 bg-red-500 text-white text-xs">
                  {joinRequests.filter(r => r.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="activities" className="text-xs">Activities</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-cabin flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Invite Members
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 font-cabin"
                  />
                  <Button onClick={handleInviteMember} size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={copyInviteLink} className="flex-1 font-cabin">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Invite Link
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-cabin">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivities.slice(0, 3).map(activity => (
                  <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <div className="font-medium font-cabin text-sm">{activity.title}</div>
                      <div className="text-xs text-gray-600 font-cabin">
                        {new Date(activity.date).toLocaleDateString()} at {activity.time}
                      </div>
                    </div>
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium font-cabin">Club Members ({members.length})</h3>
              <Button size="sm" onClick={() => setActiveTab("overview")}>
                <UserPlus className="w-4 h-4 mr-1" />
                Invite
              </Button>
            </div>

            {members.map(member => (
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium font-cabin">{member.name}</span>
                        {member.role === "manager" && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">Manager</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 font-cabin">{member.email}</div>
                      <div className="text-xs text-gray-500 font-cabin">
                        {member.activitiesJoined} activities joined • Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <h3 className="text-lg font-medium font-cabin">
              Join Requests ({joinRequests.filter(r => r.status === 'pending').length} pending)
            </h3>

            {joinRequests.filter(r => r.status === 'pending').map(request => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={request.userAvatar} alt={request.userName} />
                      <AvatarFallback>
                        {request.userName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium font-cabin">{request.userName}</div>
                      <div className="text-sm text-gray-600 font-cabin mb-2">{request.userEmail}</div>
                      <div className="text-sm text-gray-700 font-cabin mb-3 p-2 bg-gray-50 rounded">
                        "{request.message}"
                      </div>
                      <div className="text-xs text-gray-500 font-cabin">
                        Requested {new Date(request.requestedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button 
                      onClick={() => handleApproveRequest(request.id)}
                      size="sm" 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      onClick={() => handleRejectRequest(request.id)}
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {joinRequests.filter(r => r.status === 'pending').length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-cabin">No pending requests</p>
                <p className="text-sm text-gray-400 font-cabin">New join requests will appear here</p>
              </div>
            )}
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium font-cabin">Club Activities</h3>
              <Button size="sm" onClick={() => navigate("/create")}>
                <Plus className="w-4 h-4 mr-1" />
                Create
              </Button>
            </div>

            {recentActivities.map(activity => (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium font-cabin">{activity.title}</div>
                      <div className="text-sm text-gray-600 font-cabin flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(activity.date).toLocaleDateString()} at {activity.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {activity.location}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 font-cabin mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {activity.participants}/{activity.maxParticipants} participants
                        </span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <div className="h-20" /> {/* Bottom padding */}
    </div>
  );
}
