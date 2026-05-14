import express from "express";
import { getSource, importLeads, getLeads, markStatus } from "../controllers/recruiterController.js";

const router = express.Router();

// GET /api/recruiter/source?source=indeed
router.get("/source", getSource);

// POST /api/recruiter/import
router.post("/import", express.json(), importLeads);

// GET /api/recruiter/list?source=indeed
router.get("/list", getLeads);

// POST /api/recruiter/mark  { id, status }
router.post("/mark", express.json(), markStatus);

export default router;
