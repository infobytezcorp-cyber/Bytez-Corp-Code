# Bytez Corp CRM - Enquiry API Documentation

## Overview
Complete API endpoints for managing enquiries with date filtering, lead categorization, and Google Forms integration.

---

## Base URL
```
http://localhost:8000/api/enquiries
```

---

## 📋 Endpoints

### 1. GET All Enquiries with Date Filtering
**Endpoint:** `GET /api/enquiries`

**Query Parameters:**
- `fromDate` (optional): Start date in YYYY-MM-DD format
- `toDate` (optional): End date in YYYY-MM-DD format

**Example:**
```
GET /api/enquiries?fromDate=2024-08-01&toDate=2024-09-30
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "clientId": "CLI001",
    "elderName": "Ramesh Kumar",
    "phone": "9876543210",
    "email": "ramesh@email.com",
    "careType": "Day Care",
    "stage": "New Enquiry",
    "source": "Website",
    "aadhaar": "1234567890123456",
    "createdAt": "2024-10-04T10:30:00Z",
    "updatedAt": "2024-10-04T10:30:00Z"
  }
]
```

---

### 2. GET Enquiries by Client ID
**Endpoint:** `GET /api/enquiries/client/:clientId`

**Example:**
```
GET /api/enquiries/client/CLI001
```

**Response:** Array of all enquiries for that client (showing complete history)

---

### 3. GET Single Enquiry
**Endpoint:** `GET /api/enquiries/:id`

**Example:**
```
GET /api/enquiries/507f1f77bcf86cd799439011
```

**Response:** Single enquiry object

---

### 4. CREATE New Enquiry (Google Form Integration)
**Endpoint:** `POST /api/enquiries`

**Request Body:**
```json
{
  "elderName": "Ramesh Kumar",
  "familyName": "Kumar Family",
  "phone": "9876543210",
  "email": "ramesh@email.com",
  "aadhaar": "1234567890123456",
  "careType": "Day Care",
  "source": "Website",
  "stage": "New Enquiry"
}
```

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "clientId": "CLI001",
  "elderName": "Ramesh Kumar",
  "createdAt": "2024-10-04T10:30:00Z",
  ...
}
```

---

### 5. UPDATE Enquiry
**Endpoint:** `PUT /api/enquiries/:id`

**Request Body:**
```json
{
  "stage": "Contact",
  "careType": "Home Nursing 12/7"
}
```

**Response:** Updated enquiry object

---

### 6. DELETE Enquiry
**Endpoint:** `DELETE /api/enquiries/:id`

**Response:**
```json
{
  "message": "Enquiry deleted successfully"
}
```

---

### 7. FILTER Enquiries (Advanced)
**Endpoint:** `POST /api/enquiries/filter`

**Request Body:**
```json
{
  "stage": "New Enquiry",
  "lead": "Website",
  "careType": "Day Care",
  "fromDate": "2024-08-01",
  "toDate": "2024-09-30"
}
```

**Response:** Array of filtered enquiries

---

## 🎯 Lead Categories

### Online Leads
- Website
- Whatsapp
- Facebook
- Instagram
- LinkedIn
- Yellow page
- Mail

### Offline Leads
- Referral cold clients
- Existing clients
- Doctors
- Business partners

---

## 📊 CRM Stages

1. **New Enquiry** - Initial contact
2. **Contact** - In communication
3. **Pitching** - Proposal stage
4. **Enrolled** - Confirmed client

---

## 🔗 Frontend Integration

### Example: Fetch with Date Filter (Frontend)

```javascript
// Using Redux dispatch
dispatch(setFilters({
  fromDate: '2024-08-01',
  toDate: '2024-09-30'
}));

// API call
const response = await fetch('/api/enquiries?fromDate=2024-08-01&toDate=2024-09-30');
const data = await response.json();
```

---

## 🔐 Error Handling

### Common Errors

**404 Not Found:**
```json
{
  "message": "Enquiry not found"
}
```

**400 Bad Request:**
```json
{
  "message": "Invalid request data"
}
```

**500 Server Error:**
```json
{
  "message": "Internal server error"
}
```

---

## 📱 Google Forms Integration

### Setup Steps:
1. Open Google Form
2. Go to **Tools > Script Editor**
3. Copy contents from `googleFormsIntegration.gs`
4. Replace `BACKEND_URL` with your actual backend URL
5. Create form trigger: **Triggers > On form submit**

### Form Questions to Map:
- Elder Name → `elderName`
- Family Name → `familyName`
- Phone → `phone`
- Email → `email`
- Aadhaar → `aadhaar`
- Care Type → `careType`
- Lead Source → `source`
- Stage → `stage`

### Testing:
- Run `testBackendConnection()` to verify backend connection
- Run `simulateFormSubmission()` to test without form submission
- Check **API Log** sheet for submission history

---

## 🔄 Workflow

1. **Google Form Submission** → AppScript automatically sends data to backend
2. **Backend creates enquiry** → If phone+aadhaar exists, reuses `clientId`, else generates new one
3. **Frontend displays** → Shows latest enquiry per client with all filters applied
4. **Date filtering** → Both API and Frontend support date range filtering

---

## 💡 Important Notes

- Multiple submissions from same phone+aadhaar create multiple rows with same `clientId`
- Frontend shows only the LATEST entry per client
- Date filters work on `createdAt` field (UTC timezone)
- All phone/aadhaar values are auto-cleaned of non-digits
- Timeline tracks all stage changes

---

## 📚 Related Files

- Backend Routes: `backend/src/routes/enquiryRoutes.js`
- Google Forms Script: `backend/scripts/googleFormsIntegration.gs`
- Frontend Slice: `client/src/features/enquirySlice.js`
- Frontend Component: `client/src/components/enquiry/EnquiryListContent.jsx`
