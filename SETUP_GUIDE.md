# Setup Guide - FitFix Backend

This guide will help you set up the FitFix backend from scratch.

## Step 1: Firebase Project Setup

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Enter project name: "FitFix" (or your preferred name)
   - Follow the setup wizard

2. **Enable Authentication**:
   - In Firebase Console, go to "Authentication" > "Sign-in method"
   - Enable "Email/Password" provider

3. **Enable Firestore Database**:
   - Go to "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" (we'll add security rules later)
   - Select a location for your database

4. **Get Service Account Key**:
   - Go to "Project Settings" > "Service Accounts"
   - Click "Generate new private key"
   - Save the JSON file as `serviceAccountKey.json` in your project root
   - ⚠️ **IMPORTANT**: Never commit this file to git!

5. **Get Web API Key**:
   - Go to "Project Settings" > "General"
   - Scroll down to "Your apps" section
   - If you don't have a web app, click "Add app" > Web (</> icon)
   - Copy the "Web API Key" (you'll need this for `.env`)

## Step 2: Project Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Create `.env` File**:
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   FIREBASE_API_KEY=your_web_api_key_from_step_1
   ```

3. **Verify File Structure**:
   Your project should have:
   ```
   FitFix/
   ├── serviceAccountKey.json  (from Firebase)
   ├── .env                    (you just created)
   ├── package.json
   ├── src/
   │   ├── server.js
   │   ├── firebase.js
   │   └── ...
   └── node_modules/
   ```

## Step 3: Create Initial Admin User

You have two options:

### Option A: Using Firebase Console (Recommended for first admin)

1. Go to Firebase Console > Authentication > Users
2. Click "Add user"
3. Enter email and password
4. Note the UID

5. Go to Firestore Database
6. Create a document in `users` collection with the UID as document ID:
   ```json
   {
     "email": "admin@fitfix.com",
     "displayName": "Admin User",
     "role": "admin",
     "isActive": true,
     "createdAt": "2024-01-15T10:00:00Z",
     "updatedAt": "2024-01-15T10:00:00Z"
   }
   ```

### Option B: Using API (After server is running)

1. Start the server:
   ```bash
   npm run dev
   ```

2. Register admin via API:
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@fitfix.com",
       "password": "adminPassword123",
       "displayName": "Admin User",
       "role": "admin"
     }'
   ```

## Step 4: Test the Setup

1. **Start the server**:
   ```bash
   npm run dev
   ```

2. **Test health endpoint**:
   ```bash
   curl http://localhost:3000/
   ```
   Should return:
   ```json
   {
     "success": true,
     "message": "FitFix API is running!",
     "version": "1.0.0"
   }
   ```

3. **Test login**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@fitfix.com",
       "password": "adminPassword123"
     }'
   ```
   Should return a token and user data.

4. **Test protected route** (use token from login):
   ```bash
   curl http://localhost:3000/api/auth/profile \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

## Step 5: Set Up Firestore Security Rules

1. Go to Firebase Console > Firestore Database > Rules
2. Copy the security rules from `FIRESTORE_STRUCTURE.md`
3. Paste and publish the rules

## Step 6: Create Firestore Indexes

Firestore will prompt you to create indexes when needed, or you can create them manually:

1. Go to Firebase Console > Firestore Database > Indexes
2. Create composite indexes for:
   - `users`: `role` (Ascending) + `createdAt` (Descending)
   - `progress`: `userId` (Ascending) + `date` (Descending)
   - `notifications`: `userId` (Ascending) + `read` (Ascending) + `createdAt` (Descending)

## Troubleshooting

### "Firebase Admin SDK initialized successfully" not showing
- Check that `serviceAccountKey.json` exists in root directory
- Verify the JSON file is valid
- Check file permissions

### "Firebase API key not configured"
- Ensure `.env` file exists
- Verify `FIREBASE_API_KEY` is set correctly
- Restart the server after changing `.env`

### "User profile not found" after login
- User exists in Firebase Auth but not in Firestore
- Create the user document in Firestore (see Step 3)

### CORS errors from frontend
- Ensure CORS is enabled in `server.js` (already configured)
- Check that frontend is making requests to correct URL
- For Flutter, use your computer's IP address instead of localhost

## Next Steps

1. ✅ Backend is set up and running
2. 📱 Set up React frontend (see `FRONTEND_INTEGRATION.md`)
3. 📱 Set up Flutter mobile app (see `FRONTEND_INTEGRATION.md`)
4. 🔒 Review and customize Firestore security rules
5. 🚀 Deploy to production (Heroku, AWS, etc.)

## Production Deployment Checklist

- [ ] Change `PORT` to use environment variable
- [ ] Set up proper CORS for production domain
- [ ] Use environment variables for all sensitive data
- [ ] Set up Firestore security rules
- [ ] Enable Firebase App Check
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Use HTTPS
- [ ] Set up CI/CD pipeline
- [ ] Backup strategy for Firestore

---

**Need help?** Check the main [README.md](./README.md) or [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

