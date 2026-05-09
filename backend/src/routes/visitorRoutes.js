import express from "express";
import { checkoutVisitor, getVisitorById, getVisitors, registerVisitor, updateVisitor, searchVisitor } from "../controllers/visitorController.js";


const router = express.Router();

// 🔹 SAVE VISITOR (CHECK-IN)
router.post("/", registerVisitor);

// 🔹 GET ALL VISITORS
router.get("/", getVisitors);

// 🔹 CRM SEARCH (by name or phone)
router.get("/search", searchVisitor);

// 🔹 GET VISITOR BY ID
router.get("/:id", getVisitorById);

// 🔹 CHECKOUT VISITOR
router.put("/:id/checkout", checkoutVisitor);

// 🔹 UPDATE VISITOR (e.g., for editing details)
router.put("/:id", updateVisitor);


export default router;