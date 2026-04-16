// import mongoose from "mongoose";

// const EnquirySchema = new mongoose.Schema({
//   elderName: { 
//     type: String, 
//     required: [true, 'Elder Name is required'] 
//   },
//   familyName: { 
//     type: String 
//   },
//   phone: { 
//     type: String, 
//     required: [true, 'Phone number is required'] 
//   },
//   email: { 
//     type: String 
//   },
//   stage: { 
//     type: String, 
//     enum: ['New Enquiry', 'Contact', 'Pitching', 'Enrolled'], 
//     default: 'New Enquiry' 
//   },
//   source: { 
//     type: String, 
//     enum: ['Website', 'Telecaller', 'Tawk.to', 'Referral'], 
//     default: 'Website' 
//   },
//   careType: { 
//     type: String,
//     enum: [
//       'Home Nursing 12/7',
//       'Emergency Nurse 12/7',
//       'Old Age Home',
//       'Doctor @ Home',
//       'Ambulance Service',
//       'Home Sample Collection',
//       'Patient Care Attender 12/7',
//       'Cook 12/7',
//       'Diploma Nurse 24/7',
//       'Diploma Nurse 12/7',
//       'Baby Sitter 12/7',
//       'Patient Care Attender 24/7',
//       'Home Nursing 24/7',
//       'Emergency Nurse 24/7',
//       'Elder Care Service 24/7',
//       'Cook 24/7',
//       'Maid Staff 12/7',
//       'Maid Staff 24/7',
//       null, 
//       ''
//     ],
//     default: ''
//   },
//   timeline: [
//     {
//       event: { type: String },
//       date: { type: Date, default: Date.now }
//     }
//   ],
//   createdAt: { 
//     type: Date, 
//     default: Date.now 
//   }
// });

// export default  mongoose.model('Enquiry', EnquirySchema);


import mongoose from "mongoose";

const EnquirySchema = new mongoose.Schema({
  // Automatic-ah generate aaga pora Unique ID
  clientId: {
    type: String,
    unique: true
  },
  elderName: { 
    type: String, 
    required: [true, 'Elder Name is required'] 
  },
  familyName: { type: String },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'] 
  },
  email: { type: String },
  stage: { 
    type: String, 
    enum: ['New Enquiry', 'Contact', 'Pitching', 'Enrolled'], 
    default: 'New Enquiry' 
  },
    source: { 
    type: String, 
    enum: ['Website', 'Telecaller', 'Tawk.to', 'Referral', 'Google Form'], // ✅ 'Google Form' add pannunga
    default: 'Website' 
    },
  careType: { 
    type: String,
    default: ''
  },
  timeline: [
    {
      event: { type: String },
      date: { type: Date, default: Date.now }
    }
  ],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Auto-generate unique sequential Client ID
EnquirySchema.pre('save', async function (next) {
  if (this.isNew && !this.clientId) {
    try {
      // Simple approach: use timestamp + random
      const timestamp = Date.now().toString().slice(-5);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      this.clientId = `ENQ${timestamp}${random}`;
      console.log(`✅ Generated ClientID: ${this.clientId}`);
      next();
    } catch (error) {
      console.error('❌ ClientId generation error:', error.message);
      next(error);
    }
  } else {
    next();
  }
});

export default mongoose.model('Enquiry', EnquirySchema);