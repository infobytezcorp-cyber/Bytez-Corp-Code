import express from "express";
import multer from "multer";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createStockRecord,
  getStockRecords,
  updateStockRecord,
  deleteStockRecord,
  getStockSummary,
  uploadStockFile,
  createAdminRecord,
  getAdminRecords,
  updateAdminRecord,
  deleteAdminRecord,
} from "../controllers/adminController.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
router.use(verifyToken);

router.post("/stock", authorizeRoles("admin", "manager"), createStockRecord);
router.post("/stock/upload", authorizeRoles("admin", "manager"), upload.single("file"), uploadStockFile);
router.get("/stock", authorizeRoles("admin", "manager"), getStockRecords);
router.get("/stock/summary", authorizeRoles("admin", "manager"), getStockSummary);
router.put("/stock/:id", authorizeRoles("admin"), updateStockRecord);
router.delete("/stock/:id", authorizeRoles("admin"), deleteStockRecord);

router.post("/records", authorizeRoles("admin", "manager"), createAdminRecord);
router.get("/records", authorizeRoles("admin", "manager"), getAdminRecords);
router.put("/records/:id", authorizeRoles("admin"), updateAdminRecord);
router.delete("/records/:id", authorizeRoles("admin"), deleteAdminRecord);

export default router;
