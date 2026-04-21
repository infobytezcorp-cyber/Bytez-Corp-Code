// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   phone: {
//     type: String,
//     required: true // ✅ change this
//   },
//   role: {
//     type: String,
//     enum: ["admin", "manager", "user"],
//     default: "user"
//   }
// }, { timestamps: true });

// export default mongoose.model("User", userSchema);

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysqlDb.js';

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'manager', 'user'),
    defaultValue: 'user'
  }
}, { timestamps: true });

export default User;