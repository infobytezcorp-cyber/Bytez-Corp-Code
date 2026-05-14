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
    elderName:  { type: String, default: "", trim: true },
    phone:      { type: String, default: "", trim: true },
    careType:   { type: String, default: "", trim: true },
    lead:       { type: String, default: "N/A" },
    stage:      { 
      type: String, 
      default: "New", 
      enum: ["New", "Follow-Up", "Enrolled", "Closed", "Converted"] 
    },

    // --- Task Metadata ---
    title:        { type: String, default: "", trim: true },
    description:  { type: String, default: "", trim: true },
    priority:     { type: String, default: "Medium", enum: ["High", "Medium", "Low"] },
    dueDate:      { type: String, default: "" },
    dueTime:      { type: String, default: "" },
    adminNotes:   { type: String, default: "", trim: true },
    staffRemark:  { type: String, default: "", trim: true },
    attachments: [{
      name:       { type: String, default: "" },
      type:       { type: String, default: "" },
      url:        { type: String, default: "" },
      size:       { type: Number, default: 0 },
      uploadedBy: { type: String, default: "" },
      uploadedAt: { type: String, default: "" },
    }],
    assignedBy:       { type: String, default: "Admin" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
    assignedToEmpId:   { type: String, default: null, trim: true },
    assignedToName:    { type: String, default: "" },
    assignedToPhone:   { type: String, default: "" },
    assignedAt:        { type: Date, default: null },
    status:            { 
      type: String, 
      default: "Pending", 
      enum: ["Pending", "In Progress", "Done", "Completed", "Rejected"] 
    },
    lastWorkUpdateAt: { type: Date, default: null },
    nextUpdateDueAt: { type: Date, default: null },
    hourlyUpdateIntervalMinutes: { type: Number, default: 60 },
    updateAlertStatus: {
      type: String,
      default: "OK",
      enum: ["OK", "Missed"]
    },
    updateAlertedAt: { type: Date, default: null },
    duration:     { type: String, default: null },
    durationDays: { type: Number, default: null },
    completedAt:  { type: Date, default: null },
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
