import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      unique: false,
      sparse: true,
      index: true,
    },
    elderName: {
      type: String,
      required: [true, "Elder Name is required"],
      trim: true,
    },
    familyName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      index: true,
    },
    aadhaar: {
      type: String,
      validate: {
        validator: function (value) {
          return !value || value.length === 12;
        },
        message: "Aadhar must be 12 digits",
      },
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    stage: {
      type: String,
      default: "New Enquiry",
    },
    lead: {
      type: String,
      default: "",
    },
    careType: {
      type: String,
      default: "",
    },
    timeline: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    notes: {
      type: String,
      default: "",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "enquiries",
  }
);

// Pre-save hook to auto-generate clientId (deterministic based on phone + aadhaar)
// enquirySchema.pre("save", async function (next) {
//   // Only generate a hash if clientId wasn't already provided by the controller
//   if (!this.clientId) {
//     const crypto = await import("crypto");
//     const baseString = `${this.phone}${this.aadhaar || ""}`;
//     const hash = crypto
//       .createHash("sha256")
//       .update(baseString)
//       .digest("hex")
//       .substring(0, 8)
//       .toUpperCase();
//     this.clientId = `ENQ${hash}`;
//   }
//   next();
// });
enquirySchema.pre("save", async function () {
  if (!this.clientId) {
    const crypto = await import("crypto");
    const baseString = `${this.phone}${this.aadhaar || ""}`;
    const hash = crypto
      .createHash("sha256")
      .update(baseString)
      .digest("hex")
      .substring(0, 8)
      .toUpperCase();
    
    this.clientId = `ENQ${hash}`;
    console.log(`✨ Generated ClientID: ${this.clientId}`);
  }
});

const Enquiry = mongoose.model("Enquiry", enquirySchema);
export default Enquiry;