// src/lib/firebase-admin.ts
import admin from 'firebase-admin';

// This file is for server-side code only.
// It initializes the Firebase Admin SDK.

if (!admin.apps.length) {
  try {
    // In a deployed Firebase environment (like Cloud Functions or App Engine),
    // the SDK is automatically initialized with the project's default credentials.
    // No explicit configuration is needed.
    admin.initializeApp();
    console.log('✅ Firebase Admin SDK initialized successfully in the server environment.');
  } catch (error: any) {
    console.error('❌ Firebase Admin SDK initialization error:', error);
    // This will prevent the app from starting in a broken state if initialization fails.
    throw new Error('Failed to initialize Firebase Admin SDK. See server logs for details.');
  }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { adminDb, adminAuth };
