# Quick Integration - Lead Form to Enquiry Page

## Step 1: Update Enquiry.jsx Page

Replace the content of `client/src/pages/Enquiry.jsx` with:

```jsx
import React from 'react';
import EnquiryWithLeadForm from './EnquiryWithLeadForm';

const Enquiry = () => {
  return <EnquiryWithLeadForm />;
};

export default Enquiry;
```

## Step 2: Verify API URL Configuration

Ensure your `.env` file (in `client/` directory) has:

```env
REACT_APP_API_URL=http://localhost:5000
```

For production with ngrok:
```env
REACT_APP_API_URL=https://your-ngrok-url.ngrok-free.app
```

## Step 3: Verify Backend is Running

Make sure your backend server is running:

```bash
cd backend
npm start
```

You should see something like:
```
Server running on port 5000
MongoDB connected
```

## Step 4: Test the Integration

1. Navigate to `/enquiry` in your app
2. You'll see two tabs:
   - 📋 **Lead Entry Form** (new)
   - 📊 **Enquiry List** (existing)

3. Click on "Lead Entry Form" tab
4. Fill and submit all 3 stages
5. After success, click "New Lead" or switch to "Enquiry List" tab
6. Your new entry should appear in the table

## Step 5: (Optional) Create Separate Route for Form Only

If you want the form on a separate route, add to `App.jsx`:

```jsx
import EnquiryWithLeadForm from './pages/EnquiryWithLeadForm';
import LeadForm from './components/enquiry/leadForm/LeadForm';

// Add these routes:
<Route
  path="/enquiry/form"
  element={
    <ProtectedRoute role="admin">
      <LeadForm />
    </ProtectedRoute>
  }
/>

<Route
  path="/enquiry/list"
  element={
    <ProtectedRoute role="admin">
      <Enquiry />
    </ProtectedRoute>
  }
/>
```

## Verification Checklist

- [ ] `.env` has `REACT_APP_API_URL` set
- [ ] Backend server is running (`npm start` in backend/)
- [ ] MongoDB is connected
- [ ] `Enquiry.jsx` updated to use `EnquiryWithLeadForm`
- [ ] `EnquiryWithLeadForm.jsx` exists
- [ ] All form component files exist in `leadForm/` folder
- [ ] App reloads without errors
- [ ] Can navigate to `/enquiry`
- [ ] Form tab loads successfully
- [ ] Can fill and submit stage 1
- [ ] Client ID is displayed
- [ ] New data appears in enquiry list after completion

## Troubleshooting

### Form not loading
```
Check browser console (F12) for errors
- Are all files created in leadForm/ folder?
- Is API URL correct in .env?
```

### API calls failing
```
Check Network tab (F12) in DevTools
- Is backend running on port 5000?
- Is REACT_APP_API_URL correct?
- Check backend console for errors
```

### Data not in table
```
- Manual page refresh (Ctrl+R)
- Check Redux fetchEnquiries() dispatch
- Check MongoDB collections
- Verify API response contains correct data
```

### Styling issues
```
- Clear browser cache (Ctrl+Shift+R)
- Check if LeadForm.css is imported
- Check CSS specificity conflicts with existing styles
```

## File Structure Verification

Run this command to verify all files exist:

```bash
# From client directory
ls -la src/components/enquiry/leadForm/
```

Should show:
```
LeadForm.jsx
LeadFormConstants.js
LeadFormComponents.jsx
LeadForm.css
Stage1.jsx
Stage2.jsx
Stage3.jsx
index.js
```

And pages:
```
ls -la src/pages/ | grep Enquiry
```

Should show:
```
Enquiry.jsx
EnquiryWithLeadForm.jsx
```

## Success Indicators

✅ You know it's working when:

1. Page loads without console errors
2. Both tabs are visible (📋 and 📊)
3. Form validation works (try submitting empty)
4. Client ID is generated after Stage 1
5. Data appears in enquiry table
6. Toast notifications show on save
7. Success screen shows with summary

## Next Steps

Once integration is complete:

1. Test with various service types
2. Test mobile responsiveness
3. Customize lead sources as needed
4. Set up automated notifications
5. Configure dashboard analytics
6. Train team on new form

## Support Resources

- [LEAD_FORM_SETUP.md](./LEAD_FORM_SETUP.md) - Full documentation
- Backend API docs - See `BACKEND_URLS_CONFIG.md`
- Database schema - See Enquiry.js model

---

**Integration Date**: April 2026
**Status**: Ready for deployment
