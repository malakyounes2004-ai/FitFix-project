// src/controllers/authController.js
import fetch from 'node-fetch';
import admin from 'firebase-admin';
import { db, auth } from '../firebase.js';
import { generateOTP, hashOTP, verifyOTP, validatePasswordStrength } from '../utils/passwordUtils.js';
import { sendPasswordResetOTP } from '../utils/emailService.js';

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

    // If user has an assigned employee, fetch the employee name
    if (userData.assignedEmployeeId) {
      try {
        const employeeDoc = await db
          .collection('users')
          .doc(userData.assignedEmployeeId)
          .get();

        if (employeeDoc.exists) {
          const employeeData = employeeDoc.data();
          userData.assignedEmployeeName = employeeData.displayName || '';
        }
      } catch (e) {
        // Fail silently, do not break profile response
        // assignedEmployeeName will simply not be included
      }
    }

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

/**
 * Forgot Password - Generate and send OTP code
 * POST /auth/forgot-password
 * Input: { email }
 */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }

    let userRecord;
    try {
      // Check if user exists in Firebase Auth
      userRecord = await auth.getUserByEmail(email);
    } catch (error) {
      // If user doesn't exist, return generic success message (security best practice)
      if (error.code === 'auth/user-not-found') {
        console.log(`⚠️ Password reset requested for non-existent email: ${email}`);
        // Return generic success to prevent email enumeration
        return res.json({
          success: true,
          message: 'If an account with that email exists, a password reset code has been sent.'
        });
      }
      throw error;
    }

    const uid = userRecord.uid;

    // Get user document from Firestore to get display name and real email
    let userDoc;
    let displayName = 'User';
    let targetEmail = email; // Default to login email (fallback only)
    try {
      userDoc = await db.collection('users').doc(uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        displayName = userData.displayName || displayName;
        // Use realEmail from Firestore for OTP delivery (user's actual inbox)
        // The input 'email' is the SYSTEM/LOGIN email (e.g., mhmdd@fitfix.com) used only for user identification
        // We send OTP to realEmail (e.g., user@gmail.com) so users receive it in their real inbox
        targetEmail = userData.realEmail || email;
      }
    } catch (error) {
      console.error('Error fetching user document:', error);
      // Continue even if Firestore fetch fails
    }

    // Generate 6-digit OTP
    const otpCode = generateOTP();
    const codeHash = hashOTP(otpCode);

    // Set expiration time (10 minutes from now)
    const expiresAt = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 10 * 60 * 1000)
    );

    // Save reset password data to Firestore
    await db.collection('users').doc(uid).update({
      resetPassword: {
        codeHash,
        expiresAt,
        attempts: 0,
        verified: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    });

    // Send OTP email to user's real email address (not the system login email)
    try {
      await sendPasswordResetOTP(targetEmail, displayName, otpCode);
      console.log(`✅ Password reset OTP sent to: ${targetEmail} (system login email: ${email})`);
    } catch (emailError) {
      console.error('❌ Failed to send OTP email:', emailError);
      // Remove the reset password data if email fails
      await db.collection('users').doc(uid).update({
        resetPassword: admin.firestore.FieldValue.delete()
      });
      throw new Error('Failed to send password reset email. Please try again later.');
    }

    // Return generic success message (security best practice)
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset code has been sent.'
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    
    // Don't expose internal errors
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred. Please try again later.' 
    });
  }
}

/**
 * Verify Reset Code - Validate OTP code
 * POST /auth/verify-reset-code
 * Input: { email, code }
 */
export async function verifyResetCode(req, res) {
  try {
    const { email, code } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification code is required' 
      });
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid code format. Code must be 6 digits.' 
      });
    }

    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return res.status(404).json({ 
          success: false, 
          message: 'Invalid email or verification code' 
        });
      }
      throw error;
    }

    const uid = userRecord.uid;

    // Get user document from Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userData = userDoc.data();
    const resetPassword = userData.resetPassword;

    // Check if reset password request exists
    if (!resetPassword || !resetPassword.codeHash) {
      return res.status(400).json({ 
        success: false, 
        message: 'No password reset request found. Please request a new code.' 
      });
    }

    // Check if already verified
    if (resetPassword.verified === true) {
      return res.status(400).json({ 
        success: false, 
        message: 'This code has already been used. Please request a new code.' 
      });
    }

    // Check expiration
    const now = admin.firestore.Timestamp.now();
    if (resetPassword.expiresAt.toMillis() < now.toMillis()) {
      // Clean up expired reset data
      await db.collection('users').doc(uid).update({
        resetPassword: admin.firestore.FieldValue.delete()
      });
      return res.status(400).json({ 
        success: false, 
        message: 'Verification code has expired. Please request a new code.' 
      });
    }

    // Check attempts limit (max 5 attempts)
    if (resetPassword.attempts >= 5) {
      // Clean up after max attempts
      await db.collection('users').doc(uid).update({
        resetPassword: admin.firestore.FieldValue.delete()
      });
      return res.status(400).json({ 
        success: false, 
        message: 'Too many failed attempts. Please request a new code.' 
      });
    }

    // Verify OTP code
    const isValid = verifyOTP(code, resetPassword.codeHash);

    if (!isValid) {
      // Increment attempts
      const newAttempts = (resetPassword.attempts || 0) + 1;
      await db.collection('users').doc(uid).update({
        'resetPassword.attempts': newAttempts
      });

      const remainingAttempts = 5 - newAttempts;
      return res.status(400).json({ 
        success: false, 
        message: `Invalid verification code. ${remainingAttempts > 0 ? `${remainingAttempts} attempt(s) remaining.` : 'Please request a new code.'}` 
      });
    }

    // Mark as verified
    await db.collection('users').doc(uid).update({
      'resetPassword.verified': true,
      'resetPassword.verifiedAt': admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ Password reset code verified for: ${email}`);

    res.json({
      success: true,
      message: 'Verification code is valid. You can now reset your password.'
    });
  } catch (error) {
    console.error('❌ Verify reset code error:', error);
    
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred. Please try again later.' 
    });
  }
}

/**
 * Reset Password - Update password after OTP verification
 * POST /auth/reset-password
 * Input: { email, newPassword }
 */
export async function resetPassword(req, res) {
  try {
    const { email, newPassword } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'New password is required' 
      });
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: passwordValidation.message 
      });
    }

    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      throw error;
    }

    const uid = userRecord.uid;

    // Get user document from Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userData = userDoc.data();
    const resetPassword = userData.resetPassword;

    // Check if reset password request exists and is verified
    if (!resetPassword || !resetPassword.verified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please verify your code first before resetting your password.' 
      });
    }

    // Check expiration (even if verified, should still be within time limit)
    const now = admin.firestore.Timestamp.now();
    if (resetPassword.expiresAt.toMillis() < now.toMillis()) {
      // Clean up expired reset data
      await db.collection('users').doc(uid).update({
        resetPassword: admin.firestore.FieldValue.delete()
      });
      return res.status(400).json({ 
        success: false, 
        message: 'Password reset session has expired. Please request a new code.' 
      });
    }

    // Update password using Firebase Admin SDK
    await auth.updateUser(uid, {
      password: newPassword
    });

    // Remove reset password data from Firestore
    await db.collection('users').doc(uid).update({
      resetPassword: admin.firestore.FieldValue.delete()
    });

    console.log(`✅ Password reset successful for: ${email}`);

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/weak-password') {
      return res.status(400).json({ 
        success: false, 
        message: 'Password is too weak. Please choose a stronger password.' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while resetting your password. Please try again later.' 
    });
  }
}

// Export all functions
//export { login, register, getProfile };
