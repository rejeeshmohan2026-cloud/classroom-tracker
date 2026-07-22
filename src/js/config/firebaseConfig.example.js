/**
 * config/firebaseConfig.example.js
 *
 * Template for src/js/config/firebaseConfig.js — that file holds your
 * REAL Firebase project credentials and is gitignored (see .gitignore);
 * it is never committed, never regenerated, and never included in any
 * generated project archive. Treat it like a `.env` file.
 *
 * Setup:
 *   1. Copy this file to firebaseConfig.js (same folder).
 *   2. Go to https://console.firebase.google.com and create (or open) a project.
 *   3. Project Settings (gear icon) \u2192 General \u2192 "Your apps" \u2192 add a Web app.
 *   4. Copy the config object Firebase shows you into firebaseConfig.js,
 *      replacing the placeholders below.
 *   5. Authentication \u2192 Sign-in method \u2192 enable "Google".
 *   6. Authentication \u2192 Settings \u2192 Authorized domains \u2192 add whatever
 *      domain you're serving this app from (localhost is included by
 *      default for local testing).
 *   7. Firestore Database \u2192 Rules \u2192 paste firestore.rules \u2192 Publish.
 *
 * These values are not secret in the sense of needing encryption —
 * Firebase's client-side config is designed to be shipped in the
 * browser; real access control happens via Firestore Security Rules —
 * but they ARE specific to your project, and this codebase's convention
 * is to keep them out of version control and generated deliverables
 * regardless, the same way any other environment file would be handled.
 */

export const firebaseConfig = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
