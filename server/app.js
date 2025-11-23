// Express app factory used by both serverless function and local server
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('./utils/logger');
const connectToDatabase = require('./config/db');
const errorMiddleware = require('./middlewares/error-middleware');

// Routers
const authRoutes = require('./routers/auth-router');
const userRoutes = require('./routers/user-router');
const prescriptionsRoutes = require('./routers/prescription-router');

function createApp() {
  const app = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS
  const defaultOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'https://www.amrutamedical.in',
    'https://amrutamedical.in',
    'https://www.amrutamedical.in/api',
    'https://amrutamedical.in/api'
  ];
  const envOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const allowedOrigins = new Set([...defaultOrigins, ...envOrigins]);

  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, origin || true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })
  );

  app.set('trust proxy', 1);
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Ensure DB connection per invocation (cached in connectToDatabase)
  app.use(async (req, res, next) => {
    try {
      await connectToDatabase();
      next();
    } catch (e) {
      next(e);
    }
  });

  // Basic request logging
  app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    if (Object.keys(req.body || {}).length) {
      logger.info(`Request body, ${JSON.stringify(req.body)}`);
    }
    logger.info(`Request IP, ${req.ip}`);
    next();
  });

  // Health
  app.get('/api', (req, res) => {
    res.send('Welcome to the Medical Case Taking System API');
  });

  // Mount routes with /api prefix for consistency across environments
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/prescriptions',prescriptionsRoutes)

  // Error handler
  app.use(errorMiddleware);

  return app;
}

module.exports = createApp;
