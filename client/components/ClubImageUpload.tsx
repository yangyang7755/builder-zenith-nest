import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import ImageUpload from './ImageUpload';
import { useToast } from '../hooks/use-toast';
import { apiService } from '../services/apiService';
import { Club } from '../lib/supabase';
import { Save, Loader2 } from 'lucide-react';

interface ClubImageUploadProps {
  club: Club;
  onClubUpdate?: (club: Club) => void;
  className?: string;
}

export function ClubImageUpload({ club, onClubUpdate, className = '' }: ClubImageUploadProps) {
  const [profileImageUrl, setProfileImageUrl] = useState(club.profile_image);
  const [isSaving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleProfileImageChange = (url: string | null) => {
    setProfileImageUrl(url);
  };

  const handleSave = async () => {
    if (profileImageUrl === club.profile_image) {
      toast({
        title: 'No Changes',
        description: 'No changes to save.',
        variant: 'default',
      });
      return;
    }

    try {
      setSaving(true);

      const response = await apiService.updateClub(club.id, {
        profile_image: profileImageUrl,
      });

      if (response.success && response.data) {
        onClubUpdate?.(response.data);
        toast({
          title: 'Club Updated',
          description: 'Club image has been updated successfully.',
        });
      } else {
        throw new Error(response.message || 'Failed to update club');
      }
    } catch (error) {
      console.error('Club update error:', error);
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update club',
        variant: 'destructive',
      });
      // Revert the image URL on error
      setProfileImageUrl(club.profile_image);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setProfileImageUrl(club.profile_image);
  };

  const hasChanges = profileImageUrl !== club.profile_image;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Club Images</CardTitle>
        <CardDescription>
          Manage your club's profile image and branding
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Club Profile Image */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Club Profile Image</h4>
          <p className="text-xs text-muted-foreground">
            This image will be displayed on your club's profile and in member lists.
          </p>
          <ImageUpload
            currentImageUrl={profileImageUrl}
            onImageChange={handleProfileImageChange}
            uploadType="club"
            entityId={club.id}
            showPreview={true}
            className="max-w-md"
          />
        </div>

        {/* Save Actions */}
        {hasChanges && (
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isSaving}
            >
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
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
        )}

        {/* Club Info */}
        <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
          <p>Club ID: {club.id}</p>
          <p>Members: {club.member_count}</p>
          <p>Created: {new Date(club.created_at).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
