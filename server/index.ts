import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleGetActivities,
  handleCreateActivity,
  handleUpdateActivity,
  handleDeleteActivity,
} from "./routes/activities";
import {
  handleGetClubs,
  handleGetClub,
  handleUpdateClub,
  handleJoinRequest,
  handleApproveRequest,
  handleDenyRequest,
  handleCreateClub,
} from "./routes/clubs";
import {
  handleGetProfile,
  handleUpdateProfile,
  handleGetUserClubs,
  handleGetUserActivities,
} from "./routes/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Demo route
  app.get("/api/demo", handleDemo);

  // Activity routes
  app.get("/api/activities", handleGetActivities);
  app.post("/api/activities", handleCreateActivity);
  app.put("/api/activities/:id", handleUpdateActivity);
  app.delete("/api/activities/:id", handleDeleteActivity);

  // Club routes
  app.get("/api/clubs", handleGetClubs);
  app.post("/api/clubs", handleCreateClub);
  app.get("/api/clubs/:id", handleGetClub);
  app.put("/api/clubs/:id", handleUpdateClub);
  app.post("/api/clubs/:id/join", handleJoinRequest);
  app.post("/api/clubs/:id/requests/:requestId/approve", handleApproveRequest);
  app.delete("/api/clubs/:id/requests/:requestId", handleDenyRequest);

  // Auth/Profile routes
  app.get("/api/profile", handleGetProfile);
  app.put("/api/profile", handleUpdateProfile);
  app.get("/api/user/clubs", handleGetUserClubs);
  app.get("/api/user/activities", handleGetUserActivities);

  return app;
}
