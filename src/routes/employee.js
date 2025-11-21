// src/routes/employee.js
import express from 'express';
import { 
  createUser, 
  getMyUsers, 
  assignMealPlan, 
  assignWorkoutPlan,
  getUserProgress,
  getAdminInfo
} from '../controllers/employeeController.js';
import { generateUserPlan } from '../controllers/aiController.js';
import { createNotification } from '../controllers/notificationController.js';
import { verifyEmployee } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require employee authentication
router.get('/admin', verifyEmployee, getAdminInfo);
router.post('/users', verifyEmployee, createUser);
router.get('/users', verifyEmployee, getMyUsers);
router.post('/users/:userId/meal-plans', verifyEmployee, assignMealPlan);
router.post('/users/:userId/workout-plans', verifyEmployee, assignWorkoutPlan);
router.get('/users/:userId/progress', verifyEmployee, getUserProgress);
router.post('/users/:userId/ai-plans', verifyEmployee, (req, res, next) => {
  req.body.userId = req.params.userId;
  next();
}, generateUserPlan);
router.post('/users/:userId/notifications', verifyEmployee, (req, res, next) => {
  req.body.userId = req.params.userId;
  next();
}, createNotification);

export default router;

