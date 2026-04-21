// import mongoose from "mongoose";

// const visitDetailsSchema = new mongoose.Schema({

//   // 🔗 Link with Visitor (OTP record)
//   visitorId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Visitor",
//     required: true
//   },

//   // 🔹 Type
//   visitType: {
//     type: String,
//     enum: ["visitor", "job"],
//     required: true
//   },

//   // 🔹 Personal Info
//   name: String,          // optional duplicate (for quick access)
//   phone: String,         // optional duplicate
//   email: String,
//   authorNumber: String,
//   bloodGroup: String,

//   // 🔹 Visitor Fields
//   purpose: String,
//   visitPerson: String,

//   // 🔹 Job Fields
//   jobRole: String,
//   experience: String,

//   // 🔹 Address
//   address: String,

// }, { timestamps: true });

// export default mongoose.model("VisitDetails", visitDetailsSchema);

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysqlDb.js';
import Visitor from './VisitorModule.js';

const VisitDetails = sequelize.define('VisitDetails', {
  visitType: {
    type: DataTypes.ENUM('visitor', 'job'),
    allowNull: false
  },
  name: DataTypes.STRING,
  phone: DataTypes.STRING,
  email: DataTypes.STRING,
  authorNumber: DataTypes.STRING, // Idhu dhaan unga Aadhar/ID field
  bloodGroup: DataTypes.STRING,
  purpose: DataTypes.STRING,
  visitPerson: DataTypes.STRING,
  jobRole: DataTypes.STRING,
  experience: DataTypes.STRING,
  address: DataTypes.TEXT
}, { timestamps: true });

// 🔗 Relationship Setup (ForeignKey)
Visitor.hasMany(VisitDetails, { foreignKey: 'visitorId', onDelete: 'CASCADE' });
VisitDetails.belongsTo(Visitor, { foreignKey: 'visitorId' });

export default VisitDetails;