# Quick Start Guide

Get your FitFix backend up and running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js installed (v16+)
- [ ] Firebase project created
- [ ] `serviceAccountKey.json` downloaded and placed in root directory
- [ ] Firebase Web API Key obtained

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```env
PORT=3000
FIREBASE_API_KEY=your_firebase_web_api_key_here
```

### 3. Create Firestore Database
**Important**: You must create the Firestore database in Firebase Console first!

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click "Firestore Database" in the left menu
4. Click "Create database"
5. Choose "Start in test mode"
6. Select a location and click "Enable"

See [FIRESTORE_SETUP.md](./FIRESTORE_SETUP.md) for detailed instructions.

### 4. Test Firebase Connection
```bash
npm run test-connection
```

Expected output:
```
🧪 Testing Firebase Connection...
✅ Service account key found
✅ Firebase Auth connected successfully
✅ Firestore connected successfully
✅ All connection tests passed!
```

**If you get a "NOT_FOUND" error**, it means Firestore isn't created yet. Follow step 3 above.

### 5. Create First Admin User
```bash
npm run create-admin
```

Follow the prompts to create your admin account.

### 6. Start the Server
```bash
npm run dev
```

You should see:
```
✅ Firebase Admin SDK initialized successfully
🚀 FitFix API Server running on port 3000
📍 Health check: http://localhost:3000/
📚 API Base URL: http://localhost:3000/api
```

### 7. Test the API

**Health Check:**
```bash
curl http://localhost:3000/
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "your-admin@email.com", "password": "your-password"}'
```

Save the `token` from the response!

**Get Profile (Protected Route):**
```bash
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Common Issues & Solutions

### ❌ "Firebase Admin SDK initialization failed"
**Solution:** 
- Check that `serviceAccountKey.json` exists in root directory
- Verify the JSON file is valid (not corrupted)
- Ensure you downloaded the correct service account key

### ❌ "Firebase API key not configured"
**Solution:**
- Create `.env` file in root directory
- Add `FIREBASE_API_KEY=your_key_here`
- Restart the server

### ❌ "User profile not found" after login
**Solution:**
- User exists in Firebase Auth but not in Firestore
- Run `npm run create-admin` to create the user properly
- Or manually create user document in Firestore (see SETUP_GUIDE.md)

### ❌ Port 3000 already in use
**Solution:**
- Change `PORT` in `.env` to a different port (e.g., `3001`)
- Or stop the process using port 3000

## Next Steps

✅ Backend is running! Now you can:

1. **Test Admin Features:**
   - Create employees: `POST /api/admin/employees`
   - View dashboard stats: `GET /api/admin/dashboard/stats`

2. **Test Employee Features:**
   - Create users: `POST /api/employee/users`
   - Assign meal plans: `POST /api/employee/users/:userId/meal-plans`

3. **Set Up Frontend:**
   - React website: See `FRONTEND_INTEGRATION.md`
   - Flutter mobile app: See `FRONTEND_INTEGRATION.md`

4. **Configure Firestore:**
   - Set up security rules: See `FIRESTORE_STRUCTURE.md`
   - Create indexes as needed

## API Endpoints Summary

### Public
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register

### Protected (Require Token)
- `GET /api/auth/profile` - Get profile
- `GET /api/admin/*` - Admin routes
- `GET /api/employee/*` - Employee routes
- `GET /api/user/*` - User routes

See `API_DOCUMENTATION.md` for complete API reference.

## Need Help?

- 📖 Full setup guide: `SETUP_GUIDE.md`
- 📚 API documentation: `API_DOCUMENTATION.md`
- 🗄️ Database structure: `FIRESTORE_STRUCTURE.md`
- 💻 Frontend integration: `FRONTEND_INTEGRATION.md`

---

**Happy coding! 🚀**

