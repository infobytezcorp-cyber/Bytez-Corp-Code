// routes/chat.js

import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
    getHistory,
    getUnread,
    uploadFile,
    deleteMessage,
} from "../controllers/chatController.js";

const router = express.Router();
router.use(verifyToken);

// Multer setup (file upload middleware) 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = "uploads/chat";
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
        cb(null, name);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// Routes 
router.get("/history/:userId", getHistory);
router.get("/unread", getUnread);
router.post("/upload", upload.single("file"), uploadFile);
router.delete("/message/:msgId", deleteMessage);

export default router;