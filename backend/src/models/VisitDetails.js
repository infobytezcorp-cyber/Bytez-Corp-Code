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
  name: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    match: [/^\d{10}$/, "Invalid phone number"]
  },

  email: {
    type: String,
    match: [/.+@.+\..+/, "Invalid email address"]
  },

  aadhaarnumber : {
    type: String,
    match: [/^\d{12}$/, "Invalid Aadhaar number"]
  },

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
