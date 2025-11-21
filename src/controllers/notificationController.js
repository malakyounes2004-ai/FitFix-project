import admin from 'firebase-admin';
import { db } from '../firebase.js';

export async function createNotification(req, res) {
  try {
    const { userId, type = 'push', title, message, scheduledAt } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'userId, title, and message are required'
      });
    }

    const payload = {
      type,
      title,
      message,
      userId,
      createdBy: req.user.uid,
      seen: false,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      meta: {
        triggeredBy: req.user.role,
        delivery: type
      }
    };

    const ref = await db.collection('notifications').add(payload);
    const doc = await ref.get();

    return res.status(201).json({
      success: true,
      message: 'Notification created',
      data: { id: ref.id, ...doc.data() }
    });
  } catch (error) {
    console.error('Create notification error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create notification' });
  }
}

export async function listUserNotifications(req, res) {
  try {
    const snapshot = await db
      .collection('notifications')
      .where('userId', '==', req.user.uid)
      .orderBy('scheduledAt', 'desc')
      .limit(50)
      .get();

    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('List notifications error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
}

export async function markNotificationSeen(req, res) {
  try {
    const { id } = req.params;
    const notifRef = db.collection('notifications').doc(id);
    const notifDoc = await notifRef.get();

    if (!notifDoc.exists || notifDoc.data().userId !== req.user.uid) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await notifRef.set(
      {
        seen: true,
        seenAt: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    return res.json({ success: true, message: 'Notification marked as seen' });
  } catch (error) {
    console.error('Mark notification seen error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
}

