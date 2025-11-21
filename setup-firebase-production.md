# Switch to Production Firebase (Recommended)

This is the **easiest solution** - use your existing Firebase project instead of emulators.

## Step-by-Step Guide

### Step 1: Get Your Firebase Web API Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **FitFix** project (or the project you're using)
3. Click the ⚙️ **gear icon** (Project Settings) in the left sidebar
4. Click on **General** tab
5. Scroll down to the **Your apps** section
6. If you don't have a web app, click **Add app** and select the **Web** icon (</>)
7. Find the **Web API Key** - it looks like: `AIzaSyC1234567890abcdefghijklmnop`
8. **Copy this key** - you'll need it in the next step

### Step 2: Update Your `.env` File

1. Open or create `.env` file in your project root directory
2. Add/update these lines:

```env
PORT=3000
USE_EMULATORS=false
FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnop
NODE_ENV=development
```

**Important:** 
- Replace `AIzaSyC1234567890abcdefghijklmnop` with your actual API key from Step 1
- Make sure `USE_EMULATORS=false` (not `true`)

### Step 3: Restart Your Server

1. **Stop the current server** (press `Ctrl+C` in the terminal where it's running)
2. **Start it again:**
   ```bash
   npm run dev
   ```

You should see:
```
🚀 FitFix API Server running on port 3000
```

### Step 4: Test Login

Try your login request again in Postman:

**Request:**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/login`
- Body: 
  ```json
  {
    "email": "admin@gmail.com",
    "password": "admin123"
  }
  ```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "uid": "...",
    "email": "admin@gmail.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJSUzI1NiIs..."
}
```

✅ **If you get a token back, it's working!**

---

## Troubleshooting

### Still getting errors?

1. **Check `.env` file:**
   - Make sure `USE_EMULATORS=false` (not `true`)
   - Verify `FIREBASE_API_KEY` is correct (no extra spaces)
   - File should be in root directory (same folder as `package.json`)

2. **Check server console:**
   - Look for error messages
   - Should see: `🔗 Attempting to connect to Firebase Auth...`

3. **Verify API Key:**
   - Key should start with `AIzaSy`
   - Should be about 39 characters long
   - No spaces or quotes around it in `.env`

4. **Check Firebase Project:**
   - Make sure Authentication is enabled in Firebase Console
   - Go to: Authentication > Sign-in method
   - Email/Password should be enabled

---

## Why This Solution?

- ✅ Works with your existing Firebase project
- ✅ No need to install or run emulators
- ✅ Uses real Firebase Auth (same as production)
- ✅ Simpler setup - just add API key

---

**Need help?** Check the server console for detailed error messages.

