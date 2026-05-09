// backend/src/routes/watchmanRoutes.js
import express from "express";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createVehicle, getVehicle, updateVehicle, deleteVehicle,
  createMaterial, getMaterial, updateMaterial, deleteMaterial,
  createStaffInOut, getStaffInOut, updateStaffInOut, deleteStaffInOut,
  createInmateMove, getInmateMove, updateInmateMove, deleteInmateMove,
} from "../controllers/watchmanController.js";

const router = express.Router();
router.use(verifyToken);

// Vehicle log
router.post("/vehicle",      authorizeRoles("admin", "watchman"), createVehicle);
router.get("/vehicle",       authorizeRoles("admin", "manager", "watchman"), getVehicle);
router.put("/vehicle/:id",   authorizeRoles("admin", "watchman"), updateVehicle);
router.delete("/vehicle/:id", authorizeRoles("admin", "watchman"), deleteVehicle);

// Material in/out
router.post("/material",     authorizeRoles("admin", "watchman"), createMaterial);
router.get("/material",      authorizeRoles("admin", "manager", "watchman"), getMaterial);
router.put("/material/:id",  authorizeRoles("admin", "watchman"), updateMaterial);
router.delete("/material/:id", authorizeRoles("admin", "watchman"), deleteMaterial);

// Staff in/out
router.post("/staff-inout",  authorizeRoles("admin", "watchman"), createStaffInOut);
router.get("/staff-inout",   authorizeRoles("admin", "manager", "watchman"), getStaffInOut);
router.put("/staff-inout/:id", authorizeRoles("admin", "watchman"), updateStaffInOut);
router.delete("/staff-inout/:id", authorizeRoles("admin", "watchman"), deleteStaffInOut);

// Inmate movement
router.post("/inmate-move",  authorizeRoles("admin", "watchman"), createInmateMove);
router.get("/inmate-move",   authorizeRoles("admin", "manager", "watchman"), getInmateMove);
router.put("/inmate-move/:id", authorizeRoles("admin", "watchman"), updateInmateMove);
router.delete("/inmate-move/:id", authorizeRoles("admin", "watchman"), deleteInmateMove);

export default router;