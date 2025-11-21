import express from 'express';
import { getSubscriptions, checkExpirations } from '../controllers/subscriptionController.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all subscriptions
router.get('/', verifyAdmin, getSubscriptions);

// Check subscription expirations (manual trigger)
router.post('/check-expirations', verifyAdmin, checkExpirations);

export default router;

