// src/lib/firebase-admin.ts
import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// This file is for server-side code only.
// It initializes the Firebase Admin SDK.

if (!admin.apps.length) {
  try {
    // Check if environment variables for service account are set
    if (
      process.env.APP_FIREBASE_PROJECT_ID &&
      process.env.APP_FIREBASE_CLIENT_EMAIL &&
      process.env.APP_FIREBASE_PRIVATE_KEY
    ) {
      console.log('✅ Initializing Firebase Admin SDK with service account from environment variables...');
      const serviceAccount: ServiceAccount = {
        projectId: process.env.APP_FIREBASE_PROJECT_ID,
        clientEmail: process.env.APP_FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines with actual newlines for the private key
        privateKey: (process.env.APP_FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      };
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      // In a deployed Firebase environment (like Cloud Functions or App Engine),
      // the SDK can be automatically initialized with project's default credentials.
      console.log('✅ Initializing Firebase Admin SDK with default application credentials...');
      admin.initializeApp();
    }
    console.log('✅ Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('❌ Firebase Admin SDK initialization error:', error);
    // This will prevent the app from starting in a broken state if initialization fails.
    throw new Error('Failed to initialize Firebase Admin SDK. See server logs for details.');
  }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { adminDb, adminAuth };
