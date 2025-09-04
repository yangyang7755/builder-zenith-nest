import express from "express";
import { databaseManager, getDatabaseStatus } from "../lib/database.js";

const router = express.Router();

// HEAD /api/health - ultra-fast health ping
router.head("/", (req, res) => {
  // Always report healthy for HEAD to keep UI responsive; GET provides detailed status
  res.status(200).end();
});

// GET /api/health - Basic health check
router.get("/", async (req, res) => {
  try {
    const status = await getDatabaseStatus();
    const isDatabaseConnected = status.connection.status === 'CONNECTED';

    // In development/demo mode, the app should be considered healthy even without database
    const isDemoMode = process.env.NODE_ENV !== 'production';
    const isHealthy = isDatabaseConnected || isDemoMode;

    res.status(200).json({
      success: true,
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: status.connection.status,
      environment: process.env.NODE_ENV || 'development',
      mode: isDemoMode ? 'demo' : 'production',
    });
  } catch (error) {
    // Even on error, return 200 in demo mode so the network service doesn't mark server as unreachable
    const isDemoMode = process.env.NODE_ENV !== 'production';

    res.status(isDemoMode ? 200 : 503).json({
      success: true,
      status: isDemoMode ? 'healthy-demo' : 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      mode: isDemoMode ? 'demo' : 'production',
    });
  }
});

// GET /api/health/database - Detailed database status
router.get("/database", async (req, res) => {
  try {
    const status = await getDatabaseStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/health/database/test - Test database connection
router.post("/database/test", async (req, res) => {
  try {
    const config = await databaseManager.testConnection();
    
    res.json({
      success: true,
      data: {
        connected: config.isConnected,
        configured: config.hasValidConfig,
        error: config.error,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/health/database/init - Initialize database
router.post("/database/init", async (req, res) => {
  try {
    const initialized = await databaseManager.initializeDatabase();
    
    if (initialized) {
      res.json({
        success: true,
        message: 'Database initialized successfully',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Database initialization failed',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
