import { Server as SocketServer } from "socket.io";
import { createServer } from "http";
import { supabaseAdminAdmin } from "./lib/supabaseAdmin";

export function setupSocketServer(app: any) {
  const server = createServer(app);
  const io = new SocketServer(server, {
    cors: {
      origin: "*", // Configure properly for production
      methods: ["GET", "POST"]
    }
  });

  // Socket.io connection handling
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join user to their personal room for notifications
    socket.on("join_user", (userId) => {
      socket.join(`user_${userId}`);
    });

    // Join club chat rooms
    socket.on("join_club", (clubId) => {
      socket.join(`club_${clubId}`);
    });

    // Handle club messages
    socket.on("club_message", async (data) => {
      const { clubId, userId, message } = data;

      try {
        if (!supabaseAdmin) {
          socket.emit("error", { message: "Database not configured" });
          return;
        }

        // Save message to database
        const { data: newMessage, error } = await supabaseAdmin
          .from("chat_messages")
          .insert({
            club_id: clubId,
            user_id: userId,
            message: message
          })
          .select(`
            *,
            profiles:user_id (
              id,
              full_name,
              profile_image
            )
          `)
          .single();

        if (error) throw error;

        // Broadcast to club room
        io.to(`club_${clubId}`).emit("new_club_message", newMessage);
      } catch (error) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle direct messages
    socket.on("direct_message", async (data) => {
      const { senderId, receiverId, message } = data;
      
      try {
        // Save message to database
        const { data: newMessage, error } = await supabaseAdmin
          .from("direct_messages")
          .insert({
            sender_id: senderId,
            receiver_id: receiverId,
            message: message
          })
          .select(`
            *,
            sender:sender_id (
              id,
              full_name,
              profile_image
            )
          `)
          .single();

        if (error) throw error;

        // Send to both users
        io.to(`user_${senderId}`).emit("new_direct_message", newMessage);
        io.to(`user_${receiverId}`).emit("new_direct_message", newMessage);
      } catch (error) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle activity updates
    socket.on("activity_update", (data) => {
      const { activityId, update } = data;
      // Broadcast to all users interested in this activity
      socket.broadcast.emit("activity_updated", { activityId, update });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return server;
}
