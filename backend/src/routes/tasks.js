// import express from 'express';
// import mongoose from 'mongoose';
// import Task from '../models/Task.js';
// import Employee from '../models/Hr&Staff.js';
// import WorkUpdate from '../models/WorkUpdate.js';
// import twilio from 'twilio';

// const router = express.Router();

// // ═══════════════════════════════════════════════════════════
// //  HELPER FUNCTIONS
// // ═══════════════════════════════════════════════════════════

// const normalizeEmpId = (value) => String(value || "").trim().toUpperCase();

// const normalizeAttachment = (file = {}, uploadedBy = "Admin") => ({
//   name: file.name || file.fileName || "",
//   type: file.type || file.fileType || "",
//   url: file.url || file.data || "",
//   size: Number(file.size || file.fileSize || 0),
//   uploadedBy: file.uploadedBy || uploadedBy,
//   uploadedAt: file.uploadedAt || new Date().toISOString(),
// });

// const resolveStaffReference = async (staffId) => {
//   if (!staffId) return null;
//   const normalizedId = normalizeEmpId(staffId);

//   if (mongoose.Types.ObjectId.isValid(staffId)) {
//     const staffById = await Employee.findById(staffId);
//     if (staffById) return staffById;
//   }

//   return await Employee.findOne({ id: normalizedId });
// };

// const getTwilioClient = () => {
//   return twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
// };

// const sendSMS = async (to, message) => {
//   try {
//     if (!to) return;
//     const phone = to.startsWith('+') ? to : `+91${to}`;
//     const client = getTwilioClient();
//     await client.messages.create({
//       body: message,
//       from: process.env.TWILIO_PHONE,
//       to: phone
//     });
//     console.log(`✅ SMS sent to ${phone}`);
//   } catch (err) {
//     console.error('❌ SMS error:', err.message);
//   }
// };

// // ═══════════════════════════════════════════════════════════
// //  TASK ROUTES
// // ═══════════════════════════════════════════════════════════

// // GET /api/tasks - Get tasks by filter or by staffId
// // Usage: GET /api/tasks?staffId=EMP123
// router.get("/", async (req, res) => {
//   try {
//     const { stage, status, staffId } = req.query;
//     const filter = {};

//     // Add basic filters
//     if (stage) filter.stage = stage;
//     if (status) filter.status = status;

//     // Add staffId filter if provided
//     if (staffId) {
//       const normalizedId = normalizeEmpId(staffId);
//       filter.assignedToEmpId = normalizedId;
//     }

//     const tasks = await Task.find(filter)
//       .populate("assignedTo", "name role dept service id mobile")
//       .sort({ createdAt: -1 });

//     res.json(tasks);
//   } catch (err) {
//     console.error("❌ GET tasks error:", err.message);
//     res.status(500).json({ message: err.message });
//   }
// });

// // POST /api/tasks - Admin creates new task
// router.post("/", async (req, res) => {
//   console.log("✅ Task creation received:", req.body);
//   try {
//     let assignedTo = null;
//     let assignedToEmpId = null;
//     let assignedToName = "";
//     let assignedToPhone = "";


//     if (req.body.assignedTo) {
//       const staff = await resolveStaffReference(req.body.assignedTo);
//       if (staff) {
//         assignedTo = staff._id;
//         assignedToEmpId = staff.id; // Always use staff's id (empId)
//         assignedToName = staff.name;
//         assignedToPhone = staff.mobile;
//       } else if (mongoose.Types.ObjectId.isValid(req.body.assignedTo)) {
//         assignedTo = req.body.assignedTo;
//       } else {
//         assignedToEmpId = req.body.assignedTo;
//       }
//     }

//     // Fallback: If assignedToEmpId is still not set, try to get from req.body.assignedToEmpId
//     if (!assignedToEmpId && req.body.assignedToEmpId) {
//       assignedToEmpId = req.body.assignedToEmpId;
//     }

//     const task = new Task({
//       ...req.body,
//       assignedTo,
//       assignedToEmpId: normalizeEmpId(assignedToEmpId),
//       assignedToName,
//       assignedToPhone,
//       assignedAt: req.body.assignedAt || new Date(),
//       attachments: Array.isArray(req.body.attachments)
//         ? req.body.attachments.map((file) => normalizeAttachment(file, "Admin"))
//         : [],
//     });

//     const saved = await task.save();
//     res.status(201).json(saved);
//   } catch (err) {
//     console.error("❌ POST task error:", err.message);
//     res.status(400).json({ message: err.message });
//   }
// });

// // PUT /api/tasks/:id - Admin/Staff updates task
// router.put("/:id", async (req, res) => {
//   try {
//     const update = { ...req.body };
//     const allowedFields = ["status", "staffRemark", "title", "description", "priority", "dueDate", "dueTime", "adminNotes", "attachments", "assignedTo", "assignedToEmpId"];

//     // Only allow specific fields to be updated
//     const cleanUpdate = {};
//     allowedFields.forEach((field) => {
//       if (field in update) {
//         cleanUpdate[field] = update[field];
//       }
//     });

//     if (cleanUpdate.assignedTo) {
//       const staff = await resolveStaffReference(cleanUpdate.assignedTo);
//       if (staff) {
//         cleanUpdate.assignedTo = staff._id;
//         cleanUpdate.assignedToEmpId = normalizeEmpId(staff.id);
//         cleanUpdate.assignedToName = staff.name;
//         cleanUpdate.assignedToPhone = staff.mobile;
//       } else if (!mongoose.Types.ObjectId.isValid(cleanUpdate.assignedTo)) {
//         cleanUpdate.assignedToEmpId = normalizeEmpId(cleanUpdate.assignedTo);
//         cleanUpdate.assignedTo = null;
//       }
//     }

//     if (cleanUpdate.assignedToEmpId) cleanUpdate.assignedToEmpId = normalizeEmpId(cleanUpdate.assignedToEmpId);
//     if (Array.isArray(cleanUpdate.attachments)) {
//       cleanUpdate.attachments = cleanUpdate.attachments.map((file) => normalizeAttachment(file, file.uploadedBy || "Admin"));
//     }

//     const updated = await Task.findByIdAndUpdate(
//       req.params.id,
//       { $set: cleanUpdate },
//       { new: true }
//     ).populate("assignedTo", "name role dept service id mobile");

//     if (!updated) return res.status(404).json({ message: "Task not found" });
//     console.log("✅ Task updated:", req.params.id);
//     res.json(updated);
//   } catch (err) {
//     console.error("❌ PUT task error:", err.message);
//     res.status(400).json({ message: err.message });
//   }
// });

// // DELETE /api/tasks/:id - Admin deletes task
// router.delete("/:id", async (req, res) => {
//   try {
//     const deleted = await Task.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ message: "Task not found" });
//     console.log("✅ Task deleted:", req.params.id);
//     res.json({ message: "Task deleted successfully" });
//   } catch (err) {
//     console.error("❌ DELETE task error:", err.message);
//     res.status(400).json({ message: err.message });
//   }
// });

// // POST /api/tasks/:id/assign - Assign task to staff with SMS
// router.post("/:id/assign", async (req, res) => {
//   try {
//     const { staffId, durationHours, duration, elderName, phone, careType, clientId, stage } = req.body;

//     if (!staffId) return res.status(400).json({ message: "staffId is required" });

//     const staff = await resolveStaffReference(staffId);
//     const assignedTo = staff?._id || (mongoose.Types.ObjectId.isValid(staffId) ? staffId : null);
//     const assignedToEmpId = staff?.id || staffId;
//     const assignedToName = staff?.name || "";
//     const assignedToPhone = staff?.mobile || "";

//     const task = new Task({
//       elderName: elderName || "Unknown",
//       phone: phone || "N/A",
//       careType: careType || "N/A",
//       clientId: clientId || null,
//       stage: stage || "Enrolled",
//       status: "In Progress",
//       assignedTo,
//       assignedToEmpId: normalizeEmpId(assignedToEmpId),
//       assignedToName,
//       assignedToPhone,
//       assignedAt: new Date(),
//       durationDays: durationHours || null,
//       duration: duration || null,
//     });

//     await task.save();
//     const populated = await task.populate("assignedTo", "id name role dept service mobile");

//     // ✅ Send SMS to client
//     await sendSMS(phone,
//       `Staff Assigned!\nName: ${assignedToName || populated.assignedTo?.name}\nID: ${assignedToEmpId || populated.assignedTo?.id}\nPhone: ${assignedToPhone || populated.assignedTo?.mobile}\nService: ${careType}\nDuration: ${duration}\n- HCC Team`
//     );

//     // ✅ Send SMS to staff
//     await sendSMS(assignedToPhone || populated.assignedTo?.mobile,
//       `New Task Assigned!\nPatient: ${elderName}\nID: ${clientId}\nPhone: ${phone}\nService: ${careType}\nDuration: ${duration}\n- HCC Team`
//     );

//     console.log("✅ Task assigned:", req.params.id, "to", staffId);
//     res.json(populated);
//   } catch (err) {
//     console.error("❌ POST assign error:", err.message);
//     res.status(400).json({ message: err.message });
//   }
// });

// // POST /api/tasks/:id/complete - Mark task as completed
// router.post("/:id/complete", async (req, res) => {
//   try {
//     const task = await Task.findOne({
//       clientId: req.params.id,
//       status: "In Progress"
//     }).sort({ createdAt: -1 });

//     if (!task) return res.status(404).json({ message: "No active task found" });

//     task.status = "Completed";
//     task.completedAt = new Date();
//     await task.save();

//     const populated = await task.populate("assignedTo", "name role dept service mobile");

//     // ✅ Send SMS to client
//     await sendSMS(task.phone,
//       `Dear ${task.elderName}, your ${task.careType} service has been completed successfully. Thank you for choosing us! - HCC Team`
//     );

//     // ✅ Send SMS to staff
//     await sendSMS(populated.assignedTo?.mobile,
//       `Dear ${populated.assignedTo?.name}, the task for patient ${task.elderName} (${task.careType}) has been marked as Completed. Great work! - HCC Team`
//     );

//     console.log("✅ Task completed:", req.params.id);
//     res.json(populated);
//   } catch (err) {
//     console.error("❌ POST complete error:", err.message);
//     res.status(400).json({ message: err.message });
//   }
// });

// // POST /api/tasks/:id/reopen - Reopen completed task
// router.post("/:id/reopen", async (req, res) => {
//   try {
//     const task = await Task.findOne({
//       clientId: req.params.id,
//       status: "Completed"
//     }).sort({ createdAt: -1 });

//     if (!task) return res.status(404).json({ message: "No completed task found" });

//     task.status = "In Progress";
//     task.completedAt = null;
//     await task.save();

//     const populated = await task.populate("assignedTo", "name role dept service");
//     console.log("✅ Task reopened:", req.params.id);
//     res.json(populated);
//   } catch (err) {
//     console.error("❌ POST reopen error:", err.message);
//     res.status(400).json({ message: err.message });
//   }
// });

// // ═══════════════════════════════════════════════════════════
// //  STAFF ROUTES
// // ═══════════════════════════════════════════════════════════

// // GET /api/staff or /api/staff?dept=homecare
// router.get("/staff", async (req, res) => {
//   try {
//     const { dept } = req.query;
//     const filter = dept ? { dept } : {};
//     const staff = await Employee.find(filter).sort({ name: 1 });
//     res.json(staff);
//   } catch (err) {
//     console.error("❌ GET staff error:", err.message);
//     res.status(500).json({ message: err.message });
//   }
// });

// // POST /api/staff - Create new staff member
// router.post("/staff", async (req, res) => {
//   try {
//     const staff = new Employee(req.body);
//     const saved = await staff.save();
//     console.log("✅ Staff created:", saved._id);
//     res.status(201).json(saved);
//   } catch (err) {
//     console.error("❌ POST staff error:", err.message);
//     res.status(400).json({ message: err.message });
//   }
// });

// // PUT /api/staff/:id - Update staff member
// router.put("/staff/:id", async (req, res) => {
//   try {
//     const updated = await Employee.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     );
//     if (!updated) return res.status(404).json({ message: "Staff not found" });
//     console.log("✅ Staff updated:", req.params.id);
//     res.json(updated);
//   } catch (err) {
//     console.error("❌ PUT staff error:", err.message);
//     res.status(400).json({ message: err.message });
//   }
// });

// // ═══════════════════════════════════════════════════════════
// //  UNIFIED DASHBOARD ENDPOINTS
// // ═══════════════════════════════════════════════════════════

// // GET /api/tasks/dashboard/staff/:empId - Get staff tasks + their work updates
// router.get("/dashboard/staff/:empId", async (req, res) => {
//   try {
//     const empId = req.params.empId;
//     const normalizedId = normalizeEmpId(empId);

//     // Fetch tasks assigned to this staff
//     const tasksFilter = {
//       $or: [
//         { assignedToEmpId: normalizedId },
//         { assignedToEmpId: { $regex: normalizedId, $options: "i" } }
//       ]
//     };

//     if (mongoose.Types.ObjectId.isValid(empId)) {
//       tasksFilter.$or.push({ assignedTo: empId });
//     }

//     const tasks = await Task.find(tasksFilter)
//       .populate("assignedTo", "name role dept service id mobile")
//       .sort({ createdAt: -1 });

//     // Fetch work updates for this staff
//     const workUpdates = await WorkUpdate.find({ staffEmpId: normalizedId })
//       .sort({ submittedAt: -1 })
//       .limit(100);

//     res.json({
//       tasks,
//       workUpdates,
//       summary: {
//         totalTasks: tasks.length,
//         pendingTasks: tasks.filter(t => t.status === "Pending").length,
//         inProgressTasks: tasks.filter(t => t.status === "In Progress").length,
//         completedTasks: tasks.filter(t => t.status === "Completed" || t.status === "Done").length,
//         totalWorkUpdates: workUpdates.length,
//         pendingUpdates: workUpdates.filter(u => u.status === "Pending").length,
//         approvedUpdates: workUpdates.filter(u => u.status === "Approved").length,
//         rejectedUpdates: workUpdates.filter(u => u.status === "Rejected").length
//       }
//     });
//   } catch (err) {
//     console.error("❌ GET dashboard/staff error:", err.message);
//     res.status(500).json({ message: err.message });
//   }
// });

// // GET /api/tasks/:id/with-updates - Get specific task with its work updates
// router.get("/:id/with-updates", async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id)
//       .populate("assignedTo", "name role dept service id mobile");

//     if (!task) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//     // Fetch work updates linked to this task
//     const workUpdates = await WorkUpdate.find({ taskId: req.params.id })
//       .sort({ submittedAt: -1 });

//     res.json({
//       task,
//       workUpdates,
//       taskSummary: {
//         status: task.status,
//         assignedTo: task.assignedToName || task.assignedTo?.name,
//         dueDate: task.dueDate,
//         totalUpdates: workUpdates.length,
//         totalDurationMinutes: workUpdates.reduce((sum, u) => sum + (u.duration || 0), 0),
//         updateStatuses: {
//           pending: workUpdates.filter(u => u.status === "Pending").length,
//           approved: workUpdates.filter(u => u.status === "Approved").length,
//           rejected: workUpdates.filter(u => u.status === "Rejected").length
//         }
//       }
//     });
//   } catch (err) {
//     console.error("❌ GET task with updates error:", err.message);
//     res.status(500).json({ message: err.message });
//   }
// });

// export default router;



import express from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Employee from '../models/Hr&Staff.js';
import WorkUpdate from '../models/WorkUpdate.js';
import twilio from 'twilio';

const router = express.Router();

// ═══════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

const normalizeEmpId = (value) => String(value || "").trim().toUpperCase();

const normalizeAttachment = (file = {}, uploadedBy = "Admin") => ({
  name: file.name || file.fileName || "",
  type: file.type || file.fileType || "",
  url: file.url || file.data || "",
  size: Number(file.size || file.fileSize || 0),
  uploadedBy: file.uploadedBy || uploadedBy,
  uploadedAt: file.uploadedAt || new Date().toISOString(),
});

const resolveStaffReference = async (staffId) => {
  if (!staffId) return null;
  const normalizedId = normalizeEmpId(staffId);

  if (mongoose.Types.ObjectId.isValid(staffId)) {
    const staffById = await Employee.findById(staffId);
    if (staffById) return staffById;
  }

  return await Employee.findOne({ id: normalizedId });
};

const getTwilioClient = () => {
  return twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
};

const sendSMS = async (to, message) => {
  try {
    if (!to) return;
    const phone = to.startsWith('+') ? to : `+91${to}`;
    const client = getTwilioClient();
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: phone
    });
    console.log(`✅ SMS sent to ${phone}`);
  } catch (err) {
    console.error('❌ SMS error:', err.message);
  }
};

// ═══════════════════════════════════════════════════════════
//  IMPORTANT: Specific routes MUST come before /:id routes
//  Otherwise Express matches /staff as /:id = "staff"
// ═══════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────
//  STAFF ROUTES  (registered first — before any /:id route)
// ─────────────────────────────────────────────────────────

// GET /api/tasks/staff  or  /api/tasks/staff?dept=homecare
router.get("/staff", async (req, res) => {
  try {
    const { dept } = req.query;
    const filter = dept ? { dept } : {};
    const staff = await Employee.find(filter).sort({ name: 1 });
    res.json(staff);
  } catch (err) {
    console.error("❌ GET staff error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks/staff
router.post("/staff", async (req, res) => {
  try {
    const staff = new Employee(req.body);
    const saved = await staff.save();
    console.log("✅ Staff created:", saved._id);
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ POST staff error:", err.message);
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/tasks/staff/:id
router.put("/staff/:id", async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Staff not found" });
    console.log("✅ Staff updated:", req.params.id);
    res.json(updated);
  } catch (err) {
    console.error("❌ PUT staff error:", err.message);
    res.status(400).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────
//  DASHBOARD ROUTES  (also before /:id)
// ─────────────────────────────────────────────────────────

// GET /api/tasks/dashboard/staff/:empId
router.get("/dashboard/staff/:empId", async (req, res) => {
  try {
    const empId = req.params.empId;
    const normalizedId = normalizeEmpId(empId);

    const tasksFilter = {
      $or: [
        { assignedToEmpId: normalizedId },
        { assignedToEmpId: new RegExp(`^${normalizedId}$`, "i") },
      ]
    };

    if (mongoose.Types.ObjectId.isValid(empId)) {
      tasksFilter.$or.push({ assignedTo: new mongoose.Types.ObjectId(empId) });
    }

    const tasks = await Task.find(tasksFilter)
      .populate("assignedTo", "name role dept service id mobile")
      .sort({ createdAt: -1 });

    const workUpdates = await WorkUpdate.find({ staffEmpId: normalizedId })
      .sort({ submittedAt: -1 })
      .limit(100);

    res.json({
      tasks,
      workUpdates,
      summary: {
        totalTasks: tasks.length,
        pendingTasks: tasks.filter(t => t.status === "Pending").length,
        inProgressTasks: tasks.filter(t => t.status === "In Progress").length,
        completedTasks: tasks.filter(t => t.status === "Completed" || t.status === "Done").length,
        totalWorkUpdates: workUpdates.length,
        pendingUpdates: workUpdates.filter(u => u.status === "Pending").length,
        approvedUpdates: workUpdates.filter(u => u.status === "Approved").length,
        rejectedUpdates: workUpdates.filter(u => u.status === "Rejected").length
      }
    });
  } catch (err) {
    console.error("❌ GET dashboard/staff error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────
//  TASK ROUTES
// ─────────────────────────────────────────────────────────

// GET /api/tasks  — supports ?staffId=EMP-HC-M5862
router.get("/", async (req, res) => {
  try {
    const { stage, status, staffId } = req.query;
    const filter = {};

    if (stage) filter.stage = stage;
    if (status) filter.status = status;

    // FIX: Use $or with case-insensitive regex so "EMP-HC-M5862" matches
    // regardless of how it was stored (upper/lower/mixed)
    if (staffId) {
      const normalizedId = normalizeEmpId(staffId); // always UPPER
      filter.$or = [
        { assignedToEmpId: normalizedId },
        { assignedToEmpId: new RegExp(`^${normalizedId}$`, "i") },
      ];
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name role dept service id mobile")
      .sort({ createdAt: -1 });

    console.log(`✅ GET /tasks — staffId=${staffId || 'none'}, found ${tasks.length} task(s)`);
    res.json(tasks);
  } catch (err) {
    console.error("❌ GET tasks error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks — Admin creates new task
router.post("/", async (req, res) => {
  console.log("✅ Task creation received:", req.body);
  try {
    let assignedTo = null;
    let assignedToEmpId = null;
    let assignedToName = "";
    let assignedToPhone = "";

    if (req.body.assignedTo) {
      const staff = await resolveStaffReference(req.body.assignedTo);
      if (staff) {
        assignedTo = staff._id;
        assignedToEmpId = staff.id;       // HR model's string empId e.g. "EMP-HC-M5862"
        assignedToName  = staff.name;
        assignedToPhone = staff.mobile;
      } else if (mongoose.Types.ObjectId.isValid(req.body.assignedTo)) {
        assignedTo = req.body.assignedTo;
      } else {
        // Passed as empId string directly
        assignedToEmpId = req.body.assignedTo;
      }
    }

    // Fallback
    if (!assignedToEmpId && req.body.assignedToEmpId) {
      assignedToEmpId = req.body.assignedToEmpId;
    }

    const normalizedEmpId = normalizeEmpId(assignedToEmpId);

    const task = new Task({
      ...req.body,
      assignedTo,
      assignedToEmpId: normalizedEmpId,   // always stored UPPERCASE
      assignedToName,
      assignedToPhone,
      assignedAt: req.body.assignedAt || new Date(),
      attachments: Array.isArray(req.body.attachments)
        ? req.body.attachments.map((file) => normalizeAttachment(file, "Admin"))
        : [],
    });

    const saved = await task.save();
    console.log(`✅ Task created: ${saved._id}, assignedToEmpId: ${normalizedEmpId}`);
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ POST task error:", err.message);
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/tasks/:id — Admin/Staff updates task
router.put("/:id", async (req, res) => {
  try {
    // Validate ObjectId early to give a clear 400 instead of a Mongoose cast error
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: `Invalid task id: ${req.params.id}` });
    }

    const update = { ...req.body };
    const allowedFields = [
      "status", "staffRemark", "title", "description", "priority",
      "dueDate", "dueTime", "adminNotes", "attachments",
      "assignedTo", "assignedToEmpId"
    ];

    const cleanUpdate = {};
    allowedFields.forEach((field) => {
      if (field in update) cleanUpdate[field] = update[field];
    });

    if (cleanUpdate.assignedTo) {
      const staff = await resolveStaffReference(cleanUpdate.assignedTo);
      if (staff) {
        cleanUpdate.assignedTo      = staff._id;
        cleanUpdate.assignedToEmpId = normalizeEmpId(staff.id);
        cleanUpdate.assignedToName  = staff.name;
        cleanUpdate.assignedToPhone = staff.mobile;
      } else if (!mongoose.Types.ObjectId.isValid(cleanUpdate.assignedTo)) {
        cleanUpdate.assignedToEmpId = normalizeEmpId(cleanUpdate.assignedTo);
        cleanUpdate.assignedTo      = null;
      }
    }

    if (cleanUpdate.assignedToEmpId) {
      cleanUpdate.assignedToEmpId = normalizeEmpId(cleanUpdate.assignedToEmpId);
    }

    if (Array.isArray(cleanUpdate.attachments)) {
      cleanUpdate.attachments = cleanUpdate.attachments.map((file) =>
        normalizeAttachment(file, file.uploadedBy || "Admin")
      );
    }

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: cleanUpdate },
      { new: true }
    ).populate("assignedTo", "name role dept service id mobile");

    if (!updated) return res.status(404).json({ message: "Task not found" });
    console.log("✅ Task updated:", req.params.id);
    res.json(updated);
  } catch (err) {
    console.error("❌ PUT task error:", err.message);
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: `Invalid task id: ${req.params.id}` });
    }
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Task not found" });
    console.log("✅ Task deleted:", req.params.id);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("❌ DELETE task error:", err.message);
    res.status(400).json({ message: err.message });
  }
});

// POST /api/tasks/:id/assign — Assign task to staff with SMS
router.post("/:id/assign", async (req, res) => {
  try {
    const { staffId, durationHours, duration, elderName, phone, careType, clientId, stage } = req.body;

    if (!staffId) return res.status(400).json({ message: "staffId is required" });

    const staff = await resolveStaffReference(staffId);
    const assignedTo      = staff?._id || (mongoose.Types.ObjectId.isValid(staffId) ? staffId : null);
    const assignedToEmpId = normalizeEmpId(staff?.id || staffId);
    const assignedToName  = staff?.name   || "";
    const assignedToPhone = staff?.mobile || "";

    const task = new Task({
      elderName: elderName || "Unknown",
      phone:     phone     || "N/A",
      careType:  careType  || "N/A",
      clientId:  clientId  || null,
      stage:     stage     || "Enrolled",
      status:    "In Progress",
      assignedTo,
      assignedToEmpId,
      assignedToName,
      assignedToPhone,
      assignedAt:   new Date(),
      durationDays: durationHours || null,
      duration:     duration      || null,
    });

    await task.save();
    const populated = await task.populate("assignedTo", "id name role dept service mobile");

    await sendSMS(phone,
      `Staff Assigned!\nName: ${assignedToName}\nID: ${assignedToEmpId}\nPhone: ${assignedToPhone}\nService: ${careType}\nDuration: ${duration}\n- HCC Team`
    );
    await sendSMS(assignedToPhone,
      `New Task Assigned!\nPatient: ${elderName}\nID: ${clientId}\nPhone: ${phone}\nService: ${careType}\nDuration: ${duration}\n- HCC Team`
    );

    console.log("✅ Task assigned:", req.params.id, "to", staffId);
    res.json(populated);
  } catch (err) {
    console.error("❌ POST assign error:", err.message);
    res.status(400).json({ message: err.message });
  }
});

// POST /api/tasks/:id/complete
router.post("/:id/complete", async (req, res) => {
  try {
    const task = await Task.findOne({
      clientId: req.params.id,
      status: "In Progress"
    }).sort({ createdAt: -1 });

    if (!task) return res.status(404).json({ message: "No active task found" });

    task.status      = "Completed";
    task.completedAt = new Date();
    await task.save();

    const populated = await task.populate("assignedTo", "name role dept service mobile");

    await sendSMS(task.phone,
      `Dear ${task.elderName}, your ${task.careType} service has been completed successfully. Thank you for choosing us! - HCC Team`
    );
    await sendSMS(populated.assignedTo?.mobile,
      `Dear ${populated.assignedTo?.name}, the task for patient ${task.elderName} (${task.careType}) has been marked as Completed. Great work! - HCC Team`
    );

    console.log("✅ Task completed:", req.params.id);
    res.json(populated);
  } catch (err) {
    console.error("❌ POST complete error:", err.message);
    res.status(400).json({ message: err.message });
  }
});

// POST /api/tasks/:id/reopen
router.post("/:id/reopen", async (req, res) => {
  try {
    const task = await Task.findOne({
      clientId: req.params.id,
      status: "Completed"
    }).sort({ createdAt: -1 });

    if (!task) return res.status(404).json({ message: "No completed task found" });

    task.status      = "In Progress";
    task.completedAt = null;
    await task.save();

    const populated = await task.populate("assignedTo", "name role dept service");
    console.log("✅ Task reopened:", req.params.id);
    res.json(populated);
  } catch (err) {
    console.error("❌ POST reopen error:", err.message);
    res.status(400).json({ message: err.message });
  }
});

// GET /api/tasks/:id/with-updates
router.get("/:id/with-updates", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: `Invalid task id: ${req.params.id}` });
    }

    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name role dept service id mobile");

    if (!task) return res.status(404).json({ message: "Task not found" });

    const workUpdates = await WorkUpdate.find({ taskId: req.params.id })
      .sort({ submittedAt: -1 });

    res.json({
      task,
      workUpdates,
      taskSummary: {
        status:     task.status,
        assignedTo: task.assignedToName || task.assignedTo?.name,
        dueDate:    task.dueDate,
        totalUpdates: workUpdates.length,
        totalDurationMinutes: workUpdates.reduce((sum, u) => sum + (u.duration || 0), 0),
        updateStatuses: {
          pending:  workUpdates.filter(u => u.status === "Pending").length,
          approved: workUpdates.filter(u => u.status === "Approved").length,
          rejected: workUpdates.filter(u => u.status === "Rejected").length
        }
      }
    });
  } catch (err) {
    console.error("❌ GET task with updates error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;