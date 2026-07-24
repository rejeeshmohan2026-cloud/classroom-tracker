/**
 * services/themePreferenceService.js
 *
 * Reads and writes a teacher's stored theme preference
 * ('light' | 'dark' | 'system') on their own users/{uid} document —
 * the same document Continue Working and the migration flag already
 * use. Deliberately separate from services/themeService.js: that file
 * only ever resolves+applies a preference to the page (pure, no I/O);
 * this file only ever persists one (I/O, no resolution logic) — the
 * same single-purpose split this project uses everywhere else
 * (Notebook Service vs. Student Progress Service, etc.).
 *
 * New users default to 'system' — per product decision, not because
 * Firestore ever stores that value for them. getPreferenceOnce()
 * returns 'system' whenever nothing has been explicitly saved yet
 * (including a brand-new account), so the caller never has to special-
 * case "no preference saved."
 */

import { firestoreClassroomRepository as repository } from '../repositories/firestoreClassroomRepository.js';

const DEFAULT_PREFERENCE = 'system';

export async function getPreferenceOnce(uid) {
  if (!uid) return DEFAULT_PREFERENCE;
  try {
    const stored = await repository.getThemePreferenceOnce(uid);
    return stored || DEFAULT_PREFERENCE;
  } catch (error) {
    console.error('[themePreferenceService] Failed to load theme preference:', error);
    return DEFAULT_PREFERENCE;
  }
}

/** Fire-and-forget, like every other save in this app — a failure here should never block the UI from reflecting the choice the teacher just made. */
export function setPreference(uid, theme) {
  if (!uid) return;
  repository.setThemePreference(uid, theme).catch((error) => {
    console.error('[themePreferenceService] Failed to save theme preference:', error);
  });
}
