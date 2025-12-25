// src/routes/ai.js
// AI-related routes

import express from 'express';
import { aiChat } from '../controllers/aiChatController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// AI Chat endpoint - protected by authentication
router.post('/chat', authenticate, aiChat);

export default router;

