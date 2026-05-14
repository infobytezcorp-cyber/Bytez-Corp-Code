import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Enquiry from "../src/models/Enquiry.js";

const migrateEnquiriesFromSQLite = async () => {
  try {
    console.log("🔄 Starting Enquiry Migration from SQLite to MongoDB...");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // This is a placeholder for your SQLite data
    // If you have existing SQLite data, you would import it here
    // For now, we'll just initialize an empty collection with proper indexes

    // Create indexes for better query performance
    await Enquiry.collection.createIndex({ clientId: 1 });
    await Enquiry.collection.createIndex({ phone: 1 });
    await Enquiry.collection.createIndex({ createdAt: 1 });
    await Enquiry.collection.createIndex({ stage: 1 });

    console.log("✅ Indexes created successfully");

    // If you have SQLite data to migrate, use this pattern:
    // const sqliteEnquiries = await getDataFromSQLite(); // Your SQLite query
    // const mongoEnquiries = sqliteEnquiries.map(enquiry => ({
    //   ...enquiry,
    //   timeline: enquiry.timeline ? JSON.parse(enquiry.timeline) : []
    // }));
    // await Enquiry.insertMany(mongoEnquiries);
    // console.log(`✅ Migrated ${mongoEnquiries.length} enquiries`);

    console.log("✅ Migration setup completed!");
    console.log(
      "📌 If you have existing SQLite data, modify this script to import it."
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration Error:", error.message);
    process.exit(1);
  }
};

migrateEnquiriesFromSQLite();
