import "dotenv/config";
import { httpServer } from "./index";
import { databaseManager } from "./lib/database";

const PORT = process.env.SERVER_PORT || process.env.PORT || 3002;

async function startServer() {
  try {
    // Initialize database connection
    console.log('🔄 Initializing database connection...');
    await databaseManager.initializeDatabase();

    // Start the server (httpServer already has Express app and Socket.IO configured)
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.IO server ready for real-time connections`);
      console.log(`🔗 API available at http://localhost:${PORT}/api`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
