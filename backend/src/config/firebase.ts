import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Check if already initialized to avoid errors in hot reload/tests
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle escaped newlines in private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin Initialized');
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

export default admin;
