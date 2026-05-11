// controllers/chatController.js

import Message from "../models/Message.js";
import path    from "path";

// ── GET /api/chat/history/:userId ─────────────────────────────────────────────
export const getHistory = async (req, res) => {
  try {
    const me    = req.user._id;
    const other = req.params.userId;
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 40;
    const skip  = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { senderId: me,    receiverId: other },
        { senderId: other, receiverId: me    },
      ],
      deletedFor: { $ne: me },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({ success: true, messages: messages.reverse(), page });
  } catch (err) {
    console.error("getHistory error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/chat/unread ──────────────────────────────────────────────────────
export const getUnread = async (req, res) => {
  try {
    const me = req.user._id;

    const counts = await Message.aggregate([
      { $match: { receiverId: me, read: false } },
      { $group: { _id: "$senderId", count: { $sum: 1 } } },
    ]);

    const unread = {};
    counts.forEach(c => { unread[c._id.toString()] = c.count; });

    res.json({ success: true, unread });
  } catch (err) {
    console.error("getUnread error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/chat/upload ─────────────────────────────────────────────────────
export const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const ext       = path.extname(req.file.originalname).toLowerCase();
  const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const fileType  = imageExts.includes(ext)
    ? "image"
    : ext === ".pdf"
      ? "pdf"
      : "other";

  res.json({
    success:  true,
    fileUrl:  `/uploads/chat/${req.file.filename}`,
    fileName: req.file.originalname,
    fileType,
  });
};

// ── DELETE /api/chat/message/:msgId ──────────────────────────────────────────
export const deleteMessage = async (req, res) => {
  try {
    const me  = req.user._id;
    const msg = await Message.findById(req.params.msgId);

    if (!msg) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    const isSender    = msg.senderId.toString() === me.toString();
    const withinLimit = Date.now() - new Date(msg.createdAt).getTime() < 5 * 60 * 1000;

    if (isSender && withinLimit) {
      await msg.deleteOne();
      return res.json({ success: true, deletedForAll: true });
    }

    await Message.findByIdAndUpdate(req.params.msgId, {
      $addToSet: { deletedFor: me },
    });

    res.json({ success: true, deletedForAll: false });
  } catch (err) {
    console.error("deleteMessage error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};