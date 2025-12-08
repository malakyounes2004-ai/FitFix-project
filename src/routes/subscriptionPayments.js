// src/routes/subscriptionPayments.js
import express from 'express';
import { 
  getAllSubscriptionPayments,
  getSubscriptionPaymentStats 
} from '../controllers/subscriptionPaymentsController.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all subscription payments (Admin only)
// GET /api/subscription-payments
router.get('/', verifyAdmin, getAllSubscriptionPayments);

// Get subscription payment stats (Admin only)
// GET /api/subscription-payments/stats
router.get('/stats', verifyAdmin, getSubscriptionPaymentStats);

export default router;

