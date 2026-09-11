import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDemoData } from './config/seed.js';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// CORS Configuration: Allow frontend origin with credentials
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// JSON and URL-encoded body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'Corkboard Task Manager API is running smoothly 📌',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Catch-all 404 handler for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint '${req.originalUrl}' not found on this server.`,
    code: 'ROUTE_NOT_FOUND',
  });
});

// Centralized Error-Handling Middleware
app.use(errorHandler);

// Start server after database connection is initialized
const startServer = async () => {
  try {
    await connectDB();
    await seedDemoData();
    const server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`📌 Corkboard Task Manager API running on port ${PORT}`);
      console.log(`🔗 Local API: http://localhost:${PORT}/api/health`);
      console.log(`🛡️ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('====================================================');
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
      });
    });
  } catch (err) {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  }
};

startServer();

export default app;
