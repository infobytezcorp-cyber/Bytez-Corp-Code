import VisitDetails from "../models/VisitDetails.js";

export const saveDetails = async (req, res) => {
  try {
    const {
      visitorId,
      visitType,
      name,
      phone,
      email,
      authorNumber,
      bloodGroup,
      purpose,
      visitPerson,
      jobRole,
      experience,
      address
    } = req.body;

    // ✅ validation
    if (!visitorId || !visitType) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // ✅ create data
    const details = await VisitDetails.create({
      visitorId,
      visitType,
      name,
      phone,
      email,
      authorNumber,
      bloodGroup,
      purpose,
      visitPerson,
      jobRole,
      experience,
      address
    });

    res.status(201).json(details);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getJobEnquiries = async (req, res) => {
  try {
    const data = await VisitDetails.find({ visitType: "job" })
      .populate("visitorId");

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};