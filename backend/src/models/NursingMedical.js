import mongoose from "mongoose";

const NursingMedicalSchema = new mongoose.Schema({
  visitorId: { type: String, required: true },
  medication: { type: String, required: true },
  dosage: { type: String },
  frequency: { type: String },
  administeredAt: { type: Date },
  notes: { type: String },
  recordedBy: { type: String },
}, { timestamps: true });

export default mongoose.model("NursingMedical", NursingMedicalSchema);
