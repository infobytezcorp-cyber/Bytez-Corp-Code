import express from 'express';
import { Op } from 'sequelize';
const router = express.Router();
import Enquiry from '../models/EnquirySQLite.js';

/**
 * ENQUIRY ROUTES DOCUMENTATION
 * =============================
 * 
 * Valid Lead Values:
 * ------------------
 * Online Leads (10):
 *   - Website, Whatsapp, Facebook, Instagram, LinkedIn, Yellow page, Mail, Tawk.to, Meta Campaigns, Google Campaigns
 * 
 * Offline Leads - Referral (2):
 *   - Old clients, Existing clients
 * 
 * Offline Leads - Professional (3):
 *   - Doctor, Medical, Nurse
 * 
 * Offline Leads - Unprofessional (3):
 *   - Compounder, Electrician, Plumber
 * 
 * Offline Leads - Events & Stalls (3):
 *   - Camp, Stall, Event
 * 
 * Offline Leads - Business Partners (1):
 *   - Business partners
 * 
 * Total: 22 lead options across Online and Offline categories
 */

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
    let whereClause = {};

    // Date range filtering
    if (fromDate || toDate) {
      const dateFilter = {};
      
      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        dateFilter[Op.gte] = from;
      }
      
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (dateFilter[Op.gte]) {
          dateFilter[Op.and] = Op.lte(to);
        } else {
          dateFilter[Op.lte] = to;
        }
      }
      
      whereClause.createdAt = dateFilter;
    }

    const enquiries = await Enquiry.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    });
    
    res.json(enquiries);
  } catch (err) {
    console.error('❌ Get All Enquiries Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// 2. GET enquiries by client ID (all history)
router.get('/client/:clientId', async (req, res) => {
  try {
    const enquiries = await Enquiry.findAll({
      where: { clientId: req.params.clientId },
      order: [['createdAt', 'DESC']],
    });
    
    if (enquiries.length === 0) {
      return res.status(404).json({ message: 'No enquiries found for this client' });
    }
    
    res.json(enquiries);
  } catch (err) {
    console.error('❌ Get Client Enquiries Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// 3. GET single enquiry by ID
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

// 4. CREATE new enquiry entry (Google Form integration)
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
      lead: getStringValue(req.body.source || req.body.lead),
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

// 5. UPDATE enquiry by ID
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

// 6. DELETE enquiry by ID
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

// 7. FILTER enquiries by stage, lead, care type, and date
router.post('/filter', async (req, res) => {
  try {
    const { stage, lead, careType, fromDate, toDate } = req.body;
    let whereClause = {};

    if (stage) whereClause.stage = stage;
    if (lead) whereClause.lead = lead;
    if (careType) whereClause.careType = careType;

    // Date range filtering
    if (fromDate || toDate) {
      const dateFilter = {};
      
      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        dateFilter[Op.gte] = from;
      }
      
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        dateFilter[Op.lte] = to;
      }
      
      whereClause.createdAt = dateFilter;
    }

    const enquiries = await Enquiry.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    });

    res.json(enquiries);
  } catch (err) {
    console.error('❌ Filter Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;
