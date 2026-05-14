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
import hrRoutes from "./src/routes/hrRoutes.js";
import tasksRoutes from "./src/routes/tasks.js";
import twilioRoutes from './src/routes/twilioRoutes.js';
import whatsAppLeadRoutes from './src/routes/whatsAppLeadRoutes.js';
import trendsRoutes from './src/routes/trendsRoutes.js';
import recruiterRoutes from './src/routes/recruiterRoutes.js';
import recruiterFormRoutes from './src/routes/recruiterFormRoutes.js';
import recruiterHrRoutes from './src/routes/recruiterHrRoutes.js';
import workUpdateRoutes from './src/routes/workUpdateRoutes.js';
import initCronJobs from './src/services/cronJobs.js';
import { startMissedCallAlerts } from "./src/controllers/callController.js";

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: function (origin, callback) { callback(null, true); },
    methods: ["GET", "POST"],
    credentials: false,
  },
});

io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);
  socket.on("disconnect", (reason) => {
    console.log("❌ Client disconnected:", socket.id, reason);
  });
});

app.use(cors({
  origin: function (origin, callback) { callback(null, true); },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"],
  credentials: false,
}));

app.options(/.*/, cors());
// Increase body-parser limits to allow large base64 documents from Stage 3 uploads.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // for parsing application/x-www-form-urlencoded

app.use("/api/auth",        authRoutes);
app.use("/api/protected",   protectedRoutes);
app.use("/api/users",       userRoutes);
app.use("/api/otp",         otpRoutes);
app.use("/api/visitor",     visitorRoutes);
app.use("/api/userdetails", detailsRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/staff", tasksRoutes); 
app.use("/api/calls", callRoutes);
app.use("/api/agents", agentRoutes);
app.use('/api/twilio', twilioRoutes);
app.use('/api/whatsappleads', whatsAppLeadRoutes);
app.use('/api/trends', trendsRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/recruiters', recruiterFormRoutes);
app.use('/api/recruiter-hr', recruiterHrRoutes);
app.use('/api/workupdates', workUpdateRoutes);

const startServer = async () => {
  try {
    try {
      await connectDB();
      console.log("MongoDB connected successfully");
    } catch (mongoError) {
      console.warn("MongoDB connection failed (optional):", mongoError.message);
      console.log("Using SQLite fallback");
    }

    const port = process.env.PORT || 8000;

    server.listen(port, "0.0.0.0", () => {
      console.log(`Server running on port ${port}`);

      // ✅ NEW: start 1hr missed call alert — after server is ready
      startMissedCallAlerts();
      console.log("⏰ Missed call alert scheduler started");
    });
    initCronJobs();

  } catch (error) {
    console.error("Failed to start the server:", error.message);
    process.exit(1);
  }
};

startServer();
