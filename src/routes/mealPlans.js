// src/routes/mealPlans.js
import express from 'express';
import { 
  bulkAssignMealPlan, 
  updateMealPlan, 
  deleteMealPlan,
  getMealPlanTemplates,
  createMealPlanTemplate,
  updateMealPlanTemplate,
  deleteMealPlanTemplate
} from '../controllers/employeeController.js';
import { verifyEmployee } from '../middleware/authMiddleware.js';

const router = express.Router();

// Bulk assign meal plan (Employee only)
router.post('/bulkAssign', verifyEmployee, bulkAssignMealPlan);

// Update meal plan (Employee only)
router.put('/:userId', verifyEmployee, updateMealPlan);

// Delete meal plan (Employee only)
router.delete('/:userId', verifyEmployee, deleteMealPlan);

// Meal Plan Templates CRUD
router.get('/templates', verifyEmployee, getMealPlanTemplates);
router.post('/templates', verifyEmployee, createMealPlanTemplate);
router.put('/templates/:templateId', verifyEmployee, updateMealPlanTemplate);
router.delete('/templates/:templateId', verifyEmployee, deleteMealPlanTemplate);

export default router;

