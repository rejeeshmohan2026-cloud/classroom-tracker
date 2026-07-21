/**
 * services/authService.js
 *
 * Isolates all Firebase Authentication logic behind a small API so no UI
 * component ever touches the Firebase SDK directly — main.js and views
 * only ever call initAuth(), onAuthStateChange(), signInWithGoogle(),
 * and signOutUser(). Google Sign-In only, for now. Session persistence
 * is explicit (browserLocalPersistence) so a signed-in teacher stays
 * signed in across browser restarts, not just page refreshes.
 *
 * This deliberately does NOT touch classroom data or localStorage at
 * all — see services/workspaceService.js, which is untouched by this
 * sprint. Authentication only identifies the teacher for now; wiring a
 * signed-in uid to Firestore-synced classrooms is a future sprint. The
 * shape here (a single init call, a single state-change subscription,
 * and a "safe profile" object) is meant to make that extension
 * straightforward without reworking this file's public API.
 *
 * IMPORTANT — data handling: Google Sign-In inherently returns the
 * signed-in user's email address as part of their Google profile —
 * there is no way to complete this kind of sign-in without Google
 * providing it. This app deliberately never reads, stores, logs, or
 * displays that email anywhere: toSafeProfile() below strips every
 * Firebase user down to only uid, displayName, and photoURL before it
 * is ever handed to the rest of the app. If a future sprint needs the
 * email itself (e.g. to key Firestore documents or manage
 * invitations), that is a new use of contact information and should be
 * escalated to the AI Working Committee first, per this organisation's
 * data-handling rules.
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { firebaseConfig } from '../config/firebaseConfig.js';

let app = null;
let auth = null;

/**
 * Initialises Firebase and sets session persistence to local storage
 * (survives closing the browser entirely, not just a page refresh).
 * Safe to call more than once — only the first call does anything.
 */
export function initAuth() {
  if (app) return;
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('[authService] Failed to set auth persistence:', error);
  });
}

/**
 * Registers a listener that fires immediately with the current
 * signed-in teacher (or null) and again every time sign-in or sign-out
 * happens — this is the "auth state listener" the UI reacts to, rather
 * than any view calling Firebase directly. Returns Firebase's own
 * unsubscribe function.
 */
export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, (firebaseUser) => {
    callback(firebaseUser ? toSafeProfile(firebaseUser) : null);
  });
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  return toSafeProfile(credential.user);
}

export async function signOutUser() {
  await signOut(auth);
}

export function getCurrentUser() {
  return auth?.currentUser ? toSafeProfile(auth.currentUser) : null;
}

/**
 * Strips a Firebase user down to only what this app is allowed to use —
 * see the module doc comment above for why email is excluded.
 */
function toSafeProfile(firebaseUser) {
  return {
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName || 'Teacher',
    photoURL: firebaseUser.photoURL || null,
  };
}
