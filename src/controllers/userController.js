// src/controllers/userController.js
// User-facing endpoints (for mobile app users)

import { db } from '../firebase.js';
import admin from 'firebase-admin';
import { computeDailyMacros } from '../utils/mealPlanMacros.js';

/**
 * Get user's meal plans
 * Returns meal plans from both:
 * 1. mealPlans collection (legacy)
 * 2. users/{userId}/mealPlan field (new system)
 */
export async function getMyMealPlans(req, res) {
  try {
    const userId = req.user.uid;
    const mealPlans = [];

    // 1. Get meal plans from mealPlans collection (legacy system)
    try {
      const mealPlansSnapshot = await db
        .collection('mealPlans')
        .where('userId', '==', userId)
        .where('status', '==', 'active')
        .orderBy('createdAt', 'desc')
        .get();

      mealPlansSnapshot.forEach(doc => {
        const data = doc.data();
        
        // Recalculate macros if missing or zero
        if (!data.dailyMacros || (!data.dailyProteinG && !data.dailyCarbsG && !data.dailyFatsG)) {
          const macros = computeDailyMacros(data);
          // Store in new dailyMacros format
          data.dailyMacros = {
            proteins: macros.proteins,
            carbs: macros.carbs,
            fats: macros.fats,
            allZero: macros.allZero
          };
          // Keep old format for backward compatibility
          data.dailyProteinG = macros.proteins;
          data.dailyCarbsG = macros.carbs;
          data.dailyFatsG = macros.fats;
        }
        
        mealPlans.push({
          id: doc.id,
          source: 'collection',
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || null
        });
      });
    } catch (error) {
      console.warn('Error fetching from mealPlans collection:', error.message);
      // Continue even if this fails
    }

    // 2. Get meal plan from user document (new system)
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData.mealPlan) {
          const mealPlan = userData.mealPlan;
          
          // Ensure macros are calculated if missing
          if (!mealPlan.dailyMacros || mealPlan.dailyProteinG === undefined || mealPlan.dailyCarbsG === undefined || mealPlan.dailyFatsG === undefined) {
            const macros = computeDailyMacros(mealPlan);
            // Store in new dailyMacros format
            mealPlan.dailyMacros = {
              proteins: macros.proteins,
              carbs: macros.carbs,
              fats: macros.fats,
              allZero: macros.allZero
            };
            // Keep old format for backward compatibility
            mealPlan.dailyProteinG = macros.proteins;
            mealPlan.dailyCarbsG = macros.carbs;
            mealPlan.dailyFatsG = macros.fats;
          }

          mealPlans.push({
            id: 'user-meal-plan',
            source: 'user-document',
            ...mealPlan,
            createdAt: mealPlan.createdAt?.toDate?.() || mealPlan.createdAt || null,
            updatedAt: mealPlan.updatedAt?.toDate?.() || mealPlan.updatedAt || null
          });
        }
      }
    } catch (error) {
      console.warn('Error fetching meal plan from user document:', error.message);
      // Continue even if this fails
    }

    // Sort by createdAt descending (newest first)
    mealPlans.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
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
    const userId = req.user.uid;
    const planDoc = await db.collection('workoutPlans').doc(userId).get();

    const workoutPlans = [];
    
    if (planDoc.exists) {
      workoutPlans.push({
        id: planDoc.id,
        ...planDoc.data()
      });
    }

    res.json({
      success: true,
      workoutPlans
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

/**
 * Get chat contacts for user
 * Returns assigned employee (coach) and other users under the same employee
 * GET /api/user/chat-contacts
 */
export async function getChatContacts(req, res) {
  try {
    const userId = req.user.uid;


     // 🔹 Fetch full user document from Firestore
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    } 

  const userData = userDoc.data();
    const assignedEmployeeId = userData.assignedEmployeeId;

    // If user has no assigned employee, return empty list
    if (!assignedEmployeeId) {
      return res.json({
        success: true,
        contacts: []
      });
    }
    const contacts = [];
  

    // 1. Fetch assigned employee (coach)
    try {
      const employeeDoc = await db.collection('users').doc(assignedEmployeeId).get();
      if (employeeDoc.exists) {
        const employeeData = employeeDoc.data();
        // Only include if role is employee (not admin)
        if (employeeData.role === 'employee') {
          contacts.push({
            uid: assignedEmployeeId,
            displayName: employeeData.displayName || '',
            role: 'employee',
            photoURL: employeeData.photoURL || null
          });
        }
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
      // Continue even if employee fetch fails
    }

    // 2. Fetch other users with the same assignedEmployeeId (excluding self)
    try {
      const usersSnapshot = await db
        .collection('users')
        .where('assignedEmployeeId', '==', assignedEmployeeId)
        .where('role', '==', 'user')
        .get();

      usersSnapshot.forEach(doc => {
        // Exclude current user
        if (doc.id !== userId) {
          const userData = doc.data();
          contacts.push({
            uid: doc.id,
            displayName: userData.displayName || '',
            role: 'user',
            photoURL: userData.photoURL || null
          });
        }
      });
    } catch (error) {
      console.error('Error fetching other users:', error);
      // Continue even if users fetch fails
    }

    return res.json({
      success: true,
      contacts
    });
  } catch (error) {
    console.error('Get chat contacts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get chat contacts'
    });
  }
}

/**
 * Save Expo Push Token for authenticated user
 * POST /api/user/save-push-token
 */
export async function savePushToken(req, res) {
  try {
    const { pushToken } = req.body;
    const userId = req.user.uid;

    if (!pushToken) {
      return res.status(400).json({
        success: false,
        message: 'pushToken is required'
      });
    }

    await db.collection('users').doc(userId).update({
      pushToken,
      pushTokenUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.json({
      success: true
    });
  } catch (error) {
    console.error('Save push token error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save push token'
    });
  }
}

