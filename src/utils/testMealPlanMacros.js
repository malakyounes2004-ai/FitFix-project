// src/utils/testMealPlanMacros.js
// Quick test script to verify macros calculation
// Usage: node src/utils/testMealPlanMacros.js

import { computeDailyMacros } from './mealPlanMacros.js';

// Mock meal plan with test data
const mockMealPlan = {
  breakfasts: [
    {
      title: "Breakfast 1",
      items: [
        {
          name: "Oatmeal",
          baseGrams: 100,
          grams: 150,
          protein: 10,  // 10g protein per 100g
          carbs: 60,    // 60g carbs per 100g
          fats: 5       // 5g fats per 100g
        },
        {
          name: "Banana",
          baseGrams: 100,
          grams: 120,
          protein: 1,
          carbs: 23,
          fats: 0.3
        }
      ]
    }
  ],
  lunches: [
    {
      title: "Lunch 1",
      items: [
        {
          name: "Chicken Breast",
          baseGrams: 100,
          grams: 200,
          protein: 31,  // 31g protein per 100g
          carbs: 0,
          fats: 3.6
        },
        {
          name: "Rice",
          baseGrams: 100,
          grams: 150,
          protein: 2.7,
          carbs: 28,
          fats: 0.3
        }
      ],
      categories: {
        protein: [
          {
            name: "Egg",
            baseGrams: 50,
            grams: 50,
            protein: 6,
            carbs: 0.6,
            fats: 5
          }
        ]
      }
    }
  ],
  dinners: [
    {
      title: "Dinner 1",
      items: [
        {
          name: "Salmon",
          baseGrams: 100,
          grams: 150,
          protein: 25,
          carbs: 0,
          fats: 12
        }
      ]
    }
  ],
  snacks: []
};

// Test the calculation
console.log('🧪 Testing Meal Plan Macros Calculation\n');

const result = computeDailyMacros(mockMealPlan);

console.log('Input Meal Plan Structure:');
console.log('- Breakfast: 2 items (Oatmeal 150g, Banana 120g)');
console.log('- Lunch: 2 items + 1 category item (Chicken 200g, Rice 150g, Egg 50g)');
console.log('- Dinner: 1 item (Salmon 150g)');
console.log('- Snacks: 0 items\n');

console.log('Expected Calculations:');
console.log('Breakfast:');
console.log('  Oatmeal: protein = (10 * 150) / 100 = 15g, carbs = (60 * 150) / 100 = 90g, fats = (5 * 150) / 100 = 7.5g');
console.log('  Banana: protein = (1 * 120) / 100 = 1.2g, carbs = (23 * 120) / 100 = 27.6g, fats = (0.3 * 120) / 100 = 0.36g');
console.log('Lunch:');
console.log('  Chicken: protein = (31 * 200) / 100 = 62g, carbs = 0g, fats = (3.6 * 200) / 100 = 7.2g');
console.log('  Rice: protein = (2.7 * 150) / 100 = 4.05g, carbs = (28 * 150) / 100 = 42g, fats = (0.3 * 150) / 100 = 0.45g');
console.log('  Egg: protein = (6 * 50) / 50 = 6g, carbs = (0.6 * 50) / 50 = 0.6g, fats = (5 * 50) / 50 = 5g');
console.log('Dinner:');
console.log('  Salmon: protein = (25 * 150) / 100 = 37.5g, carbs = 0g, fats = (12 * 150) / 100 = 18g\n');

console.log('Computed Results:');
console.log(`  Daily Protein: ${result.dailyProteinG}g`);
console.log(`  Daily Carbs: ${result.dailyCarbsG}g`);
console.log(`  Daily Fats: ${result.dailyFatsG}g\n`);

// Manual calculation for verification
const expectedProtein = 15 + 1.2 + 62 + 4.05 + 6 + 37.5; // = 125.75g
const expectedCarbs = 90 + 27.6 + 0 + 42 + 0.6 + 0; // = 160.2g
const expectedFats = 7.5 + 0.36 + 7.2 + 0.45 + 5 + 18; // = 38.51g

console.log('Expected Totals:');
console.log(`  Daily Protein: ${expectedProtein}g`);
console.log(`  Daily Carbs: ${expectedCarbs}g`);
console.log(`  Daily Fats: ${expectedFats}g\n`);

// Verify results
const proteinMatch = Math.abs(result.dailyProteinG - expectedProtein) < 0.1;
const carbsMatch = Math.abs(result.dailyCarbsG - expectedCarbs) < 0.1;
const fatsMatch = Math.abs(result.dailyFatsG - expectedFats) < 0.1;

if (proteinMatch && carbsMatch && fatsMatch) {
  console.log('✅ Test PASSED: All macros calculated correctly!');
} else {
  console.log('❌ Test FAILED: Macros do not match expected values');
  if (!proteinMatch) console.log(`   Protein mismatch: got ${result.dailyProteinG}, expected ${expectedProtein}`);
  if (!carbsMatch) console.log(`   Carbs mismatch: got ${result.dailyCarbsG}, expected ${expectedCarbs}`);
  if (!fatsMatch) console.log(`   Fats mismatch: got ${result.dailyFatsG}, expected ${expectedFats}`);
}

// Test with empty/null meal plan
console.log('\n🧪 Testing with empty meal plan...');
const emptyResult = computeDailyMacros(null);
console.log(`Empty result: ${JSON.stringify(emptyResult)}`);
if (emptyResult.dailyProteinG === 0 && emptyResult.dailyCarbsG === 0 && emptyResult.dailyFatsG === 0) {
  console.log('✅ Empty meal plan handled correctly');
} else {
  console.log('❌ Empty meal plan test failed');
}

// Test with meal plan using proteinG/carbsG/fatsG format (absolute values)
console.log('\n🧪 Testing with absolute macros format (proteinG/carbsG/fatsG)...');
const absoluteMacrosPlan = {
  breakfasts: [
    {
      title: "Breakfast",
      items: [
        {
          name: "Protein Shake",
          grams: 250,
          proteinG: 25,  // Absolute value, not per baseGrams
          carbsG: 5,
          fatsG: 2
        }
      ]
    }
  ]
};

const absoluteResult = computeDailyMacros(absoluteMacrosPlan);
console.log(`Absolute macros result: ${JSON.stringify(absoluteResult)}`);
if (absoluteResult.dailyProteinG === 25 && absoluteResult.dailyCarbsG === 5 && absoluteResult.dailyFatsG === 2) {
  console.log('✅ Absolute macros format handled correctly');
} else {
  console.log('❌ Absolute macros format test failed');
}

console.log('\n✅ All tests completed!');

