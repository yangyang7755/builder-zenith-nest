import { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin, getUserFromToken, Database } from "../lib/supabase";

// Activity schema for validation
const ActivitySchema = z.object({
  title: z.string().min(1),
  type: z.enum(["cycling", "climbing", "running", "hiking", "skiing", "surfing", "tennis"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
  time: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM format
  location: z.string().min(1),
  meetup_location: z.string().min(1),
  max_participants: z.number().positive().optional(),
  special_comments: z.string().optional(),
  difficulty: z.string().optional(),
  club_id: z.string().optional(),
});

export const handleGetActivities = async (req: Request, res: Response) => {
  try {
    // Check if Supabase is configured
    if (!supabaseAdmin) {
      return res.json([]); // Return empty array for development
    }

    const { club, type, location } = req.query;

    let query = supabaseAdmin
      .from('activities')
      .select(`
        *,
        organizer:profiles!organizer_id(id, full_name, email),
        club:clubs(id, name)
      `)
      .order('date', { ascending: true });
    
    // Apply filters
    if (club) {
      query = query.eq('club_id', club);
    }
    
    if (type) {
      query = query.eq('type', type);
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    
    const { data: activities, error } = await query;
    
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: "Failed to fetch activities" });
    }
    
    res.json(activities || []);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
};

export const handleCreateActivity = async (req: Request, res: Response) => {
  try {
    // Get user from auth token
    const user = await getUserFromToken(req.headers.authorization || '');
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const validatedData = ActivitySchema.parse(req.body);
    
    // If club_id is provided, verify user is a member of that club
    if (validatedData.club_id) {
      const { data: membership } = await supabaseAdmin
        .from('club_memberships')
        .select('*')
        .eq('club_id', validatedData.club_id)
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .single();
      
      if (!membership) {
        return res.status(403).json({ error: "You must be a member of this club to create activities for it" });
      }
    }
    
    const { data: newActivity, error } = await supabaseAdmin
      .from('activities')
      .insert({
        ...validatedData,
        organizer_id: user.id,
      })
      .select(`
        *,
        organizer:profiles!organizer_id(id, full_name, email),
        club:clubs(id, name)
      `)
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: "Failed to create activity" });
    }
    
    res.status(201).json(newActivity);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid activity data", details: error.errors });
    } else {
      console.error('Server error:', error);
      res.status(500).json({ error: "Failed to create activity" });
    }
  }
};

export const handleUpdateActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getUserFromToken(req.headers.authorization || '');
    
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // First check if activity exists and user has permission
    const { data: activity } = await supabaseAdmin
      .from('activities')
      .select('*, club:clubs(id)')
      .eq('id', id)
      .single();
    
    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }
    
    // Check if user is the organizer or a club manager
    let hasPermission = activity.organizer_id === user.id;
    
    if (!hasPermission && activity.club_id) {
      const { data: membership } = await supabaseAdmin
        .from('club_memberships')
        .select('*')
        .eq('club_id', activity.club_id)
        .eq('user_id', user.id)
        .eq('role', 'manager')
        .eq('status', 'approved')
        .single();
      
      hasPermission = !!membership;
    }
    
    if (!hasPermission) {
      return res.status(403).json({ error: "You don't have permission to update this activity" });
    }
    
    const updates = ActivitySchema.partial().parse(req.body);
    
    const { data: updatedActivity, error } = await supabaseAdmin
      .from('activities')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        organizer:profiles!organizer_id(id, full_name, email),
        club:clubs(id, name)
      `)
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: "Failed to update activity" });
    }
    
    res.json(updatedActivity);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid update data", details: error.errors });
    } else {
      console.error('Server error:', error);
      res.status(500).json({ error: "Failed to update activity" });
    }
  }
};

export const handleDeleteActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getUserFromToken(req.headers.authorization || '');
    
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check if activity exists and user has permission
    const { data: activity } = await supabaseAdmin
      .from('activities')
      .select('*')
      .eq('id', id)
      .single();
    
    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }
    
    // Check if user is the organizer or a club manager
    let hasPermission = activity.organizer_id === user.id;
    
    if (!hasPermission && activity.club_id) {
      const { data: membership } = await supabaseAdmin
        .from('club_memberships')
        .select('*')
        .eq('club_id', activity.club_id)
        .eq('user_id', user.id)
        .eq('role', 'manager')
        .eq('status', 'approved')
        .single();
      
      hasPermission = !!membership;
    }
    
    if (!hasPermission) {
      return res.status(403).json({ error: "You don't have permission to delete this activity" });
    }
    
    const { error } = await supabaseAdmin
      .from('activities')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: "Failed to delete activity" });
    }
    
    res.json({ message: "Activity deleted successfully" });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: "Failed to delete activity" });
  }
};
