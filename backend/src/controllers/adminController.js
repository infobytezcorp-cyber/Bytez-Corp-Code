import AdminStock from "../models/AdminStock.js";
import AdminRegister from "../models/AdminRegister.js";
import xlsx from "xlsx";

const buildStockFilter = ({ dateFrom, dateTo, search, status }) => {
  const filter = {};

  if (status) {
    filter.status = status;
  }

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

const isAdminStockSection = (section = "") => section.startsWith("stock-");

const calculateRegisterClosingStock = (body) => {
  const openingStock = Number(body.openingStock) || 0;
  const received = Number(body.received) || 0;
  const issued = Number(body.issued) || 0;
  return Math.max(openingStock + received - issued, 0);
};

const getRegisterStockState = (body) => {
  const closingStock = Number(body.closingStock ?? calculateRegisterClosingStock(body)) || 0;
  if (closingStock <= 0) return { freshnessStatus: "Out of Stock", expiredItems: "No" };

  const expiryDate = body.expiryDate ? new Date(body.expiryDate) : null;
  if (!expiryDate || Number.isNaN(expiryDate.getTime())) {
    return { freshnessStatus: closingStock <= 10 ? "Low Stock" : "Available", expiredItems: "No" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiryDate.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return { freshnessStatus: "Expired", expiredItems: "Yes" };
  if (diffDays <= 7) return { freshnessStatus: "Near Expiry", expiredItems: "No" };
  if (closingStock <= 10) return { freshnessStatus: "Low Stock", expiredItems: "No" };
  return { freshnessStatus: "Fresh", expiredItems: "No" };
};

const normalizeAdminPayload = (body) => {
  const payload = {
    ...body,
    amount: Number(body.amount) || 0,
    quantity: Number(body.quantity) || 0,
    date: body.date ? new Date(body.date) : new Date(),
  };

  if (isAdminStockSection(payload.section)) {
    payload.openingStock = Number(body.openingStock) || 0;
    payload.received = Number(body.received) || 0;
    payload.issued = Number(body.issued) || 0;
    payload.closingStock = calculateRegisterClosingStock(payload);
    payload.expiryDate = body.expiryDate ? new Date(body.expiryDate) : undefined;
    Object.assign(payload, getRegisterStockState(payload));
  }

  return payload;
};

export const createStockRecord = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      quantity: Number(req.body.quantity),
      status: req.body.status || "Pending",
      date: req.body.date ? new Date(req.body.date) : new Date(),
      expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined,
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
        status: req.body.status || "Pending",
        date: req.body.date ? new Date(req.body.date) : new Date(),
        expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined,
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
        $addFields: {
          expirationState: {
            $switch: {
              branches: [
                { case: { $lt: ["$expiryDate", new Date()] }, then: "expired" },
                {
                  case: {
                    $and: [
                      { $gte: ["$expiryDate", new Date()] },
                      { $lte: ["$expiryDate", new Date(new Date().setDate(new Date().getDate() + 7))] },
                    ],
                  },
                  then: "nearExpiry",
                },
              ],
              default: "normal",
            },
          },
        },
      },
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
          expiredCount: {
            $sum: {
              $cond: [{ $eq: ["$expirationState", "expired"] }, 1, 0],
            },
          },
          nearExpiryCount: {
            $sum: {
              $cond: [{ $eq: ["$expirationState", "nearExpiry"] }, 1, 0],
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
          expiredCount: 1,
          nearExpiryCount: 1,
        },
      },
      { $sort: { itemName: 1 } },
    ]);

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const normalizeSheetRow = (row) => {
  const normalized = Object.entries(row).reduce((acc, [key, value]) => {
    const normalizedKey = key ? key.toString().trim().toLowerCase() : "";
    acc[normalizedKey] = value;
    return acc;
  }, {});

  const value = (...keys) => {
    for (const key of keys) {
      const normalizedKey = key.toString().trim().toLowerCase();
      if (normalized[normalizedKey] !== undefined && normalized[normalizedKey] !== null) {
        return normalized[normalizedKey];
      }
    }
    return "";
  };

  return {
    itemName: String(value("item name", "item", "itemname", "name", "product") || "").trim(),
    operation: String(value("operation", "action", "type", "transaction", "movement") || "received").trim().toLowerCase(),
    quantity: Number(value("quantity", "qty", "amount", "count") || 0),
    unit: String(value("unit", "uom", "measurement") || "pcs").trim(),
    date: value("date", "transaction date", "received date", "delivery date") || new Date(),
    recordedBy: String(value("recorded by", "recordedby", "recorded", "staff", "operator", "user") || "").trim(),
    patientName: String(value("patient name", "patientname", "patient", "customer name", "vendor", "supplier") || "").trim(),
    patientId: String(value("patient id", "patientid", "id", "ref no", "reference") || "").trim(),
    purpose: String(value("purpose", "usage", "notes", "description", "reason") || "").trim(),
    remarks: String(value("remarks", "note", "notes", "comments") || "").trim(),
    status: String(value("status", "stock status", "freshness", "condition") || "Pending").trim(),
    expiryDate: value("expiry date", "expiration date", "exp date", "best before", "expiry") || null,
  };
};

export const uploadStockFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const rows = workbook.SheetNames.flatMap((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) return [];
      return xlsx.utils.sheet_to_json(sheet, { defval: "" });
    });

    const records = rows
      .map((row) => normalizeSheetRow(row))
      .filter((record) => record.itemName && record.quantity > 0);

    if (!records.length) {
      return res.status(400).json({ success: false, message: "Uploaded sheet did not contain any valid stock rows" });
    }

    const createdRecords = await AdminStock.insertMany(
      records.map((record) => ({
        ...record,
        operation: record.operation || "received",
        status: record.status || "Pending",
        quantity: Number(record.quantity) || 0,
        date: record.date ? new Date(record.date) : new Date(),
        expiryDate: record.expiryDate ? new Date(record.expiryDate) : undefined,
      }))
    );

    res.status(201).json({ success: true, data: createdRecords, count: createdRecords.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdminRecord = async (req, res) => {
  try {
    const payload = normalizeAdminPayload(req.body);

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
    const payload = normalizeAdminPayload(req.body);
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
