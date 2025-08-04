import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { uploadService } from '../services/uploadService';
import { useToast } from '../hooks/use-toast';

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onImageChange?: (url: string | null) => void;
  uploadType: 'profile' | 'club' | 'activity';
  entityId?: string; // clubId or activityId for non-profile uploads
  showPreview?: boolean;
  className?: string;
  disabled?: boolean;
  maxFileSizeMB?: number;
  acceptedFormats?: string[];
}

export function ImageUpload({
  currentImageUrl,
  onImageChange,
  uploadType,
  entityId,
  showPreview = true,
  className = '',
  disabled = false,
  maxFileSizeMB = 10,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    if (disabled) return;

    // Validate file
    const validationError = uploadService.validateImageFile(file);
    if (validationError) {
      toast({
        title: 'Invalid File',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    // Additional size check with custom limit
    const maxSizeBytes = maxFileSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast({
        title: 'File Too Large',
        description: `File size must be less than ${maxFileSizeMB}MB`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(10);

      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setUploadProgress(30);

      // Compress image if it's large
      let fileToUpload = file;
      if (file.size > 2 * 1024 * 1024) { // 2MB threshold for compression
        fileToUpload = await uploadService.compressImage(file, 1200, 0.85);
      }
      setUploadProgress(50);

      // Upload based on type
      let response;
      switch (uploadType) {
        case 'profile':
          response = await uploadService.uploadProfileImage(fileToUpload, entityId);
          break;
        case 'club':
          if (!entityId) throw new Error('Club ID required for club image upload');
          response = await uploadService.uploadClubImage(fileToUpload, entityId);
          break;
        case 'activity':
          if (!entityId) throw new Error('Activity ID required for activity image upload');
          response = await uploadService.uploadActivityImage(fileToUpload, entityId);
          break;
        default:
          throw new Error('Invalid upload type');
      }

      setUploadProgress(90);

      if (response.success && response.data) {
        // Clean up object URL
        URL.revokeObjectURL(objectUrl);
        setPreviewUrl(response.data.url);
        onImageChange?.(response.data.url);
        
        toast({
          title: 'Upload Successful',
          description: 'Image uploaded successfully',
        });
      } else {
        throw new Error(response.message || 'Upload failed');
      }

      setUploadProgress(100);
    } catch (error) {
      console.error('Upload error:', error);
      // Revert preview on error
      setPreviewUrl(currentImageUrl || null);
      
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = async () => {
    if (disabled || uploading) return;

    try {
      if (uploadType === 'profile') {
        setUploading(true);
        await uploadService.deleteProfileImage();
        setPreviewUrl(null);
        onImageChange?.(null);
        
        toast({
          title: 'Image Removed',
          description: 'Profile image removed successfully',
        });
      } else {
        // For club/activity images, just clear the preview
        // The actual removal would be handled by the parent component
        setPreviewUrl(null);
        onImageChange?.(null);
      }
    } catch (error) {
      console.error('Remove image error:', error);
      toast({
        title: 'Remove Failed',
        description: 'Failed to remove image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploading) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || uploading) return;

    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const openFileDialog = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  const getUploadTypeText = () => {
    switch (uploadType) {
      case 'profile': return 'Profile Image';
      case 'club': return 'Club Image';
      case 'activity': return 'Activity Image';
      default: return 'Image';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Upload area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        {uploading ? (
          <div className="space-y-2">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
            <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Upload {getUploadTypeText()}</p>
              <p className="text-xs text-muted-foreground">
                Drag & drop or click to browse
              </p>
            </div>
            <div className="flex justify-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                Max {maxFileSizeMB}MB
              </Badge>
              <Badge variant="secondary" className="text-xs">
                JPG, PNG, GIF, WebP
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      {showPreview && previewUrl && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Preview</p>
            {!disabled && !uploading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveImage}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex justify-center">
            {uploadType === 'profile' ? (
              <Avatar className="h-24 w-24">
                <AvatarImage src={previewUrl} alt="Profile preview" />
                <AvatarFallback>
                  <ImageIcon className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="relative max-w-xs">
                <img
                  src={previewUrl}
                  alt={`${getUploadTypeText()} preview`}
                  className="rounded-lg max-h-32 w-auto object-cover"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
