// api/server.js
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const connectToDatabase = require("../config/db");
const logger = require("../utils/logger");

const errorMiddleware = require("../middlewares/error-middleware");

// Routes
const authRoutes = require("../routers/auth-router");
const userRoutes = require("../routers/user-router");

const app = express();

// Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS
const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173","https://www.amrutamedical.in","https://amrutamedical.in"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.set("trust proxy", 1);

// Parsers
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body: ${JSON.stringify(req.body)}`);
  logger.info(`Request IP: ${req.ip}`);
  next();
});

// Basic API
app.get("/", (req, res) => {
  res.send("Welcome to the Medical Case Taking System API (Vercel)");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// Error Handler
app.use(errorMiddleware);

// ⚠️ Serverless export (NO server.listen)
let isDBConnected = false;

async function handler(req, res) {
  if (!isDBConnected) {
    await connectToDatabase()
      .then(() => {
        logger.info("✅ MongoDB connected (Vercel Serverless)");
        isDBConnected = true;
      })
      .catch((err) => {
        logger.error("❌ MongoDB connection failed:", err.message);
      });
  }

  return app(req, res);
}

module.exports = handler;
