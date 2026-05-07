import express from "express";
import {
  createCall,
  endCall,
  callbackCall,
  markCallbackDone,
  getAllCalls,
  assignCall,
  exotelWebhook,
  getMyCallLogs,
  getMyMissedCalls,
} from "../controllers/callController.js";
import {
  twilioWebhook,
  makeOutgoingCall,
  twilioOutgoingTwiml,
} from "../controllers/Twiliocontroller.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Specific routes FIRST (before /:id routes) ───────────────

// Twilio webhooks — no auth — Twilio hits these directly
router.post("/webhook/twilio", twilioWebhook);
router.post("/webhook/twilio-outgoing", twilioOutgoingTwiml);
router.post("/webhook/exotel", exotelWebhook);

// Telecaller specific routes
router.get("/my-calls", verifyToken, getMyCallLogs);
router.get("/my-missed", verifyToken, getMyMissedCalls);
router.post("/outgoing", verifyToken, makeOutgoingCall);

// Admin routes
router.get("/", getAllCalls);
router.post("/", createCall);

// ── Dynamic /:id routes LAST ──────────────────────────────────
router.put("/:id/assign", assignCall);
router.put("/:id/end", endCall);
router.post("/:id/callback", callbackCall);
router.patch("/:id/callback-done", verifyToken, markCallbackDone);

export default router;