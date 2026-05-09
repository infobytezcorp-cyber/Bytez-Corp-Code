import AdminStock from "../models/AdminStock.js";
import AdminRegister from "../models/AdminRegister.js";

const buildStockFilter = ({ dateFrom, dateTo, search }) => {
  const filter = {};

  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom);
    if (dateTo) filter.date.$lte = new Date(dateTo);
  }

  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [
      { itemName: regex },
      { patientName: regex },
      { patientId: regex },
      { purpose: regex },
      { remarks: regex },
      { recordedBy: regex },
      { operation: regex },
    ];
  }

  return filter;
};

const buildAdminFilter = ({ section, dateFrom, dateTo, search, name }) => {
  const filter = {};

  if (section) {
    filter.section = section;
  }

  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom);
    if (dateTo) filter.date.$lte = new Date(dateTo);
  }

  const orClauses = [];
  if (search) {
    const regex = new RegExp(search, "i");
    orClauses.push(
      { name: regex },
      { role: regex },
      { phone: regex },
      { email: regex },
      { category: regex },
      { itemName: regex },
      { patientName: regex },
      { patientId: regex },
      { purpose: regex },
      { remarks: regex },
      { recordedBy: regex },
      { details: regex },
      { operation: regex },
    );
  }

  if (name) {
    const nameRegex = new RegExp(name, "i");
    orClauses.push({ name: nameRegex }, { patientName: nameRegex });
  }

  if (orClauses.length) {
    filter.$or = orClauses;
  }

  return filter;
};

export const createStockRecord = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      quantity: Number(req.body.quantity),
      date: req.body.date ? new Date(req.body.date) : new Date(),
    };

    const record = await AdminStock.create(payload);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStockRecords = async (req, res) => {
  try {
    const filter = buildStockFilter(req.query);
    const records = await AdminStock.find(filter).sort({ date: -1, createdAt: -1 });
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStockRecord = async (req, res) => {
  try {
    const updated = await AdminStock.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        quantity: Number(req.body.quantity),
        date: req.body.date ? new Date(req.body.date) : new Date(),
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Stock record not found" });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStockRecord = async (req, res) => {
  try {
    const deleted = await AdminStock.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Stock record not found" });
    res.json({ success: true, message: "Stock record deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStockSummary = async (req, res) => {
  try {
    const filter = buildStockFilter(req.query);
    const summary = await AdminStock.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$itemName",
          totalReceived: {
            $sum: {
              $cond: [{ $eq: ["$operation", "received"] }, "$quantity", 0],
            },
          },
          totalUsed: {
            $sum: {
              $cond: [{ $eq: ["$operation", "used"] }, "$quantity", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          itemName: "$_id",
          totalReceived: 1,
          totalUsed: 1,
          balance: { $subtract: ["$totalReceived", "$totalUsed"] },
        },
      },
      { $sort: { itemName: 1 } },
    ]);

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdminRecord = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      amount: Number(req.body.amount) || 0,
      quantity: Number(req.body.quantity) || 0,
      date: req.body.date ? new Date(req.body.date) : new Date(),
    };

    const record = await AdminRegister.create(payload);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminRecords = async (req, res) => {
  try {
    const filter = buildAdminFilter(req.query);
    const records = await AdminRegister.find(filter).sort({ date: -1, createdAt: -1 });
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminRecord = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      amount: Number(req.body.amount) || 0,
      quantity: Number(req.body.quantity) || 0,
      date: req.body.date ? new Date(req.body.date) : new Date(),
    };
    const record = await AdminRegister.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!record) return res.status(404).json({ success: false, message: "Record not found" });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdminRecord = async (req, res) => {
  try {
    const record = await AdminRegister.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Record not found" });
    res.json({ success: true, message: "Record deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
