import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { ImageUpload } from './ImageUpload';
import { useToast } from '../hooks/use-toast';
import { apiService } from '../services/apiService';
import { Profile } from '../lib/supabase';
import { Save, Loader2 } from 'lucide-react';

interface ProfileEditProps {
  profile: Profile | null;
  onProfileUpdate?: (profile: Profile) => void;
  className?: string;
}

export function ProfileEdit({ profile, onProfileUpdate, className = '' }: ProfileEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    university: profile?.university || '',
    bio: profile?.bio || '',
    profile_image: profile?.profile_image || null,
  });
  const { toast } = useToast();

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        university: profile.university || '',
        bio: profile.bio || '',
        profile_image: profile.profile_image || null,
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (url: string | null) => {
    setFormData(prev => ({
      ...prev,
      profile_image: url,
    }));
  };

  const handleSave = async () => {
    if (!profile?.id) return;

    try {
      setSaving(true);

      const response = await apiService.updateProfile({
        full_name: formData.full_name || null,
        university: formData.university || null,
        bio: formData.bio || null,
        profile_image: formData.profile_image,
      });

      if (response.success && response.data) {
        onProfileUpdate?.(response.data);
        setIsEditing(false);
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been updated successfully.',
        });
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original profile values
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        university: profile.university || '',
        bio: profile.bio || '',
        profile_image: profile.profile_image || null,
      });
    }
    setIsEditing(false);
  };

  const hasChanges = () => {
    if (!profile) return false;
    return (
      formData.full_name !== (profile.full_name || '') ||
      formData.university !== (profile.university || '') ||
      formData.bio !== (profile.bio || '') ||
      formData.profile_image !== profile.profile_image
    );
  };

  if (!profile) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Manage your personal information and profile image
            </CardDescription>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Profile Image Section */}
        <div className="space-y-2">
          <Label>Profile Image</Label>
          <ImageUpload
            currentImageUrl={formData.profile_image}
            onImageChange={handleImageChange}
            uploadType="profile"
            showPreview={true}
            disabled={!isEditing}
            className="max-w-md"
          />
        </div>

        <Separator />

        {/* Basic Information */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="university">University</Label>
            <Input
              id="university"
              value={formData.university}
              onChange={(e) => handleInputChange('university', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter your university"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              disabled={!isEditing}
              placeholder="Tell us about yourself..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <>
            <Separator />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !hasChanges()}
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
          </>
        )}

        {/* Account Info */}
        <Separator />
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Account created: {new Date(profile.created_at).toLocaleDateString()}</p>
          <p>Last updated: {new Date(profile.updated_at).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
