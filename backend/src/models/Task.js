// const mongoose = require("mongoose");
// const Enquiry = mongoose.model("Enquiry", enquirySchema);
// const Staff   = mongoose.model("Staff", staffSchema);

import mongoose from 'mongoose'; 
// import Enquiry from "./Enquiry.js";
// import Staff from "./Staff.js";

// ═══════════════════════════════════════════════════════════
//  TASK SCHEMA
// ═══════════════════════════════════════════════════════════

const taskSchema = new mongoose.Schema(
  {
    // --- Basic Patient Info ---
    clientId: { type: String, default: null, trim: true },
    elderName:  { type: String, required: true, trim: true },
    phone:      { type: String, required: true, trim: true },
    careType:   { type: String, required: true, trim: true },
    lead:       { type: String, default: "N/A" },
    stage:      { 
      type: String, 
      default: "New", 
      enum: ["New", "Follow-Up", "Enrolled", "Closed", "Converted"] 
    },

    // --- Task Management Fields ---
    assignedTo:   { type: mongoose.Schema.Types.ObjectId, ref: "Staff", default: null },
    taskStatus:   { 
      type: String, 
      default: "Unassigned", 
      enum: ["Unassigned", "In Progress", "Completed"] 
    },
    duration:     { type: String, default: null },
    durationDays: { type: Number, default: null },
  },
  { timestamps: true }
);

// ═══════════════════════════════════════════════════════════
//  STAFF / HR SCHEMA
// ═══════════════════════════════════════════════════════════

// const staffSchema = new mongoose.Schema(
//   {
//     name:    { type: String, required: true, trim: true },
//     role:    { type: String, required: true, trim: true },
//     dept:    { 
//       type: String, 
//       required: true,
//       enum: ["homecare", "healthcare", "calls", "it", "nonit", "labour"] 
//     },
//     service: { type: String, required: true, trim: true },
//     email:   { type: String, default: "" },
//     phone:   { type: String, default: "" },
//   },
//   { timestamps: true }
// );

// ═══════════════════════════════════════════════════════════
//  EXPORT BOTH MODELS
// ═══════════════════════════════════════════════════════════

// const Enquiry = mongoose.model("Enquiry", enquirySchema);
// const Staff   = mongoose.model("Staff", staffSchema);

export default mongoose.model("Task", taskSchema);
