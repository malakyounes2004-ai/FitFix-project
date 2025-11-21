import admin, { db } from '../firebase.js';
import { sendSubscriptionReminder, sendSubscriptionExpiration } from '../utils/emailService.js';

/**
 * Check subscriptions and send reminder/expiration emails
 * This should be called periodically (e.g., every hour via cron job)
 */
export const checkSubscriptionExpirations = async () => {
  try {
    const now = new Date();
    // Set time to start of day for accurate date comparison
    now.setHours(0, 0, 0, 0);
    
    // Calculate 2 days from now (48 hours)
    const twoDaysFromNow = new Date(now);
    twoDaysFromNow.setDate(now.getDate() + 2);
    twoDaysFromNow.setHours(23, 59, 59, 999); // End of day
    
    // Calculate 1 day from now to avoid sending reminder too early
    const oneDayFromNow = new Date(now);
    oneDayFromNow.setDate(now.getDate() + 1);
    oneDayFromNow.setHours(0, 0, 0, 0);
    
    // Get all active subscriptions
    const subscriptionsSnapshot = await db
      .collection('subscriptions')
      .where('status', '==', 'active')
      .where('isActive', '==', true)
      .get();

    const results = {
      remindersSent: 0,
      expirationsSent: 0,
      errors: []
    };

    for (const doc of subscriptionsSnapshot.docs) {
      const subscription = doc.data();
      
      if (!subscription.expirationDate) {
        continue;
      }

      const expirationDate = subscription.expirationDate.toDate();
      // Set expiration date to start of day for comparison
      const expirationDateStart = new Date(expirationDate);
      expirationDateStart.setHours(0, 0, 0, 0);
      
      const subscriptionId = doc.id;

      try {
        // Check if subscription expires in approximately 2 days (send reminder)
        // Send reminder if expiration is between 1.5 and 2.5 days from now
        // This prevents multiple reminders while ensuring it's sent close to 2 days before
        const daysUntilExpiration = Math.floor((expirationDateStart - now) / (1000 * 60 * 60 * 24));
        
        if (
          !subscription.reminderSent &&
          daysUntilExpiration >= 1 &&
          daysUntilExpiration <= 2 &&
          expirationDateStart > now
        ) {
          await sendSubscriptionReminder(
            subscription.employeeEmail,
            subscription.employeeName,
            subscription.planLabel,
            expirationDate
          );

          // Mark reminder as sent
          await db.collection('subscriptions').doc(subscriptionId).update({
            reminderSent: true,
            reminderSentAt: admin.firestore.FieldValue.serverTimestamp()
          });

          results.remindersSent++;
          console.log(`✅ Reminder sent for subscription ${subscriptionId}`);
        }

        // Check if subscription has expired (send expiration email)
        // Compare dates without time to check if expiration date has passed
        if (
          !subscription.expirationEmailSent &&
          expirationDateStart <= now
        ) {
          await sendSubscriptionExpiration(
            subscription.employeeEmail,
            subscription.employeeName,
            subscription.planLabel,
            expirationDate
          );

          // Mark subscription as expired
          await db.collection('subscriptions').doc(subscriptionId).update({
            status: 'expired',
            isActive: false,
            expirationEmailSent: true,
            expiredAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // Deactivate employee account if exists
          const employeesSnapshot = await db
            .collection('users')
            .where('email', '==', subscription.employeeEmail)
            .where('role', '==', 'employee')
            .get();

          for (const empDoc of employeesSnapshot.docs) {
            await db.collection('users').doc(empDoc.id).update({
              isActive: false,
              subscriptionExpired: true,
              subscriptionExpiredAt: admin.firestore.FieldValue.serverTimestamp()
            });
          }

          results.expirationsSent++;
          console.log(`✅ Expiration email sent for subscription ${subscriptionId}`);
        }
      } catch (error) {
        console.error(`❌ Error processing subscription ${subscriptionId}:`, error);
        results.errors.push({
          subscriptionId,
          error: error.message
        });
      }
    }

    return results;
  } catch (error) {
    console.error('❌ Error checking subscription expirations:', error);
    throw error;
  }
};

/**
 * Get all subscriptions (for admin dashboard)
 */
export const getAllSubscriptions = async () => {
  try {
    const snapshot = await db
      .collection('subscriptions')
      .orderBy('createdAt', 'desc')
      .get();

    const subscriptions = [];
    snapshot.forEach(doc => {
      subscriptions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return subscriptions;
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    throw error;
  }
};

