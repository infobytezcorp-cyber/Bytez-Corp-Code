// import express from 'express';
// import { Op } from 'sequelize';
// const router = express.Router();
// import Enquiry from '../models/Enquiry.js';

// // Helper: Convert array values to comma-separated strings
// const getStringValue = (value) => {
//   if (Array.isArray(value)) {
//     return value.join(', ');
//   }
//   return value || '';
// };

// // 1. GET all enquiries with date range filtering
// router.get('/', async (req, res) => {
//   try {
//     const { fromDate, toDate } = req.query;
//     let whereClause = {};

//     // Date range filtering
//     if (fromDate || toDate) {
//       const dateFilter = {};
      
//       if (fromDate) {
//         const from = new Date(fromDate);
//         from.setHours(0, 0, 0, 0);
//         dateFilter[Op.gte] = from;
//       }
      
//       if (toDate) {
//         const to = new Date(toDate);
//         to.setHours(23, 59, 59, 999);
//         if (dateFilter[Op.gte]) {
//           dateFilter[Op.and] = Op.lte(to);
//         } else {
//           dateFilter[Op.lte] = to;
//         }
//       }
      
//       whereClause.createdAt = dateFilter;
//     }

//     const enquiries = await Enquiry.findAll({
//       where: whereClause,
//       order: [['createdAt', 'DESC']],
//     });
    
//     res.json(enquiries);
//   } catch (err) {
//     console.error('❌ Get All Enquiries Error:', err.message);
//     res.status(500).json({ message: err.message });
//   }
// });

// // 2. GET enquiries by client ID (all history)
// router.get('/client/:clientId', async (req, res) => {
//   try {
//     const enquiries = await Enquiry.findAll({
//       where: { clientId: req.params.clientId },
//       order: [['createdAt', 'DESC']],
//     });
    
//     if (enquiries.length === 0) {
//       return res.status(404).json({ message: 'No enquiries found for this client' });
//     }
    
//     res.json(enquiries);
//   } catch (err) {
//     console.error('❌ Get Client Enquiries Error:', err.message);
//     res.status(500).json({ message: err.message });
//   }
// });

// // 3. GET single enquiry by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const enquiry = await Enquiry.findByPk(req.params.id);
//     if (!enquiry) {
//       return res.status(404).json({ message: 'Enquiry not found' });
//     }
//     res.json(enquiry);
//   } catch (err) {
//     console.error('❌ Get Enquiry Error:', err.message);
//     res.status(500).json({ message: err.message });
//   }
// });

// // 4. CREATE new enquiry
// router.post('/', async (req, res) => {
//   try {
//     let clientId = null;
//     const { phone, aadhaar, elderName, stage } = req.body;

//     // 1. Look for existing client to link rows
//     if (phone && aadhaar) {
//       const existingClient = await Enquiry.findOne({
//         where: { phone, aadhaar },
//         order: [['createdAt', 'DESC']]
//       });

//       if (existingClient) {
//         clientId = existingClient.clientId;
//       }
//     }

//     // 2. Always create a NEW row for every submission
//     const newEntry = await Enquiry.create({
//       clientId: clientId, // Hook handles generation if this is null
//       elderName: elderName,
//       familyName: req.body.familyName || null,
//       phone: phone,
//       aadhaar: aadhaar || null,
//       email: req.body.email || null,
//       careType: getStringValue(req.body.careType),
//       lead: getStringValue(req.body.source || req.body.lead),
//       stage: stage || 'New Enquiry',
//       timeline: [{ 
//         event: `Stage Recorded: ${stage || 'New Enquiry'}`, 
//         date: new Date().toISOString() 
//       }],
//     });

//     console.log(`✅ New Row Created | Client: ${newEntry.clientId} | Stage: ${newEntry.stage}`);
//     res.status(201).json(newEntry);

//   } catch (err) {
//     console.error('❌ Error:', err.message);
//     res.status(400).json({ message: err.message });
//   }
// });

// // 5. UPDATE enquiry by ID
// router.put('/:id', async (req, res) => {
//   try {
//     const enquiry = await Enquiry.findByPk(req.params.id);
//     if (!enquiry) {
//       return res.status(404).json({ message: 'Enquiry not found' });
//     }

//     await enquiry.update(req.body);
//     console.log('✅ Enquiry Updated. ID:', enquiry.id);
//     res.json(enquiry);
//   } catch (err) {
//     console.error('❌ Update Error:', err.message);
//     res.status(400).json({ message: err.message });
//   }
// });

// // 6. DELETE enquiry by ID
// router.delete('/:id', async (req, res) => {
//   try {
//     const enquiry = await Enquiry.findByPk(req.params.id);
//     if (!enquiry) {
//       return res.status(404).json({ message: 'Enquiry not found' });
//     }
//     await enquiry.destroy();
//     console.log('✅ Enquiry Deleted. ID:', req.params.id);
//     res.json({ message: 'Enquiry deleted successfully' });
//   } catch (err) {
//     console.error('❌ Delete Error:', err.message);
//     res.status(400).json({ message: err.message });
//   }
// });

// // 7. FILTER enquiries by stage, lead, care type, and date
// router.post('/filter', async (req, res) => {
//   try {
//     const { stage, lead, careType, fromDate, toDate } = req.body;
//     let whereClause = {};

//     if (stage) whereClause.stage = stage;
//     if (lead) whereClause.lead = lead;
//     if (careType) whereClause.careType = careType;

//     // Date range filtering
//     if (fromDate || toDate) {
//       const dateFilter = {};
      
//       if (fromDate) {
//         const from = new Date(fromDate);
//         from.setHours(0, 0, 0, 0);
//         dateFilter[Op.gte] = from;
//       }
      
//       if (toDate) {
//         const to = new Date(toDate);
//         to.setHours(23, 59, 59, 999);
//         dateFilter[Op.lte] = to;
//       }
      
//       whereClause.createdAt = dateFilter;
//     }

//     const enquiries = await Enquiry.findAll({
//       where: whereClause,
//       order: [['createdAt', 'DESC']],
//     });

//     res.json(enquiries);
//   } catch (err) {
//     console.error('❌ Filter Error:', err.message);
//     res.status(500).json({ message: err.message });
//   }
// });

// export default router;


import express from 'express';
const router = express.Router();
import Enquiry from '../models/Enquiry.js'; // Ensure this is the Mongoose model
import { getAadharDocument } from '../controllers/enquiryController.js';

// Helper: Convert array values to comma-separated strings
const getStringValue = (value) => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return value || '';
};

// 1. GET all enquiries with date range filtering
router.get('/', async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    let query = {};

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        query.createdAt.$gte = from;
      }
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        query.createdAt.$lte = to;
      }
    }

    const enquiries = await Enquiry.find(query).sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    console.error('❌ Get All Enquiries Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// 2. GET enquiries by client ID
router.get('/client/:clientId', async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ clientId: req.params.clientId }).sort({ createdAt: -1 });
    
    if (enquiries.length === 0) {
      return res.status(404).json({ message: 'No enquiries found for this client' });
    }
    
    res.json(enquiries);
  } catch (err) {
    console.error('❌ Get Client Enquiries Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// 3. GET single enquiry by MongoDB ID
router.get('/:id', async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }
    res.json(enquiry);
  } catch (err) {
    console.error('❌ Get Enquiry Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// 4. CREATE new enquiry
router.post('/', async (req, res) => {
  try {
    let clientId = null;
    const { phone, aadhaar, elderName, stage } = req.body;

    // Look for existing client
    if (phone && aadhaar) {
      const existingClient = await Enquiry.findOne({ phone, aadhaar }).sort({ createdAt: -1 });
      if (existingClient) {
        clientId = existingClient.clientId;
      }
    }

    const newEntry = new Enquiry({
      clientId: clientId, // Mongoose hook handles generation if null
      elderName: elderName,
      familyName: req.body.familyName || null,
      phone: phone,
      aadhaar: aadhaar || null,
      email: req.body.email || null,
      personalDetails: req.body.personalDetails || {},
      stageDetails: req.body.stageDetails || {},
      careType: getStringValue(req.body.careType),
      lead: getStringValue(req.body.source || req.body.lead),
      stage: stage || 'New Enquiry',
      notes: req.body.notes || '',
      timeline: [{ 
        event: `Stage Recorded: ${stage || 'New Enquiry'}`, 
        date: new Date().toISOString() 
      }, ...(req.body.timeline || [])],
    });

    await newEntry.save();
    console.log(`✅ New MongoDB Row Created | Client: ${newEntry.clientId}`);
    res.status(201).json(newEntry);
  } catch (err) {
    console.error('❌ Create Error:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// 5. UPDATE enquiry by ID
router.put('/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    const aadharDoc =
      updates['stageDetails.stage3']?.aadharDocument ||
      updates.stageDetails?.stage3?.aadharDocument;

    if (aadharDoc?.data) {
      const base64String = typeof aadharDoc.data === 'string' && aadharDoc.data.includes(',')
        ? aadharDoc.data.split(',')[1]
        : aadharDoc.data;
      const binaryData = Buffer.from(base64String, 'base64');

      updates.documents = {
        ...(updates.documents || {}),
        aadharDocument: {
          fileName: aadharDoc.name || aadharDoc.fileName || 'aadhar-document',
          fileSize: aadharDoc.size || binaryData.length,
          fileType: aadharDoc.type || aadharDoc.fileType || 'application/octet-stream',
          data: binaryData,
          uploadedAt: new Date(),
        },
      };

      if (updates['stageDetails.stage3']) {
        delete updates['stageDetails.stage3'].aadharDocument;
      }
      if (updates.stageDetails?.stage3) {
        delete updates.stageDetails.stage3.aadharDocument;
      }
    }

    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { returnDocument: "after", runValidators: true }
    );

    if (!updatedEnquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    console.log('✅ Enquiry Updated in MongoDB:', updatedEnquiry._id);
    res.json(updatedEnquiry);
  } catch (err) {
    console.error('❌ Update Error:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// 6. DELETE enquiry by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedEnquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!deletedEnquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }
    console.log('✅ Enquiry Deleted from MongoDB:', req.params.id);
    res.json({ message: 'Enquiry deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Error:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// 7. FILTER enquiries
router.post('/filter', async (req, res) => {
  try {
    const { stage, lead, careType, fromDate, toDate } = req.body;
    let query = {};

    if (stage) query.stage = stage;
    if (lead) query.lead = lead;
    if (careType) query.careType = careType;

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        query.createdAt.$gte = from;
      }
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        query.createdAt.$lte = to;
      }
    }

    const enquiries = await Enquiry.find(query).sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    console.error('❌ Filter Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// 8. ASSIGN task to staff
router.post('/:id/assign', async (req, res) => {
  try {
    const { staffId, durationHours, duration } = req.body;
    
    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { 
        assignedTo: staffId,
        taskStatus: 'In Progress',
        assignedAt: new Date(),
        durationHours: durationHours,
        duration: duration || ''
      },
      { returnDocument: "after", runValidators: true }
    );

    if (!updatedEnquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    console.log('✅ Task Assigned:', updatedEnquiry._id);
    res.json(updatedEnquiry);
  } catch (err) {
    console.error('❌ Assign Error:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// 9. COMPLETE task
router.post('/:id/complete', async (req, res) => {
  try {
    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { 
        taskStatus: 'Completed',
        completedAt: new Date()
      },
      { returnDocument: "after", runValidators: true }
    );

    if (!updatedEnquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    console.log('✅ Task Completed:', updatedEnquiry._id);
    res.json(updatedEnquiry);
  } catch (err) {
    console.error('❌ Complete Error:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// 10. REOPEN task
router.post('/:id/reopen', async (req, res) => {
  try {
    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { 
        taskStatus: 'In Progress',
        reopenedAt: new Date()
      },
      { returnDocument: "after" }
    );

    if (!updatedEnquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    console.log('✅ Task Reopened:', updatedEnquiry._id);
    res.json(updatedEnquiry);
  } catch (err) {
    console.error('❌ Reopen Error:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// 17. GET Aadhar Document
router.get('/:id/document/aadhar', getAadharDocument);

export default router;
