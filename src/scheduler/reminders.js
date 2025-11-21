import cron from 'node-cron';
import admin from 'firebase-admin';
import { db } from '../firebase.js';
import { checkSubscriptionExpirations } from '../services/subscriptionService.js';

cron.schedule('0 8 * * *', async () => {
  console.log('[Scheduler] Running daily reminder job at 8 AM');

  try {
    const usersSnapshot = await db
      .collection('users')
      .where('isActive', '==', true)
      .where('role', '==', 'user')
      .get();

    if (usersSnapshot.empty) {
      console.log('[Scheduler] No active users found for reminders');
      return;
    }

    const batch = db.batch();
    usersSnapshot.forEach(doc => {
      const notifRef = db.collection('notifications').doc();
      batch.set(notifRef, {
        type: 'push',
        title: 'Daily Check-in',
        message: 'Log today\'s meals and workouts to stay on track!',
        userId: doc.id,
        seen: false,
        scheduledAt: new Date(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        meta: {
          automated: true,
          reason: 'daily-reminder'
        }
      });
    });

    await batch.commit();
    console.log(`[Scheduler] Created ${usersSnapshot.size} daily reminder notifications`);
  } catch (error) {
    console.error('[Scheduler] Daily reminder job failed:', error);
  }
});

cron.schedule('0 9 * * MON', async () => {
  console.log('[Scheduler] Running weekly progress reminder job');

  try {
    const usersSnapshot = await db
      .collection('users')
      .where('isActive', '==', true)
      .where('role', '==', 'user')
      .get();

    if (usersSnapshot.empty) {
      console.log('[Scheduler] No active users found for weekly reminders');
      return;
    }

    const batch = db.batch();
    usersSnapshot.forEach(doc => {
      const notifRef = db.collection('notifications').doc();
      batch.set(notifRef, {
        type: 'in-app',
        title: 'Weekly Progress Check',
        message: 'Share your latest weight, photos, or notes with your coach.',
        userId: doc.id,
        seen: false,
        scheduledAt: new Date(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        meta: {
          automated: true,
          reason: 'weekly-progress'
        }
      });
    });

    await batch.commit();
    console.log(`[Scheduler] Created ${usersSnapshot.size} weekly reminder notifications`);
  } catch (error) {
    console.error('[Scheduler] Weekly reminder job failed:', error);
  }
});

// Check subscription expirations every hour
cron.schedule('0 * * * *', async () => {
  console.log('[Scheduler] Running subscription expiration check');
  
  try {
    const results = await checkSubscriptionExpirations();
    console.log(`[Scheduler] Subscription check completed:`, {
      remindersSent: results.remindersSent,
      expirationsSent: results.expirationsSent,
      errors: results.errors.length
    });
  } catch (error) {
    console.error('[Scheduler] Subscription expiration check failed:', error);
  }
});

