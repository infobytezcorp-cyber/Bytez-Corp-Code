import mongoose from "mongoose";

const NursingCheckupSchema = new mongoose.Schema({
  visitorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  diagnosis: { type: String },
  treatment: { type: String },
  checkupDate: { type: Date, required: true },
  nextCheckup: { type: Date },
  notes: { type: String },
  recordedBy: { type: String },
}, { timestamps: true });

export default mongoose.model("NursingCheckup", NursingCheckupSchema);
