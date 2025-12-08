// src/utils/notificationHelper.js
// Helper function to send notifications to users when plan actions occur

import { db } from '../firebase.js';
import admin from 'firebase-admin';

/**
 * Send a meal plan notification to a user with coach name
 * @param {string} userId - The user ID to send the notification to
 * @param {string} type - The type of action: 'ADD', 'UPDATE', 'DELETE'
 * @param {string} coachName - The name of the coach/employee
 * @returns {Promise<string>} - The notification document ID
 */
export async function sendMealNotification(userId, type, coachName) {
  try {
    // Validate inputs
    if (!userId || !type || !coachName) {
      console.error('❌ sendMealNotification: Missing required parameters', { userId, type, coachName });
      return null;
    }

    // Validate type
    const validTypes = ['ADD', 'UPDATE', 'DELETE'];
    if (!validTypes.includes(type)) {
      console.error('❌ sendMealNotification: Invalid type', type);
      return null;
    }

    // Generate title and body based on type
    let title, body;
    switch (type) {
      case 'ADD':
        title = 'New Meal Plan Assigned';
        body = `Your coach ${coachName} added a meal plan for you.`;
        break;
      case 'UPDATE':
        title = 'Meal Plan Updated';
        body = `Your coach ${coachName} updated your meal plan.`;
        break;
      case 'DELETE':
        title = 'Meal Plan Removed';
        body = `Your coach ${coachName} removed a meal plan.`;
        break;
      default:
        title = 'Meal Plan Notification';
        body = `Your coach ${coachName} made changes to your meal plan.`;
    }

    // Create notification document
    const notificationData = {
      userId,
      title,
      body,
      type,
      coachName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false
    };

    // Save to Firestore notifications collection
    const notificationRef = await db.collection('notifications').add(notificationData);
    
    console.log(`✅ Meal notification sent to user ${userId}: ${type} - ${title} by ${coachName}`);
    
    return notificationRef.id;
  } catch (error) {
    console.error('❌ Error sending meal notification:', error);
    // Don't throw - notifications are non-critical
    return null;
  }
}

/**
 * Send a workout plan notification to a user with coach name
 * @param {string} userId - The user ID to send the notification to
 * @param {string} type - The type of action: 'ADD', 'UPDATE', 'DELETE'
 * @param {string} coachName - The name of the coach/employee
 * @returns {Promise<string>} - The notification document ID
 */
export async function sendWorkoutNotification(userId, type, coachName) {
  try {
    // Validate inputs
    if (!userId || !type || !coachName) {
      console.error('❌ sendWorkoutNotification: Missing required parameters', { userId, type, coachName });
      return null;
    }

    // Validate type
    const validTypes = ['ADD', 'UPDATE', 'DELETE'];
    if (!validTypes.includes(type)) {
      console.error('❌ sendWorkoutNotification: Invalid type', type);
      return null;
    }

    // Generate title and body based on type
    let title, body;
    switch (type) {
      case 'ADD':
        title = '🏋️ New Workout Plan Assigned';
        body = `Your coach ${coachName} created a new workout plan for you. Check it out!`;
        break;
      case 'UPDATE':
        title = '🏋️ Workout Plan Updated';
        body = `Your coach ${coachName} updated your workout plan. Check the changes!`;
        break;
      case 'DELETE':
        title = '🏋️ Workout Plan Removed';
        body = `Your coach ${coachName} removed your workout plan.`;
        break;
      default:
        title = '🏋️ Workout Plan Notification';
        body = `Your coach ${coachName} made changes to your workout plan.`;
    }

    // Create notification document
    const notificationData = {
      userId,
      title,
      body,
      message: body, // For backward compatibility
      type: `WORKOUT_${type}`,
      coachName,
      category: 'workout',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
      isRead: false
    };

    // Save to Firestore notifications collection
    const notificationRef = await db.collection('notifications').add(notificationData);
    
    console.log(`✅ Workout notification sent to user ${userId}: ${type} - ${title} by ${coachName}`);
    
    return notificationRef.id;
  } catch (error) {
    console.error('❌ Error sending workout notification:', error);
    // Don't throw - notifications are non-critical
    return null;
  }
}

/**
 * Send a notification to a user when a plan action occurs
 * @param {string} userId - The user ID to send the notification to
 * @param {string} type - The type of action: 'add', 'update', 'edit', 'delete'
 * @param {string} message - The notification message
 * @param {string} title - Optional custom title (defaults based on type)
 * @returns {Promise<string>} - The notification document ID
 */
export async function sendUserNotification(userId, type, message, title = null) {
  try {
    // Validate inputs
    if (!userId || !type || !message) {
      console.error('❌ sendUserNotification: Missing required parameters', { userId, type, message });
      return null;
    }

    // Validate type
    const validTypes = ['add', 'update', 'edit', 'delete'];
    if (!validTypes.includes(type)) {
      console.error('❌ sendUserNotification: Invalid type', type);
      return null;
    }

    // Generate default title based on type if not provided
    let notificationTitle = title;
    if (!notificationTitle) {
      switch (type) {
        case 'add':
          notificationTitle = 'New Meal Plan Assigned';
          break;
        case 'update':
        case 'edit':
          notificationTitle = 'Meal Plan Updated';
          break;
        case 'delete':
          notificationTitle = 'Meal Plan Removed';
          break;
        default:
          notificationTitle = 'Meal Plan Notification';
      }
    }

    // Create notification document
    const notificationData = {
      userId,
      title: notificationTitle,
      message,
      type,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Save to Firestore notifications collection
    const notificationRef = await db.collection('notifications').add(notificationData);
    
    console.log(`✅ Notification sent to user ${userId}: ${type} - ${notificationTitle}`);
    
    return notificationRef.id;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    // Don't throw - notifications are non-critical
    return null;
  }
}

