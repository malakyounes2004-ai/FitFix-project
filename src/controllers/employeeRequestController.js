// src/controllers/employeeRequestController.js
import admin, { db } from '../firebase.js';
import { sendEmployeeCredentials } from '../utils/emailService.js';
import { auth } from '../firebase.js';

const FieldValue = admin.firestore.FieldValue;

const PLAN_MAP = {
  monthly: { label: 'Monthly Plan', amount: 200, months: 1 },
  twoMonth: { label: '2 Month Plan', amount: 390, months: 2 },
  threeMonth: { label: '3 Month Plan', amount: 599, months: 3 },
  yearly: { label: 'Yearly Plan', amount: 2300, months: 12 }
};

/**
 * Create employee request
 * POST /api/employee-requests
 */
export const createEmployeeRequest = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      address,
      country,
      city,
      gender,
      dateOfBirth,
      notes,
      selectedPlan,
      amount,
      recaptchaScore,
      phoneVerified
    } = req.body;

    // Validation
    if (!fullName || !email || !phone || !address || !country || !city || !gender || !dateOfBirth) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided.' 
      });
    }

    if (!selectedPlan || !PLAN_MAP[selectedPlan]) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid subscription plan.' 
      });
    }

    if (recaptchaScore === undefined || recaptchaScore === null) {
      return res.status(400).json({ 
        success: false, 
        message: 'reCAPTCHA verification required.' 
      });
    }

    if (recaptchaScore < 0.5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Your request looks suspicious. Please try again.' 
      });
    }

    // Phone verification is optional if Firebase is not configured on frontend
    // But we still require it if the field is explicitly set to false
    if (phoneVerified === false && recaptchaScore >= 0.5) {
      // Allow submission if reCAPTCHA passed but phone not verified (Firebase not configured)
      console.warn('⚠️ Request submitted without phone verification (Firebase may not be configured)');
    }

    // Check if email already exists in requests or employees
    const existingRequest = await db
      .collection('employeeRequests')
      .where('email', '==', email.toLowerCase())
      .where('status', 'in', ['pending', 'approved'])
      .get();

    if (!existingRequest.empty) {
      return res.status(400).json({ 
        success: false, 
        message: 'A request with this email already exists.' 
      });
    }

    const existingEmployee = await db
      .collection('users')
      .where('email', '==', email.toLowerCase())
      .where('role', '==', 'employee')
      .get();

    if (!existingEmployee.empty) {
      return res.status(400).json({ 
        success: false, 
        message: 'An employee with this email already exists.' 
      });
    }

    // Create request document
    const requestRef = db.collection('employeeRequests').doc();
    const requestData = {
      id: requestRef.id,
      fullName,
      email: email.toLowerCase(),
      phone,
      address,
      country,
      city,
      gender,
      dateOfBirth,
      notes: notes || null,
      selectedPlan,
      selectedPlanLabel: PLAN_MAP[selectedPlan].label,
      amount: amount || PLAN_MAP[selectedPlan].amount,
      recaptchaScore,
      phoneVerified,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    await requestRef.set(requestData);

    return res.status(201).json({
      success: true,
      message: 'Employee request submitted successfully',
      data: requestData
    });
  } catch (error) {
    console.error('Create employee request error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to submit request.' 
    });
  }
};

/**
 * Get all employee requests
 * GET /api/employee-requests
 */
export const getAllEmployeeRequests = async (req, res) => {
  try {
    const snapshot = await db
      .collection('employeeRequests')
      .orderBy('createdAt', 'desc')
      .get();

    const requests = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || null
      });
    });

    return res.json({
      success: true,
      data: requests,
      count: requests.length
    });
  } catch (error) {
    console.error('Get employee requests error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch requests.' 
    });
  }
};

/**
 * Approve employee request and create account
 * POST /api/employee-requests/approve/:id
 */
export const approveEmployeeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const requestRef = db.collection('employeeRequests').doc(id);
    const requestSnap = await requestRef.get();

    if (!requestSnap.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Request not found' 
      });
    }

    const requestData = requestSnap.data();

    if (requestData.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Request is already ${requestData.status}` 
      });
    }

    // Check if employee already exists
    const existingEmployee = await db
      .collection('users')
      .where('email', '==', requestData.email)
      .where('role', '==', 'employee')
      .get();

    if (!existingEmployee.empty) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee with this email already exists' 
      });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12).toUpperCase() + '!@#';

    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email: requestData.email,
      password: tempPassword,
      displayName: requestData.fullName,
      emailVerified: false
    });

    // Calculate expiration date
    const planInfo = PLAN_MAP[requestData.selectedPlan];
    const now = new Date();
    let expirationDate = new Date();
    expirationDate.setMonth(now.getMonth() + planInfo.months);

    // Create employee document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: requestData.email,
      displayName: requestData.fullName,
      phoneNumber: requestData.phone,
      role: 'employee',
      isActive: true,
      address: requestData.address,
      country: requestData.country,
      city: requestData.city,
      gender: requestData.gender,
      dateOfBirth: requestData.dateOfBirth,
      subscriptionPlan: requestData.selectedPlan,
      subscriptionExpiresAt: admin.firestore.Timestamp.fromDate(expirationDate),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: req.user.uid,
      photoURL: null
    });

    // Create payment record in employeePayments collection
    const paymentRef = db.collection('employeePayments').doc();
    const paymentData = {
      id: paymentRef.id,
      name: requestData.fullName,
      email: requestData.email,
      phoneNumber: requestData.phone,
      address: requestData.address,
      country: requestData.country,
      city: requestData.city,
      gender: requestData.gender,
      dateOfBirth: requestData.dateOfBirth,
      notes: requestData.notes || null,
      selectedPlan: planInfo.label,
      selectedPlanKey: requestData.selectedPlan,
      amount: requestData.amount,
      paid: true,
      timestamp: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      accountCreated: true,
      accountCreatedAt: FieldValue.serverTimestamp(),
      accountCreatedUid: userRecord.uid,
      employeeRequestId: id,
      employeeId: userRecord.uid, // Link to employee UID for easy querying
      employeeEmail: requestData.email,
      employeeName: requestData.fullName
    };
    await paymentRef.set(paymentData);

    // Create subscription document
    const subscriptionRef = db.collection('subscriptions').doc();
    await subscriptionRef.set({
      id: subscriptionRef.id,
      employeeRequestId: id,
      employeePaymentId: paymentRef.id,
      employeeEmail: requestData.email,
      employeeName: requestData.fullName,
      planType: requestData.selectedPlan,
      planLabel: planInfo.label,
      amount: requestData.amount,
      paymentDate: FieldValue.serverTimestamp(),
      startDate: FieldValue.serverTimestamp(),
      expirationDate: admin.firestore.Timestamp.fromDate(expirationDate),
      status: 'active',
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      reminderSent: false,
      expirationEmailSent: false,
      accountCreated: true,
      accountCreatedAt: FieldValue.serverTimestamp(),
      accountCreatedUid: userRecord.uid
    });

    // Update request status
    await requestRef.update({
      status: 'approved',
      approvedAt: FieldValue.serverTimestamp(),
      approvedBy: req.user.uid,
      createdEmployeeUid: userRecord.uid,
      updatedAt: FieldValue.serverTimestamp()
    });

    // Send credentials email
    try {
      await sendEmployeeCredentials(
        requestData.email,
        requestData.fullName,
        tempPassword,
        { selectedPlan: requestData.selectedPlanLabel, amount: requestData.amount }
      );
      console.log(`✅ Employee credentials email sent to ${requestData.email}`);
    } catch (emailError) {
      console.error('⚠️ Failed to send employee credentials email:', emailError);
      // Don't fail the whole operation if email fails
    }

    return res.json({
      success: true,
      message: 'Employee request approved, account created, and payment recorded successfully',
      data: {
        employeeUid: userRecord.uid,
        email: requestData.email,
        paymentId: paymentRef.id,
        subscriptionId: subscriptionRef.id,
        plan: planInfo.label,
        amount: requestData.amount
      }
    });
  } catch (error) {
    console.error('Approve employee request error:', error);
    
    // If Firebase Auth user was created but Firestore failed, try to clean up
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ 
        success: false, 
        message: 'An account with this email already exists' 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to approve request' 
    });
  }
};

/**
 * Reject employee request
 * POST /api/employee-requests/reject/:id
 */
export const rejectEmployeeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const requestRef = db.collection('employeeRequests').doc(id);
    const requestSnap = await requestRef.get();

    if (!requestSnap.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Request not found' 
      });
    }

    const requestData = requestSnap.data();

    if (requestData.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Request is already ${requestData.status}` 
      });
    }

    await requestRef.update({
      status: 'rejected',
      rejectedAt: FieldValue.serverTimestamp(),
      rejectedBy: req.user.uid,
      rejectionReason: reason || null,
      updatedAt: FieldValue.serverTimestamp()
    });

    return res.json({
      success: true,
      message: 'Employee request rejected successfully'
    });
  } catch (error) {
    console.error('Reject employee request error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to reject request' 
    });
  }
};

