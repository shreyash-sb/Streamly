import express from "express";
import { createServer } from "node:http";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import { initSocketServer } from "./sockets/socketHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.routes.js";
import meetingRoutes from "./routes/meeting.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import healthRoutes from "./routes/health.routes.js";
import legacyUserRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);

// CORS configuration
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
            callback(null, true);
        } else {
            callback(null, true); // Allow all in dev/staging for easy local multi-device testing
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Rate limiting on general API routes
app.use("/api/", apiLimiter);

// Initialize Socket.io Server
const io = initSocketServer(server, corsOptions.origin);

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/v1/users", legacyUserRoutes);

// 404 handler for API
app.use("/api/*", (req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

const start = async () => {
    // Attempt DB connection (falls back gracefully to in-memory if offline)
    await connectDB();

    server.listen(PORT, () => {
        console.log(`\n=================================================`);
        console.log(`🚀 Streamly Server running on port ${PORT}`);
        console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
        console.log(`🔒 Environment: ${process.env.NODE_ENV || "development"}`);
        console.log(`=================================================\n`);
    });
};

// Graceful shutdown
const handleShutdown = () => {
    console.log("\n[!] Gracefully shutting down Streamly server...");
    server.close(() => {
        console.log("[+] HTTP & WebSocket server closed.");
        process.exit(0);
    });
};

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);

start();

export { app, server, io };
