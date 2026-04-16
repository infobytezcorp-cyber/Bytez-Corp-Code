import mongoose from "mongoose";

const visitDetailsSchema = new mongoose.Schema({

  // 🔗 Link with Visitor (OTP record)
  visitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Visitor",
    required: true
  },

  // 🔹 Type
  visitType: {
    type: String,
    enum: ["visitor", "job"],
    required: true
  },

  // 🔹 Personal Info
  name: String,          // optional duplicate (for quick access)
  phone: String,         // optional duplicate
  email: String,
  authorNumber: String,
  bloodGroup: String,

  // 🔹 Visitor Fields
  purpose: String,
  visitPerson: String,

  // 🔹 Job Fields
  jobRole: String,
  experience: String,

  // 🔹 Address
  address: String,

}, { timestamps: true });

export default mongoose.model("VisitDetails", visitDetailsSchema);