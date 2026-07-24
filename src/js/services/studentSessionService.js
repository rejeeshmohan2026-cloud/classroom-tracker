/**
 * services/studentSessionService.js
 *
 * Remembers, per browser (via localStorage, not Firestore), which
 * classroom code a visitor entered on the Student Portal — so a first
 * visit asks for a Classroom ID, and later visits skip straight to
 * the dashboard.
 *
 * IMPORTANT — this is a client-only convenience, not real classroom
 * membership: entering a code here does not look anything up against
 * real Classroom Tracker data, does not create any Firestore record,
 * and does not authenticate anyone. See
 * services/studentPortalDataService.js's own doc comment for the full
 * reasoning — building a real lookup against actual classroom/student
 * data requires the same AI Working Committee review this project has
 * held real student data behind throughout. This module exists so the
 * *interaction pattern* (ask once, remember, allow switching later)
 * can be built and reviewed now, entirely separate from that decision.
 *
 * A separate, small module rather than reusing
 * storage/localStorageAdapter.js — that file's own doc comment states
 * "nothing new is ever written here" (it's a one-time migration
 * adapter); this is a genuinely different, ongoing use, so it gets its
 * own home instead of quietly overloading that one's stated contract.
 */

const STORAGE_KEY = 'bloomLabsStudentClassroomCode';

/** Returns the stored code, or null if this browser hasn't "joined" anything yet. */
export function getJoinedCode() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error('[studentSessionService] Failed to read joined code:', error);
    return null;
  }
}

/** Stores (or replaces) the code this browser has "joined" — see this file's own module comment on what this does and doesn't mean. */
export function setJoinedCode(code) {
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch (error) {
    console.error('[studentSessionService] Failed to save joined code:', error);
  }
}

/** Clears the stored code, returning to the first-visit "enter a Classroom ID" screen. */
export function clearJoinedCode() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[studentSessionService] Failed to clear joined code:', error);
  }
}
