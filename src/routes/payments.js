import express from 'express';
import {
  createPayment,
  employeeApprovePayment,
  adminApprovePayment,
  getUserPayments,
  getEmployeePayments,
  getAllPayments,
  deletePayment
} from '../controllers/paymentController.js';
import { authenticate, verifyAdmin, verifyEmployee, verifyUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', verifyUser, createPayment);
router.post('/employee-approve', verifyEmployee, employeeApprovePayment);
router.post('/admin-approve', verifyAdmin, adminApprovePayment);
router.get('/user/:id', authenticate, getUserPayments);
router.get('/employee/:id', authenticate, getEmployeePayments);
router.get('/all', verifyAdmin, getAllPayments);
router.delete('/:paymentId', verifyAdmin, deletePayment);

export default router;

