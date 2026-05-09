import mongoose from "mongoose";

const WatchmanStaffInOutSchema = new mongoose.Schema({
  staffName: { type: String, required: true },
  staffId: { type: String },
  department: { type: String },
  inTime: { type: Date, required: true },
  outTime: { type: Date },
  purpose: { type: String },
  recordedBy: { type: String },
}, { timestamps: true });

export default mongoose.model("WatchmanStaffInOut", WatchmanStaffInOutSchema);
