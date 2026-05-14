import express from "express";
import { submitForm, listForms, markFormStatus } from "../controllers/recruiterFormController.js";
import { listRecruiterHr, submitRecruiterHr } from "../controllers/recruiterHrController.js";

const router = express.Router();

// POST /api/recruiters/submit
router.post("/submit", express.json({ limit: '10mb' }), submitForm);

// GET /api/recruiters/list
router.get("/list", listForms);

// POST /api/recruiters/mark  { id, status }
router.post("/mark", express.json(), markFormStatus);

// POST /api/recruiters/hr/submit
router.post("/hr/submit", express.json({ limit: "10mb" }), submitRecruiterHr);

// GET /api/recruiters/hr/list
router.get("/hr/list", listRecruiterHr);

export default router;
