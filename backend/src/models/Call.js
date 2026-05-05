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
      enum: [
        "incoming",
        "assigned",
        "in_progress",
        "completed",
        "missed",
        "callback_done"
      ],
      default: "incoming"
    },

    agent: {
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

// performance
callSchema.index({ status: 1 });
callSchema.index({ agent: 1 });
callSchema.index({ contact: 1 });

export default mongoose.model("Call", callSchema);