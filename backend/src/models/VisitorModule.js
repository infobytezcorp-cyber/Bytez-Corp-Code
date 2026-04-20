import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema({
  name: String,
  phone: String,
  purpose: String,
  checkInTime: Date,
  checkOutTime: Date,
  status: {
    type: String,
    default: "Checked-In",
  },
}, { timestamps: true });

export default mongoose.model("Visitor", visitorSchema);