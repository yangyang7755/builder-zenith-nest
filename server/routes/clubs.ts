import { Request, Response } from "express";
import { z } from "zod";

// Club schema for validation
const ClubSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  type: z.enum(["cycling", "climbing", "running", "hiking", "skiing", "surfing", "tennis", "general"]),
  location: z.string(),
  website: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
});

const JoinRequestSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string().email(),
  message: z.string().optional(),
});

// In-memory storage (replace with database in production)
let clubs: any[] = [
  {
    id: "oucc",
    name: "Oxford University Cycling Club",
    description: "Premier cycling club at Oxford University",
    type: "cycling",
    location: "Oxford, UK",
    managers: ["user-1"],
    members: ["user-1", "user-2"],
    pendingRequests: [],
    memberCount: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "westway",
    name: "Westway Climbing Centre",
    description: "London's premier climbing facility",
    type: "climbing",
    location: "London, UK",
    managers: ["coach-holly"],
    members: ["coach-holly", "user-2"],
    pendingRequests: [],
    memberCount: 2,
    createdAt: new Date().toISOString(),
  }
];

export const handleGetClubs = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    
    if (userId) {
      // Return clubs where user is a member
      const userClubs = clubs.filter(club => 
        club.members.includes(userId) || club.managers.includes(userId)
      );
      return res.json(userClubs);
    }
    
    // Return all public clubs
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch clubs" });
  }
};

export const handleGetClub = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const club = clubs.find(c => c.id === id);
    
    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }
    
    res.json(club);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch club" });
  }
};

export const handleUpdateClub = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const updates = req.body;
    
    const clubIndex = clubs.findIndex(c => c.id === id);
    
    if (clubIndex === -1) {
      return res.status(404).json({ error: "Club not found" });
    }
    
    const club = clubs[clubIndex];
    
    // Check if user is a manager
    if (!club.managers.includes(userId)) {
      return res.status(403).json({ error: "Only club managers can update club information" });
    }
    
    const validatedUpdates = ClubSchema.partial().parse(updates);
    clubs[clubIndex] = { ...club, ...validatedUpdates };
    
    res.json(clubs[clubIndex]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid club data", details: error.errors });
    } else {
      res.status(500).json({ error: "Failed to update club" });
    }
  }
};

export const handleJoinRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requestData = JoinRequestSchema.parse(req.body);
    
    const clubIndex = clubs.findIndex(c => c.id === id);
    
    if (clubIndex === -1) {
      return res.status(404).json({ error: "Club not found" });
    }
    
    const club = clubs[clubIndex];
    
    // Check if user is already a member
    if (club.members.includes(requestData.userId)) {
      return res.status(400).json({ error: "User is already a member" });
    }
    
    // Check if request already exists
    const existingRequest = club.pendingRequests.find((r: any) => r.userId === requestData.userId);
    if (existingRequest) {
      return res.status(400).json({ error: "Join request already pending" });
    }
    
    const newRequest = {
      id: `req-${Date.now()}`,
      ...requestData,
      requestedAt: new Date().toISOString(),
      status: "pending",
    };
    
    clubs[clubIndex].pendingRequests.push(newRequest);
    
    res.status(201).json(newRequest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request data", details: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create join request" });
    }
  }
};

export const handleApproveRequest = async (req: Request, res: Response) => {
  try {
    const { id, requestId } = req.params;
    const { managerId } = req.body;
    
    const clubIndex = clubs.findIndex(c => c.id === id);
    
    if (clubIndex === -1) {
      return res.status(404).json({ error: "Club not found" });
    }
    
    const club = clubs[clubIndex];
    
    // Check if user is a manager
    if (!club.managers.includes(managerId)) {
      return res.status(403).json({ error: "Only club managers can approve requests" });
    }
    
    const requestIndex = club.pendingRequests.findIndex((r: any) => r.id === requestId);
    
    if (requestIndex === -1) {
      return res.status(404).json({ error: "Request not found" });
    }
    
    const request = club.pendingRequests[requestIndex];
    
    // Add user to members
    clubs[clubIndex].members.push(request.userId);
    clubs[clubIndex].memberCount++;
    
    // Remove from pending requests
    clubs[clubIndex].pendingRequests.splice(requestIndex, 1);
    
    res.json({ message: "Request approved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to approve request" });
  }
};

export const handleDenyRequest = async (req: Request, res: Response) => {
  try {
    const { id, requestId } = req.params;
    const { managerId } = req.body;
    
    const clubIndex = clubs.findIndex(c => c.id === id);
    
    if (clubIndex === -1) {
      return res.status(404).json({ error: "Club not found" });
    }
    
    const club = clubs[clubIndex];
    
    // Check if user is a manager
    if (!club.managers.includes(managerId)) {
      return res.status(403).json({ error: "Only club managers can deny requests" });
    }
    
    const requestIndex = club.pendingRequests.findIndex((r: any) => r.id === requestId);
    
    if (requestIndex === -1) {
      return res.status(404).json({ error: "Request not found" });
    }
    
    // Remove from pending requests
    clubs[clubIndex].pendingRequests.splice(requestIndex, 1);
    
    res.json({ message: "Request denied successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to deny request" });
  }
};
