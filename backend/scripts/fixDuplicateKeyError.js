import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get the enquiries collection
    const collection = mongoose.connection.collection('enquiries');

    // Drop the old unique index on clientId
    try {
      await collection.dropIndex('clientId_1');
      console.log('✅ Dropped old clientId_1 unique index');
    } catch (err) {
      console.log('ℹ️  clientId_1 index not found (already dropped)');
    }

    // Create new index (non-unique, just for querying)
    await collection.createIndex({ clientId: 1 });
    console.log('✅ Created new clientId index (non-unique)');

    // List all indexes
    const indexes = await collection.getIndexes();
    console.log('\n📋 Current indexes:', indexes);

    console.log('\n✨ Index fix completed! You can now create multiple enquiries for the same client.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixIndexes();
