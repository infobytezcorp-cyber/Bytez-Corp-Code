import RecruiterHr from "../models/RecruiterHr.js";

const normalizeInternships = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => ({
      companyName: item?.companyName || "",
      duration: item?.duration || "",
      certificate: item?.certificate || "",
    }))
    .filter((item) => item.companyName || item.duration || item.certificate);
};

export const submitRecruiterHr = async (req, res) => {
  try {
    const payload = req.body || {};
    const doc = {
      recruiterFormId: payload.recruiterFormId || undefined,
      name: payload.name || "",
      contactNumber: payload.contactNumber || payload.phone || "",
      whatsappNumber: payload.whatsappNumber || payload.whatsapp || "",
      guardianName: payload.guardianName || "",
      guardianContactNumber: payload.guardianContactNumber || payload.guardianContact || "",
      aadhaarNumber: payload.aadhaarNumber || "",
      location: payload.location || "",
      tenthPercentage: payload.tenthPercentage || "",
      twelfthPercentage: payload.twelfthPercentage || "",
      qualification: payload.qualification || "",
      collegeName: payload.collegeName || payload.universityOrSchool || "",
      cgpa: payload.cgpa || "",
      domain: payload.domain || payload.previousRole || "",
      skills: payload.skills || "",
      experience: payload.experience || payload.experienceLength || "",
      previousCompanyName: payload.previousCompanyName || payload.companyName || "",
      previousCompanyHrName: payload.previousCompanyHrName || "",
      previousCompanyHrContactNumber: payload.previousCompanyHrContactNumber || payload.hrContact || "",
      internships: normalizeInternships(payload.internships),
      resume: payload.resume || "",
    };

    const created = await RecruiterHr.create(doc);
    return res.status(201).json({ message: "HR details submitted", data: created });
  } catch (err) {
    console.error("submitRecruiterHr error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const listRecruiterHr = async (req, res) => {
  try {
    const { status } = req.query; // Get the status from query params (e.g., 'selected' or 'rejected')
    const filter = status ? { status } : {}; // Filter by status if provided

    const recruiterHrs = await RecruiterHr.find(filter);
    return res.status(200).json({ message: "Recruiter HR list fetched", data: recruiterHrs });
  } catch (err) {
    console.error("listRecruiterHr error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateRecruiterHrStatus = async (req, res) => {
  try {
    const { id } = req.params; // Get the candidate ID from the request params
    const { status } = req.body; // Get the new status from the request body

    if (!["selected", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updated = await RecruiterHr.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    return res.status(200).json({ message: "Candidate status updated", data: updated });
  } catch (err) {
    console.error("updateRecruiterHrStatus error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
