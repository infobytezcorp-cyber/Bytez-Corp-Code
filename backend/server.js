import dotenv from "dotenv";
dotenv.config();

import path from "path";
import { fileURLToPath } from "url";

import express from "express";
import cors from "cors";

import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import protectedRoutes from "./src/routes/protectedRoutes.js";
import otpRoutes from "./src/routes/otpRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import visitorRoutes from "./src/routes/visitorRoutes.js";
import detailsRoutes from "./src/routes/detailsRoutes.js";

connectDB();

const app = express();

// ✅ CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"],
  credentials: false
}));

app.options(/.*/, cors());
app.use(express.json());

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/users", userRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/visitor", visitorRoutes);
app.use("/api/userdetails", detailsRoutes);

// 🔥 FIXED STATIC PATH (IMPORTANT)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👉 go from backend → project root → client/dist
const distPath = path.join(__dirname, "../client/dist");

// ✅ serve frontend
app.use(express.static(distPath));

// ✅ visitor route
app.get("/visitor", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// ✅ server start
const port = process.env.PORT || 8000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});