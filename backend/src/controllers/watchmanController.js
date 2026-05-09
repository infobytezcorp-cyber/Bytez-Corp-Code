import WatchmanVehicle from "../models/WatchmanVehicle.js";
import WatchmanMaterial from "../models/WatchmanMaterial.js";
import WatchmanStaffInOut from "../models/WatchmanStaffInOut.js";
import WatchmanInmateMove from "../models/WatchmanInmateMove.js";

export const createVehicle = async (req, res) => {
  try {
    const vehicle = await WatchmanVehicle.create(req.body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVehicle = async (req, res) => {
  try {
    const vehicles = await WatchmanVehicle.find().sort({ createdAt: -1 });
    res.json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await WatchmanVehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle record not found" });
    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await WatchmanVehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle record not found" });
    res.json({ success: true, message: "Vehicle record deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMaterial = async (req, res) => {
  try {
    const material = await WatchmanMaterial.create(req.body);
    res.status(201).json({ success: true, data: material });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMaterial = async (req, res) => {
  try {
    const materials = await WatchmanMaterial.find().sort({ createdAt: -1 });
    res.json({ success: true, data: materials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMaterial = async (req, res) => {
  try {
    const material = await WatchmanMaterial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!material) return res.status(404).json({ success: false, message: "Material record not found" });
    res.json({ success: true, data: material });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const material = await WatchmanMaterial.findByIdAndDelete(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: "Material record not found" });
    res.json({ success: true, message: "Material record deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createStaffInOut = async (req, res) => {
  try {
    const staff = await WatchmanStaffInOut.create(req.body);
    res.status(201).json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStaffInOut = async (req, res) => {
  try {
    const staffs = await WatchmanStaffInOut.find().sort({ createdAt: -1 });
    res.json({ success: true, data: staffs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStaffInOut = async (req, res) => {
  try {
    const staff = await WatchmanStaffInOut.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!staff) return res.status(404).json({ success: false, message: "Staff record not found" });
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStaffInOut = async (req, res) => {
  try {
    const staff = await WatchmanStaffInOut.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: "Staff record not found" });
    res.json({ success: true, message: "Staff record deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createInmateMove = async (req, res) => {
  try {
    const move = await WatchmanInmateMove.create(req.body);
    res.status(201).json({ success: true, data: move });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInmateMove = async (req, res) => {
  try {
    const moves = await WatchmanInmateMove.find().sort({ createdAt: -1 });
    res.json({ success: true, data: moves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateInmateMove = async (req, res) => {
  try {
    const move = await WatchmanInmateMove.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!move) return res.status(404).json({ success: false, message: "Inmate move record not found" });
    res.json({ success: true, data: move });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteInmateMove = async (req, res) => {
  try {
    const move = await WatchmanInmateMove.findByIdAndDelete(req.params.id);
    if (!move) return res.status(404).json({ success: false, message: "Inmate move record not found" });
    res.json({ success: true, message: "Inmate move record deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
