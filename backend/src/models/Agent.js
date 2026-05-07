// Agent Model

import mongoose from "mongoose";

const agentSchema = new mongoose.Schema({
  name: String,
  status: {
    type: String,
    enum: ["offline", "busy", "break", "available", "ringing"],
    default: "offline"
  },
  linkedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  phone: String,
  lastCallTime: {
    type: Date,
    default: null
  },
  breakStartTime: {
    type: Date,
    default: null
  },
  totalBreakMinutes: {
    type: Number,
    default: 0
  },
  breakLogs: [{
    breakStart: Date,
    breakEnd: Date,
    durationMinutes: Number
  }],
  loginTime: {
    type: Date,
    default: null
  },
  logoutTime: Date,
  loginHistory: [
  {
    loginTime: Date,
    logoutTime: Date,
    durationMinutes: Number
  }
]
}, { timestamps: true });

export default mongoose.model("Agent", agentSchema);