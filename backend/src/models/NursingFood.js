import mongoose from "mongoose";

const NursingFoodSchema = new mongoose.Schema({
  visitorId: { type: String, required: true },
  mealType: { type: String, required: true },
  items: { type: String, required: true },
  quantity: { type: String },
  servedAt: { type: Date },
  notes: { type: String },
  recordedBy: { type: String },
}, { timestamps: true });

export default mongoose.model("NursingFood", NursingFoodSchema);
