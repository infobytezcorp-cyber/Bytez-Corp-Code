import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    number: String,

    type: {
      type: String,
      enum: ["incoming", "outgoing"]
    },

    status: {
      type: String,
      enum: ["incoming", "assigned", "in_progress", "completed", "missed", "callback_done"],
      default: "incoming"
    },

    // Current agent handling the call
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      default: null
    },

    // ← NEW: Original agent the call was assigned to
    // Even if call becomes missed, this field retains who was responsible
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      default: null
    },

    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
      default: null
    },

    autoAssign: {
      type: Boolean,
      default: true
    },

    exotelSid: {
      type: String,
      default: null
    },

    startTime: {
      type: Date,
      default: Date.now
    },

    endTime: Date,
    duration: Number
  },
  { timestamps: true }
);

callSchema.index({ status: 1 });
callSchema.index({ agent: 1 });
callSchema.index({ assignedTo: 1 });   // ← index for missed call queries
callSchema.index({ contact: 1 });
callSchema.index({ createdAt: -1 });   // ← for day-wise filtering

export default mongoose.model("Call", callSchema);