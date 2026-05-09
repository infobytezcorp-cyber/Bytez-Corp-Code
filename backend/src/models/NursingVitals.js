import mongoose from "mongoose";

const NursingVitalsSchema = new mongoose.Schema({
  visitorId: { type: String, required: true },
  temperature: { type: Number, required: true },
  bloodPressure: { type: String, required: true },
  pulse: { type: Number, required: true },
  respiration: { type: Number, required: true },
  notes: { type: String },
  recordedBy: { type: String },
}, { timestamps: true });

export default mongoose.model("NursingVitals", NursingVitalsSchema);
