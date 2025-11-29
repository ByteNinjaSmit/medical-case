// server.js
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");


// Workers
const connectToDatabase = require("./config/db");
const logger = require('./utils/logger'); 



// Middleware
const errorMiddleware = require("./middlewares/error-middleware");


// Import Routes
const authRoutes = require("./routers/auth-router");
const userRoutes = require('./routers/user-router');
const prescriptionsRoutes = require('./routers/prescription-router');
const reportsRoutes = require('./routers/reports-router');


// Server Setup
const app = express();
const server = http.createServer(app);
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);



// Cors
const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const PORT = process.env.PORT || 5000;

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, origin); // ✅ Allow only one
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    })
);
app.set("trust proxy", 1); 
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// Defining Routes & API
app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    logger.info(`Request IP, ${req.ip}`);

    next();
});

// Routes Defining
app.get("/", (req, res) => {
    res.send("Welcome to the Medical Case Taking System API");
});


// Remaining Routes
app.use("/api/auth",authRoutes);
app.use('/api/user',userRoutes)
app.use('/api/prescriptions',prescriptionsRoutes)
app.use('/api/reports', reportsRoutes);




// Error Catch
app.use(errorMiddleware);



// ==============================
// 📡 Start Server
// ==============================
connectToDatabase()
  .then(() => {
    logger.info("✅ MongoDB connected");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    logger.error("❌ MongoDB connection failed:", err.message);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (DB connection failed)`);
    });
  });

// Graceful Shutdown
process.on("SIGINT", () => {
  console.log("⏳ Shutting down server...");
  server.close(() => {
    console.log("✅ Server shut down gracefully");
    process.exit(0);
  });
});