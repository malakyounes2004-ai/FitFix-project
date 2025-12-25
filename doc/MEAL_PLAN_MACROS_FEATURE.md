# Meal Plan Daily Macros Calculation Feature

## Overview

Added automatic calculation and storage of daily macros totals (protein, carbs, fats) for meal plans. The totals are computed from meal plan items and stored as fields on the meal plan document.

## Changes Made

### 1. New Helper Function
**File**: `src/utils/mealPlanMacros.js`

- **Function**: `computeDailyMacros(mealPlan)`
- **Purpose**: Calculates daily totals for protein, carbs, and fats from meal plan structure
- **Returns**: `{ dailyProteinG, dailyCarbsG, dailyFatsG }`

**Features**:
- Supports both macros formats:
  - `protein/carbs/fats` (per baseGrams) - scales by `grams/baseGrams`
  - `proteinG/carbsG/fatsG` (absolute values) - uses directly
- Processes all meal types: `breakfasts`, `lunches`, `dinners`, `snacks`
- Handles items in both `items[]` arrays and `categories` objects
- Backward compatible with legacy single-object format (`breakfast`, `lunch`, `dinner`)
- Returns 0 for all macros if meal plan is null/undefined

### 2. Database Schema Changes
**Collection**: `users` (meal plan stored as `mealPlan` field)

**New Fields Added** (default: 0 if not calculated):
- `dailyProteinG` (number) - Total protein in grams per day
- `dailyCarbsG` (number) - Total carbs in grams per day  
- `dailyFatsG` (number) - Total fats in grams per day

### 3. Integration Points

**File**: `src/controllers/employeeController.js`

#### a) `bulkAssignMealPlan` function
- **Location**: After meal plan object creation, before saving to Firestore
- **Change**: Computes macros and adds fields to meal plan object
- **Lines**: ~643-646

```javascript
// Compute and store daily macros totals
const macros = computeDailyMacros(mealPlan);
mealPlan.dailyProteinG = macros.dailyProteinG;
mealPlan.dailyCarbsG = macros.dailyCarbsG;
mealPlan.dailyFatsG = macros.dailyFatsG;
```

#### b) `updateMealPlan` function
- **Location**: After updating meal plan object, before saving to Firestore
- **Change**: Recomputes macros and updates fields
- **Lines**: ~743-746

```javascript
// Compute and store daily macros totals
const macros = computeDailyMacros(updatedMealPlan);
updatedMealPlan.dailyProteinG = macros.dailyProteinG;
updatedMealPlan.dailyCarbsG = macros.dailyCarbsG;
updatedMealPlan.dailyFatsG = macros.dailyFatsG;
```

## API Response Changes

The new fields are **automatically included** in all existing endpoints that return meal plans because:
- Meal plans are returned using spread operators (`...mealPlan`)
- Fields are stored on the same document/object
- No field filtering is applied

**Affected Endpoints**:
- `GET /api/employee/users` - Returns users with mealPlan field
- `GET /api/employee/users/:userId/progress` - Returns user progress with mealPlan
- `PUT /api/mealPlans/:userId` - Returns updated mealPlan
- `POST /api/mealPlans/bulkAssign` - Returns success data
- Any endpoint that fetches user documents with mealPlan field

**Example Response**:
```json
{
  "success": true,
  "data": {
    "mealPlan": {
      "breakfasts": [...],
      "lunches": [...],
      "dinners": [...],
      "snacks": [...],
      "totalCalories": 2000,
      "dailyProteinG": 150.5,
      "dailyCarbsG": 200.3,
      "dailyFatsG": 65.2,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

## Backward Compatibility

✅ **Fully backward compatible**:
- Existing meal plans without macros fields will work normally
- If macros are missing on items, they're treated as 0 (no errors)
- Legacy meal plan formats (single breakfast/lunch/dinner) are supported
- No breaking changes to existing endpoints or response formats

## Calculation Logic

### Macros Scaling Formula

For items with `protein/carbs/fats` (per baseGrams):
```
scaledMacro = (macroPerBase * grams) / baseGrams
```

**Example**:
- Item: Chicken Breast
- `baseGrams`: 100g
- `grams`: 200g (actual amount)
- `protein`: 31g (per 100g)
- **Result**: `(31 * 200) / 100 = 62g protein`

For items with `proteinG/carbsG/fatsG` (absolute):
- Uses the value directly (no scaling)

### Processing Order

1. Process `breakfasts` array → sum macros
2. Process `lunches` array → sum macros
3. Process `dinners` array → sum macros
4. Process `snacks` array → sum macros
5. For each section:
   - Process `items[]` array
   - Process `categories` object (protein, carbs, fats, meat, chicken, fish)
6. Round to 2 decimal places

## Testing

**Test File**: `src/utils/testMealPlanMacros.js`

Run test:
```bash
node src/utils/testMealPlanMacros.js
```

**Test Cases**:
1. ✅ Normal meal plan with scaled macros
2. ✅ Meal plan with categories
3. ✅ Empty/null meal plan handling
4. ✅ Absolute macros format (proteinG/carbsG/fatsG)
5. ✅ Backward compatibility with legacy format

## Migration Notes

**For Existing Meal Plans**:
- Existing meal plans will have `dailyProteinG`, `dailyCarbsG`, `dailyFatsG` = 0 (or undefined)
- Macros will be calculated automatically on next update
- No manual migration needed - values computed on save

**For New Meal Plans**:
- Macros are calculated and stored automatically
- No changes needed to frontend/mobile app
- Fields are optional - if missing, defaults to 0

## Files Changed

1. ✅ `src/utils/mealPlanMacros.js` - **NEW FILE** (helper function)
2. ✅ `src/controllers/employeeController.js` - **MODIFIED** (integration)
3. ✅ `src/utils/testMealPlanMacros.js` - **NEW FILE** (test script)

## No Changes Required

- ❌ No changes to API endpoints
- ❌ No changes to request/response formats
- ❌ No changes to frontend code
- ❌ No changes to validation logic
- ❌ No changes to meal plan creation UI

## Usage Example

```javascript
// Meal plan item structure
{
  name: "Chicken Breast",
  baseGrams: 100,
  grams: 200,
  protein: 31,  // 31g per 100g
  carbs: 0,
  fats: 3.6
}

// After calculation, meal plan will have:
{
  dailyProteinG: 62.0,  // (31 * 200) / 100
  dailyCarbsG: 0.0,
  dailyFatsG: 7.2       // (3.6 * 200) / 100
}
```

---

**Implementation Date**: 2024-01-15
**Status**: ✅ Complete and tested
**Backward Compatible**: ✅ Yes

