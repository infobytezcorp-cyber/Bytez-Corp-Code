import express from "express";
import {
  createCall, endCall, callbackCall, markCallbackDone,
  getAllCalls, assignCall, acceptIncomingCall, rejectIncomingCall, exotelWebhook,
  getMyCallLogs, getMyMissedCalls,
} from "../controllers/callController.js";
import {
  twilioWebhook, makeOutgoingCall, twilioOutgoingTwiml,
  generateToken, recordingWebhook,
} from "../controllers/Twiliocontroller.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Twilio webhooks — no auth ─────────────────────────────────
router.post("/webhook/twilio", twilioWebhook);
router.post("/webhook/twilio-outgoing", twilioOutgoingTwiml);
router.post("/webhook/recording", recordingWebhook);   // ← புதுசா
router.post("/webhook/exotel", exotelWebhook);

// ── Token ─────────────────────────────────────────────────────
router.get("/token", verifyToken, generateToken);

// ── Telecaller ────────────────────────────────────────────────
router.get("/my-calls", verifyToken, getMyCallLogs);
router.get("/my-missed", verifyToken, getMyMissedCalls);
router.post("/outgoing", verifyToken, makeOutgoingCall);

// ── Admin ─────────────────────────────────────────────────────
router.get("/", getAllCalls);
router.post("/", createCall);

// ── Dynamic /:id ──────────────────────────────────────────────
router.put("/:id/assign", assignCall);
router.post("/:id/accept", verifyToken, acceptIncomingCall);
router.post("/:id/reject", verifyToken, rejectIncomingCall);
router.put("/:id/end", endCall);
router.post("/:id/callback", callbackCall);
router.patch("/:id/callback-done", verifyToken, markCallbackDone);

export default router;