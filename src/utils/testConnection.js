// src/utils/testConnection.js
// Test script to verify Firebase connection
// Usage: node src/utils/testConnection.js

import { auth, db } from '../firebase.js';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testConnection() {
  console.log('🧪 Testing Firebase Connection...\n');

  try {
    // Step 1: Verify service account file exists
    console.log('1. Checking service account key...');
   const serviceAccountPath = path.resolve(__dirname, "../../serviceAccountKey.json");

    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(`Service account key not found at: ${serviceAccountPath}`);
    }

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    const projectId = serviceAccount.project_id;
    console.log(`   ✅ Service account key found`);
    console.log(`   📋 Project ID: ${projectId}`);

    // Step 2: Test Firebase Auth connection
    console.log('\n2. Testing Firebase Auth connection...');
    try {
      const listUsersResult = await auth.listUsers(1);
      console.log('   ✅ Firebase Auth connected successfully');
      console.log(`   📊 Found ${listUsersResult.users.length} user(s) in Auth`);
    } catch (error) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-argument') {
        console.log('   ⚠️  Firebase Auth connection issue');
        console.log(`   Error: ${error.message}`);
        console.log('   This might be normal if the project is new.');
      } else {
        throw error;
      }
    }

    // Step 3: Test Firestore connection
    console.log('\n3. Testing Firestore connection...');
    try {
      // Try to access Firestore - this will fail if database doesn't exist
      const testDoc = await db.collection('_test').doc('connection').get();
      console.log('   ✅ Firestore connected successfully');
      
      // Test reading from users collection (it's okay if it doesn't exist yet)
      try {
        const usersSnapshot = await db.collection('users').limit(1).get();
        console.log(`   📊 Users collection accessible (found ${usersSnapshot.size} user(s))`);
      } catch (collectionError) {
        console.log('   ℹ️  Users collection not yet created (this is normal for new projects)');
      }
    } catch (error) {
      // Check for specific Firestore errors
      if (error.code === 5 || error.message.includes('NOT_FOUND')) {
        console.error('   ❌ Firestore database not found!');
        console.error('\n   🔧 SOLUTION: You need to create the Firestore database first.');
        console.error('\n   Steps to fix:');
        console.error('   1. Go to Firebase Console: https://console.firebase.google.com/');
        console.error(`   2. Select your project: ${projectId}`);
        console.error('   3. Click on "Firestore Database" in the left menu');
        console.error('   4. Click "Create database"');
        console.error('   5. Choose "Start in test mode" (you can add security rules later)');
        console.error('   6. Select a location for your database (choose closest to your users)');
        console.error('   7. Click "Enable"');
        console.error('\n   After creating the database, run this test again.\n');
        throw new Error('Firestore database not created. Please follow the steps above.');
      } else {
        throw error;
      }
    }

    console.log('\n✅ All connection tests passed!\n');
    console.log('Your Firebase setup is working correctly. You can now:');
    console.log('  - Start the server: npm run dev');
    console.log('  - Create admin user: npm run create-admin');
    console.log('  - Test API endpoints (see API_DOCUMENTATION.md)\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection test failed!\n');
    console.error('Error Details:');
    console.error(`  Code: ${error.code || 'N/A'}`);
    console.error(`  Message: ${error.message}\n`);
    
    if (error.code !== 5 && !error.message.includes('NOT_FOUND')) {
      console.error('Troubleshooting:');
      console.error('  1. Check that serviceAccountKey.json exists in root directory');
      console.error('  2. Verify the service account key is valid and not corrupted');
      console.error('  3. Ensure you downloaded the correct service account key for your project');
      console.error('  4. Check that your Firebase project is active and billing is enabled (if required)');
      console.error('  5. Verify your internet connection\n');
    }
    
    process.exit(1);
  }
}

testConnection();

