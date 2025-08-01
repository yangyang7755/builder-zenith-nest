import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, MapPin, Calendar, Edit3, Save, X, Plus } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { maddieWeiProfile, DemoProfile } from '@/data/demoProfiles';

interface UserClub {
  id: string;
  name: string;
  type: string;
  location: string;
  userRole: 'member' | 'manager';
}

interface UserActivity {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  club?: { name: string };
}

export default function Profile() {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userClubs, setUserClubs] = useState<UserClub[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  
  const [formData, setFormData] = useState({
    full_name: displayProfile?.full_name || '',
    university: displayProfile?.university || '',
    bio: displayProfile?.bio || '',
    profile_image: displayProfile?.profile_image || '',
  });

  useEffect(() => {
    if (displayProfile) {
      setFormData({
        full_name: displayProfile.full_name || '',
        university: displayProfile.university || '',
        bio: displayProfile.bio || '',
        profile_image: displayProfile.profile_image || '',
      });
    }
  }, [displayProfile, user]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Load user clubs
      const clubsResponse = await apiService.getUserClubs();
      if (clubsResponse.data) {
        setUserClubs(clubsResponse.data);
      } else if (clubsResponse.error) {
        console.warn('Failed to load user clubs:', clubsResponse.error);
        // Set empty array as fallback
        setUserClubs([]);
      }

      // Load user activities
      const activitiesResponse = await apiService.getUserActivities();
      if (activitiesResponse.data) {
        setUserActivities(activitiesResponse.data);
      } else if (activitiesResponse.error) {
        console.warn('Failed to load user activities:', activitiesResponse.error);
        // Set empty array as fallback
        setUserActivities([]);
      }
    } catch (error) {
      console.warn('Error loading user data (this is expected in demo mode):', error);
      // Set fallback data for demo mode
      setUserClubs([]);
      setUserActivities([]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      university: profile?.university || '',
      bio: profile?.bio || '',
      profile_image: profile?.profile_image || '',
    });
    setIsEditing(false);
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
      year: 'numeric'
    });
  };

  // Use demo profile when not signed in
  const displayProfile = user ? profile : maddieWeiProfile;
  const isDemo = !user;

  // Use demo data when not signed in
  const displayClubs = user ? userClubs : maddieWeiProfile.clubs.map(club => ({
    id: club.id,
    name: club.name,
    type: club.type,
    location: club.location,
    userRole: club.userRole
  }));

  const displayActivities = user ? userActivities : maddieWeiProfile.activities.map(activity => ({
    id: activity.id,
    title: activity.title,
    type: activity.type,
    date: activity.date,
    time: activity.time,
    location: activity.location,
    club: activity.club
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isDemo ? `${displayProfile?.full_name}'s Profile` : 'My Profile'}
        </h1>
        <p className="text-gray-500">
          {isDemo
            ? `Demo profile showing ${displayProfile?.full_name}'s activities and clubs`
            : 'Manage your account settings and preferences'
          }
        </p>
        {isDemo && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Demo Mode:</strong> This is Maddie Wei's profile. Sign in to see your own profile and edit your information.
            </p>
          </div>
        )}
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="clubs">
            {isDemo ? 'Clubs' : 'My Clubs'} ({displayClubs.length})
          </TabsTrigger>
          <TabsTrigger value="activities">
            {isDemo ? 'Activities' : 'My Activities'} ({displayActivities.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                <div className="flex gap-2">
                  {!isDemo && (
                    <>
                      {isEditing ? (
                        <>
                          <Button onClick={handleCancel} variant="outline" size="sm">
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                          <Button onClick={handleSave} size="sm" disabled={loading}>
                            <Save className="h-4 w-4 mr-1" />
                            {loading ? 'Saving...' : 'Save'}
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                          <Edit3 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </>
                  )}
                  {isDemo && (
                    <Button variant="outline" size="sm" asChild>
                      <a href="/signin">Sign In to Edit</a>
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start space-x-4">
                {isEditing ? (
                  <ImageUpload
                    currentImage={formData.profile_image}
                    onImageChange={(url) => setFormData({...formData, profile_image: url})}
                    variant="avatar"
                    size="lg"
                    placeholder="Profile Photo"
                  />
                ) : (
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={formData.profile_image} alt={formData.full_name} />
                    <AvatarFallback className="text-lg">
                      {formData.full_name ? getInitials(formData.full_name) : getInitials(user.email || 'U')}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold">
                    {formData.full_name || 'Add your name'}
                  </h3>
                  <div className="flex items-center text-gray-500">
                    <Mail className="h-4 w-4 mr-1" />
                    {user.email}
                  </div>
                  {formData.university && (
                    <div className="flex items-center text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {formData.university}
                    </div>
                  )}
                </div>
              </div>

              {/* Editable Fields */}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-sm text-gray-700">{formData.full_name || 'Not set'}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="university">University/Organization</Label>
                  {isEditing ? (
                    <Input
                      id="university"
                      value={formData.university}
                      onChange={(e) => setFormData({...formData, university: e.target.value})}
                      placeholder="Enter your university or organization"
                    />
                  ) : (
                    <p className="text-sm text-gray-700">{formData.university || 'Not set'}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Tell others about yourself..."
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-gray-700">{formData.bio || 'No bio added yet'}</p>
                  )}
                </div>


              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clubs">
          <Card>
            <CardHeader>
              <CardTitle>My Clubs</CardTitle>
            </CardHeader>
            <CardContent>
              {userClubs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">No clubs joined yet</div>
                  <p className="text-sm text-gray-500 mb-4">
                    Join clubs to connect with like-minded people and participate in activities.
                  </p>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Browse Clubs
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {userClubs.map((club) => (
                    <div key={club.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{club.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Badge variant="secondary">{club.type}</Badge>
                          <span>{club.location}</span>
                        </div>
                      </div>
                      <Badge variant={club.userRole === 'manager' ? 'default' : 'outline'}>
                        {club.userRole}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>My Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {userActivities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">No activities created yet</div>
                  <p className="text-sm text-gray-500 mb-4">
                    Create your first activity to bring people together.
                  </p>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Create Activity
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {userActivities.map((activity) => (
                    <div key={activity.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{activity.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <Badge variant="secondary">{activity.type}</Badge>
                            {activity.club && <span>��� {activity.club.name}</span>}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(activity.date)} at {activity.time}</span>
                            <MapPin className="h-4 w-4 ml-2" />
                            <span>{activity.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
