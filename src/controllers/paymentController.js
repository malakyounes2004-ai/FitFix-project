import admin, { db } from '../firebase.js';

const FieldValue = admin.firestore.FieldValue;
const PAYMENT_METHODS = ['cash', 'omt', 'whatsapp'];

const serializePayment = (doc) => {
  if (!doc.exists) return null;
  const data = doc.data();
  const createdAt = data.createdAt?.toDate?.()?.toISOString?.() || null;
  const updatedAt = data.updatedAt?.toDate?.()?.toISOString?.() || null;
  return { ...data, createdAt, updatedAt };
};

export const createPayment = async (req, res) => {
  try {
    const { amount, method, employeeId } = req.body;
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }

    if (!method || !PAYMENT_METHODS.includes(method)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method' });
    }

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee ID is required' });
    }

    const employeeDoc = await db.collection('users').doc(employeeId).get();
    if (!employeeDoc.exists || employeeDoc.data().role !== 'employee') {
      return res.status(404).json({ success: false, message: 'Assigned employee not found' });
    }

    const paymentRef = db.collection('payments').doc();
    const paymentData = {
      id: paymentRef.id,
      userId: req.user.uid,
      employeeId,
      amount: numericAmount,
      method,
      status: 'pending',
      approvedByEmployee: false,
      approvedByEmployeeAt: null,
      approvedByEmployeeId: null,
      approvedByAdmin: false,
      approvedByAdminAt: null,
      approvedByAdminId: null,
      rejectionReason: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    await paymentRef.set(paymentData);
    const savedPayment = await paymentRef.get();

    return res.status(201).json({
      success: true,
      message: 'Payment submitted successfully',
      data: serializePayment(savedPayment)
    });
  } catch (error) {
    console.error('Create payment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create payment' });
  }
};

export const employeeApprovePayment = async (req, res) => {
  try {
    const { paymentId, decision = 'approve', rejectionReason = null } = req.body;
    if (!paymentId) {
      return res.status(400).json({ success: false, message: 'Payment ID is required' });
    }

    const paymentRef = db.collection('payments').doc(paymentId);
    const paymentSnap = await paymentRef.get();
    if (!paymentSnap.exists) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const payment = paymentSnap.data();
    if (payment.employeeId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You cannot modify this payment' });
    }

    if (payment.status === 'completed' || payment.status === 'rejected') {
      return res.status(400).json({ success: false, message: `Payment already ${payment.status}` });
    }

    const isRejecting = decision === 'reject';
    const update = {
      approvedByEmployee: !isRejecting,
      approvedByEmployeeAt: FieldValue.serverTimestamp(),
      approvedByEmployeeId: req.user.uid,
      updatedAt: FieldValue.serverTimestamp(),
      rejectionReason: isRejecting ? rejectionReason || 'Rejected by employee' : null,
      status: isRejecting ? 'rejected' : payment.status
    };

    await paymentRef.update(update);

    return res.json({
      success: true,
      message: isRejecting ? 'Payment rejected' : 'Payment approved and awaiting admin verification'
    });
  } catch (error) {
    console.error('Employee approve payment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update payment' });
  }
};

export const adminApprovePayment = async (req, res) => {
  try {
    const { paymentId, decision = 'approve', rejectionReason = null } = req.body;
    if (!paymentId) {
      return res.status(400).json({ success: false, message: 'Payment ID is required' });
    }

    const paymentRef = db.collection('payments').doc(paymentId);
    const paymentSnap = await paymentRef.get();
    if (!paymentSnap.exists) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const payment = paymentSnap.data();
    if (payment.status === 'completed' || payment.status === 'rejected') {
      return res.status(400).json({ success: false, message: `Payment already ${payment.status}` });
    }

    if (!payment.approvedByEmployee) {
      return res.status(400).json({ success: false, message: 'Employee verification required before admin approval' });
    }

    const isRejecting = decision === 'reject';
    const newStatus = isRejecting ? 'rejected' : 'completed';
    const update = {
      status: newStatus,
      approvedByAdmin: !isRejecting,
      approvedByAdminAt: FieldValue.serverTimestamp(),
      approvedByAdminId: req.user.uid,
      rejectionReason: isRejecting ? rejectionReason || 'Rejected by admin' : null,
      updatedAt: FieldValue.serverTimestamp()
    };

    await paymentRef.update(update);

    const transactionRef = db.collection('adminTransactions').doc();
    await transactionRef.set({
      id: transactionRef.id,
      paymentId,
      adminId: req.user.uid,
      adminEmail: req.user.email,
      action: isRejecting ? 'reject' : 'approve',
      amount: payment.amount,
      userId: payment.userId,
      employeeId: payment.employeeId,
      statusAfterAction: newStatus,
      createdAt: FieldValue.serverTimestamp(),
      notes: rejectionReason
    });

    return res.json({
      success: true,
      message: isRejecting ? 'Payment rejected by admin' : 'Payment approved successfully'
    });
  } catch (error) {
    console.error('Admin approve payment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update payment' });
  }
};

export const getUserPayments = async (req, res) => {
  try {
    const { id } = req.params;
    const requester = req.user;

    if (requester.role === 'user' && requester.uid !== id) {
      return res.status(403).json({ success: false, message: 'You can only view your own payments' });
    }

    if (requester.role === 'employee') {
      const userDoc = await db.collection('users').doc(id).get();
      if (!userDoc.exists || userDoc.data().assignedEmployeeId !== requester.uid) {
        return res.status(403).json({ success: false, message: 'Client not assigned to you' });
      }
    }

    const snapshot = await db
      .collection('payments')
      .where('userId', '==', id)
      .orderBy('createdAt', 'desc')
      .get();

    const payments = snapshot.docs.map(doc => serializePayment(doc));

    return res.json({ success: true, data: payments });
  } catch (error) {
    console.error('Get user payments error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
};

export const getEmployeePayments = async (req, res) => {
  try {
    const { id } = req.params;
    const requester = req.user;

    if (!['employee', 'admin'].includes(requester.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (requester.role === 'employee' && requester.uid !== id) {
      return res.status(403).json({ success: false, message: 'You can only view your own payments' });
    }

    const snapshot = await db
      .collection('payments')
      .where('employeeId', '==', id)
      .orderBy('createdAt', 'desc')
      .get();

    const payments = snapshot.docs.map(doc => serializePayment(doc));

    return res.json({ success: true, data: payments });
  } catch (error) {
    console.error('Get employee payments error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const snapshot = await db
      .collection('payments')
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get();

    const payments = snapshot.docs.map(doc => serializePayment(doc));

    return res.json({ success: true, data: payments });
  } catch (error) {
    console.error('Get all payments error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({ success: false, message: 'Payment ID is required' });
    }

    const paymentRef = db.collection('payments').doc(paymentId);
    const paymentSnap = await paymentRef.get();

    if (!paymentSnap.exists) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Delete the payment
    await paymentRef.delete();

    // Also delete related admin transaction if exists
    try {
      const transactionsSnapshot = await db
        .collection('adminTransactions')
        .where('paymentId', '==', paymentId)
        .get();
      
      const batch = db.batch();
      transactionsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (error) {
      console.error('Error deleting related transactions:', error);
      // Continue even if transaction deletion fails
    }

    return res.json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete payment' });
  }
};

