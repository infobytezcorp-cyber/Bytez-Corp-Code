import express from "express";
import { listRecruiterHr, submitRecruiterHr, updateRecruiterHrStatus } from "../controllers/recruiterHrController.js";

const router = express.Router();

router.post("/submit", express.json({ limit: "10mb" }), submitRecruiterHr);
router.get("/list", listRecruiterHr);
router.patch("/update-status/:id", express.json(), updateRecruiterHrStatus);

export default router;
