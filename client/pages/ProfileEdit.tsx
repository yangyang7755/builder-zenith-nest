import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Calendar, MapPin, Briefcase, GraduationCap, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { apiService } from '@/services/apiService';

export default function ProfileEdit() {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    bio: '',
    birthday: '',
    gender: '',
    country: '',
    profession: '',
    university: '',
    location: '',
    sports: [] as string[],
    languages: [] as string[],
  });

  // Available options
  const sportsOptions = ['Cycling', 'Climbing', 'Running', 'Hiking', 'Skiing', 'Surfing', 'Tennis'];
  const languageOptions = [
    { code: '🇬🇧', name: 'English' },
    { code: '🇪🇸', name: 'Spanish' },
    { code: '🇨🇳', name: 'Chinese' },
    { code: '🇫🇷', name: 'French' },
    { code: '🇩🇪', name: 'German' },
    { code: '🇮🇹', name: 'Italian' },
    { code: '🇯🇵', name: 'Japanese' },
  ];

  // Load profile data on mount
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || user?.email || '',
        bio: profile.bio || '',
        birthday: profile.birthday || '',
        gender: profile.gender || '',
        country: profile.country || '',
        profession: profile.profession || '',
        university: profile.university || '',
        location: profile.location || '',
        sports: profile.sports || [],
        languages: profile.languages || [],
      });
    }
  }, [profile, user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSportsChange = (sport: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      sports: checked 
        ? [...prev.sports, sport]
        : prev.sports.filter(s => s !== sport)
    }));
  };

  const handleLanguagesChange = (language: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      languages: checked 
        ? [...prev.languages, language]
        : prev.languages.filter(l => l !== language)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name.trim()) {
      toast({
        title: 'Error',
        description: 'Name is required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Update profile via backend API
      const response = await apiService.updateUserProfile(formData);
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Update local profile context
      await updateProfile(formData);

      toast({
        title: 'Profile Updated! ✅',
        description: 'Your profile has been successfully updated.',
      });

      // Navigate back to profile
      navigate('/profile');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-cabin max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white flex items-center justify-between p-6 border-b border-gray-200">
        <Link to="/profile">
          <ArrowLeft className="w-6 h-6 text-black" />
        </Link>
        <h1 className="text-xl font-bold text-black">Edit Profile</h1>
        <div className="w-6"></div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-black mb-4">Basic Information</h2>
          
          <div>
            <Label htmlFor="full_name" className="text-gray-700 font-medium">
              <User className="w-4 h-4 inline mr-2" />
              Full Name *
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Enter your full name"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-gray-700 font-medium">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
              className="mt-1"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed here</p>
          </div>

          <div>
            <Label htmlFor="bio" className="text-gray-700 font-medium">
              <FileText className="w-4 h-4 inline mr-2" />
              Bio
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-black mb-4">Personal Details</h2>
          
          <div>
            <Label htmlFor="birthday" className="text-gray-700 font-medium">
              <Calendar className="w-4 h-4 inline mr-2" />
              Birthday
            </Label>
            <Input
              id="birthday"
              type="date"
              value={formData.birthday}
              onChange={(e) => handleInputChange('birthday', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="gender" className="text-gray-700 font-medium">
              Gender
            </Label>
            <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Non-binary">Non-binary</SelectItem>
                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="country" className="text-gray-700 font-medium">
              Country
            </Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              placeholder="e.g., United Kingdom"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="location" className="text-gray-700 font-medium">
              <MapPin className="w-4 h-4 inline mr-2" />
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Oxford, UK"
              className="mt-1"
            />
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-black mb-4">Professional Information</h2>
          
          <div>
            <Label htmlFor="profession" className="text-gray-700 font-medium">
              <Briefcase className="w-4 h-4 inline mr-2" />
              Profession
            </Label>
            <Input
              id="profession"
              value={formData.profession}
              onChange={(e) => handleInputChange('profession', e.target.value)}
              placeholder="e.g., Student, Engineer, Teacher"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="university" className="text-gray-700 font-medium">
              <GraduationCap className="w-4 h-4 inline mr-2" />
              University/Institution
            </Label>
            <Input
              id="university"
              value={formData.university}
              onChange={(e) => handleInputChange('university', e.target.value)}
              placeholder="e.g., Oxford University"
              className="mt-1"
            />
          </div>
        </div>

        {/* Sports & Interests */}
        <div className="bg-white rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-black mb-4">Sports & Interests</h2>
          
          <div>
            <Label className="text-gray-700 font-medium mb-3 block">Sports</Label>
            <div className="grid grid-cols-2 gap-3">
              {sportsOptions.map((sport) => (
                <label key={sport} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sports.includes(sport)}
                    onChange={(e) => handleSportsChange(sport, e.target.checked)}
                    className="rounded border-gray-300 text-explore-green focus:ring-explore-green"
                  />
                  <span className="text-sm">{sport}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-gray-700 font-medium mb-3 block">Languages</Label>
            <div className="grid grid-cols-2 gap-3">
              {languageOptions.map((lang) => (
                <label key={lang.code} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.languages.includes(lang.code)}
                    onChange={(e) => handleLanguagesChange(lang.code, e.target.checked)}
                    className="rounded border-gray-300 text-explore-green focus:ring-explore-green"
                  />
                  <span className="text-sm">{lang.code} {lang.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-explore-green hover:bg-explore-green/90 text-white py-3"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
