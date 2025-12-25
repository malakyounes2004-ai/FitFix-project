# Create User in Firebase - Quick Guide

You're getting `EMAIL_NOT_FOUND` because the user doesn't exist in Firebase Authentication yet.

## Solution: Create the User First

You have **3 options** to create your admin user:

---

## Option 1: Use Create Admin Script (Easiest) ⭐

This script creates the user in both Firebase Auth AND Firestore:

```bash
npm run create-admin
```

**When prompted, enter:**
- Email: `admin@gmail.com`
- Password: `admin123`
- Display Name: `admin` (or press Enter for default)

**This will:**
- ✅ Create user in Firebase Authentication
- ✅ Create user document in Firestore with `role: "admin"`
- ✅ Ready to login immediately!

---

## Option 2: Use Register Endpoint

Use the API register endpoint to create the user:

**Request in Postman:**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/register`
- Headers: `Content-Type: application/json`
- Body:
  ```json
  {
    "email": "admin@gmail.com",
    "password": "admin123",
    "displayName": "admin",
    "role": "admin"
  }
  ```

**This will:**
- ✅ Create user in Firebase Authentication
- ✅ Create user document in Firestore
- ✅ Ready to login immediately!

---

## Option 3: Create via Firebase Console

### Step 1: Create User in Firebase Auth

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Authentication** in left sidebar
4. Click **Users** tab
5. Click **Add user** button
6. Enter:
   - Email: `admin@gmail.com`
   - Password: `admin123`
   - Click **Add user**

### Step 2: Create User Document in Firestore

1. Still in Firebase Console
2. Click **Firestore Database** in left sidebar
3. Click **Start collection** (if first time) or find `users` collection
4. Collection ID: `users`
5. Document ID: **Use the UID from Authentication** (copy it from Auth > Users)
6. Add these fields:
   - `email` (string): `admin@gmail.com`
   - `displayName` (string): `admin`
   - `role` (string): `admin`
   - `isActive` (boolean): `true`
   - `createdAt` (timestamp): Current time
   - `updatedAt` (timestamp): Current time
7. Click **Save**

### Step 3: Test Login

Now try login again - it should work!

---

## Which Option Should I Use?

- **Option 1 (Script)**: ⭐ **Recommended** - Easiest, does everything automatically
- **Option 2 (API)**: Good if you want to test the API endpoint
- **Option 3 (Console)**: Good if you prefer using Firebase Console UI

---

## After Creating User

Test login:

**Postman Request:**
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
    "displayName": "admin",
    "role": "admin"
  },
  "token": "eyJhbGciOiJSUzI1NiIs..."
}
```

✅ **If you get a token, you're all set!**

---

## Common Issues

### "Email already exists"
- User already created in Firebase Auth
- Try login instead of creating again
- Or use a different email

### "User profile not found" after login
- User exists in Auth but not in Firestore
- Use Option 1 (script) or Option 3 (create Firestore document)
- Make sure `users` collection has document with user's UID

### "Invalid password"
- Password doesn't match
- Reset password in Firebase Console or create new user

---

## Quick Checklist

- [ ] User created in Firebase Authentication
- [ ] User document created in Firestore `users` collection
- [ ] User document has `role: "admin"` field
- [ ] User document has user's UID as document ID
- [ ] Test login returns token

---

**Recommendation:** Use `npm run create-admin` - it's the fastest way! 🚀

