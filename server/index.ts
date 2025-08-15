import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleGetActivities,
  handleGetActivity,
  handleCreateActivity,
  handleUpdateActivity,
  handleDeleteActivity,
  handleJoinActivity,
  handleLeaveActivity,
  handleGetParticipants,
  handleGetUserActivityHistory,
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
  handleUserLogin,
  handleGetUserProfile,
  handleUpdateUserProfile,
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
  handleGetSavedActivities,
  handleSaveActivity,
  handleUnsaveActivity,
  handleCheckActivitySaved,
} from "./routes/saved_activities";
import {
  handleGetClubMessages,
  handleGetDirectMessages,
  handleSendClubMessage,
  handleSendDirectMessage,
  handleMarkMessagesRead,
  handleGetClubOnlineUsers,
} from "./routes/chat";
import {
  handleGetNotifications,
  handleMarkNotificationRead,
  handleMarkAllNotificationsRead,
  handleGetUnreadCount,
  handleDeleteNotification,
  handleCreateNotification,
} from "./routes/notifications";
import uploadsRouter from "./routes/uploads";
import healthRouter from "./routes/health";
import {
  handleCreateProfileFromOnboarding,
  handleUpdateProfileFromOnboarding,
} from "./routes/profile-onboarding";
import { supabaseAdmin } from "./lib/supabase";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' })); // Increase JSON body limit
  app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Increase URL-encoded body limit

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
      hasSupabase: !!supabaseAdmin,
    });
  });

  // Activity routes
  app.get("/api/activities", handleGetActivities);
  app.post("/api/activities", handleCreateActivity);
  app.get("/api/activities/:id", handleGetActivity);
  app.put("/api/activities/:id", handleUpdateActivity);
  app.delete("/api/activities/:id", handleDeleteActivity);
  app.post("/api/activities/:id/join", handleJoinActivity);
  app.delete("/api/activities/:id/leave", handleLeaveActivity);
  app.get("/api/activities/:id/participants", handleGetParticipants);
  app.get("/api/activities/user/history", handleGetUserActivityHistory);

  // Saved Activities routes
  app.get("/api/saved-activities", handleGetSavedActivities);
  app.post("/api/saved-activities", handleSaveActivity);
  app.delete("/api/saved-activities/:activityId", handleUnsaveActivity);
  app.get("/api/saved-activities/check/:activityId", handleCheckActivitySaved);

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

  // User Authentication routes
  app.post("/api/users/register", handleUserRegistration);
  app.post("/api/users/login", handleUserLogin);
  app.get("/api/users/:userId/profile", handleGetUserProfile);
  app.put("/api/users/:userId/profile", handleUpdateUserProfile);

  // Onboarding-based Profile Creation routes
  app.post("/api/profile/onboarding", handleCreateProfileFromOnboarding);
  app.put("/api/profile/onboarding", handleUpdateProfileFromOnboarding);

  // User Management routes
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

  // Notification routes
  app.get("/api/notifications", handleGetNotifications);
  app.get("/api/notifications/unread-count", handleGetUnreadCount);
  app.post("/api/notifications/mark-read", handleMarkNotificationRead);
  app.post("/api/notifications/mark-all-read", handleMarkAllNotificationsRead);
  app.delete("/api/notifications/:notification_id", handleDeleteNotification);
  app.post("/api/notifications/create", handleCreateNotification);

  // Upload routes
  app.use("/api/uploads", uploadsRouter);

  // Health check routes
  app.use("/api/health", healthRouter);

  return app;
}
