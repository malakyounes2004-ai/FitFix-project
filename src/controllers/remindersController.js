// src/controllers/remindersController.js
// Reminders management for users

import { db } from '../firebase.js';

/**
 * Default reminder structure
 * Water reminder uses interval-based structure (every 2 hours starting at 08:00)
 */
const DEFAULT_REMINDERS = {
  water: { enabled: true, intervalHours: 2, startTime: '08:00' },
  sleep: { enabled: false, time: '22:00' },
  gym: { enabled: false, time: '18:00' },
  meal: { enabled: false, time: '12:00' }
};

/**
 * Validate water reminder (interval-based)
 * @param {Object} reminder - Water reminder object to validate
 * @returns {Object} { valid: boolean, message: string }
 */
function validateWaterReminder(reminder) {
  if (!reminder || typeof reminder !== 'object') {
    return { valid: false, message: 'Water reminder must be an object' };
  }

  if (typeof reminder.enabled !== 'boolean') {
    return { valid: false, message: 'Water reminder enabled must be a boolean' };
  }

  if (typeof reminder.intervalHours !== 'number' || reminder.intervalHours < 1) {
    return { valid: false, message: 'Water reminder intervalHours must be a number >= 1' };
  }

  if (!reminder.startTime || typeof reminder.startTime !== 'string') {
    return { valid: false, message: 'Water reminder startTime is required and must be a string' };
  }

  // Validate time format (HH:mm)
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(reminder.startTime)) {
    return { valid: false, message: 'Water reminder startTime must be in HH:mm format (e.g., 08:00, 22:30)' };
  }

  return { valid: true, message: 'Valid' };
}

/**
 * Validate reminder data structure (for sleep, gym, meal)
 * @param {Object} reminder - Reminder object to validate
 * @returns {Object} { valid: boolean, message: string }
 */
function validateReminder(reminder) {
  if (!reminder || typeof reminder !== 'object') {
    return { valid: false, message: 'Reminder must be an object' };
  }

  if (typeof reminder.enabled !== 'boolean') {
    return { valid: false, message: 'Reminder enabled must be a boolean' };
  }

  if (!reminder.time || typeof reminder.time !== 'string') {
    return { valid: false, message: 'Reminder time is required and must be a string' };
  }

  // Validate time format (HH:mm)
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(reminder.time)) {
    return { valid: false, message: 'Time must be in HH:mm format (e.g., 09:00, 22:30)' };
  }

  return { valid: true, message: 'Valid' };
}

/**
 * Get user's reminders
 * GET /api/user/reminders
 * Returns the user's reminders or defaults if none exist
 */
export async function getReminders(req, res) {
  try {
    const uid = req.user.uid;

    // Get user document
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data();
    const reminders = userData.reminders || DEFAULT_REMINDERS;

    res.json({
      success: true,
      data: reminders
    });
  } catch (error) {
    console.error('❌ Get reminders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reminders'
    });
  }
}

/**
 * Update user's reminders
 * PUT /api/user/reminders
 * Input: { water: { enabled, intervalHours, startTime }, sleep: { enabled, time }, gym: { enabled, time }, meal: { enabled, time } }
 */
export async function updateReminders(req, res) {
  try {
    const uid = req.user.uid;
    const { water, sleep, gym, meal } = req.body;

    // Validate all reminders
    const reminders = { water, sleep, gym, meal };
    
    // Validate water reminder (interval-based)
    if (!water) {
      return res.status(400).json({
        success: false,
        message: 'water reminder is required'
      });
    }
    const waterValidation = validateWaterReminder(water);
    if (!waterValidation.valid) {
      return res.status(400).json({
        success: false,
        message: `Invalid water reminder: ${waterValidation.message}`
      });
    }

    // Validate other reminders (sleep, gym, meal)
    const otherReminderTypes = ['sleep', 'gym', 'meal'];
    for (const type of otherReminderTypes) {
      if (!reminders[type]) {
        return res.status(400).json({
          success: false,
          message: `${type} reminder is required`
        });
      }

      const validation = validateReminder(reminders[type]);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${type} reminder: ${validation.message}`
        });
      }
    }

    // Check if user exists
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update reminders (only update the reminders field, don't overwrite other fields)
    await db.collection('users').doc(uid).update({
      reminders: {
        water: {
          enabled: water.enabled,
          intervalHours: water.intervalHours,
          startTime: water.startTime
        },
        sleep: {
          enabled: sleep.enabled,
          time: sleep.time
        },
        gym: {
          enabled: gym.enabled,
          time: gym.time
        },
        meal: {
          enabled: meal.enabled,
          time: meal.time
        }
      },
      updatedAt: new Date()
    });

    console.log(`✅ Reminders updated for user: ${uid}`);

    res.json({
      success: true,
      message: 'Reminders updated successfully',
      data: reminders
    });
  } catch (error) {
    console.error('❌ Update reminders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reminders'
    });
  }
}

