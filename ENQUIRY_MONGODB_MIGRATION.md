# Enquiry MongoDB Migration Guide

## ✅ Completed Changes

Your Enquiry module has been fully migrated from SQLite/Sequelize to MongoDB/Mongoose. Here's what was done:

### 1. **Enquiry Model** (`src/models/Enquiry.js`)
   - Converted from Sequelize ORM to Mongoose ODM
   - Maintains all fields: `clientId`, `elderName`, `familyName`, `phone`, `aadhaar`, `email`, `stage`, `lead`, `careType`, `timeline`, `notes`, `assignedTo`
   - Auto-generates unique `clientId` on save
   - Proper validation for all fields
   - Timestamps automatically handled by MongoDB

### 2. **Enquiry Controller** (`src/controllers/enquiryController.js`) - NEW
   - 12 comprehensive API handlers:
     - `getAllEnquiries()` - Get all with date range filtering
     - `getEnquiriesByClientId()` - Get by client ID
     - `getEnquiryById()` - Get single enquiry
     - `createEnquiry()` - Create new
     - `updateEnquiry()` - Update enquiry
     - `deleteEnquiry()` - Delete enquiry
     - `updateEnquiryStage()` - Change stage
     - `addTimelineEntry()` - Add timeline history
     - `searchEnquiries()` - Search across fields
     - `getEnquiriesByStage()` - Filter by stage
     - `assignEnquiry()` - Assign to user
     - `getEnquiriesCountByStage()` - Dashboard stats

### 3. **Enquiry Routes** (`src/routes/enquiryRoutes.js`)
   - Uncommented and updated to use MongoDB
   - All routes properly mapped to controller methods
   - Includes POST, GET, PUT, PATCH, DELETE operations

### 4. **Server Configuration** (`server.js`)
   - Added enquiry routes to Express app
   - Route accessible at `/api/enquiries`
   - Added PATCH method to CORS for updates

### 5. **Migration Script** (`scripts/migrateEnquiries.js`)
   - Creates MongoDB indexes for performance
   - Ready to import existing SQLite data

---

## 🚀 API Endpoints

### Get All Enquiries
```
GET /api/enquiries?fromDate=2024-01-01&toDate=2024-12-31
```

### Get by Client ID
```
GET /api/enquiries/client/:clientId
```

### Get Single Enquiry
```
GET /api/enquiries/:id
```

### Create Enquiry
```
POST /api/enquiries
Body: {
  "elderName": "John Doe",
  "familyName": "Doe Family",
  "phone": "9876543210",
  "aadhaar": "123456789012",
  "email": "john@example.com",
  "stage": "New Enquiry",
  "lead": "Website",
  "careType": "ElderCare"
}
```

### Update Enquiry
```
PUT /api/enquiries/:id
Body: { ...any fields to update }
```

### Update Stage
```
PATCH /api/enquiries/:id/stage
Body: { "stage": "In Progress" }
```

### Add Timeline Entry
```
POST /api/enquiries/:id/timeline
Body: {
  "status": "Contacted",
  "notes": "Client available on weekends"
}
```

### Search Enquiries
```
GET /api/enquiries/search?query=9876543210&field=phone
```

### Get by Stage
```
GET /api/enquiries/stage/New Enquiry
```

### Assign to User
```
PATCH /api/enquiries/:id/assign
Body: { "userId": "userId123" }
```

### Get Count by Stage (Dashboard)
```
GET /api/enquiries/stats/count-by-stage
```

### Delete Enquiry
```
DELETE /api/enquiries/:id
```

---

## 🔧 Running the Migration

If you have existing SQLite data:

1. **Export your SQLite data** to JSON format
2. **Update migration script** (`scripts/migrateEnquiries.js`):
   ```javascript
   const sqliteEnquiries = require('./yourExportedData.json');
   const mongoEnquiries = sqliteEnquiries.map(enquiry => ({
     ...enquiry,
     timeline: enquiry.timeline ? JSON.parse(enquiry.timeline) : []
   }));
   await Enquiry.insertMany(mongoEnquiries);
   ```
3. **Run the script**:
   ```bash
   node scripts/migrateEnquiries.js
   ```

---

## 📦 Dependencies

The following packages should already be in your `package.json`:
- `mongoose` - MongoDB ODM
- `express` - Web framework

If not, install them:
```bash
npm install mongoose express
```

---

## ✨ Key Features

✅ **Auto-generated Client IDs** - Each enquiry gets a unique ID automatically
✅ **Timeline Tracking** - Complete history of interactions
✅ **Advanced Search** - Search across multiple fields
✅ **Stage Management** - Track enquiry progress
✅ **User Assignment** - Assign enquiries to team members
✅ **Date Range Filtering** - Query by date range
✅ **Dashboard Stats** - Get count by stage for analytics

---

## 📝 Environment Variables Required

Make sure your `.env` has:
```
MONGO_URI=mongodb://username:password@host:port/database
```

---

## 🎯 Next Steps

1. ✅ Test API endpoints using Postman or Thunder Client
2. ✅ Update Frontend to use `/api/enquiries` endpoints
3. ✅ Update any enquiry service files in your frontend
4. ✅ Run database migration if you have existing data
5. ✅ Deploy to production

---

## 📞 Support

If you need help or have questions, check:
- MongoDB documentation: https://docs.mongodb.com/
- Mongoose documentation: https://mongoosejs.com/
- Your backend logs for error messages

---

**Migration completed successfully! Your Enquiry module is now fully MongoDB-compatible.** 🎉
