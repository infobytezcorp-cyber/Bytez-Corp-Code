import mongoose from "mongoose";

const recruiterFormSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    age: { type: Number },
    dob: { type: Date },
    gender: { type: String, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    maritalStatus: { type: String, trim: true },
    guardianType: { type: String, trim: true },
    guardianName: { type: String, trim: true },
    guardianContact: { type: String, trim: true },
    permanentAddress: { type: String, trim: true },
    knownLanguages: [{ type: String, trim: true }],
    qualification: { type: String, trim: true },
    course: { type: String, trim: true },
    universityOrSchool: { type: String, trim: true },
    passOutYear: { type: String, trim: true },
    computerSkill: { type: Boolean },
    computerSkills: { type: String, trim: true },
    extraCurricular: { type: String, trim: true },
    fresherOrExperience: { type: String, trim: true },
    experienceLength: { type: String, trim: true },
    companyName: { type: String, trim: true },
    hrContact: { type: String, trim: true },
    previousRole: { type: String, trim: true },
    previousSalary: { type: String, trim: true },
    previousWorkingTime: { type: String, trim: true },
    aadharPhoto: { type: String }, // base64 or URL
    recentPhoto: { type: String },
    drivingLicense: { type: String },
    jobLookingFor: { type: String, trim: true },
    expectedSalary: { type: String, trim: true },
    expectedWorkingTime: { type: String, trim: true },
    planningDurationType: { type: String, trim: true }, // short-term/long-term
    shortTermOption: { type: String, trim: true },
    longTermOption: { type: String, trim: true },
    resume: { type: String },
    status: { type: String, trim: true, enum: ["open", "selected", "rejected"], default: "open", index: true },
    raw: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: "recruiter_forms" }
);

const RecruiterForm = mongoose.model("RecruiterForm", recruiterFormSchema);
export default RecruiterForm;
