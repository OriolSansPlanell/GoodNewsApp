import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config';
import { connectDatabase } from './database';
import newsRoutes from './routes/news';
import healthRoutes from './routes/health';

const app: Express = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/news', newsRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'GoodNews API',
    version: '1.0.0',
    description: 'API for positive news aggregation',
    endpoints: {
      health: '/api/health',
      news: '/api/news',
      topics: '/api/news/topics',
      refresh: 'POST /api/news/refresh'
    }
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
async function startServer() {
  try {
    // Try to connect to database (non-blocking)
    try {
      await connectDatabase();
    } catch (dbError: any) {
      console.error('⚠ MongoDB connection failed:', dbError.message);
      console.log('⚠ Server will start without MongoDB - caching will be memory-only\n');
      console.log('To fix MongoDB connection:');
      console.log('1. Update MONGODB_URI in backend/.env with complete password');
      console.log('2. Whitelist your IP in MongoDB Atlas (Network Access)');
      console.log('3. Wait 2-3 minutes, then restart\n');
    }

    // Start listening (even if MongoDB failed)
    app.listen(config.port, () => {
      console.log(`
╔═══════════════════════════════════════════╗
║                                           ║
║       GoodNews API Server Started         ║
║                                           ║
║  Environment: ${config.port === 3000 ? 'Development' : 'Production'}                  ║
║  Port: ${config.port}                              ║
║  News Adapter: ${config.newsAdapter.padEnd(25)}║
║  Positivity Analyzer: ${config.positivityAnalyzer.padEnd(17)}║
║                                           ║
║  API Docs: http://localhost:${config.port}        ║
║  Health: http://localhost:${config.port}/api/health ║
║                                           ║
╚═══════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

export default app;
