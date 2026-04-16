import express from "express";
import { checkoutVisitor, getVisitors, registerVisitor, updateVisitor } from "../controllers/visitorController.js";


const router = express.Router();

// 🔹 SAVE VISITOR (CHECK-IN)
router.post("/", registerVisitor);

// 🔹 GET ALL VISITORS
router.get("/", getVisitors);

// 🔹 CHECKOUT VISITOR
router.put("/:id/checkout", checkoutVisitor);

// 🔹 UPDATE VISITOR (e.g., for editing details)
router.put("/:id", updateVisitor);


export default router;