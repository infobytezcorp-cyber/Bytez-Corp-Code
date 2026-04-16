import express from 'express';
const router = express.Router();
import Enquiry from '../models/EnquirySQLite.js';

// Helper: Convert array values to comma-separated strings
const getStringValue = (value) => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return value || '';
};

// 1. GET all enquiries (sorted by createdAt descending)
router.get('/', async (req, res) => {
  try {
    const enquiries = await Enquiry.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json(enquiries);
  } catch (err) {
    console.error('❌ Get All Enquiries Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// 2. GET single enquiry by ID
router.get('/:id', async (req, res) => {
  try {
    const enquiry = await Enquiry.findByPk(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }
    res.json(enquiry);
  } catch (err) {
    console.error('❌ Get Enquiry Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// 3. CREATE new enquiry entry (Google Form integration)
// Each submission creates a NEW ROW (multiple rows per client)
// Same user (phone+aadhaar) reuses the SAME clientId
router.post('/', async (req, res) => {
  try {
    let clientId = null;
    const { phone, aadhaar, elderName, stage } = req.body;

    // 1. Look for existing client to link rows
    if (phone && aadhaar) {
      const existingClient = await Enquiry.findOne({
        where: { phone, aadhaar },
        order: [['createdAt', 'DESC']]
      });

      if (existingClient) {
        clientId = existingClient.clientId;
      }
    }

    // 2. Always create a NEW row for every submission
    const newEntry = await Enquiry.create({
      clientId: clientId, // Hook handles generation if this is null
      elderName: elderName,
      familyName: req.body.familyName || null,
      phone: phone,
      aadhaar: aadhaar || null,
      email: req.body.email || null,
      careType: getStringValue(req.body.careType),
      source: getStringValue(req.body.source),
      stage: stage || 'New Enquiry',
      timeline: [{ 
        event: `Stage Recorded: ${stage || 'New Enquiry'}`, 
        date: new Date().toISOString() 
      }],
    });

    console.log(`✅ New Row Created | Client: ${newEntry.clientId} | Stage: ${newEntry.stage}`);
    res.status(201).json(newEntry);

  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(400).json({ message: err.message });
  }
});
// 4. UPDATE enquiry by ID
router.put('/:id', async (req, res) => {
  try {
    const enquiry = await Enquiry.findByPk(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    await enquiry.update(req.body);
    console.log('✅ Enquiry Updated. ID:', enquiry.id);
    res.json(enquiry);
  } catch (err) {
    console.error('❌ Update Error:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// 5. DELETE enquiry by ID
router.delete('/:id', async (req, res) => {
  try {
    const enquiry = await Enquiry.findByPk(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    await enquiry.destroy();
    console.log('✅ Enquiry Deleted. ID:', req.params.id);
    res.json({ message: 'Enquiry deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Error:', err.message);
    res.status(400).json({ message: err.message });
  }
});

export default router;
