import express from "express";
import {
  createCall,
  endCall,
  callbackCall,
  getAllCalls,
  assignCall,
  exotelWebhook        
} from "../controllers/callController.js";

const router = express.Router();

router.get("/", getAllCalls);
router.post("/", createCall);
router.put("/:id/assign", assignCall);
router.put("/:id/end", endCall);
router.post("/:id/callback", callbackCall);

// Exotel webhook — no auth, Exotel direct-a hit pannum
// IMPORTANT: /:id/callback-ku keezhay வேணும் — otherwise "webhook" as :id match aagum
router.post("/webhook/exotel", exotelWebhook);

export default router;