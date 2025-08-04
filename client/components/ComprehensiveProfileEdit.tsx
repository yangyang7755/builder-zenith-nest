import React, { useState, useEffect } from 'react';
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
import ImageUpload from './ImageUpload';
import { useToast } from '../hooks/use-toast';
import { 
  Save, 
  Loader2, 
  Eye, 
  EyeOff, 
  Edit, 
  Plus, 
  Trash2,
  User,
  Shield,
  Trophy,
  MapPin,
  Calendar,
  Briefcase,
  Globe,
  Phone,
  Mail,
  Camera
} from 'lucide-react';

interface ProfileData {
  // Basic Info
  full_name: string;
  bio: string;
  profile_image: string | null;
  email: string;
  phone?: string;
  
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
  profile: any;
  onProfileUpdate?: (profile: any) => void;
  className?: string;
}

export function ComprehensiveProfileEdit({ 
  profile, 
  onProfileUpdate, 
  className = '' 
}: ComprehensiveProfileEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    profile_image: profile?.profile_image || null,
    email: profile?.email || '',
    phone: '',
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
    visibility: defaultVisibility,
  });

  const updateField = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateVisibility = (field: keyof VisibilitySettings, visible: boolean) => {
    setProfileData(prev => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [field]: visible
      }
    }));
  };

  const updateSport = (sportId: string, updates: Partial<SportProfile>) => {
    setProfileData(prev => ({
      ...prev,
      sports: prev.sports.map(sport => 
        sport.id === sportId ? { ...sport, ...updates } : sport
      )
    }));
  };

  const addSport = () => {
    const newSport: SportProfile = {
      id: Date.now().toString(),
      sport: '',
      level: 'Beginner',
      experience: '',
      certifications: [],
      specialties: [],
      preferences: []
    };
    setProfileData(prev => ({
      ...prev,
      sports: [...prev.sports, newSport]
    }));
  };

  const removeSport = (sportId: string) => {
    setProfileData(prev => ({
      ...prev,
      sports: prev.sports.filter(sport => sport.id !== sportId)
    }));
  };

  const addAchievement = () => {
    const newAchievement: Achievement = {
      id: Date.now().toString(),
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      category: 'General',
      verified: false
    };
    setProfileData(prev => ({
      ...prev,
      achievements: [...prev.achievements, newAchievement]
    }));
  };

  const updateAchievement = (achievementId: string, updates: Partial<Achievement>) => {
    setProfileData(prev => ({
      ...prev,
      achievements: prev.achievements.map(achievement => 
        achievement.id === achievementId ? { ...achievement, ...updates } : achievement
      )
    }));
  };

  const removeAchievement = (achievementId: string) => {
    setProfileData(prev => ({
      ...prev,
      achievements: prev.achievements.filter(achievement => achievement.id !== achievementId)
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // In a real app, this would make an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onProfileUpdate?.(profileData);
      setIsEditing(false);
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data if needed
  };

  // Visibility Control Component
  const VisibilityControl = ({ field, label }: { field: keyof VisibilitySettings; label: string }) => (
    <div className="flex items-center justify-between">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-2">
        {profileData.visibility[field] ? (
          <Eye className="h-4 w-4 text-green-600" />
        ) : (
          <EyeOff className="h-4 w-4 text-gray-400" />
        )}
        <Switch
          checked={profileData.visibility[field]}
          onCheckedChange={(checked) => updateVisibility(field, checked)}
        />
      </div>
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Complete Profile Management
            </CardTitle>
            <CardDescription>
              Edit your profile information and control what others can see
            </CardDescription>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isEditing ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="sports">Sports</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Profile Image</Label>
                  <div className="mt-2">
                    <ImageUpload
                      currentImageUrl={profileData.profile_image}
                      onImageChange={(url) => updateField('profile_image', url)}
                      uploadType="profile"
                      showPreview={true}
                      disabled={false}
                    />
                  </div>
                  <VisibilityControl field="profile_image" label="Show profile image" />
                </div>

                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profileData.full_name}
                    onChange={(e) => updateField('full_name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                  <VisibilityControl field="full_name" label="Show full name" />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => updateField('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px]"
                  />
                  <VisibilityControl field="bio" label="Show bio" />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="your.email@example.com"
                  />
                  <VisibilityControl field="email" label="Show email" />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+44 20 1234 5678"
                  />
                  <VisibilityControl field="phone" label="Show phone number" />
                </div>
              </div>
            </TabsContent>

            {/* Personal Details Tab */}
            <TabsContent value="personal" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={profileData.gender} onValueChange={(value) => updateField('gender', value)}>
                    <SelectTrigger>
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

                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profileData.age}
                    onChange={(e) => updateField('age', parseInt(e.target.value))}
                    placeholder="Age"
                  />
                  <VisibilityControl field="age" label="Show age" />
                </div>

                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={profileData.date_of_birth}
                    onChange={(e) => updateField('date_of_birth', e.target.value)}
                  />
                  <VisibilityControl field="date_of_birth" label="Show date of birth" />
                </div>

                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={profileData.nationality}
                    onChange={(e) => updateField('nationality', e.target.value)}
                    placeholder="British"
                  />
                  <VisibilityControl field="nationality" label="Show nationality" />
                </div>

                <div>
                  <Label htmlFor="institution">Institution</Label>
                  <Input
                    id="institution"
                    value={profileData.institution}
                    onChange={(e) => updateField('institution', e.target.value)}
                    placeholder="University or School"
                  />
                  <VisibilityControl field="institution" label="Show institution" />
                </div>

                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={profileData.occupation}
                    onChange={(e) => updateField('occupation', e.target.value)}
                    placeholder="Your job title"
                  />
                  <VisibilityControl field="occupation" label="Show occupation" />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    placeholder="City, Country"
                  />
                  <VisibilityControl field="location" label="Show location" />
                </div>
              </div>
            </TabsContent>

            {/* Sports & Activities Tab */}
            <TabsContent value="sports" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Sports & Activities</h3>
                <Button onClick={addSport} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sport
                </Button>
              </div>
              
              <VisibilityControl field="sports" label="Show sports section" />

              <div className="space-y-4">
                {profileData.sports.map((sport) => (
                  <Card key={sport.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Input
                          value={sport.sport}
                          onChange={(e) => updateSport(sport.id, { sport: e.target.value })}
                          placeholder="Sport name"
                          className="font-semibold"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSport(sport.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Level</Label>
                          <Select value={sport.level} onValueChange={(value) => updateSport(sport.id, { level: value })}>
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
                        <div>
                          <Label>Experience</Label>
                          <Input
                            value={sport.experience}
                            onChange={(e) => updateSport(sport.id, { experience: e.target.value })}
                            placeholder="e.g., 5 years"
                          />
                        </div>
                        {sport.sport.toLowerCase().includes('climb') && (
                          <div>
                            <Label>Max Grade</Label>
                            <Input
                              value={sport.maxGrade}
                              onChange={(e) => updateSport(sport.id, { maxGrade: e.target.value })}
                              placeholder="e.g., V6 / 6c+"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Achievements</h3>
                  <Button onClick={addAchievement} size="sm">
                    <Trophy className="h-4 w-4 mr-2" />
                    Add Achievement
                  </Button>
                </div>
                
                <VisibilityControl field="achievements" label="Show achievements" />

                <div className="space-y-3 mt-4">
                  {profileData.achievements.map((achievement) => (
                    <Card key={achievement.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <Input
                            value={achievement.title}
                            onChange={(e) => updateAchievement(achievement.id, { title: e.target.value })}
                            placeholder="Achievement title"
                            className="font-medium"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAchievement(achievement.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          value={achievement.description}
                          onChange={(e) => updateAchievement(achievement.id, { description: e.target.value })}
                          placeholder="Description"
                          className="mb-3"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Date</Label>
                            <Input
                              type="date"
                              value={achievement.date}
                              onChange={(e) => updateAchievement(achievement.id, { date: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Category</Label>
                            <Input
                              value={achievement.category}
                              onChange={(e) => updateAchievement(achievement.id, { category: e.target.value })}
                              placeholder="e.g., Climbing"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Privacy Settings Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Privacy & Visibility Settings</h3>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Profile Sections</CardTitle>
                    <CardDescription>Control which sections of your profile are visible to others</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <VisibilityControl field="activities" label="Activities & Reviews" />
                    <VisibilityControl field="followers" label="Followers Count" />
                    <VisibilityControl field="following" label="Following Count" />
                    <VisibilityControl field="reviews" label="Reviews & Ratings" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Privacy Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Make everything public</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newVisibility = { ...profileData.visibility };
                          Object.keys(newVisibility).forEach(key => {
                            newVisibility[key as keyof VisibilitySettings] = true;
                          });
                          setProfileData(prev => ({ ...prev, visibility: newVisibility }));
                        }}
                      >
                        Show All
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Make everything private</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newVisibility = { ...profileData.visibility };
                          Object.keys(newVisibility).forEach(key => {
                            newVisibility[key as keyof VisibilitySettings] = false;
                          });
                          // Keep name and profile image visible for basic functionality
                          newVisibility.full_name = true;
                          newVisibility.profile_image = true;
                          setProfileData(prev => ({ ...prev, visibility: newVisibility }));
                        }}
                      >
                        Hide All
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </Tabs>
        ) : (
          /* View Mode */
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600">
                Use the "Edit Profile" button to modify your profile information and privacy settings.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Visible Sections:</h4>
                <div className="space-y-1">
                  {Object.entries(profileData.visibility)
                    .filter(([_, visible]) => visible)
                    .slice(0, 5)
                    .map(([field, _]) => (
                      <div key={field} className="flex items-center gap-2">
                        <Eye className="h-3 w-3 text-green-600" />
                        <span className="capitalize text-green-700">
                          {field.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Hidden Sections:</h4>
                <div className="space-y-1">
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
        )}
      </CardContent>
    </Card>
  );
}

export default ComprehensiveProfileEdit;
