import mongoose from "mongoose";

const recruitLeadSchema = new mongoose.Schema(
  {
    source: { type: String, index: true },
    sourceId: { type: String, index: true },
    name: { type: String, trim: true, index: true },
    email: { type: String, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true, index: true },
    jobTitle: { type: String, trim: true },
    date: { type: Date },
    location: { type: String, trim: true },
    experience: { type: String, trim: true },
    education: { type: String, trim: true },
    jobLocation: { type: String, trim: true },
    status: { type: String, trim: true, enum: ['open','selected','rejected'], default: 'open', index: true },
    raw: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: "recruitleads" }
);

// Composite index to help deduplication (email/phone + source)
recruitLeadSchema.index({ source: 1, email: 1 }, { unique: false });
recruitLeadSchema.index({ source: 1, phone: 1 }, { unique: false });

const RecruitLead = mongoose.model("RecruitLead", recruitLeadSchema);
export default RecruitLead;
