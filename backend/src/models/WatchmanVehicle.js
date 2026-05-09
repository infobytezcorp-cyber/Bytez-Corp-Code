import mongoose from "mongoose";

const WatchmanVehicleSchema = new mongoose.Schema({
  visitorId: { type: String },
  vehicleNumber: { type: String, required: true },
  vehicleType: { type: String },
  purpose: { type: String },
  driverName: { type: String },
  inTime: { type: Date, required: true },
  outTime: { type: Date },
  recordedBy: { type: String },
}, { timestamps: true });

export default mongoose.model("WatchmanVehicle", WatchmanVehicleSchema);
