import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text:       { type: String, default: "" },
    fileUrl:    { type: String, default: null },   // attachment URL
    fileName:   { type: String, default: null },
    fileType:   { type: String, default: null },   // "image" | "pdf" | "other"
    read:       { type: Boolean, default: false },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // soft-delete
    reactions:  [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji:  { type: String },
      },
    ],
  },
  { timestamps: true }
);

// Index for fast conversation fetch
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ createdAt: -1 });

export default mongoose.model("Message", messageSchema);