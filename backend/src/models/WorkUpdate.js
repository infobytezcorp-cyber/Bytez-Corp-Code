import mongoose from 'mongoose';

const workUpdateSchema = new mongoose.Schema({
  // Reference to staff member
  staffId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee',
    default: null
  },
  staffEmpId: { 
    type: String, 
    required: true,
    index: true 
  },
  staffName: { 
    type: String, 
    required: true 
  },

  // Work details
  taskId: { 
    type: String, 
    default: null 
  },
  taskTitle: {
    type: String,
    default: ""
  },
  workDescription: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 1000
  },
  duration: { 
    type: Number, 
    required: true, 
    min: 1,
    max: 60
  }, // in minutes
  workType: { 
    type: String, 
    enum: ['Patient Visit', 'Call', 'Documentation', 'Travel', 'Other'],
    default: 'Other'
  },
  
  // Proof/Attachment
  proofAttachments: [
    {
      fileName: String,
      fileType: String,
      fileSize: Number,
      data: Buffer, // Base64 encoded file
      uploadedAt: { type: Date, default: Date.now },
      description: String
    }
  ],

  // Location tracking
  locationCoordinates: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    address: String
  },

  // Status
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },

  // Admin review
  adminRemarks: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  approvedAt: Date,

  // Timestamps
  submittedAt: { type: Date, default: Date.now, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  collection: 'workupdates'
});

// Index for efficient queries
workUpdateSchema.index({ staffEmpId: 1, submittedAt: -1 });
workUpdateSchema.index({ taskId: 1, submittedAt: -1 });
workUpdateSchema.index({ status: 1, submittedAt: -1 });
workUpdateSchema.index({ createdAt: -1 });

export default mongoose.model('WorkUpdate', workUpdateSchema);
