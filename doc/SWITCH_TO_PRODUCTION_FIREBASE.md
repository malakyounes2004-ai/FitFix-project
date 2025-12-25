# Switch to Production Firebase

This guide shows you how to configure FitFix to use **production Firebase** instead of Firebase Emulators.

---

## ✅ Quick Setup (3 Steps)

### Step 1: Get Your Firebase Web API Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **FitFix** project
3. Click ⚙️ **Settings** → **Project settings**
4. Go to **General** tab
5. Scroll to **Your apps** section
6. If you don't have a web app, click **Add app** → Select **Web** (</>)
7. Copy the **Web API Key** (looks like: `AIzaSyC1234567890...`)

### Step 2: Configure `.env` File

Create or update `.env` file in your project root:

```env
PORT=3000
NODE_ENV=development

# Use Production Firebase (NOT emulators)
USE_EMULATORS=false

# Your Firebase Web API Key (from Step 1)
FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnop

# Firebase Admin SDK (if using .env instead of serviceAccountKey.json)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Important:**
- Set `USE_EMULATORS=false` (this is the key setting!)
- Replace `FIREBASE_API_KEY` with your actual API key
- If you have `serviceAccountKey.json` file, you don't need the last 3 variables

### Step 3: Restart Server

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

You should see:
```
🔥 Firebase Admin initialized using .env
🚀 FitFix API Server running on port 3000
```

**Note:** You should NOT see "⚡ Using Firebase Emulators..." message.

---

## 🧪 Test It Works

### Test Login

**Postman Request:**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/login`
- Body:
  ```json
  {
    "email": "your-email@example.com",
    "password": "your-password"
  }
  ```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "uid": "...",
      "email": "your-email@example.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "..."
  }
}
```

✅ **If you get a token, it's working with production Firebase!**

---

## 🔍 Verify Configuration

### Check Server Console

When server starts, you should see:
- ✅ `🔥 Firebase Admin initialized using .env`
- ❌ **NOT** `⚡ Using Firebase Emulators...`

### Check Login Request

When you make a login request, you should see in console:
- ✅ `🔗 Attempting to connect to Firebase Auth...`
- ❌ **NOT** `🔧 Using Firebase Auth Emulator`

---

## 📋 Required Firebase Setup

Make sure these are enabled in Firebase Console:

### 1. Authentication
- Go to: **Authentication** → **Sign-in method**
- Enable: **Email/Password**

### 2. Firestore Database
- Go to: **Firestore Database**
- Create database (if not exists)
- Choose: **Start in production mode** (or test mode for development)

### 3. Service Account (for Admin SDK)
- Go to: **Project Settings** → **Service accounts**
- Click **Generate new private key**
- Download `serviceAccountKey.json`
- Place it in project root directory

---

## 🆚 Emulator vs Production

| Feature | Emulators | Production |
|---------|-----------|------------|
| Setup | Install firebase-tools, start emulators | Just set `USE_EMULATORS=false` |
| Data | Local, resets on restart | Persistent, cloud-based |
| Auth | Local emulator | Real Firebase Auth |
| Firestore | Local emulator | Real Firestore |
| Best For | Local development/testing | Development & Production |

---

## ❌ Troubleshooting

### Error: "FIREBASE_API_KEY is required"

**Solution:** Add `FIREBASE_API_KEY` to your `.env` file

### Error: "Firebase Auth Emulator is not running"

**Solution:** Set `USE_EMULATORS=false` in `.env` file

### Error: "Cannot connect to Firebase Auth"

**Possible causes:**
1. Wrong API key - verify it in Firebase Console
2. Internet connection issue
3. Firebase project not active

**Solution:**
- Check your `.env` file has correct `FIREBASE_API_KEY`
- Verify internet connection
- Check Firebase Console that project is active

### Error: "User not found" during login

**Solution:** Create the user first:
- Use `POST /api/auth/register` endpoint
- Or create via Firebase Console: **Authentication** → **Users** → **Add user**

### Still seeing emulator messages?

**Solution:**
1. Check `.env` file: `USE_EMULATORS=false` (not `true`, not `"true"`)
2. Restart server completely
3. Check for typos in `.env` file

---

## ✅ Success Checklist

- [ ] `.env` file has `USE_EMULATORS=false`
- [ ] `.env` file has `FIREBASE_API_KEY` with your actual key
- [ ] Server starts without emulator messages
- [ ] Login endpoint returns a token
- [ ] Can access protected routes with token

---

## 📚 Related Files

- `setup-firebase-production.md` - Detailed production setup
- `setup-firebase-emulators.md` - If you want to use emulators
- `.env.example` - Template for environment variables

---

**Need help?** Check server console for detailed error messages!

