// const mongoose = require('mongoose');
import mongoose from 'mongoose'; 
const staffSchema = new mongoose.Schema({
  empId:   { type: String, default: "" },   
  name:    { type: String, required: true, trim: true },
  role:    { type: String, required: true, trim: true },
  dept:    { type: String, required: true, enum: ["homecare","healthcare","calls","it","nonit","labour"] },
  service: { type: String, required: true, trim: true },
  email:   { type: String, default: "" },
  phone:   { type: String, default: "" },

  status: { type: String, default: 'Present' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Staff', staffSchema);