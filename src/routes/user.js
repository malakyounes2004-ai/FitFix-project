// src/routes/user.js
// User-facing routes (for mobile app)

import express from 'express';
import { 
  getMyMealPlans, 
  getMyWorkoutPlans,
  updateProfile,
  changePassword,
  changeEmail,
  deleteAccount,
  getChatContacts,
  savePushToken
} from '../controllers/userController.js';
import { getProfile } from '../controllers/authController.js';
import {
  createProgress,
  getProgress,
  getProgressById,
  updateProgress,
  deleteProgress
} from '../controllers/progressController.js';
import { verifyUser, authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Profile routes (accessible to all authenticated users: admin, employee, user)
router.get('/profile', authenticate, getProfile);
router.patch('/profile', authenticate, updateProfile);

// Settings routes (accessible to all authenticated users: admin, employee, user)
router.post('/change-password', authenticate, changePassword);
router.post('/change-email', authenticate, changeEmail);
router.delete('/account', authenticate, deleteAccount);

// Progress routes (CRUD)
router.post('/progress', verifyUser, createProgress);
router.get('/progress', verifyUser, getProgress);
router.get('/progress/:id', verifyUser, getProgressById);
router.put('/progress/:id', verifyUser, updateProgress);
router.delete('/progress/:id', verifyUser, deleteProgress);

// Meal and workout plans
router.get('/meal-plans', verifyUser, getMyMealPlans);
router.get('/workout-plans', verifyUser, getMyWorkoutPlans);

// Chat contacts
router.get('/chat-contacts', verifyUser, getChatContacts);

// Push token
router.post('/save-push-token', authenticate, savePushToken);

export default router;
