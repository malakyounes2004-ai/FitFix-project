// src/utils/passwordUtils.js
import crypto from 'crypto';

/**
 * Generate a secure 6-digit numeric OTP
 * @returns {string} 6-digit OTP code (e.g., "483921")
 */
export function generateOTP() {
  // Generate a random number between 100000 and 999999
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

/**
 * Hash an OTP code using SHA-256
 * @param {string} otp - The OTP code to hash
 * @returns {string} Hashed OTP
 */
export function hashOTP(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/**
 * Verify an OTP code against a hash
 * @param {string} otp - The OTP code to verify
 * @param {string} hash - The hashed OTP to compare against
 * @returns {boolean} True if OTP matches hash
 */
export function verifyOTP(otp, hash) {
  if (!otp || !hash) return false;
  
  const hashedOTP = hashOTP(otp);
  const hashBuffer = Buffer.from(hash, 'hex');
  const otpBuffer = Buffer.from(hashedOTP, 'hex');
  
  // Ensure buffers are the same length (timingSafeEqual requirement)
  if (hashBuffer.length !== otpBuffer.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(otpBuffer, hashBuffer);
}

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * @param {string} password - Password to validate
 * @returns {Object} { valid: boolean, message: string }
 */
export function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }

  return { valid: true, message: 'Password is valid' };
}

