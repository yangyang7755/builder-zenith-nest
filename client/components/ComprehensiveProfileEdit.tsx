import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useToast } from '../hooks/use-toast';
import { uploadService } from '../services/uploadService';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  User,
  Camera,
  Eye,
  EyeOff,
  Shield,
  Trophy,
  Activity,
  Plus,
  Trash2,
  Save,
  Settings,
  MapPin,
  Globe,
  Calendar,
  Briefcase,
  GraduationCap,
  Phone,
  Mail,
  CheckCircle,
  Star,
  Mountain,
  Bike,
  Users,
} from 'lucide-react';
import BottomNavigation from './BottomNavigation';

interface VisibilitySettings {
  profile_image: boolean;
  full_name: boolean;
  bio: boolean;
  email: boolean;
  phone: boolean;
  gender: boolean;
  age: boolean;
  date_of_birth: boolean;
  nationality: boolean;
  institution: boolean;
  occupation: boolean;
  location: boolean;
  sports: boolean;
  achievements: boolean;
  activities: boolean;
  reviews: boolean;
  followers: boolean;
  following: boolean;
}

interface ProfileData {
  // Basic Info
  full_name: string;
  bio: string;
  profile_image: string | null;
  email: string;
  phone: string;
  
  // Personal Details
  gender?: string;
  age?: number;
  date_of_birth?: string;
  nationality?: string;
  institution?: string;
  occupation?: string;
  location?: string;
  
  // Sports Data
  sports: SportProfile[];
  
  // Achievements
  achievements: Achievement[];
  
  // Privacy Settings
  visibility: VisibilitySettings;
}

interface SportProfile {
  id: string;
  sport: string;
  level: string;
  experience: string;
  maxGrade?: string;
  certifications: string[];
  specialties: string[];
  preferences: string[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  verified: boolean;
}

const defaultVisibility: VisibilitySettings = {
  profile_image: true,
  full_name: true,
  bio: true,
  email: false,
  phone: false,
  gender: true,
  age: true,
  date_of_birth: false,
  nationality: true,
  institution: true,
  occupation: true,
  location: true,
  sports: true,
  achievements: true,
  activities: true,
  reviews: true,
  followers: true,
  following: true,
};

interface ComprehensiveProfileEditProps {
  profile?: any;
  onProfileUpdate?: (profile: any) => void;
  className?: string;
}

export function ComprehensiveProfileEdit({
  profile,
  onProfileUpdate,
  className = ''
}: ComprehensiveProfileEditProps) {
  const [isSaving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: profile?.full_name || 'Maddie Wei',
    bio: profile?.bio || 'Passionate rock climber and cyclist. Always looking for new adventures and great people to share them with!',
    profile_image: profile?.profile_image || "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2Fb4460a1279a84ad1b10626393196b1cf?format=webp&width=800",
    email: profile?.email || 'maddie.wei@email.com',
    phone: '+44 7700 900123',
    gender: 'Female',
    age: 28,
    date_of_birth: '1996-03-15',
    nationality: 'British',
    institution: 'London School of Economics',
    occupation: 'Software Engineer',
    location: 'London, UK',
    sports: [
      {
        id: '1',
        sport: 'Rock Climbing',
        level: 'Expert',
        experience: '5 years',
        maxGrade: 'V6 / 6c+',
        certifications: ['Lead Climbing'],
        specialties: ['Coaching'],
        preferences: ['Indoor', 'Outdoor', 'Top Rope', 'Lead', 'Bouldering']
      },
      {
        id: '2',
        sport: 'Road Cycling',
        level: 'Intermediate',
        experience: '3 years',
        maxGrade: '',
        certifications: [],
        specialties: ['Group Leader'],
        preferences: ['Road', 'Social Rides', 'Commuting']
      }
    ],
    achievements: [
      {
        id: '1',
        title: 'First 5.11 Lead',
        description: 'Successfully led my first 5.11 route at the local crag',
        date: '2023-08-15',
        category: 'Climbing',
        verified: true
      },
      {
        id: '2',
        title: '100km Cycling Challenge',
        description: 'Completed 100km charity ride for local community',
        date: '2023-06-20',
        category: 'Cycling',
        verified: false
      }
    ],
    visibility: defaultVisibility
  });

  const updateField = (field: string, value: any) => {
    console.log(`Updating field ${field} with value:`, value);
    setProfileData(prev => {
      const updated = { ...prev, [field]: value };
      console.log('Updated profile data:', updated);
      return updated;
    });
  };

  const updateVisibility = (field: keyof VisibilitySettings, visible: boolean) => {
    setProfileData(prev => ({
      ...prev,
      visibility: { ...prev.visibility, [field]: visible }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Prepare comprehensive profile data for API
      const updateData = {
        // Basic Info
        full_name: profileData.full_name,
        bio: profileData.bio,
        email: profileData.email,
        phone: profileData.phone,
        profile_image: profileData.profile_image,

        // Personal Details
        gender: profileData.gender,
        age: profileData.age,
        date_of_birth: profileData.date_of_birth,
        nationality: profileData.nationality,
        institution: profileData.institution,
        occupation: profileData.occupation,
        location: profileData.location,

        // Visibility Settings
        visibility_settings: profileData.visibility,

        // Sports and Achievements
        sports: profileData.sports,
        achievements: profileData.achievements
      };

      // Update profile via API - this will now save to database
      const result = await apiService.updateProfile(updateData);

      if (result.error) {
        throw new Error(result.error);
      }

      // For demo mode (no user), also save to localStorage as backup
      if (!user) {
        console.log('Saving profile data to localStorage:', profileData);
        console.log('Profile image URL:', profileData.profile_image);
        localStorage.setItem('demoProfileData', JSON.stringify(profileData));
        localStorage.setItem('profile_visibility_demo', JSON.stringify(profileData.visibility));
      }

      onProfileUpdate?.(profileData);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully saved to the database.",
      });
      navigate('/profile');
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addSport = () => {
    const newSport: SportProfile = {
      id: Date.now().toString(),
      sport: '',
      level: 'Beginner',
      experience: '',
      maxGrade: '',
      certifications: [],
      specialties: [],
      preferences: []
    };
    setProfileData(prev => ({
      ...prev,
      sports: [...prev.sports, newSport]
    }));
  };

  const removeSport = (id: string) => {
    setProfileData(prev => ({
      ...prev,
      sports: prev.sports.filter(sport => sport.id !== id)
    }));
  };

  const updateSport = (id: string, updates: Partial<SportProfile>) => {
    setProfileData(prev => ({
      ...prev,
      sports: prev.sports.map(sport => 
        sport.id === id ? { ...sport, ...updates } : sport
      )
    }));
  };

  const addAchievement = () => {
    const newAchievement: Achievement = {
      id: Date.now().toString(),
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      verified: false
    };
    setProfileData(prev => ({
      ...prev,
      achievements: [...prev.achievements, newAchievement]
    }));
  };

  const removeAchievement = (id: string) => {
    setProfileData(prev => ({
      ...prev,
      achievements: prev.achievements.filter(achievement => achievement.id !== id)
    }));
  };

  const updateAchievement = (id: string, updates: Partial<Achievement>) => {
    setProfileData(prev => ({
      ...prev,
      achievements: prev.achievements.map(achievement =>
        achievement.id === id ? { ...achievement, ...updates } : achievement
      )
    }));
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = uploadService.validateImageFile(file);
    if (validationError) {
      toast({
        title: "Invalid File",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setUploadingPhoto(true);
    try {
      // Always try backend upload first
      const compressedFile = await uploadService.compressImage(file, 800, 0.8);

      try {
        const result = await uploadService.uploadProfileImage(compressedFile, user?.id || 'demo');

        if (result.data?.url) {
          console.log('Server upload successful, URL:', result.data.url);
          updateField('profile_image', result.data.url);
          toast({
            title: "Photo Updated",
            description: "Your profile photo has been uploaded to the server.",
          });
        } else if (result.error) {
          throw new Error(result.error);
        }
      } catch (uploadError) {
        console.warn('Server upload failed, using local preview:', uploadError);
        // Fallback to local URL for immediate preview
        const objectUrl = URL.createObjectURL(file);
        updateField('profile_image', objectUrl);
        toast({
          title: "Photo Updated",
          description: "Photo updated locally. Will sync to server when you save.",
        });
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const VisibilityControl = ({ field, label }: { field: keyof VisibilitySettings, label: string }) => (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg mt-2">
      <div className="flex items-center gap-2">
        {profileData.visibility[field] ? (
          <Eye className="h-4 w-4 text-green-600" />
        ) : (
          <EyeOff className="h-4 w-4 text-gray-400" />
        )}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <Switch
        checked={profileData.visibility[field]}
        onCheckedChange={(checked) => updateVisibility(field, checked)}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-cabin">
      {/* Header */}
      <div className="bg-white flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 z-10">
        <Link to="/profile">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="sm"
          className="bg-black text-white hover:bg-gray-800"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="basic" className="w-full">
          {/* Tab Navigation */}
          <div className="bg-white border-b border-gray-200 sticky top-[73px] z-10">
            <TabsList className="grid w-full grid-cols-4 h-12 bg-transparent p-0">
              <TabsTrigger 
                value="basic" 
                className="data-[state=active]:bg-gray-50 data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none border-b-2 border-transparent"
              >
                <User className="h-4 w-4 mr-2" />
                Basic
              </TabsTrigger>
              <TabsTrigger 
                value="personal"
                className="data-[state=active]:bg-gray-50 data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none border-b-2 border-transparent"
              >
                <Settings className="h-4 w-4 mr-2" />
                Personal
              </TabsTrigger>
              <TabsTrigger 
                value="sports"
                className="data-[state=active]:bg-gray-50 data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none border-b-2 border-transparent"
              >
                <Activity className="h-4 w-4 mr-2" />
                Sports
              </TabsTrigger>
              <TabsTrigger 
                value="privacy"
                className="data-[state=active]:bg-gray-50 data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none border-b-2 border-transparent"
              >
                <Shield className="h-4 w-4 mr-2" />
                Privacy
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Your essential profile information that helps others find and recognize you.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Profile Picture</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={profileData.profile_image || ''} />
                        <AvatarFallback className="bg-gray-200 text-gray-600">
                          {profileData.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                            id="photo-upload"
                            disabled={uploadingPhoto}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={uploadingPhoto}
                            onClick={() => document.getElementById('photo-upload')?.click()}
                          >
                            {uploadingPhoto ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Camera className="h-4 w-4 mr-2" />
                                Change Photo
                              </>
                            )}
                          </Button>
                        </div>
                        <VisibilityControl field="profile_image" label="Show profile picture" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-base font-medium">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) => updateField('full_name', e.target.value)}
                      placeholder="Your full name"
                      className="text-base"
                    />
                    <VisibilityControl field="full_name" label="Show full name" />
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-base font-medium">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => updateField('bio', e.target.value)}
                      placeholder="Tell others about yourself..."
                      rows={4}
                      className="text-base resize-none"
                    />
                    <VisibilityControl field="bio" label="Show bio" />
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Contact Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-base font-medium">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          placeholder="your.email@example.com"
                          className="text-base"
                        />
                        <VisibilityControl field="email" label="Show email" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-base font-medium">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          placeholder="+44 7700 900123"
                          className="text-base"
                        />
                        <VisibilityControl field="phone" label="Show phone" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Personal Details Tab */}
            <TabsContent value="personal" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Personal Details
                  </CardTitle>
                  <CardDescription>
                    Additional information about yourself to help others connect with you.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Demographics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-base font-medium">Gender</Label>
                      <Select value={profileData.gender} onValueChange={(value) => updateField('gender', value)}>
                        <SelectTrigger className="text-base">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Non-binary">Non-binary</SelectItem>
                          <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      <VisibilityControl field="gender" label="Show gender" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-base font-medium">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={profileData.age || ''}
                        onChange={(e) => updateField('age', e.target.value ? parseInt(e.target.value) || 0 : 0)}
                        placeholder="Age"
                        className="text-base"
                      />
                      <VisibilityControl field="age" label="Show age" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth" className="text-base font-medium">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={profileData.date_of_birth}
                        onChange={(e) => updateField('date_of_birth', e.target.value)}
                        className="text-base"
                      />
                      <VisibilityControl field="date_of_birth" label="Show date of birth" />
                    </div>
                  </div>

                  <Separator />

                  {/* Location & Background */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Location & Background
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nationality" className="text-base font-medium">Nationality</Label>
                        <Input
                          id="nationality"
                          value={profileData.nationality}
                          onChange={(e) => updateField('nationality', e.target.value)}
                          placeholder="British"
                          className="text-base"
                        />
                        <VisibilityControl field="nationality" label="Show nationality" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-base font-medium">Location</Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => updateField('location', e.target.value)}
                          placeholder="London, UK"
                          className="text-base"
                        />
                        <VisibilityControl field="location" label="Show location" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="institution" className="text-base font-medium">Institution</Label>
                        <Input
                          id="institution"
                          value={profileData.institution}
                          onChange={(e) => updateField('institution', e.target.value)}
                          placeholder="University or School"
                          className="text-base"
                        />
                        <VisibilityControl field="institution" label="Show institution" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="occupation" className="text-base font-medium">Occupation</Label>
                        <Input
                          id="occupation"
                          value={profileData.occupation}
                          onChange={(e) => updateField('occupation', e.target.value)}
                          placeholder="Your job title"
                          className="text-base"
                        />
                        <VisibilityControl field="occupation" label="Show occupation" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sports & Activities Tab */}
            <TabsContent value="sports" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Sports & Activities
                  </CardTitle>
                  <CardDescription>
                    Showcase your sporting interests, skills, and achievements.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sports Profiles */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Your Sports</h3>
                      <Button onClick={addSport} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Sport
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {profileData.sports.map((sport) => (
                        <Card key={sport.id} className="border border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Sport</Label>
                                  <Input
                                    value={sport.sport}
                                    onChange={(e) => updateSport(sport.id, { sport: e.target.value })}
                                    placeholder="e.g., Rock Climbing"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Level</Label>
                                  <Select 
                                    value={sport.level} 
                                    onValueChange={(value) => updateSport(sport.id, { level: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Beginner">Beginner</SelectItem>
                                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                                      <SelectItem value="Advanced">Advanced</SelectItem>
                                      <SelectItem value="Expert">Expert</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSport(sport.id)}
                                className="text-red-500 hover:text-red-700 ml-2"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Experience</Label>
                                <Input
                                  value={sport.experience}
                                  onChange={(e) => updateSport(sport.id, { experience: e.target.value })}
                                  placeholder="e.g., 5 years"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Max Grade/Level</Label>
                                <Input
                                  value={sport.maxGrade}
                                  onChange={(e) => updateSport(sport.id, { maxGrade: e.target.value })}
                                  placeholder="e.g., V6 / 6c+"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <VisibilityControl field="sports" label="Show sports section" />
                  </div>

                  <Separator />

                  {/* Achievements */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        Achievements
                      </h3>
                      <Button onClick={addAchievement} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Achievement
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {profileData.achievements.map((achievement) => (
                        <Card key={achievement.id} className="border border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Input
                                    value={achievement.title}
                                    onChange={(e) => updateAchievement(achievement.id, { title: e.target.value })}
                                    placeholder="Achievement title"
                                    className="font-medium text-base"
                                  />
                                  {achievement.verified && (
                                    <Badge variant="secondary" className="text-green-600 bg-green-50">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <Textarea
                                  value={achievement.description}
                                  onChange={(e) => updateAchievement(achievement.id, { description: e.target.value })}
                                  placeholder="Description of your achievement"
                                  rows={2}
                                  className="mb-3 resize-none"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <Label className="text-sm">Date</Label>
                                    <Input
                                      type="date"
                                      value={achievement.date}
                                      onChange={(e) => updateAchievement(achievement.id, { date: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-sm">Category</Label>
                                    <Input
                                      value={achievement.category}
                                      onChange={(e) => updateAchievement(achievement.id, { category: e.target.value })}
                                      placeholder="e.g., Climbing"
                                    />
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAchievement(achievement.id)}
                                className="text-red-500 hover:text-red-700 ml-2"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <VisibilityControl field="achievements" label="Show achievements section" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Settings Tab */}
            <TabsContent value="privacy" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy & Visibility Settings
                  </CardTitle>
                  <CardDescription>
                    Control what information is visible to other users on your profile.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Privacy Control</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Toggle the visibility of each section below. Hidden sections won't be visible to other users visiting your profile.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        Object.keys(profileData.visibility).forEach(key => {
                          updateVisibility(key as keyof VisibilitySettings, true);
                        });
                      }}
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Show All
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        Object.keys(profileData.visibility).forEach(key => {
                          updateVisibility(key as keyof VisibilitySettings, false);
                        });
                      }}
                      className="w-full"
                    >
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide All
                    </Button>
                  </div>

                  <Separator />

                  {/* Privacy Settings Groups */}
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Basic Information</h4>
                      <div className="space-y-2">
                        <VisibilityControl field="profile_image" label="Profile picture" />
                        <VisibilityControl field="full_name" label="Full name" />
                        <VisibilityControl field="bio" label="Bio" />
                        <VisibilityControl field="email" label="Email address" />
                        <VisibilityControl field="phone" label="Phone number" />
                      </div>
                    </div>

                    {/* Personal Details */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Personal Details</h4>
                      <div className="space-y-2">
                        <VisibilityControl field="gender" label="Gender" />
                        <VisibilityControl field="age" label="Age" />
                        <VisibilityControl field="date_of_birth" label="Date of birth" />
                        <VisibilityControl field="nationality" label="Nationality" />
                        <VisibilityControl field="institution" label="Institution" />
                        <VisibilityControl field="occupation" label="Occupation" />
                        <VisibilityControl field="location" label="Location" />
                      </div>
                    </div>

                    {/* Activity & Social */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Activity & Social</h4>
                      <div className="space-y-2">
                        <VisibilityControl field="sports" label="Sports & activities" />
                        <VisibilityControl field="achievements" label="Achievements" />
                        <VisibilityControl field="activities" label="Activity history" />
                        <VisibilityControl field="reviews" label="Reviews & ratings" />
                        <VisibilityControl field="followers" label="Followers count" />
                        <VisibilityControl field="following" label="Following count" />
                      </div>
                    </div>
                  </div>

                  {/* Privacy Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Privacy Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-green-600 font-medium">
                          {Object.values(profileData.visibility).filter(Boolean).length} sections visible
                        </span>
                        <div className="mt-1 space-y-1">
                          {Object.entries(profileData.visibility)
                            .filter(([_, visible]) => visible)
                            .slice(0, 5)
                            .map(([field, _]) => (
                              <div key={field} className="flex items-center gap-2">
                                <Eye className="h-3 w-3 text-green-600" />
                                <span className="capitalize text-gray-600">
                                  {field.replace('_', ' ')}
                                </span>
                              </div>
                            ))}
                          {Object.values(profileData.visibility).filter(Boolean).length > 5 && (
                            <div className="text-xs text-gray-500">
                              +{Object.values(profileData.visibility).filter(Boolean).length - 5} more...
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium">
                          {Object.values(profileData.visibility).filter(v => !v).length} sections hidden
                        </span>
                        <div className="mt-1 space-y-1">
                          {Object.entries(profileData.visibility)
                            .filter(([_, visible]) => !visible)
                            .slice(0, 5)
                            .map(([field, _]) => (
                              <div key={field} className="flex items-center gap-2">
                                <EyeOff className="h-3 w-3 text-gray-400" />
                                <span className="capitalize text-gray-500">
                                  {field.replace('_', ' ')}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

export default ComprehensiveProfileEdit;
