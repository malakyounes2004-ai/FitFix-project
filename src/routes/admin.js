// src/routes/admin.js
import express from 'express';
import { 
  createEmployee, 
  getAllEmployees,
  updateEmployee,
  deleteEmployee,
  updateEmployeeStatus,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDashboardStats,
  sendEmployeeAccountCredentials,
  resetEmployeePassword,
  cleanupOldEmployeePayments
} from '../controllers/adminController.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Employee routes
router.post('/employees', verifyAdmin, createEmployee);
router.get('/employees', verifyAdmin, getAllEmployees);
router.put('/employees/:uid', verifyAdmin, updateEmployee);
router.delete('/employees/:uid', verifyAdmin, deleteEmployee);
router.patch('/employees/:employeeId/status', verifyAdmin, updateEmployeeStatus); // Legacy endpoint

// User routes
router.get('/users', verifyAdmin, getAllUsers);
router.get('/users/:uid', verifyAdmin, getUserById);
router.put('/users/:uid', verifyAdmin, updateUser);
router.delete('/users/:uid', verifyAdmin, deleteUser);

// Dashboard
router.get('/dashboard/stats', verifyAdmin, getDashboardStats);
router.post('/sendEmployeeAccount', verifyAdmin, sendEmployeeAccountCredentials);

// Password reset
router.post('/reset-employee-password', verifyAdmin, resetEmployeePassword);

// Cleanup old payments
router.post('/cleanup-old-payments', verifyAdmin, cleanupOldEmployeePayments);

export default router;
