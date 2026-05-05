import mongoose from "mongoose";

const callLogSchema = new mongoose.Schema({
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agent"
  },
  calledAt: Date,
  duration: Number,
  status: String,
  remark: String,
  exotelSid: String
}, { _id: false });

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Unknown"
    },

    phone: {
      type: String,
      required: true,
      unique: true
    },

    email: String,

    status: {
      type: String,
      enum: ["new", "called", "interested", "not_interested"],
      default: "new"
    },

    callLogs: [callLogSchema]
  },
  { timestamps: true }
);

export default mongoose.model("Contact", contactSchema);