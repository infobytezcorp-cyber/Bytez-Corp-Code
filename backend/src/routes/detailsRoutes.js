import express from "express";
import { getJobEnquiries, saveDetails } from "../controllers/detailsController.js";

const router = express.Router();

router.post("/", saveDetails);
router.get("/job", getJobEnquiries);

export default router;