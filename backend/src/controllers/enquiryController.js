import Enquiry from "../models/Enquiry.js";

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

    const enquiries = await Enquiry.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json(enquiries);
  } catch (err) {
    console.error("❌ Get All Enquiries Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ 2. GET enquiries by client ID (all history)
export const getEnquiriesByClientId = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({
      clientId: req.params.clientId,
    }).sort({ createdAt: -1 });

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
    const enquiry = await Enquiry.findById(req.params.id);

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

    res.status(201).json({
      message: "Enquiry created successfully",
      enquiry: savedEnquiry,
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
    const updates = req.body;

    const enquiry = await Enquiry.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

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

    const enquiries = await Enquiry.find(searchFilter).sort({
      createdAt: -1,
    });

    res.json(enquiries);
  } catch (err) {
    console.error("❌ Search Enquiries Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ 10. GET enquiries by stage
export const getEnquiriesByStage = async (req, res) => {
  try {
    const { stage } = req.params;

    const enquiries = await Enquiry.find({ stage }).sort({
      createdAt: -1,
    });

    res.json(enquiries);
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

// ✅ 12. GET enquiries count by stage (for dashboard)
export const getEnquiriesCountByStage = async (req, res) => {
  try {
    const counts = await Enquiry.aggregate([
      {
        $group: {
          _id: "$stage",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(counts);
  } catch (err) {
    console.error("❌ Get Enquiries Count By Stage Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
