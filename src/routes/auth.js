// src/routes/auth.js
import express from 'express';
import { login, register, getProfile, forgotPassword, verifyResetCode, resetPassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * PUBLIC ROUTES (No authentication required)
 * 
 * These routes are automatically detected by the authenticate middleware
 * as public routes. Even if authenticate middleware is applied, these
 * routes will bypass authentication.
 * 
 * Public routes:
 * - POST /auth/login
 * - POST /auth/register
 * - POST /auth/forgot-password
 * - POST /auth/verify-reset-code
 * - POST /auth/reset-password
 */
router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

/**
 * PROTECTED ROUTES (Authentication required)
 * 
 * These routes require a valid Firebase ID token in the Authorization header.
 * Format: Authorization: Bearer <token>
 * 
 * The authenticate middleware will:
 * 1. Check if route is public (if yes, bypass auth)
 * 2. Extract and verify Firebase ID token
 * 3. Fetch user data from Firestore
 * 4. Attach user data to req.user
 * 5. Return 401 if token is missing or invalid
 */
router.get('/profile', authenticate, getProfile);

export default router;
