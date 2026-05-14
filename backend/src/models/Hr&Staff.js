import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
  // Personal Info
  name: { type: String, required: true },
  dob: { type: String },
  gender: { type: String, default: 'Male' },
  blood: { type: String },
  mobile: { type: String, required: true },
  email: { type: String },
  aadhaar: { type: String },
  qual: { type: String },
  address: { type: String, required: true },

  // Linked recruiter HR candidate
  recruiterHrId: { type: String },
  recruiterHrName: { type: String },

  // Employment Details
  id: { type: String, unique: true, required: true }, // Automatic-ah generate aagum
  dept: { type: String, required: true },
  service: { type: String, required: true },
  role: { type: String, required: true },
  doj: { type: String, required: true },
  emptype: { type: String, default: 'Full-Time' },
  shift: { type: String },
  salary: { type: Number },
  manager: { type: String },
  status: { type: String, default: 'Present' },

  // Emergency Contact
  emname: { type: String },
  emmobile: { type: String },
  emrel: { type: String },
  notes: { type: String },

  // Status tracking
  status: { type: String, default: 'Present' },
  isActive: { type: Boolean, default: true },
  deactivatedAt: { type: Date }
  
}, { timestamps: true });

if (mongoose.models.Employee) {
  delete mongoose.models.Employee;
}

export default mongoose.model('Employee', EmployeeSchema);
