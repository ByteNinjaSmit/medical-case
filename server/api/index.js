const dotenv = require('dotenv');
dotenv.config();
const createApp = require('../app');
const connectToDatabase = require('../config/db');
const logger = require('../utils/logger');

let app;
let isDBConnected = false;

module.exports = async function handler(req, res) {
  if (!app) {
    app = createApp(); // mounts /auth and /user (no /api prefix needed here)
  }

  if (!isDBConnected) {
    try {
      await connectToDatabase();
      logger.info('✅ MongoDB connected (Vercel Serverless)');
      isDBConnected = true;
    } catch (err) {
      logger.error('❌ MongoDB connection failed:', err?.message || err);
    }
  }

  return app(req, res);
};
