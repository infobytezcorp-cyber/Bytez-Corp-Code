import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from '../src/config/sqliteDb.js';
import Enquiry from '../src/models/EnquirySQLite.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../data/enquiry.db');

console.log('📊 SQLite Database Viewer');
console.log('==========================');
console.log(`📁 Database Path: ${dbPath}\n`);

// First sync models to ensure tables exist
await sequelize.sync({ alter: true });
console.log('✅ Database synced\n');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Cannot open database:', err.message);
    process.exit(1);
  }

  console.log('✅ Connected to SQLite database\n');

  // Get all tables
  db.all(`SELECT name FROM sqlite_master WHERE type='table'`, (err, tables) => {
    if (err) {
      console.error('❌ Error reading tables:', err.message);
      db.close();
      process.exit(1);
    }

    if (tables.length === 0) {
      console.log('📭 No tables found in database');
      db.close();
      process.exit(0);
    }

    console.log(`📋 Tables Found: ${tables.length}\n`);

    let tableCount = 0;

    tables.forEach((table) => {
      // Get table structure
      db.all(`PRAGMA table_info(${table.name})`, (err, columns) => {
        if (!err && columns) {
          console.log(`📌 Table: ${table.name}`);
          console.log('Columns:');
          columns.forEach((col) => {
            console.log(`  - ${col.name} (${col.type})`);
          });

          // Count rows
          db.get(`SELECT COUNT(*) as count FROM ${table.name}`, (err, result) => {
            if (!err) {
              console.log(`📊 Total Records: ${result.count}`);

              // Get all records
              if (result.count > 0) {
                db.all(`SELECT * FROM ${table.name}`, (err, rows) => {
                  if (!err && rows.length > 0) {
                    console.log('Data:');
                    console.log(JSON.stringify(rows, null, 2));
                  }
                  console.log('\n---\n');
                  tableCount++;
                  if (tableCount === tables.length) {
                    db.close();
                    process.exit(0);
                  }
                });
              } else {
                console.log('No records found\n---\n');
                tableCount++;
                if (tableCount === tables.length) {
                  db.close();
                  process.exit(0);
                }
              }
            }
          });
        }
      });
    });

    // Fallback close
    setTimeout(() => {
      db.close();
      process.exit(0);
    }, 3000);
  });
});
