// src/controllers/adminController.js
import { auth, db } from '../firebase.js';
import admin from 'firebase-admin';
import { sendEmployeeCredentials, sendPasswordResetNotification } from '../utils/emailService.js';

/**
 * Create a new employee (Admin only)
 */
export async function createEmployee(req, res) {
  try {
    const { email, password, displayName, phoneNumber, employeePaymentId } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: displayName || email.split('@')[0],
      emailVerified: false
    });

    // Fetch payment info and check subscription if this employee was created from a registration
    let paymentInfo = null;
    let hasActiveSubscription = false;
    
    if (employeePaymentId) {
      try {
        const paymentDoc = await db.collection('employeePayments').doc(employeePaymentId).get();
        if (paymentDoc.exists) {
          const paymentData = paymentDoc.data();
          paymentInfo = {
            selectedPlan: paymentData.selectedPlan || paymentData.selectedPlanKey || 'N/A',
            amount: paymentData.amount || 0
          };
          
          // Check if there's an active subscription for this payment
          const subscriptionSnapshot = await db
            .collection('subscriptions')
            .where('employeePaymentId', '==', employeePaymentId)
            .where('status', '==', 'active')
            .where('isActive', '==', true)
            .get();
          
          hasActiveSubscription = !subscriptionSnapshot.empty;
        }
        
        // Mark payment as processed
        await db.collection('employeePayments').doc(employeePaymentId).update({
          accountCreated: true,
          accountCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdEmployeeUid: userRecord.uid
        });
        
        // Update subscription with account creation date
        const subscriptionSnapshot = await db
          .collection('subscriptions')
          .where('employeePaymentId', '==', employeePaymentId)
          .get();
        
        if (!subscriptionSnapshot.empty) {
          const subscriptionDoc = subscriptionSnapshot.docs[0];
          await db.collection('subscriptions').doc(subscriptionDoc.id).update({
            accountCreated: true,
            accountCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
            accountCreatedUid: userRecord.uid
          });
        }
      } catch (paymentError) {
        console.error('⚠️ Error fetching payment info:', paymentError);
      }
    }
    
    // Only activate employee if they have an active subscription
    const employeeIsActive = hasActiveSubscription || !employeePaymentId; // Allow activation if no payment ID (manual creation)

    // Create employee document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      displayName: displayName || email.split('@')[0],
      phoneNumber: phoneNumber || null,
      role: 'employee',
      isActive: employeeIsActive,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.user.uid, // Track who created this employee
      photoURL: null
    });

    // Send credentials email to the new employee
    try {
      await sendEmployeeCredentials(
        email,
        displayName || email.split('@')[0],
        password,
        paymentInfo // Pass payment info to email template
      );
      console.log(`✅ Credentials email sent to ${email}${paymentInfo ? ' with payment info' : ''}`);
    } catch (emailError) {
      console.error('⚠️ Failed to send email, but account was created:', emailError);
      // Don't fail the whole operation if email fails
    }

    // Get created employee document
    const employeeDoc = await db.collection('users').doc(userRecord.uid).get();

    res.status(201).json({
      success: true,
      message: 'Employee created successfully and credentials sent via email',
      data: {
        uid: userRecord.uid,
        ...employeeDoc.data()
      }
    });
  } catch (error) {
    console.error('Create employee error:', error);
    
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
 * Get all employees (Admin only)
 */
export async function getAllEmployees(req, res) {
  try {
    const employeesSnapshot = await db
      .collection('users')
      .where('role', '==', 'employee')
      .get();

    const employees = [];
    employeesSnapshot.forEach(doc => {
      employees.push({
        uid: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: employees,
      count: employees.length
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

/**
 * Get all users (Admin only)
 * GET /admin/users
 */
export async function getAllUsers(req, res) {
  try {
    const usersSnapshot = await db
      .collection('users')
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
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}

/**
 * Get user by UID (Admin only)
 * GET /admin/users/:uid
 */
export async function getUserById(req, res) {
  try {
    const { uid } = req.params;

    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data();

    if (userData.role !== 'user') {
      return res.status(400).json({
        success: false,
        message: 'User is not a regular user'
      });
    }

    res.json({
      success: true,
      data: {
        uid: userDoc.id,
        ...userData
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}

/**
 * Update user (Admin only)
 * PUT /admin/users/:uid
 */
export async function updateUser(req, res) {
  try {
    const { uid } = req.params;
    const { displayName, phoneNumber, isActive, photoURL, height, weight, fitnessGoals } = req.body;

    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userData = userDoc.data();
    if (userData.role !== 'user') {
      return res.status(400).json({ 
        success: false, 
        message: 'User is not a regular user' 
      });
    }

    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (displayName !== undefined) updateData.displayName = displayName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (photoURL !== undefined) updateData.photoURL = photoURL;
    if (height !== undefined) updateData.height = height;
    if (weight !== undefined) updateData.weight = weight;
    if (fitnessGoals !== undefined) updateData.fitnessGoals = fitnessGoals;

    await db.collection('users').doc(uid).update(updateData);

    // Get updated document
    const updatedDoc = await db.collection('users').doc(uid).get();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        uid: updatedDoc.id,
        ...updatedDoc.data()
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}

/**
 * Delete user (Admin only)
 * DELETE /admin/users/:uid
 */
export async function deleteUser(req, res) {
  try {
    const { uid } = req.params;

    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userData = userDoc.data();
    if (userData.role !== 'user') {
      return res.status(400).json({ 
        success: false, 
        message: 'User is not a regular user' 
      });
    }

    // Delete from Firebase Auth
    await auth.deleteUser(uid);

    // Delete from Firestore
    await db.collection('users').doc(uid).delete();

    // Optionally delete user's progress entries
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
      message: 'User and associated data deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    
    if (error.code === 'auth/user-not-found') {
      // User already deleted from Auth, just delete from Firestore
      try {
        await db.collection('users').doc(uid).delete();
        return res.json({
          success: true,
          message: 'User deleted successfully'
        });
      } catch (firestoreError) {
        return res.status(500).json({ 
          success: false, 
          message: 'Error deleting user' 
        });
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}

/**
 * Get dashboard statistics (Admin only)
 */
export async function getDashboardStats(req, res) {
  try {
    const [employeesSnapshot, usersSnapshot, subscriptionsSnapshot] = await Promise.all([
      db.collection('users').where('role', '==', 'employee').get(),
      db.collection('users').where('role', '==', 'user').get(),
      db.collection('subscriptions').get()
    ]);

    const stats = {
      totalEmployees: employeesSnapshot.size,
      totalUsers: usersSnapshot.size,
      totalSubscriptions: subscriptionsSnapshot.size,
      activeSubscriptions: 0,
      revenue: 0
    };

    subscriptionsSnapshot.forEach(doc => {
      const sub = doc.data();
      if (sub.status === 'active') {
        stats.activeSubscriptions++;
        stats.revenue += sub.amount || 0;
      }
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

/**
 * Update employee (Admin only)
 * PUT /admin/employees/:uid
 */
export async function updateEmployee(req, res) {
  try {
    const { uid } = req.params;
    const { displayName, phoneNumber, isActive, photoURL } = req.body;

    const employeeDoc = await db.collection('users').doc(uid).get();
    
    if (!employeeDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    const employeeData = employeeDoc.data();
    if (employeeData.role !== 'employee') {
      return res.status(400).json({ 
        success: false, 
        message: 'User is not an employee' 
      });
    }

    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (displayName !== undefined) updateData.displayName = displayName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (photoURL !== undefined) updateData.photoURL = photoURL;

    await db.collection('users').doc(uid).update(updateData);

    // Get updated document
    const updatedDoc = await db.collection('users').doc(uid).get();

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: {
        uid: updatedDoc.id,
        ...updatedDoc.data()
      }
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}

/**
 * Helper function to delete employee payments and subscriptions
 */
async function deleteEmployeeRelatedData(employeeEmail, employeeUid) {
  const results = {
    paymentsDeleted: 0,
    subscriptionsDeleted: 0,
    errors: []
  };

  // Find and delete associated employee payments
  try {
    // Find payments by email
    const paymentsSnapshot = await db
      .collection('employeePayments')
      .where('email', '==', employeeEmail)
      .get();

    // Also find payments by createdEmployeeUid (if employee was created from payment)
    const paymentsByUidSnapshot = await db
      .collection('employeePayments')
      .where('createdEmployeeUid', '==', employeeUid)
      .get();

    const batch = db.batch();
    paymentsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    paymentsByUidSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    results.paymentsDeleted = paymentsSnapshot.size + paymentsByUidSnapshot.size;
    console.log(`✅ Deleted ${results.paymentsDeleted} payment record(s) for employee ${employeeUid}`);
  } catch (paymentError) {
    console.error('⚠️ Error deleting employee payments:', paymentError);
    results.errors.push({ type: 'payments', error: paymentError.message });
  }

  // Find and delete associated subscriptions
  try {
    const subscriptionsSnapshot = await db
      .collection('subscriptions')
      .where('employeeEmail', '==', employeeEmail)
      .get();

    const batch = db.batch();
    subscriptionsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    results.subscriptionsDeleted = subscriptionsSnapshot.size;
    console.log(`✅ Deleted ${results.subscriptionsDeleted} subscription(s) for employee ${employeeUid}`);
  } catch (subscriptionError) {
    console.error('⚠️ Error deleting subscriptions:', subscriptionError);
    results.errors.push({ type: 'subscriptions', error: subscriptionError.message });
  }

  return results;
}

/**
 * Delete employee (Admin only)
 * DELETE /admin/employees/:uid
 */
export async function deleteEmployee(req, res) {
  try {
    const { uid } = req.params;

    const employeeDoc = await db.collection('users').doc(uid).get();
    
    if (!employeeDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    const employeeData = employeeDoc.data();
    if (employeeData.role !== 'employee') {
      return res.status(400).json({ 
        success: false, 
        message: 'User is not an employee' 
      });
    }

    const employeeEmail = employeeData.email;

    // Delete associated payments and subscriptions
    await deleteEmployeeRelatedData(employeeEmail, uid);

    // Delete from Firebase Auth
    await auth.deleteUser(uid);

    // Delete from Firestore
    await db.collection('users').doc(uid).delete();

    res.json({
      success: true,
      message: 'Employee, payment records, and subscriptions deleted successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    
    if (error.code === 'auth/user-not-found') {
      // User already deleted from Auth, just delete from Firestore and related data
      try {
        const employeeDoc = await db.collection('users').doc(req.params.uid).get();
        if (employeeDoc.exists) {
          const employeeData = employeeDoc.data();
          if (employeeData.email) {
            await deleteEmployeeRelatedData(employeeData.email, req.params.uid);
          }
        }
        await db.collection('users').doc(req.params.uid).delete();
        return res.json({
          success: true,
          message: 'Employee, payment records, and subscriptions deleted successfully'
        });
      } catch (firestoreError) {
        return res.status(500).json({ 
          success: false, 
          message: 'Error deleting employee' 
        });
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}

/**
 * Clean up old employee payments - Delete payments for employees older than the last 2
 * POST /admin/cleanup-old-payments
 */
export async function cleanupOldEmployeePayments(req, res) {
  try {
    // Get all employees
    const employeesSnapshot = await db
      .collection('users')
      .where('role', '==', 'employee')
      .get();

    if (employeesSnapshot.empty) {
      return res.json({
        success: true,
        message: 'No employees found',
        data: {
          employeesKept: 0,
          paymentsDeleted: 0,
          subscriptionsDeleted: 0
        }
      });
    }

    const allEmployees = [];
    employeesSnapshot.forEach(doc => {
      const data = doc.data();
      const createdAt = data.createdAt;
      let timestamp = null;

      // Convert Firestore timestamp to milliseconds for sorting
      if (createdAt && typeof createdAt.toDate === 'function') {
        timestamp = createdAt.toDate().getTime();
      } else if (createdAt && createdAt.seconds) {
        timestamp = createdAt.seconds * 1000;
      } else if (createdAt && createdAt._seconds) {
        timestamp = createdAt._seconds * 1000;
      } else if (createdAt instanceof Date) {
        timestamp = createdAt.getTime();
      } else {
        timestamp = 0; // Fallback for employees without createdAt
      }

      allEmployees.push({
        uid: doc.id,
        email: data.email,
        createdAt: timestamp
      });
    });

    // Sort by creation date (newest first)
    allEmployees.sort((a, b) => b.createdAt - a.createdAt);

    // Keep only the last 2 employees (most recent)
    const employeesToKeep = allEmployees.slice(0, 2);
    const employeesToCleanup = allEmployees.slice(2); // All employees except the last 2

    if (employeesToCleanup.length === 0) {
      return res.json({
        success: true,
        message: 'No old employees to cleanup (less than 2 employees)',
        data: {
          employeesKept: employeesToKeep.length,
          paymentsDeleted: 0,
          subscriptionsDeleted: 0
        }
      });
    }

    let paymentsDeleted = 0;
    let subscriptionsDeleted = 0;

    // Delete payments and subscriptions for old employees
    for (const employee of employeesToCleanup) {
      if (!employee.email) continue;

      // Delete employee payments
      try {
        const paymentsSnapshot = await db
          .collection('employeePayments')
          .where('email', '==', employee.email)
          .get();

        const batch = db.batch();
        paymentsSnapshot.forEach(doc => {
          batch.delete(doc.ref);
          paymentsDeleted++;
        });

        // Also check by UID
        const paymentsByUidSnapshot = await db
          .collection('employeePayments')
          .where('createdEmployeeUid', '==', employee.uid)
          .get();

        paymentsByUidSnapshot.forEach(doc => {
          batch.delete(doc.ref);
          paymentsDeleted++;
        });

        await batch.commit();
      } catch (error) {
        console.error(`Error deleting payments for ${employee.email}:`, error);
      }

      // Delete subscriptions
      try {
        const subscriptionsSnapshot = await db
          .collection('subscriptions')
          .where('employeeEmail', '==', employee.email)
          .get();

        const batch = db.batch();
        subscriptionsSnapshot.forEach(doc => {
          batch.delete(doc.ref);
          subscriptionsDeleted++;
        });

        await batch.commit();
      } catch (error) {
        console.error(`Error deleting subscriptions for ${employee.email}:`, error);
      }
    }

    res.json({
      success: true,
      message: `Cleaned up payments for ${employeesToCleanup.length} old employees`,
      data: {
        employeesKept: employeesToKeep.length,
        employeesCleaned: employeesToCleanup.length,
        paymentsDeleted,
        subscriptionsDeleted
      }
    });
  } catch (error) {
    console.error('Cleanup old payments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}

/**
 * Update employee status (Admin only) - Deprecated, use updateEmployee instead
 */
export async function updateEmployeeStatus(req, res) {
  try {
    const { employeeId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        message: 'isActive must be a boolean' 
      });
    }

    const employeeDoc = await db.collection('users').doc(employeeId).get();
    if (!employeeDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    const employeeData = employeeDoc.data();
    if (employeeData.role !== 'employee') {
      return res.status(400).json({ 
        success: false, 
        message: 'User is not an employee' 
      });
    }

    await db.collection('users').doc(employeeId).update({
      isActive,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message: `Employee ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Update employee status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

/**
 * POST /admin/sendEmployeeAccount
 * Logs email + password so admin can send credentials manually
 */
export async function sendEmployeeAccountCredentials(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and temporary password are required.'
      });
    }

    console.log('✅ Employee account credentials ready to send:');
    console.log(`   Email: ${email}`);
    console.log(`   Temp Password: ${password}`);
    console.log('   Login URL: http://localhost:5173/login');

    return res.json({
      success: true,
      message: 'Employee account credentials logged successfully.'
    });
  } catch (error) {
    console.error('sendEmployeeAccountCredentials error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to log credentials.'
    });
  }
}

/**
 * Reset employee password (Admin only)
 * POST /admin/reset-employee-password
 */
export async function resetEmployeePassword(req, res) {
  try {
    const { uid, email, name, newPassword } = req.body;

    if (!uid || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'UID and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Verify employee exists
    const employeeDoc = await db.collection('users').doc(uid).get();
    if (!employeeDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const employeeData = employeeDoc.data();
    if (employeeData.role !== 'employee') {
      return res.status(400).json({
        success: false,
        message: 'User is not an employee'
      });
    }

    // Update password in Firebase Auth
    await auth.updateUser(uid, {
      password: newPassword
    });

    // Update timestamp in Firestore
    await db.collection('users').doc(uid).update({
      passwordResetAt: admin.firestore.FieldValue.serverTimestamp(),
      passwordResetBy: req.user.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send email notification to employee
    try {
      await sendPasswordResetNotification(
        email || employeeData.email,
        name || employeeData.displayName || 'Employee',
        newPassword
      );
      console.log(`✅ Password reset email sent to ${email || employeeData.email}`);
    } catch (emailError) {
      console.error('⚠️ Failed to send password reset email:', emailError);
      // Don't fail the whole operation if email fails
    }

    res.json({
      success: true,
      message: 'Password reset successfully and email sent to employee'
    });
  } catch (error) {
    console.error('Reset employee password error:', error);

    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({
        success: false,
        message: 'Employee not found in authentication system'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}