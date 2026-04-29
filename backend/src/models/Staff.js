// const mongoose = require('mongoose');
import mongoose from 'mongoose'; 
const staffSchema = new mongoose.Schema({
  empId:   { type: String, default: "" },   // ← இதை add பண்ணு
  name:    { type: String, required: true, trim: true },
  role:    { type: String, required: true, trim: true },
  dept:    { type: String, required: true, enum: ["homecare","healthcare","calls","it","nonit","labour"] },
  service: { type: String, required: true, trim: true },
  email:   { type: String, default: "" },
  phone:   { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model('Staff', staffSchema);