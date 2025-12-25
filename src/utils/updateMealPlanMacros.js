// src/utils/updateMealPlanMacros.js
// Migration script to update existing meal plan items with macro values
// Usage: node src/utils/updateMealPlanMacros.js

import { db } from '../firebase.js';
import admin from 'firebase-admin';
import { computeDailyMacros } from './mealPlanMacros.js';

// Simple food database with common foods and their macros per 100g
// This is a basic lookup table - you can expand this or integrate with a food API
const FOOD_DATABASE = {
  // Proteins
  'chicken breast': { protein: 31, carbs: 0, fats: 3.6 },
  'chicken': { protein: 31, carbs: 0, fats: 3.6 },
  'chicken thigh': { protein: 26, carbs: 0, fats: 10 },
  'turkey breast': { protein: 30, carbs: 0, fats: 1 },
  'beef': { protein: 26, carbs: 0, fats: 15 },
  'ground beef': { protein: 26, carbs: 0, fats: 20 },
  'pork': { protein: 27, carbs: 0, fats: 14 },
  'salmon': { protein: 25, carbs: 0, fats: 12 },
  'tuna': { protein: 30, carbs: 0, fats: 1 },
  'cod': { protein: 18, carbs: 0, fats: 0.7 },
  'tilapia': { protein: 26, carbs: 0, fats: 1.7 },
  'shrimp': { protein: 24, carbs: 0, fats: 0.3 },
  'eggs': { protein: 13, carbs: 1.1, fats: 11 },
  'egg': { protein: 13, carbs: 1.1, fats: 11 },
  'egg white': { protein: 11, carbs: 0.7, fats: 0.2 },
  'greek yogurt': { protein: 10, carbs: 3.6, fats: 0.4 },
  'cottage cheese': { protein: 11, carbs: 3.4, fats: 1 },
  'protein powder': { protein: 80, carbs: 5, fats: 2 },
  'whey protein': { protein: 80, carbs: 5, fats: 2 },
  
  // Carbs
  'rice': { protein: 2.7, carbs: 28, fats: 0.3 },
  'brown rice': { protein: 2.6, carbs: 23, fats: 0.9 },
  'white rice': { protein: 2.7, carbs: 28, fats: 0.3 },
  'quinoa': { protein: 4.4, carbs: 22, fats: 1.9 },
  'oats': { protein: 17, carbs: 66, fats: 7 },
  'oatmeal': { protein: 17, carbs: 66, fats: 7 },
  'pasta': { protein: 5, carbs: 25, fats: 1.1 },
  'bread': { protein: 9, carbs: 49, fats: 3.2 },
  'whole wheat bread': { protein: 13, carbs: 41, fats: 4.2 },
  'potato': { protein: 2, carbs: 17, fats: 0.1 },
  'sweet potato': { protein: 1.6, carbs: 20, fats: 0.1 },
  'banana': { protein: 1, carbs: 23, fats: 0.3 },
  'apple': { protein: 0.3, carbs: 14, fats: 0.2 },
  'orange': { protein: 0.9, carbs: 12, fats: 0.1 },
  
  // Fats
  'avocado': { protein: 2, carbs: 9, fats: 15 },
  'olive oil': { protein: 0, carbs: 0, fats: 100 },
  'coconut oil': { protein: 0, carbs: 0, fats: 100 },
  'almonds': { protein: 21, carbs: 22, fats: 50 },
  'peanut butter': { protein: 25, carbs: 20, fats: 50 },
  'walnuts': { protein: 15, carbs: 14, fats: 65 },
  'chia seeds': { protein: 17, carbs: 42, fats: 31 },
  'flax seeds': { protein: 18, carbs: 28, fats: 42 },
  
  // Vegetables (low macros)
  'broccoli': { protein: 2.8, carbs: 7, fats: 0.4 },
  'spinach': { protein: 2.9, carbs: 3.6, fats: 0.4 },
  'lettuce': { protein: 1.4, carbs: 2.9, fats: 0.2 },
  'cucumber': { protein: 0.7, carbs: 4, fats: 0.1 },
  'tomato': { protein: 0.9, carbs: 4, fats: 0.2 },
  'carrot': { protein: 0.9, carbs: 10, fats: 0.2 },
  'bell pepper': { protein: 1, carbs: 5, fats: 0.3 },
  'onion': { protein: 1.1, carbs: 9, fats: 0.1 },
  
  // Dairy
  'milk': { protein: 3.4, carbs: 5, fats: 1 },
  'cheese': { protein: 25, carbs: 1, fats: 33 },
  'mozzarella': { protein: 22, carbs: 2, fats: 22 },
  'cheddar': { protein: 25, carbs: 1, fats: 33 },
};

/**
 * Look up macro values for a food item by name
 * @param {string} foodName - Name of the food item
 * @returns {Object|null} - { protein, carbs, fats } per 100g or null if not found
 */
function lookupFoodMacros(foodName) {
  if (!foodName || typeof foodName !== 'string') return null;
  
  const normalizedName = foodName.toLowerCase().trim();
  
  // Direct lookup
  if (FOOD_DATABASE[normalizedName]) {
    return FOOD_DATABASE[normalizedName];
  }
  
  // Partial match lookup
  for (const [key, macros] of Object.entries(FOOD_DATABASE)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return macros;
    }
  }
  
  return null;
}

/**
 * Update a single meal plan item with macro values if missing
 * @param {Object} item - Meal plan item
 * @returns {Object} - Updated item with macro values
 */
function updateItemMacros(item) {
  if (!item || typeof item !== 'object') return item;
  
  // If item already has macro values, return as is
  if ((item.protein !== undefined && typeof item.protein === 'number') ||
      (item.proteinG !== undefined && typeof item.proteinG === 'number')) {
    return item;
  }
  
  // Try to get macro values from food database
  const foodName = item.name || item.title || '';
  const macros = lookupFoodMacros(foodName);
  
  if (macros) {
    // Add macro values per baseGrams
    return {
      ...item,
      protein: macros.protein,
      carbs: macros.carbs,
      fats: macros.fats
    };
  }
  
  // If not found, return item as is (will be 0 in calculation)
  return item;
}

/**
 * Update meal plan items with macro values
 * @param {Object} mealPlan - Meal plan object
 * @returns {Object} - Updated meal plan
 */
function updateMealPlanItems(mealPlan) {
  if (!mealPlan) return mealPlan;
  
  const updated = { ...mealPlan };
  
  // Helper to update items in an array
  const updateItemsArray = (items) => {
    if (!Array.isArray(items)) return items;
    return items.map(updateItemMacros);
  };
  
  // Helper to update categories
  const updateCategories = (categories) => {
    if (!categories || typeof categories !== 'object') return categories;
    const updated = { ...categories };
    Object.keys(updated).forEach(key => {
      if (Array.isArray(updated[key])) {
        updated[key] = updateItemsArray(updated[key]);
      }
    });
    return updated;
  };
  
  // Helper to update meal sections
  const updateMealSections = (sections) => {
    if (!Array.isArray(sections)) return sections;
    return sections.map(section => {
      if (!section || typeof section !== 'object') return section;
      
      const updated = { ...section };
      
      // Update items array
      if (updated.items) {
        updated.items = updateItemsArray(updated.items);
      }
      
      // Update categories
      if (updated.categories) {
        updated.categories = updateCategories(updated.categories);
      }
      
      // Update direct category arrays (protein, carbs, fats, etc.)
      const categoryKeys = ['protein', 'carbs', 'fats', 'meat', 'chicken', 'fish'];
      categoryKeys.forEach(key => {
        if (updated[key] && Array.isArray(updated[key])) {
          updated[key] = updateItemsArray(updated[key]);
        }
      });
      
      return updated;
    });
  };
  
  // Update all meal types
  if (updated.breakfasts) {
    updated.breakfasts = updateMealSections(updated.breakfasts);
  }
  if (updated.breakfast) {
    if (updated.breakfast.items) {
      updated.breakfast.items = updateItemsArray(updated.breakfast.items);
    }
    if (updated.breakfast.categories) {
      updated.breakfast.categories = updateCategories(updated.breakfast.categories);
    }
  }
  
  if (updated.lunches) {
    updated.lunches = updateMealSections(updated.lunches);
  }
  if (updated.lunch) {
    if (updated.lunch.items) {
      updated.lunch.items = updateItemsArray(updated.lunch.items);
    }
    if (updated.lunch.categories) {
      updated.lunch.categories = updateCategories(updated.lunch.categories);
    }
  }
  
  if (updated.dinners) {
    updated.dinners = updateMealSections(updated.dinners);
  }
  if (updated.dinner) {
    if (updated.dinner.items) {
      updated.dinner.items = updateItemsArray(updated.dinner.items);
    }
    if (updated.dinner.categories) {
      updated.dinner.categories = updateCategories(updated.dinner.categories);
    }
  }
  
  if (updated.snacks) {
    updated.snacks = updateMealSections(updated.snacks);
  }
  
  return updated;
}

/**
 * Update all meal plans in the database
 */
export async function updateAllMealPlans() {
  console.log('🔄 Starting meal plan macros update...\n');
  
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  try {
    // 1. Update meal plans in mealPlans collection
    console.log('📦 Updating meal plans in mealPlans collection...');
    const mealPlansSnapshot = await db.collection('mealPlans').get();
    
    for (const doc of mealPlansSnapshot.docs) {
      try {
        const data = doc.data();
        const updatedMealPlan = updateMealPlanItems(data);
        
        // Recalculate macros
        const macros = computeDailyMacros(updatedMealPlan);
        updatedMealPlan.dailyProteinG = macros.dailyProteinG;
        updatedMealPlan.dailyCarbsG = macros.dailyCarbsG;
        updatedMealPlan.dailyFatsG = macros.dailyFatsG;
        updatedMealPlan.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        
        // Always update to ensure macros are calculated (even if items already had macros)
        await doc.ref.update(updatedMealPlan);
        updatedCount++;
        console.log(`  ✅ Updated meal plan ${doc.id} (Protein: ${macros.dailyProteinG}g, Carbs: ${macros.dailyCarbsG}g, Fats: ${macros.dailyFatsG}g)`);
      } catch (error) {
        errorCount++;
        console.error(`  ❌ Error updating meal plan ${doc.id}:`, error.message);
      }
    }
    
    // 2. Update meal plans in users collection (mealPlan field)
    console.log('\n👥 Updating meal plans in users collection...');
    const usersSnapshot = await db.collection('users').get();
    
    for (const doc of usersSnapshot.docs) {
      try {
        const userData = doc.data();
        if (!userData.mealPlan) {
          continue;
        }
        
        const updatedMealPlan = updateMealPlanItems(userData.mealPlan);
        
        // Recalculate macros
        const macros = computeDailyMacros(updatedMealPlan);
        updatedMealPlan.dailyProteinG = macros.dailyProteinG;
        updatedMealPlan.dailyCarbsG = macros.dailyCarbsG;
        updatedMealPlan.dailyFatsG = macros.dailyFatsG;
        updatedMealPlan.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        
        // Always update to ensure macros are calculated
        await doc.ref.update({ mealPlan: updatedMealPlan });
        updatedCount++;
        console.log(`  ✅ Updated meal plan for user ${doc.id} (Protein: ${macros.dailyProteinG}g, Carbs: ${macros.dailyCarbsG}g, Fats: ${macros.dailyFatsG}g)`);
      } catch (error) {
        errorCount++;
        console.error(`  ❌ Error updating meal plan for user ${doc.id}:`, error.message);
      }
    }
    
    console.log('\n✅ Update complete!');
    console.log(`  - Updated: ${updatedCount}`);
    console.log(`  - Skipped (no changes): ${skippedCount}`);
    console.log(`  - Errors: ${errorCount}`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  }
}

// Run if called directly (check if this file is being run as a script)
const isMainModule = process.argv[1] && process.argv[1].endsWith('updateMealPlanMacros.js');

if (isMainModule) {
  updateAllMealPlans()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

