import express from 'express';
import mongoose from 'mongoose';
import WorkUpdate from '../models/WorkUpdate.js';
import Task from '../models/Task.js';
import Employee from '../models/Hr&Staff.js';

const router = express.Router();
const UPDATE_INTERVAL_MINUTES = 60;

const normalizeEmpId = (value) => String(value || '').trim().toUpperCase();

const getTaskIdValue = (taskId) => {
  if (!taskId) return null;
  if (typeof taskId === 'object') return String(taskId._id || taskId.id || '').trim() || null;
  return String(taskId).trim() || null;
};

const buildMissedAlertQuery = ({ staffEmpId } = {}) => {
  const oneHourAgo = new Date(Date.now() - UPDATE_INTERVAL_MINUTES * 60 * 1000);
  const query = {
    status: { $nin: ['Done', 'Completed', 'Rejected'] },
    assignedToEmpId: { $nin: [null, ''] },
    $or: [
      { lastWorkUpdateAt: null, assignedAt: { $lte: oneHourAgo } },
      { lastWorkUpdateAt: { $lte: oneHourAgo } }
    ]
  };

  if (staffEmpId) query.assignedToEmpId = normalizeEmpId(staffEmpId);
  return query;
};

const toMissedAlert = (task) => {
  const referenceDate = task.lastWorkUpdateAt || task.assignedAt || task.createdAt;
  const minutesSinceUpdate = referenceDate
    ? Math.floor((Date.now() - new Date(referenceDate).getTime()) / 60000)
    : null;

  return {
    taskId: task._id,
    taskTitle: task.title,
    staffEmpId: task.assignedToEmpId,
    staffName: task.assignedToName || task.assignedTo?.name || '',
    lastWorkUpdateAt: task.lastWorkUpdateAt,
    assignedAt: task.assignedAt,
    minutesSinceUpdate,
    message: `${task.assignedToName || task.assignedToEmpId} has not submitted an hourly update for "${task.title || 'assigned task'}".`
  };
};

// ═══════════════════════════════════════════════════════════
//  STAFF ROUTES - Submit work updates
// ═══════════════════════════════════════════════════════════

// POST /api/workupdates - Staff submits hourly work update
router.post('/', async (req, res) => {
  try {
    const { 
      staffId, 
      staffEmpId, 
      staffName, 
      taskId,
      workDescription,
      duration,
      workType,
      proofAttachments,
      locationCoordinates,
      latitude,
      longitude,
      accuracy,
      address
    } = req.body;

    const normalizedEmpId = normalizeEmpId(staffEmpId);
    const normalizedTaskId = getTaskIdValue(taskId);

    if (!normalizedEmpId || !staffName) {
      return res.status(400).json({ 
        message: "staffEmpId and staffName are required" 
      });
    }

    if (!workDescription || workDescription.trim().length === 0) {
      return res.status(400).json({ 
        message: "workDescription is required" 
      });
    }

    if (!duration || duration < 1 || duration > 60) {
      return res.status(400).json({ 
        message: "duration must be between 1 and 60 minutes" 
      });
    }

    let staffObjectId = null;
    if (staffId && mongoose.Types.ObjectId.isValid(staffId)) {
      staffObjectId = staffId;
    } else {
      const staff = await Employee.findOne({ id: normalizedEmpId });
      staffObjectId = staff?._id || null;
    }

    let linkedTask = null;
    if (normalizedTaskId && mongoose.Types.ObjectId.isValid(normalizedTaskId)) {
      linkedTask = await Task.findById(normalizedTaskId);
    }

    if (!linkedTask) {
      linkedTask = await Task.findOne({
        assignedToEmpId: normalizedEmpId,
        status: { $nin: ['Done', 'Completed', 'Rejected'] }
      }).sort({ lastWorkUpdateAt: 1, createdAt: -1 });
    }

    // Create work update
    const workUpdate = new WorkUpdate({
      staffId: staffObjectId,
      staffEmpId: normalizedEmpId,
      staffName,
      taskId: linkedTask?._id?.toString() || normalizedTaskId || null,
      taskTitle: linkedTask?.title || '',
      workDescription: workDescription.trim(),
      duration: parseInt(duration),
      workType: workType || 'Other',
      proofAttachments: proofAttachments || [],
      locationCoordinates: locationCoordinates || {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: parseFloat(accuracy),
        address: address || 'Not provided'
      },
      status: 'Pending',
      submittedAt: new Date()
    });

    const saved = await workUpdate.save();

    if (linkedTask) {
      const now = new Date();
      linkedTask.lastWorkUpdateAt = now;
      linkedTask.nextUpdateDueAt = new Date(now.getTime() + UPDATE_INTERVAL_MINUTES * 60 * 1000);
      linkedTask.updateAlertStatus = 'OK';
      linkedTask.updateAlertedAt = null;
      if (linkedTask.status === 'Pending') linkedTask.status = 'In Progress';
      await linkedTask.save();
    }
    
    console.log(`✅ Work update submitted by ${staffName} (${staffEmpId})`);
    
    res.status(201).json({
      message: "Work update submitted successfully",
      data: saved
    });
  } catch (err) {
    console.error('❌ Work update submission error:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// GET /api/workupdates/staff/:empId - Staff views their own updates
router.get('/staff/:empId', async (req, res) => {
  try {
    const { status, limit = 20, skip = 0 } = req.query;
    const filter = { staffEmpId: normalizeEmpId(req.params.empId) };

    if (status) filter.status = status;

    const updates = await WorkUpdate.find(filter)
      .sort({ submittedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await WorkUpdate.countDocuments(filter);
    const missedAlerts = await Task.find(buildMissedAlertQuery({ staffEmpId: req.params.empId }))
      .populate('assignedTo', 'name role dept service id mobile')
      .sort({ lastWorkUpdateAt: 1, assignedAt: 1 })
      .limit(25);

    res.json({
      data: updates,
      total,
      alerts: missedAlerts.map(toMissedAlert),
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (err) {
    console.error('❌ Fetch staff updates error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
//  ADMIN ROUTES - View & manage work updates
// ═══════════════════════════════════════════════════════════

// GET /api/workupdates - Admin views all work updates (with filters)
router.get('/', async (req, res) => {
  try {
    const { 
      status = 'all',
      staffEmpId,
      startDate,
      endDate,
      limit = 50,
      skip = 0,
      sort = '-submittedAt'
    } = req.query;

    const filter = {};

    // Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Staff filter
    if (staffEmpId) {
      filter.staffEmpId = normalizeEmpId(staffEmpId);
    }

    // Date range filter
    if (startDate || endDate) {
      filter.submittedAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.submittedAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.submittedAt.$lte = end;
      }
    }

    // Build sort object
    const sortObj = {};
    const sortParams = sort.split(',');
    sortParams.forEach(param => {
      if (param.startsWith('-')) {
        sortObj[param.substring(1)] = -1;
      } else {
        sortObj[param] = 1;
      }
    });

    const updates = await WorkUpdate.find(filter)
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('staffId', 'name dept service phone');

    const total = await WorkUpdate.countDocuments(filter);
    const missedAlerts = await Task.find(buildMissedAlertQuery({ staffEmpId }))
      .populate('assignedTo', 'name role dept service id mobile')
      .sort({ lastWorkUpdateAt: 1, assignedAt: 1 })
      .limit(100);

    // Calculate stats
    const stats = {
      total,
      pending: await WorkUpdate.countDocuments({ ...filter, status: 'Pending' }),
      approved: await WorkUpdate.countDocuments({ ...filter, status: 'Approved' }),
      rejected: await WorkUpdate.countDocuments({ ...filter, status: 'Rejected' }),
      missedHourlyUpdates: missedAlerts.length
    };

    res.json({
      data: updates,
      total,
      stats,
      alerts: missedAlerts.map(toMissedAlert),
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (err) {
    console.error('❌ Fetch work updates error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/workupdates/alerts/missed - Admin/staff hourly missed-update alerts
router.get('/alerts/missed', async (req, res) => {
  try {
    const { staffEmpId } = req.query;
    const missedTasks = await Task.find(buildMissedAlertQuery({ staffEmpId }))
      .populate('assignedTo', 'name role dept service id mobile')
      .sort({ lastWorkUpdateAt: 1, assignedAt: 1 })
      .limit(200);

    res.json({
      data: missedTasks.map(toMissedAlert),
      total: missedTasks.length,
      intervalMinutes: UPDATE_INTERVAL_MINUTES
    });
  } catch (err) {
    console.error('❌ Fetch missed hourly update alerts error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/workupdates/analytics/daily - Daily work summary
router.get('/analytics/daily', async (req, res) => {
  try {
    const { staffEmpId, date } = req.query;
    
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const match = {
      submittedAt: {
        $gte: targetDate,
        $lt: nextDate
      }
    };

    if (staffEmpId) {
      match.staffEmpId = normalizeEmpId(staffEmpId);
    }

    const analytics = await WorkUpdate.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$staffEmpId',
          staffName: { $first: '$staffName' },
          totalUpdates: { $sum: 1 },
          totalMinutes: { $sum: '$duration' },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] }
          },
          workTypes: { $push: '$workType' }
        }
      },
      {
        $sort: { staffName: 1 }
      }
    ]);

    res.json({
      date: targetDate.toISOString().split('T')[0],
      data: analytics
    });
  } catch (err) {
    console.error('❌ Analytics error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/workupdates/analytics/staff/:empId - Staff specific analytics
router.get('/analytics/staff/:empId', async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const analytics = await WorkUpdate.aggregate([
      {
        $match: {
          staffEmpId: normalizeEmpId(req.params.empId),
          submittedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" } },
          totalUpdates: { $sum: 1 },
          totalMinutes: { $sum: '$duration' },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      staffEmpId: normalizeEmpId(req.params.empId),
      days: parseInt(days),
      data: analytics
    });
  } catch (err) {
    console.error('❌ Staff analytics error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/workupdates/:id - Admin views specific update details
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid work update ID" });
    }

    const update = await WorkUpdate.findById(req.params.id)
      .populate('staffId', 'name dept service phone')
      .populate('reviewedBy', 'name email');

    if (!update) {
      return res.status(404).json({ message: "Work update not found" });
    }

    res.json(update);
  } catch (err) {
    console.error('❌ Fetch work update error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/workupdates/:id/approve - Admin approves work update
router.put('/:id/approve', async (req, res) => {
  try {
    const { reviewedBy, remarks } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid work update ID" });
    }

    const update = await WorkUpdate.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Approved',
        adminRemarks: remarks || '',
        reviewedBy: reviewedBy || null,
        reviewedAt: new Date(),
        approvedAt: new Date()
      },
      { new: true }
    );

    if (!update) {
      return res.status(404).json({ message: "Work update not found" });
    }

    console.log(`✅ Work update approved: ${req.params.id} by ${update.staffName}`);
    
    res.json({
      message: "Work update approved successfully",
      data: update
    });
  } catch (err) {
    console.error('❌ Approve work update error:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/workupdates/:id/reject - Admin rejects work update
router.put('/:id/reject', async (req, res) => {
  try {
    const { reviewedBy, remarks } = req.body;

    if (!remarks || remarks.trim().length === 0) {
      return res.status(400).json({ 
        message: "Rejection reason (remarks) is required" 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid work update ID" });
    }

    const update = await WorkUpdate.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Rejected',
        adminRemarks: remarks,
        reviewedBy: reviewedBy || null,
        reviewedAt: new Date()
      },
      { new: true }
    );

    if (!update) {
      return res.status(404).json({ message: "Work update not found" });
    }

    console.log(`❌ Work update rejected: ${req.params.id} by ${update.staffName}`);
    
    res.json({
      message: "Work update rejected successfully",
      data: update
    });
  } catch (err) {
    console.error('❌ Reject work update error:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
//  ANALYTICS ROUTES
// ═══════════════════════════════════════════════════════════

// GET /api/workupdates/analytics/daily - Daily work summary
router.get('/analytics/daily', async (req, res) => {
  try {
    const { staffEmpId, date } = req.query;
    
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const match = {
      submittedAt: {
        $gte: targetDate,
        $lt: nextDate
      }
    };

    if (staffEmpId) {
      match.staffEmpId = staffEmpId;
    }

    const analytics = await WorkUpdate.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$staffEmpId',
          staffName: { $first: '$staffName' },
          totalUpdates: { $sum: 1 },
          totalMinutes: { $sum: '$duration' },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] }
          },
          workTypes: { $push: '$workType' }
        }
      },
      {
        $sort: { staffName: 1 }
      }
    ]);

    res.json({
      date: targetDate.toISOString().split('T')[0],
      data: analytics
    });
  } catch (err) {
    console.error('❌ Analytics error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/workupdates/analytics/staff/:empId - Staff specific analytics
router.get('/analytics/staff/:empId', async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const analytics = await WorkUpdate.aggregate([
      {
        $match: {
          staffEmpId: req.params.empId,
          submittedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" } },
          totalUpdates: { $sum: 1 },
          totalMinutes: { $sum: '$duration' },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      staffEmpId: req.params.empId,
      days: parseInt(days),
      data: analytics
    });
  } catch (err) {
    console.error('❌ Staff analytics error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;
