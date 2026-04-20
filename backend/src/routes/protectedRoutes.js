import express from "express";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// 👑 Admin only
router.get("/admin", verifyToken, authorizeRoles("admin"), (req, res) => {
  res.json("Welcome Admin");
});

// 🧑‍💼 Manager + Admin
router.get("/manager", verifyToken, authorizeRoles("admin", "manager"), (req, res) => {
  res.json("Welcome Manager");
});

// 👤 All users
router.get("/user", verifyToken, authorizeRoles("admin", "manager", "user"), (req, res) => {
  res.json("Welcome User");
});

export default router;