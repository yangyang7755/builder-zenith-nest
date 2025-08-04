import React, { useState, useRef } from 'react';
import { Camera, Save, X } from 'lucide-react';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useHaptic } from '../hooks/useMobile';

interface ProfileEditWithSyncProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileEditWithSync({ isOpen, onClose }: ProfileEditWithSyncProps) {
  const { currentUserProfile, updateProfile, isLoading } = useUserProfile();
  const haptic = useHaptic();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    full_name: currentUserProfile?.full_name || '',
    bio: currentUserProfile?.bio || '',
    location: currentUserProfile?.location || '',
    institution: currentUserProfile?.institution || '',
    climbing_grade: currentUserProfile?.climbing_grade || '',
    cycling_level: currentUserProfile?.cycling_level || '',
    profile_image: currentUserProfile?.profile_image || '',
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setPreviewImage(imageUrl);
        setFormData(prev => ({ ...prev, profile_image: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    haptic.medium();
    
    if (!currentUserProfile) return;

    await updateProfile({
      full_name: formData.full_name,
      bio: formData.bio,
      location: formData.location,
      institution: formData.institution,
      climbing_grade: formData.climbing_grade,
      cycling_level: formData.cycling_level,
      profile_image: formData.profile_image,
    });

    onClose();
  };

  const handleCancel = () => {
    haptic.light();
    setFormData({
      full_name: currentUserProfile?.full_name || '',
      bio: currentUserProfile?.bio || '',
      location: currentUserProfile?.location || '',
      institution: currentUserProfile?.institution || '',
      climbing_grade: currentUserProfile?.climbing_grade || '',
      cycling_level: currentUserProfile?.cycling_level || '',
      profile_image: currentUserProfile?.profile_image || '',
    });
    setPreviewImage(null);
    onClose();
  };

  return (
    <div className="native-modal open">
      <div className="native-modal-content max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-explore-green">Edit Profile</h2>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-full touchable"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Picture Section */}
        <div className="mb-6 text-center">
          <div className="relative inline-block">
            <img
              src={previewImage || formData.profile_image || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=120&h=120&fit=crop&crop=face"}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-explore-green text-white p-2 rounded-full shadow-lg touchable native-button-press"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Tap camera icon to change photo
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              className="native-input"
              placeholder="Enter your full name"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="native-input h-20 resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="native-input"
              placeholder="City, Country"
            />
          </div>

          {/* Institution */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Institution
            </label>
            <input
              type="text"
              value={formData.institution}
              onChange={(e) => handleInputChange('institution', e.target.value)}
              className="native-input"
              placeholder="University or Organization"
            />
          </div>

          {/* Climbing Grade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Climbing Grade
            </label>
            <select
              value={formData.climbing_grade}
              onChange={(e) => handleInputChange('climbing_grade', e.target.value)}
              className="native-input"
            >
              <option value="">Select climbing grade</option>
              <option value="5a">5a (Beginner)</option>
              <option value="5b">5b</option>
              <option value="5c">5c</option>
              <option value="6a">6a</option>
              <option value="6a+">6a+</option>
              <option value="6b">6b</option>
              <option value="6b+">6b+ (Intermediate)</option>
              <option value="6c">6c</option>
              <option value="6c+">6c+</option>
              <option value="7a">7a</option>
              <option value="7a+">7a+</option>
              <option value="7b">7b (Advanced)</option>
              <option value="7c">7c</option>
              <option value="8a">8a+ (Expert)</option>
            </select>
          </div>

          {/* Cycling Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cycling Level
            </label>
            <select
              value={formData.cycling_level}
              onChange={(e) => handleInputChange('cycling_level', e.target.value)}
              className="native-input"
            >
              <option value="">Select cycling level</option>
              <option value="Beginner">Beginner (0-15 km/h)</option>
              <option value="Intermediate">Intermediate (15-25 km/h)</option>
              <option value="Advanced">Advanced (25-35 km/h)</option>
              <option value="Expert">Expert (35+ km/h)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleCancel}
            className="flex-1 native-button-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 native-button flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="native-spinner w-4 h-4"></div>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* Info Text */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Your profile changes will be updated everywhere in the app instantly
        </p>
      </div>
    </div>
  );
}
