# Update Meal Plan Macros Migration Script

## Overview

This script updates existing meal plan items in the database to include macro values (protein, carbs, fats) so that the daily macros calculation works correctly.

## Problem

Meal plan items in the database may only have `name` and `baseGrams` fields, but lack the macro values (`protein`, `carbs`, `fats`) needed for calculation. This causes the daily macros totals to return 0.

## Solution

The script:
1. Fetches all meal plans from:
   - `mealPlans` collection (legacy system)
   - `users` collection (mealPlan field - new system)
2. For each meal plan item, looks up macro values from a food database
3. Updates items with macro values if missing
4. Recalculates and updates daily macros totals (`dailyProteinG`, `dailyCarbsG`, `dailyFatsG`)

## Food Database

The script includes a built-in food database with common foods and their macros per 100g. You can expand this database by adding more foods to the `FOOD_DATABASE` object in `src/utils/updateMealPlanMacros.js`.

### Current Food Database Includes:
- **Proteins**: Chicken, beef, fish, eggs, dairy products, etc.
- **Carbs**: Rice, pasta, bread, potatoes, fruits, etc.
- **Fats**: Avocado, nuts, seeds, oils, etc.
- **Vegetables**: Common vegetables with low macros

## Usage

Run the migration script:

```bash
npm run update-meal-plan-macros
```

Or directly:

```bash
node src/utils/updateMealPlanMacros.js
```

## What It Does

1. **Scans meal plans**: Finds all meal plans in both collections
2. **Updates items**: Adds macro values to items that don't have them
3. **Recalculates totals**: Computes and updates daily macros totals
4. **Reports progress**: Shows which meal plans were updated and the calculated values

## Output Example

```
🔄 Starting meal plan macros update...

📦 Updating meal plans in mealPlans collection...
  ✅ Updated meal plan abc123 (Protein: 125.5g, Carbs: 200.3g, Fats: 65.2g)
  ✅ Updated meal plan def456 (Protein: 150.0g, Carbs: 180.0g, Fats: 70.0g)

👥 Updating meal plans in users collection...
  ✅ Updated meal plan for user xyz789 (Protein: 140.2g, Carbs: 190.5g, Fats: 68.3g)

✅ Update complete!
  - Updated: 3
  - Skipped (no changes): 0
  - Errors: 0
```

## Limitations

1. **Food Database**: The built-in food database is limited to common foods. Foods not in the database will have 0 macros (which is correct behavior - they just won't contribute to totals).

2. **Food Name Matching**: The script uses simple string matching to find foods. If a food name doesn't match exactly or partially, it won't find the macros.

3. **No External API**: Currently, the script uses a local food database. For production, you may want to integrate with a food API like:
   - Edamam Food Database API
   - USDA FoodData Central API
   - Spoonacular API

## Expanding the Food Database

To add more foods, edit `src/utils/updateMealPlanMacros.js` and add entries to the `FOOD_DATABASE` object:

```javascript
const FOOD_DATABASE = {
  // ... existing foods ...
  'new food name': { protein: 20, carbs: 15, fats: 5 },
  // Macros are per 100g
};
```

## Integration with Food API (Future Enhancement)

To integrate with an external food API, you can modify the `lookupFoodMacros` function to:
1. First check the local database
2. If not found, make an API call to the food database
3. Cache the result in the local database for future use

## Notes

- The script is **safe to run multiple times** - it won't overwrite existing macro values
- Items that already have macro values will be preserved
- The script updates the `updatedAt` timestamp for all modified meal plans
- Daily macros totals are recalculated even if items already had macros (to ensure accuracy)

## After Running

After running the script:
1. Meal plans will have macro values on their items
2. Daily macros totals will be calculated and stored
3. The mobile app will now show correct macro values instead of 0

