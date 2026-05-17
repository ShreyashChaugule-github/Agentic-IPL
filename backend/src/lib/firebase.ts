// ============================================================
// captain-cool/backend/src/lib/firebase.ts
// Firebase Admin SDK initialization
// ============================================================

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config();

// Initialize Firebase Admin
// In Cloud Run, it will automatically use the service account if no credentials are provided.
// For local dev, you can set GOOGLE_APPLICATION_CREDENTIALS path.

try {
  if (admin.apps.length === 0) {
    if (process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      console.log(`🔥 Firebase Admin initialized for project: ${process.env.FIREBASE_PROJECT_ID}`);
    } else {
      // Fallback to default credentials (works in GCP environment)
      admin.initializeApp();
      console.log('🔥 Firebase Admin initialized with default credentials');
    }
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error);
}

export const db = admin.apps.length > 0 ? admin.firestore() : null;
export const auth = admin.apps.length > 0 ? admin.auth() : null;
