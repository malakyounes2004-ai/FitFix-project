import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { listUserNotifications, markNotificationSeen } from '../controllers/notificationController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', listUserNotifications);
router.post('/:id/seen', markNotificationSeen);

export default router;

