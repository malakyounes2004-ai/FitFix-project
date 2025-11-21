# Debugging Guide: No Data Appearing on Website

## Quick Checks

### 1. Check Browser Console
Open your browser's Developer Tools (F12) and check the Console tab for errors:
- Look for red error messages
- Check for network errors (failed API calls)
- Look for authentication errors (401, 403)

### 2. Check Network Tab
In Developer Tools, go to the Network tab:
- Look for API calls to `http://localhost:3000/api/...`
- Check if requests are returning 200 (success) or errors
- Check the response data - is it empty arrays `[]` or actual data?

### 3. Verify Backend is Running
The backend should be running on port 3000. Check:
```powershell
netstat -ano | findstr :3000
```
You should see the server listening.

### 4. Verify Authentication
- Make sure you're logged in
- Check localStorage for `token` and `user`:
  - Open Developer Tools → Application → Local Storage
  - Look for `token` and `user` keys
  - If missing, login again

### 5. Check User Role
- Make sure your user has the correct role (admin, employee, or user)
- Admin dashboard requires `admin` role
- Check the `user` object in localStorage for the `role` field

## Common Issues and Solutions

### Issue 1: "Cannot connect to server"
**Solution:** Make sure the backend server is running:
```bash
npm start
# or
npm run dev
```

### Issue 2: "Authentication failed" or 401 errors
**Solution:** 
- Your token may have expired
- Logout and login again
- Check if your user account exists in Firestore

### Issue 3: "Access denied" or 403 errors
**Solution:**
- Your user doesn't have the required role
- Admin pages require `role: 'admin'`
- Check your user document in Firestore

### Issue 4: Data shows as 0 or empty
**Possible causes:**
- Database is actually empty (no employees, payments, etc.)
- API is returning empty arrays `[]`
- Check the Network tab to see what data is being returned

### Issue 5: Loading forever
**Possible causes:**
- API call is hanging (check Network tab)
- Backend is not responding
- CORS issue (check console for CORS errors)

## Debugging Steps

1. **Open Browser Console** (F12 → Console tab)
2. **Look for the new console logs** I added:
   - "Fetching employees..."
   - "Employees response: ..."
   - "Employees array: ..."
   - Similar logs for payments, requests, etc.

3. **Check what the API is returning:**
   - Look at the response objects in console
   - Check if `data.data` contains an array
   - Check if the array is empty `[]` or has items

4. **Check Network Tab:**
   - Find the API request (e.g., `/api/admin/employees`)
   - Click on it
   - Check the Response tab to see what data was returned
   - Check the Headers tab to see if Authorization header is present

5. **Test API directly:**
   You can test the API directly using curl or Postman:
   ```bash
   # Get your token from localStorage first
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/admin/employees
   ```

## What I've Added

I've added better error logging and console output to help debug:
- Detailed error messages in console
- Logging of API responses
- Better error handling with specific messages
- Automatic redirect to login on 401 errors

## Next Steps

1. **Open your website**
2. **Open Browser Console (F12)**
3. **Navigate to a page that should show data** (e.g., Admin Dashboard)
4. **Check the console logs** - you should see:
   - "Fetching employees..."
   - "Employees response: {success: true, data: [...]}"
   - "Employees array: [...]"

5. **Share the console output** so we can see what's happening

## If Still No Data

If the API is returning empty arrays `[]`, the issue is that your database is empty. You need to:
1. Create some test data (employees, payments, etc.)
2. Or check if you're connected to the right Firebase project
3. Verify your Firestore database has data

