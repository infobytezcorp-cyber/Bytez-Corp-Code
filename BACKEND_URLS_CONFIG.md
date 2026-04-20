# Backend URLs Configuration

## For Google Forms AppScript

Replace the `BACKEND_URL` variable in your Google Apps Script with the appropriate URL based on your environment.

---

## 🔹 Local Development

```javascript
const BACKEND_URL = 'http://localhost:8000/api/enquiries';
```

**Requirements:**
- Backend running locally: `npm start` in backend directory
- Both frontend and Google Form use same local backend

---

## 🔹 Local with ngrok (Expose to Internet)

If you want Google Forms to connect to your local backend from the internet:

```javascript
const BACKEND_URL = 'https://your-ngrok-url.ngrok-free.app/api/enquiries';
```

**Setup ngrok:**
```bash
# 1. Download ngrok from https://ngrok.com/download
# 2. Install and authenticate
ngrok config add-authtoken YOUR_AUTH_TOKEN

# 3. Expose your local backend
ngrok http 8000

# 4. Copy the HTTPS URL and use in Google Forms AppScript
# Example: https://a1b2-203-0-113-45.ngrok-free.app/api/enquiries
```

---

## 🔹 Heroku (Production Alternative)

```javascript
const BACKEND_URL = 'https://bytez-corp-api.herokuapp.com/api/enquiries';
```

**Deploy to Heroku:**
```bash
# 1. Install Heroku CLI
# 2. Login
heroku login

# 3. Create app
heroku create bytez-corp-api

# 4. Deploy
git push heroku main

# 5. View logs
heroku logs --tail
```

---

## 🔹 Azure App Service

```javascript
const BACKEND_URL = 'https://bytez-corp-api.azurewebsites.net/api/enquiries';
```

---

## 🔹 Custom Domain (AWS, DigitalOcean, etc.)

```javascript
const BACKEND_URL = 'https://api.bytez-corp.com/enquiries';
```

---

## 🔒 CORS Configuration

Update your backend `server.js` to allow Google Forms requests:

```javascript
import cors from 'cors';

app.use(cors({
  origin: [
    'https://docs.google.com',
    'https://script.google.com',
    'http://localhost:3000',
    'http://localhost:5173',
    // Add your production URLs
    'https://bytez-corp.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 🧪 Testing Your URL

In Google Apps Script, run this function:

```javascript
function testBackendURL() {
  const testURL = 'YOUR_BACKEND_URL';
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      elderName: 'Test',
      phone: '1234567890',
      stage: 'New Enquiry'
    }),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(testURL, options);
  Logger.log('Response Code: ' + response.getResponseCode());
  Logger.log('Response: ' + response.getContentText());
}
```

---

## 📝 Environment Variables

You can also use environment variables to keep URLs secret:

**Create `.env` file in backend:**
```
BACKEND_PORT=8000
DB_URL=sqlite:./database.db
FRONTEND_URL=http://localhost:5173
GOOGLE_FORMS_URL=https://docs.google.com
```

**Backend `.js` file:**
```javascript
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.BACKEND_PORT || 8000;
```

**For Google Forms AppScript:**
```javascript
// Since AppScript can't access .env, keep URL in the script
// Or use a Config Sheet in Google Sheets to manage URLs
const BACKEND_URL = getConfigValue('BACKEND_URL');

function getConfigValue(key) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config');
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  for (let i = 0; i < values.length; i++) {
    if (values[i][0] === key) {
      return values[i][1];
    }
  }
  return null;
}
```

---

## 🔄 Switching Environments

### Local to Production Checklist

- [ ] Change `BACKEND_URL` to production URL
- [ ] Test with `testBackendConnection()` function
- [ ] Verify CORS settings in backend
- [ ] Check database connection on production
- [ ] Test form submission
- [ ] Check API Log sheet for successful entries
- [ ] Monitor backend logs for any errors

---

## 🆘 Common Issues

### "Connection refused"
- Backend not running
- Wrong port number
- Wrong URL/hostname

### "CORS error"
- CORS not enabled in backend
- Origin not whitelisted
- Check browser console for details

### "404 Not Found"
- Wrong endpoint path
- Backend not at specified URL
- Routes not registered

### "SSL Certificate Error"
- For ngrok: Make sure to use HTTPS URL
- For custom domain: Ensure SSL certificate is valid
- In AppScript, errors silently - check execution logs

---

**Need help?** Check the logs:
- **Apps Script:** Executions tab > Click execution > View logs
- **Backend:** Terminal where `npm start` is running
- **Database:** Direct SQL queries to verify data

---

**Updated:** October 2024
