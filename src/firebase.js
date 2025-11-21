// src/firebase.js
// Firebase Admin SDK initialization for production
import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get credentials from environment variables
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

// Process private key: handle newlines and quotes
if (privateKey) {
  // Remove surrounding quotes if present
  privateKey = privateKey.replace(/^["']|["']$/g, '');
  // Replace escaped newlines with actual newlines
  privateKey = privateKey.replace(/\\n/g, '\n');
  // Ensure it starts and ends correctly
  if (!privateKey.includes('BEGIN PRIVATE KEY') && !privateKey.includes('BEGIN RSA PRIVATE KEY')) {
    console.error('❌ Private key format error: Missing BEGIN marker');
    throw new Error('Invalid private key format: Must include BEGIN PRIVATE KEY or BEGIN RSA PRIVATE KEY');
  }
  if (!privateKey.includes('END PRIVATE KEY') && !privateKey.includes('END RSA PRIVATE KEY')) {
    console.error('❌ Private key format error: Missing END marker');
    throw new Error('Invalid private key format: Must include END PRIVATE KEY or END RSA PRIVATE KEY');
  }
}

// Validate all required credentials exist
const missingVars = [];
if (!projectId) missingVars.push('FIREBASE_PROJECT_ID');
if (!clientEmail) missingVars.push('FIREBASE_CLIENT_EMAIL');
if (!privateKey) missingVars.push('FIREBASE_PRIVATE_KEY');

if (missingVars.length > 0) {
  console.error('❌ Firebase Admin SDK initialization failed!');
  console.error(`   Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('   Please add these to your .env file.');
  throw new Error(`Missing Firebase credentials: ${missingVars.join(', ')}`);
}

// Initialize Firebase Admin SDK (only if not already initialized)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    
    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log(`   Project ID: ${projectId}`);
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization error:');
    console.error(`   ${error.message}`);
    throw error;
  }
} else {
  console.log('✅ Firebase Admin SDK already initialized');
}

// Export Firebase services
export const auth = admin.auth();
export const db = admin.firestore();
export default admin;
