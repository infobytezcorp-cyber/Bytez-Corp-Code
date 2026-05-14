import express from 'express';
import mongoose from 'mongoose';
const router = express.Router();
import Enquiry from '../models/Enquiry.js'; // Ensure this is the Mongoose model
import Employee from '../models/Hr&Staff.js';
import Call from '../models/Call.js';
import { getAadharDocument, getEnquiriesCountByStage } from '../controllers/enquiryController.js';

const resolveEmployeeReference = async (staffId) => {
  if (!staffId) return null;
  const trimmed = String(staffId).trim();

  if (mongoose.Types.ObjectId.isValid(trimmed)) {
    const emp = await Employee.findById(trimmed);
    if (emp) return emp;
  }

  return await Employee.findOne({ id: trimmed });
};

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
    const { fromDate, toDate, stage, taskStatus } = req.query;
    let query = {};

    if (stage) query.stage = stage;
    if (taskStatus) query.taskStatus = taskStatus;

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

    // Enrich each enquiry with the most recent call (if any) matching phone or contact.phone
    const enriched = await Promise.all(enquiries.map(async (e) => {
      try {
        const phone = (e.phone || '').toString().replace(/\D/g, '').replace(/^91/, '');
        const call = await Call.findOne({
          $or: [ { number: { $regex: phone ? phone + '$' : '$' } }, { 'contact.phone': { $regex: phone ? phone + '$' : '$' } } ]
        }).sort({ createdAt: -1 }).populate('agent', 'name');

        const obj = e.toObject ? e.toObject() : { ...e };
        if (call) {
          obj.lastCall = call.createdAt || call.startTime || null;
          obj.lastCallAgent = call.agent ? { _id: call.agent._id, name: call.agent.name } : null;
        } else {
          obj.lastCall = null;
          obj.lastCallAgent = null;
        }
        return obj;
      } catch (err) {
        return e;
      }
    }));

    res.json(enriched);
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

// 2.5. GET enquiry counts by stage for dashboard
router.get('/counts', getEnquiriesCountByStage);

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
      assignedTo: req.body.assignedTo || null,
      assignedAt: req.body.assignedAt ? new Date(req.body.assignedAt) : null,
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

    if (!staffId) {
      return res.status(400).json({ message: 'staffId is required' });
    }

    const employee = await resolveEmployeeReference(staffId);
    if (!employee) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    const busyAssignment = await Enquiry.findOne({
      _id: { $ne: req.params.id },
      assignedTo: employee._id,
      taskStatus: 'In Progress',
    }).select('clientId elderName careType');

    if (busyAssignment) {
      return res.status(409).json({
        message: 'This staff member is already assigned to an active task',
        activeTask: busyAssignment,
      });
    }
    
    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { 
        assignedTo: employee._id,
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
    const existingEnquiry = await Enquiry.findById(req.params.id);
    if (!existingEnquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    if (existingEnquiry.assignedTo) {
      const busyAssignment = await Enquiry.findOne({
        _id: { $ne: req.params.id },
        assignedTo: existingEnquiry.assignedTo,
        taskStatus: 'In Progress',
      }).select('clientId elderName careType');

      if (busyAssignment) {
        return res.status(409).json({
          message: 'This staff member is already assigned to an active task',
          activeTask: busyAssignment,
        });
      }
    }

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
