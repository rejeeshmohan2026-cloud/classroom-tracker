/**
 * services/accentColorPreferenceService.js
 *
 * Reads and writes a teacher's stored accent-color preference on their
 * own users/{uid} document — the same document Continue Working and
 * the (now-retired) theme preference already used. Deliberately
 * separate from services/accentColorService.js: that file only ever
 * resolves+applies a color to the page (pure, no I/O); this file only
 * ever persists one (I/O, no application logic) — the same
 * single-purpose split used everywhere else in this app.
 *
 * New users default to 'classic' (the original flat blue) — a product
 * decision, not something Firestore ever stores for them.
 * getPreferenceOnce() returns 'classic' whenever nothing has been
 * explicitly saved yet, so the caller never has to special-case "no
 * preference saved."
 */

import { firestoreClassroomRepository as repository } from '../repositories/firestoreClassroomRepository.js';
import { DEFAULT_ACCENT_COLOR_ID } from '../config/accentColorConfig.js';

export async function getPreferenceOnce(uid) {
  if (!uid) return DEFAULT_ACCENT_COLOR_ID;
  try {
    const stored = await repository.getAccentColorPreferenceOnce(uid);
    return stored || DEFAULT_ACCENT_COLOR_ID;
  } catch (error) {
    console.error('[accentColorPreferenceService] Failed to load accent color preference:', error);
    return DEFAULT_ACCENT_COLOR_ID;
  }
}

/** Fire-and-forget, like every other save in this app — a failure here should never block the UI from reflecting the choice the teacher just made. */
export function setPreference(uid, colorId) {
  if (!uid) return;
  repository.setAccentColorPreference(uid, colorId).catch((error) => {
    console.error('[accentColorPreferenceService] Failed to save accent color preference:', error);
  });
}
