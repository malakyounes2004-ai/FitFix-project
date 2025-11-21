import admin, { db } from '../firebase.js';
import { sendSubscriptionConfirmation } from '../utils/emailService.js';

const FieldValue = admin.firestore.FieldValue;

const PLAN_MAP = {
  monthly: { label: 'Monthly Plan', amount: 200 },
  twoMonth: { label: '2 Month Plan', amount: 390 },
  threeMonth: { label: '3 Month Plan', amount: 599 },
  yearly: { label: 'Yearly Plan', amount: 2300 }
};

export const submitEmployeePayment = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      address,
      country,
      city,
      gender,
      dateOfBirth,
      notes,
      selectedPlan
    } = req.body;

    if (!fullName || !email || !phoneNumber || !address || !country || !city || !gender || !dateOfBirth) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
    }

    if (!selectedPlan || !PLAN_MAP[selectedPlan]) {
      return res.status(400).json({ success: false, message: 'Invalid subscription plan.' });
    }

    const planInfo = PLAN_MAP[selectedPlan];

    // Calculate expiration date based on plan
    const now = new Date();
    let expirationDate = new Date();
    
    switch (selectedPlan) {
      case 'monthly':
        expirationDate.setMonth(now.getMonth() + 1);
        break;
      case 'twoMonth':
        expirationDate.setMonth(now.getMonth() + 2);
        break;
      case 'threeMonth':
        expirationDate.setMonth(now.getMonth() + 3);
        break;
      case 'yearly':
        expirationDate.setFullYear(now.getFullYear() + 1);
        break;
      default:
        expirationDate.setMonth(now.getMonth() + 1);
    }

    const paymentRef = db.collection('employeePayments').doc();
    const payload = {
      id: paymentRef.id,
      name: fullName,
      email: email.toLowerCase(),
      phoneNumber,
      address,
      country,
      city,
      gender,
      dateOfBirth,
      notes: notes || null,
      selectedPlan: planInfo.label,
      selectedPlanKey: selectedPlan,
      amount: planInfo.amount,
      paid: true,
      timestamp: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      accountCreated: false
    };

    await paymentRef.set(payload);

    // Create subscription document
    const subscriptionRef = db.collection('subscriptions').doc();
    const paymentDate = admin.firestore.Timestamp.now();
    const subscriptionData = {
      id: subscriptionRef.id,
      employeePaymentId: paymentRef.id,
      employeeEmail: email.toLowerCase(),
      employeeName: fullName,
      planType: selectedPlan,
      planLabel: planInfo.label,
      amount: planInfo.amount,
      paymentDate: paymentDate, // Date when employee paid
      startDate: FieldValue.serverTimestamp(),
      expirationDate: admin.firestore.Timestamp.fromDate(expirationDate),
      status: 'active',
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      reminderSent: false,
      expirationEmailSent: false
    };

    await subscriptionRef.set(subscriptionData);

    // Send subscription confirmation email
    try {
      await sendSubscriptionConfirmation(
        email.toLowerCase(),
        fullName,
        planInfo.label,
        planInfo.amount,
        expirationDate
      );
      console.log(`✅ Subscription confirmation email sent to ${email}`);
    } catch (emailError) {
      console.error('⚠️ Failed to send subscription confirmation email:', emailError);
      // Don't fail the whole operation if email fails
    }

    return res.status(201).json({
      success: true,
      message: 'Payment recorded successfully and subscription created',
      data: {
        payment: payload,
        subscription: subscriptionData
      }
    });
  } catch (error) {
    console.error('Employee payment submission error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record payment.' });
  }
};

export const getAllEmployeePayments = async (req, res) => {
  try {
    const snapshot = await db.collection('employeePayments').orderBy('createdAt', 'desc').get();
    
    const payments = [];
    snapshot.forEach(doc => {
      payments.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return res.status(200).json({
      success: true,
      data: payments,
      count: payments.length
    });
  } catch (error) {
    console.error('Get employee payments error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch employee payments.' });
  }
};

export const deleteEmployeePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({ success: false, message: 'Payment ID is required' });
    }

    const paymentRef = db.collection('employeePayments').doc(paymentId);
    const paymentSnap = await paymentRef.get();

    if (!paymentSnap.exists) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const paymentData = paymentSnap.data();

    // Delete the payment
    await paymentRef.delete();

    // Also delete related subscription if exists
    try {
      const subscriptionsSnapshot = await db
        .collection('subscriptions')
        .where('employeePaymentId', '==', paymentId)
        .get();
      
      const batch = db.batch();
      subscriptionsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`✅ Deleted ${subscriptionsSnapshot.size} related subscription(s)`);
    } catch (error) {
      console.error('Error deleting related subscriptions:', error);
      // Continue even if subscription deletion fails
    }

    return res.json({
      success: true,
      message: 'Employee payment deleted successfully'
    });
  } catch (error) {
    console.error('Delete employee payment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete employee payment' });
  }
};

