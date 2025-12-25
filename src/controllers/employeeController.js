// src/controllers/employeeController.js
import { auth, db } from '../firebase.js';
import admin from 'firebase-admin';
import { sendUserWelcomeEmail, sendUserReport } from '../utils/emailService.js';
import { sendUserNotification, sendMealNotification } from '../utils/notificationHelper.js';
import { computeDailyMacros } from '../utils/mealPlanMacros.js';

/**
 * Create a new user with a temporary password (Employee/Admin only)
 * 
 * Flow:
 * 1. Employee enters full name and real email
 * 2. Backend generates login email as fullname@fitfix.com (lowercase, spaces to dots)
 * 3. Generates secure 12-character password
 * 4. Creates user in Firebase Auth with generated login email
 * 5. Stores both realEmail and loginEmail in Firestore
 * 6. Sends welcome email to real email with login credentials
 */
export async function createUser(req, res) {
  try {
    const { email: realEmail, displayName, phoneNumber, dateOfBirth, gender, height, weight, fitnessGoals, age, planType } = req.body;

    // Validate required fields
    if (!realEmail || !displayName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and Full Name are required' 
      });
    }

    // Validate real email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(realEmail)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email address format' 
      });
    }

    // Generate login email: fullname@fitfix.com (lowercase, spaces replaced by dots)
    const generateLoginEmail = (fullName) => {
      // Convert to lowercase, replace spaces with dots, remove special characters
      const sanitized = fullName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '.')  // Replace spaces with dots
        .replace(/[^a-z0-9.]/g, '')  // Remove special characters except dots
        .replace(/\.+/g, '.')  // Replace multiple dots with single dot
        .replace(/^\.|\.$/g, '');  // Remove leading/trailing dots
      
      return `${sanitized}@fitfix.com`;
    };

    const loginEmail = generateLoginEmail(displayName);

    // Generate secure random password (12 characters: letters, numbers, special chars)
    const generateSecurePassword = () => {
      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const numbers = '0123456789';
      const special = '!@#$%^&*';
      const allChars = lowercase + uppercase + numbers + special;
      
      let password = '';
      // Ensure at least one of each type
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
      password += uppercase[Math.floor(Math.random() * uppercase.length)];
      password += numbers[Math.floor(Math.random() * numbers.length)];
      password += special[Math.floor(Math.random() * special.length)];
      
      // Fill the rest randomly
      for (let i = password.length; i < 12; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
      }
      
      // Shuffle the password
      return password.split('').sort(() => Math.random() - 0.5).join('');
    };

    const tempPassword = generateSecurePassword();

    // Create user in Firebase Authentication using generated login email
    const userRecord = await auth.createUser({
      email: loginEmail,
      password: tempPassword,
      displayName: displayName,
      emailVerified: false
    });

    // Calculate age from dateOfBirth if provided, otherwise use age field
    let calculatedAge = age || null;
    if (dateOfBirth && !age) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
    }

    // Prepare user data for Firestore
    const userData = {
      displayName: displayName,
      realEmail: realEmail,  // The email entered by employee
      loginEmail: loginEmail,  // The generated FitFix email
      phoneNumber: phoneNumber || null,
      dateOfBirth: dateOfBirth || null,
      age: calculatedAge,
      gender: gender || null,
      height: height ? parseFloat(height) : null,
      weight: weight ? parseFloat(weight) : null,
      fitnessGoals: fitnessGoals || [],
      planType: planType || null,
      role: 'user',
      isActive: true,
      assignedEmployeeId: req.user.uid,
      signupMethod: 'employee',  // Mark as created by employee (not mobile app)
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      photoURL: null
    };

    // Save user to Firestore
    await db.collection('users').doc(userRecord.uid).set(userData);

    // Get employee name for email
    const employeeDoc = await db.collection('users').doc(req.user.uid).get();
    const employeeName = employeeDoc.data()?.displayName || 'Your Trainer';

    // Send welcome email to real email with login credentials
    try {
      await sendUserWelcomeEmail(
        realEmail,  // Send to real email
        displayName,
        loginEmail,  // Login email to show in email
        tempPassword,
        employeeName
      );
      console.log(`✅ Welcome email sent to ${realEmail} with login credentials`);
    } catch (emailError) {
      console.error('⚠️ Failed to send welcome email, but user was created:', emailError);
      // Don't fail the whole operation if email fails
    }

    // Prepare response data (exclude password)
    const responseData = {
      uid: userRecord.uid,
      ...userData
    };
    // Remove password from response (it's never stored, but just to be safe)
    delete responseData.tempPassword;

    res.status(201).json({
      success: true,
      message: 'User created successfully. Welcome email sent with login credentials.',
      data: responseData
    });
  } catch (error) {
    console.error('Create user error:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({ 
        success: false, 
        message: 'Login email already exists. Please try again or contact support.' 
      });
    }
    
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email address format' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}

/**
 * Get all users assigned to this employee
 */
export async function getMyUsers(req, res) {
  try {
    const usersSnapshot = await db
      .collection('users')
      .where('assignedEmployeeId', '==', req.user.uid)
      .where('role', '==', 'user')
      .get();

    const users = [];
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      // Handle mealPlan timestamps if it exists
      let mealPlan = userData.mealPlan;
      if (mealPlan && mealPlan.createdAt) {
        mealPlan = {
          ...mealPlan,
          createdAt: mealPlan.createdAt?.toDate?.() || mealPlan.createdAt || null,
          updatedAt: mealPlan.updatedAt?.toDate?.() || mealPlan.updatedAt || null
        };
      }
      
      users.push({
        uid: doc.id,
        ...userData,
        mealPlan: mealPlan || null,
        createdAt: userData.createdAt?.toDate?.() || userData.createdAt || null,
        updatedAt: userData.updatedAt?.toDate?.() || userData.updatedAt || null,
        lastLogin: userData.lastLogin?.toDate?.() || userData.lastLogin || null
      });
    });

    // Sort by createdAt in descending order (newest first) in JavaScript
    users.sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate; // Descending order
    });

    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Get my users error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}

/**
 * Update a user assigned to this employee
 */
export async function updateUser(req, res) {
  try {
    const { userId } = req.params;
    const { displayName, realEmail, age, gender, height, weight, planType, phoneNumber } = req.body;

    // Verify user exists and is assigned to this employee
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userData = userDoc.data();
    if (userData.assignedEmployeeId !== req.user.uid) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not assigned to this user' 
      });
    }

    // Prepare update data
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (displayName !== undefined) updateData.displayName = displayName;
    if (realEmail !== undefined) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(realEmail)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid email address format' 
        });
      }
      updateData.realEmail = realEmail;
    }
    if (age !== undefined) updateData.age = parseInt(age);
    if (gender !== undefined) updateData.gender = gender;
    if (height !== undefined) updateData.height = parseFloat(height);
    if (weight !== undefined) updateData.weight = parseFloat(weight);
    if (planType !== undefined) updateData.planType = planType;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

    // Update user in Firestore
    await db.collection('users').doc(userId).update(updateData);

    // Get updated user data
    const updatedDoc = await db.collection('users').doc(userId).get();
    const updatedData = updatedDoc.data();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        uid: userId,
        ...updatedData,
        createdAt: updatedData.createdAt?.toDate?.() || updatedData.createdAt || null,
        updatedAt: updatedData.updatedAt?.toDate?.() || updatedData.updatedAt || null
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}

/**
 * Delete a user assigned to this employee
 */
export async function deleteUser(req, res) {
  try {
    const { userId } = req.params;

    // Verify user exists and is assigned to this employee
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userData = userDoc.data();
    if (userData.assignedEmployeeId !== req.user.uid) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not assigned to this user' 
      });
    }

    // Delete user from Firebase Auth
    try {
      await auth.deleteUser(userId);
    } catch (authError) {
      console.warn('Failed to delete user from Auth (may not exist):', authError.message);
    }

    // Delete user document from Firestore
    await db.collection('users').doc(userId).delete();

    // Optionally delete related data (progress, meal plans, workout plans, etc.)
    // This is optional - you may want to keep historical data
    // For now, we'll just delete the user document

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}

/**
 * Calculate BMR using Mifflin-St Jeor Equation
 */
function calculateBMR(weight, height, age, gender) {
  // Weight in kg, height in cm, age in years
  // BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(years) + s
  // s = +5 for males, -161 for females
  const baseBMR = 10 * weight + 6.25 * height - 5 * age;
  const genderFactor = gender?.toLowerCase() === 'male' ? 5 : -161;
  return baseBMR + genderFactor;
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * Using activity multiplier (assuming moderate activity level 1.55)
 */
function calculateTDEE(bmr, activityLevel = 1.55) {
  return bmr * activityLevel;
}

/**
 * Calculate BMI
 */
function calculateBMI(weight, height) {
  // Height in cm, convert to meters
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

/**
 * Assign grams to meal items based on portion scale
 */
function assignGrams(baseGrams, portionScale) {
  return Math.round(baseGrams * portionScale);
}

/**
 * Bulk assign meal plan to multiple users
 * POST /api/mealPlans/bulkAssign
 */
export async function bulkAssignMealPlan(req, res) {
  try {
    const { mealPlanTemplate, mealPlanType, selectedUserIds } = req.body;

    if (!mealPlanTemplate || !selectedUserIds || !Array.isArray(selectedUserIds) || selectedUserIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Meal plan template and selected user IDs are required' 
      });
    }

    // Validate mealPlanType
    const validTypes = ['Weight Loss', 'Weight Gain', 'Maintain Weight'];
    const planType = mealPlanType || 'Maintain Weight';
    if (!validTypes.includes(planType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid meal plan type. Must be: Weight Loss, Weight Gain, or Maintain Weight' 
      });
    }

    // Validate meal plan template structure (support new array-based and legacy single-object formats)
    if (
      !mealPlanTemplate.breakfasts &&
      !mealPlanTemplate.lunches &&
      !mealPlanTemplate.dinners &&
      !mealPlanTemplate.breakfast &&
      !mealPlanTemplate.lunch &&
      !mealPlanTemplate.dinner
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meal plan template structure'
      });
    }

    const employeeId = req.user.uid;
    // Get employee name for notifications
    const employeeDoc = await db.collection('users').doc(employeeId).get();
    const employeeName = employeeDoc.data()?.displayName || 'Your Coach';
    
    const results = {
      success: [],
      failed: []
    };

    // Process each user
    for (const userId of selectedUserIds) {
      try {
        // Verify user exists and is assigned to this employee
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
          results.failed.push({
            userId,
            reason: 'User not found'
          });
          continue;
        }

        const userData = userDoc.data();
        if (userData.assignedEmployeeId !== employeeId) {
          results.failed.push({
            userId,
            reason: 'User not assigned to this employee'
          });
          continue;
        }

        // Get user body data
        const weight = parseFloat(userData.weight) || 70; // Default 70kg
        const height = parseFloat(userData.height) || 170; // Default 170cm
        const age = parseInt(userData.age) || 30; // Default 30 years
        const gender = userData.gender || 'male';
        const planType = userData.planType || 'Maintenance / Fitness / Healthy Lifestyle';

        // Determine goal from planType
        let goal = 'Maintain Weight';
        if (planType === 'Weight Loss') {
          goal = 'Lose Weight';
        } else if (planType === 'Muscle Gain / Weight Gain') {
          goal = 'Gain Weight';
        } else if (planType === 'Maintenance / Fitness / Healthy Lifestyle') {
          goal = 'Maintain Weight';
        } else {
          // Fallback to keyword matching
          const planTypeLower = planType.toLowerCase();
          if (planTypeLower.includes('loss') || planTypeLower.includes('weight loss')) {
            goal = 'Lose Weight';
          } else if (planTypeLower.includes('gain') || planTypeLower.includes('muscle')) {
            goal = 'Gain Weight';
          } else if (planTypeLower.includes('maintain') || planTypeLower.includes('maintenance') || planTypeLower.includes('fitness') || planTypeLower.includes('healthy')) {
            goal = 'Maintain Weight';
          }
        }

        // Calculate BMR, TDEE, and BMI
        const bmr = calculateBMR(weight, height, age, gender);
        const tdee = calculateTDEE(bmr);
        const bmi = calculateBMI(weight, height);

        // Calculate portion scaling factor based on TDEE
        // Base TDEE for scaling (2200 calories as reference)
        const baseTDEE = 2200;
        const portionScale = tdee / baseTDEE;

        // Helper function to convert items to { name, baseGrams, grams } format
        const convertItemsWithGrams = (items) => {
          return items.map(item => {
            // Handle backward compatibility: string items or object items
            let itemName, itemBaseGrams;
            
            if (typeof item === 'string') {
              // Legacy format: string item, use default baseGrams based on meal type
              itemName = item;
              itemBaseGrams = 100; // Default fallback
            } else if (typeof item === 'object') {
              // New format: object with name and baseGrams
              itemName = item.name || item;
              itemBaseGrams = parseFloat(item.baseGrams) || 100;
            } else {
              // Fallback
              itemName = String(item);
              itemBaseGrams = 100;
            }

            // Calculate scaled grams
            const scaledGrams = assignGrams(itemBaseGrams, portionScale);

            return {
              name: itemName,
              baseGrams: itemBaseGrams,
              grams: scaledGrams
            };
          });
        };

        // Helper function to convert categories with items
        const convertCategoriesWithGrams = (categories) => {
          if (!categories) return null;
          const converted = {};
          const categoryKeys = ['protein', 'carbs', 'fats', 'meat', 'chicken', 'fish'];
          categoryKeys.forEach(key => {
            if (categories[key] && Array.isArray(categories[key])) {
              converted[key] = convertItemsWithGrams(categories[key]);
            } else {
              converted[key] = [];
            }
          });
          return converted;
        };

        // Normalize template into array-based structure
        const toArray = (maybeArrayOrSingle) => {
          if (!maybeArrayOrSingle) return [];
          if (Array.isArray(maybeArrayOrSingle)) return maybeArrayOrSingle;
          return [maybeArrayOrSingle];
        };

        const breakfasts = toArray(mealPlanTemplate.breakfasts || mealPlanTemplate.breakfast);
        const lunches = toArray(mealPlanTemplate.lunches || mealPlanTemplate.lunch);
        const dinners = toArray(mealPlanTemplate.dinners || mealPlanTemplate.dinner);
        const snacks = toArray(mealPlanTemplate.snacks || []);

        // Create meal plan with scaled portions and grams (array-based, plus first items for backward compatibility)
        const mealPlan = {
          breakfasts: breakfasts.map((section) => {
            const result = {
              title: section.title,
              items: convertItemsWithGrams(section.items || [])
            };
            // Include categories if they exist
            if (section.categories) {
              result.categories = convertCategoriesWithGrams(section.categories);
            }
            return result;
          }),
          lunches: lunches.map((section) => {
            const result = {
              title: section.title,
              items: convertItemsWithGrams(section.items || [])
            };
            if (section.categories) {
              result.categories = convertCategoriesWithGrams(section.categories);
            }
            return result;
          }),
          dinners: dinners.map((section) => {
            const result = {
              title: section.title,
              items: convertItemsWithGrams(section.items || [])
            };
            if (section.categories) {
              result.categories = convertCategoriesWithGrams(section.categories);
            }
            return result;
          }),
          snacks: snacks.map((snack) => {
            const result = {
              title: snack.title,
              items: convertItemsWithGrams(snack.items || [])
            };
            if (snack.categories) {
              result.categories = convertCategoriesWithGrams(snack.categories);
            }
            return result;
          }),
          // Backward compatibility: expose first section as single breakfast/lunch/dinner
          breakfast: breakfasts[0]
            ? {
                title: breakfasts[0].title,
                items: convertItemsWithGrams(breakfasts[0].items || [])
              }
            : null,
          lunch: lunches[0]
            ? {
                title: lunches[0].title,
                items: convertItemsWithGrams(lunches[0].items || [])
              }
            : null,
          dinner: dinners[0]
            ? {
                title: dinners[0].title,
                items: convertItemsWithGrams(dinners[0].items || [])
              }
            : null,
          goal: goal,
          mealPlanType: planType, // Save mealPlanType
          totalCalories: Math.round(tdee),
          calories: Math.round(tdee), // Keep for backward compatibility
          tdee: Math.round(tdee),
          bmr: Math.round(bmr),
          bmi: parseFloat(bmi.toFixed(1)),
          portionScale: parseFloat(portionScale.toFixed(2)),
          assignedBy: employeeId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        // Compute and store daily macros totals
        const macros = computeDailyMacros(mealPlan);
        // Store in new dailyMacros format
        mealPlan.dailyMacros = {
          proteins: macros.proteins,
          carbs: macros.carbs,
          fats: macros.fats,
          allZero: macros.allZero
        };
        // Keep old format for backward compatibility
        mealPlan.dailyProteinG = macros.proteins;
        mealPlan.dailyCarbsG = macros.carbs;
        mealPlan.dailyFatsG = macros.fats;

        // Save meal plan under users/{userId}/mealPlan (as a field in the user document)
        await db.collection('users').doc(userId).update({
          mealPlan
        });

        // Send notification to user about new meal plan
        await sendMealNotification(userId, 'ADD', employeeName);

        results.success.push({
          userId,
          displayName: userData.displayName || 'Unknown',
          calories: mealPlan.calories,
          bmi: mealPlan.bmi
        });
      } catch (error) {
        console.error(`Error assigning meal plan to user ${userId}:`, error);
        results.failed.push({
          userId,
          reason: error.message || 'Unknown error'
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Meal plan assigned to ${results.success.length} user(s)`,
      data: {
        successCount: results.success.length,
        failedCount: results.failed.length,
        success: results.success,
        failed: results.failed
      }
    });
  } catch (error) {
    console.error('Bulk assign meal plan error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}

/**
 * Update meal plan for a user
 * PUT /api/mealPlans/:userId
 */
export async function updateMealPlan(req, res) {
  try {
    const { userId } = req.params;
    const { mealPlan } = req.body;

    if (!mealPlan) {
      return res.status(400).json({ 
        success: false, 
        message: 'Meal plan data is required' 
      });
    }

    // Verify user exists and is assigned to this employee
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userData = userDoc.data();
    if (userData.assignedEmployeeId !== req.user.uid) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not assigned to this user' 
      });
    }

    // Verify meal plan exists
    if (!userData.mealPlan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Meal plan not found for this user' 
      });
    }

    // Update meal plan with new data
    const updatedMealPlan = {
      ...mealPlan,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Preserve createdAt if not provided
    if (!updatedMealPlan.createdAt) {
      updatedMealPlan.createdAt = userData.mealPlan.createdAt;
    }

    // Compute and store daily macros totals
    const macros = computeDailyMacros(updatedMealPlan);
    // Store in new dailyMacros format
    updatedMealPlan.dailyMacros = {
      proteins: macros.proteins,
      carbs: macros.carbs,
      fats: macros.fats,
      allZero: macros.allZero
    };
    // Keep old format for backward compatibility
    updatedMealPlan.dailyProteinG = macros.proteins;
    updatedMealPlan.dailyCarbsG = macros.carbs;
    updatedMealPlan.dailyFatsG = macros.fats;

    // Get employee name for notifications
    const employeeDoc = await db.collection('users').doc(req.user.uid).get();
    const employeeName = employeeDoc.data()?.displayName || 'Your Coach';

    // Update meal plan in Firestore
    await db.collection('users').doc(userId).update({
      mealPlan: updatedMealPlan
    });

    // Send notification to user about meal plan update
    await sendMealNotification(userId, 'UPDATE', employeeName);

    res.json({
      success: true,
      message: 'Meal plan updated successfully',
      data: {
        userId,
        mealPlan: updatedMealPlan
      }
    });
  } catch (error) {
    console.error('Update meal plan error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}

/**
 * Delete meal plan for a user
 * DELETE /api/mealPlans/:userId
 */
export async function deleteMealPlan(req, res) {
  try {
    const { userId } = req.params;

    // Verify user exists and is assigned to this employee
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userData = userDoc.data();
    if (userData.assignedEmployeeId !== req.user.uid) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not assigned to this user' 
      });
    }

    // Verify meal plan exists
    if (!userData.mealPlan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Meal plan not found for this user' 
      });
    }

    // Get employee name for notifications
    const employeeDoc = await db.collection('users').doc(req.user.uid).get();
    const employeeName = employeeDoc.data()?.displayName || 'Your Coach';

    // Remove meal plan from user document
    await db.collection('users').doc(userId).update({
      mealPlan: admin.firestore.FieldValue.delete()
    });

    // Send notification to user about meal plan deletion
    await sendMealNotification(userId, 'DELETE', employeeName);

    res.json({
      success: true,
      message: 'Meal plan deleted successfully'
    });
  } catch (error) {
    console.error('Delete meal plan error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}

/**
 * Assign meal plan to a user (legacy - kept for backward compatibility)
 */
export async function assignMealPlan(req, res) {
  try {
    const { userId } = req.params;
    const { 
      planName, 
      meals, 
      startDate, 
      endDate, 
      notes,
      goal,
      caloriesPerDay,
      macros,
      waterIntakeTarget,
      stepsTarget,
      allergies
    } = req.body;

    if (!planName || !meals) {
      return res.status(400).json({ 
        success: false, 
        message: 'Plan name and meals are required' 
      });
    }

    // Verify user exists and is assigned to this employee
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userData = userDoc.data();
    if (userData.assignedEmployeeId !== req.user.uid) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not assigned to this user' 
      });
    }

    // Prepare meal plan data
    const mealPlanData = {
      userId,
      assignedBy: req.user.uid,
      planName,
      meals,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      notes: notes || null,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Add optional enhanced fields if provided
    if (goal) mealPlanData.goal = goal;
    if (caloriesPerDay) mealPlanData.caloriesPerDay = parseFloat(caloriesPerDay);
    if (macros) {
      mealPlanData.macros = {
        protein: macros.protein ? parseFloat(macros.protein) : 0,
        carbs: macros.carbs ? parseFloat(macros.carbs) : 0,
        fats: macros.fats ? parseFloat(macros.fats) : 0
      };
    }
    if (waterIntakeTarget) mealPlanData.waterIntakeTarget = parseFloat(waterIntakeTarget);
    if (stepsTarget) mealPlanData.stepsTarget = parseInt(stepsTarget);
    if (allergies) mealPlanData.allergies = allergies;

    // Compute and store daily macros totals if meal plan has the new structure
    // Check if it has breakfasts/lunches/dinners structure (new format)
    if (meals && (meals.breakfasts || meals.lunches || meals.dinners || meals.breakfast || meals.lunch || meals.dinner)) {
      const computedMacros = computeDailyMacros(meals);
      // Store in new dailyMacros format
      mealPlanData.dailyMacros = {
        proteins: computedMacros.proteins,
        carbs: computedMacros.carbs,
        fats: computedMacros.fats,
        allZero: computedMacros.allZero
      };
      // Keep old format for backward compatibility
      mealPlanData.dailyProteinG = computedMacros.proteins;
      mealPlanData.dailyCarbsG = computedMacros.carbs;
      mealPlanData.dailyFatsG = computedMacros.fats;
    } else {
      // Legacy format - set defaults
      mealPlanData.dailyMacros = {
        proteins: 0,
        carbs: 0,
        fats: 0,
        allZero: true
      };
      mealPlanData.dailyProteinG = 0;
      mealPlanData.dailyCarbsG = 0;
      mealPlanData.dailyFatsG = 0;
    }

    // Create meal plan document
    const mealPlanRef = await db.collection('mealPlans').add(mealPlanData);

    const mealPlanDoc = await mealPlanRef.get();

    // Send notification to user about new meal plan
    await sendUserNotification(
      userId,
      'add',
      `A new meal plan "${planName}" has been assigned to you.`
    );

    res.status(201).json({
      success: true,
      message: 'Meal plan assigned successfully',
      data: {
        id: mealPlanRef.id,
        ...mealPlanDoc.data()
      }
    });
  } catch (error) {
    console.error('Assign meal plan error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}

/**
 * Get admin info (Employee only)
 * GET /employee/admin
 */
/**
 * Get all meal plan templates (Employee only)
 */
export async function getMealPlanTemplates(req, res) {
  try {
    const employeeId = req.user.uid;

    // Fetch all meal plan templates
    // Note: If orderBy fails due to missing index, we'll sort in JavaScript
    let templatesSnapshot;
    try {
      templatesSnapshot = await db.collection('mealPlanTemplates')
        .where('createdBy', '==', employeeId)
        .orderBy('createdAt', 'desc')
        .get();
    } catch (orderByError) {
      // If orderBy fails (likely missing index), fetch without orderBy and sort in JS
      console.warn('orderBy failed, fetching without orderBy:', orderByError.message);
      templatesSnapshot = await db.collection('mealPlanTemplates')
        .where('createdBy', '==', employeeId)
        .get();
    }

    const templates = [];
    templatesSnapshot.forEach(doc => {
      const data = doc.data();
      templates.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
      });
    });

    // Sort by createdAt in descending order (newest first) if orderBy failed
    templates.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : (a.createdAt?.toDate?.() || new Date(0));
      const dateB = b.createdAt instanceof Date ? b.createdAt : (b.createdAt?.toDate?.() || new Date(0));
      return dateB - dateA; // Descending order
    });

    res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching meal plan templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meal plan templates',
      error: error.message
    });
  }
}

/**
 * Create a new meal plan template (Employee only)
 */
export async function createMealPlanTemplate(req, res) {
  try {
    const employeeId = req.user.uid;
    const { name, mealPlanTemplate, mealPlanType } = req.body;

    if (!name || !mealPlanTemplate) {
      return res.status(400).json({
        success: false,
        message: 'Meal plan name and template are required'
      });
    }

    // Validate template structure (support both new array-based and old single-object formats)
    const hasOldFormat = mealPlanTemplate.breakfast || mealPlanTemplate.lunch || mealPlanTemplate.dinner;
    const hasNewFormat = mealPlanTemplate.breakfasts || mealPlanTemplate.lunches || mealPlanTemplate.dinners;
    
    if (!hasOldFormat && !hasNewFormat) {
      return res.status(400).json({
        success: false,
        message: 'Meal plan template must include breakfast, lunch, and dinner'
      });
    }

    // Create template document
    const templateData = {
      name,
      mealPlanTemplate,
      mealPlanType: mealPlanType || 'Maintain Weight', // Save mealPlanType
      createdBy: employeeId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('mealPlanTemplates').add(templateData);

    res.status(201).json({
      success: true,
      message: 'Meal plan template created successfully',
      data: {
        id: docRef.id,
        ...templateData
      }
    });
  } catch (error) {
    console.error('Error creating meal plan template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create meal plan template',
      error: error.message
    });
  }
}

/**
 * Update a meal plan template (Employee only)
 */
export async function updateMealPlanTemplate(req, res) {
  try {
    const employeeId = req.user.uid;
    const { templateId } = req.params;
    const { name, mealPlanTemplate } = req.body;

    if (!name || !mealPlanTemplate) {
      return res.status(400).json({
        success: false,
        message: 'Meal plan name and template are required'
      });
    }

    // Check if template exists and belongs to employee
    const templateDoc = await db.collection('mealPlanTemplates').doc(templateId).get();
    
    if (!templateDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan template not found'
      });
    }

    const templateData = templateDoc.data();
    if (templateData.createdBy !== employeeId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this template'
      });
    }

    // Update template
    await db.collection('mealPlanTemplates').doc(templateId).update({
      name,
      mealPlanTemplate,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({
      success: true,
      message: 'Meal plan template updated successfully'
    });
  } catch (error) {
    console.error('Error updating meal plan template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update meal plan template',
      error: error.message
    });
  }
}

/**
 * Delete a meal plan template (Employee only)
 */
export async function deleteMealPlanTemplate(req, res) {
  try {
    const employeeId = req.user.uid;
    const { templateId } = req.params;

    // Check if template exists and belongs to employee
    const templateDoc = await db.collection('mealPlanTemplates').doc(templateId).get();
    
    if (!templateDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan template not found'
      });
    }

    const templateData = templateDoc.data();
    if (templateData.createdBy !== employeeId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this template'
      });
    }

    // Delete template
    await db.collection('mealPlanTemplates').doc(templateId).delete();

    res.status(200).json({
      success: true,
      message: 'Meal plan template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting meal plan template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete meal plan template',
      error: error.message
    });
  }
}

/**
 * Get employee name by ID
 */
async function getEmployeeName(employeeId) {
  try {
    const employeeDoc = await db.collection('users').doc(employeeId).get();
    if (employeeDoc.exists) {
      return employeeDoc.data().displayName || 'Unknown Employee';
    }
    return 'Unknown Employee';
  } catch (error) {
    console.error('Error fetching employee name:', error);
    return 'Unknown Employee';
  }
}

export async function getAdminInfo(req, res) {
  try {
    // Find admin user
    const adminSnapshot = await db
      .collection('users')
      .where('role', '==', 'admin')
      .limit(1)
      .get();

    if (adminSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const adminDoc = adminSnapshot.docs[0];
    const adminData = adminDoc.data();

    res.json({
      success: true,
      data: {
        uid: adminDoc.id,
        displayName: adminData.displayName || 'Admin',
        email: adminData.email,
        role: adminData.role,
        photoURL: adminData.photoURL || null
      }
    });
  } catch (error) {
    console.error('Get admin info error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}

export async function assignWorkoutPlan(req, res) {
  try {
    const { userId } = req.params;
    const { planName, workouts, startDate, endDate, notes } = req.body;

    if (!planName || !workouts) {
      return res.status(400).json({ 
        success: false, 
        message: 'Plan name and workouts are required' 
      });
    }

    // Verify user exists and is assigned to this employee
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userData = userDoc.data();
    if (userData.assignedEmployeeId !== req.user.uid) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not assigned to this user' 
      });
    }

    // Create workout plan document
    const workoutPlanRef = await db.collection('workoutPlans').add({
      userId,
      assignedBy: req.user.uid,
      planName,
      workouts,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      notes: notes || null,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const workoutPlanDoc = await workoutPlanRef.get();

    res.status(201).json({
      success: true,
      message: 'Workout plan assigned successfully',
      data: {
        id: workoutPlanRef.id,
        ...workoutPlanDoc.data()
      }
    });
  } catch (error) {
    console.error('Assign workout plan error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

/**
 * Get user progress
 */
export async function getUserProgress(req, res) {
  try {
    const { userId } = req.params;

    // Verify user exists and is assigned to this employee
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userData = userDoc.data();
    if (userData.assignedEmployeeId !== req.user.uid) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not assigned to this user' 
      });
    }

    // Get progress entries
    const progressSnapshot = await db
      .collection('progress')
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .limit(30)
      .get();

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
    console.error('Get user progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

/**
 * Send user report via email
 * POST /api/employee/users/:userId/send-report
 */
export async function sendUserReportEmail(req, res) {
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
    
    // Verify user is assigned to this employee
    if (userData.assignedEmployeeId !== employeeId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this user'
      });
    }

    // Get user email - prioritize real email over login email
    // realEmail is the actual email entered by employee (e.g., user@gmail.com)
    // loginEmail is the generated FitFix email (e.g., john.doe@fitfix.com)
    // We want to send to the real email, not the login email
    const userEmail = userData.realEmail || userData.email;
    
    if (!userEmail) {
      // Only use loginEmail as last resort if no real email exists
      if (userData.loginEmail) {
        console.log(`⚠️ Warning: No real email found, using loginEmail as fallback: ${userData.loginEmail}`);
        return res.status(400).json({
          success: false,
          message: 'User real email not found. Please update user profile with a valid email address. Cannot send report to login email.'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'User email not found. Cannot send report without email address.'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return res.status(400).json({
        success: false,
        message: `Invalid email address format: ${userEmail}`
      });
    }

    console.log(`📊 Preparing user report for: ${userData.displayName || userEmail} (${userId})`);

    // Get progress entries
    // Note: Removed orderBy to avoid requiring Firestore composite index
    // We'll fetch all and sort in memory instead
    const progressSnapshot = await db
      .collection('progress')
      .where('userId', '==', userId)
      .get();

    const progress = [];
    progressSnapshot.forEach(doc => {
      const progressData = doc.data();
      progress.push({
        id: doc.id,
        ...progressData,
        date: progressData.date?.toDate?.() || progressData.date
      });
    });

    // Sort by date in descending order (newest first) in memory
    progress.sort((a, b) => {
      const dateA = a.date ? (a.date.toDate ? a.date.toDate().getTime() : new Date(a.date).getTime()) : 0;
      const dateB = b.date ? (b.date.toDate ? b.date.toDate().getTime() : new Date(b.date).getTime()) : 0;
      return dateB - dateA; // Descending order (newest first)
    });

    // Limit to 30 most recent entries
    const limitedProgress = progress.slice(0, 30);

    // Get workout plan
    let workoutPlan = null;
    try {
      const workoutPlanDoc = await db.collection('workoutPlans').doc(userId).get();
      if (workoutPlanDoc.exists) {
        workoutPlan = {
          id: workoutPlanDoc.id,
          ...workoutPlanDoc.data()
        };
      }
    } catch (error) {
      console.warn('Error fetching workout plan:', error);
    }

    // Get meal plan from user data
    const mealPlan = userData.mealPlan || null;

    // Use limited progress for calculations
    const progressForStats = limitedProgress;

    // Calculate progress statistics
    const totalDays = 30; // Assuming 30-day plan period
    const activeDays = progressForStats.filter(p => p.workoutCompleted || p.mealPlanFollowed).length;
    const skippedDays = Math.max(0, totalDays - activeDays);
    const completionPercentage = totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0;

    // Calculate calories compliance
    const mealPlanFollowedCount = progressForStats.filter(p => p.mealPlanFollowed === true).length;
    const caloriesCompliance = progressForStats.length > 0 
      ? Math.round((mealPlanFollowedCount / progressForStats.length) * 100)
      : 0;

    // Calculate workout compliance
    const workoutCompletedCount = progressForStats.filter(p => p.workoutCompleted === true).length;
    const workoutCompliance = progressForStats.length > 0
      ? Math.round((workoutCompletedCount / progressForStats.length) * 100)
      : 0;

    // Prepare report data
    const reportData = {
      user: {
        ...userData,
        createdAt: userData.createdAt?.toDate?.()?.toISOString() || userData.createdAt,
        updatedAt: userData.updatedAt?.toDate?.()?.toISOString() || userData.updatedAt
      },
      mealPlan: mealPlan ? {
        ...mealPlan,
        createdAt: mealPlan.createdAt?.toDate?.()?.toISOString() || mealPlan.createdAt
      } : null,
      workoutPlan,
      statistics: {
        completionPercentage,
        activeDays,
        skippedDays,
        caloriesCompliance,
        workoutCompliance,
        totalProgressEntries: progressForStats.length
      }
    };

    // Send email
    try {
      console.log(`📧 Sending report email to: ${userEmail}`);
      await sendUserReport(
        userEmail,
        userData.displayName || userData.email || 'User',
        reportData
      );

      console.log(`✅ Report email sent successfully to ${userEmail}`);
      res.json({
        success: true,
        message: `User report sent successfully to ${userEmail}`
      });
    } catch (emailError) {
      console.error('❌ Error sending email:', emailError);
      console.error('   Error details:', {
        message: emailError.message,
        code: emailError.code,
        response: emailError.response
      });
      
      // Provide more helpful error messages
      let errorMessage = 'Failed to send email';
      if (emailError.message.includes('EMAIL_USER') || emailError.message.includes('EMAIL_PASSWORD')) {
        errorMessage = 'Email service not configured. Please contact administrator.';
      } else if (emailError.message.includes('Invalid email')) {
        errorMessage = `Invalid email address: ${userEmail}`;
      } else if (emailError.code === 'EAUTH') {
        errorMessage = 'Email authentication failed. Please check email credentials.';
      } else if (emailError.code === 'ECONNECTION') {
        errorMessage = 'Could not connect to email server. Please try again later.';
      } else {
        errorMessage = `Failed to send email: ${emailError.message}`;
      }

      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  } catch (error) {
    console.error('Send user report email error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}


