import { Request, Response } from "express";
import { z } from "zod";

// Activity schema for validation
const ActivitySchema = z.object({
  id: z.string().optional(),
  type: z.enum(["cycling", "climbing", "running", "hiking", "skiing", "surfing", "tennis"]),
  title: z.string().min(1),
  date: z.string(),
  time: z.string(),
  location: z.string(),
  meetupLocation: z.string(),
  organizer: z.string(),
  maxParticipants: z.string(),
  specialComments: z.string(),
  difficulty: z.string().optional(),
  club: z.string().optional(),
});

// In-memory storage (replace with database in production)
let activities: any[] = [];
let nextId = 1;

export const handleGetActivities = async (req: Request, res: Response) => {
  try {
    const { club, type, location } = req.query;
    
    let filteredActivities = activities;
    
    if (club) {
      filteredActivities = filteredActivities.filter(a => a.club === club);
    }
    
    if (type) {
      filteredActivities = filteredActivities.filter(a => a.type === type);
    }
    
    if (location) {
      filteredActivities = filteredActivities.filter(a => 
        a.location.toLowerCase().includes((location as string).toLowerCase())
      );
    }
    
    res.json(filteredActivities);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch activities" });
  }
};

export const handleCreateActivity = async (req: Request, res: Response) => {
  try {
    const validatedData = ActivitySchema.parse(req.body);
    
    const newActivity = {
      ...validatedData,
      id: nextId.toString(),
      createdAt: new Date().toISOString(),
    };
    
    activities.push(newActivity);
    nextId++;
    
    res.status(201).json(newActivity);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid activity data", details: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create activity" });
    }
  }
};

export const handleUpdateActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const activityIndex = activities.findIndex(a => a.id === id);
    
    if (activityIndex === -1) {
      return res.status(404).json({ error: "Activity not found" });
    }
    
    activities[activityIndex] = { ...activities[activityIndex], ...updates };
    
    res.json(activities[activityIndex]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update activity" });
  }
};

export const handleDeleteActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const activityIndex = activities.findIndex(a => a.id === id);
    
    if (activityIndex === -1) {
      return res.status(404).json({ error: "Activity not found" });
    }
    
    activities.splice(activityIndex, 1);
    
    res.json({ message: "Activity deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete activity" });
  }
};
