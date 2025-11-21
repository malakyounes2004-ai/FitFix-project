import express from 'express';
import { submitEmployeePayment, getAllEmployeePayments, deleteEmployeePayment } from '../controllers/employeePaymentController.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/submit', submitEmployeePayment);
router.get('/all', verifyAdmin, getAllEmployeePayments);
router.delete('/:paymentId', verifyAdmin, deleteEmployeePayment);

export default router;

