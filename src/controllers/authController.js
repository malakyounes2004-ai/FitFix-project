// src/controllers/authController.js
import fetch from 'node-fetch';
import admin from 'firebase-admin';
import { db, auth } from '../firebase.js';

/**
 * Login user with email and password
 * Uses Firebase Auth REST API (production only)
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const apiKey = process.env.FIREBASE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        message: 'FIREBASE_API_KEY is required. Add it to your .env file.' 
      });
    }

    // Production Firebase Auth URL
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

    console.log('🔗 Attempting to connect to Firebase Auth (production)...');
    
    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
        // Add timeout for better error handling
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError.message);
      
      if (fetchError.name === 'AbortError') {
        return res.status(503).json({ 
          success: false, 
          message: 'Firebase Auth request timeout. Check your connection.' 
        });
      }
      
      if (fetchError.code === 'ECONNREFUSED' || fetchError.message.includes('ECONNREFUSED')) {
        return res.status(503).json({ 
          success: false, 
          message: 'Cannot connect to Firebase Auth. Check your internet connection and FIREBASE_API_KEY.' 
        });
      }
      
      throw fetchError; // Re-throw if it's a different error
    }

    let data;
    if (!response.ok) {
      data = await response.json().catch(() => ({}));
      console.error('❌ Firebase Auth response error:', response.status, data);
      return res.status(401).json({
        success: false,
        message: data.error?.message || 'Invalid email or password'
      });
    }

    // Parse response data
    data = await response.json();

    if (data.error) {
      console.error('❌ Firebase Auth data error:', data.error);
      return res.status(401).json({
        success: false,
        message: data.error.message || 'Invalid email or password'
      });
    }

    const uid = data.localId;

    console.log('✅ Firebase Auth successful, fetching user profile...');

    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      console.error('❌ User profile not found in Firestore for uid:', uid);
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    // Update last login timestamp
    const lastLoginTimestamp = admin.firestore.Timestamp.now();
    await db.collection('users').doc(uid).update({
      lastLogin: lastLoginTimestamp,
      updatedAt: lastLoginTimestamp
    });

    const userData = userDoc.data();

    console.log('✅ Login successful for user:', userData.email);
    console.log('📅 Last login updated:', lastLoginTimestamp.toDate());

    // Get updated user data including lastLogin
    const updatedUserDoc = await db.collection('users').doc(uid).get();
    const updatedUserData = updatedUserDoc.data();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: data.idToken,
        refreshToken: data.refreshToken,
        user: {
          uid,
          email: data.email || email,
          ...updatedUserData
        }
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('  Error code:', error.code);
    console.error('  Error message:', error.message);
    console.error('  Stack:', error.stack);
    
    // Provide more specific error messages
    if (error.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
      return res.status(503).json({ 
        success: false, 
        message: 'Firebase Auth service unavailable. Check your connection and Firebase configuration.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message, code: error.code })
    });
  }
}

/**
 * Register a new user (admin or normal user)
 */
export async function register(req, res) {
  try {
    const { email, password, displayName, role = 'user' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const validRoles = ['admin', 'employee', 'user'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be: admin, employee, or user' });
    }

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: displayName || email.split('@')[0],
      emailVerified: false
    });

    await db.collection('users').doc(userRecord.uid).set({
      email,
      displayName: displayName || email.split('@')[0],
      role,
      isActive: true,
      signupMethod: 'mobile',  // Mark as signed up via mobile app
      createdAt: new Date(),
      updatedAt: new Date(),
      photoURL: null
    });

    // Get created user document
    const userDoc = await db.collection('users').doc(userRecord.uid).get();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        uid: userRecord.uid,
        ...userDoc.data()
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('  Error code:', error.code);
    console.error('  Error message:', error.message);
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message, code: error.code })
    });
  }
}

/**
 * Get current user profile
 * Protected route: requires req.user from authenticate middleware
 */
export async function getProfile(req, res) {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    const userData = userDoc.data();

    res.json({
      success: true,
      data: {
        uid: req.user.uid,
        email: req.user.email,
        ...userData
      }
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    console.error('  Error code:', error.code);
    console.error('  Error message:', error.message);
    
    if (error.code === 5 || error.message.includes('NOT_FOUND')) {
      return res.status(404).json({ 
        success: false, 
        message: 'User profile not found in database' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message, code: error.code })
    });
  }
}

// Export all functions
//export { login, register, getProfile };
