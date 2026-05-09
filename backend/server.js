
import dotenv from "dotenv";
dotenv.config();

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
import nursingRoutes  from "./src/routes/nursingRoutes.js";
import watchmanRoutes from "./src/routes/watchmanRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";


import { startMissedCallAlerts } from "./src/controllers/callController.js";

const app = express();
const server = http.createServer(app);

// Socket.io
export const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);

  socket.on("disconnect", (reason) => {
    console.log("❌ Client disconnected:", socket.id, reason);
  });
});

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
    ],
    credentials: true,
  })
);

// Extra headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, ngrok-skip-browser-warning"
  );

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );

  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/users", userRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/visitor", visitorRoutes);
app.use("/api/userdetails", detailsRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/nursing",  nursingRoutes);
app.use("/api/watchman", watchmanRoutes);
app.use("/api/admin", adminRoutes);

// Start Server
const startServer = async () => {
  try {
    try {
      await connectDB();
      console.log("✅ MongoDB connected successfully");
    } catch (mongoError) {
      console.warn(
        "⚠️ MongoDB connection failed:",
        mongoError.message
      );

      console.log("🟡 Using SQLite fallback");

      // await connectSQLiteDB();
    }

    const port = process.env.PORT || 8000;

    server.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${port} `);

      startMissedCallAlerts();

      console.log("⏰ Missed call alert scheduler started");
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
