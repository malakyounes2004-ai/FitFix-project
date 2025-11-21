// src/controllers/recaptchaController.js
import axios from 'axios';

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

/**
 * Verify reCAPTCHA v3 token
 * POST /api/verify-recaptcha
 */
export const verifyRecaptcha = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'reCAPTCHA token is required' 
      });
    }

    if (!RECAPTCHA_SECRET_KEY) {
      console.error('⚠️ RECAPTCHA_SECRET_KEY not set in environment variables');
      // In development, return a mock score
      return res.json({
        success: true,
        score: 0.9,
        message: 'reCAPTCHA verification skipped (no secret key)'
      });
    }

    // Verify token with Google
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: RECAPTCHA_SECRET_KEY,
          response: token
        }
      }
    );

    const { success, score, action } = response.data;

    if (!success) {
      return res.status(400).json({ 
        success: false, 
        message: 'reCAPTCHA verification failed' 
      });
    }

    return res.json({
      success: true,
      score,
      action
    });
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to verify reCAPTCHA' 
    });
  }
};

