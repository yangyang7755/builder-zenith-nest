import { getAuthHeader } from "../lib/supabase";
import { ApiResponse } from "./apiService";

// Store original fetch to avoid third-party interference (like FullStory analytics)
const originalFetch = window.fetch;

// Fallback fetch function that tries multiple approaches
const safeFetch = async (url: string, options?: RequestInit) => {
  // Try original fetch first
  if (originalFetch && typeof originalFetch === 'function') {
    try {
      return await originalFetch(url, options);
    } catch (error) {
      console.log("Original fetch failed in upload service, trying current fetch:", error);
    }
  }

  // Fallback to current fetch (which might be wrapped by analytics)
  try {
    return await window.fetch(url, options);
  } catch (error) {
    console.log("Window fetch also failed in upload service:", error);
    throw error;
  }
};

export interface UploadResponse {
  url: string;
}

class UploadService {
  private baseUrl = "/api/uploads";

  private async upload(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>
  ): Promise<ApiResponse<UploadResponse>> {
    try {
      const authHeader = await getAuthHeader();
      
      const formData = new FormData();
      formData.append("image", file);
      
      // Add any additional data
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const response = await safeFetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Upload error for ${endpoint}:`, error);
      throw error;
    }
  }

  async uploadProfileImage(file: File, userId?: string): Promise<ApiResponse<UploadResponse>> {
    const additionalData = userId ? { userId } : undefined;
    return this.upload("/profile-image", file, additionalData);
  }

  async uploadClubImage(file: File, clubId: string): Promise<ApiResponse<UploadResponse>> {
    return this.upload("/club-image", file, { clubId });
  }

  async uploadActivityImage(file: File, activityId: string): Promise<ApiResponse<UploadResponse>> {
    return this.upload("/activity-image", file, { activityId });
  }

  async deleteProfileImage(): Promise<ApiResponse<void>> {
    try {
      const authHeader = await getAuthHeader();

      const response = await safeFetch(`${this.baseUrl}/profile-image`, {
        method: "DELETE",
        headers: {
          Authorization: authHeader,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Delete profile image error:", error);
      throw error;
    }
  }

  // Helper function to validate file before upload
  validateImageFile(file: File): string | null {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    if (!allowedTypes.includes(file.mimetype || file.type)) {
      return 'Only JPEG, PNG, GIF and WebP images are allowed';
    }

    return null; // Valid file
  }

  // Helper to compress image before upload (optional)
  async compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const { width, height } = img;
        const ratio = Math.min(maxWidth / width, maxWidth / height);
        
        canvas.width = width * ratio;
        canvas.height = height * ratio;

        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original if compression fails
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }
}

export const uploadService = new UploadService();
