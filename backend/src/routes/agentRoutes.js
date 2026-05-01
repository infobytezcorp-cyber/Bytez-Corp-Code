import express from "express";
import {
  createAgent,
  toggleBreak,
  getAllAgents,
  getBreakLogs,
  getMyAgent,
  linkUserToAgent,
  logoutAgent
} from "../controllers/agentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/break-logs", getBreakLogs);
router.get("/me", verifyToken, getMyAgent); // ← verifyToken

router.get("/", getAllAgents);
router.post("/", createAgent);
router.put("/:id/break", toggleBreak);
router.patch("/:id/link-user", linkUserToAgent);

router.post("/logoutagent", verifyToken, logoutAgent);

export default router;