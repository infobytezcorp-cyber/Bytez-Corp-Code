import mongoose from "mongoose";

const AdminStockSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    enum: ["food", "non-food", "medicine", "equipment", "other"],
    default: "other",
    required: true,
  },

  operation: {
    type: String,
    enum: ["received", "used"],
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
  },

  unit: {
    type: String,
    default: "pcs",
  },

  date: {
    type: Date,
    required: true,
  },

  expiryDate: {
    type: Date,
  },

  patientName: {
    type: String,
  },

  patientId: {
    type: String,
  },

  purpose: {
    type: String,
  },

  status: {
    type: String,
    default: "Pending",
  },

  remarks: {
    type: String,
  },

  recordedBy: {
    type: String,
  },

}, { timestamps: true });

export default mongoose.model("AdminStock", AdminStockSchema);