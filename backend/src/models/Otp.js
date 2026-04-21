// import mongoose from "mongoose";

// const otpSchema = new mongoose.Schema({
//   phone: String,
//   otp: String,
//   expiresAt: Date,
// });

// export default mongoose.model("Otp", otpSchema);

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysqlDb.js';

const Otp = sequelize.define('Otp', {
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, { timestamps: false }); // OTP-ku eppovumae timestamps thevaiyilla

export default Otp;