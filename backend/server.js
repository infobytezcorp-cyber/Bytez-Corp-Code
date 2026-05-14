
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./src/config/db.js";


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
import chatRoutes from "./src/routes/chatRoutes.js";
import hrRoutes from "./src/routes/hrRoutes.js";
import tasksRoutes from "./src/routes/tasks.js";
import twilioRoutes from './src/routes/twilioRoutes.js';
import whatsAppLeadRoutes from './src/routes/whatsAppLeadRoutes.js';
import trendsRoutes from './src/routes/trendsRoutes.js';


import registerChatSocket from "./src/middleware/Chatsocket.js";
import { startMissedCallAlerts } from "./src/controllers/callController.js";

const app = express();
const server = http.createServer(app);

// Socket.io
export const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://*.ngrok.io",  // Allow ngrok URLs
      "https://*.ngrok.app", // Allow ngrok app URLs
      "*",  // Allow all origins for development
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

registerChatSocket(io);

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

app.options(/.*/, cors());
// Increase body-parser limits to allow large base64 documents from Stage 3 uploads.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // for parsing application/x-www-form-urlencoded

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
app.use("/api/chat", chatRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/hr", hrRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/staff", tasksRoutes); 
app.use("/api/agents", agentRoutes);
app.use('/api/twilio', twilioRoutes);
app.use('/api/whatsappleads', whatsAppLeadRoutes);
app.use('/api/trends', trendsRoutes);

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
