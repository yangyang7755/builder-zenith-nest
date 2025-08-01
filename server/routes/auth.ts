import { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin, getUserFromToken } from "../lib/supabase";

const ProfileUpdateSchema = z.object({
  full_name: z.string().optional(),
  university: z.string().optional(),
  bio: z.string().optional(),
  profile_image: z.string().url().optional(),
});

export const handleGetProfile = async (req: Request, res: Response) => {
  try {
    // Check if Supabase is configured
    if (!supabaseAdmin) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const user = await getUserFromToken(req.headers.authorization || '');

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

export const handleUpdateProfile = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromToken(req.headers.authorization || '');
    
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const validatedData = ProfileUpdateSchema.parse(req.body);
    
    const { data: updatedProfile, error } = await supabaseAdmin
      .from('profiles')
      .update(validatedData)
      .eq('id', user.id)
      .select('*')
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: "Failed to update profile" });
    }
    
    res.json(updatedProfile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid profile data", details: error.errors });
    } else {
      console.error('Server error:', error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
};

export const handleGetUserClubs = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromToken(req.headers.authorization || '');
    
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { data: memberships, error } = await supabaseAdmin
      .from('club_memberships')
      .select(`
        role,
        status,
        club:clubs(*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'approved');
    
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: "Failed to fetch user clubs" });
    }
    
    const clubs = memberships?.map(membership => ({
      ...membership.club,
      userRole: membership.role
    })) || [];
    
    res.json(clubs);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: "Failed to fetch user clubs" });
  }
};

export const handleGetUserActivities = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromToken(req.headers.authorization || '');
    
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { data: activities, error } = await supabaseAdmin
      .from('activities')
      .select(`
        *,
        organizer:profiles!organizer_id(id, full_name, email),
        club:clubs(id, name)
      `)
      .eq('organizer_id', user.id)
      .order('date', { ascending: true });
    
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: "Failed to fetch user activities" });
    }
    
    res.json(activities || []);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: "Failed to fetch user activities" });
  }
};
