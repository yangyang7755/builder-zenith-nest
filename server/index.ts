import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleGetActivities,
  handleCreateActivity,
  handleUpdateActivity,
  handleDeleteActivity,
  handleJoinActivity,
  handleLeaveActivity,
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
import {
  handleUserRegistration,
  handleGetUsers,
  handleClubCreation,
  handleGetUserClubs as handleGetUserClubsNew,
} from "./routes/users";
import {
  handleGetReviews,
  handleCreateReview,
  handleUpdateReview,
  handleDeleteReview,
} from "./routes/reviews";
import {
  handleGetFollowers,
  handleGetFollowing,
  handleFollowUser,
  handleUnfollowUser,
  handleGetFollowStats,
} from "./routes/followers";
import {
  handleGetClubMessages,
  handleGetDirectMessages,
  handleSendClubMessage,
  handleSendDirectMessage,
  handleMarkMessagesRead,
  handleGetClubOnlineUsers,
} from "./routes/chat";
import uploadsRouter from "./routes/uploads";
import healthRouter from "./routes/health";
import { supabaseAdmin } from "./lib/supabase";

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

  // Debug route to test server functionality
  app.post("/api/debug/profile", (req, res) => {
    console.log("=== DEBUG PROFILE UPDATE ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log("Request headers:", req.headers);
    console.log("Supabase admin exists:", !!supabaseAdmin);
    res.json({
      success: true,
      message: "Debug endpoint working",
      receivedData: req.body,
      hasSupabase: !!supabaseAdmin
    });
  });

  // Activity routes
  app.get("/api/activities", handleGetActivities);
  app.post("/api/activities", handleCreateActivity);
  app.put("/api/activities/:id", handleUpdateActivity);
  app.delete("/api/activities/:id", handleDeleteActivity);
  app.post("/api/activities/:id/join", handleJoinActivity);
  app.delete("/api/activities/:id/join", handleLeaveActivity);

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

  // User Management routes
  app.post("/api/users/register", handleUserRegistration);
  app.get("/api/users", handleGetUsers);
  app.get("/api/users/:userId/clubs", handleGetUserClubsNew);

  // Enhanced Club Management
  app.post("/api/clubs/create", handleClubCreation);

  // Reviews routes
  app.get("/api/reviews", handleGetReviews);
  app.post("/api/reviews", handleCreateReview);
  app.put("/api/reviews/:id", handleUpdateReview);
  app.delete("/api/reviews/:id", handleDeleteReview);

  // Followers routes
  app.get("/api/users/:user_id/followers", handleGetFollowers);
  app.get("/api/users/:user_id/following", handleGetFollowing);
  app.get("/api/users/:user_id/follow-stats", handleGetFollowStats);
  app.post("/api/follow", handleFollowUser);
  app.delete("/api/follow/:user_id", handleUnfollowUser);

  // Chat routes
  app.get("/api/clubs/:club_id/messages", handleGetClubMessages);
  app.post("/api/clubs/:club_id/messages", handleSendClubMessage);
  app.get("/api/clubs/:club_id/online-users", handleGetClubOnlineUsers);
  app.get("/api/messages/:other_user_id", handleGetDirectMessages);
  app.post("/api/messages", handleSendDirectMessage);
  app.post("/api/messages/mark-read", handleMarkMessagesRead);

  // Upload routes
  app.use("/api/uploads", uploadsRouter);

  // Health check routes
  app.use("/api/health", healthRouter);

  return app;
}
