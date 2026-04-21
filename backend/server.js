import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

// import connectDB from "./src/config/db.js";
// import { connectSQLiteDB } from "./src/config/sqliteDb.js";
import { connectDB, sequelize } from './src/config/mysqlDb.js';

//mysql db
import User from "./src/models/User.js";
import Otp from "./src/models/Otp.js";
import VisitDetails from "./src/models/VisitDetails.js";
import Enquiry from "./src/models/Enquirymysql.js";
import Visitor from "./src/models/VisitorModule.js";

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
    // 1. MySQL Connection & Table Sync
    console.log("⏳ Connecting to MySQL...");
    await connectDB(); // Database connection logic

    // 2. Automatical-aa tables create panna indha line mukkiyam
    // alter: true - Neenga model-la change panna MySQL table automatic-aa update aagum
    await sequelize.sync({ alter: true });
    console.log("✅ All MySQL Tables synced and created successfully!");

    // 3. Port Configuration
    const port = process.env.PORT || 8000;
    app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📡 Local Access: http://localhost:${port}`);
    });

  } catch (error) {
    // Endha error vandhalum inga catch aagum
    console.error("❌ Failed to start the server:", error.message);
    process.exit(1); 
  }
};

startServer();