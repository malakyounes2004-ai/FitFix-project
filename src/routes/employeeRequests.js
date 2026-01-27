// src/routes/employeeRequests.js
import express from 'express';
import {
  createEmployeeRequest,
  getAllEmployeeRequests,
  approveEmployeeRequest,
  rejectEmployeeRequest,
  uploadCVMiddleware
} from '../controllers/employeeRequestController.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route - anyone can submit a request (with optional CV upload)
router.post('/', uploadCVMiddleware, createEmployeeRequest);

// Admin only routes
router.get('/', verifyAdmin, getAllEmployeeRequests);
router.post('/approve/:id', verifyAdmin, approveEmployeeRequest);
router.post('/reject/:id', verifyAdmin, rejectEmployeeRequest);

export default router;

