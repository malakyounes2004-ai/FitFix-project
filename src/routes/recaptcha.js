// src/routes/recaptcha.js
import express from 'express';
import { verifyRecaptcha } from '../controllers/recaptchaController.js';

const router = express.Router();

router.post('/', verifyRecaptcha);

export default router;

