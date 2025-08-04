import "dotenv/config";
import { createServer } from "./index";
import { setupSocketServer } from "./socketServer";
import { databaseManager } from "./lib/database";

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Create Express app
    const app = createServer();
    
    // Setup Socket.IO server with Express app
    const server = setupSocketServer(app);
    
    // Start the server
    server.listen(PORT, () => {
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
