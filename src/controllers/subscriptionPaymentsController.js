// src/controllers/subscriptionPaymentsController.js
import admin, { db } from '../firebase.js';

/**
 * Get all subscription payments (renewals) for Admin
 * GET /api/subscription-payments
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const getAllSubscriptionPayments = async (req, res) => {
  try {
    // Fetch all payments from the payments collection
    // These are subscription renewal payments created by renewSubscription
    const paymentsSnapshot = await db
      .collection('payments')
      .orderBy('createdAt', 'desc')
      .get();

    if (paymentsSnapshot.empty) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Get all unique employee IDs to fetch their details
    const employeeIds = [...new Set(
      paymentsSnapshot.docs
        .map(doc => doc.data().employeeId)
        .filter(id => id)
    )];

    // Fetch employee details in batch
    const employeeMap = new Map();
    if (employeeIds.length > 0) {
      // Firestore 'in' queries are limited to 10 items, so we batch
      const batches = [];
      for (let i = 0; i < employeeIds.length; i += 10) {
        const batch = employeeIds.slice(i, i + 10);
        batches.push(
          db.collection('users')
            .where(admin.firestore.FieldPath.documentId(), 'in', batch)
            .get()
        );
      }

      const employeeSnapshots = await Promise.all(batches);
      employeeSnapshots.forEach(snapshot => {
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          employeeMap.set(doc.id, {
            displayName: data.displayName || data.name || 'Unknown',
            email: data.email || 'N/A'
          });
        });
      });
    }

    // Process and serialize payments
    const payments = paymentsSnapshot.docs.map(doc => {
      const data = doc.data();
      const employeeId = data.employeeId;
      const employee = employeeMap.get(employeeId) || {};

      // Serialize timestamps to ISO strings
      const createdAt = data.createdAt?.toDate?.()?.toISOString() || null;
      const updatedAt = data.updatedAt?.toDate?.()?.toISOString() || null;

      return {
        id: doc.id,
        employeeId: employeeId || null,
        // Use stored values first, fallback to fetched employee data
        employeeName: data.employeeName || employee.displayName || 'Unknown',
        employeeEmail: data.employeeEmail || employee.email || 'N/A',
        amount: data.amount || 0,
        planLabel: data.planLabel || 'N/A',
        renewed: data.renewed === true,
        status: data.status || 'completed',
        createdAt,
        updatedAt
      };
    });

    return res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Get all subscription payments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription payments'
    });
  }
};

/**
 * Get subscription payment stats for Admin dashboard
 * GET /api/subscription-payments/stats
 */
export const getSubscriptionPaymentStats = async (req, res) => {
  try {
    const paymentsSnapshot = await db.collection('payments').get();
    
    let totalRevenue = 0;
    let renewalCount = 0;
    let thisMonthRevenue = 0;
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    paymentsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const amount = data.amount || 0;
      totalRevenue += amount;
      
      if (data.renewed === true) {
        renewalCount++;
      }

      // Check if payment is from this month
      const createdAt = data.createdAt?.toDate?.();
      if (createdAt && createdAt >= startOfMonth) {
        thisMonthRevenue += amount;
      }
    });

    return res.json({
      success: true,
      data: {
        totalPayments: paymentsSnapshot.size,
        totalRevenue,
        renewalCount,
        thisMonthRevenue
      }
    });
  } catch (error) {
    console.error('Get subscription payment stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payment stats'
    });
  }
};

