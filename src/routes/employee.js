// src/routes/employee.js
import express from 'express';
import { 
  createUser, 
  getMyUsers,
  updateUser,
  deleteUser,
  assignMealPlan,
  bulkAssignMealPlan,
  updateMealPlan,
  deleteMealPlan, 
  assignWorkoutPlan,
  getUserProgress,
  getAdminInfo,
  sendUserReportEmail
} from '../controllers/employeeController.js';
import { generateUserPlan } from '../controllers/aiController.js';
import { createNotification } from '../controllers/notificationController.js';
import {
  getExercises,
  createExercise,
  updateExercise,
  deleteExercise,
  getUserWorkoutPlan,
  upsertUserWorkoutPlan,
  deleteUserWorkoutPlan,
  uploadExerciseGifs,
  uploadGifsMiddleware
} from '../controllers/workoutController.js';
import { verifyEmployee } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require employee authentication
router.get('/admin', verifyEmployee, getAdminInfo);
router.post('/users', verifyEmployee, createUser);
router.get('/users', verifyEmployee, getMyUsers);
router.put('/users/:userId', verifyEmployee, updateUser);
router.delete('/users/:userId', verifyEmployee, deleteUser);
router.post('/users/:userId/meal-plans', verifyEmployee, assignMealPlan);
router.post('/users/:userId/workout-plans', verifyEmployee, assignWorkoutPlan);
router.get('/users/:userId/progress', verifyEmployee, getUserProgress);
router.post('/users/:userId/send-report', verifyEmployee, sendUserReportEmail);
router.post('/users/:userId/ai-plans', verifyEmployee, (req, res, next) => {
  req.body.userId = req.params.userId;
  next();
}, generateUserPlan);
router.post('/users/:userId/notifications', verifyEmployee, (req, res, next) => {
  req.body.userId = req.params.userId;
  next();
}, createNotification);

// Exercise GIF Upload Route (uploads male and female GIF files)
router.post('/upload-gifs', verifyEmployee, uploadGifsMiddleware, uploadExerciseGifs);

// Exercises Library Routes
router.get('/exercises', verifyEmployee, getExercises);
router.post('/exercises', verifyEmployee, createExercise);
router.put('/exercises/:exerciseId', verifyEmployee, updateExercise);
router.delete('/exercises/:exerciseId', verifyEmployee, deleteExercise);

// Workout Plans Routes
router.get('/workout-plans/:userId', verifyEmployee, getUserWorkoutPlan);
router.post('/workout-plans/:userId', verifyEmployee, upsertUserWorkoutPlan);
router.delete('/workout-plans/:userId', verifyEmployee, deleteUserWorkoutPlan);

export default router;

