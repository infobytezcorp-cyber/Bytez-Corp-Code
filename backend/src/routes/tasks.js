// import express from 'express';
// import Task from '../models/Task.js';
// import Staff from '../models/Staff.js';

// const router = express.Router();

// // ═══════════════════════════════════════════════════════════
// //  TASK ROUTES
// // ═══════════════════════════════════════════════════════════

// // GET /api/tasks?stage=Enrolled
// router.get("/", async (req, res) => { 
//   try {
//     const filter = {};
//     if (req.query.stage) filter.stage = req.query.stage;

//     const tasks = await Task.find(filter)
//       .populate("assignedTo", "name role dept service")
//       .sort({ createdAt: -1 });

//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // POST /api/tasks
// router.post("/", async (req, res) => {
//   console.log("Body received:", req.body); 
//   try {
//     const task = new Task(req.body);
//     const saved = await task.save();
//     res.status(201).json(saved);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // PUT /api/tasks/:id
// router.put("/:id", async (req, res) => {
//   try {
//     const updated = await Task.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     ).populate("assignedTo", "name role dept service");

//     if (!updated) return res.status(404).json({ message: "Task not found" });
//     res.json(updated);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // POST /api/tasks/:id/assign
// router.post("/:id/assign", async (req, res) => {
//   try {
//     const { staffId, durationHours, duration,
//             elderName, phone, careType, clientId, stage } = req.body;

//     if (!staffId) return res.status(400).json({ message: "staffId is required" });

//     let task = await Task.findById(req.params.id);

//     if (!task) {
//       task = new Task({
//         _id:          new mongoose.Types.ObjectId(req.params.id),
//         elderName:    elderName || "Unknown",
//         phone:        phone     || "N/A",
//         careType:     careType  || "N/A",
//         clientId:     clientId  || null,
//         stage:        stage     || "Enrolled",
//         taskStatus:   "In Progress",
//         assignedTo:   staffId,
//         durationDays: durationHours || null,
//         duration:     duration      || null,
//       });
//       await task.save();
//     } else {
//       task.assignedTo   = staffId;
//       task.taskStatus   = "In Progress";
//       task.durationDays = durationHours || null;
//       if (duration) task.duration = duration;
//       await task.save();
//     }

//     const populated = await task.populate("assignedTo", "name role dept service");
//     res.json(populated);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // POST /api/tasks/:id/complete
// router.post("/:id/complete", async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     if (task.taskStatus !== "In Progress") {
//       return res.status(400).json({ message: "Only In Progress tasks can be completed" });
//     }

//     task.taskStatus = "Completed";
//     await task.save();

//     const populated = await task.populate("assignedTo", "name role dept service");
//     res.json(populated);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // POST /api/tasks/:id/reopen
// router.post("/:id/reopen", async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     if (task.taskStatus !== "Completed") {
//       return res.status(400).json({ message: "Only Completed tasks can be reopened" });
//     }

//     task.taskStatus = "In Progress";
//     await task.save();

//     const populated = await task.populate("assignedTo", "name role dept service");
//     res.json(populated);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // ═══════════════════════════════════════════════════════════
// //  HR / STAFF ROUTES
// // ═══════════════════════════════════════════════════════════

// // GET /api/staff
// router.get("/staff", async (req, res) => {
//   try {
//     const staff = await Staff.find().sort({ name: 1 });
//     res.json(staff);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // POST /api/staff
// router.post("/staff", async (req, res) => {
//   try {
//     const staff = new Staff(req.body);
//     const saved = await staff.save();
//     res.status(201).json(saved);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // PUT /api/staff/:id
// router.put("/staff/:id", async (req, res) => {
//   try {
//     const updated = await Staff.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     );
//     if (!updated) return res.status(404).json({ message: "Staff not found" });
//     res.json(updated);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// export default router;

import express from 'express';
import mongoose from 'mongoose';        
import Task from '../models/Task.js';
import Staff from '../models/Staff.js';
import twilio from 'twilio';

const router = express.Router();

// ═══════════════════════════════════════════════════════════
//  TASK ROUTES
// ═══════════════════════════════════════════════════════════

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.stage) filter.stage = req.query.stage;
    const tasks = await Task.find(filter)
      .populate("assignedTo", "name role dept service")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const task  = new Task(req.body);
    const saved = await task.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(
      req.params.id, req.body,
      { returnDocument: "after", runValidators: true }
    ).populate("assignedTo", "name role dept service");
    if (!updated) return res.status(404).json({ message: "Task not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// router.post("/:id/assign", async (req, res) => {
//   try {
//     const { staffId, durationHours, duration,
//             elderName, phone, careType, clientId, stage } = req.body;

//     if (!staffId) return res.status(400).json({ message: "staffId is required" });
//     const task = new Task({
//       elderName:    elderName || "Unknown",
//       phone:        phone     || "N/A",
//       careType:     careType  || "N/A",
//       clientId:     clientId  || null,
//       stage:        stage     || "Enrolled",
//       taskStatus:   "In Progress",
//       assignedTo:   staffId,
//       durationDays: durationHours || null,
//       duration:     duration      || null,
//     });

//     await task.save();

//     const populated = await task.populate("assignedTo", "name role dept service");
//     res.json(populated);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

router.post("/:id/assign", async (req, res) => {
  try {
    const { staffId, durationHours, duration,
            elderName, phone, careType, clientId, stage } = req.body;

    if (!staffId) return res.status(400).json({ message: "staffId is required" });

    const task = new Task({
      elderName:    elderName || "Unknown",
      phone:        phone     || "N/A",
      careType:     careType  || "N/A",
      clientId:     clientId  || null,
      stage:        stage     || "Enrolled",
      taskStatus:   "In Progress",
      assignedTo:   staffId,
      durationDays: durationHours || null,
      duration:     duration      || null,
    });

    await task.save();
    const populated = await task.populate("assignedTo", "name role dept service empId phone");

    // ✅ Client SMS
    await sendSMS(phone,
      `Staff Assigned!\nName: ${populated.assignedTo?.name}\nID: ${populated.assignedTo?.empId}\nPhone: ${populated.assignedTo?.phone}\nService: ${careType}\nDuration: ${duration}\n- HCC Team`
    );

    // ✅ Staff SMS
    await sendSMS(populated.assignedTo?.phone,
      `New Task Assigned!\nPatient: ${elderName}\nID: ${clientId}\nPhone: ${phone}\nService: ${careType}\nDuration: ${duration}\n- HCC Team`
    );

    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// router.post("/:id/complete", async (req, res) => {
//   try {
   
//     const task = await Task.findOne({ 
//       clientId: req.params.id,
//       taskStatus: "In Progress" 
//     }).sort({ createdAt: -1 });

//     if (!task) return res.status(404).json({ message: "No active task found" });

//     task.taskStatus = "Completed";
//     await task.save();

//     const populated = await task.populate("assignedTo", "name role dept service");
//     res.json(populated);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

router.post("/:id/complete", async (req, res) => {
  try {
    const task = await Task.findOne({ 
      clientId: req.params.id,
      taskStatus: "In Progress" 
    }).sort({ createdAt: -1 });

    if (!task) return res.status(404).json({ message: "No active task found" });

    task.taskStatus = "Completed";
    await task.save();

    const populated = await task.populate("assignedTo", "name role dept service phone");

    // ✅ Client SMS
    await sendSMS(task.phone,
      `Dear ${task.elderName}, your ${task.careType} service has been completed successfully. Thank you for choosing us! - HCC Team`
    );

    // ✅ Staff SMS
    await sendSMS(populated.assignedTo?.phone,
      `Dear ${populated.assignedTo?.name}, the task for patient ${task.elderName} (${task.careType}) has been marked as Completed. Great work! - HCC Team`
    );

    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/:id/reopen", async (req, res) => {
  try {
    
    const task = await Task.findOne({ 
      clientId: req.params.id,
      taskStatus: "Completed" 
    }).sort({ createdAt: -1 });

    if (!task) return res.status(404).json({ message: "No completed task found" });

    task.taskStatus = "In Progress";
    await task.save();

    const populated = await task.populate("assignedTo", "name role dept service");
    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
//  STAFF ROUTES
// ═══════════════════════════════════════════════════════════

router.get("/staff", async (req, res) => {
  try {
    const staff = await Staff.find().sort({ name: 1 });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/staff", async (req, res) => {
  try {
    const staff = new Staff(req.body);
    const saved = await staff.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/staff/:id", async (req, res) => {
  try {
    const updated = await Staff.findByIdAndUpdate(
      req.params.id, req.body,
      { returnDocument: "after", runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Staff not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


const getTwilioClient = () => {
  return twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_AUTH
  );
};

const sendSMS = async (to, message) => {
  try {
    if (!to) return;
    
    // Debug
    console.log('TWILIO_SID:', process.env.TWILIO_SID);
    
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
export default router;