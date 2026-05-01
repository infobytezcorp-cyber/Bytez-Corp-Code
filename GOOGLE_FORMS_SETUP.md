# Google Forms Integration Setup Guide

## Quick Start

This guide helps you integrate your Google Form with Bytez Corp CRM backend to automatically sync submissions.

---

## Step 1: Copy the AppScript Code

1. Open your Google Form
2. Click **⋮ (More)** → **Script editor** (or click **Tools** → **Script editor**)
3. Delete any existing code
4. Copy the entire code from `backend/scripts/googleFormsIntegration.gs`
5. Paste it into the Apps Script editor
6. Save (Ctrl+S)

---

## Step 2: Update Backend URL

In the script, find this line:
```javascript
const BACKEND_URL = 'http://localhost:8000/api/enquiries';
```

Replace with your actual backend URL:
```javascript
// Development
const BACKEND_URL = 'http://localhost:8000/api/enquiries';

// Production (example)
const BACKEND_URL = 'https://bytez-corp-api.herokuapp.com/api/enquiries';
```

---

## Step 3: Create Form Triggers

1. Click **🔔 Triggers** (clock icon) in the left sidebar
2. Click **Create new trigger**
3. Set up as follows:
   - **Which function to run:** `onFormSubmit`
   - **Which deployment should run:** Latest version
   - **Select event type:** From spreadsheet
   - **Which spreadsheet event type:** On form submit
4. Click **Create**

---

## Step 4: Map Your Form Questions

Edit the `parseFormResponses()` function to match your Google Form questions.

**Example - If your form has these questions:**

| Google Form Question | Expected by API |
|---|---|
| "What is the elderly person's name?" | `elderName` |
| "Family name" | `familyName` |
| "Contact number" | `phone` |
| "Email address" | `email` |
| "Aadhaar number" | `aadhaar` |
| "What service do you need?" | `careType` |
| "How did you hear about us?" | `source` |

**Update the `case` statements:**

```javascript
case 'what is the elderly person\'s name?':
  formData.elderName = response;
  break;

case 'family name':
  formData.familyName = response;
  break;

case 'contact number':
  formData.phone = response.replace(/\D/g, '');
  break;

// ... etc
```

---

## Step 5: Test the Connection

### Method 1: Direct Test
1. In Apps Script Editor, click **Run** button
2. Select function dropdown → `testBackendConnection`
3. Click **Run**
4. Check the execution log (bottom of screen)
5. Should show ✅ "Backend connection successful!"

### Method 2: Simulate Submission
1. Select function dropdown → `simulateFormSubmission`
2. Click **Run**
3. Check the execution log
4. Check your backend database - should have new test record

### Method 3: Actual Form Submission
1. Go back to your Google Form
2. Click **Send** (preview icon)
3. Fill out the form and submit
4. Check backend database for new record

---

## Step 6: Monitor Form Submissions

A new sheet called **"API Log"** is automatically created in your spreadsheet. This tracks:
- ✅ Successful submissions
- ❌ Failed submissions
- Response details
- Timestamps

---

## Troubleshooting

### "Backend connection failed" Error

**Check 1: Backend is running?**
```bash
# In backend directory
npm start
```

**Check 2: Correct URL?**
```javascript
const BACKEND_URL = 'http://localhost:8000/api/enquiries';
// or your actual URL
```

**Check 3: CORS enabled?**
Add to backend `server.js`:
```javascript
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
```

---

### "Form questions not matching"

Check console logs to see exact question titles:
1. Submit a test form
2. Open Apps Script Editor
3. Click **Executions** tab
4. Click on the failed execution
5. Look for the exact question titles in the logs
6. Update the `case` statements accordingly

---

### "No data showing in backend"

**Check 1:** Verify trigger is set up correctly
- Click **Triggers** → See if `onFormSubmit` shows with green checkmark

**Check 2:** Check Apps Script logs
- Click **Executions** → See if runs are showing "Completed" status

**Check 3:** Manual test
- Run `simulateFormSubmission()` function
- Check if data appears in backend

---

## Advanced: Custom Field Mapping

If your form has custom question names, update the switch statement:

```javascript
switch(title.toLowerCase()) {
  // Your custom cases
  case 'your question name here':
    formData.elderName = response;
    break;
    
  // ... more cases
}
```

Use `console.log(title)` to debug exact question names:

```javascript
itemResponses.forEach(itemResponse => {
  const title = itemResponse.getItem().getTitle();
  console.log('Question: ' + title); // Log all questions
  const response = itemResponse.getResponse();
  // ... rest of code
});
```

---

## API Response Reference

### Successful Submission (201 Created)
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "clientId": "CLI001",
  "elderName": "Ramesh Kumar",
  "familyName": "Kumar Family",
  "phone": "9876543210",
  "email": "ramesh@email.com",
  "careType": "Day Care",
  "source": "Website",
  "stage": "New Enquiry",
  "aadhaar": "1234567890123456",
  "createdAt": "2024-10-04T10:30:00.000Z",
  "updatedAt": "2024-10-04T10:30:00.000Z"
}
```

### Error Response
```json
{
  "message": "Error description here"
}
```

---

## Features Included

✅ **Automatic submission** - Form → Backend → Database  
✅ **Error handling** - Failed submissions logged to sheet  
✅ **Duplicate detection** - Same phone+aadhaar reuses clientId  
✅ **Testing functions** - Built-in connection & simulation tests  
✅ **Audit trail** - API Log sheet tracks all submissions  
✅ **Date validation** - Frontend can filter by date range  

---

## File References

| File | Purpose |
|---|---|
| `googleFormsIntegration.gs` | Main integration script |
| `enquiryRoutes.js` | Backend API endpoints |
| `API_DOCUMENTATION.md` | Complete API reference |
| `EnquiryListContent.jsx` | Frontend display component |

---

## Need Help?

Check these in order:
1. **Logs:** Apps Script > Executions tab
2. **API Log Sheet:** See form submission history
3. **Backend Logs:** Check terminal where backend is running
4. **API Docs:** See `API_DOCUMENTATION.md`

---

**Last Updated:** 2024-10-18  
**Version:** 1.0
