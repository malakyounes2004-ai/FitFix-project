# Employee Verification System - Setup Guide

## Overview

This system implements a complete employee verification workflow with:
- ✅ Google reCAPTCHA v3 protection
- ✅ Firebase Phone Auth (OTP verification)
- ✅ Admin request management
- ✅ Automatic account creation
- ✅ Email notifications

## Prerequisites

1. Firebase project with:
   - Authentication enabled (Email/Password + Phone)
   - Firestore Database enabled
   - Firebase Admin SDK configured

2. Google reCAPTCHA v3:
   - Site Key (for frontend)
   - Secret Key (for backend)

## Step 1: Configure reCAPTCHA v3

### 1.1 Get reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click **+ Create** to create a new site
3. Choose **reCAPTCHA v3**
4. Add your domain (e.g., `localhost` for development)
5. Copy the **Site Key** and **Secret Key**

### 1.2 Update Frontend

1. Update `frontend/index.html`:
   ```html
   <script src="https://www.google.com/recaptcha/api.js?render=YOUR_RECAPTCHA_SITE_KEY"></script>
   ```
   Replace `YOUR_RECAPTCHA_SITE_KEY` with your actual site key.

2. Create `.env` file in `frontend/` directory:
   ```env
   VITE_RECAPTCHA_SITE_KEY=your_site_key_here
   ```

### 1.3 Update Backend

Add to your backend `.env` file:
```env
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

## Step 2: Configure Firebase Phone Authentication

### 2.1 Enable Phone Auth in Firebase Console

1. Go to Firebase Console > Authentication > Sign-in method
2. Enable **Phone** provider
3. Configure reCAPTCHA (Firebase will handle this automatically)

### 2.1.1 Enable Phone Number Regions (IMPORTANT)

**This is required to fix the "operation-not-allowed" error:**

1. Go to Firebase Console > Authentication > Sign-in method
2. Click on the **Phone** provider (it should show as "Enabled")
3. Click on the **Phone numbers** tab (or look for "Phone number regions" section)
4. **Enable the countries/regions** where your users will be located:
   - For example, if your users are in the US, enable "United States (+1)"
   - If your users are in India, enable "India (+91)"
   - You can enable multiple regions
5. Click **Save**

**Note:** If you don't see a "Phone numbers" tab, the region settings might be in:
- Firebase Console > Authentication > Settings > Phone numbers
- Or in the Phone provider settings under "Allowed phone number regions"

**Common regions to enable:**
- United States (+1)
- United Kingdom (+44)
- India (+91)
- Canada (+1)
- Australia (+61)
- And any other countries where your users are located

### 2.2 Update Frontend Firebase Config

Create/update `frontend/.env`:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**How to get these values:**
1. Go to Firebase Console > Project Settings > General
2. Scroll to "Your apps" section
3. If you don't have a web app, click "Add app" > Web (</>)
4. Copy the config values

### 2.3 Update `frontend/src/config/firebaseClient.js`

The file is already created, but make sure your `.env` variables match the config.

## Step 3: Install Dependencies

### Frontend
```bash
cd frontend
npm install firebase
```

### Backend
No additional dependencies needed (axios is already installed for reCAPTCHA verification).

## Step 4: Update Firestore Security Rules

See `FIRESTORE_SECURITY_RULES.md` for the complete rules. Apply them in Firebase Console.

## Step 5: Test the System

### 5.1 Test Employee Signup Flow

1. Navigate to `/contact-admin` (Employee Signup page)
2. Fill in the form
3. Enter phone number and click "Send Verification Code"
4. Enter the 6-digit OTP code
5. Select a subscription plan
6. Click "Submit Request"
7. Check that reCAPTCHA executes (invisible)
8. Verify request appears in admin panel

### 5.2 Test Admin Approval

1. Login as admin
2. Go to "Employee Requests" in sidebar
3. View pending requests
4. Click "Approve" on a request
5. Verify:
   - Employee account is created in Firebase Auth
   - Employee document is created in Firestore
   - Subscription is created
   - Email is sent to employee

## Environment Variables Summary

### Frontend `.env` (in `frontend/` directory)
```env
VITE_RECAPTCHA_SITE_KEY=your_site_key
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Backend `.env` (in root directory)
```env
RECAPTCHA_SECRET_KEY=your_secret_key
# ... other existing env variables
```

## Troubleshooting

### reCAPTCHA Not Working
- Check that the script is loaded in `index.html`
- Verify `VITE_RECAPTCHA_SITE_KEY` is set correctly
- Check browser console for errors
- Make sure domain is whitelisted in reCAPTCHA console

### Phone Auth Not Working
- Verify Phone provider is enabled in Firebase Console
- **IMPORTANT: Enable phone number regions** in Firebase Console > Authentication > Sign-in method > Phone > Phone numbers
- Check that Firebase config values are correct
- Ensure phone number format is correct (with country code, e.g., +1234567890)
- Check Firebase Console > Authentication > Users for verification attempts

### Error: "SMS unable to be sent until this region enabled" (auth/operation-not-allowed)
**This error means the phone number's country/region is not enabled in Firebase.**

**Solution:**
1. Go to Firebase Console > Authentication > Sign-in method
2. Click on **Phone** provider
3. Find the **Phone numbers** or **Allowed regions** section
4. Enable the country code for the phone number you're trying to verify
   - For example, if the error occurs with a +1 number, enable "United States" or "Canada"
   - If it's a +91 number, enable "India"
5. Save the changes
6. Try sending the verification code again

**Note:** Some Firebase projects may have restrictions on which regions can be enabled based on your billing plan or project settings.

### Backend Errors
- Verify `RECAPTCHA_SECRET_KEY` is set in backend `.env`
- Check server logs for detailed error messages
- Ensure Firestore rules allow the operations

## API Endpoints

### Public Endpoints
- `POST /api/employee-requests` - Submit employee request
- `POST /api/verify-recaptcha` - Verify reCAPTCHA token

### Admin Only Endpoints
- `GET /api/employee-requests` - Get all requests
- `POST /api/employee-requests/approve/:id` - Approve request
- `POST /api/employee-requests/reject/:id` - Reject request

## Flow Diagram

```
1. Employee fills form
   ↓
2. Employee verifies phone (OTP)
   ↓
3. Employee submits request (reCAPTCHA v3 executes)
   ↓
4. Request saved to Firestore (status: pending)
   ↓
5. Admin reviews request
   ↓
6. Admin approves → Account created + Email sent
   OR
   Admin rejects → Status updated
```

## Security Notes

- reCAPTCHA v3 score < 0.5 blocks submission
- Phone verification is required before submission
- Only admins can approve/reject requests
- All sensitive operations require authentication
- Firestore rules enforce access control

