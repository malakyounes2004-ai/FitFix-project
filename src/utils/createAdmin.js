// src/utils/createAdmin.js
// Utility script to create the first admin user
// Usage: node src/utils/createAdmin.js

import { auth, db } from '../firebase.js';
import admin from 'firebase-admin';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createAdmin() {
  try {
    console.log('🔐 FitFix Admin User Creation\n');
    console.log('This script will create the first admin user in your system.\n');

    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');
    const displayName = await question('Enter admin display name (optional, press Enter to skip): ') || email.split('@')[0];

    console.log('\n⏳ Creating admin user...\n');

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: false
    });

    console.log('✅ User created in Firebase Auth:', userRecord.uid);

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      displayName,
      role: 'admin',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      photoURL: null
    });

    console.log('✅ Admin profile created in Firestore');
    console.log('\n🎉 Admin user created successfully!\n');
    console.log('Details:');
    console.log('  Email:', email);
    console.log('  Display Name:', displayName);
    console.log('  Role: admin');
    console.log('  UID:', userRecord.uid);
    console.log('\nYou can now login with these credentials at: http://localhost:3000/api/auth/login\n');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    
    if (error.code === 'auth/email-already-exists') {
      console.error('\n⚠️  This email is already registered. Please use a different email or login with existing credentials.');
    }
    
    rl.close();
    process.exit(1);
  }
}

// Run the script
createAdmin();

