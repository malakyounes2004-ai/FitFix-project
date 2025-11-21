# Troubleshooting Guide

## Common Errors and Solutions

### ❌ "Internal server error"

This is a generic error that can have several causes. Check the server console logs for detailed error information.

#### Possible Causes:

1. **Firebase Connection Issues**
   - Check that `serviceAccountKey.json` exists and is valid
   - Verify Firestore database is created
   - Run: `npm run test-connection`

2. **Missing Environment Variables**
   - Check `.env` file exists
   - Verify `FIREBASE_API_KEY` is set
   - Restart server after changing `.env`

3. **Firestore Not Initialized**
   - Go to Firebase Console
   - Create Firestore database if not exists
   - See [FIRESTORE_SETUP.md](./FIRESTORE_SETUP.md)

4. **Network/Firebase Auth Issues**
   - Check internet connection
   - Verify Firebase project is active
   - Check Firebase Auth is enabled

#### How to Debug:

1. **Check Server Logs:**
   ```bash
   # Look for error messages in the terminal where server is running
   # Errors will show: ❌ Error Details with URL, message, and stack
   ```

2. **Enable Development Mode:**
   ```bash
   # Add to .env file:
   NODE_ENV=development
   ```
   This will show more detailed error messages in responses.

3. **Test Firebase Connection:**
   ```bash
   npm run test-connection
   ```

4. **Check Specific Endpoint:**
   - Try the health check: `GET http://localhost:3000/`
   - Try login: `POST http://localhost:3000/api/auth/login`
   - Check server console for specific error

---

### ❌ "Unauthorized: Invalid or missing token"

**Cause:** Missing or invalid Authorization header

**Solution:**
1. Login first to get a token
2. Include header: `Authorization: Bearer YOUR_TOKEN`
3. Make sure token is not expired (login again if needed)

---

### ❌ "Forbidden: Admin access required"

**Cause:** Using wrong role token

**Solution:**
- Admin endpoints require admin role token
- User endpoints require user role token
- Login with correct account type

---

### ❌ "User profile not found"

**Cause:** User exists in Firebase Auth but not in Firestore

**Solution:**
1. Create user document in Firestore `users` collection
2. Or use registration endpoint: `POST /api/auth/register`
3. Or run: `npm run create-admin` for admin users

---

### ❌ "Firebase Admin SDK initialization failed"

**Cause:** Service account key missing or invalid

**Solution:**
1. Check `serviceAccountKey.json` exists in root directory
2. Verify file is valid JSON (not corrupted)
3. Download new key from Firebase Console if needed

---

### ❌ "Firebase API key not configured"

**Cause:** Missing `FIREBASE_API_KEY` in `.env`

**Solution:**
1. Create `.env` file in root directory
2. Add: `FIREBASE_API_KEY=your_key_here`
3. Get key from Firebase Console > Project Settings > General
4. Restart server

---

### ❌ "Route not found"

**Cause:** Wrong URL or HTTP method

**Solution:**
- Check the URL is correct
- Verify HTTP method (GET, POST, PATCH, etc.)
- See [POSTMAN_QUICK_REFERENCE.md](./POSTMAN_QUICK_REFERENCE.md) for correct URLs

---

### ❌ "ECONNREFUSED" or "fetch failed"

**Cause:** Cannot connect to Firebase services

**Solution:**
1. Check internet connection
2. Verify Firebase project is active
3. Check if using emulators (set `USE_EMULATORS=true` in `.env`)
4. Verify firewall isn't blocking connections

---

## Debugging Steps

### Step 1: Check Server is Running
```bash
curl http://localhost:3000/
# Should return: {"success": true, "message": "FitFix API is running!"}
```

### Step 2: Test Firebase Connection
```bash
npm run test-connection
# Should show all green checkmarks
```

### Step 3: Test Login
```bash
npm run test-login
# Should login successfully and show token
```

### Step 4: Check Server Logs
Look at the terminal where `npm run dev` is running. Errors will show:
- ❌ Error Details
- URL and method
- Error message
- Stack trace

### Step 5: Enable Development Mode
Add to `.env`:
```env
NODE_ENV=development
```
This shows more detailed error information in API responses.

---

## Getting Help

1. **Check Server Console:** Most errors are logged there
2. **Check Error Response:** In development mode, errors include details
3. **Test Individual Endpoints:** Use Postman or curl to test each endpoint
4. **Verify Configuration:** Check `.env` and `serviceAccountKey.json`

---

## Quick Health Check

Run these commands to verify everything is set up:

```bash
# 1. Test server
curl http://localhost:3000/

# 2. Test Firebase
npm run test-connection

# 3. Test login
npm run test-login

# 4. Test all endpoints
npm run test-all
```

If all pass, your setup is correct!

