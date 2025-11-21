// src/controllers/userController.js
// User-facing endpoints (for mobile app users)

import { db } from '../firebase.js';
import admin from 'firebase-admin';

/**
 * Get user's meal plans
 */
export async function getMyMealPlans(req, res) {
  try {
    const mealPlansSnapshot = await db
      .collection('mealPlans')
      .where('userId', '==', req.user.uid)
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .get();

    const mealPlans = [];
    mealPlansSnapshot.forEach(doc => {
      mealPlans.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: mealPlans,
      count: mealPlans.length
    });
  } catch (error) {
    console.error('Get meal plans error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

/**
 * Get user's workout plans
 */
export async function getMyWorkoutPlans(req, res) {
  try {
    const workoutPlansSnapshot = await db
      .collection('workoutPlans')
      .where('userId', '==', req.user.uid)
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .get();

    const workoutPlans = [];
    workoutPlansSnapshot.forEach(doc => {
      workoutPlans.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: workoutPlans,
      count: workoutPlans.length
    });
  } catch (error) {
    console.error('Get workout plans error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

// Progress operations moved to progressController.js

/**
 * Update user profile
 */
export async function updateProfile(req, res) {
  try {
    const { displayName, phoneNumber, dateOfBirth, gender, height, weight, fitnessGoals, photoURL, bio } = req.body;

    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (displayName !== undefined) updateData.displayName = displayName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (gender !== undefined) updateData.gender = gender;
    if (height !== undefined) updateData.height = height;
    if (weight !== undefined) updateData.weight = weight;
    if (fitnessGoals !== undefined) updateData.fitnessGoals = fitnessGoals;
    if (photoURL !== undefined) updateData.photoURL = photoURL;
    if (bio !== undefined) updateData.bio = bio;

    await db.collection('users').doc(req.user.uid).update(updateData);

    // Get updated profile
    const updatedDoc = await db.collection('users').doc(req.user.uid).get();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        uid: updatedDoc.id,
        ...updatedDoc.data()
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

/**
 * Change user password
 * POST /api/user/change-password
 */
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const { auth } = await import('../firebase.js');
    const user = await auth.getUser(req.user.uid);

    // Verify current password by attempting to sign in
    const apiKey = process.env.FIREBASE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Firebase API key not configured'
      });
    }

    const fetch = (await import('node-fetch')).default;
    const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
    
    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        password: currentPassword,
        returnSecureToken: true
      })
    });

    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json().catch(() => ({}));
      return res.status(401).json({
        success: false,
        message: errorData.error?.message || 'Current password is incorrect'
      });
    }

    // Update password
    await auth.updateUser(req.user.uid, {
      password: newPassword
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to change password'
    });
  }
}

/**
 * Change user email
 * POST /api/user/change-email
 */
export async function changeEmail(req, res) {
  try {
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'New email and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    const { auth } = await import('../firebase.js');
    const user = await auth.getUser(req.user.uid);

    // Verify password
    const apiKey = process.env.FIREBASE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Firebase API key not configured'
      });
    }

    const fetch = (await import('node-fetch')).default;
    const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
    
    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        password: password,
        returnSecureToken: true
      })
    });

    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json().catch(() => ({}));
      return res.status(401).json({
        success: false,
        message: errorData.error?.message || 'Password is incorrect'
      });
    }

    // Check if email already exists
    try {
      await auth.getUserByEmail(newEmail);
      return res.status(409).json({
        success: false,
        message: 'Email already in use'
      });
    } catch (error) {
      // Email doesn't exist, which is what we want
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Update email
    await auth.updateUser(req.user.uid, {
      email: newEmail,
      emailVerified: false // Reset verification status
    });

    // Update email in Firestore
    await db.collection('users').doc(req.user.uid).update({
      email: newEmail,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message: 'Email changed successfully. Please verify your new email address.'
    });
  } catch (error) {
    console.error('Change email error:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({
        success: false,
        message: 'Email already in use'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to change email'
    });
  }
}

/**
 * Delete own account
 * DELETE /api/user/account
 */
export async function deleteAccount(req, res) {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }

    const { auth } = await import('../firebase.js');
    const user = await auth.getUser(req.user.uid);

    // Verify password
    const apiKey = process.env.FIREBASE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Firebase API key not configured'
      });
    }

    const fetch = (await import('node-fetch')).default;
    const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
    
    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        password: password,
        returnSecureToken: true
      })
    });

    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json().catch(() => ({}));
      return res.status(401).json({
        success: false,
        message: errorData.error?.message || 'Password is incorrect'
      });
    }

    const uid = req.user.uid;

    // Delete from Firebase Auth
    try {
      await auth.deleteUser(uid);
    } catch (error) {
      console.warn('Error deleting from Auth (may already be deleted):', error.message);
    }

    // Delete from Firestore
    await db.collection('users').doc(uid).delete();

    // Delete user's progress entries
    const progressSnapshot = await db
      .collection('progress')
      .where('userId', '==', uid)
      .get();

    const batch = db.batch();
    progressSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete account'
    });
  }
}

