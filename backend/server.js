import dotenv from "dotenv";
dotenv.config();

import path from "path";
import { fileURLToPath } from "url";

import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./src/config/db.js";
import { connectSQLiteDB } from "./src/config/sqliteDb.js";

import authRoutes from "./src/routes/authRoutes.js";
import protectedRoutes from "./src/routes/protectedRoutes.js";
import otpRoutes from "./src/routes/otpRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import visitorRoutes from "./src/routes/visitorRoutes.js";
import detailsRoutes from "./src/routes/detailsRoutes.js";
import enquiryRoutes from "./src/routes/enquiryRoutes.js";
import callRoutes from "./src/routes/callRoutes.js";
import agentRoutes from "./src/routes/agentRoutes.js";

const app = express();

// CREATE HTTP SERVER (IMPORTANT)
const server = http.createServer(app);

// SOCKET.IO SETUP
export const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow any origin (or list your allowed ones)
      callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: false,
  },
});

// 🔹 Optional: connection log
io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);

  socket.on("disconnect", (reason) => {
    console.log("❌ Client disconnected:", socket.id, reason);
  });
});

// CORS
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true); // Allow all, or specify your origins
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"],
  credentials: false
}));

app.options(/.*/, cors());
app.use(express.json());

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/users", userRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/visitor", visitorRoutes);
app.use("/api/userdetails", detailsRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/agents", agentRoutes);

// --- Server Start Logic ---
const startServer = async () => {
  try {
    // MongoDB (optional)
    try {
      await connectDB();
      console.log("MongoDB connected successfully");
    } catch (mongoError) {
      console.warn("MongoDB connection failed (optional):", mongoError.message);
      console.log("Using SQLite fallback");
    }

    // SQLite (required)
    await connectSQLiteDB();
    console.log("SQLite connected successfully");

    const port = process.env.PORT || 8000;

    // START SERVER (IMPORTANT)
    server.listen(port, "0.0.0.0", () => {
      console.log(`Server running on port ${port}`);
    });

  } catch (error) {
    console.error("Failed to start the server:", error.message);
    process.exit(1);
  }
};

startServer();