import express from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { z } from "zod";
import { supabaseAdmin, getUserFromToken } from "../lib/supabase.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Helper function to get authenticated user
async function getAuthenticatedUser(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // Return demo user in development for testing
    if (process.env.NODE_ENV !== "production") {
      return { id: "demo-user-id", email: "demo@example.com" };
    }
    return null;
  }
  return await getUserFromToken(authHeader);
}

// Validation schemas
const uploadProfileImageSchema = z.object({
  userId: z.string().optional(),
});

const uploadClubImageSchema = z.object({
  clubId: z.string(),
});

const uploadActivityImageSchema = z.object({
  activityId: z.string(),
});

// POST /api/uploads/profile-image - Upload profile image
router.post('/profile-image', upload.single('image'), async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const { userId } = uploadProfileImageSchema.parse(req.body);
    const targetUserId = userId || user.id;

    // Only allow users to upload their own profile image (or demo mode)
    if (user.id !== "demo-user-id" && user.id !== targetUserId) {
      return res.status(403).json({ success: false, message: 'Cannot upload image for another user' });
    }

    if (!supabaseAdmin) {
      // In demo mode, convert image to base64 data URL for immediate use
      const base64 = req.file.buffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

      return res.json({
        success: true,
        data: { url: dataUrl },
        message: 'Profile image uploaded successfully (demo mode)'
      });
    }

    // Generate unique filename
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${targetUserId}/${crypto.randomUUID()}${fileExtension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('profile-images')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return res.status(500).json({ success: false, message: 'Failed to upload image' });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('profile-images')
      .getPublicUrl(fileName);

    // Update user profile with new image URL
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ profile_image: urlData.publicUrl })
      .eq('id', targetUserId);

    if (updateError) {
      console.error('Profile update error:', updateError);
      // Clean up uploaded file if profile update fails
      await supabaseAdmin.storage
        .from('profile-images')
        .remove([fileName]);
      return res.status(500).json({ success: false, message: 'Failed to update profile' });
    }

    res.json({ 
      success: true, 
      data: { url: urlData.publicUrl },
      message: 'Profile image uploaded successfully'
    });

  } catch (error) {
    console.error('Upload profile image error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Invalid request data', errors: error.errors });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/uploads/club-image - Upload club image
router.post('/club-image', upload.single('image'), async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const { clubId } = uploadClubImageSchema.parse(req.body);

    if (!supabaseAdmin) {
      // In demo mode, return a placeholder URL
      const demoUrl = `/placeholder-club-${clubId}.jpg`;
      return res.json({ 
        success: true, 
        data: { url: demoUrl },
        message: 'Club image uploaded successfully (demo mode)'
      });
    }

    // Check if user is club manager
    const { data: membership } = await supabaseAdmin
      .from('club_memberships')
      .select('role, status')
      .eq('club_id', clubId)
      .eq('user_id', user.id)
      .single();

    if (!membership || membership.role !== 'manager' || membership.status !== 'approved') {
      return res.status(403).json({ success: false, message: 'Only club managers can upload club images' });
    }

    // Generate unique filename
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${clubId}/${crypto.randomUUID()}${fileExtension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('club-images')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return res.status(500).json({ success: false, message: 'Failed to upload image' });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('club-images')
      .getPublicUrl(fileName);

    // Update club with new image URL
    const { error: updateError } = await supabaseAdmin
      .from('clubs')
      .update({ profile_image: urlData.publicUrl })
      .eq('id', clubId);

    if (updateError) {
      console.error('Club update error:', updateError);
      // Clean up uploaded file if club update fails
      await supabaseAdmin.storage
        .from('club-images')
        .remove([fileName]);
      return res.status(500).json({ success: false, message: 'Failed to update club' });
    }

    res.json({ 
      success: true, 
      data: { url: urlData.publicUrl },
      message: 'Club image uploaded successfully'
    });

  } catch (error) {
    console.error('Upload club image error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Invalid request data', errors: error.errors });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/uploads/activity-image - Upload activity image
router.post('/activity-image', upload.single('image'), async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const { activityId } = uploadActivityImageSchema.parse(req.body);

    if (!supabaseAdmin) {
      // In demo mode, return a placeholder URL
      const demoUrl = `/placeholder-activity-${activityId}.jpg`;
      return res.json({ 
        success: true, 
        data: { url: demoUrl },
        message: 'Activity image uploaded successfully (demo mode)'
      });
    }

    // Check if user is activity organizer
    const { data: activity } = await supabaseAdmin
      .from('activities')
      .select('organizer_id')
      .eq('id', activityId)
      .single();

    if (!activity || activity.organizer_id !== user.id) {
      return res.status(403).json({ success: false, message: 'Only activity organizers can upload activity images' });
    }

    // Generate unique filename
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${activityId}/${crypto.randomUUID()}${fileExtension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('activity-images')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return res.status(500).json({ success: false, message: 'Failed to upload image' });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('activity-images')
      .getPublicUrl(fileName);

    res.json({ 
      success: true, 
      data: { url: urlData.publicUrl },
      message: 'Activity image uploaded successfully'
    });

  } catch (error) {
    console.error('Upload activity image error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Invalid request data', errors: error.errors });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/uploads/profile-image - Delete profile image
router.delete('/profile-image', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!supabaseAdmin) {
      return res.json({ 
        success: true,
        message: 'Profile image deleted successfully (demo mode)'
      });
    }

    // Get current profile image
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('profile_image')
      .eq('id', user.id)
      .single();

    if (!profile?.profile_image) {
      return res.status(404).json({ success: false, message: 'No profile image to delete' });
    }

    // Extract filename from URL
    const url = new URL(profile.profile_image);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts.slice(-2).join('/'); // userId/filename

    // Delete from storage
    const { error } = await supabaseAdmin.storage
      .from('profile-images')
      .remove([fileName]);

    if (error) {
      console.error('Storage delete error:', error);
    }

    // Update profile to remove image URL
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ profile_image: null })
      .eq('id', user.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return res.status(500).json({ success: false, message: 'Failed to update profile' });
    }

    res.json({ 
      success: true,
      message: 'Profile image deleted successfully'
    });

  } catch (error) {
    console.error('Delete profile image error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
