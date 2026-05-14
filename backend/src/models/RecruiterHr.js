import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema(
  {
    companyName: { type: String, trim: true },
    duration: { type: String, trim: true },
    certificate: { type: String },
  },
  { _id: false }
);

const recruiterHrSchema = new mongoose.Schema(
  {
    recruiterFormId: { type: mongoose.Schema.Types.ObjectId, ref: "RecruiterForm", index: true },
    name: { type: String, trim: true },
    contactNumber: { type: String, trim: true },
    whatsappNumber: { type: String, trim: true },
    guardianName: { type: String, trim: true },
    guardianContactNumber: { type: String, trim: true },
    aadhaarNumber: { type: String, trim: true },
    location: { type: String, trim: true },
    tenthPercentage: { type: String, trim: true },
    twelfthPercentage: { type: String, trim: true },
    qualification: { type: String, trim: true },
    collegeName: { type: String, trim: true },
    cgpa: { type: String, trim: true },
    domain: { type: String, trim: true },
    skills: { type: String, trim: true },
    experience: { type: String, trim: true },
    previousCompanyName: { type: String, trim: true },
    previousCompanyHrName: { type: String, trim: true },
    previousCompanyHrContactNumber: { type: String, trim: true },
    internships: { type: [internshipSchema], default: [] },
    resume: { type: String },
    status: { type: String, enum: ["selected", "rejected"], default: "selected" },
  },
  { timestamps: true, collection: "recruiter_hr" }
);

const RecruiterHr = mongoose.model("RecruiterHr", recruiterHrSchema);
export default RecruiterHr;
