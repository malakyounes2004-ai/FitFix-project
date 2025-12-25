// src/controllers/workoutController.js
import admin from 'firebase-admin';
import multer from 'multer';
import path from 'path';
import { sendWorkoutNotification } from '../utils/notificationHelper.js';

const db = admin.firestore();

// Initialize storage bucket (lazy load to avoid initialization errors)
let bucket = null;
const getBucket = () => {
  if (!bucket) {
    try {
      // Get default bucket or specify bucket name from env
      const bucketName = process.env.FIREBASE_STORAGE_BUCKET || 'fitfix-database.firebasestorage.app';
      bucket = admin.storage().bucket(bucketName);
      console.log('✅ Firebase Storage bucket initialized:', bucketName);
    } catch (error) {
      console.error('❌ Failed to initialize storage bucket:', error.message);
      throw error;
    }
  }
  return bucket;
};

// Multer configuration for handling GIF file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max per GIF
  },
  fileFilter: (req, file, cb) => {
    // Accept only GIF files
    if (file.mimetype === 'image/gif') {
      cb(null, true);
    } else {
      cb(new Error('Only GIF files are allowed'), false);
    }
  }
});

// Export multer middleware for routes - supports multiple GIF uploads
export const uploadGifsMiddleware = upload.fields([
  { name: 'maleGif', maxCount: 1 },
  { name: 'femaleGif', maxCount: 1 }
]);

/**
 * Upload male and female GIF files to Firebase Storage
 * POST /api/employee/upload-gifs
 * Multipart form data with 'maleGif' and 'femaleGif' fields
 */
export async function uploadExerciseGifs(req, res) {
  try {
    const { exerciseId } = req.body;
    
    if (!exerciseId) {
      return res.status(400).json({
        success: false,
        message: 'Exercise ID is required'
      });
    }

    const files = req.files;
    const maleGif = files?.maleGif?.[0];
    const femaleGif = files?.femaleGif?.[0];

    if (!maleGif && !femaleGif) {
      return res.status(400).json({
        success: false,
        message: 'At least one GIF file (male or female) is required'
      });
    }

    console.log('📤 Uploading GIFs for exercise:', exerciseId);

    const storageBucket = getBucket();
    const uploadResults = {
      gifMaleUrl: null,
      gifFemaleUrl: null
    };

    // Upload male GIF if provided
    if (maleGif) {
      console.log('📤 Uploading male GIF:', {
        size: (maleGif.size / 1024).toFixed(2) + ' KB',
        type: maleGif.mimetype
      });

      const maleFilePath = `exercises-gifs/${exerciseId}/male.gif`;
      const maleFileRef = storageBucket.file(maleFilePath);
      
      await maleFileRef.save(maleGif.buffer, {
        metadata: {
          contentType: 'image/gif',
          cacheControl: 'public, max-age=31536000'
        }
      });

      // Make file publicly accessible
      await maleFileRef.makePublic();

      // Get public URL
      uploadResults.gifMaleUrl = `https://storage.googleapis.com/${storageBucket.name}/${maleFilePath}`;
      console.log('✅ Male GIF uploaded:', uploadResults.gifMaleUrl);
    }

    // Upload female GIF if provided
    if (femaleGif) {
      console.log('📤 Uploading female GIF:', {
        size: (femaleGif.size / 1024).toFixed(2) + ' KB',
        type: femaleGif.mimetype
      });

      const femaleFilePath = `exercises-gifs/${exerciseId}/female.gif`;
      const femaleFileRef = storageBucket.file(femaleFilePath);
      
      await femaleFileRef.save(femaleGif.buffer, {
        metadata: {
          contentType: 'image/gif',
          cacheControl: 'public, max-age=31536000'
        }
      });

      // Make file publicly accessible
      await femaleFileRef.makePublic();

      // Get public URL
      uploadResults.gifFemaleUrl = `https://storage.googleapis.com/${storageBucket.name}/${femaleFilePath}`;
      console.log('✅ Female GIF uploaded:', uploadResults.gifFemaleUrl);
    }

    res.status(200).json({
      success: true,
      message: 'GIF files uploaded successfully',
      data: uploadResults
    });
  } catch (error) {
    console.error('❌ Error uploading GIF files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload GIF files',
      error: error.message
    });
  }
}

/**
 * Get all exercises from the library
 * GET /api/employee/exercises
 * Query params: ?muscleGroup=Chest&search=press
 */
export async function getExercises(req, res) {
  try {
    const { muscleGroup, search } = req.query;
    
    let query = db.collection('exercises');
    
    // Filter by muscle group if provided
    if (muscleGroup) {
      query = query.where('muscleGroup', '==', muscleGroup);
    }
    
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    
    let exercises = [];
    snapshot.forEach(doc => {
      const exerciseData = doc.data();
      exercises.push({
        id: doc.id,
        ...exerciseData,
        notes: exerciseData.notes || ''
      });
    });
    
    // Filter by search term if provided (case-insensitive)
    if (search) {
      const searchLower = search.toLowerCase();
      exercises = exercises.filter(exercise => 
        exercise.name.toLowerCase().includes(searchLower)
      );
    }
    
    res.status(200).json({
      success: true,
      data: exercises
    });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exercises',
      error: error.message
    });
  }
}

/**
 * Create a new exercise in the library
 * POST /api/employee/exercises
 */
export async function createExercise(req, res) {
  try {
    const { name, muscleGroup, equipment, defaultSets, defaultReps, notes, gifMaleUrl, gifFemaleUrl } = req.body;
    const employeeId = req.user.uid;
    
    // Validate required fields
    if (!name || !muscleGroup || !equipment) {
      return res.status(400).json({
        success: false,
        message: 'Name, muscle group, and equipment are required'
      });
    }
    
    if (defaultSets !== undefined && (typeof defaultSets !== 'number' || defaultSets < 1)) {
      return res.status(400).json({
        success: false,
        message: 'Default sets must be a positive number'
      });
    }
    
    if (defaultReps !== undefined && (typeof defaultReps !== 'number' || defaultReps < 1)) {
      return res.status(400).json({
        success: false,
        message: 'Default reps must be a positive number'
      });
    }
    
    // Simple structure with male and female GIF URLs
    const exerciseData = {
      name: name.trim(),
      muscleGroup: muscleGroup.trim(),
      equipment: equipment.trim(),
      defaultSets: defaultSets || 3,
      defaultReps: defaultReps || 10,
      notes: notes ? notes.trim() : '',
      gifMaleUrl: gifMaleUrl || null,
      gifFemaleUrl: gifFemaleUrl || null,
      createdBy: employeeId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('exercises').add(exerciseData);
    
    res.status(201).json({
      success: true,
      message: 'Exercise created successfully',
      data: {
        id: docRef.id,
        ...exerciseData
      }
    });
  } catch (error) {
    console.error('Error creating exercise:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create exercise',
      error: error.message
    });
  }
}

/**
 * Update an existing exercise
 * PUT /api/employee/exercises/:exerciseId
 */
export async function updateExercise(req, res) {
  try {
    const { exerciseId } = req.params;
    const { name, muscleGroup, equipment, defaultSets, defaultReps, notes, gifMaleUrl, gifFemaleUrl } = req.body;
    
    // Check if exercise exists
    const exerciseRef = db.collection('exercises').doc(exerciseId);
    const exerciseDoc = await exerciseRef.get();
    
    if (!exerciseDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }
    
    // Build update object (only include provided fields)
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (name !== undefined) updateData.name = name.trim();
    if (muscleGroup !== undefined) updateData.muscleGroup = muscleGroup.trim();
    if (equipment !== undefined) updateData.equipment = equipment.trim();
    if (defaultSets !== undefined) {
      if (typeof defaultSets !== 'number' || defaultSets < 1) {
        return res.status(400).json({
          success: false,
          message: 'Default sets must be a positive number'
        });
      }
      updateData.defaultSets = defaultSets;
    }
    if (defaultReps !== undefined) {
      if (typeof defaultReps !== 'number' || defaultReps < 1) {
        return res.status(400).json({
          success: false,
          message: 'Default reps must be a positive number'
        });
      }
      updateData.defaultReps = defaultReps;
    }
    if (notes !== undefined) updateData.notes = notes ? notes.trim() : '';
    
    // GIF URL updates
    if (gifMaleUrl !== undefined) updateData.gifMaleUrl = gifMaleUrl;
    if (gifFemaleUrl !== undefined) updateData.gifFemaleUrl = gifFemaleUrl;
    
    await exerciseRef.update(updateData);
    
    res.status(200).json({
      success: true,
      message: 'Exercise updated successfully'
    });
  } catch (error) {
    console.error('Error updating exercise:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update exercise',
      error: error.message
    });
  }
}

/**
 * Delete an exercise from the library
 * DELETE /api/employee/exercises/:exerciseId
 */
export async function deleteExercise(req, res) {
  try {
    const { exerciseId } = req.params;
    
    // Check if exercise exists
    const exerciseRef = db.collection('exercises').doc(exerciseId);
    const exerciseDoc = await exerciseRef.get();
    
    if (!exerciseDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }
    
    await exerciseRef.delete();
    
    res.status(200).json({
      success: true,
      message: 'Exercise deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete exercise',
      error: error.message
    });
  }
}

/**
 * Get workout plan for a specific user
 * GET /api/employee/workout-plans/:userId
 */
export async function getUserWorkoutPlan(req, res) {
  try {
    const { userId } = req.params;
    const employeeId = req.user.uid;
    
    // Verify user exists and is assigned to this employee
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const userData = userDoc.data();
    // Allow admin to access any user's plan, or employee to access their assigned users
    if (req.user.role !== 'admin' && userData.assignedEmployeeId !== employeeId) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this user'
      });
    }
    
    // Get workout plan
    const planDoc = await db.collection('workoutPlans').doc(userId).get();
    
    if (!planDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'No workout plan for this user yet'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: planDoc.id,
        ...planDoc.data()
      }
    });
  } catch (error) {
    console.error('Error fetching workout plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workout plan',
      error: error.message
    });
  }
}

/**
 * Create or update workout plan for a user
 * POST /api/employee/workout-plans/:userId
 */
export async function upsertUserWorkoutPlan(req, res) {
  try {
    const { userId } = req.params;
    const { goal, experience, daysPerWeek, days } = req.body;
    const employeeId = req.user.uid;
    
    // Verify user exists and is assigned to this employee
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const userData = userDoc.data();
    if (req.user.role !== 'admin' && userData.assignedEmployeeId !== employeeId) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this user'
      });
    }
    
    // Validate required fields
    if (!goal || !experience || !daysPerWeek || !Array.isArray(days)) {
      return res.status(400).json({
        success: false,
        message: 'Goal, experience, daysPerWeek, and days array are required'
      });
    }
    
    // Validate days array
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      if (!day.title || !Array.isArray(day.exercises)) {
        return res.status(400).json({
          success: false,
          message: `Day ${i + 1} must have a title and exercises array`
        });
      }
    }
    
    // Check if plan already exists
    const planRef = db.collection('workoutPlans').doc(userId);
    const planDoc = await planRef.get();
    
    // Enrich exercises with notes from exercises collection
    const enrichedDays = await Promise.all(
      days.map(async (day) => {
        const enrichedExercises = await Promise.all(
          (day.exercises || []).map(async (exercise) => {
            const exerciseId = exercise.id || exercise.exerciseId;
            if (!exerciseId) {
              // If no exercise ID, return exercise with empty notes
              return { ...exercise, notes: '' };
            }
            
            try {
              const exerciseDoc = await db.collection('exercises').doc(exerciseId).get();
              if (exerciseDoc.exists) {
                const exerciseData = exerciseDoc.data();
                return {
                  ...exercise,
                  notes: exerciseData.notes || ''
                };
              }
            } catch (error) {
              console.warn(`Failed to fetch notes for exercise ${exerciseId}:`, error.message);
            }
            
            // If exercise doesn't exist or fetch failed, return with empty notes
            return { ...exercise, notes: '' };
          })
        );
        
        return {
          title: day.title.trim(),
          warmup: day.warmup || [],
          exercises: enrichedExercises,
          cooldown: day.cooldown || []
        };
      })
    );
    
    const planData = {
      userId,
      goal: goal.trim(),
      experience: experience.trim(),
      daysPerWeek: parseInt(daysPerWeek),
      days: enrichedDays,
      assignedBy: employeeId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const isUpdate = planDoc.exists;
    
    if (isUpdate) {
      // Update existing plan
      await planRef.update(planData);
    } else {
      // Create new plan
      planData.createdAt = admin.firestore.FieldValue.serverTimestamp();
      await planRef.set(planData);
    }
    
    // Send notification to user
    try {
      // Get employee name for notification
      const employeeDoc = await db.collection('users').doc(employeeId).get();
      const employeeData = employeeDoc.data();
      const coachName = employeeData?.displayName || employeeData?.email || 'Your Coach';
      
      // Send notification based on action type
      await sendWorkoutNotification(
        userId,
        isUpdate ? 'UPDATE' : 'ADD',
        coachName
      );
      console.log(`✅ Workout ${isUpdate ? 'update' : 'create'} notification sent to user ${userId}`);
    } catch (notifError) {
      console.error('⚠️ Failed to send workout notification:', notifError);
      // Don't fail the operation if notification fails
    }
    
    res.status(200).json({
      success: true,
      message: isUpdate ? 'Workout plan updated successfully' : 'Workout plan created successfully',
      data: planData
    });
  } catch (error) {
    console.error('Error upserting workout plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save workout plan',
      error: error.message
    });
  }
}

/**
 * Delete workout plan for a specific user
 * DELETE /api/employee/workout-plans/:userId
 */
export async function deleteUserWorkoutPlan(req, res) {
  try {
    const { userId } = req.params;
    const employeeId = req.user.uid;
    
    // Verify user exists and is assigned to this employee
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const userData = userDoc.data();
    // Allow admin to delete any user's plan, or employee to delete their assigned users' plans
    if (req.user.role !== 'admin' && userData.assignedEmployeeId !== employeeId) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this user'
      });
    }
    
    // Check if plan exists
    const planRef = db.collection('workoutPlans').doc(userId);
    const planDoc = await planRef.get();
    
    if (!planDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'No workout plan found for this user'
      });
    }
    
    // Delete the plan
    await planRef.delete();
    
    console.log(`✅ Workout plan deleted for user ${userId} by employee ${employeeId}`);
    
    // Send notification to user about plan deletion
    try {
      // Get employee name for notification
      const employeeDoc = await db.collection('users').doc(employeeId).get();
      const employeeData = employeeDoc.data();
      const coachName = employeeData?.displayName || employeeData?.email || 'Your Coach';
      
      await sendWorkoutNotification(userId, 'DELETE', coachName);
      console.log(`✅ Workout delete notification sent to user ${userId}`);
    } catch (notifError) {
      console.error('⚠️ Failed to send workout delete notification:', notifError);
      // Don't fail the operation if notification fails
    }
    
    res.status(200).json({
      success: true,
      message: 'Workout plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting workout plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete workout plan',
      error: error.message
    });
  }
}

