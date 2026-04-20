import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import connectDB from "./src/config/db.js";
import { connectSQLiteDB } from "./src/config/sqliteDb.js";
import authRoutes from "./src/routes/authRoutes.js";
import protectedRoutes from "./src/routes/protectedRoutes.js";
import otpRoutes from "./src/routes/otpRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import visitorRoutes from "./src/routes/visitorRoutes.js";
import detailsRoutes from "./src/routes/detailsRoutes.js";
import enquiryRoutes from "./src/routes/enquiryRoutes.js";

const app = express();

// --- Middleware ---
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
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

// --- Server Start Logic ---
const startServer = async () => {
  try {
    // 1. Try MongoDB connection (optional - not required for enquiry)
    try {
      await connectDB();
      console.log("✅ MongoDB connected successfully");
    } catch (mongoError) {
      console.warn("⚠️  MongoDB connection failed (optional):", mongoError.message);
      console.log("📌 Using SQLite for enquiry - MongoDB not required");
    }

    // 2. SQLite connect aagura varai wait pannuvom (for enquiry) - REQUIRED
    await connectSQLiteDB();
    console.log("✅ SQLite connected successfully");

    // 3. DB connect aana aprama dhaan server-ai listen panna vekkanum
    const port = process.env.PORT || 8000;
    app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start the server:", error.message);
    process.exit(1); // Connection fail aana server-ai stop pannidum
  }
};

startServer();