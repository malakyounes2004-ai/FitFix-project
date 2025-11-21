// src/controllers/progressController.js
// UserProgress CRUD operations

import { db } from '../firebase.js';
import admin from 'firebase-admin';

/**
 * Create progress entry
 * POST /user/progress
 */
export async function createProgress(req, res) {
  try {
    const { 
      date, 
      weight, 
      bodyFat, 
      muscleMass, 
      measurements, 
      photos, 
      notes,
      workoutCompleted,
      mealPlanFollowed 
    } = req.body;

    const progressData = {
      userId: req.user.uid,
      date: date ? admin.firestore.Timestamp.fromDate(new Date(date)) : admin.firestore.FieldValue.serverTimestamp(),
      weight: weight || null,
      bodyFat: bodyFat || null,
      muscleMass: muscleMass || null,
      measurements: measurements || {
        chest: null,
        waist: null,
        hips: null,
        arms: null,
        thighs: null
      },
      photos: photos || [],
      notes: notes || null,
      workoutCompleted: workoutCompleted || false,
      mealPlanFollowed: mealPlanFollowed || false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const progressRef = await db.collection('progress').add(progressData);
    const progressDoc = await progressRef.get();

    res.status(201).json({
      success: true,
      message: 'Progress entry created successfully',
      data: {
        id: progressRef.id,
        ...progressDoc.data()
      }
    });
  } catch (error) {
    console.error('Create progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}

/**
 * Get all progress entries for current user
 * GET /user/progress
 */
export async function getProgress(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const startAfter = req.query.startAfter; // For pagination
    
    let query = db
      .collection('progress')
      .where('userId', '==', req.user.uid)
      .orderBy('date', 'desc')
      .limit(limit);

    if (startAfter) {
      const startAfterDoc = await db.collection('progress').doc(startAfter).get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }

    const progressSnapshot = await query.get();

    const progress = [];
    progressSnapshot.forEach(doc => {
      progress.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: progress,
      count: progress.length
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}

/**
 * Get single progress entry
 * GET /user/progress/:id
 */
export async function getProgressById(req, res) {
  try {
    const { id } = req.params;

    const progressDoc = await db.collection('progress').doc(id).get();

    if (!progressDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Progress entry not found'
      });
    }

    const progressData = progressDoc.data();

    // Verify ownership
    if (progressData.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only access your own progress entries'
      });
    }

    res.json({
      success: true,
      data: {
        id: progressDoc.id,
        ...progressData
      }
    });
  } catch (error) {
    console.error('Get progress by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}

/**
 * Update progress entry
 * PUT /user/progress/:id
 */
export async function updateProgress(req, res) {
  try {
    const { id } = req.params;
    const { 
      date, 
      weight, 
      bodyFat, 
      muscleMass, 
      measurements, 
      photos, 
      notes,
      workoutCompleted,
      mealPlanFollowed 
    } = req.body;

    // Check if progress exists and belongs to user
    const progressDoc = await db.collection('progress').doc(id).get();

    if (!progressDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Progress entry not found'
      });
    }

    const progressData = progressDoc.data();

    if (progressData.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update your own progress entries'
      });
    }

    // Build update data
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (date !== undefined) {
      updateData.date = admin.firestore.Timestamp.fromDate(new Date(date));
    }
    if (weight !== undefined) updateData.weight = weight;
    if (bodyFat !== undefined) updateData.bodyFat = bodyFat;
    if (muscleMass !== undefined) updateData.muscleMass = muscleMass;
    if (measurements !== undefined) updateData.measurements = measurements;
    if (photos !== undefined) updateData.photos = photos;
    if (notes !== undefined) updateData.notes = notes;
    if (workoutCompleted !== undefined) updateData.workoutCompleted = workoutCompleted;
    if (mealPlanFollowed !== undefined) updateData.mealPlanFollowed = mealPlanFollowed;

    await db.collection('progress').doc(id).update(updateData);

    // Get updated document
    const updatedDoc = await db.collection('progress').doc(id).get();

    res.json({
      success: true,
      message: 'Progress entry updated successfully',
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}

/**
 * Delete progress entry
 * DELETE /user/progress/:id
 */
export async function deleteProgress(req, res) {
  try {
    const { id } = req.params;

    // Check if progress exists and belongs to user
    const progressDoc = await db.collection('progress').doc(id).get();

    if (!progressDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Progress entry not found'
      });
    }

    const progressData = progressDoc.data();

    if (progressData.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete your own progress entries'
      });
    }

    await db.collection('progress').doc(id).delete();

    res.json({
      success: true,
      message: 'Progress entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}

