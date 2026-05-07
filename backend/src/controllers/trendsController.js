import Call from '../models/Call.js';
import Enquiry from '../models/Enquiry.js';
import mongoose from 'mongoose';

// Helper: normalize date to YYYY-MM-DD
const dateStr = (d) => new Date(d).toISOString().slice(0,10);

export const businessTrends = async (req, res) => {
  try {
    const { start, end } = req.query;
    const s = start ? new Date(start) : new Date(Date.now() - 7*24*3600*1000);
    const e = end ? new Date(end) : new Date();
    // include end of day
    e.setHours(23,59,59,999);

    // Calls: total, connected (status === 'completed'), totalDuration
    const calls = await Call.aggregate([
      { $match: { createdAt: { $gte: s, $lte: e } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalCalls: { $sum: 1 },
        connected: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        totalDuration: { $sum: { $ifNull: ['$duration', 0] } }
      } },
      { $sort: { _id: 1 } }
    ]);

    // Enquiries added per day
    const enquiriesAdded = await Enquiry.aggregate([
      { $match: { createdAt: { $gte: s, $lte: e } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Enquiries enrolled (stage changed to Enrolled) - use updatedAt
    const enquiriesEnrolled = await Enquiry.aggregate([
      { $match: { updatedAt: { $gte: s, $lte: e }, stage: 'Enrolled' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Enquiry sources
    const enquirySources = await Enquiry.aggregate([
      { $match: { createdAt: { $gte: s, $lte: e } } },
      { $group: { _id: '$lead', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Dropped/Lost enquiries - best-effort: look for stage values 'Lost' or 'Dropped'
    const dropped = await Enquiry.aggregate([
      { $match: { createdAt: { $gte: s, $lte: e }, stage: { $in: ['Lost', 'Dropped'] } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    return res.json({ calls, enquiriesAdded, enquiriesEnrolled, enquirySources, dropped });
  } catch (err) {
    console.error('businessTrends error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const usersTrends = async (req, res) => {
  try {
    const { start, end, agents } = req.query;
    const s = start ? new Date(start) : new Date(Date.now() - 7*24*3600*1000);
    const e = end ? new Date(end) : new Date();
    e.setHours(23,59,59,999);

    // parse agents query into ObjectId array (use `new` to construct ObjectId)
    let agentIds = null;
    if (agents) {
      agentIds = agents.split(',').map(s => s && s.trim()).filter(Boolean).map(a => {
        try { return new mongoose.Types.ObjectId(a); } catch (err) { return null; }
      }).filter(Boolean);
      if (agentIds.length === 0) agentIds = null;
    }

    // Calls per agent
    const matchCalls = { createdAt: { $gte: s, $lte: e } };
    if (agentIds) matchCalls.agent = { $in: agentIds };

    const callsByAgent = await Call.aggregate([
      { $match: matchCalls },
      { $group: { _id: '$agent', totalCalls: { $sum: 1 }, connected: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }, totalDuration: { $sum: { $ifNull: ['$duration', 0] } } } },
      { $lookup: { from: 'agents', localField: '_id', foreignField: '_id', as: 'agent' } },
      { $unwind: { path: '$agent', preserveNullAndEmptyArrays: true } },
      // fallback to 'Unassigned' when agent name is missing
      { $project: { agentId: '$_id', agentName: { $ifNull: ['$agent.name', 'Unassigned'] }, totalCalls: 1, connected: 1, totalDuration: 1 } }
    ]);

    // Enquiries pitched (assignedTo) vs enrolled per agent
    const matchEnq = { createdAt: { $gte: s, $lte: e } };
    if (agentIds) matchEnq.assignedTo = { $in: agentIds };

    const enquiriesByAgent = await Enquiry.aggregate([
      { $match: matchEnq },
      { $group: { _id: '$assignedTo', pitched: { $sum: 1 }, enrolled: { $sum: { $cond: [{ $eq: ['$stage', 'Enrolled'] }, 1, 0] } }, dropped: { $sum: { $cond: [{ $in: ['$stage', ['Lost','Dropped']] }, 1, 0] } } } },
      // assignedTo references Employee documents — lookup from employees collection
      { $lookup: { from: 'employees', localField: '_id', foreignField: '_id', as: 'agent' } },
      { $unwind: { path: '$agent', preserveNullAndEmptyArrays: true } },
      { $project: { agentId: '$_id', agentName: { $ifNull: ['$agent.name', 'Unassigned'] }, pitched: 1, enrolled: 1, dropped: 1 } }
    ]);

    return res.json({ callsByAgent, enquiriesByAgent });
  } catch (err) {
    console.error('usersTrends error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
