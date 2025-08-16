import express from "express";
import cors from "cors";
import { createServer as createHttpServer } from "http";
import { Server } from "socket.io";

// Import route handlers
import {
  handleGetClubs,
  handleGetClub,
  handleUpdateClub,
  handleJoinRequest,
  handleApproveRequest,
  handleDenyRequest,
  handleCreateClub
} from "./routes/clubs";
import healthRouter from "./routes/health";
import { getUserFromToken } from "./lib/supabase";
import {
  handleGetActivities,
  handleCreateActivity,
  handleGetActivity,
  handleJoinActivity,
  handleLeaveActivity,
  handleUpdateActivity,
  handleDeleteActivity
} from "./routes/activities";
import {
  handleGetReviews,
  handleCreateReview,
  handleUpdateReview,
  handleDeleteReview
} from "./routes/reviews";
import {
  handleGetFollowers,
  handleGetFollowing,
  handleFollowUser,
  handleUnfollowUser,
  handleGetFollowStats
} from "./routes/followers";
import {
  handleCreateUser,
  handleGetUser,
  handleUpdateUser,
  handleGetUserProfile,
  handleUpdateUserProfile,
  handleGetUserActivityHistory,
  handleGetActivitiesNeedingReview,
  handleProfileOnboarding
} from "./routes/users";
import uploadsRouter from "./routes/uploads";
import {
  handleGetNotifications,
  handleMarkNotificationRead
} from "./routes/notifications";
import {
  handleGetSavedActivities,
  handleSaveActivity,
  handleUnsaveActivity,
  handleCheckActivitySaved
} from "./routes/saved_activities";

const app = express();
const httpServer = createHttpServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

// Auth middleware to extract user from JWT token
const authMiddleware = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const user = await getUserFromToken(authHeader);
      if (user) {
        req.user = user;
      }
    } catch (error) {
      console.log("Auth middleware error (continuing without auth):", error.message);
      // In demo mode or when Supabase isn't configured, continue without user context
      // This allows the app to work in development without proper Supabase setup
    }
  }

  next();
};

// Apply auth middleware to API routes
app.use("/api", authMiddleware);

// Health check
app.use("/api/health", healthRouter);

// Club routes
app.get("/api/clubs", handleGetClubs);
app.post("/api/clubs", handleCreateClub);
app.get("/api/clubs/:id", handleGetClub);
app.put("/api/clubs/:id", handleUpdateClub);
app.post("/api/clubs/:id/join", handleJoinRequest);
app.put("/api/clubs/:id/requests/:requestId/approve", handleApproveRequest);
app.delete("/api/clubs/:id/requests/:requestId/deny", handleDenyRequest);

// Activity routes
app.get("/api/activities", handleGetActivities);
app.post("/api/activities", handleCreateActivity);
app.get("/api/activities/:id", handleGetActivity);
app.put("/api/activities/:id", handleUpdateActivity);
app.delete("/api/activities/:id", handleDeleteActivity);
app.post("/api/activities/:id/join", handleJoinActivity);
app.delete("/api/activities/:id/leave", handleLeaveActivity);

// Review routes
app.get("/api/reviews", handleGetReviews);
app.post("/api/reviews", handleCreateReview);
app.put("/api/reviews/:id", handleUpdateReview);
app.delete("/api/reviews/:id", handleDeleteReview);

// Follow routes
app.get("/api/followers/:user_id", handleGetFollowers);
app.get("/api/following/:user_id", handleGetFollowing);
app.post("/api/follow", handleFollowUser);
app.delete("/api/unfollow/:user_id", handleUnfollowUser);
app.get("/api/follow-stats/:user_id", handleGetFollowStats);

// User routes
app.post("/api/users", handleCreateUser);
app.get("/api/users/:id", handleGetUser);
app.put("/api/users/:id", handleUpdateUser);
app.get("/api/users/:id/profile", handleGetUserProfile);
app.put("/api/users/profile", handleUpdateUserProfile);
app.get("/api/user/activities", handleGetUserActivityHistory);
app.get("/api/user/activities/pending-reviews", handleGetActivitiesNeedingReview);

// Profile/onboarding routes
app.post("/api/profile/onboarding", handleProfileOnboarding);
app.put("/api/profile/onboarding", handleProfileOnboarding);

// Upload routes
app.use("/api/uploads", uploadsRouter);

// Notification routes
app.get("/api/notifications", handleGetNotifications);
app.put("/api/notifications/:id/read", handleMarkNotificationRead);

// Saved activities routes
app.get("/api/saved-activities", handleGetSavedActivities);
app.post("/api/saved-activities", handleSaveActivity);
app.delete("/api/saved-activities/:activityId", handleUnsaveActivity);
app.get("/api/saved-activities/check/:activityId", handleCheckActivitySaved);

// Socket.IO for real-time features
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join user-specific room for notifications
  socket.on("join-user-room", (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Join activity-specific room for real-time updates
  socket.on("join-activity-room", (activityId) => {
    socket.join(`activity-${activityId}`);
    console.log(`User joined activity room: ${activityId}`);
  });

  // Handle real-time review submission
  socket.on("review-submitted", (data) => {
    // Broadcast to activity room
    socket.to(`activity-${data.activityId}`).emit("new-review", data);
    // Notify organizer
    if (data.organizerId) {
      socket.to(`user-${data.organizerId}`).emit("review-received", data);
    }
  });

  // Handle real-time follow events
  socket.on("user-followed", (data) => {
    // Notify the followed user
    socket.to(`user-${data.followedUserId}`).emit("new-follower", data);
  });

  // Handle real-time activity updates
  socket.on("activity-joined", (data) => {
    // Broadcast to activity room
    socket.to(`activity-${data.activityId}`).emit("participant-joined", data);
    // Notify organizer
    if (data.organizerId) {
      socket.to(`user-${data.organizerId}`).emit("activity-participant-joined", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 3001;

export const createExpressApp = () => {
  return app;
};

// Note: Server is started by server/server.ts, not here

export { io, app, httpServer };
