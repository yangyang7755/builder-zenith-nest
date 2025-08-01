import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, X, Check } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  variant?: 'avatar' | 'cover' | 'rectangle';
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
}

export default function ImageUpload({ 
  currentImage, 
  onImageChange, 
  variant = 'avatar',
  size = 'md',
  placeholder = 'Upload Image'
}: ImageUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const getSizeClasses = () => {
    const sizeMap = {
      sm: variant === 'avatar' ? 'h-16 w-16' : 'h-24 w-32',
      md: variant === 'avatar' ? 'h-24 w-24' : 'h-32 w-48',
      lg: variant === 'avatar' ? 'h-32 w-32' : 'h-48 w-64'
    };
    return sizeMap[size];
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // In a real app, you would upload to a service like Supabase Storage
      // For demo purposes, we'll use the local object URL
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload

      onImageChange(url);
      
      toast({
        title: "Image Uploaded Successfully",
        description: "Your image has been updated.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleGallerySelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const currentDisplayImage = previewUrl || currentImage;

  const renderImageContainer = () => {
    if (variant === 'avatar') {
      return (
        <Avatar className={getSizeClasses()}>
          <AvatarImage src={currentDisplayImage} alt="Upload preview" />
          <AvatarFallback className="text-lg">
            <Camera className="h-6 w-6 text-gray-400" />
          </AvatarFallback>
        </Avatar>
      );
    }

    return (
      <div className={`${getSizeClasses()} border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50`}>
        {currentDisplayImage ? (
          <img 
            src={currentDisplayImage} 
            alt="Upload preview" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center p-4">
            <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{placeholder}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Image Preview */}
      <div className="flex items-center gap-4">
        {renderImageContainer()}
        
        {currentDisplayImage && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveImage}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        )}
      </div>

      {/* Upload Options */}
      <div className="flex gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={isUploading}>
              <Camera className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Camera'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Access Camera</AlertDialogTitle>
              <AlertDialogDescription>
                This will request access to your device camera to take a photo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleCameraCapture}>
                <Camera className="h-4 w-4 mr-2" />
                Open Camera
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleGallerySelect}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Gallery'}
        </Button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
      />

      {/* Upload Progress */}
      {isUploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Uploading image...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Note */}
      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded border border-blue-200">
        <span className="font-medium">Demo Mode:</span> Images are stored locally. 
        In production, images would be uploaded to cloud storage.
      </div>
    </div>
  );
}

// Hook for image upload with compression
export const useImageUpload = () => {
  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };

      img.src = URL.createObjectURL(file);
    });
  };

  return { compressImage };
};
