# Setup Firebase Emulators (Alternative Method)

Use this if you want to test locally without using your production Firebase project.

## Prerequisites

- Node.js installed
- Firebase project (for authentication)

## Step-by-Step Guide

### Step 1: Install Firebase Tools

```bash
npm install -g firebase-tools
```

**Verify installation:**
```bash
firebase --version
```
Should show version number (e.g., `13.0.0`)

### Step 2: Login to Firebase

```bash
firebase login
```

This will:
- Open your browser
- Ask you to sign in with Google
- Grant permissions to Firebase CLI
- Return to terminal when done

**Verify login:**
```bash
firebase projects:list
```
Should show your Firebase projects.

### Step 3: Initialize Emulators

```bash
firebase init emulators
```

**When prompted, follow these steps:**

1. **Select Firebase features:**
   - ✅ Press `Space` to select **Authentication Emulator**
   - ✅ Press `Space` to select **Firestore Emulator**
   - Press `Enter` to continue

2. **Download emulators:**
   - Type `Y` and press `Enter` to download

3. **Select ports (use defaults):**
   - Authentication: Press `Enter` (default: 9099)
   - Firestore: Press `Enter` (default: 8080)
   - UI: Press `Enter` (default: 4000)

4. **Enable Emulator UI:**
   - Type `Y` and press `Enter`

You should see: `✔ Firebase initialization complete!`

### Step 4: Update `.env` File

Create or update `.env` file in your project root:

```env
PORT=3000
USE_EMULATORS=true
NODE_ENV=development
```

**Important:** `USE_EMULATORS=true` (not `false`)

### Step 5: Start Emulators

```bash
firebase emulators:start
```

**Keep this terminal running!** You should see:

```
✔  All emulators ready! It is now safe to connect.

┌─────────────────────────────────────────────────────────────┐
│ ✔  All emulators ready! View status at http://localhost:4000 │
└─────────────────────────────────────────────────────────────┘

┌────────────────┬────────────────┬──────────────────────────┐
│ Emulator       │ Host:Port      │ Status                   │
├────────────────┼────────────────┼──────────────────────────┤
│ Authentication │ 127.0.0.1:9099 │ Running                  │
│ Firestore      │ 127.0.0.1:8080 │ Running                  │
└────────────────┴────────────────┴──────────────────────────┘
```

### Step 6: Start Your Server (New Terminal)

Open a **new terminal window** (keep emulators running in the first one):

```bash
cd C:\Users\hp\FitFix
npm run dev
```

You should see:
```
🚀 FitFix API Server running on port 3000
🔧 Using Firebase Auth Emulator
```

### Step 7: Create Test User

The emulator starts empty. You need to create a user:

**Option A: Use Create Admin Script (Recommended)**
```bash
# In a third terminal or after stopping server temporarily
npm run create-admin
```
Enter:
- Email: `admin@gmail.com`
- Password: `admin123`
- Display Name: `admin`

**Option B: Use Emulator UI**
1. Go to: http://localhost:4000
2. Click **Authentication** in left sidebar
3. Click **Users** tab
4. Click **Add user**
5. Enter email and password
6. Click **Add**

**Option C: Create via Firestore**
1. Go to: http://localhost:4000
2. Click **Firestore** in left sidebar
3. Create collection: `users`
4. Add document with your user's UID
5. Set fields: `email`, `displayName`, `role: "admin"`

### Step 8: Test Login

Now test your login in Postman:

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

✅ **Should return a token!**

---

## Emulator UI Access

Once emulators are running, access:

- **Emulator UI Dashboard**: http://localhost:4000
  - View all emulators
  - Manage Authentication users
  - View Firestore data
  - See logs

- **Auth Emulator**: http://localhost:9099
- **Firestore Emulator**: http://localhost:8080

---

## Common Issues & Solutions

### ❌ "Port already in use"

**Solution:**
```bash
# Find what's using the port
netstat -ano | findstr :9099
netstat -ano | findstr :8080

# Kill the process or change ports in firebase.json
```

### ❌ "firebase: command not found"

**Solution:**
```bash
# Reinstall globally
npm install -g firebase-tools

# Or use npx
npx firebase-tools init emulators
```

### ❌ "Emulator not found"

**Solution:**
```bash
# Reinitialize
firebase init emulators

# Make sure you select Authentication and Firestore
```

### ❌ "Cannot connect to emulator"

**Solution:**
1. Check emulators are running: `firebase emulators:start`
2. Verify `.env` has `USE_EMULATORS=true`
3. Check ports match (9099 for Auth, 8080 for Firestore)

### ❌ "User not found" after login

**Solution:**
- Emulator starts empty - you need to create users first
- Use `npm run create-admin` or Emulator UI
- Make sure user exists in both Auth and Firestore

---

## Stopping Emulators

Press `Ctrl+C` in the terminal where emulators are running.

---

## When to Use Emulators

✅ **Use Emulators when:**
- Testing locally without affecting production data
- Developing offline
- Want to reset data easily
- Testing with different scenarios

❌ **Don't use Emulators when:**
- You want to use real Firebase data
- You need production-like environment
- You're deploying to production

---

**Tip:** For most development, **production Firebase is simpler**. Only use emulators if you need isolated testing.

