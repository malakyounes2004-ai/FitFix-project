// frontend/src/config/firebaseClient.js
// Firebase Client SDK configuration for frontend
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Firebase configuration - these should be in your .env file
// Supports both VITE_FIREBASE_* (for Vite) and FIREBASE_* (for compatibility)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || import.meta.env.FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || import.meta.env.FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || import.meta.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || import.meta.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || import.meta.env.FIREBASE_APP_ID || ''
};

// Initialize Firebase only if config is available
let app = null;
let auth = null;
let db = null;

try {
  // Check if at least apiKey is provided and not empty
  if (firebaseConfig.apiKey && firebaseConfig.apiKey.trim() !== '') {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Enable IndexedDB persistence for offline support and instant cache
    if (typeof window !== 'undefined') {
      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('⚠️ Firestore persistence failed: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
          console.warn('⚠️ Firestore persistence not supported in this browser');
        } else {
          console.warn('⚠️ Firestore persistence error:', err);
        }
      });
    }
    
    console.log('✅ Firebase initialized successfully with Firestore persistence');
  } else {
    console.warn('⚠️ Firebase config not found. Phone authentication will not work. Please set VITE_FIREBASE_* environment variables.');
    // Create a dummy auth object to prevent import errors
    auth = null;
    db = null;
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  auth = null;
  db = null;
}

// Helper function to setup RecaptchaVerifier for phone auth
export const setupRecaptcha = (elementId = 'recaptcha-container') => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please configure Firebase environment variables.');
  }
  return new RecaptchaVerifier(auth, elementId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved - allow request
    },
    'expired-callback': () => {
      // Response expired - ask user to solve reCAPTCHA again
      console.error('reCAPTCHA expired');
    }
  });
};

export { auth, db };
export default app;

