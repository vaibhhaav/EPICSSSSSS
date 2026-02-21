// models/firebase.js
// Centralized Firebase Admin + Firestore initialization.
// This backend uses Firebase for:
// - Verifying Firebase ID tokens (admin authentication)
// - Persisting profile, session, and feedback documents in Firestore.
//
// IMPORTANT: You must provide service account credentials via environment
// variables for production usage. See README for details.

import admin from 'firebase-admin';

let app;

// Initialize Firebase Admin SDK only once (important for serverless / hot-reload)
if (!admin.apps.length) {
  const {
    FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY,
  } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    console.warn(
      'Firebase environment variables are not fully configured. ' +
        'Firestore and auth verification will not work until they are set.',
    );
  } else {
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        // Private key may contain \n sequences; replace them at runtime.
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }
}

// Firestore database reference
export const db = admin.apps.length ? admin.firestore() : null;

// Firebase auth reference (for ID token verification)
export const firebaseAuth = admin.apps.length ? admin.auth() : null;

export default app;

