// src/controllers/employeeController.js
import { auth, db } from '../firebase.js';
import admin from 'firebase-admin';

/**
 * Create a new user with a temporary password (Employee/Admin only)
 */
export async function createUser(req, res) {
  try {
    const { email, displayName, phoneNumber, dateOfBirth, gender, height, weight, fitnessGoals } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const tempPassword = Math.random().toString(36).slice(-10);

    const userRecord = await auth.createUser({
      email,
      password: tempPassword,
      displayName: displayName || email.split('@')[0],
      emailVerified: false
    });

    const userData = {
      email,
      displayName: displayName || email.split('@')[0],
      phoneNumber: phoneNumber || null,
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      height: height || null,
      weight: weight || null,
      fitnessGoals: fitnessGoals || [],
      role: 'user',
      isActive: true,
      assignedEmployeeId: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      photoURL: null
    };

    await db.collection('users').doc(userRecord.uid).set(userData);

    console.log(`[EMAIL] Send credentials to ${email} with password ${tempPassword}`);

    res.status(201).json({
      success: true,
      message: 'User created with temporary password',
      data: {
        uid: userRecord.uid,
        tempPassword,
        ...userData
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}

/**
 * Get all users assigned to this employee
 */
export async function getMyUsers(req, res) {
  try {
    const usersSnapshot = await db
      .collection('users')
      .where('assignedEmployeeId', '==', req.user.uid)
      .where('role', '==', 'user')
      .get();

    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({
        uid: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Get my users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

/**
 * Assign meal plan to a user
 */
export async function assignMealPlan(req, res) {
  try {
    const { userId } = req.params;
    const { planName, meals, startDate, endDate, notes } = req.body;

    if (!planName || !meals) {
      return res.status(400).json({ 
        success: false, 
        message: 'Plan name and meals are required' 
      });
    }

    // Verify user exists and is assigned to this employee
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userData = userDoc.data();
    if (userData.assignedEmployeeId !== req.user.uid) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not assigned to this user' 
      });
    }

    // Create meal plan document
    const mealPlanRef = await db.collection('mealPlans').add({
      userId,
      assignedBy: req.user.uid,
      planName,
      meals,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      notes: notes || null,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const mealPlanDoc = await mealPlanRef.get();

    res.status(201).json({
      success: true,
      message: 'Meal plan assigned successfully',
      data: {
        id: mealPlanRef.id,
        ...mealPlanDoc.data()
      }
    });
  } catch (error) {
    console.error('Assign meal plan error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

/**
 * Get admin info (Employee only)
 * GET /employee/admin
 */
export async function getAdminInfo(req, res) {
  try {
    // Find admin user
    const adminSnapshot = await db
      .collection('users')
      .where('role', '==', 'admin')
      .limit(1)
      .get();

    if (adminSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const adminDoc = adminSnapshot.docs[0];
    const adminData = adminDoc.data();

    res.json({
      success: true,
      data: {
        uid: adminDoc.id,
        displayName: adminData.displayName || 'Admin',
        email: adminData.email,
        role: adminData.role,
        photoURL: adminData.photoURL || null
      }
    });
  } catch (error) {
    console.error('Get admin info error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}

export async function assignWorkoutPlan(req, res) {
  try {
    const { userId } = req.params;
    const { planName, workouts, startDate, endDate, notes } = req.body;

    if (!planName || !workouts) {
      return res.status(400).json({ 
        success: false, 
        message: 'Plan name and workouts are required' 
      });
    }

    // Verify user exists and is assigned to this employee
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userData = userDoc.data();
    if (userData.assignedEmployeeId !== req.user.uid) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not assigned to this user' 
      });
    }

    // Create workout plan document
    const workoutPlanRef = await db.collection('workoutPlans').add({
      userId,
      assignedBy: req.user.uid,
      planName,
      workouts,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      notes: notes || null,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const workoutPlanDoc = await workoutPlanRef.get();

    res.status(201).json({
      success: true,
      message: 'Workout plan assigned successfully',
      data: {
        id: workoutPlanRef.id,
        ...workoutPlanDoc.data()
      }
    });
  } catch (error) {
    console.error('Assign workout plan error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

/**
 * Get user progress
 */
export async function getUserProgress(req, res) {
  try {
    const { userId } = req.params;

    // Verify user exists and is assigned to this employee
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userData = userDoc.data();
    if (userData.assignedEmployeeId !== req.user.uid) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not assigned to this user' 
      });
    }

    // Get progress entries
    const progressSnapshot = await db
      .collection('progress')
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .limit(30)
      .get();

    const progress = [];
    progressSnapshot.forEach(doc => {
      progress.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: progress,
      count: progress.length
    });
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

