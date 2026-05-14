import RecruiterForm from "../models/RecruiterForm.js";

export const submitForm = async (req, res) => {
  try {
    const payload = req.body || {};

    // Basic normalization
    const doc = {
      name: payload.name || payload.NAME || "",
      age: payload.age ? Number(payload.age) : payload.AGE ? Number(payload.AGE) : undefined,
      dob: payload.dob || payload.dateOfBirth || payload.DOB || null,
      gender: payload.gender || "",
      address: payload.address || payload.fullAddress || "",
      phone: payload.phone || payload.phoneNumber || "",
      whatsapp: payload.whatsapp || payload.whatsAppNumber || "",
      email: payload.email || payload.emailId || "",
      maritalStatus: payload.maritalStatus || "",
      guardianType: payload.guardian || "",
      guardianName: payload.guardianName || "",
      guardianContact: payload.guardianContact || "",
      permanentAddress: payload.permanentAddress || "",
      knownLanguages: Array.isArray(payload.knownLanguages) ? payload.knownLanguages : (payload.knownLanguages ? String(payload.knownLanguages).split(/[,;|]/).map(s=>s.trim()) : []),
      qualification: payload.qualification || "",
      course: payload.course || payload.whatCourse || "",
      universityOrSchool: payload.universityOrSchool || payload.universityName || "",
      passOutYear: payload.passOutYear || payload.passOutYear || "",
      computerSkill: payload.computerSkill === true || payload.computerSkill === 'yes' || payload.computerSkill === 'true',
      computerSkills: payload.computerSkills || payload.whatComputerSkills || "",
      extraCurricular: payload.extraCurricular || payload.extraCurricularActivities || "",
      fresherOrExperience: payload.fresherOrExperience || payload.fresherOrExperience || "",
      experienceLength: payload.experienceLength || payload.lengthOfWorkExperience || "",
      companyName: payload.companyName || "",
      hrContact: payload.hrContact || "",
      previousRole: payload.previousRole || payload.domain || "",
      previousSalary: payload.previousSalary || payload.previousOfficeSalaryDetails || "",
      previousWorkingTime: payload.previousWorkingTime || payload.previousOfficeWorkingTime || "",
      aadharPhoto: payload.aadharPhoto || payload.aadharPhotoBase64 || "",
      recentPhoto: payload.recentPhoto || payload.recentPhotoBase64 || "",
      drivingLicense: payload.drivingLicense || payload.drivingLicenseBase64 || "",
      jobLookingFor: payload.jobLookingFor || payload.jobLooking || "",
      expectedSalary: payload.expectedSalary || "",
      expectedWorkingTime: payload.expectedWorkingTime || "",
      planningDurationType: payload.planningDurationType || payload.planDurationType || "",
      shortTermOption: payload.shortTermOption || "",
      longTermOption: payload.longTermOption || "",
      resume: payload.resume || payload.resumeBase64 || "",
      raw: payload,
    };

    // Convert dob if parseable
    if (doc.dob) {
      const parsed = Date.parse(String(doc.dob));
      if (!isNaN(parsed)) doc.dob = new Date(parsed);
      else doc.dob = null;
    }

    const created = await RecruiterForm.create(doc);
    return res.status(201).json({ message: "Form submitted", data: created });
  } catch (err) {
    console.error("submitForm error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const listForms = async (req, res) => {
  try {
    const limit = Math.min(1000, parseInt(req.query.limit || "200", 10));
    const status = String(req.query.status || "").toLowerCase();
    const query = {};

    if (status) {
      query.status = status;
    } else {
      query.status = { $nin: ["selected", "rejected"] };
    }

    const docs = await RecruiterForm.find(query).sort({ createdAt: -1 }).limit(limit).lean();
    return res.status(200).json({ data: docs });
  } catch (err) {
    console.error("listForms error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const markFormStatus = async (req, res) => {
  try {
    const { id, status } = req.body || {};
    if (!id || !status) return res.status(400).json({ message: "id and status required" });
    if (!["open", "selected", "rejected"].includes(status)) {
      return res.status(400).json({ message: "invalid status" });
    }

    const doc = await RecruiterForm.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!doc) return res.status(404).json({ message: "not found" });
    return res.status(200).json({ message: "updated", data: doc });
  } catch (err) {
    console.error("markFormStatus error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
