// backend/src/routes/nursingRoutes.js
import express from "express";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createVital, getVitals, updateVital, deleteVital,
  createMedical, getMedical, updateMedical, deleteMedical,
  createFood, getFood, updateFood, deleteFood,
  createCheckup, getCheckup, updateCheckup, deleteCheckup,
} from "../controllers/nursingController.js";

const router = express.Router();
router.use(verifyToken);

// Vitals entry
router.post("/vitals",        authorizeRoles("admin", "nursing"), createVital);
router.get("/vitals",         authorizeRoles("admin", "manager", "nursing"), getVitals);
router.put("/vitals/:id",     authorizeRoles("admin", "nursing"), updateVital);
router.delete("/vitals/:id",  authorizeRoles("admin", "nursing"), deleteVital);

// Medical records
router.post("/medical",       authorizeRoles("admin", "nursing"), createMedical);
router.get("/medical",        authorizeRoles("admin", "manager", "nursing"), getMedical);
router.put("/medical/:id",    authorizeRoles("admin", "nursing"), updateMedical);
router.delete("/medical/:id", authorizeRoles("admin", "nursing"), deleteMedical);

// Food register
router.post("/food",          authorizeRoles("admin", "nursing"), createFood);
router.get("/food",           authorizeRoles("admin", "manager", "nursing"), getFood);
router.put("/food/:id",       authorizeRoles("admin", "nursing"), updateFood);
router.delete("/food/:id",    authorizeRoles("admin", "nursing"), deleteFood);

// Doctor checkup
router.post("/doctor-checkup", authorizeRoles("admin", "nursing"), createCheckup);
router.get("/doctor-checkup",  authorizeRoles("admin", "manager", "nursing"), getCheckup);
router.put("/doctor-checkup/:id", authorizeRoles("admin", "nursing"), updateCheckup);
router.delete("/doctor-checkup/:id", authorizeRoles("admin", "nursing"), deleteCheckup);

export default router;