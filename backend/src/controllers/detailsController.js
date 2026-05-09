import VisitDetails from "../models/VisitDetails.js";

export const saveDetails = async (req, res) => {
  try {
    const {
      visitorId,
      visitType,
      visitorCategory,
      name,
      phone,
      email,
      aadhaarnumber,
      bloodGroup,
      purpose,
      visitPerson,
      jobRole,
      experience,
      address
    } = req.body;

    // validation
    if (!visitorId || !visitType) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const details = await VisitDetails.create({
      visitorId,
      visitType,
      visitorCategory: visitType === "job" ? undefined : visitorCategory || "normal",
      name,
      phone,
      email,
      aadhaarnumber,
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

export const getNormalEnquiries = async (req, res) => {
  try {
    const data = await VisitDetails.find({ visitType: "visitor" })
      .populate("visitorId");

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};