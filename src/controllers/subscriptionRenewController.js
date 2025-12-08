// src/controllers/subscriptionRenewController.js
import admin, { db } from '../firebase.js';

const FieldValue = admin.firestore.FieldValue;

// Plan configurations
const PLAN_CONFIG = {
  '1month': {
    days: 30,
    label: '1 Month Plan',
    amount: 200
  },
  '2months': {
    days: 60,
    label: '2 Months Plan',
    amount: 399
  },
  '3months': {
    days: 90,
    label: '3 Months Plan',
    amount: 599
  },
  '12months': {
    days: 365,
    label: 'Yearly (12 Months)',
    amount: 2300
  }
};

/**
 * Get current employee subscription
 * GET /api/subscriptions/employee/:employeeId
 */
export const getEmployeeSubscription = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    if (!employeeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee ID is required' 
      });
    }

    // Verify the requesting user is the employee or an admin
    if (req.user.uid !== employeeId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only view your own subscription' 
      });
    }

    // Get employee email for searching
    const employeeEmail = req.user.email?.toLowerCase();

    // First try to find subscription by employeeId
    let subscriptionSnapshot = await db
      .collection('subscriptions')
      .where('employeeId', '==', employeeId)
      .limit(1)
      .get();

    // If not found by employeeId, try by employeeEmail
    if (subscriptionSnapshot.empty && employeeEmail) {
      subscriptionSnapshot = await db
        .collection('subscriptions')
        .where('employeeEmail', '==', employeeEmail)
        .limit(1)
        .get();
      
      // If found by email, update the subscription to include employeeId for future lookups
      if (!subscriptionSnapshot.empty) {
        const docRef = subscriptionSnapshot.docs[0].ref;
        await docRef.update({
          employeeId: employeeId,
          updatedAt: FieldValue.serverTimestamp()
        });
      }
    }

    if (subscriptionSnapshot.empty) {
      return res.status(404).json({ 
        success: false, 
        message: 'No subscription found for this employee' 
      });
    }

    const subscriptionDoc = subscriptionSnapshot.docs[0];
    const subscriptionData = subscriptionDoc.data();

    // Serialize dates
    const subscription = {
      id: subscriptionDoc.id,
      ...subscriptionData,
      employeeId: employeeId, // Ensure employeeId is in response
      expirationDate: subscriptionData.expirationDate?.toDate?.()?.toISOString() || null,
      startDate: subscriptionData.startDate?.toDate?.()?.toISOString() || null,
      paymentDate: subscriptionData.paymentDate?.toDate?.()?.toISOString() || null,
      createdAt: subscriptionData.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: subscriptionData.updatedAt?.toDate?.()?.toISOString() || null
    };

    return res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Get employee subscription error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch subscription' 
    });
  }
};

/**
 * Renew employee subscription
 * POST /api/subscriptions/renew
 */
export const renewSubscription = async (req, res) => {
  try {
    const { employeeId, plan } = req.body;

    // Validate required fields
    if (!employeeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee ID is required' 
      });
    }

    if (!plan || !PLAN_CONFIG[plan]) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid plan. Must be one of: 1month, 3months, 12months' 
      });
    }

    // Verify the requesting user is the employee or an admin
    if (req.user.uid !== employeeId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only renew your own subscription' 
      });
    }

    const planConfig = PLAN_CONFIG[plan];

    // Get employee email for searching
    const employeeEmail = req.user.email?.toLowerCase();

    // First try to find subscription by employeeId
    let subscriptionSnapshot = await db
      .collection('subscriptions')
      .where('employeeId', '==', employeeId)
      .limit(1)
      .get();

    // If not found by employeeId, try by employeeEmail
    if (subscriptionSnapshot.empty && employeeEmail) {
      subscriptionSnapshot = await db
        .collection('subscriptions')
        .where('employeeEmail', '==', employeeEmail)
        .limit(1)
        .get();
    }

    if (subscriptionSnapshot.empty) {
      return res.status(404).json({ 
        success: false, 
        message: 'No subscription found for this employee' 
      });
    }

    const subscriptionDoc = subscriptionSnapshot.docs[0];
    const subscriptionData = subscriptionDoc.data();
    const subscriptionRef = db.collection('subscriptions').doc(subscriptionDoc.id);

    // Calculate new expiration date
    let newExpirationDate;
    const now = new Date();

    if (subscriptionData.isActive && subscriptionData.status === 'active') {
      // Subscription is ACTIVE: extend from current expiration date
      const currentExpiration = subscriptionData.expirationDate?.toDate?.() || now;
      // If current expiration is in the past, start from now
      const baseDate = currentExpiration > now ? currentExpiration : now;
      newExpirationDate = new Date(baseDate);
      newExpirationDate.setDate(newExpirationDate.getDate() + planConfig.days);
    } else {
      // Subscription is EXPIRED: start from now
      newExpirationDate = new Date(now);
      newExpirationDate.setDate(newExpirationDate.getDate() + planConfig.days);
    }

    // Update subscription (also add employeeId if missing)
    const subscriptionUpdate = {
      employeeId: employeeId,
      planLabel: planConfig.label,
      expirationDate: admin.firestore.Timestamp.fromDate(newExpirationDate),
      isActive: true,
      status: 'active',
      reminderSent: false,
      expirationEmailSent: false,
      updatedAt: FieldValue.serverTimestamp()
    };

    await subscriptionRef.update(subscriptionUpdate);

    // Fetch employee details for the payment record
    const employeeDoc = await db.collection('users').doc(employeeId).get();
    const employeeData = employeeDoc.exists ? employeeDoc.data() : {};
    const employeeName = employeeData.displayName || employeeData.name || 'Unknown';
    const employeeEmailFromDoc = employeeData.email || employeeEmail || 'N/A';

    // Create payment record for the renewal with employee details
    const paymentRef = db.collection('payments').doc();
    const paymentData = {
      id: paymentRef.id,
      employeeId,
      employeeName,
      employeeEmail: employeeEmailFromDoc,
      planLabel: planConfig.label,
      amount: planConfig.amount,
      renewed: true,
      status: 'completed',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    await paymentRef.set(paymentData);

    // Re-activate employee account if it was deactivated
    if (employeeDoc.exists) {
      if (employeeData.subscriptionExpired === true || employeeData.isActive === false) {
        await db.collection('users').doc(employeeId).update({
          isActive: true,
          subscriptionExpired: false,
          updatedAt: FieldValue.serverTimestamp()
        });
      }
    }

    // Fetch updated subscription
    const updatedSubscriptionDoc = await subscriptionRef.get();
    const updatedSubscriptionData = updatedSubscriptionDoc.data();

    const updatedSubscription = {
      id: updatedSubscriptionDoc.id,
      ...updatedSubscriptionData,
      expirationDate: updatedSubscriptionData.expirationDate?.toDate?.()?.toISOString() || null,
      createdAt: updatedSubscriptionData.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: updatedSubscriptionData.updatedAt?.toDate?.()?.toISOString() || null
    };

    return res.json({
      success: true,
      message: 'Subscription renewed successfully',
      data: {
        subscription: updatedSubscription,
        payment: {
          ...paymentData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Renew subscription error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to renew subscription' 
    });
  }
};

/**
 * Get available plans for renewal
 * GET /api/subscriptions/plans
 */
export const getAvailablePlans = async (req, res) => {
  try {
    const plans = Object.entries(PLAN_CONFIG).map(([key, config]) => ({
      id: key,
      duration: config.label,
      days: config.days,
      price: config.amount
    }));

    return res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Get available plans error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch plans' 
    });
  }
};

