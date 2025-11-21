# Environment Variables Setup Guide

## Important: Vite Environment Variables

**Vite only exposes environment variables that start with `VITE_` to the frontend.**

If you have `FIREBASE_API_KEY` in your `.env`, it won't be accessible in the frontend code.

## Solution

### For Frontend (in `frontend/.env` file):

You need to add `VITE_` prefix to your Firebase variables:

```env
# Firebase Client SDK (for frontend)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# reCAPTCHA (for frontend)
VITE_RECAPTCHA_SITE_KEY=your_site_key_here
```

### For Backend (in root `.env` file):

Keep your existing variables without `VITE_` prefix:

```env
# Firebase Admin SDK (for backend)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key

# reCAPTCHA (for backend)
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

## Quick Setup

1. **Copy your Firebase config values** from your existing `.env` or Firebase Console

2. **Create `frontend/.env` file** with `VITE_` prefix:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy... (your existing API key)
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

3. **Restart your dev server** after adding the `.env` file

## How to Get Firebase Config Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon) > **General** tab
4. Scroll to **Your apps** section
5. If you don't have a web app, click **Add app** > **Web** (</> icon)
6. Copy the config values shown

## Note

- Frontend `.env` file should be in `frontend/` directory
- Backend `.env` file should be in root directory
- Both can have different variable names (with/without `VITE_` prefix)
- Restart dev server after changing `.env` files

