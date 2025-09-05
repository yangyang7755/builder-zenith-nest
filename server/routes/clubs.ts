import { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin, getUserFromToken } from "../lib/supabase";

// Club schema for validation
const ClubSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum([
    "cycling",
    "climbing",
    "running",
    "hiking",
    "skiing",
    "surfing",
    "tennis",
    "general",
  ]),
  location: z.string().min(1),
  website: z.string().url().optional(),
  contact_email: z.string().email().optional(),
});

const JoinRequestSchema = z.object({
  message: z.string().optional(),
});

const UpdateRoleSchema = z.object({
  role: z.enum(["member", "manager"]),
});

export const handleGetClubs = async (req: Request, res: Response) => {
  try {
    if (!supabaseAdmin) {
      return res.json([]);
    }

    const { userId } = req.query as { userId?: string };

    if (userId) {
      const { data: userClubs, error } = await supabaseAdmin
        .from("club_memberships")
        .select(
          `
          role,
          status,
          club:clubs(*)
        `,
        )
        .eq("user_id", userId)
        .eq("status", "approved");

      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({ error: "Failed to fetch user clubs" });
      }

      const clubs =
        userClubs?.map((membership: any) => ({
          ...membership.club,
          userRole: membership.role,
        })) || [];

      return res.json(clubs);
    }

    const { data: clubs, error } = await supabaseAdmin
      .from("clubs")
      .select("*")
      .order("name");

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to fetch clubs" });
    }

    res.json(clubs || []);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch clubs" });
  }
};

export const handleGetClub = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: club, error } = await supabaseAdmin
      .from("clubs")
      .select(
        `
        *,
        memberships:club_memberships(
          id,
          role,
          status,
          requested_at,
          message,
          user:profiles(id, full_name, email)
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      if ((error as any).code === "PGRST116") {
        return res.status(404).json({ error: "Club not found" });
      }
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to fetch club" });
    }

    const members =
      club.memberships?.filter((m: any) => m.status === "approved") || [];
    const pendingRequests =
      club.memberships?.filter((m: any) => m.status === "pending") || [];

    const clubData = {
      ...club,
      members: members.map((m: any) => ({
        id: m.user.id,
        name: m.user.full_name,
        email: m.user.email,
        role: m.role,
      })),
      pendingRequests: pendingRequests.map((m: any) => ({
        id: m.id,
        userId: m.user.id,
        userName: m.user.full_name,
        userEmail: m.user.email,
        message: m.message,
        requestedAt: m.requested_at,
      })),
      memberships: undefined,
    } as any;

    res.json(clubData);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch club" });
  }
};

export const handleUpdateClub = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getUserFromToken(req.headers.authorization || "");

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { data: membership } = await supabaseAdmin
      .from("club_memberships")
      .select("*")
      .eq("club_id", id)
      .eq("user_id", user.id)
      .eq("role", "manager")
      .eq("status", "approved")
      .single();

    if (!membership) {
      return res
        .status(403)
        .json({ error: "Only club managers can update club information" });
    }

    const validatedUpdates = ClubSchema.partial().parse(req.body);

    const { data: updatedClub, error } = await supabaseAdmin
      .from("clubs")
      .update(validatedUpdates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to update club" });
    }

    res.json(updatedClub);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ error: "Invalid club data", details: error.errors });
    } else {
      console.error("Server error:", error);
      res.status(500).json({ error: "Failed to update club" });
    }
  }
};

export const handleJoinRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getUserFromToken(req.headers.authorization || "");

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const requestData = JoinRequestSchema.parse(req.body);

    const { data: club } = await supabaseAdmin
      .from("clubs")
      .select("id")
      .eq("id", id)
      .single();

    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }

    const { data: existingMembership } = await supabaseAdmin
      .from("club_memberships")
      .select("*")
      .eq("club_id", id)
      .eq("user_id", user.id)
      .single();

    if (existingMembership) {
      if (existingMembership.status === "approved") {
        return res
          .status(400)
          .json({ error: "You are already a member of this club" });
      } else if (existingMembership.status === "pending") {
        return res
          .status(400)
          .json({ error: "You already have a pending request for this club" });
      }
    }

    const { data: newRequest, error } = await supabaseAdmin
      .from("club_memberships")
      .insert({
        club_id: id,
        user_id: user.id,
        message: requestData.message,
        status: "pending",
      })
      .select(
        `
        *,
        user:profiles(id, full_name, email)
      `,
      )
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to create join request" });
    }

    res.status(201).json({
      id: newRequest.id,
      userId: newRequest.user.id,
      userName: newRequest.user.full_name,
      userEmail: newRequest.user.email,
      message: newRequest.message,
      requestedAt: newRequest.requested_at,
      status: newRequest.status,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ error: "Invalid request data", details: error.errors });
    } else {
      console.error("Server error:", error);
      res.status(500).json({ error: "Failed to create join request" });
    }
  }
};

export const handleApproveRequest = async (req: Request, res: Response) => {
  try {
    const { id, requestId } = req.params;
    const user = await getUserFromToken(req.headers.authorization || "");

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { data: membership } = await supabaseAdmin
      .from("club_memberships")
      .select("*")
      .eq("club_id", id)
      .eq("user_id", user.id)
      .eq("role", "manager")
      .eq("status", "approved")
      .single();

    if (!membership) {
      return res
        .status(403)
        .json({ error: "Only club managers can approve requests" });
    }

    const { error } = await supabaseAdmin
      .from("club_memberships")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .eq("club_id", id);

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to approve request" });
    }

    res.json({ message: "Request approved successfully" });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to approve request" });
  }
};

export const handleDenyRequest = async (req: Request, res: Response) => {
  try {
    const { id, requestId } = req.params;
    const user = await getUserFromToken(req.headers.authorization || "");

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { data: membership } = await supabaseAdmin
      .from("club_memberships")
      .select("*")
      .eq("club_id", id)
      .eq("user_id", user.id)
      .eq("role", "manager")
      .eq("status", "approved")
      .single();

    if (!membership) {
      return res
        .status(403)
        .json({ error: "Only club managers can deny requests" });
    }

    const { error } = await supabaseAdmin
      .from("club_memberships")
      .delete()
      .eq("id", requestId)
      .eq("club_id", id);

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to deny request" });
    }

    res.json({ message: "Request denied successfully" });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to deny request" });
  }
};

export const handleCreateClub = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromToken(req.headers.authorization || "");

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const validatedData = ClubSchema.parse(req.body);
    const clubId = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");

    const { data: newClub, error: clubError } = await supabaseAdmin
      .from("clubs")
      .insert({
        id: clubId,
        ...validatedData,
        created_by: user.id,
      })
      .select("*")
      .single();

    if (clubError) {
      if ((clubError as any).code === "23505") {
        return res
          .status(400)
          .json({ error: "A club with this name already exists" });
      }
      console.error("Database error:", clubError);
      return res.status(500).json({ error: "Failed to create club" });
    }

    const { error: membershipError } = await supabaseAdmin
      .from("club_memberships")
      .insert({
        club_id: clubId,
        user_id: user.id,
        role: "manager",
        status: "approved",
        approved_at: new Date().toISOString(),
      });

    if (membershipError) {
      console.error("Membership error:", membershipError);
    }

    res.status(201).json(newClub);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ error: "Invalid club data", details: error.errors });
    } else {
      console.error("Server error:", error);
      res.status(500).json({ error: "Failed to create club" });
    }
  }
};

export const handleGetUserClubMemberships = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = await getUserFromToken(req.headers.authorization || "");

    if (!user) {
      if (!supabaseAdmin) {
        return res.json([]);
      }
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!supabaseAdmin) {
      return res.json([]);
    }

    const { data, error } = await supabaseAdmin
      .from("club_memberships")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to fetch memberships" });
    }

    res.json(data || []);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch memberships" });
  }
};

export const handleLeaveClub = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getUserFromToken(req.headers.authorization || "");

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!supabaseAdmin) {
      return res.json({ message: "Left club successfully (demo mode)" });
    }

    const { error } = await supabaseAdmin
      .from("club_memberships")
      .delete()
      .eq("club_id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to leave club" });
    }

    res.json({ message: "Left club successfully" });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to leave club" });
  }
};

export const handleRemoveMember = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params as { id: string; userId: string };
    const user = await getUserFromToken(req.headers.authorization || "");

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!supabaseAdmin) {
      return res.json({ message: "Member removed (demo mode)" });
    }

    const { data: manager } = await supabaseAdmin
      .from("club_memberships")
      .select("*")
      .eq("club_id", id)
      .eq("user_id", user.id)
      .eq("role", "manager")
      .eq("status", "approved")
      .single();

    if (!manager) {
      return res
        .status(403)
        .json({ error: "Only club managers can remove members" });
    }

    const { error } = await supabaseAdmin
      .from("club_memberships")
      .delete()
      .eq("club_id", id)
      .eq("user_id", userId)
      .eq("status", "approved");

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to remove member" });
    }

    res.json({ message: "Member removed" });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to remove member" });
  }
};

export const handleUpdateMemberRole = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params as { id: string; userId: string };
    const { role } = UpdateRoleSchema.parse(req.body);

    const user = await getUserFromToken(req.headers.authorization || "");

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!supabaseAdmin) {
      return res.json({ message: "Role updated (demo mode)" });
    }

    const { data: manager } = await supabaseAdmin
      .from("club_memberships")
      .select("*")
      .eq("club_id", id)
      .eq("user_id", user.id)
      .eq("role", "manager")
      .eq("status", "approved")
      .single();

    if (!manager) {
      return res
        .status(403)
        .json({ error: "Only club managers can update roles" });
    }

    const { error } = await supabaseAdmin
      .from("club_memberships")
      .update({ role })
      .eq("club_id", id)
      .eq("user_id", userId)
      .eq("status", "approved");

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to update role" });
    }

    res.json({ message: "Role updated" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid role", details: error.errors });
    }
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to update role" });
  }
};
