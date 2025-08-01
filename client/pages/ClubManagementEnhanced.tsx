import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import ChatRoom from '@/components/ChatRoom';
import ImageUpload from '@/components/ImageUpload';
import {
  Users,
  Settings,
  MessageCircle,
  Calendar,
  Plus,
  Check,
  X,
  Edit3,
  Save,
  Crown,
  UserCheck,
  Clock,
  Mail,
} from 'lucide-react';

interface Club {
  id: string;
  name: string;
  description: string;
  type: string;
  location: string;
  member_count: number;
  members: ClubMember[];
  pendingRequests: JoinRequest[];
}

interface ClubMember {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'manager';
}

interface JoinRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  message?: string;
  requestedAt: string;
}

interface ClubManagementEnhancedProps {
  clubId: string;
}

export default function ClubManagementEnhanced({ clubId }: ClubManagementEnhancedProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    location: '',
    website: '',
    contact_email: '',
  });

  useEffect(() => {
    loadClubData();
  }, [clubId]);

  const loadClubData = async () => {
    try {
      const response = await apiService.getClub(clubId);
      if (response.data) {
        setClub(response.data);
        setEditForm({
          name: response.data.name,
          description: response.data.description || '',
          location: response.data.location,
          website: response.data.website || '',
          contact_email: response.data.contact_email || '',
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load club data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClub = async () => {
    if (!user || !club) return;

    setLoading(true);
    try {
      const response = await apiService.updateClub(club.id, editForm, user.id);
      if (response.data) {
        setClub({ ...club, ...response.data });
        setIsEditing(false);
        toast({
          title: "Club Updated",
          description: "Club information has been successfully updated.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update club information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!user || !club) return;

    try {
      await apiService.approveClubRequest(club.id, requestId, user.id);
      toast({
        title: "Request Approved",
        description: "Member request has been approved successfully.",
      });
      loadClubData(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive",
      });
    }
  };

  const handleDenyRequest = async (requestId: string) => {
    if (!user || !club) return;

    try {
      await apiService.denyClubRequest(club.id, requestId, user.id);
      toast({
        title: "Request Denied",
        description: "Member request has been denied.",
      });
      loadClubData(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deny request",
        variant: "destructive",
      });
    }
  };

  const isManager = () => {
    if (!user || !club) return false;
    return club.members.some(m => m.id === user.id && m.role === 'manager');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading club data...</p>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>Club not found or you don't have access to manage this club.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{club.name} Management</h1>
        <p className="text-gray-500">Manage your club settings, members, and activities</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">
            Members ({club.members.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests ({club.pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Club Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Members</span>
                  <Badge variant="secondary">{club.member_count}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Pending Requests</span>
                  <Badge variant={club.pendingRequests.length > 0 ? "destructive" : "secondary"}>
                    {club.pendingRequests.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Club Type</span>
                  <Badge variant="outline">{club.type}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Location</span>
                  <span className="text-sm">{club.location}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-500">
                    No recent activities to show. Activity tracking will be available once fully integrated.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Club Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {club.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={member.role === 'manager' ? 'default' : 'secondary'}>
                        {member.role === 'manager' && <Crown className="h-3 w-3 mr-1" />}
                        {member.role}
                      </Badge>
                      {isManager() && member.role !== 'manager' && (
                        <Button variant="outline" size="sm">
                          Promote to Manager
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Membership Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {club.pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
                  <p className="text-gray-500">All membership requests have been processed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {club.pendingRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarFallback>{getInitials(request.userName)}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <p className="font-medium">{request.userName}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Mail className="h-3 w-3" />
                              {request.userEmail}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="h-3 w-3" />
                              {formatDate(request.requestedAt)}
                            </div>
                            {request.message && (
                              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-2">
                                "{request.message}"
                              </p>
                            )}
                          </div>
                        </div>
                        {isManager() && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApproveRequest(request.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleDenyRequest(request.id)}
                              variant="outline"
                              size="sm"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Deny
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Club Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ChatRoom clubId={club.id} clubName={club.name} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Club Settings
                </CardTitle>
                {isManager() && (
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          onClick={() => setIsEditing(false)}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleUpdateClub} size="sm" disabled={loading}>
                          <Save className="h-4 w-4 mr-1" />
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isManager() && (
                <Alert>
                  <AlertDescription>
                    Only club managers can edit club settings.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Club Name</Label>
                  {isEditing && isManager() ? (
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm text-gray-700">{club.name}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  {isEditing && isManager() ? (
                    <Textarea
                      id="description"
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-gray-700">{club.description || 'No description set'}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  {isEditing && isManager() ? (
                    <Input
                      id="location"
                      value={editForm.location}
                      onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm text-gray-700">{club.location}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="website">Website</Label>
                  {isEditing && isManager() ? (
                    <Input
                      id="website"
                      value={editForm.website}
                      onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                      placeholder="https://..."
                    />
                  ) : (
                    <p className="text-sm text-gray-700">
                      {editForm.website ? (
                        <a href={editForm.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {editForm.website}
                        </a>
                      ) : (
                        'No website set'
                      )}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  {isEditing && isManager() ? (
                    <Input
                      id="contact_email"
                      type="email"
                      value={editForm.contact_email}
                      onChange={(e) => setEditForm({...editForm, contact_email: e.target.value})}
                      placeholder="contact@club.com"
                    />
                  ) : (
                    <p className="text-sm text-gray-700">
                      {editForm.contact_email ? (
                        <a href={`mailto:${editForm.contact_email}`} className="text-blue-600 hover:underline">
                          {editForm.contact_email}
                        </a>
                      ) : (
                        'No contact email set'
                      )}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
