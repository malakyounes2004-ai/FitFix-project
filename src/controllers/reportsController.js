// src/controllers/reportsController.js
import { db } from '../firebase.js';
import { sendEmployeeReport } from '../utils/emailService.js';

/**
 * Get reports overview with statistics and chart data
 * GET /api/admin/reports/overview
 */
export async function getReportsOverview(req, res) {
  try {
    // Get all employees
    const employeesSnapshot = await db
      .collection('users')
      .where('role', '==', 'employee')
      .get();

    // Get all subscriptions
    const subscriptionsSnapshot = await db
      .collection('subscriptions')
      .get();

    // Get all payments
    const paymentsSnapshot = await db
      .collection('payments')
      .get();

    // Get employee payments
    const employeePaymentsSnapshot = await db
      .collection('employeePayments')
      .where('paid', '==', true)
      .get();

    // Calculate statistics
    const stats = {
      totalEmployees: employeesSnapshot.size,
      activeSubscriptions: 0,
      expiredSubscriptions: 0,
      totalPayments: 0,
      monthlyRevenue: [],
      subscriptionPlans: {},
      expiringSoon: 0
    };

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Process subscriptions
    subscriptionsSnapshot.forEach(doc => {
      const sub = doc.data();
      const amount = sub.amount || 0;
      
      stats.totalPayments += amount;

      // Determine subscription status
      const isActive = sub.status === 'active' && sub.isActive !== false;
      const expirationDate = sub.expirationDate 
        ? (sub.expirationDate.toDate ? sub.expirationDate.toDate() : new Date(sub.expirationDate))
        : null;
      
      if (isActive && expirationDate && expirationDate > now) {
        stats.activeSubscriptions++;
        
        // Check if expiring soon
        if (expirationDate <= sevenDaysFromNow) {
          stats.expiringSoon++;
        }

        // Track subscription plans with proper formatting
        // Priority: planLabel (already formatted) > planType (needs mapping) > selectedPlan > planName
        let planName = 'Unknown';
        
        if (sub.planLabel) {
          // planLabel is already formatted (e.g., "2 Month Plan", "3 Month Plan", "Yearly Plan")
          planName = sub.planLabel;
        } else if (sub.planType) {
          // Map planType keys to formatted names
          const planTypeConfig = {
            'monthly': '1 Month Plan',
            'twoMonth': '2 Months Plan',
            'threeMonth': '3 Months Plan',
            'yearly': 'Yearly (12 Months)',
            '1month': '1 Month Plan',
            '2months': '2 Months Plan',
            '3months': '3 Months Plan',
            '12months': 'Yearly (12 Months)'
          };
          planName = planTypeConfig[sub.planType] || sub.planType;
        } else if (sub.selectedPlan) {
          // Map selectedPlan keys to formatted names
          const selectedPlanConfig = {
            'monthly': '1 Month Plan',
            'twoMonth': '2 Months Plan',
            'threeMonth': '3 Months Plan',
            'yearly': 'Yearly (12 Months)',
            '1month': '1 Month Plan',
            '2months': '2 Months Plan',
            '3months': '3 Months Plan',
            '12months': 'Yearly (12 Months)'
          };
          planName = selectedPlanConfig[sub.selectedPlan] || sub.selectedPlan;
        } else if (sub.planName) {
          planName = sub.planName;
        }
        
        // Normalize plan names to ensure consistency
        // Standardize to: "1 Month Plan", "2 Months Plan", "3 Months Plan", "Yearly (12 Months)"
        let normalizedPlanName = planName.trim();
        
        // Handle "Monthly Plan" -> "1 Month Plan"
        if (/^Monthly\s+Plan$/i.test(normalizedPlanName)) {
          normalizedPlanName = '1 Month Plan';
        }
        // Handle "1 Month Plan" or "1 Months Plan" -> "1 Month Plan"
        else if (/^1\s+Months?\s+Plan$/i.test(normalizedPlanName)) {
          normalizedPlanName = '1 Month Plan';
        }
        // Handle "2 Month Plan" or "2 Months Plan" -> "2 Months Plan"
        else if (/^2\s+Months?\s+Plan$/i.test(normalizedPlanName)) {
          normalizedPlanName = '2 Months Plan';
        }
        // Handle "3 Month Plan" or "3 Months Plan" -> "3 Months Plan"
        else if (/^3\s+Months?\s+Plan$/i.test(normalizedPlanName)) {
          normalizedPlanName = '3 Months Plan';
        }
        // Handle "Yearly Plan" or "Yearly (12 Months)" -> "Yearly (12 Months)"
        else if (/^Yearly/i.test(normalizedPlanName)) {
          normalizedPlanName = 'Yearly (12 Months)';
        }
        
        stats.subscriptionPlans[normalizedPlanName] = (stats.subscriptionPlans[normalizedPlanName] || 0) + 1;
      } else {
        stats.expiredSubscriptions++;
      }

      // Calculate monthly revenue from subscription payments
      const paymentDate = sub.paymentDate || sub.createdAt;
      if (paymentDate) {
        const date = paymentDate.toDate ? paymentDate.toDate() : new Date(paymentDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!stats.monthlyRevenue.find(m => m.month === monthKey)) {
          stats.monthlyRevenue.push({ month: monthKey, revenue: 0 });
        }
        const monthData = stats.monthlyRevenue.find(m => m.month === monthKey);
        monthData.revenue += amount;
      }
    });

    // Process renewal payments
    paymentsSnapshot.forEach(doc => {
      const payment = doc.data();
      const amount = payment.amount || 0;
      stats.totalPayments += amount;

      const createdAt = payment.createdAt;
      if (createdAt) {
        const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!stats.monthlyRevenue.find(m => m.month === monthKey)) {
          stats.monthlyRevenue.push({ month: monthKey, revenue: 0 });
        }
        const monthData = stats.monthlyRevenue.find(m => m.month === monthKey);
        monthData.revenue += amount;
      }
    });

    // Process employee payments
    employeePaymentsSnapshot.forEach(doc => {
      const payment = doc.data();
      const amount = payment.amount || 0;
      stats.totalPayments += amount;

      const timestamp = payment.timestamp || payment.createdAt;
      if (timestamp) {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!stats.monthlyRevenue.find(m => m.month === monthKey)) {
          stats.monthlyRevenue.push({ month: monthKey, revenue: 0 });
        }
        const monthData = stats.monthlyRevenue.find(m => m.month === monthKey);
        monthData.revenue += amount;
      }
    });

    // Sort monthly revenue by month
    stats.monthlyRevenue.sort((a, b) => a.month.localeCompare(b.month));

    // Get most popular plan
    const mostPopularPlan = Object.entries(stats.subscriptionPlans)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    // Log for debugging
    console.log('📊 Reports Overview - Real Data from Database:');
    console.log('  Total Employees:', stats.totalEmployees);
    console.log('  Active Subscriptions:', stats.activeSubscriptions);
    console.log('  Expired Subscriptions:', stats.expiredSubscriptions);
    console.log('  Total Payments:', stats.totalPayments);
    console.log('  Monthly Revenue Months:', stats.monthlyRevenue.length);
    console.log('  Subscription Plans:', Object.keys(stats.subscriptionPlans).length);
    console.log('  Most Popular Plan:', mostPopularPlan);

    res.json({
      success: true,
      data: {
        ...stats,
        mostPopularPlan
      }
    });
  } catch (error) {
    console.error('Get reports overview error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}

/**
 * Send employee report via email
 * POST /api/admin/reports/send-email
 */
export async function sendEmployeeReportEmail(req, res) {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    // Get employee data
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

    // Get subscription data
    let subscription = null;
    let totalPayments = 0;
    try {
      let subscriptionSnapshot = await db
        .collection('subscriptions')
        .where('employeeId', '==', employeeId)
        .get();

      if (subscriptionSnapshot.empty && employeeData.email) {
        subscriptionSnapshot = await db
          .collection('subscriptions')
          .where('employeeEmail', '==', employeeData.email.toLowerCase())
          .get();
      }

      if (!subscriptionSnapshot.empty) {
        let activeSub = null;
        let latestSub = null;
        let latestDate = null;

        subscriptionSnapshot.forEach(doc => {
          const subData = doc.data();
          const createdAt = subData.createdAt?.toDate?.() || new Date(0);
          
          if (subData.status === 'active' && subData.isActive !== false) {
            if (!activeSub || createdAt > (activeSub.createdAt?.toDate?.() || new Date(0))) {
              activeSub = { id: doc.id, ...subData };
            }
          }
          
          if (!latestSub || createdAt > latestDate) {
            latestSub = { id: doc.id, ...subData };
            latestDate = createdAt;
          }
          
          if (subData.amount) {
            totalPayments += subData.amount;
          }
        });

        const subData = activeSub || latestSub;
        
        if (subData) {
          let planName = 'N/A';
          if (subData.selectedPlan) {
            const planConfig = {
              '1month': '1 Month Plan',
              '2months': '2 Months Plan',
              '3months': '3 Months Plan',
              '12months': 'Yearly (12 Months)'
            };
            planName = planConfig[subData.selectedPlan] || subData.selectedPlan;
          } else if (subData.planName) {
            planName = subData.planName;
          } else if (subData.planType) {
            planName = subData.planType;
          }

          subscription = {
            planName: planName,
            duration: subData.duration || subData.days || null,
            startDate: subData.startDate?.toDate?.()?.toISOString() || subData.startDate || null,
            expirationDate: subData.expirationDate?.toDate?.()?.toISOString() || subData.expirationDate || null,
            status: subData.status || (subData.isActive === false ? 'expired' : 'active'),
            totalPayments: totalPayments || subData.amount || 0
          };
        }
      }
    } catch (subError) {
      console.error('Error fetching subscription:', subError);
    }

    // Get payment history
    const paymentHistory = [];
    try {
      // 1. Get from employeePayments collection (initial employee payments)
      // These are payments made when employees sign up for subscriptions
      let employeePaymentsSnapshot = null;
      if (employeeData.email) {
        employeePaymentsSnapshot = await db
          .collection('employeePayments')
          .where('email', '==', employeeData.email.toLowerCase())
          .where('paid', '==', true)
          .get();
      } else {
        employeePaymentsSnapshot = { forEach: () => {}, size: 0 }; // Empty snapshot
      }

      employeePaymentsSnapshot.forEach(doc => {
        const payment = doc.data();
        paymentHistory.push({
          date: payment.timestamp?.toDate?.()?.toISOString() || payment.createdAt?.toDate?.()?.toISOString() || payment.createdAt || null,
          amount: payment.amount || 0,
          status: 'completed',
          type: 'Initial Subscription Payment'
        });
      });

      // 2. Get from payments collection (renewal payments)
      // These are subscription renewal payments
      const paymentsSnapshot = await db
        .collection('payments')
        .where('employeeId', '==', employeeId)
        .orderBy('createdAt', 'desc')
        .get();

      paymentsSnapshot.forEach(doc => {
        const payment = doc.data();
        paymentHistory.push({
          date: payment.createdAt?.toDate?.()?.toISOString() || payment.createdAt || null,
          amount: payment.amount || 0,
          status: payment.status || 'completed',
          type: 'Renewal Payment'
        });
      });

      // 3. Get from subscriptions (subscription records with payment info)
      // This ensures we capture all subscription-related payments
      let subscriptionsSnapshot = await db
        .collection('subscriptions')
        .where('employeeId', '==', employeeId)
        .get();

      if (subscriptionsSnapshot.empty && employeeData.email) {
        subscriptionsSnapshot = await db
          .collection('subscriptions')
          .where('employeeEmail', '==', employeeData.email.toLowerCase())
          .get();
      }

      subscriptionsSnapshot.forEach(doc => {
        const sub = doc.data();
        // Only add if not already added from employeePayments (avoid duplicates)
        const paymentDate = sub.paymentDate?.toDate?.()?.toISOString() || sub.createdAt?.toDate?.()?.toISOString() || sub.createdAt || null;
        const existingPayment = paymentHistory.find(p => 
          p.date === paymentDate && 
          p.amount === (sub.amount || 0) &&
          p.type === 'Initial Subscription Payment'
        );
        
        if (!existingPayment) {
          paymentHistory.push({
            date: paymentDate,
            amount: sub.amount || 0,
            status: 'completed',
            type: 'Subscription Payment'
          });
        }
      });

      // Sort by date descending
      paymentHistory.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });

      console.log(`📊 Payment history for ${employeeData.email}: ${paymentHistory.length} payments found`);
    } catch (paymentError) {
      console.error('Error fetching payment history:', paymentError);
    }

    // Get activity data
    const activity = {
      usersManaged: 0,
      mealPlansCreated: 0,
      workoutPlansCreated: 0,
      lastLogin: null,
      chatMessages: 0,
      totalSessions: 0
    };

    try {
      const usersSnapshot = await db
        .collection('users')
        .where('assignedEmployeeId', '==', employeeId)
        .where('role', '==', 'user')
        .get();
      activity.usersManaged = usersSnapshot.size;

      const mealPlansSnapshot = await db
        .collection('mealPlans')
        .where('assignedBy', '==', employeeId)
        .get();
      
      const usersWithMealPlansSnapshot = await db
        .collection('users')
        .where('assignedEmployeeId', '==', employeeId)
        .where('role', '==', 'user')
        .get();
      
      let mealPlansInUsers = 0;
      usersWithMealPlansSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.mealPlan && userData.mealPlan.assignedBy === employeeId) {
          mealPlansInUsers++;
        }
      });
      
      activity.mealPlansCreated = mealPlansSnapshot.size + mealPlansInUsers;

      const workoutPlansSnapshot = await db
        .collection('workoutPlans')
        .where('assignedBy', '==', employeeId)
        .get();
      activity.workoutPlansCreated = workoutPlansSnapshot.size;

      if (employeeData.lastLogin) {
        activity.lastLogin = employeeData.lastLogin?.toDate?.()?.toISOString() || employeeData.lastLogin;
      }

      const messagesSnapshot = await db
        .collection('messages')
        .where('senderId', '==', employeeId)
        .get();
      activity.chatMessages = messagesSnapshot.size;
    } catch (activityError) {
      console.error('Error fetching activity data:', activityError);
    }

    // Calculate total amount paid
    const totalAmountPaid = paymentHistory.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    // Build report data
    const reportData = {
      displayName: employeeData.displayName,
      email: employeeData.email,
      role: employeeData.role,
      isActive: employeeData.isActive !== false,
      createdAt: employeeData.createdAt?.toDate?.()?.toISOString() || employeeData.createdAt || null,
      phoneNumber: employeeData.phoneNumber || null,
      subscription: subscription,
      activity: activity,
      paymentHistory: paymentHistory,
      totalAmountPaid: totalAmountPaid
    };

    // Send email
    try {
      await sendEmployeeReport(
        employeeData.email,
        employeeData.displayName || employeeData.email,
        reportData
      );

      res.json({
        success: true,
        message: 'Employee report sent successfully via email'
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send email: ' + emailError.message
      });
    }
  } catch (error) {
    console.error('Send employee report email error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}

