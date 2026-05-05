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
    personalDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    stageDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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
    contact: {
      type: String,
      default: "",
    },
    // Task fields for assignment and tracking
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    assignedAt: {
      type: Date,
    },
    taskDurationHours: {
      type: Number,
    },
    duration: {
      type: String,
      default: "",
    },
    taskStatus: {
      type: String,
      enum: ["New", "Unassigned", "In Progress", "Completed"],
      default: "New",
    },
    completedAt: {
      type: Date,
    },
    timeline: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    notes: {
      type: String,
      default: "",
    },
    documents: {
      aadharDocument: {
        fileName: {
          type: String,
          default: null,
        },
        fileSize: {
          type: Number,
          default: null,
        },
        fileType: {
          type: String,
          default: null,
        },
        data: {
          type: Buffer, // BSON Binary Data Type
          default: null,
        },
        uploadedAt: {
          type: Date,
          default: null,
        },
      },
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
