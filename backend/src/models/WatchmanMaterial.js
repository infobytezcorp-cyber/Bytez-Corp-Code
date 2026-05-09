import mongoose from "mongoose";

const WatchmanMaterialSchema = new mongoose.Schema({
  visitorId: { type: String },
  item: { type: String, required: true },
  quantity: { type: String, required: true },
  inOut: { type: String, enum: ["in", "out"], required: true },
  purpose: { type: String },
  loggedAt: { type: Date, required: true },
  recordedBy: { type: String },
}, { timestamps: true });

export default mongoose.model("WatchmanMaterial", WatchmanMaterialSchema);
