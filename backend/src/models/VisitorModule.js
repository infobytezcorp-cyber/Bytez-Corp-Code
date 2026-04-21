// import mongoose from "mongoose";

// const visitorSchema = new mongoose.Schema({
//   name: String,
//   phone: String,
//   purpose: String,
//   checkInTime: Date,
//   checkOutTime: Date,
//   status: {
//     type: String,
//     default: "Checked-In",
//   },
// }, { timestamps: true });

// export default mongoose.model("Visitor", visitorSchema);

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysqlDb.js';

const Visitor = sequelize.define('Visitor', {
  name: DataTypes.STRING,
  phone: DataTypes.STRING,
  purpose: DataTypes.STRING,
  checkInTime: DataTypes.DATE,
  checkOutTime: DataTypes.DATE,
  status: {
    type: DataTypes.STRING,
    defaultValue: "Checked-In",
  }
}, { timestamps: true });

export default Visitor;