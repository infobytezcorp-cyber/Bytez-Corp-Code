import express from "express";
import { getJobEnquiries, getNormalEnquiries, saveDetails } from "../controllers/detailsController.js";

const router = express.Router();

router.post("/", saveDetails);
router.get("/job", getJobEnquiries);
router.get("/visitor", getNormalEnquiries);

export default router;