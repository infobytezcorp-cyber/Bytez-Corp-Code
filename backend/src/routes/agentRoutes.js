import express from "express";
import {
  createAgent,
  toggleBreak,
  getAllAgents,
  getBreakLogs,
  getMyAgent,
  linkUserToAgent,
  logoutAgent,
  loginAgent,
  forceLogoutAgent   //  ADD THIS IMPORT
} from "../controllers/agentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Specific routes FIRST
router.get("/break-logs", getBreakLogs);
router.get("/me", verifyToken, getMyAgent);
router.post("/loginagent", verifyToken, loginAgent);   
router.post("/logoutagent", verifyToken, logoutAgent); 

// Generic routes
router.get("/", getAllAgents);
router.post("/", verifyToken, createAgent);

// Dynamic /:id routes LAST
router.put("/:id/break", toggleBreak);
router.patch("/:id/link-user", linkUserToAgent);
router.patch("/:id/force-logout", forceLogoutAgent);


export default router;