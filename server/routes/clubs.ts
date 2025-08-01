import { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin, getUserFromToken } from "../lib/supabase";

// Club schema for validation
const ClubSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["cycling", "climbing", "running", "hiking", "skiing", "surfing", "tennis", "general"]),
  location: z.string().min(1),
  website: z.string().url().optional(),
  contact_email: z.string().email().optional(),
});

const JoinRequestSchema = z.object({
  message: z.string().optional(),
});

export const handleGetClubs = async (req: Request, res: Response) => {
  try {
    // Check if Supabase is configured
    if (!supabaseAdmin) {
      return res.json([]); // Return empty array for development
    }

    const { userId } = req.query;

    if (userId) {
      // Return clubs where user is a member
      const { data: userClubs, error } = await supabaseAdmin
        .from('club_memberships')
        .select(`
          role,
          status,
          club:clubs(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'approved');
      
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: "Failed to fetch user clubs" });
      }
      
      const clubs = userClubs?.map(membership => ({
        ...membership.club,
        userRole: membership.role
      })) || [];
      
      return res.json(clubs);
    }
    
    // Return all public clubs
    const { data: clubs, error } = await supabaseAdmin
      .from('clubs')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: "Failed to fetch clubs" });
    }
    
    res.json(clubs || []);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: "Failed to fetch clubs" });
  }
};

export const handleGetClub = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data: club, error } = await supabaseAdmin
      .from('clubs')
      .select(`
        *,
        memberships:club_memberships(
          id,
          role,
          status,
          requested_at,
          message,
          user:profiles(id, full_name, email)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Club not found" });
      }
      console.error('Database error:', error);
      return res.status(500).json({ error: "Failed to fetch club" });
    }
    
    // Separate members and pending requests
    const members = club.memberships?.filter(m => m.status === 'approved') || [];
    const pendingRequests = club.memberships?.filter(m => m.status === 'pending') || [];
    
    const clubData = {
      ...club,
      members: members.map(m => ({
        id: m.user.id,
        name: m.user.full_name,
        email: m.user.email,
        role: m.role
      })),
      pendingRequests: pendingRequests.map(m => ({
        id: m.id,
        userId: m.user.id,
        userName: m.user.full_name,
        userEmail: m.user.email,
        message: m.message,
        requestedAt: m.requested_at
      })),
      memberships: undefined // Remove raw memberships data
    };
    
    res.json(clubData);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: "Failed to fetch club" });
  }
};

export const handleUpdateClub = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getUserFromToken(req.headers.authorization || '');
    
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check if user is a manager of this club
    const { data: membership } = await supabaseAdmin
      .from('club_memberships')
      .select('*')
      .eq('club_id', id)
      .eq('user_id', user.id)
      .eq('role', 'manager')
      .eq('status', 'approved')
      .single();
    
    if (!membership) {
      return res.status(403).json({ error: "Only club managers can update club information" });
    }
    
    const validatedUpdates = ClubSchema.partial().parse(req.body);
    
    const { data: updatedClub, error } = await supabaseAdmin
      .from('clubs')
      .update(validatedUpdates)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: "Failed to update club" });
    }
    
    res.json(updatedClub);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid club data", details: error.errors });
    } else {
      console.error('Server error:', error);
      res.status(500).json({ error: "Failed to update club" });
    }
  }
};

export const handleJoinRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getUserFromToken(req.headers.authorization || '');
    
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const requestData = JoinRequestSchema.parse(req.body);
    
    // Check if club exists
    const { data: club } = await supabaseAdmin
      .from('clubs')
      .select('id')
      .eq('id', id)
      .single();
    
    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }
    
    // Check if user is already a member or has a pending request
    const { data: existingMembership } = await supabaseAdmin
      .from('club_memberships')
      .select('*')
      .eq('club_id', id)
      .eq('user_id', user.id)
      .single();
    
    if (existingMembership) {
      if (existingMembership.status === 'approved') {
        return res.status(400).json({ error: "You are already a member of this club" });
      } else if (existingMembership.status === 'pending') {
        return res.status(400).json({ error: "You already have a pending request for this club" });
      }
    }
    
    const { data: newRequest, error } = await supabaseAdmin
      .from('club_memberships')
      .insert({
        club_id: id,
        user_id: user.id,
        message: requestData.message,
        status: 'pending'
      })
      .select(`
        *,
        user:profiles(id, full_name, email)
      `)
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: "Failed to create join request" });
    }
    
    res.status(201).json({
      id: newRequest.id,
      userId: newRequest.user.id,
      userName: newRequest.user.full_name,
      userEmail: newRequest.user.email,
      message: newRequest.message,
      requestedAt: newRequest.requested_at,
      status: newRequest.status
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request data", details: error.errors });
    } else {
      console.error('Server error:', error);
      res.status(500).json({ error: "Failed to create join request" });
    }
  }
};

export const handleApproveRequest = async (req: Request, res: Response) => {
  try {
    const { id, requestId } = req.params;
    const user = await getUserFromToken(req.headers.authorization || '');
    
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check if user is a manager of this club
    const { data: membership } = await supabaseAdmin
      .from('club_memberships')
      .select('*')
      .eq('club_id', id)
      .eq('user_id', user.id)
      .eq('role', 'manager')
      .eq('status', 'approved')
      .single();
    
    if (!membership) {
      return res.status(403).json({ error: "Only club managers can approve requests" });
    }
    
    // Update the request status
    const { error } = await supabaseAdmin
      .from('club_memberships')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .eq('club_id', id);
    
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: "Failed to approve request" });
    }
    
    res.json({ message: "Request approved successfully" });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: "Failed to approve request" });
  }
};

export const handleDenyRequest = async (req: Request, res: Response) => {
  try {
    const { id, requestId } = req.params;
    const user = await getUserFromToken(req.headers.authorization || '');
    
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check if user is a manager of this club
    const { data: membership } = await supabaseAdmin
      .from('club_memberships')
      .select('*')
      .eq('club_id', id)
      .eq('user_id', user.id)
      .eq('role', 'manager')
      .eq('status', 'approved')
      .single();
    
    if (!membership) {
      return res.status(403).json({ error: "Only club managers can deny requests" });
    }
    
    // Delete the request
    const { error } = await supabaseAdmin
      .from('club_memberships')
      .delete()
      .eq('id', requestId)
      .eq('club_id', id);
    
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: "Failed to deny request" });
    }
    
    res.json({ message: "Request denied successfully" });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: "Failed to deny request" });
  }
};

// New endpoint to create a club
export const handleCreateClub = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromToken(req.headers.authorization || '');
    
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const validatedData = ClubSchema.parse(req.body);
    const clubId = validatedData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    
    // Create the club
    const { data: newClub, error: clubError } = await supabaseAdmin
      .from('clubs')
      .insert({
        id: clubId,
        ...validatedData,
        created_by: user.id
      })
      .select('*')
      .single();
    
    if (clubError) {
      if (clubError.code === '23505') {
        return res.status(400).json({ error: "A club with this name already exists" });
      }
      console.error('Database error:', clubError);
      return res.status(500).json({ error: "Failed to create club" });
    }
    
    // Add creator as manager
    const { error: membershipError } = await supabaseAdmin
      .from('club_memberships')
      .insert({
        club_id: clubId,
        user_id: user.id,
        role: 'manager',
        status: 'approved',
        approved_at: new Date().toISOString()
      });
    
    if (membershipError) {
      console.error('Membership error:', membershipError);
      // Don't fail the club creation if membership fails
    }
    
    res.status(201).json(newClub);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid club data", details: error.errors });
    } else {
      console.error('Server error:', error);
      res.status(500).json({ error: "Failed to create club" });
    }
  }
};
