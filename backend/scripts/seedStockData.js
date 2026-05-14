import mongoose from "mongoose";
import AdminStock from "../src/models/AdminStock.js";
import dotenv from "dotenv";

dotenv.config();

const STOCK_ITEMS = [
  "Gloves",
  "Catheter",
  "Underpad / Rubber Sheet",
  "Syringe",
  "Mask",
  "Bandages",
  "Antiseptic",
  "Gauze",
];

const STAFF_NAMES = ["admin", "nurse_1", "nurse_2", "doctor_1", "supervisor"];

const generateDummyStockData = () => {
  const dummyRecords = [];
  const today = new Date();

  // Generate records for last 60 days
  for (let daysAgo = 60; daysAgo >= 0; daysAgo--) {
    const recordDate = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // 2-4 transactions per day
    const transactionsPerDay = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < transactionsPerDay; i++) {
      const item = STOCK_ITEMS[Math.floor(Math.random() * STOCK_ITEMS.length)];
      const operation = Math.random() > 0.6 ? "used" : "received";
      const quantity = Math.floor(Math.random() * 100) + 10;
      const staff = STAFF_NAMES[Math.floor(Math.random() * STAFF_NAMES.length)];

      // 20% chance of setting expiry date
      let expiryDate = null;
      if (Math.random() > 0.8) {
        const daysUntilExpiry = Math.floor(Math.random() * 120) - 30; // -30 to +90 days
        expiryDate = new Date(today.getTime() + daysUntilExpiry * 24 * 60 * 60 * 1000);
      }

      // Determine status based on expiry
      let status = "Pending";
      if (expiryDate) {
        const daysUntilExpiry = Math.floor(
          (expiryDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
        );
        if (daysUntilExpiry < 0) status = "Expired";
        else if (daysUntilExpiry <= 7) status = "Near Expiry";
        else if (daysUntilExpiry <= 30) status = "Fresh";
        else status = "Available";
      } else {
        status = Math.random() > 0.5 ? "Pending" : "Verified";
      }

      dummyRecords.push({
        itemName: item,
        operation,
        quantity,
        unit: ["pcs", "kg", "litre", "box"][Math.floor(Math.random() * 4)],
        date: recordDate,
        expiryDate,
        recordedBy: staff,
        patientName: operation === "used" ? `Patient_${Math.floor(Math.random() * 50) + 1}` : "",
        patientId: operation === "used" ? `P${String(Math.floor(Math.random() * 999) + 1).padStart(4, "0")}` : "",
        purpose: operation === "used" ? "Medical use" : "Stock refill",
        remarks:
          Math.random() > 0.7
            ? ["New batch", "Replacement", "Regular stock", "Emergency"][
                Math.floor(Math.random() * 4)
              ]
            : "",
        status,
      });
    }
  }

  return dummyRecords;
};

const seedStockData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/bytez-corp";

    console.log(`🔗 Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log("✅ Connected to MongoDB");

    // Clear existing stock data
    const deleteResult = await AdminStock.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing stock records`);

    // Generate and insert dummy data
    const dummyData = generateDummyStockData();
    console.log(`📝 Generating ${dummyData.length} dummy stock records...`);

    const inserted = await AdminStock.insertMany(dummyData);
    console.log(`✅ Successfully inserted ${inserted.length} stock records`);

    // Show summary
    const summary = await AdminStock.aggregate([
      {
        $group: {
          _id: "$itemName",
          count: { $sum: 1 },
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
          count: 1,
          totalReceived: 1,
          totalUsed: 1,
          balance: { $subtract: ["$totalReceived", "$totalUsed"] },
        },
      },
      { $sort: { itemName: 1 } },
    ]);

    console.log("\n📊 Stock Summary by Item:\n");
    console.table(summary);

    const statusSummary = await AdminStock.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    console.log("\n📈 Status Distribution:\n");
    console.table(statusSummary);

    console.log(
      "\n✨ Dummy stock data seeded successfully! You can now test the Stock Monitor feature."
    );

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding stock data:", error.message);
    process.exit(1);
  }
};

seedStockData();
