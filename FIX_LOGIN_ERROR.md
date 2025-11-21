# Fix Login Error: "Firebase Auth service unavailable"

## Problem
Getting error: `"Firebase Auth service unavailable. Check your connection and Firebase configuration."`

## Solutions

### Solution 1: Set FIREBASE_API_KEY (Production)

If you're using **production Firebase** (not emulators):

1. **Get your Firebase Web API Key:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to **Project Settings** > **General**
   - Scroll to **Your apps** section
   - Copy the **Web API Key**

2. **Add to `.env` file:**
   ```env
   FIREBASE_API_KEY=your_web_api_key_here
   USE_EMULATORS=false
   ```

3. **Restart server:**
   ```bash
   # Stop server (Ctrl+C) and restart
   npm run dev
   ```

---

### Solution 2: Use Firebase Emulators (Development)

If you want to use **Firebase Emulators** for local development:

1. **Install Firebase Tools** (if not installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase in your project:**
   ```bash
   firebase init emulators
   ```
   - Select: Authentication, Firestore
   - Choose ports (default: Auth=9099, Firestore=8080)

3. **Start Emulators:**
   ```bash
   firebase emulators:start
   ```
   Keep this terminal running!

4. **Add to `.env` file:**
   ```env
   USE_EMULATORS=true
   # FIREBASE_API_KEY not needed for emulators
   ```

5. **In another terminal, start your server:**
   ```bash
   npm run dev
   ```

---

### Solution 3: Check Your Current Setup

Check what you have in `.env`:

```bash
# Windows PowerShell
Get-Content .env

# Or just open .env file in your editor
```

**If you see:**
- `USE_EMULATORS=true` → Make sure emulators are running
- `USE_EMULATORS=false` or not set → Need `FIREBASE_API_KEY`

---

## Quick Test

After fixing, test login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@gmail.com\",\"password\":\"admin123\"}"
```

Or use Postman with:
- Method: POST
- URL: `http://localhost:3000/api/auth/login`
- Body: `{"email":"admin@gmail.com","password":"admin123"}`

---

## Common Issues

### Issue: "Firebase Auth Emulator is not running"
**Solution:** Start emulators with `firebase emulators:start`

### Issue: "Cannot connect to Firebase Auth"
**Solution:** 
- Check internet connection
- Verify `FIREBASE_API_KEY` is correct
- Check firewall isn't blocking

### Issue: "FIREBASE_API_KEY is required"
**Solution:** Add `FIREBASE_API_KEY=your_key` to `.env` file

---

## Recommended Setup

For **development/testing**, use emulators:
```env
USE_EMULATORS=true
```

For **production**, use real Firebase:
```env
USE_EMULATORS=false
FIREBASE_API_KEY=your_actual_api_key
```

---

**After fixing, try login again!**

