// src/utils/mealPlanMacros.js
// Helper function to compute daily macros totals from meal plan structure

/**
 * Compute daily macros totals from meal plan
 * Formula: factor = grams / 100, then macro += item.macro * factor
 * Assumes macros (protein, carbs, fats) are per 100 grams
 * 
 * @param {Object} mealPlan - Meal plan object with breakfasts, lunches, dinners, snacks arrays
 * @returns {Object} { proteins, carbs, fats, allZero } stored in dailyMacros format
 */
export function computeDailyMacros(mealPlan) {
  if (!mealPlan) {
    return {
      proteins: 0,
      carbs: 0,
      fats: 0,
      allZero: true
    };
  }

  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;

  /**
   * Process a single item and add its macros to totals
   * Formula: factor = grams / 100, then macro += item.macro * factor
   */
  const processItem = (item) => {
    if (!item || typeof item !== 'object') return;

    const grams = parseFloat(item.grams) || 0;
    
    // Skip items with invalid grams
    if (grams <= 0) return;

    // Factor = grams / 100 (assumes macros are per 100g)
    const factor = grams / 100;

    // Get macros per 100g (default to 0 if missing)
    const proteinPer100g = parseFloat(item.protein) || 0;
    const carbsPer100g = parseFloat(item.carbs) || 0;
    const fatsPer100g = parseFloat(item.fats) || 0;

    // Apply formula: macro += item.macro * factor
    totalProtein += proteinPer100g * factor;
    totalCarbs += carbsPer100g * factor;
    totalFats += fatsPer100g * factor;
  };

  /**
   * Process all items in an array
   */
  const processItemsArray = (items) => {
    if (!Array.isArray(items)) return;
    items.forEach(item => processItem(item));
  };

  /**
   * Process a meal section (breakfast, lunch, dinner, snack)
   * Handles items in: items array, categories object, or direct category arrays
   */
  const processMealSection = (section) => {
    if (!section || typeof section !== 'object') return;

    // Priority 1: Process categories object (if exists)
    if (section.categories && typeof section.categories === 'object') {
      const categoryKeys = ['protein', 'carbs', 'fats', 'meat', 'chicken', 'fish'];
      categoryKeys.forEach(key => {
        if (section.categories[key] && Array.isArray(section.categories[key])) {
          processItemsArray(section.categories[key]);
        }
      });
      return; // Don't process other sources to avoid double-counting
    }

    // Priority 2: Process direct category arrays (protein, carbs, fats, etc.)
    const directCategoryKeys = ['protein', 'carbs', 'fats', 'meat', 'chicken', 'fish'];
    const hasDirectCategories = directCategoryKeys.some(
      key => section[key] && Array.isArray(section[key]) && section[key].length > 0
    );

    if (hasDirectCategories) {
      directCategoryKeys.forEach(key => {
        if (section[key] && Array.isArray(section[key])) {
          processItemsArray(section[key]);
        }
      });
      return; // Don't process items array to avoid double-counting
    }

    // Priority 3: Process items array (legacy format)
    if (section.items && Array.isArray(section.items)) {
      processItemsArray(section.items);
    }
  };

  // Process all meal types
  // For DAILY macros, only use the FIRST meal of each type
  // (Meal plans have 10 variations for rotation, but daily = one day's meals)

  // Process breakfasts - only first one for daily calculation
  if (mealPlan.breakfasts && Array.isArray(mealPlan.breakfasts) && mealPlan.breakfasts.length > 0) {
    processMealSection(mealPlan.breakfasts[0]);
  } else if (mealPlan.breakfast && typeof mealPlan.breakfast === 'object') {
    // Backward compatibility: single breakfast object
    processMealSection(mealPlan.breakfast);
  }

  // Process lunches - only first one for daily calculation
  if (mealPlan.lunches && Array.isArray(mealPlan.lunches) && mealPlan.lunches.length > 0) {
    processMealSection(mealPlan.lunches[0]);
  } else if (mealPlan.lunch && typeof mealPlan.lunch === 'object') {
    // Backward compatibility: single lunch object
    processMealSection(mealPlan.lunch);
  }

  // Process dinners - only first one for daily calculation
  if (mealPlan.dinners && Array.isArray(mealPlan.dinners) && mealPlan.dinners.length > 0) {
    processMealSection(mealPlan.dinners[0]);
  } else if (mealPlan.dinner && typeof mealPlan.dinner === 'object') {
    // Backward compatibility: single dinner object
    processMealSection(mealPlan.dinner);
  }

  // Process snacks - only first one for daily calculation (if snacks exist)
  if (mealPlan.snacks && Array.isArray(mealPlan.snacks) && mealPlan.snacks.length > 0) {
    processMealSection(mealPlan.snacks[0]);
  }

  // Round to 2 decimal places
  const proteins = Math.round(totalProtein * 100) / 100;
  const carbs = Math.round(totalCarbs * 100) / 100;
  const fats = Math.round(totalFats * 100) / 100;

  // Check if all values are zero
  const allZero = proteins === 0 && carbs === 0 && fats === 0;

  return {
    proteins,
    carbs,
    fats,
    allZero
  };
}
