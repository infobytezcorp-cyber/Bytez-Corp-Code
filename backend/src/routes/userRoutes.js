import express from "express";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const users = await User.find().select("_id name email role");
    res.json(users);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

export default router;