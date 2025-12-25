# Firestore Database Setup Guide

If you're getting a "NOT_FOUND" error when testing the connection, it means your Firestore database hasn't been created yet. Follow these steps:

## Step-by-Step: Create Firestore Database

### 1. Go to Firebase Console
Visit: https://console.firebase.google.com/

### 2. Select Your Project
- Click on your FitFix project (or create a new one if you haven't)

### 3. Navigate to Firestore Database
- In the left sidebar, click on **"Firestore Database"**
- If you see "Create database" button, click it
- If you see a database already, you might need to check the project ID

### 4. Create Database
1. Click **"Create database"**
2. Choose **"Start in test mode"** (we'll add security rules later)
   - ⚠️ **Important**: Test mode allows read/write for 30 days. Make sure to add security rules before production!
3. Click **"Next"**

### 5. Select Database Location
- Choose a location closest to your users
- Common options:
  - `us-central` (Iowa) - Good for US users
  - `europe-west` (Belgium) - Good for European users
  - `asia-southeast1` (Singapore) - Good for Asian users
- **Note**: You cannot change this location later!
- Click **"Enable"**

### 6. Wait for Database Creation
- Firebase will create your database (takes about 1-2 minutes)
- You'll see a success message when it's ready

### 7. Verify Setup
Run the test again:
```bash
npm run test-connection
```

You should now see:
```
✅ Firestore connected successfully
```

## Alternative: Check if Database Exists

If you think the database already exists:

1. Go to Firebase Console > Firestore Database
2. Check the URL - it should show your project ID
3. Verify the project ID matches the one in your `serviceAccountKey.json`:
   ```json
   {
     "project_id": "your-project-id-here"
   }
   ```

## Common Issues

### Issue: "Project not found"
**Solution**: 
- Verify the `project_id` in `serviceAccountKey.json` matches your Firebase project
- Make sure you're using the correct service account key

### Issue: "Permission denied"
**Solution**:
- Ensure the service account has proper permissions
- Go to Firebase Console > Project Settings > Service Accounts
- Generate a new private key if needed

### Issue: "Database location not set"
**Solution**:
- You must create the database through the Firebase Console first
- The database location cannot be set programmatically

## Next Steps

After creating the database:

1. ✅ Run `npm run test-connection` to verify
2. ✅ Run `npm run create-admin` to create your first admin user
3. ✅ Set up Firestore Security Rules (see `FIRESTORE_STRUCTURE.md`)
4. ✅ Start building your application!

## Security Rules Setup

Once your database is created, you should set up security rules. See `FIRESTORE_STRUCTURE.md` for the complete security rules configuration.

**Quick Test Mode Rules** (for development only):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 1, 1);
    }
  }
}
```

⚠️ **Warning**: The above rules allow anyone to read/write. Only use for development!

---

**Need help?** Check the main [SETUP_GUIDE.md](./SETUP_GUIDE.md) or [README.md](./README.md)

