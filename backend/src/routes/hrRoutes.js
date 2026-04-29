// import express from 'express';
// const router = express.Router();
// import Employee from "../models/Hr&Staff.js";

// // @route   POST /api/employees
// // @desc    Add new employee with AUTO-ID generation
// router.post('/', async (req, res) => {
//   try {
//     const { dept } = req.body;

//     // 1. Department Prefix mapping
//     const deptPrefixes = {
//       homecare: "HC",
//       healthcare: "HCC",
//       calls: "CL",
//       it: "IT",
//       nonit: "NIT",
//       labour: "LB"
//     };
//     const pfx = deptPrefixes[dept] || "EMP";

//     // 2. Count current employees in that department to set next ID
//     const count = await Employee.countDocuments({ dept });
//     const nextNumber = 100 + count + 1; // 101-la irundhu start aagum
//     const generatedId = `EMP-${pfx}-${nextNumber}`;

//     // 3. Create employee object with generated ID and default status
//     const newEmployeeData = { 
//       ...req.body, 
//       id: generatedId,
//       status: "Present" 
//     };

//     const newEmployee = new Employee(newEmployeeData);
//     const savedEmployee = await newEmployee.save();
    
//     console.log("✅ Employee Saved with ID:", generatedId);
//     res.status(201).json(savedEmployee);
//   } catch (err) {
//     console.error("❌ Save Error:", err.message);
//     res.status(400).json({ message: "Error saving employee", error: err.message });
//   }
// });

// // @route   GET /api/employees
// router.get('/', async (req, res) => {
//   try {
//     const employees = await Employee.find().sort({ createdAt: -1 });
//     res.json(employees);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching employees", error: err.message });
//   }
// });

// // @route   PUT /api/employees/:id
// router.put('/:id', async (req, res) => {
//   try {
//     const updatedEmployee = await Employee.findOneAndUpdate(
//       { id: req.params.id },
//       req.body,
//       { new: true }
//     );
//     res.json(updatedEmployee);
//   } catch (err) {
//     res.status(400).json({ message: "Error updating employee", error: err.message });
//   }
// });

// // @route   DELETE /api/employees/:id
// router.delete('/:id', async (req, res) => {
//   try {
//     await Employee.findOneAndDelete({ id: req.params.id });
//     res.json({ message: "Employee deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Error deleting employee", error: err.message });
//   }
// });

// export default router;

import express from 'express';
const router = express.Router();
import Employee from "../models/Hr&Staff.js";

// @route   POST /api/employees
// @desc    Add new employee with Duplicate Check & Auto-ID
router.post('/', async (req, res) => {
  try {
    const { mobile, aadhaar, dept } = req.body;

    // 1. Check for duplicates in MongoDB
    const existingEmployee = await Employee.findOne({
      $or: [
        { mobile: mobile },
        { aadhaar: aadhaar }
      ]
    });

    if (existingEmployee) {
      return res.status(400).json({ 
        message: "Employee already exists with this Mobile or Aadhaar number!" 
      });
    }

    // 2. Department Prefix mapping
    const deptPrefixes = {
      homecare: "HC",
      healthcare: "HCC",
      calls: "CL",
      it: "IT",
      nonit: "NIT",
      labour: "LB"
    };
    const pfx = deptPrefixes[dept] || "EMP";

    // 3. Auto-generate ID logic
    const count = await Employee.countDocuments({ dept });
    const nextNumber = 100 + count + 1;
    const generatedId = `EMP-${pfx}-${nextNumber}`;

    // 4. Create and Save
    const newEmployee = new Employee({ 
      ...req.body, 
      id: generatedId,
      status: "Present" 
    });
    console.log("✅ Saving Employee with ID:", newEmployee );
    const savedEmployee = await newEmployee.save();
    res.status(201).json(savedEmployee);
    console.log("✅ Employee Saved:", savedEmployee);

  } catch (err) {
    res.status(500).json({ message: "Error saving employee", error: err.message });
  }
});

// @route   GET /api/employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: "Error fetching employees", error: err.message });
  }
});

export default router;