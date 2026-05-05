import express from 'express';
import WhatsAppLead from '../models/WhatsAppLead.js';

const router = express.Router();

// GET list, optional fromDate/toDate query params (ISO date strings)
router.get('/', async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const q = {};
    if (fromDate || toDate) q.createdAt = {};
    if (fromDate) q.createdAt.$gte = new Date(fromDate);
    if (toDate) q.createdAt.$lte = new Date(toDate);

    const docs = await WhatsAppLead.find(q).sort({ createdAt: -1 }).limit(1000).lean();
    res.json(docs);
  } catch (err) {
    console.error('WhatsAppLead list error', err);
    res.status(500).send('Error');
  }
});

export default router;
