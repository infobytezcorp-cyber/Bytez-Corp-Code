import Enquiry from "../models/Enquiry.js";
import Agent from "../models/Agent.js";
import Employee from "../models/Hr&Staff.js";

const getStoredAadharDocument = (enquiry) => (
  enquiry?.documents?.aadharDocument ||
  enquiry?.stageDetails?.stage3?.aadharDocument ||
  enquiry?.get?.('stageDetails.stage3.aadharDocument')
);

const getAadharBinaryData = (aadharDoc) => {
  if (!aadharDoc?.data) return null;

  const rawData = aadharDoc.data;

  if (Buffer.isBuffer(rawData)) return rawData;
  if (rawData?.buffer) return Buffer.from(rawData.buffer);
  if (Array.isArray(rawData?.data)) return Buffer.from(rawData.data);
  if (typeof rawData === 'string') {
    const base64String = rawData.includes(',') ? rawData.split(',')[1] : rawData;
    return Buffer.from(base64String, 'base64');
  }

  return null;
};

// ✅ 1. GET all enquiries with date range filtering
export const getAllEnquiries = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    let filter = {};

    // Date range filtering
    if (fromDate || toDate) {
      filter.createdAt = {};

      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = from;
      }

      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = to;
      }
    }

    let enquiries = await Enquiry.find(filter).sort({ createdAt: -1 });

    // Enrich assignedTo: prefer Employee, fallback to Agent if present
    const enriched = await Promise.all(enquiries.map(async (e) => {
      const obj = e.toObject ? e.toObject() : e;
      if (obj.assignedTo) {
        // try Employee
        const emp = await Employee.findById(obj.assignedTo).select('name id mobile dept service role').lean().catch(() => null);
        if (emp) {
          obj.assignedTo = emp;
        } else {
          // try Agent
          const ag = await Agent.findById(obj.assignedTo).select('name status linkedUser').lean().catch(() => null);
          if (ag) {
            obj.assignedTo = { _id: ag._id, name: ag.name, type: 'agent' };
          }
        }
      }
      return obj;
    }));

    res.json(enriched);
  } catch (err) {
    console.error("❌ Get All Enquiries Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ 2. GET enquiries by client ID (all history)
export const getEnquiriesByClientId = async (req, res) => {
  try {
    let enquiries = await Enquiry.find({ clientId: req.params.clientId }).sort({ createdAt: -1 });
    const enriched = await Promise.all(enquiries.map(async (e) => {
      const obj = e.toObject ? e.toObject() : e;
      if (obj.assignedTo) {
        const emp = await Employee.findById(obj.assignedTo).select('name id mobile dept service role').lean().catch(() => null);
        if (emp) obj.assignedTo = emp;
        else {
          const ag = await Agent.findById(obj.assignedTo).select('name status linkedUser').lean().catch(() => null);
          if (ag) obj.assignedTo = { _id: ag._id, name: ag.name, type: 'agent' };
        }
      }
      return obj;
    }));

    if (enquiries.length === 0) {
      return res
        .status(404)
        .json({ message: "No enquiries found for this client" });
    }

    res.json(enquiries);
  } catch (err) {
    console.error("❌ Get Client Enquiries Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ 3. GET single enquiry by ID
export const getEnquiryById = async (req, res) => {
  try {
    let enquiry = await Enquiry.findById(req.params.id);
    if (enquiry) {
      const obj = enquiry.toObject();
      if (obj.assignedTo) {
        const emp = await Employee.findById(obj.assignedTo).select('name id mobile dept service role').lean().catch(() => null);
        if (emp) obj.assignedTo = emp;
        else {
          const ag = await Agent.findById(obj.assignedTo).select('name status linkedUser').lean().catch(() => null);
          if (ag) obj.assignedTo = { _id: ag._id, name: ag.name, type: 'agent' };
        }
      }
      enquiry = obj;
    }

    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    res.json(enquiry);
  } catch (err) {
    console.error("❌ Get Enquiry Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ 4. CREATE new enquiry
export const createEnquiry = async (req, res) => {
  try {
    const { phone, aadhaar, elderName, stage } = req.body;

    // Validate required fields
    if (!phone || !elderName) {
      return res
        .status(400)
        .json({ message: "Phone and Elder Name are required" });
    }

    // Check if enquiry with same phone and aadhaar exists
    let clientId = null;

    if (phone && aadhaar) {
      const existingClient = await Enquiry.findOne({
        phone,
        aadhaar,
      }).sort({ createdAt: -1 });

      if (existingClient) {
        clientId = existingClient.clientId;
      }
    }

    // Create new enquiry
    const enquiry = new Enquiry({
      ...req.body,
      ...(clientId && { clientId }),
    });

    const savedEnquiry = await enquiry.save();

    // Enrich assignedTo for immediate client-side use (Employee or Agent)
    let savedObj = savedEnquiry.toObject ? savedEnquiry.toObject() : savedEnquiry;
    if (savedObj.assignedTo) {
      const emp = await Employee.findById(savedObj.assignedTo).select('name id mobile dept service role').lean().catch(() => null);
      if (emp) savedObj.assignedTo = emp;
      else {
        const ag = await Agent.findById(savedObj.assignedTo).select('name status linkedUser').lean().catch(() => null);
        if (ag) savedObj.assignedTo = { _id: ag._id, name: ag.name, type: 'agent' };
      }
    }

    res.status(201).json({
      message: "Enquiry created successfully",
      enquiry: savedObj,
    });
  } catch (err) {
    console.error("❌ Create Enquiry Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ 5. UPDATE enquiry
export const updateEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    let updates = req.body;

    // Handle Aadhar document from stage3 (check both locations)
    const aadharDoc = updates['stageDetails.stage3']?.aadharDocument || updates.stageDetails?.stage3?.aadharDocument;
    
    if (aadharDoc && aadharDoc.data) {
      // Convert base64 to Buffer (BSON Binary type)
      let binaryData = null;
      try {
        // Remove data URI prefix if present (e.g., "data:image/png;base64,")
        const base64String = aadharDoc.data.includes(',') 
          ? aadharDoc.data.split(',')[1] 
          : aadharDoc.data;
        
        binaryData = Buffer.from(base64String, 'base64');
        console.log(`✅ Converted base64 to binary buffer (${binaryData.length} bytes)`);
      } catch (conversionErr) {
        console.error('❌ Base64 to Buffer conversion error:', conversionErr.message);
        throw new Error('Invalid file data format');
      }

      // Store in documents field
      updates.documents = {
        aadharDocument: {
          fileName: aadharDoc.name || 'aadhar-document',
          fileSize: aadharDoc.size || binaryData?.length || 0,
          fileType: aadharDoc.type || 'application/octet-stream',
          data: binaryData,
          uploadedAt: new Date(),
        },
      };
      
      // Remove from stageDetails to avoid storing base64 string
      if (updates['stageDetails.stage3']) {
        delete updates['stageDetails.stage3'].aadharDocument;
      }
      if (updates.stageDetails?.stage3) {
        delete updates.stageDetails.stage3.aadharDocument;
      }
      
      console.log(`✅ Aadhar document processed and stored in documents field`);
    }

    const rawEnquiry = await Enquiry.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
      runValidators: true,
    });

    let enquiry = rawEnquiry ? (rawEnquiry.toObject ? rawEnquiry.toObject() : rawEnquiry) : null;
    if (enquiry && enquiry.assignedTo) {
      const emp = await Employee.findById(enquiry.assignedTo).select('name id mobile dept service role').lean().catch(() => null);
      if (emp) enquiry.assignedTo = emp;
      else {
        const ag = await Agent.findById(enquiry.assignedTo).select('name status linkedUser').lean().catch(() => null);
        if (ag) enquiry.assignedTo = { _id: ag._id, name: ag.name, type: 'agent' };
      }
    }

    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    console.log(`✅ Enquiry ${id} updated with document handling`);
    res.json({ message: "Enquiry updated successfully", enquiry });
  } catch (err) {
    console.error("❌ Update Enquiry Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ 6. DELETE enquiry
export const deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);

    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    res.json({ message: "Enquiry deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Enquiry Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ 7. UPDATE enquiry stage
export const updateEnquiryStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    if (!stage) {
      return res.status(400).json({ message: "Stage is required" });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      id,
      { stage },
      { returnDocument: 'after', runValidators: true }
    );

    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    res.json({
      message: "Enquiry stage updated successfully",
      enquiry,
    });
  } catch (err) {
    console.error("❌ Update Enquiry Stage Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ 8. ADD timeline entry to enquiry
export const addTimelineEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      id,
      {
        $push: {
          timeline: {
            date: new Date(),
            status,
            notes: notes || "",
          },
        },
      },
      { returnDocument: 'after' }
    );

    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    res.json({
      message: "Timeline entry added successfully",
      enquiry,
    });
  } catch (err) {
    console.error("❌ Add Timeline Entry Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ 9. SEARCH enquiries
export const searchEnquiries = async (req, res) => {
  try {
    const { query, field } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    let searchFilter = {};

    if (field) {
      // Search in specific field
      if (field === "phone" || field === "aadhaar") {
        searchFilter[field] = { $regex: query, $options: "i" };
      } else if (field === "elderName" || field === "familyName") {
        searchFilter[field] = { $regex: query, $options: "i" };
      } else if (field === "clientId") {
        searchFilter[field] = query;
      }
    } else {
      // Search in multiple fields
      searchFilter = {
        $or: [
          { phone: { $regex: query, $options: "i" } },
          { aadhaar: { $regex: query, $options: "i" } },
          { elderName: { $regex: query, $options: "i" } },
          { familyName: { $regex: query, $options: "i" } },
          { clientId: { $regex: query, $options: "i" } },
        ],
      };
    }

    let enquiries = await Enquiry.find(searchFilter).sort({ createdAt: -1 });
    const enriched = await Promise.all(enquiries.map(async (e) => {
      const obj = e.toObject ? e.toObject() : e;
      if (obj.assignedTo) {
        const emp = await Employee.findById(obj.assignedTo).select('name id mobile dept service role').lean().catch(() => null);
        if (emp) obj.assignedTo = emp;
        else {
          const ag = await Agent.findById(obj.assignedTo).select('name status linkedUser').lean().catch(() => null);
          if (ag) obj.assignedTo = { _id: ag._id, name: ag.name, type: 'agent' };
        }
      }
      return obj;
    }));

    res.json(enriched);
  } catch (err) {
    console.error("❌ Search Enquiries Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ 10. GET enquiries by stage
export const getEnquiriesByStage = async (req, res) => {
  try {
    const { stage } = req.params;

    let enquiries = await Enquiry.find({ stage }).sort({ createdAt: -1 });
    const enriched = await Promise.all(enquiries.map(async (e) => {
      const obj = e.toObject ? e.toObject() : e;
      if (obj.assignedTo) {
        const emp = await Employee.findById(obj.assignedTo).select('name id mobile dept service role').lean().catch(() => null);
        if (emp) obj.assignedTo = emp;
        else {
          const ag = await Agent.findById(obj.assignedTo).select('name status linkedUser').lean().catch(() => null);
          if (ag) obj.assignedTo = { _id: ag._id, name: ag.name, type: 'agent' };
        }
      }
      return obj;
    }));

    res.json(enriched);
  } catch (err) {
    console.error("❌ Get Enquiries By Stage Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ 11. ASSIGN enquiry to user
export const assignEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      id,
      { assignedTo: userId },
      { returnDocument: 'after' }
    ).populate("assignedTo");

    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    res.json({
      message: "Enquiry assigned successfully",
      enquiry,
    });
  } catch (err) {
    console.error("❌ Assign Enquiry Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ 12. GET enquiries count by stage or lead (for dashboard)
export const getEnquiriesCountByStage = async (req, res) => {
  try {
    const groupBy = req.query.groupBy === "lead" ? "$lead" : "$stage";
    const { fromDate, toDate, stage, taskStatus } = req.query;
    const match = {};

    if (stage) match.stage = stage;
    if (taskStatus) match.taskStatus = taskStatus;

    if (fromDate || toDate) {
      match.createdAt = {};

      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        match.createdAt.$gte = from;
      }

      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        match.createdAt.$lte = to;
      }
    }

    const counts = await Enquiry.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json(counts);
  } catch (err) {
    console.error("❌ Get Enquiries Count By Stage Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ 13. GET Aadhar document for an enquiry
export const getAadharDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const enquiry = await Enquiry.findById(id);

    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    let documentSource = enquiry;
    let aadharDoc = getStoredAadharDocument(documentSource);

    if (!aadharDoc || !aadharDoc.data) {
      const historyFilter = enquiry.clientId
        ? { clientId: enquiry.clientId }
        : { phone: enquiry.phone, aadhaar: enquiry.aadhaar };
      const history = await Enquiry.find(historyFilter).sort({ createdAt: -1 });
      documentSource = history.find((entry) => getStoredAadharDocument(entry)?.data);
      aadharDoc = getStoredAadharDocument(documentSource);
    }

    const binaryData = getAadharBinaryData(aadharDoc);

    if (!binaryData || binaryData.length === 0) {
      return res.status(404).json({ message: "Aadhar document not found" });
    }

    // Set appropriate headers so PDFs/images can open in the browser.
    res.setHeader('Content-Type', aadharDoc.fileType || aadharDoc.type || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${aadharDoc.fileName || aadharDoc.name || 'aadhar-document'}"`
    );
    res.setHeader('Content-Length', binaryData.length);
    
    res.send(binaryData);

    console.log(`✅ Aadhar document downloaded for enquiry ${documentSource?._id || id} (${binaryData.length} bytes)`);
  } catch (err) {
    console.error("❌ Get Aadhar Document Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
