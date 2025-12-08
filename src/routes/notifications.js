import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { listUserNotifications, markNotificationSeen, markNotificationRead } from '../controllers/notificationController.js';

const router = express.Router();

// All notification routes require authentication (works for both web and mobile app)
router.use(authenticate);

// Get user's notifications (for mobile app)
router.get('/', listUserNotifications);

// Mark notification as read (for mobile app)
// Support both endpoints for flexibility
router.put('/:id/read', markNotificationRead);
router.patch('/:id/read', markNotificationRead);
router.post('/:id/seen', markNotificationSeen); // Keep for backward compatibility

export default router;

