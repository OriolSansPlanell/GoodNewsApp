import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/', async (req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'disconnected'
  };

  // Check database connection
  if (mongoose.connection.readyState === 1) {
    health.database = 'connected';
  }

  const statusCode = health.database === 'connected' ? 200 : 503;

  res.status(statusCode).json(health);
});

export default router;
