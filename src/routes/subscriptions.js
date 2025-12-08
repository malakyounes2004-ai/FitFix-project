import express from 'express';
import { getSubscriptions, checkExpirations } from '../controllers/subscriptionController.js';
import { 
  getEmployeeSubscription, 
  renewSubscription, 
  getAvailablePlans 
} from '../controllers/subscriptionRenewController.js';
import { verifyAdmin, verifyEmployee, authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all subscriptions (Admin only)
router.get('/', verifyAdmin, getSubscriptions);

// Check subscription expirations (manual trigger - Admin only)
router.post('/check-expirations', verifyAdmin, checkExpirations);

// Get available subscription plans (authenticated users)
router.get('/plans', authenticate, getAvailablePlans);

// Get employee's own subscription
router.get('/employee/:employeeId', verifyEmployee, getEmployeeSubscription);

// Renew subscription (Employee or Admin)
router.post('/renew', verifyEmployee, renewSubscription);

export default router;

