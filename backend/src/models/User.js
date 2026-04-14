import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true // ✅ change this
  },
  role: {
    type: String,
    enum: ["admin", "manager", "user"],
    default: "user"
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);