import express from "express";
import {
  createAgent,
  toggleBreak,
  getAllAgents,
  getBreakLogs,
  getMyAgent,
  linkUserToAgent,
  logoutAgent,
  loginAgent   //  ADD THIS IMPORT
} from "../controllers/agentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/break-logs", getBreakLogs);
router.get("/me", verifyToken, getMyAgent);

router.get("/", getAllAgents);
router.post("/", verifyToken, createAgent);         //  verifyToken added
router.put("/:id/break", toggleBreak);
router.patch("/:id/link-user", linkUserToAgent);

router.post("/loginagent", verifyToken, loginAgent);   //  NEW — agent login route
router.post("/logoutagent", verifyToken, logoutAgent);

export default router;