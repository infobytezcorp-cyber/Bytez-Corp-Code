import express from 'express';
const router = express.Router();
import Employee from "../models/Hr&Staff.js";

const normalizeMobile = (value = '') => {
  const digits = String(value).replace(/\D/g, '');
  return digits.replace(/^91/, '');
};

const normalizeAadhaar = (value = '') => {
  return String(value).replace(/\D/g, '');
};

const regexDigits = (digits) => {
  return digits.split('').join('\\D*');
};

// @route   POST /api/employees
// @desc    Add new employee with Duplicate Check & Auto-ID
router.post('/', async (req, res) => {
  try {
    const rawMobile = req.body.mobile || '';
    const rawAadhaar = req.body.aadhaar || '';
    const mobile = normalizeMobile(rawMobile);
    const aadhaar = normalizeAadhaar(rawAadhaar);
    const { dept } = req.body;

    const duplicateQueries = [];
    if (mobile) {
      const mobileRegex = new RegExp(`^\\D*${regexDigits(mobile)}\\D*$`);
      duplicateQueries.push(
        { mobile: rawMobile },
        { mobile: `+91${mobile}` },
        { mobile: `91${mobile}` },
        { mobile: mobile },
        { mobile: { $regex: mobileRegex } }
      );
    }
    if (aadhaar) {
      const aadhaarRegex = new RegExp(`^\\D*${regexDigits(aadhaar)}\\D*$`);
      duplicateQueries.push(
        { aadhaar: rawAadhaar },
        { aadhaar: aadhaar },
        { aadhaar: { $regex: aadhaarRegex } }
      );
    }

    const existingEmployee = duplicateQueries.length > 0
      ? await Employee.findOne({ $or: duplicateQueries })
      : null;

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
    // console.log("📡 GET /api/hr - Fetching employees...");
    
    // First, check total employees in DB
    const totalCount = await Employee.countDocuments({});
    // console.log("📊 Total employees in DB:", totalCount);
    
    // Fetch employees that are either: not marked inactive OR don't have isActive field (backward compatibility)
    const employees = await Employee.find({ 
      $or: [
        { isActive: true },
        { isActive: { $exists: false } }
      ]
    }).sort({ createdAt: -1 });
    
    // console.log("✅ Active employees found:", employees.length);
    // console.log("📋 Employee IDs:", employees.map(e => e.id).join(", "));
    
    res.json(employees);
  } catch (err) {
    console.error("❌ Error fetching employees:", err.message);
    res.status(500).json({ message: "Error fetching employees", error: err.message });
  }
});

// @route   GET /api/employees/ex-employees
// @desc    Get all deactivated (ex) employees
router.get('/ex-employees/list', async (req, res) => {
  try {
    const exEmployees = await Employee.find({ isActive: false }).sort({ deactivatedAt: -1 });
    res.json(exEmployees);
  } catch (err) {
    res.status(500).json({ message: "Error fetching ex-employees", error: err.message });
  }
});

// @route   PUT /api/employees/:id
// @desc    Update employee details
router.put('/:id', async (req, res) => {
  try {
    const updatedEmployee = await Employee.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(updatedEmployee);
  } catch (err) {
    res.status(400).json({ message: "Error updating employee", error: err.message });
  }
});

// @route   PATCH /api/employees/:id/deactivate
// @desc    Soft delete - mark employee as inactive (moved to ex-employees)
router.patch('/:id/deactivate', async (req, res) => {
  try {
    const updatedEmployee = await Employee.findOneAndUpdate(
      { id: req.params.id },
      { 
        isActive: false,
        deactivatedAt: new Date()
      },
      { new: true }
    );
    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({ message: "Employee moved to ex-employees", employee: updatedEmployee });
  } catch (err) {
    res.status(400).json({ message: "Error deactivating employee", error: err.message });
  }
});

export default router;