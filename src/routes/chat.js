// src/routes/chat.js
import express from 'express';
import {
  sendMessage,
  getChats,
  getMessages,
  markMessagesAsRead,
  getUnreadCount,
  updatePresence,
  getPresence,
  setTyping,
  createOrGetChat,
  toggleReaction
} from '../controllers/chatController.js';
import { authenticate, verifyAdmin, verifyEmployee } from '../middleware/authMiddleware.js';

const router = express.Router();

// All chat routes require authentication
router.post('/send', authenticate, sendMessage);
router.post('/create-or-get', authenticate, createOrGetChat);
router.get('/chats', authenticate, getChats);
router.get('/messages/:chatId', authenticate, getMessages);
router.post('/mark-read/:chatId', authenticate, markMessagesAsRead);
router.get('/unread-count', authenticate, getUnreadCount);
router.post('/presence', authenticate, updatePresence);
router.get('/presence/:userId', authenticate, getPresence);
router.post('/typing', authenticate, setTyping);
router.post('/reaction', authenticate, toggleReaction);

export default router;

