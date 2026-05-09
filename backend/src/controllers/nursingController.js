import NursingVitals from "../models/NursingVitals.js";
import NursingMedical from "../models/NursingMedical.js";
import NursingFood from "../models/NursingFood.js";
import NursingCheckup from "../models/NursingCheckup.js";

export const createVital = async (req, res) => {
  try {
    const vital = await NursingVitals.create(req.body);
    res.status(201).json({ success: true, data: vital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVitals = async (req, res) => {
  try {
    const vitals = await NursingVitals.find().sort({ createdAt: -1 });
    res.json({ success: true, data: vitals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVital = async (req, res) => {
  try {
    const vital = await NursingVitals.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vital) return res.status(404).json({ success: false, message: "Vital not found" });
    res.json({ success: true, data: vital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteVital = async (req, res) => {
  try {
    const vital = await NursingVitals.findByIdAndDelete(req.params.id);
    if (!vital) return res.status(404).json({ success: false, message: "Vital not found" });
    res.json({ success: true, message: "Vital deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMedical = async (req, res) => {
  try {
    const medical = await NursingMedical.create(req.body);
    res.status(201).json({ success: true, data: medical });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMedical = async (req, res) => {
  try {
    const medical = await NursingMedical.find().sort({ createdAt: -1 });
    res.json({ success: true, data: medical });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMedical = async (req, res) => {
  try {
    const medical = await NursingMedical.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!medical) return res.status(404).json({ success: false, message: "Medical record not found" });
    res.json({ success: true, data: medical });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMedical = async (req, res) => {
  try {
    const medical = await NursingMedical.findByIdAndDelete(req.params.id);
    if (!medical) return res.status(404).json({ success: false, message: "Medical record not found" });
    res.json({ success: true, message: "Medical record deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFood = async (req, res) => {
  try {
    const food = await NursingFood.create(req.body);
    res.status(201).json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFood = async (req, res) => {
  try {
    const food = await NursingFood.find().sort({ createdAt: -1 });
    res.json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFood = async (req, res) => {
  try {
    const food = await NursingFood.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!food) return res.status(404).json({ success: false, message: "Food record not found" });
    res.json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFood = async (req, res) => {
  try {
    const food = await NursingFood.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ success: false, message: "Food record not found" });
    res.json({ success: true, message: "Food record deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCheckup = async (req, res) => {
  try {
    const checkup = await NursingCheckup.create(req.body);
    res.status(201).json({ success: true, data: checkup });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCheckup = async (req, res) => {
  try {
    const checkups = await NursingCheckup.find().sort({ createdAt: -1 });
    res.json({ success: true, data: checkups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCheckup = async (req, res) => {
  try {
    const checkup = await NursingCheckup.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!checkup) return res.status(404).json({ success: false, message: "Checkup not found" });
    res.json({ success: true, data: checkup });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCheckup = async (req, res) => {
  try {
    const checkup = await NursingCheckup.findByIdAndDelete(req.params.id);
    if (!checkup) return res.status(404).json({ success: false, message: "Checkup not found" });
    res.json({ success: true, message: "Checkup deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
