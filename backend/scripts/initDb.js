import { sequelize } from '../src/config/sqliteDb.js';
import Enquiry from '../src/models/EnquirySQLite.js';

// Initialize SQLite Database
const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing SQLite Database...');
    
    // Authenticate connection
    await sequelize.authenticate();
    console.log('✅ SQLite Connection established');
    
    // Sync all models with database (creates tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synchronized');
    
    console.log('✨ SQLite Database initialized successfully!');
    console.log('📁 Database file: ./data/enquiry.db');
    console.log('📌 Table created: enquiries');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    process.exit(1);
  }
};

initializeDatabase();
