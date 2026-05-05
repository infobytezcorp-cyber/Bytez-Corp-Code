import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sqliteDb.js';

// Enquiry Model for SQLite using Sequelize
const Enquiry = sequelize.define('Enquiry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  clientId: {
    type: DataTypes.STRING(50),
    allowNull: true,
    index: true, // Index for faster lookups, but not unique (allows multiple rows per client)
  },
  elderName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Elder Name is required',
      },
    },
  },
  familyName: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Phone number is required',
      },
    },
  },
aadhaar: {
  type: DataTypes.STRING(20),
  allowNull: true,
  validate: {
    // Only validate length if a value is actually provided
    lenOrEmpty(value) {
      if (value && value.length !== 12) {
        throw new Error('Aadhar must be 12 digits');
      }
    }
  },
},
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  stage: {
    type: DataTypes.STRING(50),
    defaultValue: 'New Enquiry',
    allowNull: false,
  },
  lead: {
    type: DataTypes.STRING(50),
    defaultValue: '',
    allowNull: true,
    // Valid values: Website, Whatsapp, Facebook, Instagram, LinkedIn, Yellow page, Mail, Tawk.to, Meta Campaigns, Google Campaigns
    // Offline - Referral: Old clients, Existing clients
    // Offline - Professional: Doctor, Medical, Nurse
    // Offline - Unprofessional: Compounder, Electrician, Plumber
    // Offline - Events & Stalls: Camp, Stall, Event
    // Offline - Business Partners: Business partners
  },
  careType: {
    type: DataTypes.STRING(255),
    defaultValue: '',
    allowNull: true,
  },
  timeline: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'enquiries',
  hooks: {
    beforeCreate: async (enquiry) => {
      // Auto-generate unique sequential Client ID if not provided
      if (!enquiry.clientId) {
        const timestamp = Date.now().toString().slice(-5);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        enquiry.clientId = `ENQ${timestamp}${random}`;
        console.log(`✨ Generated ClientID: ${enquiry.clientId}`);
      }
    },
  },
});

export default Enquiry;
