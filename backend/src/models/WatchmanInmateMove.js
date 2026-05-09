import mongoose from "mongoose";

const WatchmanInmateMoveSchema = new mongoose.Schema({
  inmateName: { type: String, required: true },
  inmateId: { type: String },
  fromLocation: { type: String, required: true },
  toLocation: { type: String, required: true },
  movedAt: { type: Date, required: true },
  escortedBy: { type: String },
  purpose: { type: String },
  recordedBy: { type: String },
}, { timestamps: true });

export default mongoose.model("WatchmanInmateMove", WatchmanInmateMoveSchema);
