// import { Sequelize } from 'sequelize';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// // SQLite Database Connection
// const sequelize = new Sequelize({
//   dialect: 'sqlite',
//   storage: process.env.SQLITE_DB_PATH || path.join(__dirname, '../../data/enquiry.db'),
//   logging: false, // Set to true for SQL query logging
// });

// const connectSQLiteDB = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('SQLite Database Connected Successfully');
    
//     // Sync models with database
//     await sequelize.sync({ alter: false }); // Use alter: true to auto-update tables
//     console.log('Database synchronization complete');
//   } catch (error) {
//     console.error('SQLite Connection Error:', error.message);
//     process.exit(1);
//   }
// };

// export { sequelize, connectSQLiteDB };
