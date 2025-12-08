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
    // Try to order by createdAt first (new structure), fallback to scheduledAt (old structure)
    let snapshot;
    try {
      snapshot = await db
        .collection('notifications')
        .where('userId', '==', req.user.uid)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();
    } catch (error) {
      // Fallback to scheduledAt if createdAt index doesn't exist
      snapshot = await db
        .collection('notifications')
        .where('userId', '==', req.user.uid)
        .orderBy('scheduledAt', 'desc')
        .limit(50)
        .get();
    }

    const notifications = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        title: data.title,
        message: data.message || data.body, // Support both message and body
        body: data.body || data.message, // Support both body and message
        type: data.type,
        coachName: data.coachName || null, // Include coach name if present
        createdAt: data.createdAt?.toDate?.() || data.createdAt || data.scheduledAt?.toDate?.() || data.scheduledAt || null,
        isRead: data.isRead !== undefined ? data.isRead : (data.read !== undefined ? data.read : (data.seen !== undefined ? data.seen : false))
      };
    });

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

    // Update isRead, read, and seen for backward compatibility
    await notifRef.set(
      {
        isRead: true,
        read: true, // New format
        seen: true, // Old format for backward compatibility
        seenAt: admin.firestore.FieldValue.serverTimestamp(),
        readAt: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    return res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification seen error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
}

/**
 * Mark notification as read (alternative endpoint name)
 * PUT /api/notifications/:id/read
 */
export async function markNotificationRead(req, res) {
  return markNotificationSeen(req, res);
}

