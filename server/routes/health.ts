import express from "express";
import { databaseManager, getDatabaseStatus } from "../lib/database.js";

const router = express.Router();

// GET /api/health - Basic health check
router.get("/", async (req, res) => {
  try {
    const status = await getDatabaseStatus();
    const isHealthy = status.connection.status === 'CONNECTED';
    
    res.status(isHealthy ? 200 : 503).json({
      success: true,
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: status.connection.status,
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
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
