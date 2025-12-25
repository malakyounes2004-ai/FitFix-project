# Quick Fix: Login Error

## The Problem
You're getting: `"Firebase Auth service unavailable"`

This means the login endpoint can't connect to Firebase Auth.

## Quick Solution (Choose One)

### Option A: Use Production Firebase (Recommended)

1. **Get your Firebase Web API Key:**
   - Go to: https://console.firebase.google.com/
   - Select your project
   - Click ⚙️ **Project Settings**
   - Scroll to **Your apps** section
   - Copy the **Web API Key** (looks like: `AIzaSyC...`)

2. **Create `.env` file** in your project root:
   ```env
   PORT=3000
   USE_EMULATORS=false
   FIREBASE_API_KEY=your_web_api_key_here
   NODE_ENV=development
   ```

3. **Restart your server:**
   ```bash
   # Stop server (Ctrl+C) and restart
   npm run dev
   ```

4. **Test login again!**

---

### Option B: Use Firebase Emulators

1. **Install Firebase Tools:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize emulators:**
   ```bash
   firebase init emulators
   ```
   - Select: **Authentication** and **Firestore**
   - Use default ports

3. **Create `.env` file:**
   ```env
   PORT=3000
   USE_EMULATORS=true
   NODE_ENV=development
   ```

4. **Start emulators** (in one terminal):
   ```bash
   firebase emulators:start
   ```

5. **Start your server** (in another terminal):
   ```bash
   npm run dev
   ```

6. **Test login again!**

---

## Which Option Should I Use?

- **Option A (Production)**: If you have a Firebase project already set up
- **Option B (Emulators)**: If you want to test locally without using real Firebase

**Most users should use Option A** - it's simpler and works with your existing Firebase project.

---

## After Fixing

Test the login:
```bash
POST http://localhost:3000/api/auth/login
Body: {"email":"admin@gmail.com","password":"admin123"}
```

You should now get a token back! 🎉

